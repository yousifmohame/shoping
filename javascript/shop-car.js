import { initializeApp } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-app.js";
import {
    getFirestore,
    collection,
    getDocs,
    deleteDoc,
    doc,
    setDoc,
} from "https://www.gstatic.com/firebasejs/9.18.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-auth.js";

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
const auth = getAuth(app);

let currentUser = null;

// Wait for DOM to Load
document.addEventListener("DOMContentLoaded", () => {
    // Check User Authentication
    onAuthStateChanged(auth, (user) => {
        if (user) {
            currentUser = user; // Store the authenticated user
            console.log("Current user:", user.uid);
            fetchMyOrders(); // Fetch orders for the authenticated user
        } else {
            alert("يجب تسجيل الدخول للإستمرار");
            window.location.href = "login.html"; // Redirect to login if not authenticated
        }
    });

    attachBuyButtonListener(); // Attach listener for buy button
});

// Fetch Orders for the Current User
const fetchMyOrders = async () => {
    const ordersList = document.getElementById("ordersList");
    const ordersprice = document.getElementById("sumprice");
    const totalprice = document.getElementById("totalsprice");

    if (!currentUser) {
        return;
    }

    try {
        const userOrdersRef = collection(db, `users/${currentUser.uid}/myOrders`);
        const querySnapshot = await getDocs(userOrdersRef);
        const orders = [];

        querySnapshot.forEach((doc) => {
            orders.push({ id: doc.id, ...doc.data() });
        });

        // Clear the list before appending new content
        ordersList.innerHTML = "";

        // Handle the case where no orders exist
        if (orders.length === 0) {
            ordersList.innerHTML = "<p>لم يتم إضافة منتجات</p>";
            ordersprice.innerHTML = "<p><strong>السعر:</strong> 0</p>";
            totalprice.innerHTML = "<p><strong>المجموع:</strong> 0</p>";
            return;
        }

        let userSelectedTotalPrice = 0;

        // Generate order cards for each order
        orders.forEach((order) => {
            const maxQuantity = order.quantity || 1;
            const pricePerUnit = order.price;

            const orderCard = document.createElement("div");
            orderCard.classList.add("order-card");
            orderCard.innerHTML = `
                <img src="${order.imageUrl}" alt="${order.name}" />
                <div class="order-info">
                    <h3>${order.name}</h3>
                    <p><strong>الكمية المتاحة:</strong> ${maxQuantity}</p>
                    <p class="quantitysec">
                        <strong>الكمية</strong>
                        <input 
                            type="number" 
                            class="quantity-input" 
                            data-id="${order.id}" 
                            data-price="${pricePerUnit}" 
                            data-max="${maxQuantity}" 
                            min="1" 
                            max="${maxQuantity}" 
                            value="1" 
                        />
                    </p>
                    <p class="pricesec"> ${pricePerUnit.toFixed(1)} <strong>جنيه</strong></p>
                    <button class="delete-order-btn" data-id="${order.id}">
                        حذف العنصر
                    </button>
                </div>
            `;

            ordersList.appendChild(orderCard);

            // Initial price calculation for the default quantity
            userSelectedTotalPrice += pricePerUnit;

            // Add event listener to quantity input field
            orderCard.querySelector(".quantity-input").addEventListener("change", (e) => {
                const chosenQuantity = parseInt(e.target.value, 10);
                const maxQuantity = parseInt(e.target.getAttribute("data-max"), 10);
                const pricePerUnit = parseFloat(e.target.getAttribute("data-price"));

                // Validate chosen quantity
                if (chosenQuantity > 0 && chosenQuantity <= maxQuantity) {
                    // Recalculate the total price
                    const allInputs = document.querySelectorAll(".quantity-input");
                    userSelectedTotalPrice = Array.from(allInputs).reduce((total, input) => {
                        const quantity = parseInt(input.value, 10);
                        const price = parseFloat(input.getAttribute("data-price"));
                        return total + quantity * price;
                    }, 0);

                    // Update the total price display
                    ordersprice.innerHTML = `<p> ${userSelectedTotalPrice.toFixed(1)} <strong>جنيه</strong></p>`;
                    totalprice.innerHTML = `<p> ${userSelectedTotalPrice.toFixed(1)} <strong>جنيه</strong></p>`;
                } else {
                    alert("Invalid quantity! Please select a valid amount.");
                    e.target.value = 1; // Reset to default value
                }
            });

            // Add event listener to delete button
            orderCard.querySelector(".delete-order-btn").addEventListener("click", async (e) => {
                const orderId = e.target.getAttribute("data-id");
                await removeOrder(orderId);
                fetchMyOrders(); // Refresh orders list after deletion
            });
        });

        // Initial total price display
        ordersprice.innerHTML = `<p> ${userSelectedTotalPrice.toFixed(1)} <strong>جنيه</strong></p>`;
        totalprice.innerHTML = `<p> ${userSelectedTotalPrice.toFixed(1)} <strong>جنيه</strong></p>`;
    } catch (error) {
        console.error("Error fetching orders:", error);
        ordersList.innerHTML = "<p>Error loading orders.</p>";
    }
};

// Function to handle buy button events
const attachBuyButtonListener = () => {
    const buyBtn = document.querySelector(".buybtn");

    if (buyBtn) {
        buyBtn.addEventListener("click", async () => {
            const orderItems = Array.from(document.querySelectorAll(".quantity-input")).map((input) => {
                const orderCard = input.closest(".order-card");
                return {
                    name: orderCard.querySelector("h3").textContent.trim(),
                    imageUrl: orderCard.querySelector("img").src,
                    quantity: parseInt(input.value, 10),
                    price: parseFloat(input.getAttribute("data-price")),
                };
            });

            const finalTotal = orderItems.reduce((sum, item) => sum + item.quantity * item.price, 0);

            try {
                const userCompleteBuyRef = collection(db, `users/${currentUser.uid}/completebuy`);
                const querySnapshot = await getDocs(userCompleteBuyRef);

                const deletePromises = querySnapshot.docs.map((docSnapshot) => deleteDoc(docSnapshot.ref));
                await Promise.all(deletePromises);

                const newDocRef = doc(userCompleteBuyRef, `${Date.now()}`);
                const orderData = {
                    items: orderItems,
                    totalPrice: finalTotal,
                    createdAt: new Date().toISOString(),
                };

                await setDoc(newDocRef, orderData);

                window.location.href = "completebuy.html";
            } catch (error) {
                console.error("Error completing purchase:", error);
                alert("Failed to complete the purchase.");
            }
        });
    } else {
        console.warn("Buy button not found in the DOM.");
    }
};

// Function to remove an order from Firestore
const removeOrder = async (orderId) => {
    if (!currentUser) {
        alert("You must be logged in to remove orders.");
        return;
    }

    try {
        await deleteDoc(doc(db, `users/${currentUser.uid}/myOrders`, orderId));
        alert("Order removed successfully!");
    } catch (error) {
        console.error("Error removing order:", error);
        alert("Failed to remove order.");
    }
};
