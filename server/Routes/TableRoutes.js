import express from 'express';
import {
  addTable,
  getTables,
  deleteTable,
  checkAvailability
} from '../Controllers/tableController.js';
import { protect, admin } from '../Middleware/auth.js';

const router = express.Router();

// Public: Check available tables for a date/time/guests
router.get('/availability', checkAvailability);

// Admin: Manage floor plan
router.route('/')
  .get(protect, admin, getTables)
  .post(protect, admin, addTable);

router.route('/:id')
  .delete(protect, admin, deleteTable);

export default router;