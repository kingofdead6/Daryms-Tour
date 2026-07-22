import asyncHandler from "express-async-handler";
import Expense from "../Models/Expense.js";

const EXPENSE_CATEGORIES = [
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
];

export const createExpense = asyncHandler(async (req, res) => {
  const { title, category, amount, date, paymentMethod, vendor, notes } = req.body;

  if (!title || !category || amount === undefined || amount === null) {
    res.status(400);
    throw new Error("Title, category and amount are required");
  }

  if (!EXPENSE_CATEGORIES.includes(category)) {
    res.status(400);
    throw new Error("Invalid category");
  }

  const expense = await Expense.create({
    title: title.trim(),
    category,
    amount: Number(amount),
    date: date ? new Date(date) : new Date(),
    paymentMethod: paymentMethod || "bank_transfer",
    vendor: vendor?.trim() || "",
    notes: notes?.trim() || "",
    createdBy: req.user?._id || null,
  });

  res.status(201).json(expense);
});

export const getAllExpenses = asyncHandler(async (req, res) => {
  const { category, search, from, to } = req.query;

  const filter = {};
  if (category && category !== "all") filter.category = category;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { vendor: { $regex: search, $options: "i" } },
    ];
  }
  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = new Date(from);
    if (to) filter.date.$lte = new Date(to);
  }

  const expenses = await Expense.find(filter).sort({ date: -1 });
  res.status(200).json(expenses);
});

export const getExpenseById = asyncHandler(async (req, res) => {
  const expense = await Expense.findById(req.params.id);
  if (!expense) {
    res.status(404);
    throw new Error("Expense not found");
  }
  res.status(200).json(expense);
});

export const updateExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findById(req.params.id);
  if (!expense) {
    res.status(404);
    throw new Error("Expense not found");
  }

  const { title, category, amount, date, paymentMethod, vendor, notes } = req.body;

  if (category && !EXPENSE_CATEGORIES.includes(category)) {
    res.status(400);
    throw new Error("Invalid category");
  }

  if (title !== undefined) expense.title = title.trim();
  if (category !== undefined) expense.category = category;
  if (amount !== undefined) expense.amount = Number(amount);
  if (date !== undefined) expense.date = new Date(date);
  if (paymentMethod !== undefined) expense.paymentMethod = paymentMethod;
  if (vendor !== undefined) expense.vendor = vendor.trim();
  if (notes !== undefined) expense.notes = notes.trim();

  await expense.save();
  res.status(200).json(expense);
});

export const deleteExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findById(req.params.id);
  if (!expense) {
    res.status(404);
    throw new Error("Expense not found");
  }
  await Expense.findByIdAndDelete(req.params.id);
  res.status(200).json({ message: "Expense deleted" });
});
