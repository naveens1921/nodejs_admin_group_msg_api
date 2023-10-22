const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const config = require('../config/env')
// const { authenticateUser } = require('../middleware/authMiddleware');
// User registration

// Registration route with the authentication middleware
router.post('/register', async (req, res) => {
    // Check the role of the authenticated user
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Permission denied' });
    }
    const { name, email, password, role } = req.body;

    // Create a new user instance
    const user = new User({ name, email, password, role });

    try {
        // Save the user to the database
        await user.save();

        // Registration successful, generate a JWT token
        const token = jwt.sign({ userId: user._id, name: user.name, email: user.email, role: user.role }, config.JWT_SECRET, {
            expiresIn: '5h', // Set the token expiration time
        });

        res.status(201).json({ message: 'Registration successful', token });
    } catch (error) {
        // Handle any registration errors
        res.status(400).json({ message: 'Registration failed' });
    }
});




// User Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find the user by email
        const user = await User.findOne({ email });

        // Check if the user exists and verify the password
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate a JWT token for the authenticated user
        const token = jwt.sign({ userId: user._id }, 'your-secret-key');

        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Login failed' });
    }
});


module.exports = router;
