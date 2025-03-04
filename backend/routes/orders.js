const express = require("express");
const db = require("../db");

const router = express.Router();

// Checkout (Place Order)
router.post("/checkout/:userId", (req, res) => {
    const userId = req.params.userId;

    db.query(`SELECT SUM(p.price * c.quantity) AS total FROM cart c 
              JOIN products p ON c.product_id = p.id WHERE c.user_id = ?`, 
              [userId], (err, result) => {

        if (err) return res.status(500).json({ message: "Error processing order" });

        const totalAmount = result[0].total;
        db.query(`INSERT INTO orders (user_id, total_amount) VALUES (?, ?)`, 
                [userId, totalAmount], (err, result) => {
            if (err) return res.status(500).json({ message: "Order failed" });

            res.json({ message: "Order placed successfully!", invoice_id: result.insertId });
        });
    });
});

module.exports = router;
