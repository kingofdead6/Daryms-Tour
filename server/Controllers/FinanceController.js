import asyncHandler from "express-async-handler";
import Income from "../Models/Income.js";
import Expense from "../Models/Expense.js";

// ─── Finance summary: combines manually-entered income with expenses ────────
export const getFinanceSummary = asyncHandler(async (req, res) => {
  const { year } = req.query;
  const targetYear = year ? Number(year) : new Date().getFullYear();

  // Total income (all manually entered income entries)
  const incomeAgg = await Income.aggregate([
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  const totalIncome = incomeAgg[0]?.total || 0;

  // Total expenses
  const expenseAgg = await Expense.aggregate([
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  const totalExpenses = expenseAgg[0]?.total || 0;

  const netProfit = totalIncome - totalExpenses;

  // Income grouped by category
  const incomeByCategory = await Income.aggregate([
    { $group: { _id: "$category", total: { $sum: "$amount" } } },
    { $sort: { total: -1 } },
  ]);

  // Expenses grouped by category
  const expensesByCategory = await Expense.aggregate([
    { $group: { _id: "$category", total: { $sum: "$amount" } } },
    { $sort: { total: -1 } },
  ]);

  // Monthly income for target year
  const monthlyIncome = await Income.aggregate([
    {
      $match: {
        date: {
          $gte: new Date(`${targetYear}-01-01`),
          $lte: new Date(`${targetYear}-12-31T23:59:59.999Z`),
        },
      },
    },
    {
      $group: {
        _id: { $month: "$date" },
        total: { $sum: "$amount" },
      },
    },
  ]);

  // Monthly expenses for target year
  const monthlyExpenses = await Expense.aggregate([
    {
      $match: {
        date: {
          $gte: new Date(`${targetYear}-01-01`),
          $lte: new Date(`${targetYear}-12-31T23:59:59.999Z`),
        },
      },
    },
    {
      $group: {
        _id: { $month: "$date" },
        total: { $sum: "$amount" },
      },
    },
  ]);

  const monthlyBreakdown = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const income = monthlyIncome.find((m) => m._id === month)?.total || 0;
    const expenses = monthlyExpenses.find((m) => m._id === month)?.total || 0;
    return { month, income, expenses, net: income - expenses };
  });

  res.status(200).json({
    year: targetYear,
    totalIncome,
    totalExpenses,
    netProfit,
    incomeByCategory,
    expensesByCategory,
    monthlyBreakdown,
    incomeCount: await Income.countDocuments(),
    expensesCount: await Expense.countDocuments(),
  });
});
