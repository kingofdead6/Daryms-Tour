import asyncHandler from "express-async-handler";
import Income from "../Models/Income.js";

const INCOME_CATEGORIES = [
  "Booking Payment",
  "Package Sale",
  "Destination Sale",
  "Deposit",
  "Commission",
  "Refund Received",
  "Investment",
  "Other",
];

export const createIncome = asyncHandler(async (req, res) => {
  const { title, category, amount, date, paymentMethod, source, notes } = req.body;

  if (!title || !category || amount === undefined || amount === null) {
    res.status(400);
    throw new Error("Title, category and amount are required");
  }

  if (!INCOME_CATEGORIES.includes(category)) {
    res.status(400);
    throw new Error("Invalid category");
  }

  const income = await Income.create({
    title: title.trim(),
    category,
    amount: Number(amount),
    date: date ? new Date(date) : new Date(),
    paymentMethod: paymentMethod || "bank_transfer",
    source: source?.trim() || "",
    notes: notes?.trim() || "",
    createdBy: req.user?._id || null,
  });

  res.status(201).json(income);
});

export const getAllIncome = asyncHandler(async (req, res) => {
  const { category, search, from, to } = req.query;

  const filter = {};
  if (category && category !== "all") filter.category = category;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { source: { $regex: search, $options: "i" } },
    ];
  }
  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = new Date(from);
    if (to) filter.date.$lte = new Date(to);
  }

  const income = await Income.find(filter).sort({ date: -1 });
  res.status(200).json(income);
});

export const getIncomeById = asyncHandler(async (req, res) => {
  const income = await Income.findById(req.params.id);
  if (!income) {
    res.status(404);
    throw new Error("Income entry not found");
  }
  res.status(200).json(income);
});

export const updateIncome = asyncHandler(async (req, res) => {
  const income = await Income.findById(req.params.id);
  if (!income) {
    res.status(404);
    throw new Error("Income entry not found");
  }

  const { title, category, amount, date, paymentMethod, source, notes } = req.body;

  if (category && !INCOME_CATEGORIES.includes(category)) {
    res.status(400);
    throw new Error("Invalid category");
  }

  if (title !== undefined) income.title = title.trim();
  if (category !== undefined) income.category = category;
  if (amount !== undefined) income.amount = Number(amount);
  if (date !== undefined) income.date = new Date(date);
  if (paymentMethod !== undefined) income.paymentMethod = paymentMethod;
  if (source !== undefined) income.source = source.trim();
  if (notes !== undefined) income.notes = notes.trim();

  await income.save();
  res.status(200).json(income);
});

export const deleteIncome = asyncHandler(async (req, res) => {
  const income = await Income.findById(req.params.id);
  if (!income) {
    res.status(404);
    throw new Error("Income entry not found");
  }
  await Income.findByIdAndDelete(req.params.id);
  res.status(200).json({ message: "Income entry deleted" });
});
