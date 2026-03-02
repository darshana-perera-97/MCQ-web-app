import express from 'express';
import { getAnalytics } from '../controllers/analyticsController.js';
import { adminAuth } from '../middleware/adminAuth.js';

const router = express.Router();

// Admin routes only
router.get('/', adminAuth, getAnalytics);

export default router;

