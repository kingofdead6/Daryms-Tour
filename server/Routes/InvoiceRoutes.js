import express from "express";
import {
  createInvoice,
  getAllInvoices,
  getInvoiceById,
  updateInvoice,
  updateInvoiceStatus,
  deleteInvoice,
  recordPayment,
  deletePayment,
  createInvoiceFromBooking,
  generatePayroll,
  getInvoiceStats,
} from "../Controllers/InvoiceController.js";
import { protect, admin } from "../Middleware/auth.js";

const router = express.Router();

// Everything under /api/invoices is admin-only.
router.use(protect, admin);

// GET  /api/invoices/stats               → dashboard figures for money in/out
router.get("/stats", getInvoiceStats);

// POST /api/invoices/payroll             → generate salary bills for a period
router.post("/payroll", generatePayroll);

// POST /api/invoices/from-booking/:id    → invoice an existing booking
router.post("/from-booking/:bookingId", createInvoiceFromBooking);

// GET  /api/invoices                     → list (filter by direction/status/…)
router.get("/", getAllInvoices);

// POST /api/invoices                     → create
router.post("/", createInvoice);

router.get("/:id", getInvoiceById);
router.patch("/:id", updateInvoice);
router.patch("/:id/status", updateInvoiceStatus);
router.delete("/:id", deleteInvoice);

// POST   /api/invoices/:id/payments             → record a payment
// DELETE /api/invoices/:id/payments/:paymentId  → undo a payment
router.post("/:id/payments", recordPayment);
router.delete("/:id/payments/:paymentId", deletePayment);

export default router;
