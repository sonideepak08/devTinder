const express = require('express');
const authAdmin = require('../middleware/auth');
const app = express();

app.use('/admin', authAdmin);

app.get('/user', (req, res, next) => {
    console.log('callling /user API');
    res.send('user data fetched!')
})

app.get('/admin/getData', (req, res, next) => {
    console.log('callling /admin/getData API');
    // next();
    res.send('data fetched successfully');
})

app.get('/admin/deleteData', (req, res, next) => {
    console.log('callling /admin/deleteData API');
    res.send('data deleted successfully');
})

app.listen(3000, () => {
    console.log('server is listening at port 3000');
})