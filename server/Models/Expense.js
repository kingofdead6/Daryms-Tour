import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Expense title is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "Salaries",
        "Marketing",
        "Office Rent",
        "Utilities",
        "Transportation",
        "Supplier Payment",
        "Software & Tools",
        "Maintenance",
        "Insurance",
        "Taxes",
        "Other",
      ],
      default: "Other",
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    date: {
      type: Date,
      required: [true, "Expense date is required"],
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      enum: ["bank_transfer", "cash", "credit_card", "paypal", "other"],
      default: "bank_transfer",
    },
    vendor: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Expense", expenseSchema);
