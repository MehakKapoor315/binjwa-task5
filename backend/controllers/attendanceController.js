const Attendance = require('../models/Attendance');

// @desc    Clock In
// @route   POST /api/attendance/clock-in
// @access  Private
exports.clockIn = async (req, res, next) => {
  try {
    // Check if already clocked in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingAttendance = await Attendance.findOne({
      user: req.user.id,
      date: { $gte: today }
    });

    if (existingAttendance) {
      return res.status(400).json({ success: false, error: 'Already clocked in for today' });
    }

    const attendance = await Attendance.create({
      user: req.user.id,
      clockIn: new Date()
    });

    res.status(201).json({ success: true, data: attendance });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Clock Out
// @route   PUT /api/attendance/clock-out
// @access  Private
exports.clockOut = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      user: req.user.id,
      date: { $gte: today },
      clockOut: { $exists: false }
    });

    if (!attendance) {
      return res.status(400).json({ success: false, error: 'No active clock-in found for today' });
    }

    attendance.clockOut = new Date();
    
    // Calculate total hours
    const diff = attendance.clockOut - attendance.clockIn;
    attendance.totalHours = (diff / (1000 * 60 * 60)).toFixed(2);

    await attendance.save();

    res.status(200).json({ success: true, data: attendance });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get my attendance
// @route   GET /api/attendance/me
// @access  Private
exports.getMyAttendance = async (req, res, next) => {
  try {
    const attendance = await Attendance.find({ user: req.user.id }).sort('-date');
    res.status(200).json({ success: true, count: attendance.length, data: attendance });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get all attendance (Admin/HR)
// @route   GET /api/attendance
// @access  Private/Admin/HR
exports.getAllAttendance = async (req, res, next) => {
  try {
    const attendance = await Attendance.find().populate('user', 'name email');
    res.status(200).json({ success: true, count: attendance.length, data: attendance });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
