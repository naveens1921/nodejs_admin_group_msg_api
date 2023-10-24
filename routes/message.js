const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const jwt = require('jsonwebtoken');
const config = require('../config/env')
const LikeMessage = require ('../models/MessageLike')
const {authenticateUser} = require ('../middleware/authMiddleware');


// Send a message in a group
router.post('/writemessage/:groupid', authenticateUser, async (req, res) => {
    const token = req.get('Authorization');
    const decoded = jwt.verify(token, config.JWT_SECRET);
    const userid = decoded.userId;
    const groupId = req.params.groupid;

    const { content } = req.body;

    const message = new Message({ groupId:groupId, content, senderId: userid });

    try {
        await message.save();

        res.status(201).json({ message: 'Message has been sent successfully' });
    } catch (error) {
        res.status(400).json({ message: 'Message failed' });
    }
});

// Like a message
router.post('/like/:messageid',authenticateUser, async (req, res) => {
    const token = req.get('Authorization');
    const decoded = jwt.verify(token, config.JWT_SECRET);
    const userid = decoded.userId;
    const messageId= req.params.messageid;

    const likeMessage = new LikeMessage({ messageId:messageId, userId: userid });

    try {
        await likeMessage.save();
        res.status(201).json({ message: 'Message has been Liked successfully' });
    } catch (error) {
        res.status(400).json({ message: 'Group has been Creation failed' });
    }
});

module.exports = router;