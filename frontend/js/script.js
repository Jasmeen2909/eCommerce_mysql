const API_URL = "http://localhost:3000/api";

// ✅ Admin Login
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
        window.location.href = "index.html"; // Redirect to homepage
    } else {
        alert(`Error: ${result.message}`);
    }
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
                <p>Stock: ${product.quantity}</p>
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
        alert("Please login first.");
        window.location.href = "login.html";
        return;
    }

    const cartData = { user_id: userId, product_id: productId, quantity: 1 };
    console.log("Sending Cart Data:", cartData); // ✅ Debugging log

    let response = await fetch("http://localhost:3000/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cartData)
    });

    let result = await response.json();
    
    if (response.ok) {
        alert("Item added to cart!");
        fetchCart(); // ✅ Refresh cart items after adding
    } else {
        alert(`Error: ${result.message}`);
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
                <p>Quantity: ${item.quantity}</p>
                <p>Expires on: ${item.expiry_date}</p>
            </div>
        `;
    });
}


fetchProducts();


//  Logout Function
function logout() {
    localStorage.removeItem("user_id"); 
    localStorage.removeItem("admin_token"); 
    alert("You have been logged out.");
    window.location.href = "login.html";
}
