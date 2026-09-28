const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 10,
    },
    lastName: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 10,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("invalid email" + value);
        }
      },
    },
    password: {
      type: String,
      required: true,
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error("Enter strong password: " + value);
        }
      },
    },
    age: {
      type: Number,
    },
    gender: {
      type: String,
      validate(value) {
        if (!["male", "female", "other"].includes(value)) {
          throw new Error("invalid gender");
        }
      },
    },
    skills: {
      type: [String],
    },
    pictureUrl: {
      type: String,
      default: "https://pixabay.com/images/search/profile%20icon/",
      validate(value) {
        if (!validator.isURL(value)) {
          throw new Error("invalid pictureUrl" + value);
        }
      },
    },
    about: {
      type: String,
      default: "This is a default about of user",
    },
  },
  {
    timestamps: true,
  },
);

// Schema methods
userSchema.methods.getJWT = async function () {
  const user = this;
  const token = await jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  return token;
};

userSchema.methods.validatePassword = async function (passwordInputByUser) {
  const user = this;
  const passwordHash = user.password;

  const isPasswordValid = bcrypt.compare(passwordInputByUser, passwordHash);
  return isPasswordValid;
};

module.exports = mongoose.model("User", userSchema);
