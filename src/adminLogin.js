document.getElementById('loginButton').addEventListener('click', function() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const loginError = document.getElementById('loginError');

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Implement a check to confirm user is an admin, could be a role check in your database
            // For now, simply redirect to an admin content page
            window.location.href = 'adminContent.html'; // Placeholder, replace with actual admin content page
        })
        .catch((error) => {
            loginError.textContent = error.message; // Display error message below the login form
        });
});
