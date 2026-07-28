import asyncHandler from "express-async-handler";
import Invoice, {
  INVOICE_DIRECTIONS,
  INCOMING_CATEGORIES,
  OUTGOING_CATEGORIES,
  INVOICE_STATUSES,
} from "../Models/Invoice.js";
import Employee from "../Models/Employee.js";
import Booking from "../Models/Booking.js";
import Income from "../Models/Income.js";
import Expense from "../Models/Expense.js";

// Invoice categories map onto the manual ledger categories so a single
// payment shows up in exactly one place on the Finance page.
const INCOME_CATEGORY_MAP = {
  "Booking Payment": "Booking Payment",
  "Package Sale": "Package Sale",
  "Destination Sale": "Destination Sale",
  Deposit: "Deposit",
  Commission: "Commission",
  Other: "Other",
};

const EXPENSE_CATEGORY_MAP = {
  "Employee Salary": "Salaries",
  "Supplier Payment": "Supplier Payment",
  Marketing: "Marketing",
  "Office Rent": "Office Rent",
  Utilities: "Utilities",
  Transportation: "Transportation",
  "Software & Tools": "Software & Tools",
  Maintenance: "Maintenance",
  Insurance: "Insurance",
  Taxes: "Taxes",
  "Refund Issued": "Other",
  Other: "Other",
};

const categoriesFor = (direction) =>
  direction === "incoming" ? INCOMING_CATEGORIES : OUTGOING_CATEGORIES;

const normalizeItems = (items) => {
  if (!Array.isArray(items)) return [];
  return items
    .filter((item) => item && String(item.description || "").trim())
    .map((item) => ({
      description: String(item.description).trim(),
      quantity: Number(item.quantity) || 0,
      unitPrice: Number(item.unitPrice) || 0,
    }));
};

// Mirror an invoice payment into the Income / Expense ledger.
const postPaymentToLedger = async (invoice, payment, userId) => {
  const shared = {
    title: `${invoice.invoiceNumber} — ${invoice.party?.name || "Unknown"}`,
    amount: Number(payment.amount),
    date: payment.date || new Date(),
    paymentMethod: payment.method || invoice.paymentMethod,
    notes: payment.note || "",
    createdBy: userId || null,
    invoice: invoice._id,
    invoicePayment: payment._id,
  };

  if (invoice.direction === "incoming") {
    await Income.create({
      ...shared,
      category: INCOME_CATEGORY_MAP[invoice.category] || "Other",
      source: invoice.party?.name || "",
    });
  } else {
    await Expense.create({
      ...shared,
      category: EXPENSE_CATEGORY_MAP[invoice.category] || "Other",
      vendor: invoice.party?.name || "",
    });
  }
};

const removeLedgerEntries = async (invoiceId) => {
  await Promise.all([
    Income.deleteMany({ invoice: invoiceId }),
    Expense.deleteMany({ invoice: invoiceId }),
  ]);
};

const populated = (query) =>
  query
    .populate("employee", "name position department monthlySalary")
    .populate("booking", "referenceCode firstName lastName totalAmount status");

// ─── Create ─────────────────────────────────────────────────────────────────
export const createInvoice = asyncHandler(async (req, res) => {
  const {
    direction,
    category,
    party,
    items,
    taxRate,
    discount,
    issueDate,
    dueDate,
    status,
    notes,
    terms,
    paymentMethod,
    currency,
    booking,
    employee,
    payrollPeriod,
  } = req.body;

  if (!INVOICE_DIRECTIONS.includes(direction)) {
    res.status(400);
    throw new Error("Direction must be 'incoming' or 'outgoing'");
  }

  if (!categoriesFor(direction).includes(category)) {
    res.status(400);
    throw new Error("Invalid category for this invoice direction");
  }

  if (!party?.name?.trim()) {
    res.status(400);
    throw new Error("Party name is required");
  }

  const normalizedItems = normalizeItems(items);
  if (normalizedItems.length === 0) {
    res.status(400);
    throw new Error("At least one line item is required");
  }

  const invoice = new Invoice({
    direction,
    category,
    party: {
      name: party.name.trim(),
      email: party.email?.trim() || "",
      phone: party.phone?.trim() || "",
      address: party.address?.trim() || "",
      taxId: party.taxId?.trim() || "",
    },
    items: normalizedItems,
    taxRate: Number(taxRate) || 0,
    discount: Number(discount) || 0,
    issueDate: issueDate ? new Date(issueDate) : new Date(),
    dueDate: dueDate ? new Date(dueDate) : null,
    status: INVOICE_STATUSES.includes(status) ? status : "draft",
    notes: notes?.trim() || "",
    terms: terms?.trim() || "",
    paymentMethod: paymentMethod || "bank_transfer",
    currency: currency || "USD",
    booking: booking || null,
    employee: employee || null,
    payrollPeriod: payrollPeriod || null,
    createdBy: req.user?._id || null,
  });

  await invoice.save();
  res.status(201).json(await populated(Invoice.findById(invoice._id)));
});

