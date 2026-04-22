import express from 'express';
import { protect, admin } from '../Middleware/auth.js';
import { 
  getCategories, 
  createCategory, 
  deleteCategory 
} from '../Controllers/categories.js';



const router = express.Router();

// Routes
router.post("/", createCategory);   
router.get("/", getCategories);
router.delete("/:id", protect, admin, deleteCategory);

export default router;