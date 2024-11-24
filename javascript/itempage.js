import { initializeApp } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-app.js";
import { getFirestore, doc, getDoc, query, collection, where, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-auth.js";

// Firebase configuration
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
const db = getFirestore(app);
const auth = getAuth(app);

// Get the product ID from the URL
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("id");

const itemContainer = document.getElementById("itemContainer");
const similarItemsContainer = document.getElementById("similarItemsContainer");

let currentUser = null;

// Listen for authentication state
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("Authenticated user:", user.uid);
        currentUser = user; // Save the current user
    } else {
        alert("يرجى تسجيل الدخول لمتابعة الطلبات.");
        window.location.href = "login.html"; // Redirect to login page
    }
});

// Fetch and display the item details
const fetchItemDetails = async () => {
    if (productId) {
        const productRef = doc(db, "product_information", productId);
        try {
            const productDoc = await getDoc(productRef);
            if (productDoc.exists()) {
                const product = productDoc.data();
                console.log("Fetched product details:", product); // Debug log

                // Display product details
                itemContainer.innerHTML = `
                <div class="product-details">
                    <img src="${product.imageUrl}" alt="${product.name}" class="product-image">
                    <div class="product-info">
                        <h2>${product.name}</h2>
                        <p>${product.description}</p>
                        <h3>السعر: ${product.price} جنيه</h3>
                        <button id="buyNowBtn">الشراء الأن</button>
                    </div>
                </div>
                `;

                // Add event listener for "Buy Now" button
                document.getElementById("buyNowBtn").addEventListener("click", async (event) => {
                    const button = event.target;
                    button.disabled = true; // Disable the button
                    await addToMyOrders(product);
                    button.disabled = false; // Re-enable the button after completion
                    window.location.href = "shopping-car.html";
                });

                // Fetch and display similar items
                fetchSimilarItems(product.category);
            } else {
                itemContainer.textContent = "المنتج غير موجود.";
            }
        } catch (error) {
            console.error("Error fetching product details:", error);
        }
    } else {
        itemContainer.textContent = "لم يتم تحديد المنتج.";
    }
};

// Fetch and display similar items
const fetchSimilarItems = async (category) => {
    const similarItemsQuery = query(
        collection(db, "product_information"),
        where("category", "==", category)
    );

    try {
        const snapshot = await getDocs(similarItemsQuery);
        if (!snapshot.empty) {
            similarItemsContainer.innerHTML = ""; // Clear existing items
            snapshot.forEach((doc) => {
                const item = doc.data();
                similarItemsContainer.innerHTML += `
                <div class="card">
                    <img src="${item.imageUrl}" alt="${item.name}" class="similar-item-image">
                    <div class="similar-item-info">
                        <h3>${item.name}</h3>
                        <h4>${item.price} جنيه</h4>
                    </div>
                </div>
                `;
            });
        } else {
            similarItemsContainer.textContent = "لا توجد منتجات مشابهة.";
        }
    } catch (error) {
        console.error("Error fetching similar items:", error);
    }
};

// Add the product to "My Orders"
const addToMyOrders = async (product) => {
    if (currentUser) {
        const userId = currentUser.uid; // Get the user's unique ID
        console.log("Adding product to user orders:", product); // Debug log
        try {
            const docRef = await addDoc(collection(db, `users/${userId}/myOrders`), {
                name: product.name,
                description: product.description,
                quantity: product.quantity,
                price: product.price,
                imageUrl: product.imageUrl,
                timestamp: new Date(),
            });
            console.log("Order added successfully with ID:", docRef.id);
            alert("تمت إضافة المنتج إلى طلباتك!");
        } catch (error) {
            console.error("Firestore write error:", error);
            alert("فشل في إضافة المنتج إلى الطلبات.");
        }
    } else {
        alert("يرجى تسجيل الدخول لإضافة المنتج إلى الطلبات.");
    }
};

// Fetch the item details on page load
fetchItemDetails();
