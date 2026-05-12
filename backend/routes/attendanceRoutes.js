const express = require('express');
const {
  clockIn,
  clockOut,
  getMyAttendance,
  getAllAttendance
} = require('../controllers/attendanceController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.post('/clock-in', clockIn);
router.put('/clock-out', clockOut);
router.get('/me', getMyAttendance);
router.get('/', authorize('admin', 'HR'), getAllAttendance);

module.exports = router;
