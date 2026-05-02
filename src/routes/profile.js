const express = require('express');
const { userAuth } = require('../middleware/auth');
const profileAuth = express.Router();
const { validateEditProfile } = require('../utils/validation');
const user = require('../models/user');
const validator = require('validator');
const bcrypt = require('bcrypt');

//POST profile
profileAuth.get("/profile/view", userAuth, async (req, res) => {
    try {
        const userData = req.user;
        if (!userData) {
            throw new Error('user not found');
        }
        res.status(200).send(userData);
    } catch (error) {
        res.status(400).send('getProfile failed.' + error.message);
    }
})

//PATCH edit profile
profileAuth.patch("/profile/edit", userAuth, async (req, res) => {
    try {
        const isAllowed = validateEditProfile(req);
        if (!isAllowed) {
            throw new Error('invalid field edit');
        } else {
            const user = req.user;
            Object.keys(req.body).forEach((field) => user[field] = req.body[field]);
            await user.save();
            res.status(200).json({
                message: `${user.firstName}, your profile has been updated.`,
                data: user
        })

    }
    } catch (error) {
    res.status(400).send('editing profile failed. ' + error.message);
}
})

// PATCH forgot password
profileAuth.patch("/profile/password", userAuth, async (req, res) => {
    try {
        const user = req.user;
        const password = req.body.password;
        if (password && !validator.isStrongPassword(password)) {
            throw new Error('please enter a strong password');
        }
        const passwordHashed = await bcrypt.hash(password, 10);
        user.password = passwordHashed;
        await user.save();
        res.status(200).send('password updated successfully');
    } catch (error) {
        res.status(400).send('editing password failed. ' + error.message);
    }
})

module.exports = profileAuth;