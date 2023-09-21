// Add an event listener to the logout button
const logoutButton = document.getElementById('logoutButton');

logoutButton.addEventListener('click', function() {
  logout();
});

function logout() {
    window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', function () {
    const customizeButton = document.getElementById('customizeButton');
    const customizePopup = document.getElementById('customizePopup');
    const saveChangesButton = document.getElementById('changeFontButton2');

    // Show the popup when the "Customize" button is clicked
    customizeButton.addEventListener('click', function () {
        customizePopup.style.display = 'block';
    });

    // Hide the popup when the "Save Changes" button is clicked
    saveChangesButton.addEventListener('click', function () {
        customizePopup.style.display = 'none';
    });
});


async function saveChanges() {
    const username = localStorage.getItem('username');

    // Retrieve the selected background color
    const colorRadioButtons = document.querySelectorAll('input[name="color"]');
    let selectedColor = "";
    for (const radioButton of colorRadioButtons) {
        if (radioButton.checked) {
            selectedColor = radioButton.value;
            break;
        }
    }

    // Retrieve the selected victory animation
    const animationRadioButtons = document.querySelectorAll('input[name="animationRadio"]');
    let selectedAnimation = "";
    for (const radioButton of animationRadioButtons) {
        if (radioButton.checked) {
            selectedAnimation = radioButton.value;
            break;
        }
    }

    // Retrieve the selected font family
    const fontFamilyRadioButtons = document.querySelectorAll('input[name="fontFamily"]');
    let selectedFontFamily = "";
    for (const radioButton of fontFamilyRadioButtons) {
        if (radioButton.checked) {
            selectedFontFamily = radioButton.value;
            break;
        }
    }

    try {
        // Send the guess to the server with semantic and howClose
        const response = await fetch(`/savePreferences/${username}`, { // Update the URL here
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ backgroundcolor: selectedColor, font: selectedFontFamily, animation: selectedAnimation }),
        });
        console.log("response", response)
        if (response.ok) {
            alert("Data has been saved");
        } else {
            // Handle an error response from the server (e.g., display an error message)
            console.error("Error in saving data");
        }
    } catch (error) {
        // Handle any errors that occurred during the fetch or processing
        console.error("An error occurred:", error);
    }
}

// Function to fetch user preferences and update radio buttons
function updateUserPreferences() {
     const username = localStorage.getItem('username');
    $.get(`/preferences/${username}`, function (data) {
        // Update radio buttons based on user preferences
        $('input[name="fontFamily"][value="' + data.font + '"]').prop('checked', true);
        $('input[name="color"][value="' + data.backgroundColor + '"]').prop('checked', true);
        $('input[name="animationRadio"][value="' + data.animation + '"]').prop('checked', true);

        // Apply the selected font family to the body
        document.body.style.fontFamily = data.font;
        // Apply the selected background color
        document.body.style.backgroundColor = data.backgroundColor;

        // Add logic here to trigger animations based on data.animation
        if (data.wonToday === 1 && data.animation) {
            playAnimation(data.animation);
            disableButton();
        }
        if (data.wonToday === 0)
            enableButton();
    });
}

function playAnimation(animationName) {
    // Get references to the containers or elements needed for animations
    const victoryText = document.getElementById("victoryText");
    const container2 = document.getElementById("container2");
    const container = document.querySelector(".container");
    // Depending on the selected animation, trigger the corresponding animation effect
    switch (animationName) {
        case "victory":
            // Toggle the display property of the "Victory!" text
            if (victoryText.style.display === "none") {
                victoryText.style.display = "block";
            } else {
                victoryText.style.display = "none";
            }
            break;
        case "youWon":
            // Toggle the display property of "container2"
            if (container2.style.display === "none") {
                container2.style.display = "block";
            } else {
                container2.style.display = "none";
            }
            break;
        case "champion":
            // Toggle the 'hidden' class on the container
            container.classList.toggle("hidden");
            break;
        default:
            // Handle any other animation option or provide a default action
            break;
    }
}

