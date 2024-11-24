import { initializeApp } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-firestore.js";

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

// Function to load all orders
const loadAllOrders = async () => {
    try {
        const ordersRef = collection(db, "orders");
        const ordersSnap = await getDocs(ordersRef);

        if (ordersSnap.empty) {
            ordersListElem.innerHTML = "<p>No orders found.</p>";
        } else {
            ordersListElem.innerHTML = "";
            ordersSnap.forEach((docSnap) => {
                const orderData = docSnap.data();
                const orderId = docSnap.id;

                // Render order details
                const orderDiv = document.createElement("div");
                orderDiv.classList.add("order-summary");
                orderDiv.innerHTML = `
                            <h3>Order ID: ${orderId}</h3>
                            <p><strong>الإسم:</strong> ${orderData.name || "No address provided"}</p>
                            <p><strong>العنوان:</strong> ${orderData.address || "No address provided"}</p>
                            <p><strong>رقم الهاتف:</strong> ${orderData.phone || "No phone number provided"}</p>
                            <p><strong>طريقة الدفع:</strong> ${orderData.paymentMethod || "No payment method selected"}</p>
                            <div class="order-items"></div>
                            <p class="total-price"><strong>المجموع: </strong> ${orderData.total || "0.00"} جنيه</p>
                            <button class="accept-btn" data-order-id="${orderId}">إستلام الطلب</button>
                        `;

                // Render items for this order
                const orderItemsElem = orderDiv.querySelector(".order-items");
                orderData.items.forEach(item => {
                    const itemDiv = document.createElement("div");
                    itemDiv.classList.add("order-item");
                    itemDiv.innerHTML = `
                    <div class="order-item-details">
                    <p><strong>اسم المنتج:</strong><strong>${item.name}</strong></p>
                    <p><strong>الكمية:</strong>${item.quantity}</p>
                    <p><strong>المجموع للمنتج:</strong> ${(item.quantity * item.price).toFixed(2)} جنيه</p>
                    </div>
                    <img src="${item.imageUrl}" alt="${item.name}">
                            `;
                    orderItemsElem.appendChild(itemDiv);
                });

                ordersListElem.appendChild(orderDiv);
            });

            // Add event listeners for accept buttons
            const acceptButtons = document.querySelectorAll(".accept-btn");
            acceptButtons.forEach(button => {
                button.addEventListener("click", () => {
                    const orderId = button.getAttribute("data-order-id");
                    acceptOrder(orderId);
                });
            });
        }
    } catch (error) {
        console.error("Error loading orders:", error);
    }
};

// Function to update the order status to "accepted"
const acceptOrder = async (orderId) => {
    try {
        const orderRef = doc(db, "orders", orderId);
        await updateDoc(orderRef, {
            status: "accepted",
            acceptedAt: new Date().toISOString(),
        });

        alert("Order accepted successfully!");
        loadAllOrders(); // Refresh the order list after accepting
    } catch (error) {
        console.error("Error accepting order:", error);
        alert("Failed to accept the order.");
    }
};

// Call loadAllOrders to display all orders when the page loads
loadAllOrders();
