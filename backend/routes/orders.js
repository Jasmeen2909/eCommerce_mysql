const express = require("express");
const db = require("../db");

const router = express.Router();

// ✅ Checkout (Place Order with Tax & Delivery)
router.post("/checkout/:userId", (req, res) => {
    const userId = req.params.userId;
    const taxRate = 0.10;
    const deliveryCharge = 50;

    db.query(`SELECT c.product_id, c.quantity, p.price, p.name, p.expiry_date FROM cart c 
              JOIN products p ON c.product_id = p.id WHERE c.user_id = ?`, 
              [userId], (err, cartItems) => {

        if (err) {
            console.error("Error fetching cart:", err);
            return res.status(500).json({ message: "Error fetching cart", error: err });
        }

        // ✅ Prevent orders with expired items
        const expiredItems = cartItems.filter(item => new Date(item.expiry_date) < new Date());
        if (expiredItems.length > 0) {
            return res.status(400).json({ message: "Some products have expired and cannot be ordered." });
        }

        let subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
        let taxAmount = subtotal * taxRate;
        let totalAmount = subtotal + taxAmount + deliveryCharge;

        db.query(`INSERT INTO orders (user_id, subtotal, total_amount, tax, delivery_charge) VALUES (?, ?, ?, ?, ?)`, 
                [userId, subtotal, totalAmount, taxAmount, deliveryCharge], (err, result) => {

            if (err) {
                console.error("Order Insert Error:", err);
                return res.status(500).json({ message: "Order failed", error: err });
            }

            const orderId = result.insertId;

            let orderItemsSql = "INSERT INTO order_items (order_id, product_id, quantity, price, name) VALUES ?";
            let orderItemsValues = cartItems.map(item => [orderId, item.product_id, item.quantity, item.price, item.name]);

            db.query(orderItemsSql, [orderItemsValues], (err, orderItemResult) => {
                if (err) {
                    console.error("Order Items Insert Error:", err);
                    return res.status(500).json({ message: "Error saving order items", error: err });
                }

                db.query("DELETE FROM cart WHERE user_id = ?", [userId], (err, deleteResult) => {
                    if (err) {
                        console.error("Error clearing cart:", err);
                        return res.status(500).json({ message: "Error clearing cart", error: err });
                    }

                    res.json({ message: "Order placed successfully!", invoice_id: orderId });
                });
            });
        });
    });
});


// ✅ Get Invoice Details by Order ID
router.get("/invoice/:orderId", (req, res) => {
    const orderId = req.params.orderId;

    db.query(`SELECT o.id AS order_id, o.user_id, o.total_amount, o.tax, o.delivery_charge, o.subtotal, o.order_date,
                     oi.product_id, oi.name, oi.quantity, oi.price 
              FROM orders o 
              JOIN order_items oi ON o.id = oi.order_id 
              WHERE o.id = ?`, [orderId], (err, result) => {

        if (err) return res.status(500).json({ message: "Error fetching invoice" });

        if (result.length === 0) {
            return res.status(404).json({ message: "Invoice not found" });
        }

        let orderDetails = {
            order_id: result[0].order_id,
            user_id: result[0].user_id,
            subtotal: result[0].subtotal,
            tax: result[0].tax,
            delivery_charge: result[0].delivery_charge,
            total_amount: result[0].total_amount,
            order_date: result[0].order_date,
            items: result.map(item => ({
                product_id: item.product_id,
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                total_price: item.quantity * item.price
            }))
        };

        res.json(orderDetails);
    });
});

router.get("/all", (req, res) => {
    db.query(`SELECT o.id AS order_id, o.user_id, o.total_amount, o.status, o.order_date, 
                     GROUP_CONCAT(oi.name, ' (x', oi.quantity, ')') AS items 
              FROM orders o 
              JOIN order_items oi ON o.id = oi.order_id 
              GROUP BY o.id 
              ORDER BY o.order_date DESC`, 
    (err, result) => {
        if (err) {
            console.error("Error fetching orders:", err);
            return res.status(500).json({ message: "Error fetching orders" });
        }
        res.json(result);
    });
});


module.exports = router;
