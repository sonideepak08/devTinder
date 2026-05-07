const express = require('express');
const { userAuth } = require('../middleware/auth');
const userConnectionRequest = require('../models/connectionRequest');
const User = require('../models/user');

const userRoute = express.Router();

const USER_SAFE_DATA = "firstName lastName age gender skils pictureUrl about";

// Get all pending connections for loggedIn user
userRoute.get("/user/request/received", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        const requestList = await userConnectionRequest.find({
            toUserId: loggedInUser,
            status: "interested"
        }).populate("fromUserId", USER_SAFE_DATA)
        // }).populate("fromUserId", ["firstName", "lastName", "age", "gender", "skils", "pictureUrl", "about"])
        res.status(200).json({
            message: 'fetched request details successfully',
            data: requestList
        })
    } catch (error) {
        res.status(400).send('ERROR: ' + error.message);
    }
})

userRoute.get("/user/connections", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;

        const connectionResponse = await userConnectionRequest.find({
            $or: [
                { fromUserId: loggedInUser._id, status: 'accepted' },
                { toUserId: loggedInUser._id, status: 'accepted' },
            ],
        }).populate("fromUserId", USER_SAFE_DATA)
            .populate("toUserId", USER_SAFE_DATA);

        const data = connectionResponse.map((resp) => {
            if (loggedInUser._id.toString() === resp?.fromUserId.toString()) {
                return resp?.toUserId;
            }
            return resp?.fromUserId;
        })
        res.status(200).json({
            message: "connections fetched successfully",
            data
        })
    } catch (error) {
        res.status(400).send('ERROR: ' + error.message);
    }
})

userRoute.get("/feed", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        const page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        limit = limit > 50 ? 50 : limit;
        const skip = (page-1) * limit;

        const connectionDetails = await userConnectionRequest.find({
            $or: [
                { toUserId: loggedInUser._id },
                { fromUserId: loggedInUser._id }
            ]
        }).select("fromUserId toUserId")

        const hiddenUsers = new Set();
        connectionDetails.forEach((data) => {
            hiddenUsers.add(data.fromUserId.toString());
            hiddenUsers.add(data.toUserId.toString());
        })

        // hiddenUsers.add(loggedInUser._id);

        const feedList = await User.find({
            _id: {
                $nin: [...hiddenUsers],
                $ne: loggedInUser._id
            }
        }).select(USER_SAFE_DATA)
        .skip(skip)
        .limit(limit);

        res.status(200).json({
            message: "feed list fetched",
            data: feedList
        })
    } catch (error) {
        res.status(400).send('ERROR: ' + error.message);
    }
})

module.exports = userRoute;
