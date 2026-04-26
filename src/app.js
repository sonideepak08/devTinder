const express = require('express');
const connectDB = require('./config/database');
const User = require('./models/user');
const { validateSignUp } = require('./utils/validation');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const { userAuth } = require('./middleware/auth');

const app = express();

app.use(express.json());
app.use(cookieParser());

//POST register a user
app.post('/signup', async (req, res) => {
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
app.post('/login', async (req, res) => {
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

//POST profile
app.get("/profile", userAuth, async (req, res) => {
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

app.post("/sendConnectionRequest", userAuth, async (req, res, next) => {
    try {
        const userData = req.user;
        const userName = userData.firstName + ' ' + userData.lastName;
        res.status(200).send(userName + ' sent connection request');
    } catch (error) {
        res.status(400).send('ERROR: ' + error.message);
    }
})

connectDB().then(() => {
    console.log('connection successfully established!!!');
    app.listen(3000, () => {
        console.log('server is listening at port 3000');
    })
}).catch((err) => {
    console.error('connection unsuccessful', err.message);
})


