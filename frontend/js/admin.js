const API_URL = "http://localhost:3000/api";

// ✅ Check if Admin is Logged In
if (!localStorage.getItem("admin_token")) {
    alert("Unauthorized Access! Please log in as Admin.");
    window.location.href = "login.html";
}

// ✅ Add Product
async function addProduct() {
    const name = document.getElementById("name").value;
    const description = document.getElementById("description").value;
    const price = document.getElementById("price").value;
    const quantity = document.getElementById("quantity").value;
    const expiry = document.getElementById("expiry").value;

    let response = await fetch(`${API_URL}/products/add`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("admin_token")}` 
        },
        body: JSON.stringify({ name, description, price, quantity, expiry_date: expiry })
    });

    let result = await response.json();
    alert(result.message);
    fetchProducts();  // Refresh product list
}

// ✅ Fetch Products
async function fetchProducts() {
    let response = await fetch(`${API_URL}/products`);
    let products = await response.json();
    let productList = document.getElementById("product-list");
    productList.innerHTML = "";

    products.forEach(product => {
        productList.innerHTML += `
            <div class="product">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <p>Price: ₹${product.price}</p>
                <p>Stock: ${product.quantity}</p>
                <p>Expires: ${product.expiry_date}</p>
            </div>
        `;
    });
}

// ✅ Fetch Orders
async function fetchOrders() {
    let response = await fetch(`${API_URL}/orders`);
    let orders = await response.json();
    let orderList = document.getElementById("order-list");
    orderList.innerHTML = "";

    orders.forEach(order => {
        orderList.innerHTML += `
            <div class="order">
                <h3>Order #${order.id}</h3>
                <p>User ID: ${order.user_id}</p>
                <p>Total Amount: ₹${order.total_amount}</p>
                <p>Status: ${order.status}</p>
                <button onclick="completeOrder(${order.id})">Mark as Completed</button>
            </div>
        `;
    });
}

//  Mark Order as Completed
async function completeOrder(orderId) {
    await fetch(`${API_URL}/orders/complete/${orderId}`, { 
        method: "PUT",
        headers: { "Authorization": `Bearer ${localStorage.getItem("admin_token")}` }
    });

    fetchOrders(); // Refresh orders list
}

//  Logout
function logout() {
    localStorage.removeItem("admin_token");
    window.location.href = "login.html";
}

fetchProducts();
fetchOrders();
