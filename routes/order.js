const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  assignRider,
  getRiderOrders,
  updateDeliveryStatus,
  getOrderReports,
  getOrderStatement
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .post(protect, createOrder)
  .get(protect, authorize('admin'), getAllOrders);

router.get('/myorders', protect, getMyOrders);
router.get('/reports', protect, authorize('admin'), getOrderReports);
router.get('/statement', protect, authorize('admin'), getOrderStatement);
router.get('/rider/my-deliveries', protect, authorize('rider'), getRiderOrders);
router.get('/:id', protect, getOrder);
router.put('/:id/status', protect, authorize('admin'), updateOrderStatus);
router.put('/:id/assign-rider', protect, authorize('admin'), assignRider);
router.put('/:id/delivery-status', protect, authorize('rider'), updateDeliveryStatus);
router.put('/:id/cancel', protect, cancelOrder);

module.exports = router;
