const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");

const router = express.Router();
const SECRET_KEY = "ecommerce_secret";

// User Signup
router.post("/signup", async (req, res) => {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";

    db.query(sql, [username, email, hashedPassword], (err, result) => {
        if (err) return res.status(500).json({ message: "Error registering user" });
        res.json({ message: "User registered successfully" });
    });
});


// User Login
router.post("/login", (req, res) => {
    const { email, password } = req.body;

    db.query("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {
        if (err || result.length === 0) return res.status(401).json({ message: "Invalid credentials" });

        const user = result[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { expiresIn: "1h" });
        res.json({ token, user });
    });
});

// Admin Fixed Login
router.post("/admin-login", (req, res) => {
    const { email, password } = req.body;
    
    if (email === "admin@gmail.com" && password === "admin123") {
        const token = jwt.sign({ role: "admin" }, SECRET_KEY, { expiresIn: "1h" });
        return res.json({ token, role: "admin" });
    } else {
        return res.status(401).json({ message: "Unauthorized" });
    }
});

module.exports = router;
