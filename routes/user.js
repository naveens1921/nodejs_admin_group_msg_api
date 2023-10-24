const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Admin = require('../models/admin'); // Replace with your admin model
const { isAdmin } = require('../middleware/authMiddleware');
const { authenticateUser } = require('../middleware/authMiddleware');
const bcrypt = require('bcrypt');


//  User Profile
router.get('/profile/:userId', authenticateUser, async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving user profile' });
  }
});


// Create a new user (only available to admins)
router.post('/create-user', isAdmin, async (req, res) => {
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  const hash = await bcrypt.hash(req.body.password, salt);
  req.body.password = hash;
  const { name, email, password, role } = req.body;

  const user = new User({ name, email, password, role });

  try {
    await user.save();
    res.status(201).json({ message: 'User Creation successful', user: user });
  } catch (error) {

    res.status(400).json({ message: 'User Registration failed' });
  }
});


// Update a user by ID
router.put('/edit-user/:id', isAdmin, async (req, res) => {
  const userId = req.params.id;
  const { email, name, role } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (email) {
      user.email = email;
    }
    if (name) {
      user.name = name;
    }
    if (role) {
      user.role = role;
    }
    await user.save();

    return res.json({ message: 'User updated successfully', user });
  } catch (error) {

    return res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Delete a user by ID
router.delete('/delete-user/:id', isAdmin, async (req, res) => {
  const userId = req.params.id;
  try {
    const deletedUser = await User.deleteOne({ _id: userId });

    if (deletedUser.deletedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ message: 'User Deleted successfully' });
  } catch (error) {

    return res.status(500).json({ error: 'Internal Server Error' });
  }
});


module.exports = router;
