const express = require('express');
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask
} = require('../controllers/taskController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router
  .route('/')
  .get(getTasks)
  .post(authorize('admin', 'HR'), createTask);

router
  .route('/:id')
  .get(getTask)
  .put(authorize('admin', 'HR'), updateTask)
  .delete(authorize('admin', 'HR'), deleteTask);

module.exports = router;
