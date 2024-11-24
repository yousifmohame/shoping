import { initializeApp } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCeP8QdYt80unnvugRl1cp7sWxosMDMjPM",
    authDomain: "zaker-c8619.firebaseapp.com",
    projectId: "zaker-c8619",
    storageBucket: "zaker-c8619.appspot.com",
    messagingSenderId: "707055371984",
    appId: "1:707055371984:web:1fcb50ea5f727779c200d5",
    measurementId: "G-WS2679LMC8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); // Initialize Firestore

// Get input elements
const phoneInput = document.getElementById("phone");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const usernameInput = document.getElementById("username");
const loginpage = document.getElementById("linklogs");


// Register button event listener
const registerBtn = document.getElementById("Register");

registerBtn.addEventListener("click", async function () {
    const email = emailInput.value;
    const password = passwordInput.value;
    const phone = phoneInput.value;
    const username = usernameInput.value;

    try {
        // Create user with Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Save user data in Firestore
        const userDocRef = doc(db, "users", user.uid);
        await setDoc(userDocRef, {
            username: username,
            phone: phone,
            email: email,
            createdAt: new Date().toISOString(), // Optional: Add a timestamp
        });

        // Save user ID in localStorage and redirect
        localStorage.setItem("uid", user.uid);
        window.location.href = "index.html";
    } catch (error) {
        // Handle errors
        console.error("Error during registration: ", error.code, error.message);
        alert(`Error: ${error.message}`);
    }
});

loginpage.addEventListener("click", ()=>{
    window.location.href="login.html";
});