const API_URL = "http://localhost:3000/api";

async function placeOrder() {
    const userId = localStorage.getItem("user_id");

    let response = await fetch(`${API_URL}/orders/checkout/${userId}`, {
        method: "POST"
    });

    let result = await response.json();
    alert(result.message);

    if (result.invoice_id) {
        window.location.href = `invoice.html?orderId=${result.invoice_id}`;
    }
}
