import express from "express";
import { getFinanceSummary } from "../Controllers/FinanceController.js";

const router = express.Router();

// GET /api/finance/summary        → combined finance summary (manual income + expenses)
router.get("/summary", getFinanceSummary);

export default router;
