import express from 'express';
import {
  sendNotification,
  getAllNotifications,
  deleteNotification
} from '../controllers/notificationController.js';
import { adminAuth } from '../middleware/adminAuth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Public routes (students can view notifications)
router.get('/', getAllNotifications);

// Admin routes
router.post('/', adminAuth, upload.single('image'), sendNotification);
router.delete('/:id', adminAuth, deleteNotification);

export default router;

