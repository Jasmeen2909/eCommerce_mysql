async function fetchInvoice() {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get("orderId");

    let response = await fetch(`http://localhost:3000/api/orders/invoice/${orderId}`);
    let invoice = await response.json();

    document.getElementById("invoice-details").innerHTML = `
        <h2>Invoice #${invoice.id}</h2>
        <p>Total Amount: ₹${invoice.total_amount}</p>
        <p>Order Date: ${invoice.order_date}</p>
    `;
}

fetchInvoice();