// ─── Read ───────────────────────────────────────────────────────────────────
export const getAllInvoices = asyncHandler(async (req, res) => {
  const { direction, status, category, search, from, to, employee } = req.query;

  const filter = {};
  if (direction && direction !== "all") filter.direction = direction;
  if (status && status !== "all") filter.status = status;
  if (category && category !== "all") filter.category = category;
  if (employee) filter.employee = employee;
  if (search) {
    filter.$or = [
      { invoiceNumber: { $regex: search, $options: "i" } },
      { "party.name": { $regex: search, $options: "i" } },
      { "party.email": { $regex: search, $options: "i" } },
      { notes: { $regex: search, $options: "i" } },
    ];
  }
  if (from || to) {
    filter.issueDate = {};
    if (from) filter.issueDate.$gte = new Date(from);
    if (to) filter.issueDate.$lte = new Date(to);
  }

  const invoices = await populated(Invoice.find(filter).sort({ issueDate: -1, createdAt: -1 }));
  res.status(200).json(invoices);
});

export const getInvoiceById = asyncHandler(async (req, res) => {
  const invoice = await populated(Invoice.findById(req.params.id));
  if (!invoice) {
    res.status(404);
    throw new Error("Invoice not found");
  }
  res.status(200).json(invoice);
});

// ─── Update ─────────────────────────────────────────────────────────────────
export const updateInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id);
  if (!invoice) {
    res.status(404);
    throw new Error("Invoice not found");
  }

  const {
    category,
    party,
    items,
    taxRate,
    discount,
    issueDate,
    dueDate,
    status,
    notes,
    terms,
    paymentMethod,
    currency,
    booking,
    employee,
  } = req.body;

  if (category !== undefined) {
    if (!categoriesFor(invoice.direction).includes(category)) {
      res.status(400);
      throw new Error("Invalid category for this invoice direction");
    }
    invoice.category = category;
  }

  if (party !== undefined) {
    invoice.party = {
      name: party.name?.trim() || invoice.party.name,
      email: party.email?.trim() || "",
      phone: party.phone?.trim() || "",
      address: party.address?.trim() || "",
      taxId: party.taxId?.trim() || "",
    };
  }

  if (items !== undefined) {
    const normalizedItems = normalizeItems(items);
    if (normalizedItems.length === 0) {
      res.status(400);
      throw new Error("At least one line item is required");
    }
    invoice.items = normalizedItems;
  }

  if (taxRate !== undefined) invoice.taxRate = Number(taxRate) || 0;
  if (discount !== undefined) invoice.discount = Number(discount) || 0;
  if (issueDate !== undefined) invoice.issueDate = new Date(issueDate);
  if (dueDate !== undefined) invoice.dueDate = dueDate ? new Date(dueDate) : null;
  if (notes !== undefined) invoice.notes = notes.trim();
  if (terms !== undefined) invoice.terms = terms.trim();
  if (paymentMethod !== undefined) invoice.paymentMethod = paymentMethod;
  if (currency !== undefined) invoice.currency = currency;
  if (booking !== undefined) invoice.booking = booking || null;
  if (employee !== undefined) invoice.employee = employee || null;

  if (status !== undefined) {
    if (!INVOICE_STATUSES.includes(status)) {
      res.status(400);
      throw new Error("Invalid status");
    }
    invoice.status = status;
  }

  await invoice.save();
  res.status(200).json(await populated(Invoice.findById(invoice._id)));
});

