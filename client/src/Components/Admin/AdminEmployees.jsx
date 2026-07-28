"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  ArrowLeft, Loader2, Plus, X, Trash2, Pencil, RefreshCw, Users, Briefcase,
  Wallet, Receipt, Eye, BadgeCheck,
} from "lucide-react";

import adminApi, {
  apiError, formatCurrency, formatDate, formatNumber, humanize, isSuperAdmin,
} from "./adminApi";
import {
  ChartCard, DonutChart, HorizontalBarChart, SERIES_COLORS, STATUS_COLORS,
  StatTile, StatusPill,
} from "./Charts";

const DEPARTMENTS = [
  "Management", "Sales", "Operations", "Marketing", "Finance",
  "Customer Support", "Guides", "IT", "Other",
];

const CONTRACTS = ["full_time", "part_time", "freelance", "intern"];
const STATUSES = ["active", "on_leave", "terminated"];
const PAYMENT_METHODS = ["bank_transfer", "cash", "credit_card", "paypal", "other"];

const STATUS_TONES = { active: "good", on_leave: "warning", terminated: "neutral" };

const blankForm = () => ({
  name: "",
  email: "",
  phone: "",
  position: "",
  department: "Operations",
  contractType: "full_time",
  monthlySalary: "",
  status: "active",
  hireDate: new Date().toISOString().slice(0, 10),
  paymentMethod: "bank_transfer",
  bankAccount: "",
  notes: "",
});

