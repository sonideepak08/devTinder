const authAdmin = (req, res, next) => {
    const token = 'xyz';
    const isAuthorized = token === 'xyz';
    if (isAuthorized) {
        console.log('token authorized');
        next();
    } else {
        console.log('token unauthorized');
        res.status(401).send('unauthorized response');
    }
}

module.exports = {
    authAdmin,
}