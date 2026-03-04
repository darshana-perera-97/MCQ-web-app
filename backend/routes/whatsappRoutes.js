import express from 'express';
import {
  getWhatsAppStatus,
  connectWhatsApp,
  disconnectWhatsApp,
  sendMessage
} from '../controllers/whatsappController.js';
import { adminAuth } from '../middleware/adminAuth.js';

const router = express.Router();

// All routes require admin authentication
router.get('/status', adminAuth, getWhatsAppStatus);
router.post('/connect', adminAuth, connectWhatsApp);
router.post('/disconnect', adminAuth, disconnectWhatsApp);
router.post('/send', adminAuth, sendMessage);

export default router;

