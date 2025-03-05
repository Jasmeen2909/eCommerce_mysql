const express = require("express");
const db = require("../db");
const router = express.Router();

// ✅ Add to Cart - Updates Quantity Instead of Duplicating
router.post("/", (req, res) => {
    const { user_id, product_id, quantity } = req.body;

    if (!user_id || !product_id || !quantity) {
        return res.status(400).json({ message: "All fields are required" });
    }

    // Check stock availability
    db.query("SELECT quantity FROM products WHERE id = ?", [product_id], (err, result) => {
        if (err || result.length === 0) return res.status(404).json({ message: "Product not found" });

        const availableStock = result[0].quantity;

        // Check if product is already in the cart
        db.query("SELECT quantity FROM cart WHERE user_id = ? AND product_id = ?", 
        [user_id, product_id], (err, cartResult) => {
            if (err) return res.status(500).json({ message: "Error checking cart" });

            if (cartResult.length > 0) {
                let newQuantity = cartResult[0].quantity + quantity;
                if (newQuantity > availableStock) {
                    return res.status(400).json({ message: "Not enough stock available" });
                }

                // ✅ Update existing product quantity in cart
                db.query("UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?", 
                [newQuantity, user_id, product_id], (err, updateResult) => {
                    if (err) return res.status(500).json({ message: "Error updating cart" });
                    res.json({ message: "Cart updated", quantity: newQuantity });
                });
            } else {
                // ✅ Insert new product if it doesn’t exist in the cart
                db.query("INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)", 
                [user_id, product_id, quantity], (err, insertResult) => {
                    if (err) return res.status(500).json({ message: "Error adding to cart" });
                    res.json({ message: "Added to cart", quantity });
                });
            }
        });
    });
});

// ✅ Update Cart Item Quantity (Increase/Decrease)
router.put("/update", (req, res) => {
    const { user_id, product_id, quantity } = req.body;

    if (!user_id || !product_id || quantity === undefined) {
        return res.status(400).json({ message: "All fields are required" });
    }

    // Check available stock
    db.query("SELECT quantity FROM products WHERE id = ?", [product_id], (err, result) => {
        if (err || result.length === 0) return res.status(404).json({ message: "Product not found" });

        const availableStock = result[0].quantity;

        if (quantity > availableStock) {
            return res.status(400).json({ message: "Not enough stock available" });
        }

        // ✅ Update cart quantity
        db.query("UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?", 
        [quantity, user_id, product_id], (err, updateResult) => {
            if (err) return res.status(500).json({ message: "Error updating cart" });
            res.json({ message: "Cart updated", quantity });
        });
    });
});

// ✅ Remove Item from Cart
router.delete("/remove", (req, res) => {
    const { user_id, product_id } = req.body;

    if (!user_id || !product_id) {
        return res.status(400).json({ message: "User ID and Product ID are required" });
    }

    db.query("DELETE FROM cart WHERE user_id = ? AND product_id = ?", 
    [user_id, product_id], (err, result) => {
        if (err) return res.status(500).json({ message: "Error removing from cart" });
        res.json({ message: "Item removed from cart" });
    });
});

module.exports = router;
