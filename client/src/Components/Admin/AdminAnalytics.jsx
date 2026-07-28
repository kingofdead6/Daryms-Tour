"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  ArrowLeft, Loader2, RefreshCw, CalendarDays, Users, Wallet, TrendingUp,
  Ticket, MessageSquare, Plane, Building2, ShieldCheck, Briefcase, Receipt,
  PiggyBank, Percent,
} from "lucide-react";

import adminApi, {
  apiError, formatCurrency, formatDate, formatNumber, formatPercent,
  humanize, isSuperAdmin, MONTH_LABELS,
} from "./adminApi";
import {
  BarChart, ChartCard, DonutChart, HorizontalBarChart, LineChart,
  SERIES_COLORS, STATUS_COLORS, StatTile, StatusPill, FLOW_COLORS,
} from "./Charts";

const BOOKING_STATUS_TONES = {
  pending: "warning",
  confirmed: "good",
  completed: "info",
  cancelled: "critical",
  "no-show": "neutral",
};

// Booking states are a status scale, not a series — fixed colours, always labelled.
const BOOKING_STATUS_COLORS = {
  pending: STATUS_COLORS.warning,
  confirmed: STATUS_COLORS.good,
  completed: SERIES_COLORS[0],
  cancelled: STATUS_COLORS.critical,
  "no-show": STATUS_COLORS.neutral,
};

const PAYMENT_STATUS_COLORS = {
  paid: STATUS_COLORS.good,
  partially_paid: STATUS_COLORS.warning,
  unpaid: STATUS_COLORS.serious,
  refunded: SERIES_COLORS[0],
};

const compactMoney = (value) => formatCurrency(value, { compact: true });

