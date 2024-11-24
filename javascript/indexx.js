import { initializeApp } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-app.js";
import { getFirestore, addDoc, collection, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-storage.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-auth.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCeP8QdYt80unnvugRl1cp7sWxosMDMjPM",
    authDomain: "zaker-c8619.firebaseapp.com",
    databaseURL: "https://zaker-c8619-default-rtdb.firebaseio.com",
    projectId: "zaker-c8619",
    storageBucket: "zaker-c8619.appspot.com",
    messagingSenderId: "707055371984",
    appId: "1:707055371984:web:1fcb50ea5f727779c200d5",
    measurementId: "G-WS2679LMC8",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

// Global variables
let products = [];
let currentIndex = 0;
let autoScrollInterval;
let currentUser = null;

// Check User Authentication
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user; // Store the authenticated user
        console.log("Current user:", user.uid);
        fetchProducts(); // Fetch products after authentication
    } else {
        alert("You must be logged in to view this page.");
        window.location.href = "login.html"; // Redirect to login if not authenticated
    }
});

// Fetch Products
const fetchProducts = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, "products"));
        products = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        if (products.length > 0) {
            currentIndex = 0;
            displayProduct(currentIndex);
            startAutoScroll();
        } else {
            document.getElementById("productList").innerHTML = "<p>No products available.</p>";
        }
    } catch (error) {
        console.error("Error fetching products:", error);
        document.getElementById("productList").innerHTML = "<p>Error loading products.</p>";
    }
};

// Display Product
const displayProduct = (index) => {
    const product = products[index];
    const productList = document.getElementById("productList");

    productList.innerHTML = `
        <div class="product-card">
            <img src="${product.imageUrl}" alt="${product.name}" />
            <div class="descripe">
                <h1 class="font">${product.name}</h1>
                <p class="font">${product.description}</p>
                <p><strong>الكمية المتاحة: </strong> ${product.quantity}</p>
                <p><strong> جنيه</strong> ${product.price}</p>
                <button class="add-to-orders-btn"><i class="fa-solid fa-cart-plus"></i></button>
                <button class="buybtn">الشراء الأن</button>
            </div>
        </div>
    `;

    productList.querySelector(".add-to-orders-btn").addEventListener("click", () => {
        addToMyOrders(index);
    });

    productList.querySelector(".buybtn").addEventListener("click", async () => {
        await addToMyOrders(index);
        window.location.href = "shopping-car.html";
    });
};

// Add to Current User's Orders
const addToMyOrders = async (index) => {
    if (!currentUser) {
        alert("Please log in to add products to your orders.");
        return;
    }

    const product = products[index];
    try {
        // Add order to the current user's "myOrders" subcollection
        await addDoc(collection(db, `users/${currentUser.uid}/myOrders`), {
            name: product.name,
            description: product.description,
            quantity: product.quantity, 
            price: product.price,
            imageUrl: product.imageUrl,
            timestamp: new Date(),
        });

        alert("Product added to your orders successfully!");
    } catch (error) {
        console.error("Error adding to orders:", error);
        alert("Failed to add product to orders.");
    }
};


const startAutoScroll = () => {
    autoScrollInterval = setInterval(() => {
        currentIndex = (currentIndex + 1) % products.length;
        displayProduct(currentIndex);
    }, 4000);
};

const stopAutoScroll = () => clearInterval(autoScrollInterval);

// Next Button
document.getElementById("nextBtn").addEventListener("click", () => {
    stopAutoScroll();
    if (currentIndex < products.length - 1) {
        currentIndex++;
        displayProduct(currentIndex);
    } else {
        alert("This is the last product!");
    }
});
