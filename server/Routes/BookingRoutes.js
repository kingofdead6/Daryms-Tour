import express from "express";
import {
  createBooking,
  getAllBookingsAdmin,
  getBookingById,
  getBookingByReference,
  updateBookingStatus,
  updatePaymentStatus,
  updateAdminNotes,
  deleteBooking,
  getBookingStats,
} from "../Controllers/BookingController.js";

const router = express.Router();

// ─── Public ────────────────────────────────────────────────────────────────
// POST /api/bookings              → create booking
router.post("/", createBooking);

// GET /api/bookings/reference/:code  → lookup by reference code
router.get("/reference/:code", getBookingByReference);

// ─── Admin ─────────────────────────────────────────────────────────────────
// GET /api/bookings/admin/all     → all bookings (with filters)
router.get("/admin/stats", getBookingStats);
router.get("/admin/all", getAllBookingsAdmin);

// GET /api/bookings/:id           → single booking
router.get("/:id", getBookingById);

// PATCH /api/bookings/:id/status  → update status
router.patch("/:id/status", updateBookingStatus);

// PATCH /api/bookings/:id/payment → update payment status
router.patch("/:id/payment", updatePaymentStatus);

// PATCH /api/bookings/:id/notes   → update admin notes
router.patch("/:id/notes", updateAdminNotes);

// DELETE /api/bookings/:id
router.delete("/:id", deleteBooking);

export default router;