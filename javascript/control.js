import { initializeApp } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-app.js";
import { getFirestore, addDoc, collection, getDocs,deleteDoc, doc } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyCeP8QdYt80unnvugRl1cp7sWxosMDMjPM",
    authDomain: "zaker-c8619.firebaseapp.com",
    databaseURL: "https://zaker-c8619-default-rtdb.firebaseio.com",
    projectId: "zaker-c8619",
    storageBucket: "zaker-c8619.appspot.com",
    messagingSenderId: "707055371984",
    appId: "1:707055371984:web:1fcb50ea5f727779c200d5",
    measurementId: "G-WS2679LMC8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// Modal Elements
const uploadModal = document.getElementById("uploadModal");
const uploadBtn = document.getElementById("uploadd");
const closeModalBtn = document.getElementById("closeModal");
const submitProductBtn = document.getElementById("submitProduct");

// Form Elements
const productNameInput = document.getElementById("productName");
const productDescriptionInput = document.getElementById("productDescription");
const productQuantityInput = document.getElementById("productQuantity");
const productPriceInput = document.getElementById("productPrice");
const productImageInput = document.getElementById("productImage");

// Show Modal
uploadBtn.addEventListener("click", () => {
    uploadModal.style.display = "flex";
});



// Close Modal
closeModalBtn.addEventListener("click", () => {
    uploadModal.style.display = "none";
});

// Submit Product
submitProductBtn.addEventListener("click", async () => {
    const productName = productNameInput.value;
    const productDescription = productDescriptionInput.value;
    const productQuantity = productQuantityInput.value;
    const productPrice = productPriceInput.value;
    const productImage = productImageInput.files[0];

    if (!productName || !productDescription || !productQuantity || !productPrice || !productImage) {
        alert("Please fill in all fields.");
        return;
    }

    try {
        // Upload Image to Firebase Storage
        const storageRef = ref(storage, `products/${productImage.name}`);
        const snapshot = await uploadBytes(storageRef, productImage);
        const imageURL = await getDownloadURL(storageRef);

        // Save Product Details to Firestore
        const docRef = await addDoc(collection(db, "products"), {
            name: productName,
            description: productDescription,
            quantity: parseInt(productQuantity),
            price: parseInt(productPrice),
            imageUrl: imageURL,
            timestamp: new Date()
        });

        alert("Product uploaded successfully!");
        console.log("Document written with ID: ", docRef.id);

        // Close Modal and Reset Form
        uploadModal.style.display = "none";
        productNameInput.value = "";
        productDescriptionInput.value = "";
        productQuantityInput.value = "1";
        productImageInput.value = "";
        fetchProducts(); // Refresh the product list
    } catch (error) {
        console.error("Error uploading product:", error);
        alert("Failed to upload product.");
    }
});

// Fetch and display products
let products = [];
let currentIndex = 0;
let autoScrollInterval;

// Fetch products from Firestore
const fetchProducts = async () => {
    const productContainer = document.getElementById("productContainer");
    try {
        // Fetch products from Firestore
        const querySnapshot = await getDocs(collection(db, "products"));
        products = [];
        querySnapshot.forEach((doc) => {
            products.push(doc.data());
        });

        if (products.length > 0) {
            displayProduct(currentIndex);
            startAutoScroll(); // Start auto-scrolling after fetching products
        } else {
            // productContainer.innerHTML = "<p>No products found.</p>";
        }
    } catch (error) {
        console.error("Error fetching products:", error);
        productContainer.innerHTML = "<p>Error loading products.</p>";
    }
};

// Function to display the current product
// Function to display the current product
const displayProduct = (index) => {
    const product = products[index];
    const productList = document.getElementById("productList");

    // Create a new product card
    const productCard = document.createElement("div");
    productCard.classList.add("product-card");
    productCard.innerHTML = `
        <img src="${product.imageUrl}" alt="${product.name}" />
        <div class="descripe">
        <h1 class="font">${product.name}</h1>
        <p class="font">${product.description}</p>
        <p><strong>Quantity Available:</strong> ${product.quantity}</p>
        <p><strong>Price:</strong> ${product.price}</p>
        <button class="remove-btn  delete"><i class="fa-solid fa-remove"></i></button>
        </div>
    `;

    // Clear the product list (if needed) and append the new product card
    productList.innerHTML = ''; // Optional: clear the product list before adding new content
    productList.appendChild(productCard); // Append the new product card
    productCard.querySelector(".remove-btn").addEventListener("click", async () => {
        await removeProduct(index);
    });
};



const removeProduct = async (index) => {
    const productContainer = document.getElementById("productContainer");
    try {
        const product = products[index];

        // Find the product document in Firestore
        const querySnapshot = await getDocs(collection(db, "products"));
        let docId = null;
        querySnapshot.forEach((doc) => {
            if (doc.data().name === product.name && doc.data().imageUrl === product.imageUrl) {
                docId = doc.id;
            }
        });

        if (!docId) {
            alert("Product not found in database!");
            return;
        }

        // Delete the product document
        await deleteDoc(doc(db, "products", docId));
        alert("Product removed successfully!");

        // Remove product from the local array
        products.splice(index, 1);

        // Handle the case where there are no products left
        if (products.length === 0) {
            productContainer.innerHTML = "<p>No products available.</p>";
            return;
        }

        // Update the currentIndex and display the next product
        currentIndex = currentIndex % products.length; // Adjust index to loop if needed
        displayProduct(currentIndex);
    } catch (error) {
        console.error("Error removing product:", error);
        alert("Failed to remove product.");
    }
};

const addToMyOrders = async (index) => {
    const product = products[index];

    try {
        // Add the product to the "myOrders" collection in Firestore
        const docRef = await addDoc(collection(db, "myOrders"), {
            name: product.name,
            description: product.description,
            quantity: product.quantity,
            price: product.price,
            imageUrl: product.imageUrl,
            timestamp: new Date() // Optional: track when the order was placed
        });

        alert("Product added to My Orders!");
        console.log("Order Document ID:", docRef.id);
    } catch (error) {
        console.error("Error adding to My Orders:", error);
        alert("Failed to add product to My Orders.");
    }
};



// Function to start auto-scrolling
const startAutoScroll = () => {
    autoScrollInterval = setInterval(() => {
        currentIndex = (currentIndex + 1) % products.length; // Loop back to the first product
        displayProduct(currentIndex);
    }, 4000); // Change product every 3 seconds
};

// Function to stop auto-scrolling
const stopAutoScroll = () => {
    clearInterval(autoScrollInterval);
};

// Event listeners for navigation
document.getElementById("nextBtn").addEventListener("click", () => {
    stopAutoScroll();
    if (currentIndex < products.length - 1) {
        currentIndex++;
        displayProduct(currentIndex);
    } else {
        alert("This is the last product!");
    }
});

// Initialize
fetchProducts();
