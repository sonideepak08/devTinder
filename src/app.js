const express = require('express');
const connectDB = require('./config/database');
const cookieParser = require('cookie-parser');
const userRoute = require('./routes/auth');
const profileAuth = require('./routes/profile');
const requestAuth = require('./routes/request');

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use('/', userRoute);
app.use('/', profileAuth);
app.use('/', requestAuth);


connectDB().then(() => {
    console.log('connection successfully established!!!');
    app.listen(3000, () => {
        console.log('server is listening at port 3000');
    })
}).catch((err) => {
    console.error('connection unsuccessful', err.message);
})


