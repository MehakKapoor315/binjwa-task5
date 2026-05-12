const express = require('express');
const {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  updateLeaveStatus
} = require('../controllers/leaveController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router
  .route('/')
  .get(authorize('admin', 'HR'), getAllLeaves)
  .post(applyLeave);

router.get('/me', getMyLeaves);
router.put('/:id', authorize('admin', 'HR'), updateLeaveStatus);

module.exports = router;
