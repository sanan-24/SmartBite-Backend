const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getAllRiders,
  createRider,
  getRider,
  updateRider,
  deleteRider
} = require('../controllers/riderController');

router.use(protect);
router.use(authorize('admin'));

router.route('/').get(getAllRiders).post(createRider);
router.route('/:id').get(getRider).put(updateRider).delete(deleteRider);

module.exports = router;
