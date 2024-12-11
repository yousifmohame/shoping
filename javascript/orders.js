import { initializeApp } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-app.js";
import {
    getFirestore,
    collection,
    query,
    orderBy,
    onSnapshot,
    doc,
    updateDoc,
    serverTimestamp,
} from "https://www.gstatic.com/firebasejs/9.18.0/firebase-firestore.js";

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

// Variables
const ordersListElem = document.getElementById("ordersList");

// Function to load all orders with real-time updates
const loadAllOrders = () => {
    const ordersRef = collection(db, "orders");
    const q = query(ordersRef, orderBy("createdAt", "desc")); // Order by timestamp (newest first)

    // Real-time listener
    onSnapshot(q, (snapshot) => {
        ordersListElem.innerHTML = ""; // Clear existing orders

        snapshot.forEach((docSnap) => {
            const orderData = docSnap.data();
            const orderId = docSnap.id;
            renderOrder(orderId, orderData); // Render each order
        });
    });
};

// Function to render an order
const renderOrder = (orderId, orderData) => {
    const orderDiv = document.createElement("div");
    orderDiv.classList.add("order-summary");
    orderDiv.innerHTML = `
        <h3>Order ID: ${orderId}</h3>
        <p><strong>الإسم:</strong> ${orderData.name || "No name provided"}</p>
        <p><strong>العنوان:</strong> ${orderData.address || "No address provided"}</p>
        <p><strong>رقم الهاتف:</strong> ${orderData.phone || "No phone number provided"}</p>
        <p><strong>طريقة الدفع:</strong> ${orderData.paymentMethod || "No payment method selected"}</p>
        <div class="order-items"></div>
        <p class="total-price"><strong>المجموع: </strong> ${orderData.total || "0.00"} جنيه</p>
        <button class="accept-btn" data-order-id="${orderId}">تاكيد الطلب</button>
        <button class="out-btn" data-order-id="${orderId}">خرج للتوصيل</button>
        <button class="done-btn" data-order-id="${orderId}">تم توصيل الطلب</button>
    `;

    // Set order background color and button states based on status
    setOrderState(orderDiv, orderData.status);

    // Render items for this order
    const orderItemsElem = orderDiv.querySelector(".order-items");
    orderData.items.forEach((item) => {
        const itemDiv = document.createElement("div");
        itemDiv.classList.add("order-item");
        itemDiv.innerHTML = `
            <div class="order-item-details">
                <p><strong>اسم المنتج:</strong> ${item.name}</p>
                <p><strong>الكمية:</strong> ${item.quantity}</p>
                <p><strong>المجموع للمنتج:</strong> ${(item.quantity * item.price).toFixed(2)} جنيه</p>
            </div>
            <img src="${item.imageUrl}" alt="${item.name}">
        `;
        orderItemsElem.appendChild(itemDiv);
    });

    // Attach event listeners to buttons
    orderDiv.querySelector(".accept-btn").addEventListener("click", (e) => {
        handleButtonClick(e.target, orderId, "تم تاكيد الطلب", orderDiv, "green");
    });
    orderDiv.querySelector(".out-btn").addEventListener("click", (e) => {
        handleButtonClick(e.target, orderId, "طلبك خرج للتوصيل", orderDiv, "blue");
    });
    orderDiv.querySelector(".done-btn").addEventListener("click", (e) => {
        handleButtonClick(e.target, orderId, "تم تسليم الطلبية", orderDiv, "red");
    });

    ordersListElem.appendChild(orderDiv);
};

// Function to handle button click and update status
const handleButtonClick = async (button, orderId, newStatus, orderDiv) => {
    if (button.disabled) return; // Prevent double-click

    try {
        button.disabled = true; // Disable the button
        await updateOrderStatus(orderId, newStatus); // Update status in Firestore
        setOrderState(orderDiv, newStatus); // Update UI
    } catch (error) {
        console.error("Error updating status:", error);
        button.disabled = false; // Re-enable button if an error occurs
    }
};

// Function to update the order status in Firestore
const updateOrderStatus = async (orderId, newStatus) => {
    const orderRef = doc(db, "orders", orderId);
    await updateDoc(orderRef, { status: newStatus });
    alert(`Order status updated to "${newStatus}" successfully!`);
};

// Function to set order state based on status
const setOrderState = (orderDiv, status) => {
    const acceptBtn = orderDiv.querySelector(".accept-btn");
    const outBtn = orderDiv.querySelector(".out-btn");
    const doneBtn = orderDiv.querySelector(".done-btn");

    if (status === "تم تاكيد الطلب") {
        orderDiv.style.backgroundColor = "green";
        acceptBtn.disabled = true;
    } else if (status === "طلبك خرج للتوصيل") {
        orderDiv.style.backgroundColor = "blue";
        acceptBtn.disabled = true;
        outBtn.disabled = true;
    } else if (status === "تم تسليم الطلبية") {
        orderDiv.style.backgroundColor = "red";
        acceptBtn.disabled = true;
        outBtn.disabled = true;
        doneBtn.disabled = true;
    }
};

// Load all orders on page load
document.addEventListener("DOMContentLoaded", () => {
    loadAllOrders();
});
