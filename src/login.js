// // Initialize Firebase
// const firebaseConfig = {
//     apiKey: "AIzaSyDa8GKRuPLjq67gQ9I5EO_YQdW1aA0tM0w",
//     authDomain: "kkalisite-4fc4e.firebaseapp.com",
//     projectId: "kkalisite-4fc4e",
//     storageBucket: "kkalisite-4fc4e.appspot.com",
//     messagingSenderId: "1041085614061",
//     appId: "1:1041085614061:web:b876df26a5571fb44309e4",
//     measurementId: "G-YGWSDLB7HW"
// };

// firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

document.getElementById('showRegister').addEventListener('click', function() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('registerSection').style.display = 'block';
});

document.getElementById('showLogin').addEventListener('click', function() {
    document.getElementById('loginSection').style.display = 'block';
    document.getElementById('registerSection').style.display = 'none';
});

document.getElementById('registerButton').addEventListener('click', function() {
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const registerError = document.getElementById('registerError');

    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            console.log("User registered successfully");
            window.location.href = 'main.html'; // Redirect to the main content page on successful registration
        })
        .catch((error) => {
            registerError.textContent = error.message; // Display error message below the registration form
        });
});

document.getElementById('loginButton').addEventListener('click', function() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const loginError = document.getElementById('loginError');

    firebase.auth().signInWithEmailAndPassword(email, password)


//     //////////
        .then((userCredential) => {
//             const addAdminRole = firebase.functions().httpsCallable('addAdminRole');
// addAdminRole({ email: 'kkalisite@gmail.com' }).then(result => {
//     console.log(result);
// });

// console.log("????");
// //REMOVE!!!
            window.location.href = 'main.html'; // Redirect to the main content page on successful login
        })
        .catch((error) => {
            loginError.textContent = error.message; // Display error message below the login form
        });
});
