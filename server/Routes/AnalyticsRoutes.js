import express from "express";
import { getAdminAnalytics, getSuperAdminAnalytics } from "../Controllers/AnalyticsController.js";
import { protect, admin, superadmin } from "../Middleware/auth.js";

const router = express.Router();

// GET /api/analytics/overview    → operational + revenue stats (admin & superadmin)
router.get("/overview", protect, admin, getAdminAnalytics);

// GET /api/analytics/superadmin  → company-wide stats (superadmin only)
router.get("/superadmin", protect, superadmin, getSuperAdminAnalytics);

export default router;
