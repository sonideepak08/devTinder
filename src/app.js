const express = require('express');
const connectDB = require('./config/database');
const User = require('./models/user');

const app = express();

app.get('/', (req, res) => {
    res.send('successful');
})

app.post('/signup', async (req, res) => {
    const user = new User({
        firstName: 'Deepak',
        lastName: 'Soni',
        email: 'deepak@soni.com',
        password: 'deepak@123'
    })

    await user.save();
    res.send('request successfull');
})

connectDB().then(() => {
    console.log('connection successfully established!!!');
    app.listen(3000, () => {
        console.log('server is listening at port 3000');
    })
}).catch((err) => {
    console.error('connection unsuccessful', err.message);
})


