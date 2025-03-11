const express = require("express");
const db = require("../db");
const router = express.Router();

// Update Cart Item Quantity (Increase/Decrease)
router.put("/update", (req, res) => {
    const { user_id, product_id, quantity } = req.body;

    if (!user_id || !product_id || quantity === undefined) {
        return res.status(400).json({ message: "All fields are required" });
    }

    db.query("SELECT quantity FROM products WHERE id = ?", [product_id], (err, result) => {
        if (err || result.length === 0) return res.status(404).json({ message: "Product not found" });

        const availableStock = result[0].quantity;

        if (quantity > availableStock) {
            return res.status(400).json({ message: "Not enough stock available" });
        }

        // Update cart quantity
        db.query("UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?", 
        [quantity, user_id, product_id], (err, updateResult) => {
            if (err) return res.status(500).json({ message: "Error updating cart" });
            res.json({ message: "Cart updated", quantity });
        });
    });
});

// Remove Item from Cart
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


router.get("/:user_id", (req, res) => {
    const userId = req.params.user_id;

    const sql = `
        SELECT cart.id, cart.product_id, products.name, cart.quantity, products.price
        FROM cart 
        JOIN products ON cart.product_id = products.id 
        WHERE cart.user_id = ?
    `;

    db.query(sql, [userId], (err, result) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json({ message: "Error fetching cart", error: err });
        }
        
        res.json(result);
    });
});


router.post("/", (req, res) => {
    const { user_id, product_id, quantity } = req.body;

    if (!user_id || !product_id || !quantity) {
        return res.status(400).json({ message: "All fields are required" });
    }

    // Check if product exists in stock
    db.query("SELECT quantity FROM products WHERE id = ?", [product_id], (err, result) => {
        if (err || result.length === 0) return res.status(404).json({ message: "Product not found" });

        const availableStock = result[0].quantity;

        // Check if product is already in cart
        db.query("SELECT quantity FROM cart WHERE user_id = ? AND product_id = ?", 
        [user_id, product_id], (err, cartResult) => {
            if (err) return res.status(500).json({ message: "Error checking cart" });

            if (cartResult.length > 0) {
                let newQuantity = cartResult[0].quantity + quantity;
                if (newQuantity > availableStock) {
                    return res.status(400).json({ message: "Not enough stock available" });
                }

                // Update existing cart quantity
                db.query("UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?", 
                [newQuantity, user_id, product_id], (err, updateResult) => {
                    if (err) return res.status(500).json({ message: "Error updating cart" });
                    res.json({ message: "Cart updated", quantity: newQuantity });
                });
            } else {
                // Insert new item into cart
                db.query("INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)", 
                [user_id, product_id, quantity], (err, insertResult) => {
                    if (err) return res.status(500).json({ message: "Error adding to cart" });
                    res.json({ message: "Added to cart", quantity });
                });
            }
        });
    });
});

// Auto-remove expired products from cart
// router.get("/cleanup", (req, res) => {
//     db.query(`
//         DELETE FROM cart 
//         WHERE product_id IN (
//             SELECT id FROM products WHERE TIMESTAMPDIFF(MINUTE, created_at, NOW()) >= expiry_duration
//         )`, 
//     (err, result) => {
//         if (err) {
//             console.error("Error removing expired products:", err);
//             return res.status(500).json({ message: "Error cleaning cart" });
//         }
//         res.json({ message: "Expired products removed from cart!" });
//     });
// });



module.exports = router;
