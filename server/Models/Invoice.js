import mongoose from "mongoose";

// "incoming" → money coming IN  (invoices we issue to clients)
// "outgoing" → money going OUT  (bills we receive: salaries, suppliers, rent…)
export const INVOICE_DIRECTIONS = ["incoming", "outgoing"];

export const INCOMING_CATEGORIES = [
  "Booking Payment",
  "Package Sale",
  "Destination Sale",
  "Deposit",
  "Commission",
  "Other",
];

export const OUTGOING_CATEGORIES = [
  "Employee Salary",
  "Supplier Payment",
  "Marketing",
  "Office Rent",
  "Utilities",
  "Transportation",
  "Software & Tools",
  "Maintenance",
  "Insurance",
  "Taxes",
  "Refund Issued",
  "Other",
];

export const INVOICE_STATUSES = [
  "draft",
  "sent",
  "partially_paid",
  "paid",
  "overdue",
  "cancelled",
];

export const PAYMENT_METHODS = ["bank_transfer", "cash", "credit_card", "paypal", "other"];

const lineItemSchema = new mongoose.Schema(
  {
    description: { type: String, required: true, trim: true },
    quantity: { type: Number, default: 1, min: 0 },
    unitPrice: { type: Number, default: 0, min: 0 },
    total: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const paymentSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true, min: 0 },
    date: { type: Date, default: Date.now },
    method: { type: String, enum: PAYMENT_METHODS, default: "bank_transfer" },
    reference: { type: String, trim: true },
    note: { type: String, trim: true },
  },
  { _id: true, timestamps: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      unique: true,
      index: true,
    },
    direction: {
      type: String,
      enum: INVOICE_DIRECTIONS,
      required: [true, "Invoice direction is required"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
    },

    // ─── Counterparty (client for incoming, vendor/employee for outgoing) ───
    party: {
      name: { type: String, required: [true, "Party name is required"], trim: true },
      email: { type: String, trim: true, lowercase: true },
      phone: { type: String, trim: true },
      address: { type: String, trim: true },
      taxId: { type: String, trim: true },
    },

    // ─── Optional links to other records ──────────────────────────────────
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", default: null },
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", default: null },

    // Payroll bills carry the period they cover, e.g. "2026-07".
    payrollPeriod: { type: String, default: null },

    // ─── Dates ────────────────────────────────────────────────────────────
    issueDate: { type: Date, default: Date.now },
    dueDate: { type: Date, default: null },

    // ─── Amounts ──────────────────────────────────────────────────────────
    items: { type: [lineItemSchema], default: [] },
    subtotal: { type: Number, default: 0, min: 0 },
    taxRate: { type: Number, default: 0, min: 0, max: 100 },
    taxAmount: { type: Number, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    total: { type: Number, default: 0, min: 0 },
    amountPaid: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: "USD", trim: true },

    payments: { type: [paymentSchema], default: [] },
    paymentMethod: { type: String, enum: PAYMENT_METHODS, default: "bank_transfer" },

    status: { type: String, enum: INVOICE_STATUSES, default: "draft" },

    notes: { type: String, trim: true },
    terms: { type: String, trim: true },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

invoiceSchema.virtual("balanceDue").get(function () {
  return Math.max(0, Number((this.total - this.amountPaid).toFixed(2)));
});

invoiceSchema.virtual("isOverdue").get(function () {
  if (!this.dueDate) return false;
  if (["paid", "cancelled"].includes(this.status)) return false;
  return new Date(this.dueDate) < new Date();
});

// Recompute every derived amount from the line items so the totals can never
// drift away from what is actually printed on the invoice.
invoiceSchema.methods.recalculate = function () {
  this.items = (this.items || []).map((item) => {
    const quantity = Number(item.quantity) || 0;
    const unitPrice = Number(item.unitPrice) || 0;
    return {
      description: item.description,
      quantity,
      unitPrice,
      total: Number((quantity * unitPrice).toFixed(2)),
    };
  });

  const subtotal = this.items.reduce((sum, item) => sum + item.total, 0);
  const discount = Math.min(Number(this.discount) || 0, subtotal);
  const taxable = subtotal - discount;
  const taxAmount = Number(((taxable * (Number(this.taxRate) || 0)) / 100).toFixed(2));

  this.subtotal = Number(subtotal.toFixed(2));
  this.discount = Number(discount.toFixed(2));
  this.taxAmount = taxAmount;
  this.total = Number((taxable + taxAmount).toFixed(2));
  this.amountPaid = Number(
    (this.payments || []).reduce((sum, p) => sum + (Number(p.amount) || 0), 0).toFixed(2)
  );

  return this;
};

// Derive the lifecycle status from what has actually been paid. Manual states
// (draft / sent / cancelled) are preserved while nothing has been paid yet.
invoiceSchema.methods.syncStatus = function () {
  if (this.status === "cancelled") return this;

  if (this.total > 0 && this.amountPaid >= this.total) {
    this.status = "paid";
  } else if (this.amountPaid > 0) {
    this.status = "partially_paid";
  } else if (this.dueDate && new Date(this.dueDate) < new Date() && this.status !== "draft") {
    this.status = "overdue";
  } else if (this.status === "paid" || this.status === "partially_paid" || this.status === "overdue") {
    this.status = "sent";
  }

  return this;
};

invoiceSchema.pre("validate", async function () {
  this.recalculate();
  this.syncStatus();

  if (!this.invoiceNumber) {
    const prefix = this.direction === "incoming" ? "INV" : "BILL";
    const year = new Date(this.issueDate || Date.now()).getFullYear();
    const pattern = new RegExp(`^${prefix}-${year}-`);

    const last = await this.constructor
      .findOne({ invoiceNumber: pattern })
      .sort({ invoiceNumber: -1 })
      .select("invoiceNumber")
      .lean();

    const lastSeq = last ? Number(last.invoiceNumber.split("-").pop()) : 0;
    this.invoiceNumber = `${prefix}-${year}-${String(lastSeq + 1).padStart(4, "0")}`;
  }
});

export default mongoose.model("Invoice", invoiceSchema);
