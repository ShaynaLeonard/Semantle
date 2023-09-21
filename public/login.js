const loginForm = document.getElementById('login-form');
const newUserForm = document.getElementById('new-user-form');
const newButton = document.getElementById('new-user-button');
const saveButton = document.getElementById('save-button');
const loginButton = document.getElementById('login-button');

newButton.addEventListener('click', () => {
    loginForm.style.display = 'none';
    newUserForm.style.display = 'block';
});

saveButton.addEventListener('click', async () => {
    const newUsername = document.getElementById('new-username').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    if (newUsername && newPassword && confirmPassword) {
        if (newPassword === confirmPassword) {
            try {
                const response = await fetch('/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ newUsername, newPassword }),
                });
                if (response.ok) {
                    const data = await response.json();
                    // Check if the registration was successful or not
                    if (data.message === 'Registration successful!') {
                        alert('Registration successful! Data sent to server.');
                        // Reset the form and do not navigate to the login page
                        document.getElementById('new-username').value = '';
                        document.getElementById('new-password').value = '';
                        document.getElementById('confirm-password').value = '';
                        // Hide the new user registration form
                        newUserForm.style.display = 'none';
                        // Show the login form
                        loginForm.style.display = 'block';
                    } else {
                        // Handle the case where the username is already taken
                        alert('Username is already taken. Please choose another username.');
                    }
                } else {
                    // Handle server error responses (e.g., display an error message)
                    const errorData = await response.json();
                    alert(`Registration failed: ${errorData.error}`);
                }
            } catch (error) {
                console.error('Registration error:', error);
                alert('Registration failed. Please try again later.');
            }
        } else {
            alert('Password and confirmed password do not match.');
        }
    } else {
        alert('Please fill in all fields.');
    }
});

loginButton.addEventListener('click', () => { // Add this event listener
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    if (username && password) {
        // Send the username and password to the server-side
        fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }), // Send the username and password
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    localStorage.setItem('username', username);
                    // If login is successful, navigate to index.html
                    window.location.href = 'index.html'
                } else {
                    // If login fails, display an error message
                    alert(data.message);
                }
            })
            .catch((error) => {
                console.error('Login error:', error);
                alert('Login failed. Please try again later.');
            });
    } else {
        alert('Please fill in all fields.');
    }
});

// Function to fetch and display user's guesses
function fetchUserGuesses(username) {
    // Fetch the user's guesses from the server
    fetch(`/getUserGuesses/${username}`)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Request failed with status: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            if (data) {
                // Store the user's guesses in localStorage
                localStorage.setItem('userGuesses', JSON.stringify(data));
                // Navigate to index.html only after storing the data
                window.location.href = 'index.html';
            } else {
                console.log('data', data)
                // If the user has no guesses, display a message or take appropriate action
                console.log('User has no guesses.');
                // Still navigate to index.html since there may be no guesses
                window.location.href = 'index.html';
            }
        })
        .catch((error) => {
            console.error('Error fetching user\'s guesses:', error);
            // Handle the error, for example, display an error message to the user
        });
}
const backButton = document.getElementById("back-button");
backButton.addEventListener("click", toggleForms);
function toggleForms() {
    const loginForm = document.getElementById("login-form");
    const newUserForm = document.getElementById("new-user-form");
    // Toggle the visibility of the forms
    loginForm.style.display = loginForm.style.display === "none" ? "block" : "none";
    newUserForm.style.display = newUserForm.style.display === "none" ? "block" : "none";
}

