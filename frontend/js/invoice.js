const API_URL = "http://localhost:3000/api";

async function fetchInvoice() {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get("orderId");

    let response = await fetch(`${API_URL}/orders/invoice/${orderId}`);
    let invoice = await response.json();

    if (!response.ok) {
        document.getElementById("invoice-details").innerHTML = `<p>Error: ${invoice.message}</p>`;
        return;
    }

    document.getElementById("invoice-details").innerHTML = `
        <h2>Invoice #${invoice.order_id}</h2>
        <p>Subtotal: ₹${invoice.subtotal.toFixed(2)}</p>
        <p>Tax (10%): ₹${invoice.tax.toFixed(2)}</p>
        <p>Delivery Charges: ₹${invoice.delivery_charge.toFixed(2)}</p>
        <h3>Total Payable: ₹${invoice.total_amount.toFixed(2)}</h3>
        <p>Order Date: ${new Date(invoice.order_date).toLocaleString()}</p>
        <h3>Order Items</h3>
        ${invoice.items.map(item => `
            <p>${item.name} (x${item.quantity}) - ₹${item.price} each = ₹${item.total_price}</p>
        `).join("")}
    `;
}

fetchInvoice();
