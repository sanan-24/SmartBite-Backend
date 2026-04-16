const User = require('../models/User');

// @desc    Get all riders (Admin)
// @route   GET /api/riders
// @access  Private/Admin
exports.getAllRiders = async (req, res) => {
  try {
    const riders = await User.find({ role: 'rider' });

    res.status(200).json({
      success: true,
      count: riders.length,
      riders
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a rider (Admin)
// @route   POST /api/riders
// @access  Private/Admin
exports.createRider = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already in use' });
    }

    const rider = await User.create({
      name,
      email,
      phone,
      password: password || Math.random().toString(36).slice(-8),
      role: 'rider'
    });

    res.status(201).json({ success: true, message: 'Rider created', rider });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single rider (Admin)
// @route   GET /api/riders/:id
// @access  Private/Admin
exports.getRider = async (req, res) => {
  try {
    const rider = await User.findById(req.params.id);
    if (!rider || rider.role !== 'rider') {
      return res.status(404).json({ success: false, message: 'Rider not found' });
    }
    res.status(200).json({ success: true, rider });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update rider (Admin)
// @route   PUT /api/riders/:id
// @access  Private/Admin
exports.updateRider = async (req, res) => {
  try {
    const updates = req.body;
    // Prevent accidentally changing role to non-rider
    updates.role = 'rider';

    const rider = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!rider) {
      return res.status(404).json({ success: false, message: 'Rider not found' });
    }
    res.status(200).json({ success: true, message: 'Rider updated', rider });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete rider (Admin)
// @route   DELETE /api/riders/:id
// @access  Private/Admin
exports.deleteRider = async (req, res) => {
  try {
    const rider = await User.findByIdAndDelete(req.params.id);
    if (!rider || rider.role !== 'rider') {
      return res.status(404).json({ success: false, message: 'Rider not found' });
    }
    res.status(200).json({ success: true, message: 'Rider removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
