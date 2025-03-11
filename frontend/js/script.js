const API_URL = "http://localhost:3000/api";

// Admin Login
async function adminLogin() {
    const email = document.getElementById("adminEmail").value;
    const password = document.getElementById("adminPassword").value;

    let response = await fetch(`${API_URL}/auth/admin-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    let result = await response.json();
    if (result.token) {
        localStorage.setItem("admin_token", result.token);
        alert("Admin login successful!");
        window.location.href = "admin.html";
    } else {
        alert(result.message);
    }
}

// User Signup
async function signup() {
    const username = document.getElementById("username").value;
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;

    if (!username || !email || !password) {
        alert("All fields are required!");
        return;
    }

    let response = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password })
    });

    let result = await response.json();
    
    if (response.ok) {
        alert("Signup successful! You can now log in.");
        window.location.href = "login.html";
    } else {
        alert(`Error: ${result.message}`);
    }
}

// User Login
async function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    let response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    let result = await response.json();
    
    if (response.ok) {
        localStorage.setItem("user_id", result.user.id);
        alert("Login successful!");
        window.location.href = "index.html"; 
    } else {
        alert(`Error: ${result.message}`);
    }
}

function showToast(message, type = "info") {
    const toastContainer = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;

    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = "fadeOut 0.5s forwards";
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}


// Fetch and Display Products
async function fetchProducts() {
    const response = await fetch(`${API_URL}/products`);
    const products = await response.json();
    let productList = document.getElementById("product-list");
    productList.innerHTML = "";

    products.forEach(product => {
        let productHTML = `
            <div class="product">
                <h3>${product.name}</h3>
                <p>Price: ₹${product.price}</p>
                <button onclick="addToCart(${product.id})">Add to Cart</button>
            </div>
        `;
        productList.innerHTML += productHTML;
    });
}

// Add to Cart
async function addToCart(productId) {
    const userId = localStorage.getItem("user_id");

    if (!userId) {
        showToast("Please login first.", "error");
        window.location.href = "login.html";
        return;
    }

    const cartData = { user_id: userId, product_id: productId, quantity: 1 };


    let response = await fetch("http://localhost:3000/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cartData)
    });

    let result = await response.json();

    if (response.ok) {
        showToast("Item added to cart!", "success");
        fetchCart(); // Refresh cart after adding
    } else {
        showToast(result.message, "error");
    }
}


async function fetchCart() {
    const userId = localStorage.getItem("user_id");

    if (!userId) {
        alert("Please login first.");
        window.location.href = "login.html";
        return;
    }

    let response = await fetch(`http://localhost:3000/api/cart/${userId}`);
    let cartItems = await response.json();

    let cartContainer = document.getElementById("cart-items");
    cartContainer.innerHTML = "";

    if (cartItems.length === 0) {
        cartContainer.innerHTML = "<p>Your cart is empty.</p>";
        return;
    }

    cartItems.forEach(item => {
        cartContainer.innerHTML += `
            <div class="cart-item">
                <h3>${item.name}</h3>
                <p>Quantity: <button onclick="updateCart(${item.product_id}, ${item.quantity - 1})">-</button> 
                ${item.quantity} 
                <button onclick="updateCart(${item.product_id}, ${item.quantity + 1})">+</button></p>
                <button onclick="removeFromCart(${item.product_id})">Remove</button>
            </div>
        `;
    });
}

// Update Cart Quantity
async function updateCart(productId, newQuantity) {
    if (newQuantity < 1) {
        removeFromCart(productId);
        return;
    }

    const userId = localStorage.getItem("user_id");

    let response = await fetch("http://localhost:3000/api/cart/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, product_id: productId, quantity: newQuantity })
    });

    let result = await response.json();

    if (response.ok) {
        showToast("Cart updated!", "success");
        fetchCart(); // Refresh cart after update
    } else {
        showToast(result.message, "error");
    }
}

// Remove Item from Cart
async function removeFromCart(productId) {
    const userId = localStorage.getItem("user_id");

    let response = await fetch("http://localhost:3000/api/cart/remove", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, product_id: productId })
    });

    let result = await response.json();

    if (response.ok) {
        showToast("Item removed from cart", "success");
        fetchCart(); // Refresh cart after removal
    } else {
        showToast(result.message, "error");
    }
}

fetchProducts();

//  Logout Function
function logout() {
    localStorage.removeItem("user_id"); 
    localStorage.removeItem("admin_token"); 
    alert("You have been logged out.");
    window.location.href = "login.html";
}
