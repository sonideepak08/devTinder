const express = require('express');
const connectDB = require('./config/database');
const User = require('./models/user');

const app = express();

app.use(express.json());

app.post('/signup', async (req, res) => {
    const user = new User(req.body);

    try {
        await user.save();
        res.status(200).send('user added successfully');
    } catch (error) {
        res.status(400).send('adding user request failed.');
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


