const Leave = require('../models/Leave');

// @desc    Apply for leave
// @route   POST /api/leaves
// @access  Private
exports.applyLeave = async (req, res, next) => {
  try {
    req.body.user = req.user.id;
    const leave = await Leave.create(req.body);
    res.status(201).json({ success: true, data: leave });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get my leaves
// @route   GET /api/leaves/me
// @access  Private
exports.getMyLeaves = async (req, res, next) => {
  try {
    const leaves = await Leave.find({ user: req.user.id }).sort('-appliedAt');
    res.status(200).json({ success: true, count: leaves.length, data: leaves });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get all leaves (Admin/HR)
// @route   GET /api/leaves
// @access  Private/Admin/HR
exports.getAllLeaves = async (req, res, next) => {
  try {
    const leaves = await Leave.find().populate('user', 'name email');
    res.status(200).json({ success: true, count: leaves.length, data: leaves });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Update leave status (Approve/Reject)
// @route   PUT /api/leaves/:id
// @access  Private/Admin/HR
exports.updateLeaveStatus = async (req, res, next) => {
  try {
    let leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ success: false, error: 'Leave request not found' });
    }

    leave = await Leave.findByIdAndUpdate(req.params.id, { status: req.body.status }, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: leave });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
