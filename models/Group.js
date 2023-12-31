const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    name: String,
    description: String,
    createdById: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    timestamp: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('Group', groupSchema);
