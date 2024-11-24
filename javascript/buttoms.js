import { initializeApp, getApp, getApps } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, collection, query, where, getDocs, limit } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyCeP8QdYt80unnvugRl1cp7sWxosMDMjPM",
    authDomain: "zaker-c8619.firebaseapp.com",
    projectId: "zaker-c8619",
    storageBucket: "zaker-c8619.appspot.com",
    messagingSenderId: "707055371984",
    appId: "1:707055371984:web:1fcb50ea5f727779c200d5",
    measurementId: "G-WS2679LMC8"
};

// Initialize Firebase only if it has not been initialized yet
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// Select elements by ID
const home = document.getElementById("homepagebtn");
const carshop = document.getElementById("viewOrdersBtn");
const profile = document.getElementById("profilebtn");
const logoutButton = document.getElementById('logoutButton');
const profilePicPreview = document.getElementById("preview");
const searchInput = document.getElementById("searchInput");
const searchResultsContainer = document.getElementById("searchResults");

// Search variables
let searchTimeout;
let cachedSearchTerm = "";
let cachedResults = [];

// Navigation buttons for homepage, shopping cart, and profile
if (home) {
    home.addEventListener("click", function () {
        window.location.href = "index.html";
    });
}

if (carshop) {
    carshop.addEventListener("click", function () {
        window.location.href = "shopping-car.html"; // Ensure .html if needed
    });
}

if (profile) {
    profile.addEventListener("click", function () {
        window.location.href = "myacount.html";
    });
}

// Fetch user data and set the profile picture
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // Get user document reference from Firestore
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnapshot = await getDoc(userDocRef);

        if (userDocSnapshot.exists()) {
            const userData = userDocSnapshot.data();
            
            // Set the profile picture if it exists
            if (userData.profilePicture) {
                profilePicPreview.src = userData.profilePicture; // Update the profile picture
            } else {
                console.warn("No profile picture found for the user.");
            }
        } else {
            console.warn("User data not found.");
        }
    } else {
        console.warn("User is not authenticated.");
        window.location.href = "login.html"; // Redirect to login if not authenticated
    }
});

searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);

    const searchTerm = e.target.value.toLowerCase().trim();

    if (searchTerm === cachedSearchTerm) {
        displaySearchResults(cachedResults);
        return;
    }

    searchTimeout = setTimeout(async () => {
        if (searchTerm === "") {
            searchResultsContainer.innerHTML = ''; // Clear results if search term is empty
            return;
        }

        // Query both collections: 'product_information' and 'products'
        const productCollectionRefs = [
            collection(db, "product_information"),
            collection(db, "products")
        ];

        let searchResults = [];

        for (let collectionRef of productCollectionRefs) {
            const q = query(
                collectionRef,
                where("name", ">=", searchTerm),
                where("name", "<=", searchTerm + '\uf8ff'),
                limit(10) // Limit to 10 results to improve performance
            );
            const querySnapshot = await getDocs(q);

            querySnapshot.forEach((doc) => {
                // Include the document's ID explicitly
                searchResults.push({
                    id: doc.id, // Add the document ID
                    ...doc.data() // Spread the document data
                });
            });
        }

        // Cache results for the current search term
        cachedSearchTerm = searchTerm;
        cachedResults = searchResults;

        // Display search results
        displaySearchResults(searchResults);
    }, 1); // Adjust debounce delay as needed
});

// Category navigation (Fixed string interpolation)


function displaySearchResults(results) {
    searchResultsContainer.innerHTML = ''; // Clear previous results

    if (results.length === 0) {
        searchResultsContainer.innerHTML = '<p>No results found</p>';
        return;
    }

    results.forEach(result => {
        const resultDiv = document.createElement('div');
        resultDiv.classList.add('search-result');

        resultDiv.addEventListener('click', () => {
            // Redirect to the details page with the item's ID
            window.location.href = `itempage.html?id=${result.id}`;
        });

        resultDiv.innerHTML = `
            <div class="resultinfo">
                <h3>${result.name}</h3>
                <p>${result.description}</p>
            </div>
            <img class="resultimg" src="${result.imageUrl}" alt="${result.name}">
        `;

        searchResultsContainer.appendChild(resultDiv);
    });
}



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

// Logout function
if (logoutButton) {
    logoutButton.addEventListener('click', () => {
        signOut(auth)
            .then(() => {
                console.log("User logged out");
                window.location.href = "login.html"; // Redirect to login page
            })
            .catch((error) => {
                console.error("Error during logout: ", error);
                alert("An error occurred while logging out. Please try again.");
            });
    });
} else {
    console.warn("Logout button not found in the DOM.");
}

// Authentication state listener to ensure user is logged in before accessing certain pages
onAuthStateChanged(auth, (user) => {
    if (!user) {
        console.warn("User not logged in, redirecting to login page.");
        window.location.href = "login.html"; // Redirect to login if not authenticated
    }
});
