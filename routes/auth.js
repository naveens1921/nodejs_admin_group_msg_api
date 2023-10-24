const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const config = require('../config/env')

// User registration
router.post('/register', async (req, res) => {

    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(req.body.password, salt);
    req.body.password = hash;
    const { name, email, password, role } = req.body;

    const user = new User({ name, email, password, role });

    try {
        await user.save();
        const token = jwt.sign({ userId: user._id, name: user.name, email: user.email, role: user.role }, config.JWT_SECRET, {
            expiresIn: '5h',
        });

        res.status(200).json({ message: 'Registration successful', token, user: user });
    } catch (error) {
        res.status(400).json({ message: 'Registration failed' });
    }
});


const activeTokens = new Set();


// User Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ userId: user._id, email: user.email, role: user.role }, config.JWT_SECRET);
        activeTokens.add(token);
        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Login failed' });
    }
});


router.post('/logout', (req, res) => {
    const token = req.get('Authorization');

    if (!token) {
        return res.status(400).json({ message: 'Token is required for logout' });
    }
    if (token) {
        activeTokens.delete(token);
    }

    res.json({ message: 'Logout successful' });
});

module.exports = { router, activeTokens };
