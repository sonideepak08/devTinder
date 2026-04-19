const express = require('express');
const connectDB = require('./config/database');
const User = require('./models/user');

const app = express();

app.use(express.json());

//GET all users of db
app.get('/users', async (req, res) => {
    try {
        const dbUsers = await User.find({});
        if( !dbUsers ) {
            res.status(404).send('no user found!!');
        } else {
            res.status(200).send(dbUsers);
        }
    } catch (error) {
        res.status(400).send('something went wrong!!');
    }
})

//GET a user by email
app.get('/user', async (req, res) => {
    const userEmail = 'madhuri@soni.com';
    try {
        const dbUser = await User.findOne({ email: userEmail });
        if( !dbUser ) {
            res.status(404).send('no user found!!');
        } else {
            res.status(200).send(dbUser);
        }
    } catch (error) {
        res.status(400).send('something went wrong!!');
    }
})

//GET user by _id
app.get('/userById', async (req, res) => {
    try {
        const dbUser = await User.findById({ _id: '69d22893fdec859c0146d9fd' });
        if( !dbUser ) {
            res.status(404).send('no user found!!');
        } else {
            res.status(200).send(dbUser);
        }
    } catch (error) {
        res.status(400).send('something went wrong!!');
    }
})

//POST register a user
app.post('/signup', async (req, res) => {
    const user = new User(req.body);

    try {
        await user.save();
        res.status(200).send('user added successfully');
    } catch (error) {
        res.status(400).send('adding user request failed.'+ error.message);
    }
})

//Delete a user
app.delete('/delete', async (req, res) => {
    const userId = req.body.userId;
    try {
        await User.findByIdAndDelete(userId);
        res.status(200).send("User deleted successfully");
    } catch (error) {
        res.status(400).send('something went wrong!!');
    }
})

//Update a user
app.patch("/update", async (req, res) => {
    const userId = req.body.userId;
    const body = req.body;
    try {
        const ALLOWED_UPDATES = ['userId', 'age', 'gender', 'skills', 'pictureUrl', 'email'];
        const isUpdateAllowed = Object.keys(body).every((k) => ALLOWED_UPDATES.includes(k));
        if (!isUpdateAllowed) {
            throw new Error('update not allowed');
        }
        if (body?.skills && body?.skills.length > 10) {
            throw new Error('skills cannot exceeds more than 10');
        }
        await User.findByIdAndUpdate(userId, body,{
            runValidators: true
        }
        )
        res.status(200).send("User updated successfully");
    } catch (error) {
        res.status(400).send('something went wrong ' + error.message);
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


