const express = require('express');
const { userAuth } = require('../middleware/auth');
const requestAuth = express.Router();
const userConnectionRequest = require('../models/connectionRequest');
const User = require('../models/user');

requestAuth.post("/sendConnectionRequest/:status/:userId", userAuth, async (req, res) => {
    try {
        const user = req.user;
        const fromUserId = user._id;
        const toUserId = req.params.userId;
        const status = req.params.status;

        const allowedStatus = ['interested', 'ignored'];
        if (!allowedStatus.includes(status)) {
            throw new Error('Invalid status type');
        }

        const existingConnectionRequest = await userConnectionRequest.findOne({
            $or: [
                { fromUserId, toUserId},
                { fromUserId: toUserId, toUserId: fromUserId}
            ]
        })

        if (existingConnectionRequest) {
            throw new Error('connection already exists');
        }

        const connectionRequestDetails = new userConnectionRequest({
            fromUserId,
            toUserId,
            status
        })

        const toUserIdDetails = await User.findById(toUserId);

        await connectionRequestDetails.save();
        res.status(200).json({
            message: `${user.firstName} showed ${status} status for ${toUserIdDetails.firstName} profile`
        })
    } catch (error) {
        res.status(400).send('ERROR: ' + error.message);
    }
})

module.exports = requestAuth;