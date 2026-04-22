import express from 'express';
import { protect, admin } from '../Middleware/auth.js';
import { 
  createSignatureDish, 
  getSignatureDishes, 
  deleteSignatureDish 
} from '../Controllers/signatureDishesController.js';

import multer from 'multer';

const storage = multer.memoryStorage(); 
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, 
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

const router = express.Router();

// Routes
router.post('/', upload.single('image'), createSignatureDish);
router.get('/', getSignatureDishes);
router.delete('/:id', deleteSignatureDish);

export default router;