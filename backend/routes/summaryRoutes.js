import express from 'express';
import {
  getAllSummaries,
  getSummaryById,
  createSummary,
  updateSummary,
  deleteSummary
} from '../controllers/summaryController.js';
import { adminAuth } from '../middleware/adminAuth.js';

const router = express.Router();

// Public routes (read-only for students)
router.get('/', getAllSummaries);
router.get('/:id', getSummaryById);

// Admin routes
router.post('/', adminAuth, createSummary);
router.put('/:id', adminAuth, updateSummary);
router.delete('/:id', adminAuth, deleteSummary);

export default router;

