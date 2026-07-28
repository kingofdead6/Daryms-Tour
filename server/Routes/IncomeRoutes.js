import express from "express";
import {
  createIncome,
  getAllIncome,
  getIncomeById,
  updateIncome,
  deleteIncome,
} from "../Controllers/IncomeController.js";
import { protect, admin } from "../Middleware/auth.js";

const router = express.Router();

// Financial records are admin-only.
router.use(protect, admin);

// GET /api/income                → all income entries (with filters)
router.get("/", getAllIncome);

// POST /api/income                → create income entry
router.post("/", createIncome);

// GET /api/income/:id
router.get("/:id", getIncomeById);

// PATCH /api/income/:id
router.patch("/:id", updateIncome);

// DELETE /api/income/:id
router.delete("/:id", deleteIncome);

export default router;