function EmployeeModal({ initial, onClose, onSaved }) {
  const [form, setForm] = useState(() =>
    initial
      ? {
          name: initial.name || "",
          email: initial.email || "",
          phone: initial.phone || "",
          position: initial.position || "",
          department: initial.department || "Other",
          contractType: initial.contractType || "full_time",
          monthlySalary: initial.monthlySalary ?? "",
          status: initial.status || "active",
          hireDate: initial.hireDate ? new Date(initial.hireDate).toISOString().slice(0, 10) : "",
          paymentMethod: initial.paymentMethod || "bank_transfer",
          bankAccount: initial.bankAccount || "",
          notes: initial.notes || "",
        }
      : blankForm()
  );
  const [saving, setSaving] = useState(false);

  const setField = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (form.monthlySalary === "" || Number(form.monthlySalary) < 0) {
      toast.error("A valid monthly salary is required");
      return;
    }

    setSaving(true);
    try {
      const res = initial
        ? await adminApi.patch(`/employees/${initial._id}`, form)
        : await adminApi.post("/employees", form);
      toast.success(initial ? "Employee updated" : "Employee added");
      onSaved(res.data, Boolean(initial));
      onClose();
    } catch (err) {
      toast.error(apiError(err, "Failed to save employee"));
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full bg-stone-50 border border-stone-200 rounded-2xl p-3.5 text-stone-900 outline-none focus:border-amber-400 placeholder-stone-300 text-sm";
  const labelClass = "text-amber-600 text-xs uppercase tracking-widest block mb-2";

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-6"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className="bg-white border border-stone-200 w-full max-w-2xl rounded-3xl shadow-2xl max-h-[92vh] overflow-y-auto"
        initial={{ scale: 0.96 }} animate={{ scale: 1 }} exit={{ scale: 0.96 }}
      >
        <div className="flex items-center justify-between p-7 border-b border-stone-200">
          <h2 className="text-2xl font-serif text-stone-900">
            {initial ? `Edit ${initial.name}` : "New employee"}
          </h2>
          <button onClick={onClose} className="cursor-pointer text-stone-400 hover:text-stone-900">
            <X size={26} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-7 grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className={labelClass}>Full name</label>
            <input className={inputClass} value={form.name} onChange={setField("name")} placeholder="e.g. Amina Belkacem" />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input className={inputClass} type="email" value={form.email} onChange={setField("email")} placeholder="name@darymstour.com" />
          </div>
          <div>
            <label className={labelClass}>Phone</label>
            <input className={inputClass} value={form.phone} onChange={setField("phone")} />
          </div>
          <div>
            <label className={labelClass}>Position</label>
            <input className={inputClass} value={form.position} onChange={setField("position")} placeholder="e.g. Travel consultant" />
          </div>
          <div>
            <label className={labelClass}>Department</label>
            <select className={`${inputClass} appearance-none`} value={form.department} onChange={setField("department")}>
              {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Monthly salary ($)</label>
            <input className={inputClass} type="number" min="0" step="0.01" value={form.monthlySalary} onChange={setField("monthlySalary")} placeholder="0.00" />
          </div>
          <div>
            <label className={labelClass}>Contract</label>
            <select className={`${inputClass} appearance-none`} value={form.contractType} onChange={setField("contractType")}>
              {CONTRACTS.map((c) => <option key={c} value={c}>{humanize(c)}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Status</label>
            <select className={`${inputClass} appearance-none`} value={form.status} onChange={setField("status")}>
              {STATUSES.map((s) => <option key={s} value={s}>{humanize(s)}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Hire date</label>
            <input className={inputClass} type="date" value={form.hireDate} onChange={setField("hireDate")} />
          </div>
          <div>
            <label className={labelClass}>Paid by</label>
            <select className={`${inputClass} appearance-none`} value={form.paymentMethod} onChange={setField("paymentMethod")}>
              {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{humanize(m)}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Bank account</label>
            <input className={inputClass} value={form.bankAccount} onChange={setField("bankAccount")} placeholder="IBAN or account number" />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Notes</label>
            <textarea rows={2} className={`${inputClass} resize-none`} value={form.notes} onChange={setField("notes")} />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="cursor-pointer md:col-span-2 w-full bg-amber-500 hover:bg-amber-600 text-white py-4 rounded-2xl font-bold uppercase tracking-widest disabled:opacity-50 transition-all"
          >
            {saving ? "Saving…" : initial ? "Save changes" : "Add employee"}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

function EmployeeDrawer({ employeeId, onClose }) {
  const [employee, setEmployee] = useState(null);

  useEffect(() => {
    adminApi
      .get(`/employees/${employeeId}`)
      .then((res) => setEmployee(res.data))
      .catch((err) => toast.error(apiError(err, "Failed to load employee")));
  }, [employeeId]);

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
        {!employee ? (
          <div className="flex items-center justify-center h-full text-amber-500">
            <Loader2 size={30} className="animate-spin" />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between p-7 border-b border-stone-200">
              <div>
                <h2 className="text-2xl font-serif text-stone-900">{employee.name}</h2>
                <p className="text-stone-400 text-sm mt-1">
                  {employee.position || "—"} · {employee.department}
                </p>
              </div>
              <button onClick={onClose} className="cursor-pointer text-stone-400 hover:text-stone-900">
                <X size={26} />
              </button>
            </div>

            <div className="p-7 space-y-7">
              <div className="flex items-center gap-3">
                <StatusPill tone={STATUS_TONES[employee.status]}>{humanize(employee.status)}</StatusPill>
                <StatusPill tone="neutral">{humanize(employee.contractType)}</StatusPill>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4">
                  <p className="text-stone-400 text-[10px] uppercase tracking-[0.2em] mb-1">Monthly salary</p>
                  <p className="text-stone-900 font-bold text-lg tabular-nums">{formatCurrency(employee.monthlySalary)}</p>
                </div>
                <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4">
                  <p className="text-stone-400 text-[10px] uppercase tracking-[0.2em] mb-1">Joined</p>
                  <p className="text-stone-900 font-semibold">{formatDate(employee.hireDate)}</p>
                </div>
              </div>

              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 space-y-2 text-sm">
                {employee.email && <p className="text-stone-500">{employee.email}</p>}
                {employee.phone && <p className="text-stone-500">{employee.phone}</p>}
                {employee.bankAccount && (
                  <p className="text-stone-400 text-xs">Paid to {employee.bankAccount} by {humanize(employee.paymentMethod)}</p>
                )}
                {employee.notes && <p className="text-stone-500 pt-2 border-t border-stone-200">{employee.notes}</p>}
              </div>

              <div>
                <h3 className="text-amber-600 text-xs uppercase tracking-widest mb-3">Payroll history</h3>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4">
                    <p className="text-stone-400 text-[10px] uppercase tracking-[0.15em] mb-1">Billed</p>
                    <p className="text-stone-900 font-bold tabular-nums text-sm">{formatCurrency(employee.payroll.totalBilled)}</p>
                  </div>
                  <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4">
                    <p className="text-stone-400 text-[10px] uppercase tracking-[0.15em] mb-1">Paid</p>
                    <p className="text-emerald-600 font-bold tabular-nums text-sm">{formatCurrency(employee.payroll.totalPaid)}</p>
                  </div>
                  <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4">
                    <p className="text-stone-400 text-[10px] uppercase tracking-[0.15em] mb-1">Owed</p>
                    <p className="text-stone-900 font-bold tabular-nums text-sm">{formatCurrency(employee.payroll.outstanding)}</p>
                  </div>
                </div>

                {employee.payroll.invoices.length ? (
                  <div className="space-y-2">
                    {employee.payroll.invoices.map((invoice) => (
                      <div key={invoice._id} className="flex items-center gap-3 bg-stone-50 border border-stone-200 rounded-2xl p-4 text-sm">
                        <div className="flex-1">
                          <p className="text-stone-900 font-mono text-xs">{invoice.invoiceNumber}</p>
                          <p className="text-stone-400 text-xs">
                            {invoice.payrollPeriod || formatDate(invoice.issueDate)}
                          </p>
                        </div>
                        <span className="text-stone-900 font-semibold tabular-nums">{formatCurrency(invoice.total)}</span>
                        <StatusPill tone={invoice.status === "paid" ? "good" : invoice.status === "overdue" ? "critical" : "warning"}>
                          {humanize(invoice.status)}
                        </StatusPill>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-stone-300 italic text-sm">No salary bills generated yet.</p>
                )}
              </div>

              <Link
                to="/admin/invoices"
                className="flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-stone-200 text-stone-600 hover:text-stone-900 hover:border-stone-300 font-semibold transition-all"
              >
                <Receipt size={16} /> Go to invoices
              </Link>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

export default function AdminEmployees() {
  const superadmin = isSuperAdmin();

  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [detailId, setDetailId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [employeesRes, statsRes] = await Promise.all([
        adminApi.get("/employees"),
        adminApi.get("/employees/payroll-stats"),
      ]);
      setEmployees(employeesRes.data);
      setStats(statsRes.data);
    } catch (err) {
      toast.error(apiError(err, "Failed to load the team"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return employees.filter((employee) => {
      if (departmentFilter !== "all" && employee.department !== departmentFilter) return false;
      if (statusFilter !== "all" && employee.status !== statusFilter) return false;
      if (!term) return true;
      return (
        employee.name?.toLowerCase().includes(term) ||
        employee.email?.toLowerCase().includes(term) ||
        employee.position?.toLowerCase().includes(term)
      );
    });
  }, [employees, search, departmentFilter, statusFilter]);

  const handleSaved = (employee, isEdit) => {
    setEmployees((prev) =>
      isEdit ? prev.map((e) => (e._id === employee._id ? employee : e)) : [...prev, employee]
    );
    fetchAll();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminApi.delete(`/employees/${deleteTarget._id}`);
      setEmployees((prev) => prev.filter((e) => e._id !== deleteTarget._id));
      toast.success("Employee removed");
      setDeleteTarget(null);
      fetchAll();
    } catch (err) {
      toast.error(apiError(err, "Delete failed"));
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-stone-50 pt-10 pb-24"
    >
      <AnimatePresence>
        {showModal && (
          <EmployeeModal
            initial={editTarget}
            onClose={() => { setShowModal(false); setEditTarget(null); }}
            onSaved={handleSaved}
          />
        )}
        {detailId && <EmployeeDrawer employeeId={detailId} onClose={() => setDetailId(null)} />}
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
              <h3 className="text-xl font-bold text-stone-900 mb-2">Remove {deleteTarget.name}?</h3>
              <p className="text-stone-400 text-sm mb-6">
                Employees with payroll history cannot be deleted — mark them terminated instead.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteTarget(null)}
                  className="cursor-pointer flex-1 py-3 rounded-2xl border border-stone-200 text-stone-500 hover:text-stone-900 font-semibold transition-all">
                  Cancel
                </button>
                <button onClick={handleDelete}
                  className="cursor-pointer flex-1 py-3 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold transition-all">
                  Remove
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-6">

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-12">
          <div>
            <Link to="/admin/dashboard"
              className="text-amber-600 hover:text-amber-700 text-sm tracking-widest uppercase flex items-center gap-2 mb-4">
              <ArrowLeft size={18} /> Dashboard
            </Link>
            <h1 className="text-5xl md:text-6xl font-serif text-stone-900">Team &amp; Payroll</h1>
            <p className="text-stone-500 text-lg mt-3">
              Who works here, what they cost, and what has actually been paid out.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button onClick={fetchAll} className="cursor-pointer flex items-center gap-2 text-amber-600 hover:text-amber-700 transition-all">
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> Refresh
            </button>
            {superadmin && (
              <button
                onClick={() => { setEditTarget(null); setShowModal(true); }}
                className="cursor-pointer flex items-center gap-2 bg-amber-500 text-white px-6 py-3 rounded-2xl font-bold uppercase tracking-widest text-sm hover:bg-amber-600 transition-all"
              >
                <Plus size={18} /> Add employee
              </button>
            )}
          </div>
        </div>

        {loading && !stats ? (
          <div className="flex items-center justify-center py-24 text-amber-500">
            <Loader2 size={36} className="animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-10">
              <StatTile
                label="Active staff"
                value={formatNumber(stats?.headcount?.active)}
                icon={<Users size={18} />}
                sub={`${formatNumber(stats?.headcount?.onLeave)} on leave · ${formatNumber(stats?.headcount?.terminated)} former`}
              />
              <StatTile
                label="Monthly salary mass"
                value={formatCurrency(stats?.monthlySalaryMass, { compact: true })}
                icon={<Wallet size={18} />}
                accent={SERIES_COLORS[1]}
                sub={`${formatCurrency(stats?.annualSalaryMass, { compact: true })} a year`}
              />
              <StatTile
                label="Average salary"
                value={formatCurrency(stats?.averageSalary, { compact: true })}
                icon={<Briefcase size={18} />}
                sub="Per active employee"
              />
              <StatTile
                label="Payroll paid out"
                value={formatCurrency(stats?.payrollPaid, { compact: true })}
                icon={<Receipt size={18} />}
                accent={STATUS_COLORS.good}
                sub={`${formatCurrency(stats?.payrollOutstanding, { compact: true })} still owed across ${formatNumber(stats?.payrollInvoiceCount)} bills`}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
              <ChartCard
                title="Cost by department"
                subtitle="Monthly salary mass of the active team"
                table={{
                  columns: ["Department", "Headcount", "Monthly cost"],
                  rows: (stats?.byDepartment || []).map((d) => [
                    d.department, formatNumber(d.headcount), formatCurrency(d.salaryMass),
                  ]),
                }}
              >
                <HorizontalBarChart
                  color={SERIES_COLORS[1]}
                  formatValue={formatCurrency}
                  emptyMessage="No employees recorded yet."
                  rows={(stats?.byDepartment || []).map((d) => ({
                    label: d.department,
                    value: d.salaryMass,
                    sub: `${formatNumber(d.headcount)} people`,
                  }))}
                />
              </ChartCard>

              <ChartCard
                title="Contract mix"
                subtitle="How the active team is employed"
                table={{
                  columns: ["Contract", "Headcount"],
                  rows: (stats?.byContract || []).map((c) => [humanize(c.contractType), formatNumber(c.headcount)]),
                }}
              >
                <DonutChart
                  centerLabel="Employees"
                  data={(stats?.byContract || []).map((c, i) => ({
                    label: humanize(c.contractType),
                    value: c.headcount,
                    color: SERIES_COLORS[i % SERIES_COLORS.length],
                  }))}
                />
              </ChartCard>

              <ChartCard
                title="Highest salaries"
                subtitle="Top of the active payroll"
                table={{
                  columns: ["Employee", "Monthly salary"],
                  rows: (stats?.topEarners || []).map((e) => [e.name, formatCurrency(e.monthlySalary)]),
                }}
              >
                <HorizontalBarChart
                  color={SERIES_COLORS[0]}
                  formatValue={formatCurrency}
                  emptyMessage="No employees recorded yet."
                  rows={(stats?.topEarners || []).map((e) => ({
                    label: e.name,
                    value: e.monthlySalary,
                    sub: `${e.position || "—"} · ${e.department}`,
                  }))}
                />
              </ChartCard>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center justify-between mb-8">
              <input
                type="text"
                placeholder="Search name, role or email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-white border border-stone-200 rounded-2xl py-3 px-4 text-stone-900 outline-none focus:border-amber-400 placeholder-stone-300 text-sm flex-1 min-w-[240px] lg:max-w-sm shadow-sm"
              />
              <div className="flex gap-3">
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="bg-white border border-stone-200 rounded-2xl py-3 px-4 text-stone-900 outline-none focus:border-amber-400 text-sm appearance-none shadow-sm"
                >
                  <option value="all">All departments</option>
                  {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-white border border-stone-200 rounded-2xl py-3 px-4 text-stone-900 outline-none focus:border-amber-400 text-sm appearance-none shadow-sm"
                >
                  <option value="all">All statuses</option>
                  {STATUSES.map((s) => <option key={s} value={s}>{humanize(s)}</option>)}
                </select>
              </div>
            </div>

            <div className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-sm">
              {filtered.length === 0 ? (
                <div className="py-24 text-center text-stone-300 italic">
                  <Users size={36} className="mx-auto mb-3 opacity-50" />
                  No employees match these filters.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[860px]">
                    <thead className="bg-stone-50 text-stone-400 text-[10px] uppercase tracking-[0.2em]">
                      <tr>
                        <th className="px-6 py-5">Name</th>
                        <th className="px-6 py-5">Position</th>
                        <th className="px-6 py-5">Department</th>
                        <th className="px-6 py-5">Contract</th>
                        <th className="px-6 py-5">Joined</th>
                        <th className="px-6 py-5 text-right">Monthly salary</th>
                        <th className="px-6 py-5">Status</th>
                        <th className="px-6 py-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {filtered.map((employee) => (
                        <tr key={employee._id} className="hover:bg-stone-50 transition-colors">
                          <td className="px-6 py-4">
                            <p className="text-stone-900 text-sm font-semibold flex items-center gap-2">
                              {employee.status === "active" && <BadgeCheck size={14} className="text-emerald-500" />}
                              {employee.name}
                            </p>
                            {employee.email && <p className="text-stone-400 text-xs">{employee.email}</p>}
                          </td>
                          <td className="px-6 py-4 text-stone-500 text-sm">{employee.position || "—"}</td>
                          <td className="px-6 py-4 text-stone-500 text-sm">{employee.department}</td>
                          <td className="px-6 py-4 text-stone-500 text-sm">{humanize(employee.contractType)}</td>
                          <td className="px-6 py-4 text-stone-500 text-sm">{formatDate(employee.hireDate)}</td>
                          <td className="px-6 py-4 text-right text-stone-900 font-semibold text-sm tabular-nums">
                            {formatCurrency(employee.monthlySalary)}
                          </td>
                          <td className="px-6 py-4">
                            <StatusPill tone={STATUS_TONES[employee.status]}>{humanize(employee.status)}</StatusPill>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => setDetailId(employee._id)}
                                title="View payroll history"
                                className="cursor-pointer p-2.5 text-stone-300 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-all"
                              >
                                <Eye size={16} />
                              </button>
                              {superadmin && (
                                <>
                                  <button
                                    onClick={() => { setEditTarget(employee); setShowModal(true); }}
                                    title="Edit"
                                    className="cursor-pointer p-2.5 text-stone-300 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                                  >
                                    <Pencil size={16} />
                                  </button>
                                  <button
                                    onClick={() => setDeleteTarget(employee)}
                                    title="Remove"
                                    className="cursor-pointer p-2.5 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <p className="text-stone-400 text-sm mt-4 text-right">
              Showing {filtered.length} of {employees.length} employees
            </p>

            {!superadmin && (
              <p className="text-stone-400 text-xs mt-6 text-center">
                Adding or editing staff records requires a superadmin account.
              </p>
            )}
          </>
        )}
      </div>
    </motion.section>
  );
}
