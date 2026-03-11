import express from 'express';
import {
  getAllStructuredQuestions,
  getStructuredQuestionById,
  createStructuredQuestion,
  updateStructuredQuestion,
  deleteStructuredQuestion
} from '../controllers/structuredQuestionController.js';
import { adminAuth } from '../middleware/adminAuth.js';

const router = express.Router();

// Public routes (read-only for students)
router.get('/', getAllStructuredQuestions);
router.get('/:id', getStructuredQuestionById);

// Admin routes
router.post('/', adminAuth, createStructuredQuestion);
router.put('/:id', adminAuth, updateStructuredQuestion);
router.delete('/:id', adminAuth, deleteStructuredQuestion);

export default router;

