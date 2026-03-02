import express from 'express';
import {
  getSettings,
  updateSettings,
  testSMTP
} from '../controllers/settingsController.js';
import { adminAuth } from '../middleware/adminAuth.js';

const router = express.Router();

// Admin routes only
router.get('/', adminAuth, getSettings);
router.put('/', adminAuth, updateSettings);
router.post('/test-smtp', adminAuth, testSMTP);

export default router;

