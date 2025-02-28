

const express = require('express');

const asyncHandler = require("express-async-handler");
const { authenticate } = require('../utils/utils');

const { createPaymentSession, handleStripeWebhook } = require('../controllers/paymentController')

const paymentRouter = express.Router();



paymentRouter.post('/makepayement', authenticate(["student"]), asyncHandler(createPaymentSession))

// paymentRouter.post(
//     "/webhook",
//     express.raw({ type: "application/json" }), // Ensures raw body
//     asyncHandler(handleStripeWebhook)
//   );

// courseRouter.post('/createcourse', authenticate(["instructor"]), asyncHandler(createCourse));

// /api/courses/payment/webhook

module.exports = paymentRouter;