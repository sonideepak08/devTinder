const { userAuth } = require("../middleware/auth");
const Chat = require("../models/chat");

const express = require("express");

const chatRouter = express.Router();

chatRouter.get("/chat/:targetUserId", userAuth, async (req, res) => {
    try {
        const userId = req.user._id;
        const { targetUserId } = req.params;

        let chat = await Chat.findOne({
            participants: { $all: [userId, targetUserId] },
        }).populate({
            path: "messages.senderId",
            select: "firstName lastName"
        });

        if (!chat) {
            chat = new Chat({
                participants: [ userId, targetUserId ],
                messages: []
            })
            await chat.save();
        }
        return res.json(chat);
        
    } catch (error) {
        console.error(error);
    }
});

module.exports = chatRouter;