document.addEventListener("DOMContentLoaded", function () {
    // Get references to the radio buttons
    const showRadio = document.getElementById("showRadio");
    const youWonRadio = document.getElementById("youWonRadio");
    const myRadio = document.getElementById("myRadio");

    // Get references to the containers
    const victoryText = document.getElementById("victoryText");
    const container2 = document.getElementById("container2");
    const container = document.querySelector(".container");
});

document.addEventListener("DOMContentLoaded", function () {
    // Get a reference to the radio buttons
    const fontRadioButtons = document.querySelectorAll('input[name="fontFamily"]');

    // Add a change event listener to the radio buttons
    fontRadioButtons.forEach(function (radioButton) {
        radioButton.addEventListener("change", function () {
            // Get the selected font family from the value of the radio button
            const selectedFontFamily = this.value;

            // Apply the selected font family to the body
            document.body.style.fontFamily = selectedFontFamily;

            // Select the button by its ID and change its font family
            const changeFontButton = document.getElementById("changeFontButton");
            const buttonText = document.getElementById("buttonText");
        });
    });
});

const elts = {
    text1: document.getElementById("text1"),
    text2: document.getElementById("text2")
};

const texts = [
    "YOU",
    "Won!!",
    "😁😁"
];

const morphTime = 1;
const cooldownTime = 0.25;

let textIndex = texts.length - 1;
let time = new Date();
let morph = 0;
let cooldown = cooldownTime;

elts.text1.textContent = texts[textIndex % texts.length];
elts.text2.textContent = texts[(textIndex + 1) % texts.length];

function doMorph() {
    morph -= cooldown;
    cooldown = 0;
    let fraction = morph / morphTime;
    if (fraction > 1) {
        cooldown = cooldownTime;
        fraction = 1;
    }
    setMorph(fraction);
}

function setMorph(fraction) {
    elts.text2.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`;
    elts.text2.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;
    fraction = 1 - fraction;
    elts.text1.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`;
    elts.text1.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;
    elts.text1.textContent = texts[textIndex % texts.length];
    elts.text2.textContent = texts[(textIndex + 1) % texts.length];
}

function doCooldown() {
    morph = 0;
    elts.text2.style.filter = "";
    elts.text2.style.opacity = "100%";
    elts.text1.style.filter = "";
    elts.text1.style.opacity = "0%";
}

function animate() {
    requestAnimationFrame(animate);
    let newTime = new Date();
    let shouldIncrementIndex = cooldown > 0;
    let dt = (newTime - time) / 1000;
    time = newTime;
    cooldown -= dt;
    if (cooldown <= 0) {
        if (shouldIncrementIndex) {
            textIndex++;
        }
        doMorph();
    } else {
        doCooldown();
    }
}

animate();
const container2 = document.getElementById("container2");

function changeBackgroundColor() {
    const colorOptions = document.getElementsByName('color');
    let selectedColor = '';
    for (const option of colorOptions) {
        if (option.checked) {
            selectedColor = option.value;
            break;
        }
    }
    document.body.style.backgroundColor = selectedColor;
}

// Attach the change event listener to the radio buttons
const radioButtons = document.getElementsByName('color');
for (const radioButton of radioButtons) {
    radioButton.addEventListener('change', changeBackgroundColor);
}

// Function to fetch the content of "menu.html" and display it as a popup
function showMenu() {
    const popupContainer = document.getElementById("menuPoup");
    fetch("menu.html")
        .then(response => response.text())
        .then(data => {
            console.log("showMenu3333");
            popupContainer.innerHTML = data;
            popupContainer.style.display = "block";
        })
        .catch(error => console.error("Error fetching menu.html:", error));
}

// Function to display error message
function displayErrorMessage(message) {
    const errorMessageDiv = document.getElementById("errorMessage");
    errorMessageDiv.textContent = message;
}

