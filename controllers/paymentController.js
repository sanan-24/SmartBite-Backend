const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Process stripe payments
// @route   POST /api/payment/process
// @access  Private
exports.processPayment = asyncHandler(async (req, res, next) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: req.body.amount,
    currency: 'pkr',
    metadata: { company: 'SmartBite' },
  });

  res.status(200).json({
    success: true,
    client_secret: paymentIntent.client_secret,
  });
});

// @desc    Send stripe API Key
// @route   GET /api/payment/stripeapi
// @access  Private
exports.sendStripeApi = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    stripeApiKey: process.env.STRIPE_API_KEY,
  });
});
