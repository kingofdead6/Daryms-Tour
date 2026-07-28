"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  ArrowLeft, ArrowDownCircle, ArrowUpCircle, Loader2, Plus, X, Trash2, Pencil,
  Eye, RefreshCw, Receipt, Printer, CreditCard, AlertTriangle, Users, FileText,
  Wallet, Banknote, CalendarClock,
} from "lucide-react";

import adminApi, {
  apiError, formatCurrency, formatDate, formatNumber, humanize,
  isSuperAdmin, MONTH_LABELS,
} from "./adminApi";
import {
  BarChart, ChartCard, DonutChart, HorizontalBarChart, SERIES_COLORS,
  STATUS_COLORS, StatTile, StatusPill, FLOW_COLORS,
} from "./Charts";

const INCOMING_CATEGORIES = [
  "Booking Payment",
  "Package Sale",
  "Destination Sale",
  "Deposit",
  "Commission",
  "Other",
];

const OUTGOING_CATEGORIES = [
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

const STATUSES = ["draft", "sent", "partially_paid", "paid", "overdue", "cancelled"];
const PAYMENT_METHODS = ["bank_transfer", "cash", "credit_card", "paypal", "other"];

const STATUS_TONES = {
  draft: "neutral",
  sent: "info",
  partially_paid: "warning",
  paid: "good",
  overdue: "critical",
  cancelled: "neutral",
};

const STATUS_CHART_COLORS = {
  draft: STATUS_COLORS.neutral,
  sent: SERIES_COLORS[0],
  partially_paid: STATUS_COLORS.warning,
  paid: STATUS_COLORS.good,
  overdue: STATUS_COLORS.critical,
  cancelled: "#c3c2b7",
};

const compactMoney = (value) => formatCurrency(value, { compact: true });

const emptyItem = () => ({ description: "", quantity: 1, unitPrice: "" });

const blankForm = (direction) => ({
  direction,
  category: direction === "incoming" ? "Booking Payment" : "Supplier Payment",
  party: { name: "", email: "", phone: "", address: "", taxId: "" },
  items: [emptyItem()],
  taxRate: 0,
  discount: 0,
  issueDate: new Date().toISOString().slice(0, 10),
  dueDate: "",
  status: "draft",
  paymentMethod: "bank_transfer",
  notes: "",
  terms: "",
});

const computeTotals = (items, taxRate, discount) => {
  const subtotal = items.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
    0
  );
  const appliedDiscount = Math.min(Number(discount) || 0, subtotal);
  const taxable = subtotal - appliedDiscount;
  const taxAmount = (taxable * (Number(taxRate) || 0)) / 100;
  return {
    subtotal,
    discount: appliedDiscount,
    taxAmount,
    total: taxable + taxAmount,
  };
};

