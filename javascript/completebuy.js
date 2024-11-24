import { initializeApp } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-auth.js";
import { getFirestore, collection, getDocs, getDoc, deleteDoc , doc, setDoc } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-firestore.js";

// Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyCeP8QdYt80unnvugRl1cp7sWxosMDMjPM",
    authDomain: "zaker-c8619.firebaseapp.com",
    projectId: "zaker-c8619",
    storageBucket: "zaker-c8619.appspot.com",
    messagingSenderId: "707055371984",
    appId: "1:707055371984:web:1fcb50ea5f727779c200d5",
    measurementId: "G-WS2679LMC8",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Variables
const userNameElem = document.getElementById("userName");
const userAddressElem = document.getElementById("userAddress");
const userPhoneElem = document.getElementById("userPhone");
const orderSummaryElem = document.getElementById("orderSummary");
const totalPriceElem = document.getElementById("totalPrice");
const totalPriceitems = document.getElementById("sumprice");


let currentUser = null;
let orderItems = [];
let finalTotal = 0;

// Auth State Check
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        await loadUserDetails();
        await loadOrderSummary();
    } else {
        alert("You must be logged in to complete the purchase.");
        window.location.href = "login.html";
    }
});

// Load User Details
const loadUserDetails = async () => {
    try {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
            const userData = userDoc.data();
            userNameElem.textContent = userData.username || "Not Provided";
            userAddressElem.textContent = userData.address || "Not Provided";
            userPhoneElem.textContent = userData.phone || "Not Provided";
        } else {
            console.error("User document does not exist.");
        }
    } catch (error) {
        console.error("Error loading user details:", error);
    }
};

// Load Order Summary from "completebuy"
const loadOrderSummary = async () => {
    try {
        const userCompleteBuyRef = collection(db, `users/${currentUser.uid}/completebuy`);
        const querySnapshot = await getDocs(userCompleteBuyRef);
        orderItems = [];

        querySnapshot.forEach((doc) => {
            // Add all items from each completebuy document
            const data = doc.data();
            const items = data.items;
            if (items && Array.isArray(items)) {
                items.forEach(item => {
                    orderItems.push(item);
                });
            }
        });

        renderOrderSummary();
    } catch (error) {
        console.error("Error loading orders:", error);
        orderSummaryElem.innerHTML = "<p>Error loading orders.</p>";
    }
};

// Render Order Summary
const renderOrderSummary = () => {
    orderSummaryElem.innerHTML = "";
    finalTotal = 0;

    orderItems.forEach((item) => {
        // Check for valid price and quantity
        if (typeof item.price === "number" && typeof item.quantity === "number") {
            const itemTotal = item.price * item.quantity;
            finalTotal += itemTotal;

            const orderItemDiv = document.createElement("div");
            orderItemDiv.classList.add("order-item");
            orderItemDiv.innerHTML = `
                <div class="order-item-content">
                <div class="itemifo">
                <p><strong>${item.name}</strong></p>
                <p>${item.quantity} × ${item.price.toFixed(2)} جنيه</p>
                <p><strong>المجموع:</strong> ${itemTotal.toFixed(2)} جنيه</p>
                </div>
                <img src="${item.imageUrl || 'img/default.png'}" alt="${item.name}" style="width: 100px; height: 100px;">
                </div>
            `;
            orderSummaryElem.appendChild(orderItemDiv);
            totalPriceElem.textContent = `${finalTotal.toFixed(2)} جنيه`;
            totalPriceitems.textContent = `${finalTotal.toFixed(2)} جنيه`;
        } else {
            console.error("Invalid price or quantity for item", item);
        }
    });

};
// Function to remove all orders from the current user's 'myOrders' collection
const removeAllOrders = async () => {
    if (!currentUser) {
        alert("You must be logged in to remove orders.");
        return;
    }

    try {
        // Get all orders for the current user
        const userOrdersRef = collection(db, `users/${currentUser.uid}/myOrders`);
        const querySnapshot = await getDocs(userOrdersRef);

        // Create an array of promises to delete all orders
        const deletePromises = querySnapshot.docs.map((docSnapshot) => deleteDoc(docSnapshot.ref));

        // Wait for all deletions to complete
        await Promise.all(deletePromises);

        console.log("All orders removed successfully!");
    } catch (error) {
        console.error("Error removing orders:", error);
        alert("Failed to remove orders.");
    }
};

// Call this function when the user completes the purchase (e.g., after placing the order)
document.querySelector(".complete-btn").addEventListener("click", async () => {
    const address = userAddressElem.textContent.trim();
    const phone = userPhoneElem.textContent.trim();
    const name = userNameElem.textContent.trim();
    const selectedPaymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value;

    if (!selectedPaymentMethod) {
        alert("Please select a payment method.");
        return;
    }

    const orderData = {
        userId: currentUser.uid,
        name,
        address,
        phone,
        paymentMethod: selectedPaymentMethod,
        items: orderItems,
        total: finalTotal.toFixed(2),
        createdAt: new Date().toISOString(),
        status: "طلبك قيد المراجعة",  // Initial status for tracking
    };

    try {
        // Save the order to the 'orders' collection
        const orderDocRef = doc(db, `orders/${currentUser.uid}-${Date.now()}`);
        await setDoc(orderDocRef, orderData);

        
        // Remove all items from the 'myOrders' collection after the purchase
        await removeAllOrders();

        alert("Order placed successfully and tracking information saved!");
        window.location.href = "index.html"; // Redirect to the thank you page
    } catch (error) {
        console.error("Error placing order:", error);
        alert("Failed to place order.");
    }
});
