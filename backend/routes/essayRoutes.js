import express from 'express';
import {
  getAllEssays,
  getEssayById,
  createEssay,
  updateEssay,
  deleteEssay
} from '../controllers/essayController.js';
import { adminAuth } from '../middleware/adminAuth.js';

const router = express.Router();

// Public routes (read-only for students)
router.get('/', getAllEssays);
router.get('/:id', getEssayById);

// Admin routes
router.post('/', adminAuth, createEssay);
router.put('/:id', adminAuth, updateEssay);
router.delete('/:id', adminAuth, deleteEssay);

export default router;

