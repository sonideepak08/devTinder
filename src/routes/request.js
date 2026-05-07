const express = require('express');
const { userAuth } = require('../middleware/auth');
const requestAuth = express.Router();
const userConnectionRequest = require('../models/connectionRequest');
const User = require('../models/user');

requestAuth.post("/request/send/:status/:userId", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        const fromUserId = loggedInUser._id;
        const toUserId = req.params.userId;
        const status = req.params.status;

        const allowedStatus = ['interested', 'ignored'];
        if (!allowedStatus.includes(status)) {
            throw new Error('Invalid status type');
        }

        const existingConnectionRequest = await userConnectionRequest.findOne({
            $or: [
                { fromUserId, toUserId },
                { fromUserId: toUserId, toUserId: fromUserId }
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
        if (!toUserIdDetails) {
            throw new Error("User not found");
        }

        await connectionRequestDetails.save();
        res.status(200).json({
            message: `${loggedInUser.firstName} showed ${status} status for ${toUserIdDetails.firstName} profile`
        })
    } catch (error) {
        res.status(400).send('ERROR: ' + error.message);
    }
})

requestAuth.post("/request/review/:status/:requestId", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        const { status, requestId } = req.params;

        const allowedStatus = ["accepted", "rejected"];
        if (!allowedStatus.includes(status)) {
            return res.status(400).json({
                message: "status is invalid",
            })
        }


        const connectionRequest = await userConnectionRequest.findOne({
            _id: requestId,
            toUserId: loggedInUser._id,
            status: "interested"
        })
        if (!connectionRequest) {
            return res.status(400).json({
                message: 'connection request not found',
            })
        }
        
        
        const fromUser = await User.findById(connectionRequest.fromUserId);
        if (!fromUser) {
            return res.status(400).json({
                message: 'Sender user not found',
            });
        }
        
        connectionRequest.status = status;
        const data = await connectionRequest.save();

        res.status(200).json({
            message: `${loggedInUser.firstName} ${status} request of ${fromUser.firstName}`,
            data
        })
    } catch (error) {
        res.status(400).send('ERROR: ' + error.message);
    }
})

module.exports = requestAuth;