const User = require('../models/User');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role
    });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    console.log("LOGIN REQUEST BODY:", req.body);
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      console.log("Missing fields:", { email, password, role });
      return res.status(400).json({ success: false, error: 'Please provide email, password and role' });
    }


    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    if (user.role !== role) {
      return res.status(401).json({ success: false, error: 'Invalid role for this account' });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpire = Date.now() + 10 * 60 * 1000;
    
    // Save OTP to user (expires in 10 minutes) using updateOne to bypass validation
    await User.updateOne({ _id: user._id }, { $set: { otp, otpExpire } });


    // Send OTP via Email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Your 2FA Login OTP',
      text: `Your OTP for login is ${otp}. It will expire in 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #333;">Your Login OTP</h2>
          <p style="font-size: 16px; color: #555;">Please use the following One-Time Password to complete your login:</p>
          <div style="background-color: #f4f4f4; padding: 15px; text-align: center; border-radius: 4px; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #ea580c;">${otp}</span>
          </div>
          <p style="font-size: 14px; color: #888;">This OTP will expire in 10 minutes. If you didn't request this, you can safely ignore this email.</p>
        </div>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`OTP sent to ${user.email} via email.`);
    } catch (emailError) {
      console.error("Error sending OTP email:", emailError);
      return res.status(500).json({ success: false, error: 'Error sending OTP via email' });
    }

    res.status(200).json({
      success: true,
      requires2FA: true,
      message: 'OTP sent to your registered channel'
    });
  } catch (err) {
    console.error("LOGIN ERROR CAUGHT:", err);
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};


// @desc    Verify 2FA OTP
// @route   POST /api/auth/verify-2fa
// @access  Public
exports.verify2FA = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, error: 'Please provide email and OTP' });
    }

    const user = await User.findOne({ email }).select('+otp +otpExpire');

    if (!user || !user.otp || user.otp !== otp || user.otpExpire < Date.now()) {
      return res.status(401).json({ success: false, error: 'Invalid or expired OTP' });
    }

    // Clear OTP after successful verification using updateOne to bypass validation
    await User.updateOne(
      { _id: user._id },
      { $unset: { otp: 1, otpExpire: 1 } }
    );


    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePic: user.profilePic,
      designation: user.designation,
      mobileNumber: user.mobileNumber
    }
  });
};
