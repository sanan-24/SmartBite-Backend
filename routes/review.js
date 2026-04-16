const express = require('express');
const router = express.Router();
const {
  createReview,
  getAllReviews,
  getMyReviews,
  deleteReview
} = require('../controllers/reviewController');
const { getReviewsByFood } = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .post(protect, createReview)
  .get(protect, authorize('admin'), getAllReviews);

router.get('/myreviews', protect, getMyReviews);
router.get('/food/:id', getReviewsByFood);
router.delete('/:id', protect, authorize('admin'), deleteReview);

module.exports = router;
