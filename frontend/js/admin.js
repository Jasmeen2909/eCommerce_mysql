const API_URL = "http://localhost:3000/api";

// Check if Admin is Logged In
if (!localStorage.getItem("admin_token")) {
    alert("Unauthorized Access! Please log in as Admin.");
    window.location.href = "login.html";
}

// Add Product
async function addProduct() {
    const name = document.getElementById("name").value.trim();
    const description = document.getElementById("description").value.trim();
    const price = document.getElementById("price").value.trim();
    const quantity = document.getElementById("quantity").value.trim();

    if (!name || !description || !price || !quantity) {
        showToast("All fields are required!", "error");
        return;
    }

    let response = await fetch(`${API_URL}/products/add`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("admin_token")}` 
        },
        body: JSON.stringify({ name, description, price, quantity })
    });

    let result = await response.json();
    showToast(result.message, response.ok ? "success" : "error");
    fetchProducts();  // Refresh product list
}

// Fetch Products
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
                <button onclick="openEditProduct(${product.id}, '${product.name}', '${product.description}', ${product.price}, ${product.quantity})">Edit</button>
                <button onclick="deleteProduct(${product.id})">Delete</button>
            </div>
        `;
    });
}

// Open Edit Product Modal
function openEditProduct(id, name, description, price, quantity) {
    document.getElementById("editProductId").value = id;
    document.getElementById("editName").value = name;
    document.getElementById("editDesc").value = description;
    document.getElementById("editPrice").value = price;
    document.getElementById("editQuantity").value = quantity;

    document.getElementById("editProductModal").style.display = "flex";
}

// Close Modal
function closeModal(modalId) {
    document.getElementById(modalId).style.display = "none";
}

// Save Edited Product
async function saveEditedProduct() {
    const id = document.getElementById("editProductId").value;
    const name = document.getElementById("editName").value;
    const description = document.getElementById("editDesc").value;
    const price = document.getElementById("editPrice").value;
    const quantity = document.getElementById("editQuantity").value;

    let response = await fetch(`${API_URL}/products/edit/${id}`, {
        method: "PUT",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("admin_token")}` 
        },
        body: JSON.stringify({ name, description, price, quantity })
    });

    let result = await response.json();
    showToast(result.message, response.ok ? "success" : "error");
    closeModal("editProductModal");
    fetchProducts(); // Refresh product list
}

// Delete Product
async function deleteProduct(productId) {
    if (!confirm("Are you sure you want to delete this product?")) return;

    let response = await fetch(`${API_URL}/products/delete/${productId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${localStorage.getItem("admin_token")}` }
    });

    let result = await response.json();
    showToast(result.message, response.ok ? "success" : "error");
    fetchProducts(); // Refresh product list
}

// Fetch Orders for Admin Panel
async function fetchOrders() {
    let response = await fetch(`${API_URL}/orders/all`);
    let orders = await response.json();

    let ordersContainer = document.getElementById("orders-list");

    if (!ordersContainer) {
        console.error("Error: #orders-list element not found!");
        return;
    }

    ordersContainer.innerHTML = "";

    if (!orders || orders.length === 0) {
        ordersContainer.innerHTML = "<p>No orders found.</p>";
        return;
    }

    orders.forEach(order => {
        let itemsText = order.items ? order.items : "No items";

        let orderElement = document.createElement("div");
        orderElement.classList.add("order");
        orderElement.innerHTML = `
            <h3>Order #${order.order_id} - ₹${order.total_amount}</h3>
            <p><strong>User ID:</strong> ${order.user_id}</p>
            <p><strong>Status:</strong> ${order.status}</p>
            <p><strong>Order Date:</strong> ${new Date(order.order_date).toLocaleString()}</p>
            <p><strong>Items:</strong> ${itemsText}</p>
            ${order.status === "pending" ? `<button onclick="completeOrder(${order.order_id})">Mark as Completed</button>` : ""}
        `;

        ordersContainer.appendChild(orderElement);
    });
}

// Mark Order as Completed
async function completeOrder(orderId) {
    let response = await fetch(`${API_URL}/orders/complete/${orderId}`, { 
        method: "PUT",
        headers: { "Authorization": `Bearer ${localStorage.getItem("admin_token")}` }
    });

    let result = await response.json();
    showToast(result.message, response.ok ? "success" : "error");
    fetchOrders(); // Refresh orders list
}

// Logout
function logout() {
    localStorage.removeItem("admin_token");
    window.location.href = "login.html";
}

// Toast Notification Function
function showToast(message, type = "info") {
    const toastContainer = document.getElementById("toast-container");
    if (!toastContainer) {
        console.error("Toast container not found!");
        return;
    }

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;

    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = "fadeOut 0.5s forwards";
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

// Initial Data Load
fetchProducts();
fetchOrders();
