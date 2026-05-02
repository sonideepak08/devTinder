const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { validateSignUp } = require('../utils/validation');
const { userAuth } = require('../middleware/auth');

const userRoute = express.Router();

//POST register a user
userRoute.post('/signup', async (req, res) => {
    try {
        //validation
        validateSignUp(req);

        const { firstName, lastName, email, password } = req.body;

        //encrypting password
        const passwordHashed = await bcrypt.hash(password, 10);

        const user = new User({
            firstName,
            lastName,
            email,
            password: passwordHashed
        });

        await user.save();
        res.status(200).send('user added successfully');
    } catch (error) {
        res.status(400).send('adding user request failed.' + error.message);
    }
})

//POST login
userRoute.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            throw new Error('Invalid credentials');
        }
        const isPasswordValid = await user.validatePassword(password);

        if (!isPasswordValid) {
            throw new Error('Invalid credentials');
        }
        const jwtToken = await user.getJWT();
        res.cookie('token', jwtToken, {
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days || expires: new Date(Date.now() + 604800000)
            httpOnly: true
        });
        res.status(200).send('login successful');
    } catch (error) {
        res.status(400).send('login failed.' + error.message);
    }
})

// POST logout
// userAuth miidleware is optional
userRoute.post("/logout", userAuth, (req, res) => {
    res.clearCookie('token', {
        httpOnly: true
    });
    res.status(200).send('user logged out!');
})
module.exports = userRoute;