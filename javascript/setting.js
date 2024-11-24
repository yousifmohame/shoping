// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged, updateEmail } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-firestore.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-storage.js";

// Firebase config
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
const db = getFirestore(app);
const storage = getStorage(app);

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("editProfileForm");
    const usernameInput = document.getElementById("username");
    const phoneInput = document.getElementById("phone");
    const emailInput = document.getElementById("email");
    const addressInput = document.getElementById("address");
    const profilePicInput = document.getElementById("profilePic");
    const profilePicPreview = document.getElementById("preview");

    let userId;

    // Fetch current user and populate form
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            userId = user.uid;

            // Fetch user data from Firestore
            const userDocRef = doc(db, "users", userId);
            const userSnapshot = await getDoc(userDocRef);

            if (userSnapshot.exists()) {
                const userData = userSnapshot.data();

                usernameInput.value = userData.username || "";
                phoneInput.value = userData.phone || "";
                 // From Auth
                addressInput.value = userData.address || "";
                profilePicPreview.src = userData.profilePicture || "https://via.placeholder.com/150";
                profilePicPreview.style.display = "block";
            }
        } else {
            alert("No user is logged in.");
        }
    });

    // Handle profile picture preview
    profilePicInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                profilePicPreview.src = reader.result;
                profilePicPreview.style.display = "block";
            };
            reader.readAsDataURL(file);
        }
    });

    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log("User is logged in:", user);
        } else {
            console.log("No user is logged in.");
            window.location.href = "login.html";
        }
    });

    

    // Handle form submission
    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const username = usernameInput.value.trim();
        const phone = phoneInput.value.trim();
        const email = emailInput.value.trim();
        const address = addressInput.value.trim();

        let profilePictureURL = profilePicPreview.src;

        // Handle profile picture upload if new image is selected
        if (profilePicInput.files.length > 0) {
            const file = profilePicInput.files[0];
            const storagePath = `profilePictures/${userId}/${file.name}`;
            const storageFileRef = storageRef(storage, storagePath);

            // Upload file to Firebase Storage
            await uploadBytes(storageFileRef, file);
            profilePictureURL = await getDownloadURL(storageFileRef);
        }

        // Update user data in Firestore
        const userDocRef = doc(db, "users", userId);
        await setDoc(userDocRef, {
            username,
            phone,
            address,
            profilePicture: profilePictureURL,
        }, { merge: true });

        // Update email in Firebase Authentication
        const currentUser = auth.currentUser;
        if (currentUser && currentUser.email !== email) {
            await updateEmail(currentUser, email);
        }

        alert("Profile updated successfully!");
    });
});
