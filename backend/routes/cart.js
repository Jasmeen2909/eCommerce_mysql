const express = require("express");
const db = require("../db");

const router = express.Router();

// ✅ Add to Cart Route
router.post("/", (req, res) => {
    console.log("Received Cart Request:", req.body); // ✅ Debugging log

    const { user_id, product_id, quantity } = req.body;

    // ✅ Check if all required fields exist
    if (!user_id || !product_id || !quantity) {
        return res.status(400).json({ message: "All fields are required" });
    }

    db.query("SELECT quantity FROM products WHERE id = ?", [product_id], (err, result) => {
        if (err || result.length === 0) {
            console.error("Product Not Found:", err);
            return res.status(404).json({ message: "Product not found" });
        }

        const availableQuantity = result[0].quantity;
        if (quantity > availableQuantity) {
            return res.status(400).json({ message: "Out of stock" });
        }

        const sql = "INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)";
        db.query(sql, [user_id, product_id, quantity], (err, result) => {
            if (err) {
                console.error("MySQL Error:", err);
                return res.status(500).json({ message: "Error adding to cart" });
            }
            res.json({ message: "Added to cart" });
        });
    });
});

router.get("/:user_id", (req, res) => {
    const userId = req.params.user_id;

    db.query(`
        SELECT cart.id, products.name, cart.quantity, products.expiry_date 
        FROM cart 
        JOIN products ON cart.product_id = products.id 
        WHERE cart.user_id = ? AND products.expiry_date >= CURDATE()
    `, [userId], (err, result) => {
        if (err) return res.status(500).json({ message: "Error fetching cart" });
        res.json(result);
    });
});



module.exports = router;

