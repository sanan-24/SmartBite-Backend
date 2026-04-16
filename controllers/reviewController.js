const Review = require('../models/Review');
const Order = require('../models/Order');
const Food = require('../models/Food');

// @desc    Create review
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res) => {
  try {
    const { orderId, rating, comment } = req.body;

    // Check if order exists and belongs to user
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to review this order'
      });
    }

    // Check if order is delivered
    if (order.orderStatus !== 'Delivered') {
      return res.status(400).json({
        success: false,
        message: 'Can only review delivered orders'
      });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ order: orderId });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this order'
      });
    }

    // attach food ids from the order to the review
    const foodIds = order.orderItems.map(item => item.food);

    const review = await Review.create({
      user: req.user.id,
      order: orderId,
      foods: foodIds,
      rating,
      comment
    });

    // Update each food's rating and numReviews
    for (const foodId of foodIds) {
      const foodReviews = await Review.find({ foods: foodId });
      const numReviews = foodReviews.length;
      const avgRating = numReviews ? (foodReviews.reduce((sum, r) => sum + Number(r.rating), 0) / numReviews) : 0;
      await Food.findByIdAndUpdate(foodId, { rating: avgRating, numReviews });
    }

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all reviews (Admin)
// @route   GET /api/reviews
// @access  Private/Admin
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find({})
      .populate('user', 'name email')
      .populate('order')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user reviews
// @route   GET /api/reviews/myreviews
// @access  Private
exports.getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user.id })
      .populate('order')
      .populate('foods')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete review (Admin)
// @route   DELETE /api/reviews/:id
// @access  Private/Admin
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get reviews for a food
// @route   GET /api/reviews/food/:id
// @access  Public
exports.getReviewsByFood = async (req, res) => {
  try {
    const foodId = req.params.id;
    const reviews = await Review.find({ foods: foodId })
      .populate('user', 'name email')
      .populate('order')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
