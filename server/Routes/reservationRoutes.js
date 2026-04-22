import express from 'express';
import {
  createReservation,
  getReservations,
  updateReservationStatus,
  deleteReservation
} from '../Controllers/reservationController.js';
import { protect, admin } from '../Middleware/auth.js';

const router = express.Router();

// Public: Guest creates a reservation
router.post('/', createReservation);

// Admin: View all reservations
router.get('/', protect, admin, getReservations);

// Admin: Confirm or cancel
router.patch('/:id/status', protect, admin, updateReservationStatus);

// Admin: Hard delete
router.delete('/:id', protect, admin, deleteReservation);

export default router;