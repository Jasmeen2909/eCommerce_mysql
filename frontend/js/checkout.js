const API_URL = "http://localhost:3000/api";

async function fetchCartSummary() {
    const userId = localStorage.getItem("user_id");

    let response = await fetch(`${API_URL}/cart/${userId}`);
    let cartItems = await response.json();

    let cartContainer = document.getElementById("cart-summary");
    cartContainer.innerHTML = "";

    let subtotal = 0;
    let taxRate = 0.10; // 10% tax
    let deliveryCharge = 50;

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
        cartContainer.innerHTML = "<p>Your cart is empty.</p>";
        document.getElementById("subtotal").textContent = "0";
        document.getElementById("tax").textContent = "0";
        document.getElementById("delivery").textContent = "0";
        document.getElementById("total").textContent = "0";
        return;
    }

    cartItems.forEach(item => {
        if (!item.price) {
            console.error(`Missing price for product: ${item.name}`, item);
            return;
        }

        let itemTotal = item.quantity * item.price;
        subtotal += itemTotal;

        cartContainer.innerHTML += `
            <div class="cart-item">
                <h3>${item.name} (x${item.quantity})</h3>
                <p>Price: ₹${item.price.toFixed(2)} | Total: ₹${itemTotal.toFixed(2)}</p>
            </div>
        `;
    });

    // Calculate totals
    let taxAmount = subtotal * taxRate;
    let totalAmount = subtotal + taxAmount + deliveryCharge;

    document.getElementById("subtotal").textContent = subtotal.toFixed(2);
    document.getElementById("tax").textContent = taxAmount.toFixed(2);
    document.getElementById("delivery").textContent = deliveryCharge.toFixed(2);
    document.getElementById("total").textContent = totalAmount.toFixed(2);
}

async function placeOrder() {
    const userId = localStorage.getItem("user_id");

    let response = await fetch(`http://localhost:3000/api/orders/checkout/${userId}`, {
        method: "POST"
    });

    let result = await response.json();
    
    if (response.ok) {
        showToast(result.message, "success"); // ✅ Ensure showToast() is available
        window.location.href = `invoice.html?orderId=${result.invoice_id}`;
    } else {
        console.error("Checkout Error:", result);
        showToast(result.message || "Checkout failed", "error");
    }
}

// ✅ Add showToast function to `checkout.js`
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



// Load cart summary when checkout page loads
fetchCartSummary();
