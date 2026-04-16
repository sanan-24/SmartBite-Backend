const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderItems: [
    {
      food: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Food',
        required: true
      },
      name: { type: String, required: true },
      quantity: { type: Number, required: true, min: 1 },
      price: { type: Number, required: true },
      image: { type: String, required: true }
    }
  ],
  shippingAddress: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String },
    country: { type: String, default: 'Pakistan' }
  },
  paymentMethod: {
    type: String,
    enum: ['Cash on Delivery', 'Card', 'Online'],
    default: 'Cash on Delivery'
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  orderStatus: {
    type: String,
    enum: ['Pending', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  paymentResult: {
    id: String,
    status: String,
    update_time: String,
    email_address: String
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  paidAt: {
    type: Date
  },
  isDelivered: {
    type: Boolean,
    default: false
  },
  deliveredAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', orderSchema);
