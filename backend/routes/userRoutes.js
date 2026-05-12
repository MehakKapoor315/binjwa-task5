const express = require('express');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateProfile
} = require('../controllers/userController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// Apply protection to all routes below
router.use(protect);

router.put('/profile', updateProfile);

router
  .route('/')
  .get(authorize('admin', 'HR'), getUsers)
  .post(authorize('admin', 'HR'), createUser);

router
  .route('/:id')
  .get(getUser)
  .put(authorize('admin', 'HR'), updateUser)
  .delete(authorize('admin', 'HR'), deleteUser);

module.exports = router;
