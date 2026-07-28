"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
  ArrowLeft, Loader2, Trash2, X, TrendingUp, TrendingDown,
  PiggyBank, RefreshCw, Pencil, Receipt, ArrowDownCircle, ArrowUpCircle,
  FileText, Users, Link2,
} from "lucide-react";
import { Link } from "react-router-dom";

import adminApi, { apiError, formatCurrency, MONTH_LABELS } from "./adminApi";
import {
  BarChart, ChartCard, HorizontalBarChart, StatTile, StatusPill,
  SERIES_COLORS, STATUS_COLORS, FLOW_COLORS,
} from "./Charts";

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

const PAYMENT_METHODS = ["bank_transfer", "cash", "credit_card", "paypal", "other"];

function emptyForm(type) {
  return {
    title: "",
    category: type === "income" ? "Booking Payment" : "Other",
    amount: "",
    date: new Date().toISOString().slice(0, 10),
    paymentMethod: "bank_transfer",
    partyName: "",
    notes: "",
  };
}

// ─── Entry Modal (shared for income + expense) ──────────────────────────────
function EntryModal({ type, initial, onClose, onSaved }) {
  const isIncome = type === "income";
  const categories = isIncome ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const endpoint = isIncome ? "income" : "expenses";
  const partyLabel = isIncome ? "Source / Payer (optional)" : "Vendor / Payee (optional)";
  const partyField = isIncome ? "source" : "vendor";

  const [form, setForm] = useState(initial ? {
    title: initial.title,
    category: initial.category,
    amount: initial.amount,
    date: new Date(initial.date).toISOString().slice(0, 10),
    paymentMethod: initial.paymentMethod,
    partyName: (isIncome ? initial.source : initial.vendor) || "",
    notes: initial.notes || "",
  } : emptyForm(type));
  const [saving, setSaving] = useState(false);

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.amount) {
      toast.error("Title and amount are required");
      return;
    }
    setSaving(true);
    const payload = {
      title: form.title,
      category: form.category,
      amount: form.amount,
      date: form.date,
      paymentMethod: form.paymentMethod,
      notes: form.notes,
      [partyField]: form.partyName,
    };
    try {
      if (initial) {
        const res = await adminApi.patch(`/${endpoint}/${initial._id}`, payload);
        onSaved(res.data, true);
      } else {
        const res = await adminApi.post(`/${endpoint}`, payload);
        onSaved(res.data, false);
      }
      onClose();
    } catch (err) {
      toast.error(apiError(err, "Failed to save entry"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-6"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className="bg-white border border-stone-200 w-full max-w-lg rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
      >
        <div className="flex items-center justify-between p-8 border-b border-stone-200">
          <h2 className="text-2xl font-serif text-stone-900">
            {initial ? `Edit ${isIncome ? "Income" : "Expense"}` : `New ${isIncome ? "Income" : "Expense"}`}
          </h2>
          <button onClick={onClose} className="cursor-pointer text-stone-400 hover:text-stone-900 transition-colors">
            <X size={26} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div>
            <label className="text-amber-600 text-xs uppercase tracking-widest block mb-2">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={handleChange("title")}
              placeholder={isIncome ? "e.g. Booking BK-4F92AX01 payment" : "e.g. July staff salaries"}
              className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-4 text-stone-900 outline-none focus:border-amber-400 placeholder-stone-300"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-amber-600 text-xs uppercase tracking-widest block mb-2">Category</label>
              <select
                value={form.category}
                onChange={handleChange("category")}
                className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-4 text-stone-900 outline-none focus:border-amber-400 appearance-none"
              >
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-amber-600 text-xs uppercase tracking-widest block mb-2">Amount ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.amount}
                onChange={handleChange("amount")}
                placeholder="0.00"
                className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-4 text-stone-900 outline-none focus:border-amber-400 placeholder-stone-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-amber-600 text-xs uppercase tracking-widest block mb-2">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={handleChange("date")}
                className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-4 text-stone-900 outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="text-amber-600 text-xs uppercase tracking-widest block mb-2">Payment Method</label>
              <select
                value={form.paymentMethod}
                onChange={handleChange("paymentMethod")}
                className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-4 text-stone-900 outline-none focus:border-amber-400 appearance-none"
              >
                {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m.replace("_", " ")}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-amber-600 text-xs uppercase tracking-widest block mb-2">{partyLabel}</label>
            <input
              type="text"
              value={form.partyName}
              onChange={handleChange("partyName")}
              placeholder={isIncome ? "e.g. John Smith, Package sale" : "e.g. Meta Ads, Landlord, Airline"}
              className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-4 text-stone-900 outline-none focus:border-amber-400 placeholder-stone-300"
            />
          </div>

          <div>
            <label className="text-amber-600 text-xs uppercase tracking-widest block mb-2">Notes (optional)</label>
            <textarea
              rows={2}
              value={form.notes}
              onChange={handleChange("notes")}
              placeholder="Internal notes..."
              className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-4 text-stone-900 outline-none focus:border-amber-400 resize-none placeholder-stone-300"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className={`cursor-pointer w-full text-white py-4 rounded-2xl font-bold uppercase tracking-widest disabled:opacity-50 transition-all ${
              isIncome ? "bg-emerald-500 hover:bg-emerald-600" : "bg-amber-500 hover:bg-amber-600"
            }`}
          >
            {saving ? "Saving..." : initial ? "Save Changes" : `Add ${isIncome ? "Income" : "Expense"}`}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default function AdminFinance() {
  const [summary, setSummary] = useState(null);
  const [income, setIncome] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recordTab, setRecordTab] = useState("income"); // income | expenses
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [modalType, setModalType] = useState(null); // "income" | "expense" | null
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null); // { type, id }
  const [year, setYear] = useState(new Date().getFullYear());

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [summaryRes, incomeRes, expensesRes] = await Promise.all([
        adminApi.get("/finance/summary", { params: { year } }),
        adminApi.get("/income"),
        adminApi.get("/expenses"),
      ]);
      setSummary(summaryRes.data);
      setIncome(incomeRes.data);
      setExpenses(expensesRes.data);
    } catch {
      toast.error("Failed to load financial data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [year]);

  useEffect(() => { setCategoryFilter("all"); setSearch(""); }, [recordTab]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { type, id } = deleteTarget;
    const endpoint = type === "income" ? "income" : "expenses";
    try {
      await adminApi.delete(`/${endpoint}/${id}`);
      if (type === "income") setIncome((prev) => prev.filter((e) => e._id !== id));
      else setExpenses((prev) => prev.filter((e) => e._id !== id));
      toast.success(`${type === "income" ? "Income" : "Expense"} deleted`);
      setDeleteTarget(null);
      fetchAll();
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleSaved = (entry, isEdit) => {
    const setList = modalType === "income" ? setIncome : setExpenses;
    if (isEdit) {
      setList((prev) => prev.map((e) => (e._id === entry._id ? entry : e)));
    } else {
      setList((prev) => [entry, ...prev]);
    }
    fetchAll();
  };

  const activeList = recordTab === "income" ? income : expenses;
  const activeCategories = recordTab === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const filtered = activeList.filter((e) => {
    const matchCategory = categoryFilter === "all" || e.category === categoryFilter;
    const partyValue = recordTab === "income" ? e.source : e.vendor;
    const matchSearch =
      !search ||
      e.title?.toLowerCase().includes(search.toLowerCase()) ||
      partyValue?.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  const activeCategoryBreakdown = useMemo(
    () => (recordTab === "income" ? summary?.incomeByCategory : summary?.expensesByCategory) || [],
    [summary, recordTab]
  );

  const statCards = summary ? [
    {
      icon: <TrendingUp size={18} />,
      label: "Total Income",
      value: formatCurrency(summary.totalIncome, { compact: true }),
      accent: FLOW_COLORS.in,
      sub: `${summary.incomeCount} entries`,
    },
    {
      icon: <TrendingDown size={18} />,
      label: "Total Expenses",
      value: formatCurrency(summary.totalExpenses, { compact: true }),
      accent: FLOW_COLORS.out,
      sub: `${summary.expensesCount} entries`,
    },
    {
      icon: <PiggyBank size={18} />,
      label: "Net Profit",
      value: formatCurrency(summary.netProfit, { compact: true }),
      accent: summary.netProfit >= 0 ? STATUS_COLORS.good : STATUS_COLORS.critical,
      sub: summary.netProfit >= 0 ? "Profitable" : "Operating at a loss",
    },
    {
      icon: <Receipt size={18} />,
      label: "Owed to us",
      value: formatCurrency(summary.receivables?.outstanding, { compact: true }),
      accent: STATUS_COLORS.warning,
      sub: `${formatCurrency(summary.receivables?.invoiced, { compact: true })} invoiced to clients`,
    },
    {
      icon: <FileText size={18} />,
      label: "Bills to pay",
      value: formatCurrency(summary.payables?.outstanding, { compact: true }),
      accent: SERIES_COLORS[1],
      sub: `${formatCurrency(summary.payables?.invoiced, { compact: true })} billed to us`,
    },
    {
      icon: <Users size={18} />,
      label: "Payroll paid",
      value: formatCurrency(summary.payroll?.paid, { compact: true }),
      accent: SERIES_COLORS[0],
      sub: `${formatCurrency(summary.payroll?.outstanding, { compact: true })} in salaries still owed`,
    },
  ] : [];

  return (
    <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen relative pt-10 bg-stone-50">

      <AnimatePresence>
        {modalType && (
          <EntryModal
            type={modalType}
            initial={editTarget}
            onClose={() => { setModalType(null); setEditTarget(null); }}
            onSaved={handleSaved}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-6"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white border border-red-200 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
            >
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} className="text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-2">
                Delete {deleteTarget.type === "income" ? "Income" : "Expense"}?
              </h3>
              <p className="text-stone-400 text-sm mb-6">This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteTarget(null)}
                  className="cursor-pointer flex-1 py-3 rounded-2xl border border-stone-200 text-stone-500 hover:text-stone-900 transition-all font-semibold">
                  Cancel
                </button>
                <button onClick={handleDelete}
                  className="cursor-pointer flex-1 py-3 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold transition-all">
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-6 relative z-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-16">
          <div>
            <Link to="/admin/dashboard"
              className="text-amber-600 hover:text-amber-700 text-sm tracking-widest uppercase flex items-center gap-2 mb-4">
              <ArrowLeft size={18} /> Dashboard
            </Link>
            <h1 className="text-5xl md:text-7xl font-serif text-stone-900">Finance</h1>
            <p className="text-stone-500 text-xl mt-4">
              The ledger — every dollar in and out, whether typed in by hand or posted from an invoice.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button onClick={fetchAll} className="cursor-pointer flex items-center gap-2 text-amber-600 hover:text-amber-700 transition-all">
              <RefreshCw size={18} /> Refresh
            </button>
            <Link
              to="/admin/invoices"
              className="flex items-center gap-2 border border-stone-200 bg-white text-stone-600 hover:text-stone-900 hover:border-stone-300 px-6 py-3 rounded-2xl font-bold uppercase tracking-widest text-sm transition-all"
            >
              <Receipt size={18} /> Invoices
            </Link>
            <button
              onClick={() => { setEditTarget(null); setModalType("income"); }}
              className="cursor-pointer flex items-center gap-2 bg-emerald-500 text-white px-6 py-3 rounded-2xl font-bold uppercase tracking-widest text-sm hover:bg-emerald-600 transition-all"
            >
              <ArrowUpCircle size={18} /> Add Income
            </button>
            <button
              onClick={() => { setEditTarget(null); setModalType("expense"); }}
              className="cursor-pointer flex items-center gap-2 bg-amber-500 text-white px-6 py-3 rounded-2xl font-bold uppercase tracking-widest text-sm hover:bg-amber-600 transition-all"
            >
              <ArrowDownCircle size={18} /> Add Expense
            </button>
          </div>
        </div>

        {loading && !summary ? (
          <div className="flex items-center justify-center py-24 text-amber-500">
            <Loader2 size={36} className="animate-spin" />
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-12">
              {statCards.map((card) => (
                <StatTile key={card.label} {...card} />
              ))}
            </div>

            {/* Monthly chart + category breakdowns */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
              <ChartCard
                className="lg:col-span-2"
                title="Income vs Expenses"
                subtitle={`Everything recorded in ${year}`}
                actions={
                  <select
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 text-sm outline-none focus:border-amber-400"
                  >
                    {[0, 1, 2, 3].map((offset) => {
                      const value = new Date().getFullYear() - offset;
                      return <option key={value} value={value}>{value}</option>;
                    })}
                  </select>
                }
                table={{
                  columns: ["Month", "Income", "Expenses", "Net"],
                  rows: (summary?.monthlyBreakdown || []).map((m) => [
                    MONTH_LABELS[m.month - 1],
                    formatCurrency(m.income),
                    formatCurrency(m.expenses),
                    formatCurrency(m.net),
                  ]),
                }}
              >
                <BarChart
                  height={280}
                  labels={MONTH_LABELS}
                  formatValue={formatCurrency}
                  formatTick={(value) => formatCurrency(value, { compact: true })}
                  emptyMessage="Nothing recorded for this year yet."
                  series={[
                    {
                      key: "income",
                      label: "Income",
                      color: FLOW_COLORS.in,
                      data: (summary?.monthlyBreakdown || []).map((m) => m.income),
                    },
                    {
                      key: "expenses",
                      label: "Expenses",
                      color: FLOW_COLORS.out,
                      data: (summary?.monthlyBreakdown || []).map((m) => m.expenses),
                    },
                  ]}
                />
              </ChartCard>

              <ChartCard
                title={recordTab === "income" ? "Income by Category" : "Spending by Category"}
                subtitle="Across every entry recorded"
                table={{
                  columns: ["Category", "Total"],
                  rows: (activeCategoryBreakdown || []).map((c) => [c._id, formatCurrency(c.total)]),
                }}
              >
                <HorizontalBarChart
                  color={recordTab === "income" ? FLOW_COLORS.in : FLOW_COLORS.out}
                  formatValue={formatCurrency}
                  maxRows={11}
                  emptyMessage={`No ${recordTab === "income" ? "income" : "expenses"} recorded yet.`}
                  rows={(activeCategoryBreakdown || []).map((c) => ({ label: c._id, value: c.total }))}
                />
              </ChartCard>
            </div>


            {/* Records */}
            <div className="flex flex-col lg:flex-row gap-5 items-start lg:items-center justify-between mb-8">
              <div className="flex items-center gap-2 bg-stone-100 rounded-2xl p-1.5">
                <button
                  onClick={() => setRecordTab("income")}
                  className={`cursor-pointer px-5 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wide transition-all ${
                    recordTab === "income" ? "bg-white text-emerald-600 shadow-sm" : "text-stone-500 hover:text-stone-900"
                  }`}
                >
                  Income
                </button>
                <button
                  onClick={() => setRecordTab("expenses")}
                  className={`cursor-pointer px-5 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wide transition-all ${
                    recordTab === "expenses" ? "bg-white text-amber-600 shadow-sm" : "text-stone-500 hover:text-stone-900"
                  }`}
                >
                  Expenses
                </button>
              </div>
              <div className="flex flex-wrap gap-3 items-center w-full lg:w-auto">
                <input
                  type="text"
                  placeholder={`Search title or ${recordTab === "income" ? "source" : "vendor"}...`}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-white border border-stone-200 rounded-2xl py-3 px-4 text-stone-900 outline-none focus:border-amber-400 placeholder-stone-300 text-sm flex-1 lg:flex-none lg:w-64 shadow-sm"
                />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-white border border-stone-200 rounded-2xl py-3 px-4 text-stone-900 outline-none focus:border-amber-400 text-sm appearance-none shadow-sm"
                >
                  <option value="all">All Categories</option>
                  {activeCategories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-sm">
              {filtered.length === 0 ? (
                <div className="py-24 text-center text-stone-300 italic">
                  <Receipt size={36} className="mx-auto mb-3 opacity-50" />
                  No {recordTab === "income" ? "income" : "expenses"} found.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[800px]">
                    <thead className="bg-stone-50 text-stone-400 text-[10px] uppercase tracking-[0.2em]">
                      <tr>
                        <th className="px-6 py-5">Title</th>
                        <th className="px-6 py-5">Category</th>
                        <th className="px-6 py-5">{recordTab === "income" ? "Source" : "Vendor"}</th>
                        <th className="px-6 py-5">Date</th>
                        <th className="px-6 py-5">Payment</th>
                        <th className="px-6 py-5">Amount</th>
                        <th className="px-6 py-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      <AnimatePresence>
                        {filtered.map((entry, i) => (
                          <motion.tr
                            key={entry._id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className="hover:bg-stone-50 transition-colors group"
                          >
                            <td className="px-6 py-4">
                              <p className="text-stone-900 text-sm font-semibold flex items-center gap-2">
                                {entry.title}
                                {entry.invoice && (
                                  <StatusPill tone="info">
                                    <span className="flex items-center gap-1">
                                      <Link2 size={11} /> From invoice
                                    </span>
                                  </StatusPill>
                                )}
                              </p>
                              {entry.notes && <p className="text-stone-400 text-xs mt-0.5">{entry.notes}</p>}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                                recordTab === "income"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-amber-50 text-amber-700 border-amber-200"
                              }`}>
                                {entry.category}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-stone-500 text-sm">
                              {(recordTab === "income" ? entry.source : entry.vendor) || "—"}
                            </td>
                            <td className="px-6 py-4 text-stone-500 text-sm">
                              {new Date(entry.date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-stone-500 text-sm capitalize">
                              {entry.paymentMethod?.replace("_", " ")}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className="font-bold text-sm tabular-nums"
                                style={{ color: recordTab === "income" ? FLOW_COLORS.in : STATUS_COLORS.critical }}
                              >
                                {recordTab === "income" ? "+" : "−"}{formatCurrency(entry.amount)}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              {entry.invoice ? (
                                /* Posted automatically — edit it on the invoice it came from. */
                                <Link
                                  to="/admin/invoices"
                                  className="text-xs text-stone-400 hover:text-amber-600 uppercase tracking-widest"
                                >
                                  Manage on invoice
                                </Link>
                              ) : (
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => { setEditTarget(entry); setModalType(recordTab === "income" ? "income" : "expense"); }}
                                    className="cursor-pointer p-2.5 text-stone-300 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                                  >
                                    <Pencil size={16} />
                                  </button>
                                  <button
                                    onClick={() => setDeleteTarget({ type: recordTab === "income" ? "income" : "expense", id: entry._id })}
                                    className="cursor-pointer p-2.5 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              )}
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <p className="text-stone-400 text-sm mt-4 text-right">
              Showing {filtered.length} of {activeList.length} {recordTab === "income" ? "income entries" : "expenses"}
            </p>
          </>
        )}
      </div>
    </motion.section>
  );
}
