import { initializeApp } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-auth.js";
import { getFirestore, collection, addDoc, doc , setDoc } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-firestore.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-storage.js";
import { v4 as uuidv4 } from "https://cdn.jsdelivr.net/npm/uuid@9.0.0/dist/esm-browser/index.js";

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
    event.preventDefault();

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
        // Generate a unique primary key
        const productId = uuidv4();

        // Upload image to Firebase Storage
        const imagePath = `products/${category}/${productImage.name}`;
        const imageRef = storageRef(storage, imagePath);
        await uploadBytes(imageRef, productImage);
        const imageUrl = await getDownloadURL(imageRef);

        // Save product information to Firestore
        await setDoc(doc(db, "product_information", productId), {
            productId, // Include primary key
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
