import { initializeApp } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-auth.js";
import {
    getFirestore,
    collection,
    query,
    orderBy,
    getDocs,
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
const auth = getAuth(app);

// Variables
const trackingOrdersList = document.getElementById("trackingOrdersList");

// Auth State Check
onAuthStateChanged(auth, async (user) => {
    if (user) {
        await loadTrackingOrders(user.uid);
    } else {
        alert("You must be logged in to track your orders.");
        window.location.href = "login.html";
    }
});

// Load Tracking Orders for Current User
const loadTrackingOrders = async (userId) => {
    try {
        const ordersRef = collection(db, "orders");
        const q = query(ordersRef, orderBy("createdAt", "desc")); // Sort by createdAt descending
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            trackingOrdersList.innerHTML = "<p>No orders found.</p>";
            return;
        }

        trackingOrdersList.innerHTML = ""; // Clear previous data

        querySnapshot.forEach((docSnap) => {
            const orderData = docSnap.data();

            // Only show orders for the current user
            if (orderData.userId === userId) {
                const orderDiv = document.createElement("div");
                orderDiv.classList.add("order-tracking");

                // Determine the current level
                const statusLevels = [
                    "يتم مراجعة الطلب",
                    "تم تاكيد الطلب",
                    "طلبك خرج للتوصيل",
                    "تم تسليم الطلبية",
                ];
                const currentLevelIndex = statusLevels.indexOf(orderData.status || "يتم مراجعة الطلب");

                // Render tracking details
                orderDiv.innerHTML = `
                    <p><strong>تم الطلب في:</strong> ${new Date(orderData.createdAt.seconds * 1000).toLocaleString()}</p>
                    <p><strong>العنوان:</strong> ${orderData.address}</p>
                    <p><strong>المطلوب سداده:</strong> ${orderData.total} جنيه</p>
                    <h4>Items:</h4>
                    <div>
                        ${orderData.items
                            .map(
                                (item) => `
                                <div>
                                    <strong>${item.name}</strong> - ${item.quantity} x ${item.price.toFixed(2)} جنيه
                                </div>
                            `
                            )
                            .join("")}
                    </div>
                    <div class="trackbox">
                        ${statusLevels
                            .map(
                                (level, index) => `
                                <div class="level ${index <= currentLevelIndex ? "active" : ""}">
                                    ${level}
                                </div>
                            `
                            )
                            .join("")}
                    </div>
                `;

                trackingOrdersList.appendChild(orderDiv);
            }
        });
    } catch (error) {
        console.error("Error loading tracking orders:", error);
        trackingOrdersList.innerHTML = "<p>Error loading orders.</p>";
    }
};
