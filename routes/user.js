const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/user');
const Admin = require('../models/admin'); // Replace with your admin model
const { requireRole } = require('../middleware/authMiddleware');

// Protected route: User Profile
router.get('/profile', authMiddleware('user'), async (req, res) => {
    try {
        // Access user data from req.user (decoded JWT payload)
        const userId = req.user.userId;

        // Retrieve the user's profile information
        const user = await User.findById(userId).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving user profile' });
    }
});


// Create a new user (only available to admins)
router.post('/create', requireRole('admin'), (req, res) => {
    // Your logic for creating a new user here
    // Only users with the 'admin' role can access this route
});

// Edit an existing user
router.put('/edit/:id', requireRole('admin'), (req, res) => {
    // Your logic for editing a user by ID here
    // Only users with the 'admin' role can access this route
});

// Delete a user by ID
router.delete('/delete/:id', requireRole('admin'), (req, res) => {
    // Your logic for deleting a user by ID here
    // Only users with the 'admin' role can access this route
});


// Protected route: Admin Dashboard
router.get('/admin', requireRole('admin'), async (req, res) => {
    try {
        // Access user data from req.user (decoded JWT payload)
        // Assuming you have an Admin model
        const adminId = req.user.userId;

        // Fetch admin-specific data from the database
        const adminData = await Admin.findById(adminId);

        if (!adminData) {
            return res.status(404).json({ message: 'Admin data not found' });
        }

        // Implement any additional logic needed for the admin dashboard

        res.status(200).json({ adminData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error accessing admin dashboard' });
    }
});


module.exports = router;
