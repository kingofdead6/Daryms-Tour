import express from "express";
import {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  getPayrollStats,
} from "../Controllers/EmployeeController.js";
import { protect, admin, superadmin } from "../Middleware/auth.js";

const router = express.Router();

router.use(protect, admin);

// GET /api/employees/payroll-stats  → headcount, salary mass, payroll spend
router.get("/payroll-stats", getPayrollStats);

router.get("/", getAllEmployees);
router.get("/:id", getEmployeeById);

// Creating, editing and removing staff records is a superadmin action.
router.post("/", superadmin, createEmployee);
router.patch("/:id", superadmin, updateEmployee);
router.delete("/:id", superadmin, deleteEmployee);

export default router;
