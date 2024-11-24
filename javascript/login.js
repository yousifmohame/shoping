import { initializeApp } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCeP8QdYt80unnvugRl1cp7sWxosMDMjPM",
    authDomain: "zaker-c8619.firebaseapp.com",
    databaseURL: "https://zaker-c8619-default-rtdb.firebaseio.com",
    projectId: "zaker-c8619",
    storageBucket: "zaker-c8619.appspot.com",
    messagingSenderId: "707055371984",
    appId: "1:707055371984:web:1fcb50ea5f727779c200d5",
    measurementId: "G-WS2679LMC8"
  };
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginButton = document.getElementById("login");
const registerpage = document.getElementById("linkregs");
const errorMessage = document.getElementById("error-message");

loginButton.addEventListener("click", function () {
    const email = emailInput.value;
    const password = passwordInput.value;
    const loader = document.getElementById("loader");
    
    if (email === "" || password === "") {
        errorMessage.innerText = "Please fill in all fields.";
        return;
    }
    
    loader.classList.remove("hidden"); // Show loader

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            localStorage.setItem('uid', user.uid);
            window.location.href = "index.html";
        })
        .catch((error) => {
            console.error("Error:", error.message);
            errorMessage.innerText = "Login failed: " + error.message;
        })
        .finally(() => {
            loader.classList.add("hidden"); // Hide loader
        });
});


registerpage.addEventListener("click", ()=>{
    window.location.href="registe.html";
});

