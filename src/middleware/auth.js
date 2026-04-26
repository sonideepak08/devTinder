const jwt = require('jsonwebtoken');
const User = require('../models/user')

const userAuth = async (req, res, next) => {
    try {
        const { token } = req.cookies;
        if (!token) {
            throw new Error('token is not valid');
        }
        const decode = await jwt.verify(token, 'Deepakbhaiya@123');
        const userData = await User.findById(decode.userId);
        req.user = userData;
        next();
    } catch (error) {
        res.status(400).send('ERROR: ' + error.message);
    }
}

module.exports = {
    userAuth,
}