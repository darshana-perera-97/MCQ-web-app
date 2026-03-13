import express from 'express';
import {
  getRandomMcq,
  submitMcqAnswer,
  getAllMcqs,
  getMcqById,
  getGeneralKnowledgeNotes,
  createMcq,
  updateMcq,
  deleteMcq,
  uploadMcqsFromCSV
} from '../controllers/mcqController.js';
import { adminAuth } from '../middleware/adminAuth.js';
import { uploadMcqImage, uploadCSV } from '../middleware/upload.js';

const router = express.Router();

// Student routes
router.get('/random', getRandomMcq);
router.post('/submit', submitMcqAnswer);
router.get('/notes/general-knowledge', getGeneralKnowledgeNotes);
router.get('/', getAllMcqs);
router.get('/:id', getMcqById);

// Admin routes (with answers visible)
router.get('/admin/all', adminAuth, getAllMcqs);
router.get('/admin/:id', adminAuth, getMcqById);

// Admin routes
router.post('/', adminAuth, uploadMcqImage.single('image'), createMcq);
router.post('/upload-csv', adminAuth, uploadCSV.single('csv'), uploadMcqsFromCSV);
router.put('/:id', adminAuth, uploadMcqImage.single('image'), updateMcq);
router.delete('/:id', adminAuth, deleteMcq);

export default router;