export const updateInvoiceStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!INVOICE_STATUSES.includes(status)) {
    res.status(400);
    throw new Error("Invalid status");
  }

  const invoice = await Invoice.findById(req.params.id);
  if (!invoice) {
    res.status(404);
    throw new Error("Invoice not found");
  }

  invoice.status = status;
  await invoice.save();
  res.status(200).json(await populated(Invoice.findById(invoice._id)));
});

// ─── Payments ───────────────────────────────────────────────────────────────
export const recordPayment = asyncHandler(async (req, res) => {
  const { amount, date, method, reference, note } = req.body;

  const invoice = await Invoice.findById(req.params.id);
  if (!invoice) {
    res.status(404);
    throw new Error("Invoice not found");
  }

  const value = Number(amount);
  if (!value || value <= 0) {
    res.status(400);
    throw new Error("A positive payment amount is required");
  }

  const outstanding = Number((invoice.total - invoice.amountPaid).toFixed(2));
  if (value > outstanding) {
    res.status(400);
    throw new Error(`Payment exceeds the outstanding balance of ${outstanding}`);
  }

  invoice.payments.push({
    amount: value,
    date: date ? new Date(date) : new Date(),
    method: method || invoice.paymentMethod,
    reference: reference?.trim() || "",
    note: note?.trim() || "",
  });

  await invoice.save();

  const payment = invoice.payments[invoice.payments.length - 1];
  await postPaymentToLedger(invoice, payment, req.user?._id);

  res.status(200).json(await populated(Invoice.findById(invoice._id)));
});

export const deletePayment = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id);
  if (!invoice) {
    res.status(404);
    throw new Error("Invoice not found");
  }

  const payment = invoice.payments.id(req.params.paymentId);
  if (!payment) {
    res.status(404);
    throw new Error("Payment not found");
  }

  payment.deleteOne();
  await invoice.save();

  await Promise.all([
    Income.deleteMany({ invoicePayment: req.params.paymentId }),
    Expense.deleteMany({ invoicePayment: req.params.paymentId }),
  ]);

  res.status(200).json(await populated(Invoice.findById(invoice._id)));
});

// ─── Delete ─────────────────────────────────────────────────────────────────
export const deleteInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id);
  if (!invoice) {
    res.status(404);
    throw new Error("Invoice not found");
  }

  await removeLedgerEntries(invoice._id);
  await Invoice.findByIdAndDelete(req.params.id);

  res.status(200).json({ message: "Invoice deleted" });
});

// ─── Create an invoice straight from a booking ──────────────────────────────
export const createInvoiceFromBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.bookingId)
    .populate("destination", "name")
    .populate("package", "title");

  if (!booking) {
    res.status(404);
    throw new Error("Booking not found");
  }

  const existing = await Invoice.findOne({ booking: booking._id, direction: "incoming" });
  if (existing) {
    res.status(400);
    throw new Error(`This booking is already invoiced (${existing.invoiceNumber})`);
  }

  const tripName =
    booking.bookingType === "destination"
      ? booking.destination?.name || "Destination trip"
      : booking.package?.title || "Travel package";

  const invoice = new Invoice({
    direction: "incoming",
    category: booking.bookingType === "package" ? "Package Sale" : "Destination Sale",
    party: {
      name: `${booking.firstName} ${booking.lastName}`,
      email: booking.email,
      phone: booking.phone,
    },
    booking: booking._id,
    issueDate: new Date(),
    dueDate: booking.departureDate,
    items: [
      {
        description: `${tripName} — ${booking.referenceCode}`,
        quantity: booking.totalTravelers || 1,
        unitPrice: booking.pricePerPerson || 0,
      },
    ],
    // Bookings already store their tax as an absolute amount; express it as a
    // rate so the invoice total lands on the same number.
    taxRate: booking.subtotal ? Number(((booking.taxes / booking.subtotal) * 100).toFixed(2)) : 0,
    discount: booking.discount || 0,
    status: "sent",
    paymentMethod: booking.paymentMethod === "credit_card" ? "credit_card" : "bank_transfer",
    notes: `Auto-generated from booking ${booking.referenceCode}`,
    createdBy: req.user?._id || null,
  });

  await invoice.save();
  res.status(201).json(await populated(Invoice.findById(invoice._id)));
});

