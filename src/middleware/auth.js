const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).send("Please login!");
    }
    const decode = await jwt.verify(token, "Deepakbhaiya@123");
    const userData = await User.findById(decode.userId);
    if (!userData) {
      return res.status(404).send("User not found");
    }
    req.user = userData;
    next();
  } catch (error) {
    return res.status(400).send("ERROR: " + error.message);
  }
};

module.exports = {
  userAuth,
};