// Function to clear error message
function clearErrorMessage() {
    const errorMessageDiv = document.getElementById("errorMessage");
    errorMessageDiv.textContent = "";
}

const changeFontButton = document.getElementById('changeFontButton');

// Add an event listener for the "click" event
changeFontButton.addEventListener('click', handleGuess);

async function handleGuess() {
    let semantic; // Declare semantic here
    let howClose; // Declare howClose here
    const guessInput = document.getElementById("guessInput").value.trim();
    const username = localStorage.getItem('username');
    const table = document.getElementById("wordTable").getElementsByTagName('tbody')[0];
    const rowNumber = table.rows.length + 1;
    const progressSpinner = document.getElementById("progress-spinner");
    disableButton();
    progressSpinner.style.display = "block";
    // Clear previous error message
    clearErrorMessage();
    try {
        const isValidWord = await isRealWord(guessInput);
        if (isValidWord) {
            try {
                const response = await fetch("/getRandomWord");
                if (response.ok) {
                    const data = await response.json();
                    const randomWord = data.randomWord.name;

                    // Call the distance function and await the result
                    const semanticString = await distance(guessInput, randomWord);
                    console.log(typeof (semanticString))
                    // Convert semanticString to a number
                    semantic = parseFloat(semanticString);
                    console.log("guessInput", guessInput);
                    console.log("random word", randomWord);

                    // Determine howClose based on semantic
                    semantic *= 100;
                    semantic = semantic.toFixed(2);
                    if (semantic < 25)
                        howClose = "Very far";
                    else if (semantic >= 25 && semantic < 50)
                        howClose = "Far";
                    else if (semantic >= 50 && semantic < 75)
                        howClose = "Close";
                    else if (semantic >= 75 && semantic < 100)
                        howClose = "Very Close";
                    else {
                        winner();
                        return;
                    }

                    addToTable(guessInput, semantic, howClose);
                } else {
                    console.error("Failed to fetch random word:", response.statusText);
                }
            } catch (error) {
                console.error("Error fetching random word:", error);
            }

            // Send the guess to the server with semantic and howClose
            const response = await fetch("/submitGuess", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ guessInput, username, rowNumber, semantic, howClose }),
            });

            if (response.ok) {
                // Handle a successful response from the server (e.g., display a success message)
                const data = await response.json();
                console.log(data.message);
            } else {
                // Handle an error response from the server (e.g., display an error message)
                console.error("Error submitting guess:", response.statusText);
            }

        } else {
            const errorMessage = `I don't know this word: ${guessInput}`;
            displayErrorMessage(errorMessage);
        }
    } catch (error) {
        console.error("Error checking word:", error);
    }

    displayYPersonalDetails();
    progressSpinner.style.display = "none";
    enableButton();
}

async function distance(word1, word2) {
    const guessInput1 = word1;
    const guessInput2 = word2;
    try {
        const response = await fetch("/semantic_similarity", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ word1: guessInput1, word2: guessInput2 }),
        });
        if (response.ok) {
            const data = await response.json();
            console.log("Semantic Similarity Score:", data.similarity_score);
            return data.similarity_score;
            // Handle the similarity score as needed in your client-side code.
        } else {
            console.error("Error calculating similarity:", response.statusText);
        }
    } catch (error) {
        console.error("Error sending request:", error);
    }
}

async function isRealWord(word) {
    const response = await fetch("/checkWord", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ word }),
    });
    const result = await response.json();
    return result.isValid;
}

