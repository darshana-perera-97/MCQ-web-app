import express from 'express';
import {
  getAllStructuredWritings,
  getStructuredWritingById,
  createStructuredWriting,
  updateStructuredWriting,
  deleteStructuredWriting
} from '../controllers/structuredWritingController.js';
import { adminAuth } from '../middleware/adminAuth.js';

const router = express.Router();

router.get('/', getAllStructuredWritings);
router.get('/:id', getStructuredWritingById);

router.post('/', adminAuth, createStructuredWriting);
router.put('/:id', adminAuth, updateStructuredWriting);
router.delete('/:id', adminAuth, deleteStructuredWriting);

export default router;
