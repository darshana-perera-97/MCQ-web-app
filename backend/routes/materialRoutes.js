import express from 'express';
import {
  uploadMaterial,
  getAllMaterials,
  getMaterialById,
  downloadMaterial,
  deleteMaterial
} from '../controllers/materialController.js';
import { adminAuth } from '../middleware/adminAuth.js';
import { uploadPDF } from '../middleware/upload.js';

const router = express.Router();

// Public routes (for students)
router.get('/', getAllMaterials);
router.get('/:id', getMaterialById);
router.get('/:id/download', downloadMaterial);

// Admin routes
router.post('/', adminAuth, uploadPDF.single('pdf'), uploadMaterial);
router.delete('/:id', adminAuth, deleteMaterial);

export default router;

