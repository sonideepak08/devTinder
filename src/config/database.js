const mongoose = require("mongoose");

const connectDB = async () => {
    await mongoose.connect('mongodb+srv://deepaksoniofficial08_db_user:deepaksoni08@namastenodejs.wbyhuag.mongodb.net/devTinder');
    
}

module.exports = connectDB;