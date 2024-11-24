import { initializeApp } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-auth.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-firestore.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-storage.js";

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
const storage = getStorage(app);

// Get form elements
const productForm = document.getElementById("productForm");

productForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent form submission

    const category = document.getElementById("category").value;
    const productName = document.getElementById("productName").value.trim();
    const description = document.getElementById("description").value.trim();
    const quantity = document.getElementById("quantity").value;
    const price = document.getElementById("price").value;
    const productImage = document.getElementById("productImage").files[0];

    if (!productImage) {
        alert("Please select an image.");
        return;
    }

    try {
        // Upload image to Firebase Storage
        const imagePath = `products/${category}/${productImage.name}`;
        const imageRef = storageRef(storage, imagePath);
        await uploadBytes(imageRef, productImage);
        const imageUrl = await getDownloadURL(imageRef);

        // Save product information to Firestore
        await addDoc(collection(db, "product_information"), {
            category,
            name: productName,
            description,
            quantity: parseInt(quantity),
            price: parseFloat(price),
            imageUrl
        });

        alert("Product uploaded successfully!");
        productForm.reset();
    } catch (error) {
        console.error("Error uploading product:", error);
        alert("Failed to upload product. Please try again.");
    }
});
