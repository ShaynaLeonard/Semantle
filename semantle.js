// Import the functions you need from the SDKs you need
const { initializeApp } = require("firebase/app");
const { getFirestore, collection, addDoc, updateDoc, doc, getDoc, where, getDocs, query, setDoc, deleteDoc, orderBy, Query, onSnapshot } = require("firebase/firestore");
apiKey = "API_KEY"
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require('path');
const { Configuration, OpenAIApi } = require("openai");
// Import the node-schedule library
const schedule = require('node-schedule');
//caculating distance 
// const natural = require('natural');
// const WordNet = natural.WordNet;
// const WordPOS = require('wordpos');
// const wordpos = new WordPOS();
const port = 3000;

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCb8YEyDKC_QzC2CYEyiCTeYde_aQ0C9-Q",
  authDomain: "semantle-6f813.firebaseapp.com",
  projectId: "semantle-6f813",
  storageBucket: "semantle-6f813.appspot.com",
  messagingSenderId: "648752625083",
  appId: "1:648752625083:web:377c7d8ed3c6911039c09e",
  measurementId: "G-MTVXKV5E07"
};

// Initialize Firebase
const appFirebase = initializeApp(firebaseConfig);
const db = getFirestore(appFirebase);
const usersCollection = collection(db, "Users"); // Replace 'users' with the name of your collection
const app = express();
const fetch = require("node-fetch");
const { exec } = require('child_process');
// const pythonScript = 'myScript.py';
const { spawn } = require('child_process');
// Serve static files (CSS, images, etc.) from the 'public' directory
app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));
// Determine the platform-specific command to open the default web browser
const openCommand = process.platform === 'win32' ? 'start' : process.platform === 'darwin' ? 'open' : 'xdg-open';
app.use('/images', express.static(path.join(__dirname, 'images')));
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
const axios = require('axios');
const configuration = new Configuration({
  apiKey: apiKey,
});
const openai = new OpenAIApi(configuration);
app.use(express.static('Semental'));
app.use(bodyParser.json());
app.use(cors());

// Middleware to parse JSON request bodies
app.use(express.json());

//generating random word using api 
async function getRandomWord() {
  try {
    const response = await axios.get('https://random-word-api.herokuapp.com/word');
    const randomWord = response.data[0];
    return randomWord;
  } catch (error) {
    console.error('Error fetching random word:', error);
    return null;
  }
}