// ─── Payroll run: one salary bill per active employee for a month ───────────
export const generatePayroll = asyncHandler(async (req, res) => {
  const { period, dueDate } = req.body; // period → "YYYY-MM"

  if (!/^\d{4}-\d{2}$/.test(period || "")) {
    res.status(400);
    throw new Error("Period must be in YYYY-MM format");
  }

  const [year, month] = period.split("-").map(Number);
  const issueDate = new Date(Date.UTC(year, month - 1, 1));
  const periodLabel = issueDate.toLocaleString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });

  const employees = await Employee.find({ status: "active" });
  if (employees.length === 0) {
    res.status(400);
    throw new Error("No active employees to generate payroll for");
  }

  const alreadyBilled = await Invoice.find({ payrollPeriod: period }).select("employee").lean();
  const billedIds = new Set(alreadyBilled.map((i) => String(i.employee)));

  const created = [];
  const skipped = [];

  for (const employee of employees) {
    if (billedIds.has(String(employee._id))) {
      skipped.push(employee.name);
      continue;
    }

    const invoice = new Invoice({
      direction: "outgoing",
      category: "Employee Salary",
      party: {
        name: employee.name,
        email: employee.email || "",
        phone: employee.phone || "",
      },
      employee: employee._id,
      payrollPeriod: period,
      issueDate,
      dueDate: dueDate ? new Date(dueDate) : new Date(Date.UTC(year, month, 0)),
      items: [
        {
          description: `Salary — ${employee.position || employee.department} (${periodLabel})`,
          quantity: 1,
          unitPrice: employee.monthlySalary,
        },
      ],
      status: "sent",
      paymentMethod: employee.paymentMethod,
      notes: `Payroll run for ${periodLabel}`,
      createdBy: req.user?._id || null,
    });

    // Saved one at a time on purpose: invoice numbers are sequential.
    await invoice.save();
    created.push(invoice);
  }

  res.status(201).json({
    period,
    periodLabel,
    createdCount: created.length,
    skippedCount: skipped.length,
    skipped,
    totalAmount: Number(created.reduce((sum, i) => sum + i.total, 0).toFixed(2)),
    invoices: created,
  });
});