// ─── Create / edit invoice ──────────────────────────────────────────────────
function InvoiceModal({ direction, initial, onClose, onSaved }) {
  const isIncoming = (initial?.direction || direction) === "incoming";
  const categories = isIncoming ? INCOMING_CATEGORIES : OUTGOING_CATEGORIES;

  const [form, setForm] = useState(() =>
    initial
      ? {
          direction: initial.direction,
          category: initial.category,
          party: {
            name: initial.party?.name || "",
            email: initial.party?.email || "",
            phone: initial.party?.phone || "",
            address: initial.party?.address || "",
            taxId: initial.party?.taxId || "",
          },
          items: initial.items?.length
            ? initial.items.map((i) => ({
                description: i.description,
                quantity: i.quantity,
                unitPrice: i.unitPrice,
              }))
            : [emptyItem()],
          taxRate: initial.taxRate || 0,
          discount: initial.discount || 0,
          issueDate: new Date(initial.issueDate).toISOString().slice(0, 10),
          dueDate: initial.dueDate ? new Date(initial.dueDate).toISOString().slice(0, 10) : "",
          status: initial.status,
          paymentMethod: initial.paymentMethod,
          notes: initial.notes || "",
          terms: initial.terms || "",
        }
      : blankForm(direction)
  );
  const [saving, setSaving] = useState(false);

  const totals = useMemo(
    () => computeTotals(form.items, form.taxRate, form.discount),
    [form.items, form.taxRate, form.discount]
  );

  const setField = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const setParty = (field) => (e) =>
    setForm((f) => ({ ...f, party: { ...f.party, [field]: e.target.value } }));

  const setItem = (index, field, value) =>
    setForm((f) => ({
      ...f,
      items: f.items.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    }));

  const addItem = () => setForm((f) => ({ ...f, items: [...f.items, emptyItem()] }));
  const removeItem = (index) =>
    setForm((f) => ({
      ...f,
      items: f.items.length === 1 ? f.items : f.items.filter((_, i) => i !== index),
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.party.name.trim()) {
      toast.error(isIncoming ? "Client name is required" : "Vendor name is required");
      return;
    }
    const validItems = form.items.filter((i) => i.description.trim() && Number(i.unitPrice) >= 0);
    if (!validItems.length) {
      toast.error("Add at least one line item with a description");
      return;
    }

    setSaving(true);
    const payload = {
      ...form,
      items: validItems,
      taxRate: Number(form.taxRate) || 0,
      discount: Number(form.discount) || 0,
      dueDate: form.dueDate || null,
    };

    try {
      const res = initial
        ? await adminApi.patch(`/invoices/${initial._id}`, payload)
        : await adminApi.post("/invoices", payload);
      toast.success(initial ? "Invoice updated" : "Invoice created");
      onSaved(res.data, Boolean(initial));
      onClose();
    } catch (err) {
      toast.error(apiError(err, "Failed to save invoice"));
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full bg-stone-50 border border-stone-200 rounded-2xl p-3.5 text-stone-900 outline-none focus:border-amber-400 placeholder-stone-300 text-sm";
  const labelClass = "text-amber-600 text-xs uppercase tracking-widest block mb-2";

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 md:p-6"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className="bg-white border border-stone-200 w-full max-w-3xl rounded-3xl shadow-2xl max-h-[92vh] overflow-y-auto"
        initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }}
      >
        <div className="flex items-center justify-between p-7 border-b border-stone-200 sticky top-0 bg-white rounded-t-3xl z-10">
          <div>
            <h2 className="text-2xl font-serif text-stone-900">
              {initial ? `Edit ${initial.invoiceNumber}` : isIncoming ? "New client invoice" : "New bill"}
            </h2>
            <p className="text-stone-400 text-sm mt-1">
              {isIncoming ? "Money coming in" : "Money going out"}
            </p>
          </div>
          <button onClick={onClose} className="cursor-pointer text-stone-400 hover:text-stone-900 transition-colors">
            <X size={26} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-7 space-y-6">
          {/* Counterparty */}
          <div>
            <h3 className="text-stone-900 font-semibold mb-4">
              {isIncoming ? "Bill to" : "Received from"}
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{isIncoming ? "Client name" : "Vendor / payee"}</label>
                <input className={inputClass} value={form.party.name} onChange={setParty("name")} placeholder="Full name or company" />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input className={inputClass} type="email" value={form.party.email} onChange={setParty("email")} placeholder="name@example.com" />
              </div>
              <div>
                <label className={labelClass}>Phone</label>
                <input className={inputClass} value={form.party.phone} onChange={setParty("phone")} placeholder="+213 …" />
              </div>
              <div>
                <label className={labelClass}>Tax / VAT number</label>
                <input className={inputClass} value={form.party.taxId} onChange={setParty("taxId")} placeholder="Optional" />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Address</label>
                <input className={inputClass} value={form.party.address} onChange={setParty("address")} placeholder="Street, city, country" />
              </div>
            </div>
          </div>

          {/* Meta */}
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className={labelClass}>Category</label>
              <select className={`${inputClass} appearance-none`} value={form.category} onChange={setField("category")}>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Issue date</label>
              <input className={inputClass} type="date" value={form.issueDate} onChange={setField("issueDate")} />
            </div>
            <div>
              <label className={labelClass}>Due date</label>
              <input className={inputClass} type="date" value={form.dueDate} onChange={setField("dueDate")} />
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select className={`${inputClass} appearance-none`} value={form.status} onChange={setField("status")}>
                {STATUSES.filter((s) => !["partially_paid", "paid"].includes(s)).map((s) => (
                  <option key={s} value={s}>{humanize(s)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Line items */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-stone-900 font-semibold">Line items</h3>
              <button
                type="button"
                onClick={addItem}
                className="cursor-pointer flex items-center gap-1.5 text-amber-600 hover:text-amber-700 text-sm font-semibold"
              >
                <Plus size={16} /> Add line
              </button>
            </div>

            <div className="space-y-3">
              {form.items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center">
                  <input
                    className={`${inputClass} col-span-6`}
                    value={item.description}
                    onChange={(e) => setItem(index, "description", e.target.value)}
                    placeholder="Description"
                  />
                  <input
                    className={`${inputClass} col-span-2 tabular-nums`}
                    type="number" min="0" step="1"
                    value={item.quantity}
                    onChange={(e) => setItem(index, "quantity", e.target.value)}
                    placeholder="Qty"
                  />
                  <input
                    className={`${inputClass} col-span-2 tabular-nums`}
                    type="number" min="0" step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => setItem(index, "unitPrice", e.target.value)}
                    placeholder="Unit price"
                  />
                  <span className="col-span-1 text-right text-sm text-stone-900 font-semibold tabular-nums">
                    {formatCurrency((Number(item.quantity) || 0) * (Number(item.unitPrice) || 0))}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="col-span-1 cursor-pointer text-stone-300 hover:text-red-500 transition-colors flex justify-end"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Tax rate (%)</label>
                  <input className={inputClass} type="number" min="0" max="100" step="0.01" value={form.taxRate} onChange={setField("taxRate")} />
                </div>
                <div>
                  <label className={labelClass}>Discount ($)</label>
                  <input className={inputClass} type="number" min="0" step="0.01" value={form.discount} onChange={setField("discount")} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Payment method</label>
                <select className={`${inputClass} appearance-none`} value={form.paymentMethod} onChange={setField("paymentMethod")}>
                  {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{humanize(m)}</option>)}
                </select>
              </div>
            </div>

            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 space-y-2.5 text-sm self-start">
              <div className="flex justify-between text-stone-500">
                <span>Subtotal</span><span className="tabular-nums">{formatCurrency(totals.subtotal)}</span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Discount</span><span className="tabular-nums">−{formatCurrency(totals.discount)}</span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Tax ({form.taxRate || 0}%)</span><span className="tabular-nums">{formatCurrency(totals.taxAmount)}</span>
              </div>
              <div className="flex justify-between text-stone-900 font-bold text-lg pt-2.5 border-t border-stone-200">
                <span>Total</span><span className="tabular-nums">{formatCurrency(totals.total)}</span>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Notes</label>
              <textarea rows={2} className={`${inputClass} resize-none`} value={form.notes} onChange={setField("notes")} placeholder="Visible on the invoice" />
            </div>
            <div>
              <label className={labelClass}>Payment terms</label>
              <textarea rows={2} className={`${inputClass} resize-none`} value={form.terms} onChange={setField("terms")} placeholder="e.g. Payable within 14 days" />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className={`cursor-pointer w-full text-white py-4 rounded-2xl font-bold uppercase tracking-widest disabled:opacity-50 transition-all ${
              isIncoming ? "bg-emerald-500 hover:bg-emerald-600" : "bg-amber-500 hover:bg-amber-600"
            }`}
          >
            {saving ? "Saving…" : initial ? "Save changes" : isIncoming ? "Create invoice" : "Create bill"}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ─── Record a payment ───────────────────────────────────────────────────────
function PaymentModal({ invoice, onClose, onSaved }) {
  const balance = Math.max(0, invoice.total - invoice.amountPaid);
  const [form, setForm] = useState({
    amount: balance,
    date: new Date().toISOString().slice(0, 10),
    method: invoice.paymentMethod || "bank_transfer",
    reference: "",
    note: "",
  });
  const [saving, setSaving] = useState(false);

  const setField = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!Number(form.amount) || Number(form.amount) <= 0) {
      toast.error("Enter a payment amount");
      return;
    }
    setSaving(true);
    try {
      const res = await adminApi.post(`/invoices/${invoice._id}/payments`, form);
      toast.success("Payment recorded and posted to the ledger");
      onSaved(res.data);
      onClose();
    } catch (err) {
      toast.error(apiError(err, "Failed to record payment"));
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full bg-stone-50 border border-stone-200 rounded-2xl p-3.5 text-stone-900 outline-none focus:border-amber-400 placeholder-stone-300 text-sm";
  const labelClass = "text-amber-600 text-xs uppercase tracking-widest block mb-2";

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[110] flex items-center justify-center p-6"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className="bg-white border border-stone-200 w-full max-w-md rounded-3xl shadow-2xl"
        initial={{ scale: 0.96 }} animate={{ scale: 1 }} exit={{ scale: 0.96 }}
      >
        <div className="flex items-center justify-between p-7 border-b border-stone-200">
          <div>
            <h2 className="text-xl font-serif text-stone-900">Record payment</h2>
            <p className="text-stone-400 text-sm mt-1 font-mono">{invoice.invoiceNumber}</p>
          </div>
          <button onClick={onClose} className="cursor-pointer text-stone-400 hover:text-stone-900">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-7 space-y-5">
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 flex justify-between text-sm">
            <span className="text-stone-500">Outstanding balance</span>
            <span className="text-stone-900 font-bold tabular-nums">{formatCurrency(balance)}</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Amount</label>
              <input className={inputClass} type="number" min="0" max={balance} step="0.01" value={form.amount} onChange={setField("amount")} />
            </div>
            <div>
              <label className={labelClass}>Date</label>
              <input className={inputClass} type="date" value={form.date} onChange={setField("date")} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Method</label>
            <select className={`${inputClass} appearance-none`} value={form.method} onChange={setField("method")}>
              {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{humanize(m)}</option>)}
            </select>
          </div>

          <div>
            <label className={labelClass}>Reference</label>
            <input className={inputClass} value={form.reference} onChange={setField("reference")} placeholder="Transfer or receipt number" />
          </div>

          <div>
            <label className={labelClass}>Note</label>
            <input className={inputClass} value={form.note} onChange={setField("note")} placeholder="Optional" />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="cursor-pointer w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-2xl font-bold uppercase tracking-widest disabled:opacity-50 transition-all"
          >
            {saving ? "Saving…" : "Record payment"}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ─── Payroll run ────────────────────────────────────────────────────────────
function PayrollModal({ onClose, onDone }) {
  const now = new Date();
  const [period, setPeriod] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  );
  const [preview, setPreview] = useState(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    adminApi
      .get("/employees/payroll-stats")
      .then((res) => setPreview(res.data))
      .catch((err) => toast.error(apiError(err, "Failed to load payroll data")));
  }, []);

  const run = async () => {
    setRunning(true);
    try {
      const res = await adminApi.post("/invoices/payroll", { period });
      const { createdCount, skippedCount, totalAmount, periodLabel } = res.data;
      toast.success(
        `${createdCount} salary bill(s) generated for ${periodLabel} — ${formatCurrency(totalAmount)}` +
          (skippedCount ? ` · ${skippedCount} already billed` : "")
      );
      onDone();
      onClose();
    } catch (err) {
      toast.error(apiError(err, "Payroll run failed"));
    } finally {
      setRunning(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[110] flex items-center justify-center p-6"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className="bg-white border border-stone-200 w-full max-w-md rounded-3xl shadow-2xl"
        initial={{ scale: 0.96 }} animate={{ scale: 1 }} exit={{ scale: 0.96 }}
      >
        <div className="flex items-center justify-between p-7 border-b border-stone-200">
          <div>
            <h2 className="text-xl font-serif text-stone-900">Run payroll</h2>
            <p className="text-stone-400 text-sm mt-1">One salary bill per active employee</p>
          </div>
          <button onClick={onClose} className="cursor-pointer text-stone-400 hover:text-stone-900">
            <X size={24} />
          </button>
        </div>

        <div className="p-7 space-y-5">
          <div>
            <label className="text-amber-600 text-xs uppercase tracking-widest block mb-2">Period</label>
            <input
              type="month"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-3.5 text-stone-900 outline-none focus:border-amber-400 text-sm"
            />
          </div>

          {preview && (
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 space-y-2.5 text-sm">
              <div className="flex justify-between text-stone-500">
                <span>Active employees</span>
                <span className="text-stone-900 font-semibold tabular-nums">{preview.headcount.active}</span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Average salary</span>
                <span className="text-stone-900 font-semibold tabular-nums">{formatCurrency(preview.averageSalary)}</span>
              </div>
              <div className="flex justify-between text-stone-900 font-bold pt-2.5 border-t border-stone-200">
                <span>Total for the month</span>
                <span className="tabular-nums">{formatCurrency(preview.monthlySalaryMass)}</span>
              </div>
            </div>
          )}

          <p className="text-stone-400 text-xs leading-relaxed">
            Employees already billed for this period are skipped, so a payroll run can safely be
            repeated after adding someone new.
          </p>

          <button
            onClick={run}
            disabled={running || !preview?.headcount?.active}
            className="cursor-pointer w-full bg-amber-500 hover:bg-amber-600 text-white py-4 rounded-2xl font-bold uppercase tracking-widest disabled:opacity-50 transition-all"
          >
            {running ? "Generating…" : "Generate salary bills"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Detail drawer ──────────────────────────────────────────────────────────
function InvoiceDrawer({ invoice, onClose, onPay, onChanged }) {
  const isIncoming = invoice.direction === "incoming";
  const balance = Math.max(0, invoice.total - invoice.amountPaid);

  const removePayment = async (paymentId) => {
    try {
      const res = await adminApi.delete(`/invoices/${invoice._id}/payments/${paymentId}`);
      toast.success("Payment removed");
      onChanged(res.data);
    } catch (err) {
      toast.error(apiError(err, "Failed to remove payment"));
    }
  };

  const print = () => {
    const rows = invoice.items
      .map(
        (item) => `<tr>
          <td>${item.description}</td>
          <td class="num">${item.quantity}</td>
          <td class="num">${formatCurrency(item.unitPrice)}</td>
          <td class="num">${formatCurrency(item.total)}</td>
        </tr>`
      )
      .join("");

    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${invoice.invoiceNumber}</title>
      <style>
        body { font-family: system-ui, -apple-system, "Segoe UI", sans-serif; color: #0b0b0b; padding: 48px; }
        h1 { font-size: 28px; margin: 0 0 4px; }
        .muted { color: #52514e; font-size: 13px; }
        .head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
        table { width: 100%; border-collapse: collapse; margin-top: 24px; font-size: 14px; }
        th { text-align: left; text-transform: uppercase; font-size: 10px; letter-spacing: .18em; color: #898781; border-bottom: 1px solid #e1e0d9; padding: 10px 8px; }
        td { padding: 12px 8px; border-bottom: 1px solid #f0efec; }
        .num { text-align: right; font-variant-numeric: tabular-nums; }
        .totals { margin-left: auto; margin-top: 24px; width: 280px; font-size: 14px; }
        .totals div { display: flex; justify-content: space-between; padding: 7px 0; }
        .totals .grand { border-top: 2px solid #0b0b0b; font-weight: 700; font-size: 17px; margin-top: 8px; padding-top: 12px; }
        .notes { margin-top: 40px; font-size: 13px; color: #52514e; white-space: pre-wrap; }
      </style></head><body>
      <div class="head">
        <div>
          <h1>Daryms Tour</h1>
          <p class="muted">${isIncoming ? "Invoice" : "Bill received"}</p>
        </div>
        <div style="text-align:right">
          <h1>${invoice.invoiceNumber}</h1>
          <p class="muted">Issued ${formatDate(invoice.issueDate)}${invoice.dueDate ? ` · Due ${formatDate(invoice.dueDate)}` : ""}</p>
          <p class="muted">Status: ${humanize(invoice.status)}</p>
        </div>
      </div>
      <p class="muted">${isIncoming ? "Bill to" : "From"}</p>
      <p><strong>${invoice.party?.name || ""}</strong><br>
        ${invoice.party?.email || ""}${invoice.party?.phone ? ` · ${invoice.party.phone}` : ""}<br>
        ${invoice.party?.address || ""}${invoice.party?.taxId ? `<br>Tax ID: ${invoice.party.taxId}` : ""}</p>
      <table>
        <thead><tr><th>Description</th><th class="num">Qty</th><th class="num">Unit</th><th class="num">Amount</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="totals">
        <div><span>Subtotal</span><span>${formatCurrency(invoice.subtotal)}</span></div>
        <div><span>Discount</span><span>−${formatCurrency(invoice.discount)}</span></div>
        <div><span>Tax (${invoice.taxRate}%)</span><span>${formatCurrency(invoice.taxAmount)}</span></div>
        <div class="grand"><span>Total</span><span>${formatCurrency(invoice.total)}</span></div>
        <div><span>Paid</span><span>${formatCurrency(invoice.amountPaid)}</span></div>
        <div><span><strong>Balance due</strong></span><span><strong>${formatCurrency(balance)}</strong></span></div>
      </div>
      ${invoice.notes ? `<div class="notes"><strong>Notes</strong><br>${invoice.notes}</div>` : ""}
      ${invoice.terms ? `<div class="notes"><strong>Terms</strong><br>${invoice.terms}</div>` : ""}
      </body></html>`;

    const win = window.open("", "_blank", "width=900,height=1000");
    if (!win) {
      toast.error("Allow pop-ups to print this invoice");
      return;
    }
    win.document.write(html);
    win.document.close();
    win.focus();
    win.print();
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex justify-end"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className="bg-white w-full max-w-lg h-full overflow-y-auto shadow-2xl border-l border-stone-200"
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
      >
        <div className="flex items-center justify-between p-7 border-b border-stone-200 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-2xl font-serif text-stone-900">{invoice.invoiceNumber}</h2>
            <p className="text-stone-400 text-sm mt-1">
              {isIncoming ? "Money in" : "Money out"} · {invoice.category}
            </p>
          </div>
          <button onClick={onClose} className="cursor-pointer text-stone-400 hover:text-stone-900">
            <X size={26} />
          </button>
        </div>

        <div className="p-7 space-y-7">
          <div className="flex items-center gap-3 flex-wrap">
            <StatusPill tone={STATUS_TONES[invoice.status]}>{humanize(invoice.status)}</StatusPill>
            {invoice.dueDate && balance > 0 && new Date(invoice.dueDate) < new Date() && (
              <span className="flex items-center gap-1.5 text-xs text-red-600 font-semibold">
                <AlertTriangle size={14} /> Past due
              </span>
            )}
          </div>

          <div>
            <h3 className="text-amber-600 text-xs uppercase tracking-widest mb-3">
              {isIncoming ? "Client" : "Vendor"}
            </h3>
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 space-y-1.5 text-sm">
              <p className="text-stone-900 font-semibold">{invoice.party?.name}</p>
              {invoice.party?.email && <p className="text-stone-500">{invoice.party.email}</p>}
              {invoice.party?.phone && <p className="text-stone-500">{invoice.party.phone}</p>}
              {invoice.party?.address && <p className="text-stone-500">{invoice.party.address}</p>}
              {invoice.party?.taxId && <p className="text-stone-400 text-xs">Tax ID {invoice.party.taxId}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4">
              <p className="text-stone-400 text-[10px] uppercase tracking-[0.2em] mb-1">Issued</p>
              <p className="text-stone-900 font-semibold">{formatDate(invoice.issueDate)}</p>
            </div>
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4">
              <p className="text-stone-400 text-[10px] uppercase tracking-[0.2em] mb-1">Due</p>
              <p className="text-stone-900 font-semibold">{formatDate(invoice.dueDate)}</p>
            </div>
          </div>

          <div>
            <h3 className="text-amber-600 text-xs uppercase tracking-widest mb-3">Line items</h3>
            <div className="border border-stone-200 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-stone-100">
                  {invoice.items?.map((item, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3 text-stone-700">
                        {item.description}
                        <span className="text-stone-400 text-xs block">
                          {item.quantity} × {formatCurrency(item.unitPrice)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-stone-900 font-semibold tabular-nums">
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 space-y-2.5 text-sm">
            <div className="flex justify-between text-stone-500"><span>Subtotal</span><span className="tabular-nums">{formatCurrency(invoice.subtotal)}</span></div>
            <div className="flex justify-between text-stone-500"><span>Discount</span><span className="tabular-nums">−{formatCurrency(invoice.discount)}</span></div>
            <div className="flex justify-between text-stone-500"><span>Tax ({invoice.taxRate}%)</span><span className="tabular-nums">{formatCurrency(invoice.taxAmount)}</span></div>
            <div className="flex justify-between text-stone-900 font-bold text-lg pt-2.5 border-t border-stone-200"><span>Total</span><span className="tabular-nums">{formatCurrency(invoice.total)}</span></div>
            <div className="flex justify-between text-emerald-600"><span>Paid</span><span className="tabular-nums">{formatCurrency(invoice.amountPaid)}</span></div>
            <div className="flex justify-between text-stone-900 font-semibold"><span>Balance due</span><span className="tabular-nums">{formatCurrency(balance)}</span></div>
          </div>

          <div>
            <h3 className="text-amber-600 text-xs uppercase tracking-widest mb-3">Payments</h3>
            {invoice.payments?.length ? (
              <div className="space-y-2">
                {invoice.payments.map((payment) => (
                  <div key={payment._id} className="flex items-center gap-3 bg-stone-50 border border-stone-200 rounded-2xl p-4 text-sm">
                    <div className="flex-1">
                      <p className="text-stone-900 font-semibold tabular-nums">{formatCurrency(payment.amount)}</p>
                      <p className="text-stone-400 text-xs">
                        {formatDate(payment.date)} · {humanize(payment.method)}
                        {payment.reference ? ` · ${payment.reference}` : ""}
                      </p>
                    </div>
                    <button
                      onClick={() => removePayment(payment._id)}
                      title="Remove payment"
                      className="cursor-pointer text-stone-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-stone-300 italic text-sm">Nothing paid yet.</p>
            )}
          </div>

          {(invoice.notes || invoice.terms) && (
            <div className="space-y-3 text-sm">
              {invoice.notes && (
                <div>
                  <h3 className="text-amber-600 text-xs uppercase tracking-widest mb-2">Notes</h3>
                  <p className="text-stone-500 whitespace-pre-wrap">{invoice.notes}</p>
                </div>
              )}
              {invoice.terms && (
                <div>
                  <h3 className="text-amber-600 text-xs uppercase tracking-widest mb-2">Terms</h3>
                  <p className="text-stone-500 whitespace-pre-wrap">{invoice.terms}</p>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={print}
              className="cursor-pointer flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-stone-200 text-stone-600 hover:text-stone-900 hover:border-stone-300 font-semibold transition-all"
            >
              <Printer size={16} /> Print
            </button>
            {balance > 0 && invoice.status !== "cancelled" && (
              <button
                onClick={() => onPay(invoice)}
                className="cursor-pointer flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-all"
              >
                <CreditCard size={16} /> Record payment
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────
export default function AdminInvoices() {
  const superadmin = isSuperAdmin();

  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());

  const [tab, setTab] = useState("incoming"); // incoming | outgoing | all
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [modalDirection, setModalDirection] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [detailTarget, setDetailTarget] = useState(null);
  const [payTarget, setPayTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showPayroll, setShowPayroll] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [invoicesRes, statsRes] = await Promise.all([
        adminApi.get("/invoices"),
        adminApi.get("/invoices/stats", { params: { year } }),
      ]);
      setInvoices(invoicesRes.data);
      setStats(statsRes.data);
    } catch (err) {
      toast.error(apiError(err, "Failed to load invoices"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year]);

  useEffect(() => {
    setCategoryFilter("all");
    setStatusFilter("all");
  }, [tab]);

  const categories = tab === "outgoing" ? OUTGOING_CATEGORIES : INCOMING_CATEGORIES;

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return invoices.filter((invoice) => {
      if (tab !== "all" && invoice.direction !== tab) return false;
      if (statusFilter !== "all" && invoice.status !== statusFilter) return false;
      if (categoryFilter !== "all" && invoice.category !== categoryFilter) return false;
      if (!term) return true;
      return (
        invoice.invoiceNumber?.toLowerCase().includes(term) ||
        invoice.party?.name?.toLowerCase().includes(term) ||
        invoice.party?.email?.toLowerCase().includes(term)
      );
    });
  }, [invoices, tab, statusFilter, categoryFilter, search]);

  const replaceInvoice = (updated) => {
    setInvoices((prev) => prev.map((i) => (i._id === updated._id ? updated : i)));
    if (detailTarget?._id === updated._id) setDetailTarget(updated);
    fetchAll();
  };

  const handleSaved = (invoice, isEdit) => {
    if (isEdit) replaceInvoice(invoice);
    else {
      setInvoices((prev) => [invoice, ...prev]);
      fetchAll();
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminApi.delete(`/invoices/${deleteTarget._id}`);
      setInvoices((prev) => prev.filter((i) => i._id !== deleteTarget._id));
      toast.success("Invoice deleted");
      setDeleteTarget(null);
      setDetailTarget(null);
      fetchAll();
    } catch (err) {
      toast.error(apiError(err, "Delete failed"));
    }
  };

  const monthlySeries = stats?.monthly || [];

  const statusChartData = useMemo(() => {
    const rows = (stats?.statusBreakdown || []).filter(
      (s) => tab === "all" || s.direction === tab
    );
    const merged = rows.reduce((acc, row) => {
      acc[row.status] = (acc[row.status] || 0) + row.count;
      return acc;
    }, {});
    return Object.entries(merged).map(([status, count]) => ({
      label: humanize(status),
      value: count,
      color: STATUS_CHART_COLORS[status] || STATUS_COLORS.neutral,
    }));
  }, [stats, tab]);

  const categoryChartRows = useMemo(() => {
    const direction = tab === "all" ? "outgoing" : tab;
    return (stats?.byCategory || [])
      .filter((c) => c.direction === direction)
      .map((c) => ({ label: c.category, value: c.total, sub: `${c.count} invoice(s)` }));
  }, [stats, tab]);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-stone-50 pt-10 pb-24"
    >
      <AnimatePresence>
        {modalDirection && (
          <InvoiceModal
            direction={modalDirection}
            initial={editTarget}
            onClose={() => { setModalDirection(null); setEditTarget(null); }}
            onSaved={handleSaved}
          />
        )}
        {payTarget && (
          <PaymentModal
            invoice={payTarget}
            onClose={() => setPayTarget(null)}
            onSaved={replaceInvoice}
          />
        )}
        {showPayroll && <PayrollModal onClose={() => setShowPayroll(false)} onDone={fetchAll} />}
        {detailTarget && (
          <InvoiceDrawer
            invoice={detailTarget}
            onClose={() => setDetailTarget(null)}
            onPay={(invoice) => setPayTarget(invoice)}
            onChanged={replaceInvoice}
          />
        )}
        {deleteTarget && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[120] flex items-center justify-center p-6"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white border border-red-200 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
            >
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} className="text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-2">Delete {deleteTarget.invoiceNumber}?</h3>
              <p className="text-stone-400 text-sm mb-6">
                Its recorded payments will also be removed from the finance ledger.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteTarget(null)}
                  className="cursor-pointer flex-1 py-3 rounded-2xl border border-stone-200 text-stone-500 hover:text-stone-900 font-semibold transition-all">
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

      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-12">
          <div>
            <Link to="/admin/dashboard"
              className="text-amber-600 hover:text-amber-700 text-sm tracking-widest uppercase flex items-center gap-2 mb-4">
              <ArrowLeft size={18} /> Dashboard
            </Link>
            <h1 className="text-5xl md:text-6xl font-serif text-stone-900">Invoices &amp; Bills</h1>
            <p className="text-stone-500 text-lg mt-3">
              Every invoice going out to clients and every bill coming in — including staff salaries.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="bg-white border border-stone-200 rounded-2xl px-4 py-3 text-stone-900 text-sm outline-none focus:border-amber-400 shadow-sm"
            >
              {[0, 1, 2, 3].map((offset) => {
                const value = new Date().getFullYear() - offset;
                return <option key={value} value={value}>{value}</option>;
              })}
            </select>
            <button onClick={fetchAll} className="cursor-pointer flex items-center gap-2 text-amber-600 hover:text-amber-700 transition-all">
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> Refresh
            </button>
            {superadmin && (
              <button
                onClick={() => setShowPayroll(true)}
                className="cursor-pointer flex items-center gap-2 bg-stone-900 text-white px-5 py-3 rounded-2xl font-bold uppercase tracking-widest text-sm hover:bg-stone-800 transition-all"
              >
                <Users size={18} /> Run payroll
              </button>
            )}
            <button
              onClick={() => { setEditTarget(null); setModalDirection("incoming"); }}
              className="cursor-pointer flex items-center gap-2 bg-emerald-500 text-white px-5 py-3 rounded-2xl font-bold uppercase tracking-widest text-sm hover:bg-emerald-600 transition-all"
            >
              <ArrowUpCircle size={18} /> New invoice
            </button>
            <button
              onClick={() => { setEditTarget(null); setModalDirection("outgoing"); }}
              className="cursor-pointer flex items-center gap-2 bg-amber-500 text-white px-5 py-3 rounded-2xl font-bold uppercase tracking-widest text-sm hover:bg-amber-600 transition-all"
            >
              <ArrowDownCircle size={18} /> New bill
            </button>
          </div>
        </div>

        {loading && !stats ? (
          <div className="flex items-center justify-center py-24 text-amber-500">
            <Loader2 size={36} className="animate-spin" />
          </div>
        ) : (
          <>
            {/* Money in / money out */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
              <StatTile
                label="Invoiced to clients"
                value={formatCurrency(stats?.incoming?.invoiced, { compact: true })}
                icon={<FileText size={18} />}
                accent={FLOW_COLORS.in}
                sub={`${formatNumber(stats?.incoming?.count)} invoices issued`}
              />
              <StatTile
                label="Collected"
                value={formatCurrency(stats?.incoming?.collected, { compact: true })}
                icon={<Wallet size={18} />}
                accent={STATUS_COLORS.good}
                sub={`${formatCurrency(stats?.incoming?.outstanding, { compact: true })} still owed to us`}
              />
              <StatTile
                label="Bills received"
                value={formatCurrency(stats?.outgoing?.invoiced, { compact: true })}
                icon={<Receipt size={18} />}
                accent={FLOW_COLORS.out}
                sub={`${formatNumber(stats?.outgoing?.count)} bills recorded`}
              />
              <StatTile
                label="Net cash position"
                value={formatCurrency(stats?.netCashPosition, { compact: true })}
                icon={<Banknote size={18} />}
                accent={stats?.netCashPosition >= 0 ? STATUS_COLORS.good : STATUS_COLORS.critical}
                sub={`${formatCurrency(stats?.outgoing?.outstanding, { compact: true })} of bills still to pay`}
              />
            </div>

            {/* Overdue callouts */}
            {(stats?.overdue?.incoming?.count > 0 || stats?.overdue?.outgoing?.count > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
                {stats.overdue.incoming.count > 0 && (
                  <div className="flex items-center gap-4 bg-red-50 border border-red-200 rounded-3xl p-5">
                    <AlertTriangle size={22} className="text-red-500 shrink-0" />
                    <p className="text-sm text-red-700">
                      <strong>{stats.overdue.incoming.count} client invoice(s) overdue</strong> —{" "}
                      {formatCurrency(stats.overdue.incoming.amount)} still uncollected.
                    </p>
                  </div>
                )}
                {stats.overdue.outgoing.count > 0 && (
                  <div className="flex items-center gap-4 bg-amber-50 border border-amber-200 rounded-3xl p-5">
                    <CalendarClock size={22} className="text-amber-600 shrink-0" />
                    <p className="text-sm text-amber-800">
                      <strong>{stats.overdue.outgoing.count} bill(s) past due</strong> —{" "}
                      {formatCurrency(stats.overdue.outgoing.amount)} owed to vendors and staff.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <ChartCard
                className="lg:col-span-2"
                title="Cash in vs cash out"
                subtitle={`Payments actually settled in ${year}`}
                table={{
                  columns: ["Month", "Cash in", "Cash out", "Invoiced", "Billed"],
                  rows: monthlySeries.map((m) => [
                    MONTH_LABELS[m.month - 1],
                    formatCurrency(m.cashIn),
                    formatCurrency(m.cashOut),
                    formatCurrency(m.invoicedIn),
                    formatCurrency(m.billedOut),
                  ]),
                }}
              >
                <BarChart
                  height={280}
                  labels={MONTH_LABELS}
                  formatValue={formatCurrency}
                  formatTick={compactMoney}
                  emptyMessage="No payments recorded for this year yet."
                  series={[
                    { key: "cashIn", label: "Cash in", color: FLOW_COLORS.in, data: monthlySeries.map((m) => m.cashIn) },
                    { key: "cashOut", label: "Cash out", color: FLOW_COLORS.out, data: monthlySeries.map((m) => m.cashOut) },
                  ]}
                />
              </ChartCard>

              <ChartCard
                title="Invoice status"
                subtitle={tab === "all" ? "All invoices" : tab === "incoming" ? "Client invoices" : "Bills received"}
                table={{
                  columns: ["Status", "Invoices"],
                  rows: statusChartData.map((s) => [s.label, formatNumber(s.value)]),
                }}
              >
                <DonutChart centerLabel="Invoices" data={statusChartData} />
              </ChartCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
              <ChartCard
                title={tab === "incoming" ? "Invoiced by category" : "Spending by category"}
                subtitle="Total value of invoices raised"
                table={{
                  columns: ["Category", "Total"],
                  rows: categoryChartRows.map((c) => [c.label, formatCurrency(c.value)]),
                }}
              >
                <HorizontalBarChart
                  color={tab === "incoming" ? FLOW_COLORS.in : FLOW_COLORS.out}
                  formatValue={formatCurrency}
                  maxRows={10}
                  rows={categoryChartRows}
                  emptyMessage="No invoices raised yet."
                />
              </ChartCard>

              <ChartCard
                title="Receivables ageing"
                subtitle="How long client money has been outstanding"
                table={{
                  columns: ["Age", "Outstanding"],
                  rows: (stats?.receivablesAgeing || []).map((b) => [b.bucket, formatCurrency(b.amount)]),
                }}
              >
                <HorizontalBarChart
                  formatValue={formatCurrency}
                  emptyMessage="Nothing outstanding — everything is settled."
                  rows={(stats?.receivablesAgeing || []).map((bucket) => ({
                    label:
                      bucket.bucket === "current"
                        ? "Not yet due"
                        : `${bucket.bucket} days overdue`,
                    value: bucket.amount,
                    color:
                      bucket.bucket === "current"
                        ? SERIES_COLORS[0]
                        : bucket.bucket === "1-30"
                        ? STATUS_COLORS.warning
                        : bucket.bucket === "31-60"
                        ? STATUS_COLORS.serious
                        : STATUS_COLORS.critical,
                  }))}
                />
              </ChartCard>
            </div>

            {/* Filters */}
            <div className="flex flex-col lg:flex-row gap-5 items-start lg:items-center justify-between mb-8">
              <div className="flex items-center gap-2 bg-stone-100 rounded-2xl p-1.5">
                {[
                  { key: "incoming", label: "Money in" },
                  { key: "outgoing", label: "Money out" },
                  { key: "all", label: "All" },
                ].map((option) => (
                  <button
                    key={option.key}
                    onClick={() => setTab(option.key)}
                    className={`cursor-pointer px-5 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wide transition-all ${
                      tab === option.key
                        ? option.key === "incoming"
                          ? "bg-white text-emerald-600 shadow-sm"
                          : option.key === "outgoing"
                          ? "bg-white text-amber-600 shadow-sm"
                          : "bg-white text-stone-900 shadow-sm"
                        : "text-stone-500 hover:text-stone-900"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-3 items-center w-full lg:w-auto">
                <input
                  type="text"
                  placeholder="Search number, client or vendor…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-white border border-stone-200 rounded-2xl py-3 px-4 text-stone-900 outline-none focus:border-amber-400 placeholder-stone-300 text-sm flex-1 lg:w-72 shadow-sm"
                />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-white border border-stone-200 rounded-2xl py-3 px-4 text-stone-900 outline-none focus:border-amber-400 text-sm appearance-none shadow-sm"
                >
                  <option value="all">All statuses</option>
                  {STATUSES.map((s) => <option key={s} value={s}>{humanize(s)}</option>)}
                </select>
                {tab !== "all" && (
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="bg-white border border-stone-200 rounded-2xl py-3 px-4 text-stone-900 outline-none focus:border-amber-400 text-sm appearance-none shadow-sm"
                  >
                    <option value="all">All categories</option>
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                )}
              </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-sm">
              {filtered.length === 0 ? (
                <div className="py-24 text-center text-stone-300 italic">
                  <Receipt size={36} className="mx-auto mb-3 opacity-50" />
                  No invoices match these filters.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[980px]">
                    <thead className="bg-stone-50 text-stone-400 text-[10px] uppercase tracking-[0.2em]">
                      <tr>
                        <th className="px-6 py-5">Number</th>
                        <th className="px-6 py-5">{tab === "outgoing" ? "Vendor" : "Client"}</th>
                        <th className="px-6 py-5">Category</th>
                        <th className="px-6 py-5">Issued</th>
                        <th className="px-6 py-5">Due</th>
                        <th className="px-6 py-5 text-right">Total</th>
                        <th className="px-6 py-5 text-right">Balance</th>
                        <th className="px-6 py-5">Status</th>
                        <th className="px-6 py-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {filtered.map((invoice) => {
                        const balance = Math.max(0, invoice.total - invoice.amountPaid);
                        const incoming = invoice.direction === "incoming";
                        return (
                          <tr key={invoice._id} className="hover:bg-stone-50 transition-colors">
                            <td className="px-6 py-4">
                              <span className="flex items-center gap-2 text-stone-900 text-sm font-semibold font-mono">
                                {incoming
                                  ? <ArrowUpCircle size={15} className="text-emerald-500 shrink-0" />
                                  : <ArrowDownCircle size={15} className="text-amber-500 shrink-0" />}
                                {invoice.invoiceNumber}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-stone-900 text-sm">{invoice.party?.name}</p>
                              {invoice.party?.email && (
                                <p className="text-stone-400 text-xs">{invoice.party.email}</p>
                              )}
                            </td>
                            <td className="px-6 py-4 text-stone-500 text-sm">{invoice.category}</td>
                            <td className="px-6 py-4 text-stone-500 text-sm">{formatDate(invoice.issueDate)}</td>
                            <td className="px-6 py-4 text-stone-500 text-sm">{formatDate(invoice.dueDate)}</td>
                            <td className="px-6 py-4 text-right text-stone-900 font-semibold text-sm tabular-nums">
                              {formatCurrency(invoice.total)}
                            </td>
                            <td className={`px-6 py-4 text-right font-semibold text-sm tabular-nums ${balance > 0 ? "text-stone-900" : "text-emerald-600"}`}>
                              {formatCurrency(balance)}
                            </td>
                            <td className="px-6 py-4">
                              <StatusPill tone={STATUS_TONES[invoice.status]}>{humanize(invoice.status)}</StatusPill>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => setDetailTarget(invoice)}
                                  title="View"
                                  className="cursor-pointer p-2.5 text-stone-300 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-all"
                                >
                                  <Eye size={16} />
                                </button>
                                {balance > 0 && invoice.status !== "cancelled" && (
                                  <button
                                    onClick={() => setPayTarget(invoice)}
                                    title="Record payment"
                                    className="cursor-pointer p-2.5 text-stone-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                                  >
                                    <CreditCard size={16} />
                                  </button>
                                )}
                                <button
                                  onClick={() => { setEditTarget(invoice); setModalDirection(invoice.direction); }}
                                  title="Edit"
                                  className="cursor-pointer p-2.5 text-stone-300 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                                >
                                  <Pencil size={16} />
                                </button>
                                <button
                                  onClick={() => setDeleteTarget(invoice)}
                                  title="Delete"
                                  className="cursor-pointer p-2.5 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <p className="text-stone-400 text-sm mt-4 text-right">
              Showing {filtered.length} of {invoices.length} records
            </p>
          </>
        )}
      </div>
    </motion.section>
  );
}
