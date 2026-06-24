const { userAuth } = require("../middleware/auth");

const express = require("express");
const paymentRouter = express.Router();
const paymentInstance = require("../utils/razorpay");
const Payment = require("../models/payment");
const Razorpay = require("razorpay");
const { membershipAmount } = require("../utils/constants");
const {validateWebhookSignature} = require('razorpay/dist/utils/razorpay-utils');
const User = require("../models/user");

paymentRouter.post("/payment/create", userAuth, async (req, res) => {
  try {
    const { membershipType } = req.body;
    const { firstName, lastName, email } = req.user;

    const order = await paymentInstance.orders.create({
      amount: membershipAmount[membershipType] * 100,
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

paymentRouter.post("/payment/webhook", async (req, res) => {
  try {
    const webhookSignature = req.get('X-Razorpay-Signature');

    const isWebhookValid = validateWebhookSignature(
      JSON.stringify(req.body),
      webhookSignature,
      process.env.RAZORPAY_WEBHOOK_SECRET)
    
    if (!isWebhookValid) {
      return res.status(400).json({msg: "webhook signature is invalid"});
    }

    // update payment status in Payment db
    const paymentDetails = req.body.payload.payment.entity;

    const payment = await Payment.findOne({orderId: paymentDetails.order_id});
    payment.status = paymentDetails.status;
    await Payment.save();

    // update the user as premium
    const user = User.findOne({_id: payment.userId});
    user.isPremium = true;
    user.membershipType = payment.notes.membershipType;
    await User.save();

    // to use to handle these events
    // if (req.body.event = "payment.captured") {
    // }
    // if (req.body.event = "payment.failed") {
    // }

    // return success response to Razorpay
    return res.status(200).json({msg: "webhook received successfully"});
  } catch (error) {
    res.status(500).json({msg: error.message});
  }
})

module.exports = paymentRouter;