function addToTable(word, proximity, howClose) {
    const table = document.getElementById("wordTable").getElementsByTagName('tbody')[0];
    const errorMessage = document.getElementById("errorMessage");
    const inputField = document.getElementById("guessInput");
    // Check if the word is already in the table
    const isWordUnique = isWordUniqueInTable(table, word);
    if (isWordUnique) {
        // Create a new row
        const newRow = table.insertRow();
        // Set the number (row index + 1)
        const cell1 = newRow.insertCell(0);
        cell1.innerHTML = table.rows.length;
        // Set the word
        const cell2 = newRow.insertCell(1);
        cell2.innerHTML = word;
        // Set the proximity
        const cell3 = newRow.insertCell(2);
        cell3.innerHTML = proximity;
        // Set the howClose
        const cell4 = newRow.insertCell(3);
        cell4.innerHTML = howClose;
        // Clear the input field after adding to the table
        inputField.value = '';
        // Clear any previous error message
        errorMessage.textContent = '';
    } else {
        // Display an error message
        errorMessage.textContent = 'You already guessed this word';
    }
    // Sort the table rows based on proximity (excluding the header row)
    sortTableByProximity(table);
}

function sortTableByProximity() {
    const table = document.getElementById('wordTable');
    if (!table) {
        console.error('Table element not found');
        return;
    }
    const tbody = table.getElementsByTagName('tbody')[0];
    if (!tbody) {
        console.error('Tbody element not found');
        return;
    }
    const rows = Array.from(tbody.rows);
    rows.sort((a, b) => {
        const proximityA = parseFloat(a.cells[2].textContent);
        const proximityB = parseFloat(b.cells[2].textContent);
        return proximityB - proximityA; // Sort in descending order
    });
    // Clear the existing tbody content
    tbody.innerHTML = '';
    // Add the sorted rows back to the tbody
    rows.forEach((row) => {
        tbody.appendChild(row);
    });
}

// Function to check if a word is unique in the table
function isWordUniqueInTable(table, word) {
    for (let i = 0; i < table.rows.length; i++) {
        const cell = table.rows[i].cells[1]; // Assuming the word is in the second cell
        if (cell.innerHTML === word) {
            return false; // Word is not unique
        }
    }
    return true; // Word is unique
}

// Function to fetch yesterday's word and display it
async function displayYesterdaysWord(username) {
    try {
        const response = await fetch("/yesterdaysWord");
        if (response.ok) {
            const data = await response.json();
            const yesterdaysWordElement = document.getElementById("yesterdaysWord");
            yesterdaysWordElement.textContent = `Yesterday's word is ${data.yesterdaysWord.name}, 
                    today, riddle number ${data.yesterdaysWord.serial}`;
        } else {
            console.error("Failed to fetch yesterday's word:", response.statusText);
        }
    } catch (error) {
        console.error("Error fetching yesterday's word:", error);
    }
}

//Function to fetch yesterday's word and display it
async function displayCloseWords() {
    try {
        const response = await fetch("/closeWords");
        if (response.ok) {
            const data = await response.json();
            const closeWordsElement = document.getElementById("closeWords");
            closeWordsElement.textContent = `${data.result}`;
        } else {
            console.error("Failed to fetch close words:", response.statusText);
        }
    } catch (error) {
        console.error("Error fetching close words:", error);
    }
}

function displayGreeting() {
    const username = localStorage.getItem('username');
    if (username) {
        const greetingElement = document.getElementById("greeting");
        greetingElement.textContent = `Hello ${username}, welcome to Semantle!`;
    }
}

// Add an event listener to the "Personal Details" button
const openModalButton = document.getElementById("openModalButton");
const modal = document.getElementById("myModal");
const modalContent = document.getElementById("modalContent");
openModalButton.addEventListener("click", () => {
    // Call your function to fetch and display personal details
    displayYPersonalDetails();
    // Show the modal
    modal.style.display = "block";
});

// Function to close the modal when clicking the close button or outside the modal
window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
};

// Close the modal when clicking the close button
const closeButton = document.querySelector(".close");
closeButton.addEventListener("click", () => {
    modal.style.display = "none";
});

// Function to fetch and display personal details
async function displayYPersonalDetails() {
    try {
        const username = localStorage.getItem('username');
        const response = await fetch(`/userData/${username}`);
        if (response.ok) {
            const data = await response.json();
            modalContent.textContent = `Number of guesses for today ${data.CountGuessesForToday}, 
        Lowest number of guesses for riddle ${data.Record}, Amount of Victories ${data.Victory}`;
        } else {
            console.error("Failed to fetch personal details:", response.statusText);
        }
    } catch (error) {
        console.error("Error in fetching personal details:", error);
    }
}

