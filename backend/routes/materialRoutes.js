import express from 'express';
import multer from 'multer';
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
router.post('/', adminAuth, (req, res, next) => {
  uploadPDF.single('pdf')(req, res, (err) => {
    if (err) {
      console.error('Multer upload error:', err);
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'File too large. Maximum size is 50MB.' });
        }
        return res.status(400).json({ error: `Upload error: ${err.message}` });
      }
      return res.status(400).json({ error: err.message || 'File upload failed' });
    }
    next();
  });
}, uploadMaterial);
router.delete('/:id', adminAuth, deleteMaterial);

export default router;

