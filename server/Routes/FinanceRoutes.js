import express from "express";
import { getFinanceSummary } from "../Controllers/FinanceController.js";
import { protect, admin } from "../Middleware/auth.js";

const router = express.Router();

// Financial records are admin-only.
router.use(protect, admin);

// GET /api/finance/summary        → combined finance summary (manual income + expenses)
router.get("/summary", getFinanceSummary);

export default router;
