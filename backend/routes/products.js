const express = require("express");
const db = require("../db");

const router = express.Router();

// Fetch Products (Remove Expired Products)
router.get("/", (req, res) => {
    db.query("SELECT * FROM products", (err, result) => {
        if (err) {
            console.error("Error fetching products:", err);
            return res.status(500).json({ message: "Error fetching products" });
        }

        // ✅ Ensure expiry_date is never null
        result.forEach(product => {
            if (!product.expiry_date) {
                product.expiry_date = "Not Set";
            }
        });

        res.json(result);
    });
});


// Add Product (Admin Only)
router.post("/add", (req, res) => {
    const { name, description, price, quantity } = req.body;

    console.log("Received Product Data:", req.body); // ✅ Debugging log

    if (!name || !description || !price || !quantity) {
        console.error("Validation Failed: Missing Fields", { name, description, price, quantity });
        return res.status(400).json({ message: "All fields are required!" });
    }

    const sql = "INSERT INTO products (name, description, price, quantity) VALUES (?, ?, ?, ?)";

    db.query(sql, [name, description, price, quantity], (err, result) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json({ message: "Error adding product", error: err });
        }
        res.json({ message: "Product added successfully!" });
    });
});






router.delete("/delete/:product_id", (req, res) => {
    const productId = req.params.product_id;

    // Delete product from database
    db.query("DELETE FROM products WHERE id = ?", [productId], (err, result) => {
        if (err) {
            console.error("Error deleting product:", err);
            return res.status(500).json({ message: "Error deleting product" });
        }
        res.json({ message: "Product deleted successfully!" });
    });
});

router.put("/edit/:product_id", (req, res) => {
    const productId = req.params.product_id;
    const { name, price, quantity} = req.body;

    if (!name || !price || !quantity) {
        return res.status(400).json({ message: "All fields are required!" });
    }

    const sql = "UPDATE products SET name = ?, price = ?, quantity = ? WHERE id = ?";
    
    db.query(sql, [name, price, quantity, productId], (err, result) => {
        if (err) {
            console.error("Error updating product:", err);
            return res.status(500).json({ message: "Error updating product", error: err });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.json({ message: "Product updated successfully!" });
    });
});



module.exports = router;
