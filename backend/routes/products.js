const express = require("express");
const db = require("../db");

const router = express.Router();

// Fetch Products (Remove Expired Products)
router.get("/", (req, res) => {
    const sql = "DELETE FROM products WHERE expiry_date < CURDATE()";
    db.query(sql, () => {
        db.query("SELECT * FROM products", (err, result) => {
            if (err) return res.status(500).json({ message: "Error fetching products" });
            res.json(result);
        });
    });
});

// Add Product (Admin Only)
router.post("/add", (req, res) => {
    const { name, description, price, quantity, expiry_date } = req.body;
    const sql = "INSERT INTO products (name, description, price, quantity, expiry_date) VALUES (?, ?, ?, ?, ?)";
    
    db.query(sql, [name, description, price, quantity, expiry_date], (err, result) => {
        if (err) return res.status(400).json({ message: "Error adding product" });
        res.json({ message: "Product added successfully" });
    });
});

module.exports = router;
