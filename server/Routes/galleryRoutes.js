import express from 'express';
import multer from 'multer';
import {
  getGallery,
  addGalleryImages,
  deleteGalleryImage,
} from '../Controllers/galleryController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Public
router.get('/', getGallery);

// Admin
router.post('/', upload.array('images', 10), addGalleryImages);
router.delete('/:id', deleteGalleryImage);

export default router;