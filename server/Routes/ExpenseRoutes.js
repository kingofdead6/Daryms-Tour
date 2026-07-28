import express from "express";
import {
  createExpense,
  getAllExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
} from "../Controllers/ExpenseController.js";
import { protect, admin } from "../Middleware/auth.js";

const router = express.Router();

// Financial records are admin-only.
router.use(protect, admin);

// GET /api/expenses                → all expenses (with filters)
router.get("/", getAllExpenses);

// POST /api/expenses                → create expense
router.post("/", createExpense);

// GET /api/expenses/:id
router.get("/:id", getExpenseById);

// PATCH /api/expenses/:id
router.patch("/:id", updateExpense);

// DELETE /api/expenses/:id
router.delete("/:id", deleteExpense);

export default router;
