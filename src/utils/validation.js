const validator = require('validator');

const validateSignUp = (req) => {

    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName) {
        throw new Error('Enter a valid name');
    } else if (firstName.length < 3 || firstName.length > 10) {
        throw new Error(' firstName should be in between 3-10 characters');
    } else if (lastName.length < 3 || lastName.length > 10) {
        throw new Error(' firstName should be in between 3-10 characters');
    }

    if (!validator.isEmail(email)) {
        throw new Error('Enter an valid email');
    }

    if (!validator.isStrongPassword(password)) {
        throw new Error('Enter a strong password');
    }
}

const validateEditProfile = (req) => {
    const allowedEditFields = ['firstName', 'lastName', 'email', 'age', 'gender', 'skills', 'pictureUrl', 'about'];
    const isAllowedEdit = Object.keys(req.body).every((field) => allowedEditFields.includes(field));
    return isAllowedEdit;
}

module.exports={
    validateSignUp,
    validateEditProfile,
}