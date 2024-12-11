import { initializeApp } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-firestore.js";
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
const db = getFirestore(app); // Initialize Firestore
const auth = getAuth();

// Extract category from query parameters
const urlParams = new URLSearchParams(window.location.search);
const categoryName = urlParams.get("name");

const itemsContainer = document.getElementById("itemsContainer");

const categoryTitles = document.querySelectorAll(".categoryTitle");
categoryTitles.forEach((title) => {
    if (title.dataset.category === categoryName) {
        title.style.borderBottom = "2px solid #e17c00";
        title.style.color ="#e17c00";
    }
});


document.addEventListener("DOMContentLoaded", () => {
    const categories = document.querySelectorAll(".maincata ul li");

    categories.forEach((category) => {
        category.addEventListener("click", () => {
            const categoryName = category.getAttribute("data-category");
            // Corrected template literal for category redirection
            window.location.href = `category.html?name=${encodeURIComponent(categoryName)}`;
        });
    });
});


// Function to fetch and display items in the category
const fetchData = async () => {
    if (!categoryName) {
        // categoryTitle.textContent = "لم يتم تحديد القسم.";
        return;
    }

    // categoryTitle.textContent = categoryName;

    const itemsQuery = query(
        collection(db, "product_information"),
        where("category", "==", categoryName)
    );

    try {
        const snapshot = await getDocs(itemsQuery);

        if (snapshot.empty) {
            itemsContainer.textContent = "لا يوجد منتجات في هذا القسم.";
            return;
        }

        itemsContainer.innerHTML = ""; // Clear the container

        snapshot.forEach((doc) => {
            const item = doc.data();

            // Create a product card
            const itemElement = document.createElement("div");
            itemElement.innerHTML = `
            <div class="card">
                <div class="imgsec" style="position: relative;">
                    <img src="${item.imageUrl}" alt="${item.name}" style="width: 100%; height: 350px; cursor:pointer;" class="item-image">
                    <div class="infoitem">
                        <h3>${item.name}</h3>
                    </div>
                    <button class="add-to-orders-btn"><i class="fa-solid fa-cart-plus"></i></button>
                </div>
                <div class="bottomsec">
                    <h3>${item.price} جنيه</h3>
                    <button class="buybtn">الشراء الأن</button>
                </div>
            </div>
            `;

            itemsContainer.appendChild(itemElement);

            // Event listener for "View Item" on image click
            itemElement.querySelector(".item-image").addEventListener("click", () => {
                window.location.href = `itempage.html?id=${doc.id}`;
            });

            // Event listener for "Add to Orders"
            itemElement.querySelector(".add-to-orders-btn").addEventListener("click", async () => {
                await addToMyOrders(item);
            });

            // Event listener for "Buy Now"
            itemElement.querySelector(".buybtn").addEventListener("click", async () => {
                await addToMyOrders(item);
                window.location.href = "shopping-car.html";
            });
        });
    } catch (error) {
        console.error("Error fetching items:", error);
        itemsContainer.textContent = "حدث خطأ أثناء تحميل المنتجات.";
    }
};

// Function to add a product to "My Orders"
const addToMyOrders = async (product) => {
    if (!auth.currentUser) {
        alert("يرجى تسجيل الدخول لإضافة المنتج إلى الطلبات.");
        return;
    }

    const userId = auth.currentUser.uid;

    try {
        const docRef = await addDoc(collection(db, `users/${userId}/myOrders`), {
            name: product.name,
            description: product.description,
            quantity: product.quantity,
            price: product.price,
            imageUrl: product.imageUrl,
            productId: product.productId,
            timestamp: new Date(),
        });

        console.log("Order added successfully with ID:", docRef.id);
        alert("تمت إضافة المنتج إلى طلباتك!");
    } catch (error) {
        console.error("Error adding to My Orders:", error);
        alert("فشل في إضافة المنتج إلى الطلبات.");
    }
};

// Authenticate user and fetch data
onAuthStateChanged(auth, (user) => {
    if (user) {
        fetchData(); // Fetch category items once authenticated
    } else {
        window.location.href = "login.html"; // Redirect to login if not authenticated
    }
});
