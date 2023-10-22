// models/User.js

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    // Add other user-related fields as needed
});

module.exports = mongoose.model('User', userSchema);