async function displayUserGuesses() {
    const username = localStorage.getItem('username');
    try {
        const response = await fetch(`/getUserGuesses/${username}`);
        if (response.ok) {
            const userGuesses = await response.json();
            // Clear the existing table rows
            const wordTable = document.getElementById('wordTable').getElementsByTagName('tbody')[0];
            wordTable.innerHTML = '';
            // Add each guess to the table
            userGuesses.forEach((guess) => {
                console.log("guess", guess)
                if (guess.number != '0') {
                    addToTable(guess.string, guess.proximity, guess.howClose);
                }
            });
        } else {
            console.error("Failed to fetch user's guesses:", response.statusText);
        }
    } catch (error) {
        console.error("Error fetching user's guesses:", error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const saveChangesButton = document.getElementById('changeFontButton2');
    saveChangesButton.addEventListener('click', saveChanges);
});

async function winner() {
    try {
        const username = localStorage.getItem('username');
        const response = await fetch(`/userData/${username}`);
        if (response.ok) {
            const userData = await response.json();
            const Victory = userData.Victory;
            const Record = userData.Record;
            const CountGuessesForToday = userData.CountGuessesForToday;
            const animation = userData.animation;
            // Increment Victory by 1
            const newVictory = Victory + 1;
            // Update Record based on the specified logic
            let newRecord = Record;
            if (Record === 0) {
                newRecord = CountGuessesForToday;
            } else if (Record > 0 && CountGuessesForToday > Record) {
                newRecord = CountGuessesForToday;
            }

            disableButton();
            const userAnimation = animation;
            // Get references to the containers or elements needed for animations
            const victoryText = document.getElementById("victoryText");
            const container2 = document.getElementById("container2");
            const container = document.querySelector(".container");
            // Depending on the selected animation, trigger the corresponding animation effect
            switch (userAnimation) {
                case "victory":
                    // Toggle the display property of the "Victory!" text
                    if (victoryText.style.display === "none") {
                        victoryText.style.display = "block";
                    } else {
                        victoryText.style.display = "none";
                    }
                    break;
                case "youWon":
                    // Toggle the display property of "container2"
                    if (container2.style.display === "none") {
                        container2.style.display = "block";
                    } else {
                        container2.style.display = "none";
                    }
                    break;
                case "champion":
                    // Toggle the 'hidden' class on the container
                    container.classList.toggle("hidden");
                    break;
                default:
                    // Handle any other animation option or provide a default action
                    break;
            }
            // Update the user's data in Firebase with the new Victory and Record values
            await updateUserData(username, { Victory: newVictory, Record: newRecord });
        } else {
            console.error("Failed to fetch user data:", response.statusText);
        }
    } catch (error) {
        console.error("Error in winner function:", error);
    }
}

function disableButton() {
    const button = document.getElementById('changeFontButton');
    button.disabled = true; // Disable the button
    button.classList.add('disabledButton'); // Add a CSS class for styling
}

function enableButton() {
    const button = document.getElementById('changeFontButton');
    button.disabled = false; // Enable the button
    button.classList.remove('disabledButton'); // Remove the disabled styling
}

// Function to update user data in Firebase
async function updateUserData(username, newData) {
    try {
        const response = await fetch(`/updateUserData/${username}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newData),
        });

        if (response.ok) {
            console.log("User data updated successfully.");
        } else {
            console.error("Failed to update user data:", response.statusText);
        }
    } catch (error) {
        console.error("Error updating user data:", error);
    }
}

function onLoad() {
    displayUserGuesses();
    displayYPersonalDetails();
    displayYesterdaysWord();
    displayGreeting();
    updateUserPreferences();
}
window.addEventListener('load', onLoad);







