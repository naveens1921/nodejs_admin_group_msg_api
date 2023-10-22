// models/admin.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the admin schema
const adminSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true, default: 'admin' }, // Assign 'admin' as the role
    // Additional admin-specific fields can be added here
});

// Create the Admin model
const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;