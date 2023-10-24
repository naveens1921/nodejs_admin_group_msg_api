// routes/group.js

const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/authMiddleware');
const config = require('../config/env');
const Group = require('../models/Group');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const GroupUser = require('../models/GroupUsers');
const User = require('../models/user');
const GroupUsers = require('../models/GroupUsers');
const Message = require('../models/Message');
const MessageLike = require('../models/MessageLike');

// Create a new group
router.post('/create-group', authenticateUser, async (req, res) => {
    const token = req.get('Authorization');
    const decoded = jwt.verify(token, config.JWT_SECRET);
    const userid = decoded.userId;

    const { name, description } = req.body;


    try {
        const group = new Group({ name, description, createdById: userid });
        await group.save();

        res.status(201).json({ message: 'Group has been Created successful', group: group });
    } catch (error) {
        res.status(400).json({ message: 'Group Creation has been failed' });
    }
});

// Delete a group by ID
router.delete('/delete-group/:id', authenticateUser, async (req, res) => {
    const groupId = req.params.id;
    try {
        const deletedGroup = await Group.deleteOne({ _id: groupId });

        if (deletedGroup.deletedCount === 0) {
            return res.status(404).json({ error: 'Group not found' });
        }

        return res.json({ message: 'Group Deleted successfully' });
    } catch (error) {
        return res.status(500).json({ error: 'Group not found' });
    }
});


// Add a user to a group
router.post('/:groupId/addUser/:userId', async (req, res) => {
    const groupId = req.params.groupId;
    const userId = req.params.userId;

    const group = await Group.findById(groupId);
    const user = await User.findById(userId);

    if (!group || !user) {
        return res.status(404).json({ message: 'Group or user not found' });
    }

    try {
        const groupUser = new GroupUsers({ groupId: groupId, userId: userId });
        await groupUser.save();

        res.json({ message: 'User added to the group' });

    } catch (error) {
        res.status(500).json({ error: 'Error adding user to the group' });

    }
});

//Retrieve all users in group
router.get('/users/:groupid', authenticateUser, async (req, res) => {
    try {
        const groupId = req.params.groupid;

        const usergroup = await Group.findById(groupId);

        if (!usergroup) {
            return res.status(404).json({ message: 'Group not found' });
        }

        const groupUsers = await GroupUsers.find({ groupId: groupId }).populate("userId");

        const usersInGroup = groupUsers.map((gu) => gu.userId);
        res.status(200).json({ usersInGroup });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving user profile' });
    }
});

//Find messages in groups and details about sender
router.get('/message/:groupid', authenticateUser, async (req, res) => {
    try {
        const groupId = req.params.groupid;
        const usergroup = await Group.findById(groupId);

        if (!usergroup) {
            return res.status(404).json({ message: 'Group not found' });
        }
        const groupMessages = await Message.find({ groupId: groupId }).populate("senderId");
        const messageIds = groupMessages.map(message => message._id);

        const likes = await MessageLike.find({ messageId: { $in: messageIds } }).populate('userId');

        const messagesWithLikes = groupMessages.map(message => {
            const messageLikes = likes.filter(like => like.messageId.equals(message._id));
            return {
                message,
                likes: messageLikes,
            };
        });

        res.json({ messages: messagesWithLikes });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving user profile' });
    }
});

//search user in group
router.get('/search/:groupid/:userName', authenticateUser, async (req, res) => {
    try {
        const userName = req.params.userName;
        const groupId = req.params.groupid;

        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        const groupUsers = await GroupUsers.find({ groupId: groupId }).populate('userId');

        const usersInGroup = groupUsers
            .filter((gu) => gu.userId.name === userName)
            .map((gu) => gu.userId);

        res.json({ users: usersInGroup });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error searching for user in groups' });
    }
});



module.exports = router;