// ─── Stats ──────────────────────────────────────────────────────────────────
export const getInvoiceStats = asyncHandler(async (req, res) => {
  const year = Number(req.query.year) || new Date().getFullYear();
  const start = new Date(Date.UTC(year, 0, 1));
  const end = new Date(Date.UTC(year + 1, 0, 1));
  const now = new Date();

  const byDirection = await Invoice.aggregate([
    { $match: { status: { $ne: "cancelled" } } },
    {
      $group: {
        _id: "$direction",
        invoiced: { $sum: "$total" },
        collected: { $sum: "$amountPaid" },
        count: { $sum: 1 },
      },
    },
  ]);

  const read = (direction) => {
    const row = byDirection.find((d) => d._id === direction);
    return {
      invoiced: Number((row?.invoiced || 0).toFixed(2)),
      collected: Number((row?.collected || 0).toFixed(2)),
      outstanding: Number(((row?.invoiced || 0) - (row?.collected || 0)).toFixed(2)),
      count: row?.count || 0,
    };
  };

  const incoming = read("incoming");
  const outgoing = read("outgoing");

  const statusBreakdown = await Invoice.aggregate([
    { $group: { _id: { direction: "$direction", status: "$status" }, count: { $sum: 1 }, total: { $sum: "$total" } } },
  ]);

  const overdue = await Invoice.aggregate([
    {
      $match: {
        dueDate: { $lt: now },
        status: { $nin: ["paid", "cancelled", "draft"] },
      },
    },
    {
      $group: {
        _id: "$direction",
        count: { $sum: 1 },
        amount: { $sum: { $subtract: ["$total", "$amountPaid"] } },
      },
    },
  ]);

  // Cash actually moved, month by month, from recorded payments.
  const monthlyCash = await Invoice.aggregate([
    { $unwind: "$payments" },
    { $match: { "payments.date": { $gte: start, $lt: end } } },
    {
      $group: {
        _id: { month: { $month: "$payments.date" }, direction: "$direction" },
        total: { $sum: "$payments.amount" },
      },
    },
  ]);

  const monthlyInvoiced = await Invoice.aggregate([
    { $match: { issueDate: { $gte: start, $lt: end }, status: { $ne: "cancelled" } } },
    {
      $group: {
        _id: { month: { $month: "$issueDate" }, direction: "$direction" },
        total: { $sum: "$total" },
      },
    },
  ]);

  const pick = (rows, month, direction) =>
    Number((rows.find((r) => r._id.month === month && r._id.direction === direction)?.total || 0).toFixed(2));

  const monthly = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    return {
      month,
      cashIn: pick(monthlyCash, month, "incoming"),
      cashOut: pick(monthlyCash, month, "outgoing"),
      invoicedIn: pick(monthlyInvoiced, month, "incoming"),
      billedOut: pick(monthlyInvoiced, month, "outgoing"),
    };
  });

  const byCategory = await Invoice.aggregate([
    { $match: { status: { $ne: "cancelled" } } },
    { $group: { _id: { direction: "$direction", category: "$category" }, total: { $sum: "$total" }, count: { $sum: 1 } } },
    { $sort: { total: -1 } },
  ]);

  const payrollAgg = await Invoice.aggregate([
    { $match: { direction: "outgoing", category: "Employee Salary", status: { $ne: "cancelled" } } },
    {
      $group: {
        _id: "$payrollPeriod",
        total: { $sum: "$total" },
        paid: { $sum: "$amountPaid" },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Ageing buckets on what is still owed to us.
  const receivables = await Invoice.find({
    direction: "incoming",
    status: { $nin: ["paid", "cancelled", "draft"] },
  })
    .select("total amountPaid dueDate party invoiceNumber")
    .lean();

  const buckets = { current: 0, "1-30": 0, "31-60": 0, "60+": 0 };
  receivables.forEach((inv) => {
    const balance = inv.total - inv.amountPaid;
    if (balance <= 0) return;
    const days = inv.dueDate ? Math.floor((now - new Date(inv.dueDate)) / 86400000) : 0;
    if (days <= 0) buckets.current += balance;
    else if (days <= 30) buckets["1-30"] += balance;
    else if (days <= 60) buckets["31-60"] += balance;
    else buckets["60+"] += balance;
  });

  res.status(200).json({
    year,
    incoming,
    outgoing,
    netCashPosition: Number((incoming.collected - outgoing.collected).toFixed(2)),
    statusBreakdown: statusBreakdown.map((s) => ({
      direction: s._id.direction,
      status: s._id.status,
      count: s.count,
      total: Number(s.total.toFixed(2)),
    })),
    overdue: {
      incoming: overdue.find((o) => o._id === "incoming") || { count: 0, amount: 0 },
      outgoing: overdue.find((o) => o._id === "outgoing") || { count: 0, amount: 0 },
    },
    monthly,
    byCategory: byCategory.map((c) => ({
      direction: c._id.direction,
      category: c._id.category,
      total: Number(c.total.toFixed(2)),
      count: c.count,
    })),
    payrollByPeriod: payrollAgg
      .filter((p) => p._id)
      .map((p) => ({
        period: p._id,
        total: Number(p.total.toFixed(2)),
        paid: Number(p.paid.toFixed(2)),
        count: p.count,
      })),
    receivablesAgeing: Object.entries(buckets).map(([bucket, amount]) => ({
      bucket,
      amount: Number(amount.toFixed(2)),
    })),
  });
});
