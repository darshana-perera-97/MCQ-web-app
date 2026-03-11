import express from 'express';
import {
  signup,
  login,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserStats,
  getProgress,
  getCompletions,
  toggleComplete,
  approveUser,
  rejectUser,
  verifyOTP,
  resendOTP,
  updateNotificationPreferences
} from '../controllers/userController.js';
import { adminAuth } from '../middleware/adminAuth.js';

const router = express.Router();

// Public routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.get('/:id/stats', getUserStats);
router.get('/:id/progress', getProgress);
router.get('/:id/completions', getCompletions);
router.post('/:id/complete', toggleComplete);
router.put('/:id/notification-preferences', updateNotificationPreferences);

// Admin routes
router.get('/', adminAuth, getAllUsers);
router.get('/:id', adminAuth, getUserById);
router.put('/:id', adminAuth, updateUser);
router.delete('/:id', adminAuth, deleteUser);
router.post('/:id/approve', adminAuth, approveUser);
router.post('/:id/reject', adminAuth, rejectUser);

export default router;

