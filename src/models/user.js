const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 10
    },
    lastName: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 10
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new error('invalid email' + value);
            }
        }
    },
    password: {
        type: String,
        required: true,
        validate(value) {
            if (!validator.isStrongPassword(value)) {
                throw new error('Enter strong password: ' + value);
            }
        }
    },
    age: {
        type: Number
    },
    gender: {
        type: String,
        validate(value) {
            if (!['male', 'female', 'other'].includes(value)) {
                throw new error('invalid gender');
            }
        }
    },
    skills: {
        type: [String]
    },
    pictureUrl: {
        type: String,
        default: 'https://pixabay.com/images/search/profile%20icon/',
        validate(value) {
            if (!validator.isURL(value)) {
                throw new error('invalid pictureUrl' + value);
            }
        }
    },
    about: {
        type: String,
        default: 'This is a default about of user'
    }
}, {
    timestamps: true
})

module.exports = mongoose.model("User", userSchema);