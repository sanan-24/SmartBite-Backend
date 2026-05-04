const Order = require('../models/Order');
const Food = require('../models/Food');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');


exports.createOrder = asyncHandler(async (req, res, next) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    totalPrice,
    paymentResult,
    isPaid,
    paidAt,
  } = req.body;

  // Prevent riders from creating orders
  if (req.user.role === 'rider') {
    return next(new ErrorResponse('Riders are not authorized to place orders', 403));
  }

  if (!orderItems || orderItems.length === 0) {
    return next(new ErrorResponse('No order items', 400));
  }

  const order = await Order.create({
    user: req.user.id,
    orderItems,
    shippingAddress,
    paymentMethod,
    totalPrice,
    paymentResult,
    isPaid,
    paidAt,
  });

  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    order,
  });
});


exports.getMyOrders = asyncHandler(async (req, res, next) => {
  const orders = await Order.find({ user: req.user.id })
    .populate('user', 'name email')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: orders.length,
    orders,
  });
});


exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Make sure user owns the order or is admin
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'name email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.orderStatus = orderStatus;

    if (orderStatus === 'Delivered') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Make sure user owns the order
    if (order.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to cancel this order'
      });
    }

    // Can only cancel if order is still pending
    if (order.orderStatus !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled'
      });
    }

    order.orderStatus = 'Cancelled';
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


exports.assignRider = async (req, res) => {
  try {
    const { riderId } = req.body;

    if (!riderId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a rider ID'
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.assignedTo = riderId;
    await order.save();

    // Populate rider info
    const updatedOrder = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('assignedTo', 'name email phone');

    res.status(200).json({
      success: true,
      message: 'Order assigned to rider successfully',
      order: updatedOrder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getRiderOrders = async (req, res) => {
  try {
    const orders = await Order.find({ assignedTo: req.user.id })
      .populate('user', 'name email phone address')
      .populate('assignedTo', 'name email phone')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


exports.updateDeliveryStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Make sure rider is assigned to this order
    if (order.assignedTo.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this order'
      });
    }

    order.orderStatus = orderStatus;

    if (orderStatus === 'Delivered') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }

    await order.save();

    const updatedOrder = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('assignedTo', 'name email phone');

    res.status(200).json({
      success: true,
      message: 'Delivery status updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get order reports (weekly, monthly, yearly)
// @route   GET /api/v1/orders/reports
// @access  Private/Admin
exports.getOrderReports = asyncHandler(async (req, res, next) => {
  const today = new Date();

  // Weekly stats (last 7 days)
  const lastWeek = new Date(today);
  lastWeek.setDate(today.getDate() - 7);

  // Monthly stats (last 30 days)
  const lastMonth = new Date(today);
  lastMonth.setDate(today.getDate() - 30);

  // Yearly stats (last 365 days)
  const lastYear = new Date(today);
  lastYear.setDate(today.getDate() - 365);

  const getStats = async (startDate) => {
    const stats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          orderStatus: { $ne: 'Cancelled' }
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalPrice' }
        }
      }
    ]);
    return stats.length > 0 ? stats[0] : { totalOrders: 0, totalRevenue: 0 };
  };

  // Daily breakdown for the last 7 days
  const dailyBreakdown = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: lastWeek },
        orderStatus: { $ne: 'Cancelled' }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        orders: { $sum: 1 },
        revenue: { $sum: "$totalPrice" }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  const weeklyReport = await getStats(lastWeek);
  const monthlyReport = await getStats(lastMonth);
  const yearlyReport = await getStats(lastYear);

  res.status(200).json({
    success: true,
    data: {
      weekly: weeklyReport,
      monthly: monthlyReport,
      yearly: yearlyReport,
      dailyBreakdown: dailyBreakdown
    }
  });
});

// @desc    Get detailed order statement for a range
// @route   GET /api/v1/orders/statement
// @access  Private/Admin
exports.getOrderStatement = asyncHandler(async (req, res, next) => {
  const { range } = req.query;
  const today = new Date();
  let startDate;

  if (range === 'weekly') {
    startDate = new Date(today);
    startDate.setDate(today.getDate() - 7);
  } else if (range === 'monthly') {
    startDate = new Date(today);
    startDate.setDate(today.getDate() - 30);
  } else if (range === 'yearly') {
    startDate = new Date(today);
    startDate.setDate(today.getDate() - 365);
  } else {
    // Default to last 30 days if no range or invalid range
    startDate = new Date(today);
    startDate.setDate(today.getDate() - 30);
  }

  const orders = await Order.find({
    createdAt: { $gte: startDate },
    orderStatus: { $ne: 'Cancelled' }
  })
    .populate('user', 'name email phone')
    .sort('-createdAt');

  const totalRevenue = orders.reduce((acc, order) => acc + order.totalPrice, 0);

  res.status(200).json({
    success: true,
    count: orders.length,
    totalRevenue,
    orders
  });
});
