import mongoose from "mongoose";

const incomeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Income title is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "Booking Payment",
        "Package Sale",
        "Destination Sale",
        "Deposit",
        "Commission",
        "Refund Received",
        "Investment",
        "Other",
      ],
      default: "Booking Payment",
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    date: {
      type: Date,
      required: [true, "Income date is required"],
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      enum: ["bank_transfer", "cash", "credit_card", "paypal", "other"],
      default: "bank_transfer",
    },
    source: {
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
    // Set when the entry was posted automatically from an invoice payment.
    invoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
      default: null,
    },
    invoicePayment: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Income", incomeSchema);