async function updateFirestoreWithRandomWord() {
  try {
    const randomWord = await getRandomWord();
    const collectionRefN = collection(db, "RandomWords");
    const documentWord = doc(collectionRefN, 'Word');
    const documentOldWord = doc(collectionRefN, 'OldWord');
    // Get the current word from documentWord
    const docSnapshot = await getDoc(documentWord);
    if (docSnapshot.exists()) {
      const dataWord = docSnapshot.data();
      const currentWord = dataWord.name;
      // Increment the serial number
      const currentSerial = dataWord.serial || 0;
      const updatedSerial = currentSerial + 1;
      // Update documentOldWord with the current word
      await updateDoc(documentOldWord, {
        name: currentWord, // Update the 'OldWord' field with the current word
        serial: updatedSerial,
      });
      // Update documentWord with the new random word
      await updateDoc(documentWord, {
        name: randomWord, // Update the 'randomWord' field with the new value
        serial: updatedSerial,
      });
      console.log('OldWordDocument updated successfully');
    } else {
      console.log("Document not found");
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

//Function to erase all users' guesses tables
async function eraseAllUserGuesses() {
  try {
    // Get all user documents
    const userDocsQuery = query(usersCollection);
    const userDocsSnapshot = await getDocs(userDocsQuery);
    // Iterate through each user document
    userDocsSnapshot.forEach(async (userDoc) => {
      const userDocRef = doc(usersCollection, userDoc.id);
      // Delete the "guess table" subcollection within the user's document
      const guessTableCollectionRef = collection(userDocRef, "guess table");
      await deleteCollection(guessTableCollectionRef, /* batchSize */ 10);
    });
    console.log("All user guesses tables erased.");
  } catch (error) {
    console.error("Error erasing user guesses tables:", error);
  }
}

// Function to delete a Firestore subcollection and its documents
async function deleteCollection(collectionRef, batchSize) {
  const query = await getDocs(collectionRef);
  query.forEach(async (doc) => {
    await deleteDoc(doc.ref);
  });
  // Recursively delete documents in batches
  if (query.size > batchSize) {
    return deleteCollection(collectionRef, batchSize);
  }
}

// Function to reset CountGuessesForToday to 0 for all users
async function resetCountGuessesForToday() {
  try {
    // Get all user documents
    const userDocsQuery = query(usersCollection);
    const userDocsSnapshot = await getDocs(userDocsQuery);
    // Iterate through each user document
    userDocsSnapshot.forEach(async (userDoc) => {
      const userDocRef = doc(usersCollection, userDoc.id);
      // Update the CountGuessesForToday field to 0
      await setDoc(userDocRef, { CountGuessesForToday: 0, wonToday: 0 }, { merge: true });
      console.log(`CountGuessesForToday reset for user: ${userDoc.id}`);
    });
    console.log("CountGuessesForToday reset for all users.");
  } catch (error) {
    console.error("Error resetting CountGuessesForToday:", error);
  }
}

// Schedule the function to run every day at midnight
const job = schedule.scheduleJob('0 0 * * *', function () {
  updateFirestoreWithRandomWord();
  eraseAllUserGuesses();
  resetCountGuessesForToday();
});

//entrypoint to check if a string is a word 
app.post("/checkWord", async (req, res) => {
  const { word } = req.body;
  try {
    const apiUrl = `https://api.datamuse.com/words?sp=${word}&max=1`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    const isValid = data.length > 0;
    res.json({ isValid });
  } catch (error) {
    console.error("Error checking word:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Endpoint for user registration
app.post("/register", async (req, res) => {
  const { newUsername, newPassword } = req.body;
  // Check if the newUsername and newPassword are provided
  if (!newUsername || !newPassword) {
    return res.status(400).json({ error: "Username and password are required." });
  }
  // Reference to the user document with the desired ID (username)
  const userDocRef = doc(usersCollection, newUsername);
  // Check if the user document already exists
  const userDocSnapshot = await getDoc(userDocRef);
  if (userDocSnapshot.exists()) {
    // A user with the same username already exists
    return res.status(400).json({ error: "Username already exists" });
  }
  // Create a nested "guess table" subcollection within the user document
  const guessTableCollectionRef = collection(userDocRef, "guess table");
  // Save the new user data to your database with the desired document ID (username)
  const userData = {
    username: newUsername,
    password: newPassword,
    Record: 0, // Initialize Record with value 0
    Victory: 0, // Initialize Victory with value 0
    CountGuessesForToday: 0, // Initialize CountGuessesForToday with value 0
    font: "'Courier New', Courier, monospace",
    backgroundcolor: "pink",
    animation: "victory",
    wonToday: 0,
  };
  await setDoc(userDocRef, userData);
  // Create the initial "guess table" document within the subcollection
  const initialGuessData = {
    number: 0,
    string: "Initial guess",
  };
  await addDoc(guessTableCollectionRef, initialGuessData);
  // Return a success response
  res.status(200).json({ message: "Registration successful!" });
});

// Modify your server-side code to handle login requests
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  // Check if the username and password are provided
  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Username and password are required." });
  }
  // Query the Firebase collection to check if a user with the provided combination exists
  const querySnapshot = await getDocs(
    query(usersCollection, where("username", "==", username), where("password", "==", password))
  );
  if (!querySnapshot.empty) {
    // If a matching user is found, send a success response
    return res.status(200).json({ success: true, message: "Login successful." });
  }
  // If no matching user is found, send an error response
  return res.status(401).json({ success: false, message: "Invalid username or password." });
});

// Add an API endpoint to retrieve yesterday's word
app.get("/yesterdaysWord", async (req, res) => {
  try {
    const collectionRefN = collection(db, "RandomWords");
    const documentOldWord = doc(collectionRefN, 'OldWord');
    const docSnapshot = await getDoc(documentOldWord);
    if (docSnapshot.exists()) {
      const oldWord = docSnapshot.data();
      res.json({ yesterdaysWord: oldWord });
    } else {
      res.status(404).json({ error: "Yesterday's word not found" });
    }
  } catch (error) {
    console.error("Error retrieving yesterday's word:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//Add an API endpoint to retrieve yesterday's word
app.get("/closeWords", async (req, res) => {
  try {
    onSnapshot(query(usersCollection, orderBy("guess table.proximity", "desc")), (snapshot) => {
      console.log(snapshot.docs[0])
      const nearest = snapshot.docs[0].guesses[0].proximity;
      const tenthNearest = snapshot.docs[9].data().guesses[0].similarity;
      const thousandthNearest = snapshot.docs[999].data().guesses[0].similarity;
      const result = `The nearest word has a similarity of ${nearest.toFixed(2)}, the tenth-nearest has a similarity of ${tenthNearest.toFixed(2)}, and the one thousandth nearest word has a similarity of ${thousandthNearest.toFixed(2)}.`;
      res.json({ result: result });
    });
  }
  catch (error) {
    res.status(500).json({ error: "Internal server error" });
    throw error;
  }
});

// Define a route to fetch user preferences
app.get('/preferences/:username', async (req, res) => {
  try {
    const username = req.params.username;
    const userDocRef = doc(usersCollection, username);
    const userDocSnapshot = await getDoc(userDocRef);
    if (userDocSnapshot.exists()) {
      const userData = userDocSnapshot.data();
      res.json({
        font: userData.font,
        backgroundColor: userData.backgroundcolor,
        animation: userData.animation,
        wonToday: userData.wonToday,
      });
    } else {
      // User not found
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/getRandomWord", async (req, res) => {
  try {
    const collectionRefN = collection(db, "RandomWords");
    const documentOldWord = doc(collectionRefN, 'Word');
    const docSnapshot = await getDoc(documentOldWord);
    if (docSnapshot.exists()) {
      const Word = docSnapshot.data();
      res.json({ randomWord: Word });
    } else {
      res.status(404).json({ error: "Random word not found" });
    }
  } catch (error) {
    console.error("Error retrieving Random word:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Add an API endpoint to fetch user data by username
app.get("/userData/:username", async (req, res) => {
  const username = req.params.username;
  try {
    // Get the reference to the user's document
    const userDocRef = doc(usersCollection, username);
    // Retrieve the user's data from Firestore
    const userDocSnapshot = await getDoc(userDocRef);
    if (userDocSnapshot.exists()) {
      const userData = userDocSnapshot.data();
      res.status(200).json(userData);
    } else {
      // User not found
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/submitGuess", async (req, res) => {
  const { guessInput, username, rowNumber, semantic, howClose } = req.body;
  try {
    // Get references to Firestore collections
    const userDocRef = doc(usersCollection, username);
    const guessTableCollectionRef = collection(userDocRef, "guess table");
    // Check if the word already exists in the user's "guess table"
    const wordQuery = query(guessTableCollectionRef, where("string", "==", guessInput));
    const wordQuerySnapshot = await getDocs(wordQuery);
    if (!wordQuerySnapshot.empty) {
      // Word already exists in the user's "guess table"
      return res.status(400).json({ error: "Word already guessed by the user." });
    }
    // Create a new document in the "guess table" subcollection with the guess data
    const guessData = {
      number: rowNumber, // You can set the actual number here
      string: guessInput,
      proximity: semantic, // Add ;ty value here
      howClose: howClose, // Add how close value here (use quotes due to space in field name)
    };
    await addDoc(guessTableCollectionRef, guessData);
    // Update the 'CountGuessesForToday' field with the current rowNumber
    await updateDoc(userDocRef, {
      CountGuessesForToday: rowNumber,
    });
    // Return a success response
    res.status(200).json({ message: "Guess submitted successfully!" });
  } catch (error) {
    console.error("Error submitting guess:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/saveChanges/:username", async (req, res) => {
  const { username } = req.params; // Extract username from URL parameter
  const { backgroundcolor, font, animation } = req.body;
  try {
    // Get references to Firestore collections
    const userDocRef = doc(usersCollection, username);
    await updateDoc(userDocRef, {
      backgroundcolor: backgroundcolor, // You can set the actual number here
      font: font,
      animation: animation, // Add proximity value here
    });
    // Return a success response
    res.status(200).json({ message: "Success" });
  } catch (error) {
    console.error("Error", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/getUserGuesses/:username", async (req, res) => {
  const username = req.params.username;
  try {
    // Get the reference to the user's document
    const userDocRef = doc(usersCollection, username);
    // Create a reference to the "guess table" subcollection within the user's document
    const guessTableCollectionRef = collection(userDocRef, "guess table");
    // Fetch all documents from the "guess table" subcollection
    const querySnapshot = await getDocs(guessTableCollectionRef);
    const userGuesses = [];
    querySnapshot.forEach((doc) => {
      // Add each guess document to the userGuesses array
      userGuesses.push(doc.data());
    });
    // Sort the user's guesses based on the "number" field
    userGuesses.sort((a, b) => b.proximity - a.proximity);
    // Send the user's guesses as JSON response
    res.json(userGuesses);
  } catch (error) {
    console.error("Error fetching user's guesses:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post('/semantic_similarity', async (req, res) => {
  const { word1, word2 } = req.body;
  try {
    // Execute the Python script with the two words as arguments
    const pythonProcess = spawn('python', ['myScript.py', word1, word2]);
    // Collect the output of the Python script
    let output = '';
    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });
    pythonProcess.on('close', (code) => {
      if (code === 0) {
        // Successfully executed the script
        const similarityScore = parseFloat(output);
        res.json({ similarity_score: similarityScore });
      } else {
        res.status(500).json({ error: 'Python script execution failed' });
      }
    });
  } catch (error) {
    console.error('Error executing Python script:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Define a route to save user preferences
app.post('/savePreferences/:username', async (req, res) => {
  const username = req.params.username;
  const preferences = req.body;
  try {
    // Update the user's preferences in the Firebase database
    const userDocRef = doc(usersCollection, username);
    await updateDoc(userDocRef, {
      backgroundcolor: preferences.backgroundcolor,
      font: preferences.font,
      animation: preferences.animation,
    });
    // Respond with a success message
    res.status(200).json({ message: 'User preferences updated successfully' });
  } catch (error) {
    console.error('Error updating user preferences:', error);
    // Respond with an error message and a status code indicating the error
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user data route
app.post('/updateUserData/:username', async (req, res) => {
  const { username } = req.params;
  const newData = req.body;
  try {
    const userRef = doc(usersCollection, username);
    // Check if the user document already exists
    const userDocSnapshot = await getDoc(userRef);
    if (!userDocSnapshot.exists()) {
      // A user with the same username already exists
      return res.status(400).json({ error: "User not found" });
    }
    // Merge the new data with existing user data
    await setDoc(userRef, { Record: newData.Record, Victory: newData.Victory, wonToday: 1 }, { merge: true });
    return res.status(200).json({ message: 'User data updated successfully' });
  } catch (error) {
    console.error('Error updating user data:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the server
app.listen(3001, () => {
  console.log(`Server is running on port ${port}`);
  // Open login.html in the default web browser
  exec(`${openCommand} http://localhost:3001/login.html`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error opening browser: ${error}`);
    }
  });
})
