const { userAuth } = require("../middleware/auth");

const express = require("express");
const paymentRouter = express.Router();
const paymentInstance = require("../utils/razorpay");
const Payment = require("../models/payment");
const Razorpay = require("razorpay");

paymentRouter.post("/payment/create", userAuth, async (req, res) => {
  try {
    const { membershipType } = req.body;
    const { firstName, lastName, email } = req.user;

    const order = await paymentInstance.orders.create({
      amount:
        membershipType === "Silver"
          ? Number(process.env.SILVER_MEMBERSHIP_AMOUNT * 100)
          : Number(process.env.GOLD_MEMBERSHIP_AMOUNT * 100),
      currency: "INR",
      receipt: "receipt#1",
      notes: {
        firstName,
        lastName,
        email,
        membershipType,
      },
    });

    console.log("order", order);
    // save data in Payment database
    const payment = new Payment({
      userId: req.user._id,
      orderId: order.id,
      status: order.status,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      notes: order.notes,
    });

    const paymentInfo = await payment.save();
    res.status(200).json({
      ...paymentInfo.toJSON(),
      RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

module.exports = paymentRouter;
