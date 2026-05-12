const User = require('../models/User');
const Attendance = require('../models/Attendance');

// @desc    Get all users with aggregated stats
// @route   GET /api/users
// @access  Private/Admin/HR
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    
    // Enrich users with attendance stats
    const usersWithStats = await Promise.all(users.map(async (user) => {
      const attendanceRecords = await Attendance.find({ user: user._id });
      
      const totalHours = attendanceRecords.reduce((acc, curr) => acc + (curr.totalHours || 0), 0);
      const totalDays = attendanceRecords.filter(a => a.clockOut).length;
      
      return {
        ...user.toObject(),
        totalTime: `${totalHours.toFixed(2)}h`,
        totalDays: totalDays
      };
    }));

    res.status(200).json({
      success: true,
      count: usersWithStats.length,
      data: usersWithStats
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    const attendanceRecords = await Attendance.find({ user: user._id });
    const totalHours = attendanceRecords.reduce((acc, curr) => acc + (curr.totalHours || 0), 0);
    
    res.status(200).json({ 
      success: true, 
      data: {
        ...user.toObject(),
        totalTime: `${totalHours.toFixed(2)}h`
      } 
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Create user
// @route   POST /api/users
// @access  Private/Admin
exports.createUser = async (req, res, next) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Update profile (Self)
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email, mobileNumber, designation, profilePic, password } = req.body;

    const updateFields = { name, email, mobileNumber, designation, profilePic };
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (password) {
      updatedUser.password = password;
      await updatedUser.save();
    }

    res.status(200).json({ 
      success: true, 
      data: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        profilePic: updatedUser.profilePic,
        designation: updatedUser.designation,
        mobileNumber: updatedUser.mobileNumber
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
