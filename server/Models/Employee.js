import mongoose from "mongoose";

export const EMPLOYEE_DEPARTMENTS = [
  "Management",
  "Sales",
  "Operations",
  "Marketing",
  "Finance",
  "Customer Support",
  "Guides",
  "IT",
  "Other",
];

export const EMPLOYEE_CONTRACTS = ["full_time", "part_time", "freelance", "intern"];

export const EMPLOYEE_STATUSES = ["active", "on_leave", "terminated"];

const employeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Employee name is required"],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    position: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      enum: EMPLOYEE_DEPARTMENTS,
      default: "Other",
    },
    contractType: {
      type: String,
      enum: EMPLOYEE_CONTRACTS,
      default: "full_time",
    },
    // Gross monthly salary — the base used when generating payroll bills.
    monthlySalary: {
      type: Number,
      required: [true, "Monthly salary is required"],
      min: [0, "Salary cannot be negative"],
    },
    status: {
      type: String,
      enum: EMPLOYEE_STATUSES,
      default: "active",
    },
    hireDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      default: null,
    },
    paymentMethod: {
      type: String,
      enum: ["bank_transfer", "cash", "credit_card", "paypal", "other"],
      default: "bank_transfer",
    },
    bankAccount: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Employee", employeeSchema);