export default function AdminAnalytics() {
  const superadmin = isSuperAdmin();
  const [year, setYear] = useState(new Date().getFullYear());
  const [overview, setOverview] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const requests = [adminApi.get("/analytics/overview", { params: { year } })];
      if (superadmin) requests.push(adminApi.get("/analytics/superadmin", { params: { year } }));

      const [overviewRes, companyRes] = await Promise.all(requests);
      setOverview(overviewRes.data);
      setCompany(companyRes?.data || null);
    } catch (err) {
      toast.error(apiError(err, "Failed to load analytics"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year]);

  const monthlyLedger = overview?.monthlyLedger || [];
  const monthlyBookings = overview?.monthlyBookings || [];
  const monthlyRevenue = overview?.monthlyRevenue || [];

  const revenueSpark = useMemo(
    () => monthlyRevenue.map((m) => m.booked),
    [monthlyRevenue]
  );
  const bookingSpark = useMemo(
    () => monthlyBookings.map((m) => m.bookings),
    [monthlyBookings]
  );

  const kpis = overview?.kpis;

  if (loading && !overview) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <Loader2 size={36} className="animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-stone-50 pt-10 pb-24"
    >
      <div className="max-w-7xl mx-auto px-6">

        {/* ─── Header ─────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-12">
          <div>
            <Link
              to="/admin/dashboard"
              className="text-amber-600 hover:text-amber-700 text-sm tracking-widest uppercase flex items-center gap-2 mb-4"
            >
              <ArrowLeft size={18} /> Dashboard
            </Link>
            <h1 className="text-5xl md:text-6xl font-serif text-stone-900">Analytics</h1>
            <p className="text-stone-500 text-lg mt-3">
              {superadmin
                ? "Every number the business runs on — operations, revenue and payroll."
                : "How bookings, guests and revenue are moving."}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {superadmin && (
              <span className="flex items-center gap-2 text-xs uppercase tracking-widest text-amber-700 bg-amber-50 border border-amber-200 px-4 py-2 rounded-2xl">
                <ShieldCheck size={14} /> Superadmin view
              </span>
            )}
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
            <button
              onClick={fetchAll}
              className="cursor-pointer flex items-center gap-2 text-amber-600 hover:text-amber-700 transition-all"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> Refresh
            </button>
          </div>
        </div>

        {/* ─── Headline numbers ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
          <StatTile
            label="Bookings this year"
            value={formatNumber(kpis?.bookingsThisYear)}
            icon={<Ticket size={18} />}
            delta={kpis?.bookingsGrowth}
            deltaLabel={`vs ${year - 1}`}
            spark={bookingSpark}
            sparkColor={SERIES_COLORS[0]}
            sub={`${formatNumber(kpis?.totalBookings)} all-time`}
          />
          <StatTile
            label="Total booking value"
            value={compactMoney(kpis?.totalBookingValue)}
            icon={<Wallet size={18} />}
            accent={SERIES_COLORS[2]}
            spark={revenueSpark}
            sparkColor={SERIES_COLORS[2]}
            sub={`${compactMoney(kpis?.revenueLast30Days)} in the last 30 days`}
          />
          <StatTile
            label="Average booking"
            value={compactMoney(kpis?.averageBookingValue)}
            icon={<TrendingUp size={18} />}
            sub={`${formatNumber(kpis?.totalTravelers)} travellers served`}
          />
          <StatTile
            label="Confirmation rate"
            value={formatPercent(kpis?.confirmationRate)}
            icon={<CalendarDays size={18} />}
            accent={SERIES_COLORS[0]}
            sub={`${formatPercent(kpis?.cancellationRate)} cancelled · ${kpis?.averageLeadDays || 0} days average lead time`}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-12">
          <StatTile
            label="Invoiced to clients"
            value={compactMoney(overview?.invoices?.incoming?.invoiced)}
            icon={<Receipt size={18} />}
            accent={FLOW_COLORS.in}
            sub={`${compactMoney(overview?.invoices?.incoming?.outstanding)} still outstanding`}
          />
          <StatTile
            label="Bills received"
            value={compactMoney(overview?.invoices?.outgoing?.invoiced)}
            icon={<Receipt size={18} />}
            accent={FLOW_COLORS.out}
            sub={`${compactMoney(overview?.invoices?.outgoing?.outstanding)} still to pay`}
          />
          <StatTile
            label="Travellers"
            value={formatNumber(kpis?.totalTravelers)}
            icon={<Users size={18} />}
            sub={`${formatNumber(overview?.travelerMix?.adults)} adults · ${formatNumber(overview?.travelerMix?.children)} children · ${formatNumber(overview?.travelerMix?.infants)} infants`}
          />
          <StatTile
            label="Unread messages"
            value={formatNumber(overview?.contacts?.unread)}
            icon={<MessageSquare size={18} />}
            accent={overview?.contacts?.unread ? STATUS_COLORS.serious : undefined}
            sub={`${formatNumber(overview?.contacts?.total)} received · ${formatNumber(overview?.contacts?.replied)} replied`}
          />
        </div>

        {/* ─── Volume & revenue over the year ─────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <ChartCard
            className="lg:col-span-2"
            title="Bookings and travellers"
            subtitle={`Created each month in ${year}`}
            table={{
              columns: ["Month", "Bookings", "Travellers"],
              rows: monthlyBookings.map((m) => [
                MONTH_LABELS[m.month - 1],
                formatNumber(m.bookings),
                formatNumber(m.travelers),
              ]),
            }}
          >
            <LineChart
              height={280}
              labels={MONTH_LABELS}
              formatValue={formatNumber}
              series={[
                { key: "bookings", label: "Bookings", color: SERIES_COLORS[0], data: monthlyBookings.map((m) => m.bookings) },
                { key: "travelers", label: "Travellers", color: SERIES_COLORS[1], data: monthlyBookings.map((m) => m.travelers) },
              ]}
            />
          </ChartCard>

          <ChartCard
            title="Booking status"
            subtitle="All bookings by state"
            table={{
              columns: ["Status", "Bookings", "Value"],
              rows: (overview?.bookingStatus || []).map((s) => [
                humanize(s.status),
                formatNumber(s.count),
                formatCurrency(s.value),
              ]),
            }}
          >
            <DonutChart
              centerLabel="Bookings"
              data={(overview?.bookingStatus || []).map((s) => ({
                label: humanize(s.status),
                value: s.count,
                color: BOOKING_STATUS_COLORS[s.status] || STATUS_COLORS.neutral,
              }))}
            />
          </ChartCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <ChartCard
            className="lg:col-span-2"
            title="Booking revenue"
            subtitle="Value booked, confirmed and actually collected"
            table={{
              columns: ["Month", "Booked", "Confirmed", "Collected"],
              rows: monthlyRevenue.map((m) => [
                MONTH_LABELS[m.month - 1],
                formatCurrency(m.booked),
                formatCurrency(m.confirmed),
                formatCurrency(m.collected),
              ]),
            }}
          >
            <BarChart
              height={280}
              labels={MONTH_LABELS}
              formatValue={formatCurrency}
              formatTick={compactMoney}
              series={[
                { key: "booked", label: "Booked", color: SERIES_COLORS[0], data: monthlyRevenue.map((m) => m.booked) },
                { key: "confirmed", label: "Confirmed", color: SERIES_COLORS[1], data: monthlyRevenue.map((m) => m.confirmed) },
                { key: "collected", label: "Collected", color: SERIES_COLORS[2], data: monthlyRevenue.map((m) => m.collected) },
              ]}
            />
          </ChartCard>

          <ChartCard
            title="Payment status"
            subtitle="Where booking money stands"
            table={{
              columns: ["Status", "Bookings", "Value"],
              rows: (overview?.paymentStatus || []).map((p) => [
                humanize(p.status),
                formatNumber(p.count),
                formatCurrency(p.value),
              ]),
            }}
          >
            <DonutChart
              centerLabel="Value"
              formatValue={compactMoney}
              data={(overview?.paymentStatus || []).map((p) => ({
                label: humanize(p.status),
                value: p.value,
                color: PAYMENT_STATUS_COLORS[p.status] || STATUS_COLORS.neutral,
              }))}
            />
          </ChartCard>
        </div>

        {/* ─── Cash in and out ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <ChartCard
            title="Money in vs money out"
            subtitle={`Recorded income and expenses in ${year}`}
            table={{
              columns: ["Month", "In", "Out", "Net"],
              rows: monthlyLedger.map((m) => [
                MONTH_LABELS[m.month - 1],
                formatCurrency(m.income),
                formatCurrency(m.expenses),
                formatCurrency(m.net),
              ]),
            }}
          >
            <BarChart
              height={260}
              labels={MONTH_LABELS}
              formatValue={formatCurrency}
              formatTick={compactMoney}
              series={[
                { key: "in", label: "Money in", color: FLOW_COLORS.in, data: monthlyLedger.map((m) => m.income) },
                { key: "out", label: "Money out", color: FLOW_COLORS.out, data: monthlyLedger.map((m) => m.expenses) },
              ]}
            />
          </ChartCard>

          <ChartCard
            title="Invoice cash flow"
            subtitle="Payments actually settled against invoices and bills"
            table={{
              columns: ["Month", "Collected", "Paid out"],
              rows: monthlyLedger.map((m) => [
                MONTH_LABELS[m.month - 1],
                formatCurrency(m.cashIn),
                formatCurrency(m.cashOut),
              ]),
            }}
          >
            <LineChart
              height={260}
              labels={MONTH_LABELS}
              formatValue={formatCurrency}
              formatTick={compactMoney}
              series={[
                { key: "cashIn", label: "Collected", color: FLOW_COLORS.in, data: monthlyLedger.map((m) => m.cashIn) },
                { key: "cashOut", label: "Paid out", color: FLOW_COLORS.out, data: monthlyLedger.map((m) => m.cashOut) },
              ]}
            />
          </ChartCard>
        </div>

        {/* ─── What sells ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <ChartCard
            title="Top destinations"
            subtitle="Ranked by booked revenue"
            table={{
              columns: ["Destination", "Bookings", "Revenue"],
              rows: (overview?.topDestinations || []).map((d) => [
                d.name,
                formatNumber(d.bookings),
                formatCurrency(d.revenue),
              ]),
            }}
          >
            <HorizontalBarChart
              color={SERIES_COLORS[0]}
              formatValue={formatCurrency}
              emptyMessage="No destination bookings yet."
              rows={(overview?.topDestinations || []).map((d) => ({
                label: d.name,
                value: d.revenue,
                sub: `${formatNumber(d.bookings)} bookings · ${formatNumber(d.travelers)} travellers`,
              }))}
            />
          </ChartCard>

          <ChartCard
            title="Top packages"
            subtitle="Ranked by booked revenue"
            table={{
              columns: ["Package", "Bookings", "Revenue"],
              rows: (overview?.topPackages || []).map((p) => [
                p.name,
                formatNumber(p.bookings),
                formatCurrency(p.revenue),
              ]),
            }}
          >
            <HorizontalBarChart
              color={SERIES_COLORS[1]}
              formatValue={formatCurrency}
              emptyMessage="No package bookings yet."
              rows={(overview?.topPackages || []).map((p) => ({
                label: p.name,
                value: p.revenue,
                sub: `${formatNumber(p.bookings)} bookings · ${p.category || "—"}`,
              }))}
            />
          </ChartCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <ChartCard
            title="Traveller mix"
            subtitle="Who is actually travelling"
            table={{
              columns: ["Group", "Travellers"],
              rows: [
                ["Adults", formatNumber(overview?.travelerMix?.adults)],
                ["Children", formatNumber(overview?.travelerMix?.children)],
                ["Infants", formatNumber(overview?.travelerMix?.infants)],
              ],
            }}
          >
            <DonutChart
              centerLabel="Travellers"
              data={[
                { label: "Adults", value: overview?.travelerMix?.adults, color: SERIES_COLORS[0] },
                { label: "Children", value: overview?.travelerMix?.children, color: SERIES_COLORS[1] },
                { label: "Infants", value: overview?.travelerMix?.infants, color: SERIES_COLORS[2] },
              ]}
            />
          </ChartCard>

          <ChartCard
            title="Destinations vs packages"
            subtitle="Where the revenue comes from"
            table={{
              columns: ["Type", "Bookings", "Value"],
              rows: (overview?.bookingType || []).map((t) => [
                humanize(t.type),
                formatNumber(t.count),
                formatCurrency(t.value),
              ]),
            }}
          >
            <DonutChart
              centerLabel="Booked value"
              formatValue={compactMoney}
              data={(overview?.bookingType || []).map((t, i) => ({
                label: humanize(t.type),
                value: t.value,
                color: SERIES_COLORS[i % SERIES_COLORS.length],
              }))}
            />
          </ChartCard>

          <ChartCard
            title="Enquiries received"
            subtitle={`Contact messages per month in ${year}`}
            table={{
              columns: ["Month", "Messages"],
              rows: (overview?.monthlyContacts || []).map((m) => [
                MONTH_LABELS[m.month - 1],
                formatNumber(m.messages),
              ]),
            }}
          >
            <LineChart
              height={220}
              labels={MONTH_LABELS}
              formatValue={formatNumber}
              series={[
                {
                  key: "messages",
                  label: "Messages",
                  color: SERIES_COLORS[0],
                  data: (overview?.monthlyContacts || []).map((m) => m.messages),
                },
              ]}
            />
          </ChartCard>
        </div>

        {/* ─── Upcoming departures ────────────────────────────────────── */}
        <ChartCard
          title="Next departures"
          subtitle="Confirmed and pending trips leaving soonest"
          className="mb-6"
        >
          {overview?.upcomingDepartures?.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[720px] text-sm">
                <thead className="text-stone-400 text-[10px] uppercase tracking-[0.2em]">
                  <tr>
                    <th className="py-3 pr-4 font-medium">Departure</th>
                    <th className="py-3 pr-4 font-medium">Guest</th>
                    <th className="py-3 pr-4 font-medium">Trip</th>
                    <th className="py-3 pr-4 font-medium">Travellers</th>
                    <th className="py-3 pr-4 font-medium">Value</th>
                    <th className="py-3 pr-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {overview.upcomingDepartures.map((booking) => (
                    <tr key={booking._id} className="hover:bg-stone-50 transition-colors">
                      <td className="py-3 pr-4 text-stone-900 font-medium">{formatDate(booking.departureDate)}</td>
                      <td className="py-3 pr-4 text-stone-600">{booking.guest}</td>
                      <td className="py-3 pr-4 text-stone-600">{booking.trip || "—"}</td>
                      <td className="py-3 pr-4 text-stone-600 tabular-nums">{booking.travelers}</td>
                      <td className="py-3 pr-4 text-stone-900 font-semibold tabular-nums">
                        {formatCurrency(booking.totalAmount)}
                      </td>
                      <td className="py-3 pr-4">
                        <StatusPill tone={BOOKING_STATUS_TONES[booking.status]}>
                          {humanize(booking.status)}
                        </StatusPill>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="py-12 text-center text-stone-300 italic">No upcoming departures scheduled.</p>
          )}
        </ChartCard>

        {/* ─── Superadmin: the company-wide view ──────────────────────── */}
        {superadmin && company && (
          <>
            <div className="flex items-center gap-4 mt-20 mb-10">
              <div className="h-px flex-1 bg-stone-200" />
              <span className="flex items-center gap-2 text-amber-700 text-xs uppercase tracking-[0.3em]">
                <ShieldCheck size={14} /> Superadmin only
              </span>
              <div className="h-px flex-1 bg-stone-200" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
              <StatTile
                label={`Income ${year}`}
                value={compactMoney(company.kpis.incomeYear)}
                icon={<Wallet size={18} />}
                accent={FLOW_COLORS.in}
                delta={company.kpis.incomeGrowth}
                deltaLabel={`vs ${year - 1}`}
              />
              <StatTile
                label={`Expenses ${year}`}
                value={compactMoney(company.kpis.expenseYear)}
                icon={<Receipt size={18} />}
                accent={FLOW_COLORS.out}
                delta={company.kpis.expenseGrowth}
                deltaLabel={`vs ${year - 1}`}
              />
              <StatTile
                label={`Net profit ${year}`}
                value={compactMoney(company.kpis.profitYear)}
                icon={<PiggyBank size={18} />}
                accent={company.kpis.profitYear >= 0 ? STATUS_COLORS.good : STATUS_COLORS.critical}
                delta={company.kpis.profitGrowth}
                deltaLabel={`vs ${year - 1}`}
              />
              <StatTile
                label="Profit margin"
                value={formatPercent(company.kpis.profitMargin)}
                icon={<Percent size={18} />}
                sub={`${formatPercent(company.kpis.payrollShareOfExpenses)} of spend goes to payroll`}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
              <StatTile
                label="Monthly salary mass"
                value={compactMoney(company.kpis.monthlySalaryMass)}
                icon={<Briefcase size={18} />}
                sub={`${compactMoney(company.kpis.annualSalaryMass)} a year`}
              />
              <StatTile
                label="Active staff"
                value={formatNumber(company.kpis.activeHeadcount)}
                icon={<Users size={18} />}
                sub={`across ${company.staffByDepartment.length} departments`}
              />
              <StatTile
                label="Destinations"
                value={formatNumber(company.inventory.destinations.total)}
                icon={<Plane size={18} />}
                sub={`${formatNumber(company.inventory.destinations.visible)} published`}
              />
              <StatTile
                label="Packages"
                value={formatNumber(company.inventory.packages.total)}
                icon={<Building2 size={18} />}
                sub={`${formatNumber(company.inventory.packages.visible)} published · ${formatNumber(company.inventory.packages.featured)} featured`}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <ChartCard
                title="Payroll cost"
                subtitle={`Salary bills issued each month in ${year}`}
                table={{
                  columns: ["Month", "Payroll"],
                  rows: company.monthlyPayroll.map((m) => [
                    MONTH_LABELS[m.month - 1],
                    formatCurrency(m.payroll),
                  ]),
                }}
              >
                <BarChart
                  height={260}
                  labels={MONTH_LABELS}
                  formatValue={formatCurrency}
                  formatTick={compactMoney}
                  emptyMessage="No payroll bills generated yet."
                  series={[
                    {
                      key: "payroll",
                      label: "Payroll",
                      color: SERIES_COLORS[1],
                      data: company.monthlyPayroll.map((m) => m.payroll),
                    },
                  ]}
                />
              </ChartCard>

              <ChartCard
                title="Payroll runs"
                subtitle="Billed against actually paid, per period"
                table={{
                  columns: ["Period", "Employees", "Billed", "Paid", "Outstanding"],
                  rows: company.payrollByPeriod.map((p) => [
                    p.period,
                    formatNumber(p.employees),
                    formatCurrency(p.billed),
                    formatCurrency(p.paid),
                    formatCurrency(p.outstanding),
                  ]),
                }}
              >
                <BarChart
                  height={260}
                  labels={company.payrollByPeriod.map((p) => p.period)}
                  formatValue={formatCurrency}
                  formatTick={compactMoney}
                  emptyMessage="Run payroll to see the comparison."
                  series={[
                    { key: "billed", label: "Billed", color: SERIES_COLORS[0], data: company.payrollByPeriod.map((p) => p.billed) },
                    { key: "paid", label: "Paid", color: SERIES_COLORS[2], data: company.payrollByPeriod.map((p) => p.paid) },
                  ]}
                />
              </ChartCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <ChartCard
                title="Salary mass by department"
                subtitle="Monthly cost of the active team"
                table={{
                  columns: ["Department", "Headcount", "Monthly cost"],
                  rows: company.staffByDepartment.map((d) => [
                    d.department,
                    formatNumber(d.headcount),
                    formatCurrency(d.salaryMass),
                  ]),
                }}
              >
                <HorizontalBarChart
                  color={SERIES_COLORS[1]}
                  formatValue={formatCurrency}
                  emptyMessage="No employees recorded yet."
                  rows={company.staffByDepartment.map((d) => ({
                    label: d.department,
                    value: d.salaryMass,
                    sub: `${formatNumber(d.headcount)} people`,
                  }))}
                />
              </ChartCard>

              <ChartCard
                title="Accounts by role"
                subtitle="Who can sign in"
                table={{
                  columns: ["Role", "Accounts"],
                  rows: company.users.map((u) => [humanize(u.role), formatNumber(u.count)]),
                }}
              >
                <DonutChart
                  centerLabel="Accounts"
                  data={company.users.map((u, i) => ({
                    label: humanize(u.role),
                    value: u.count,
                    color: SERIES_COLORS[i % SERIES_COLORS.length],
                  }))}
                />
              </ChartCard>

              <ChartCard
                title="Revenue by continent"
                subtitle="Destination bookings"
                table={{
                  columns: ["Continent", "Bookings", "Revenue"],
                  rows: company.revenueByContinent.map((c) => [
                    c.continent,
                    formatNumber(c.bookings),
                    formatCurrency(c.revenue),
                  ]),
                }}
              >
                <HorizontalBarChart
                  color={SERIES_COLORS[0]}
                  formatValue={formatCurrency}
                  emptyMessage="No destination bookings yet."
                  rows={company.revenueByContinent.map((c) => ({
                    label: c.continent,
                    value: c.revenue,
                    sub: `${formatNumber(c.bookings)} bookings`,
                  }))}
                />
              </ChartCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <ChartCard
                title="Where income comes from"
                subtitle="All recorded income by category"
                table={{
                  columns: ["Category", "Entries", "Total"],
                  rows: company.incomeByCategory.map((c) => [
                    c.category,
                    formatNumber(c.count),
                    formatCurrency(c.total),
                  ]),
                }}
              >
                <HorizontalBarChart
                  color={FLOW_COLORS.in}
                  formatValue={formatCurrency}
                  emptyMessage="No income recorded yet."
                  maxRows={10}
                  rows={company.incomeByCategory.map((c) => ({ label: c.category, value: c.total }))}
                />
              </ChartCard>

              <ChartCard
                title="Where money is spent"
                subtitle="All recorded expenses by category"
                table={{
                  columns: ["Category", "Entries", "Total"],
                  rows: company.expensesByCategory.map((c) => [
                    c.category,
                    formatNumber(c.count),
                    formatCurrency(c.total),
                  ]),
                }}
              >
                <HorizontalBarChart
                  color={FLOW_COLORS.out}
                  formatValue={formatCurrency}
                  emptyMessage="No expenses recorded yet."
                  maxRows={10}
                  rows={company.expensesByCategory.map((c) => ({ label: c.category, value: c.total }))}
                />
              </ChartCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartCard
                title="Catalogue by continent"
                subtitle="Destinations on offer and their average price"
                table={{
                  columns: ["Continent", "Destinations", "Average price"],
                  rows: company.inventory.byContinent.map((c) => [
                    c.continent,
                    formatNumber(c.count),
                    formatCurrency(c.avgPrice),
                  ]),
                }}
              >
                <HorizontalBarChart
                  color={SERIES_COLORS[0]}
                  formatValue={formatNumber}
                  emptyMessage="No destinations published yet."
                  rows={company.inventory.byContinent.map((c) => ({
                    label: c.continent,
                    value: c.count,
                    sub: `${formatCurrency(c.avgPrice)} average price`,
                  }))}
                />
              </ChartCard>

              <ChartCard
                title="Catalogue by package type"
                subtitle="Packages on offer and their average price"
                table={{
                  columns: ["Category", "Packages", "Average price"],
                  rows: company.inventory.byPackageCategory.map((c) => [
                    c.category,
                    formatNumber(c.count),
                    formatCurrency(c.avgPrice),
                  ]),
                }}
              >
                <HorizontalBarChart
                  color={SERIES_COLORS[1]}
                  formatValue={formatNumber}
                  emptyMessage="No packages published yet."
                  rows={company.inventory.byPackageCategory.map((c) => ({
                    label: c.category,
                    value: c.count,
                    sub: `${formatCurrency(c.avgPrice)} average price`,
                  }))}
                />
              </ChartCard>
            </div>
          </>
        )}
      </div>
    </motion.section>
  );
}
