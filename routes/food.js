const express = require('express');
const router = express.Router();
const {
  getAllFoods,
  getFood,
  createFood,
  updateFood,
  deleteFood
} = require('../controllers/foodController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(getAllFoods)
  .post(protect, authorize('admin'), createFood);

router.route('/:id')
  .get(getFood)
  .put(protect, authorize('admin'), updateFood)
  .delete(protect, authorize('admin'), deleteFood);

module.exports = router;
