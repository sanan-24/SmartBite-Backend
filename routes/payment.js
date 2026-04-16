const express = require('express');
const router = express.Router();
const {
  processPayment,
  sendStripeApi,
} = require('../controllers/paymentController');

const { protect } = require('../middleware/auth');

router.route('/process').post(protect, processPayment);
router.route('/stripeapi').get(protect, sendStripeApi);

module.exports = router;
