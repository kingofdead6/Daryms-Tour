// src/pages/admin/AdminDashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import {
  BarChart3, CalendarCheck, MessageSquare, Wallet, MapPin, Package,
  Users, Receipt, Briefcase, ArrowRight, AlertTriangle, Loader2,
} from "lucide-react";

import adminApi, {
  apiError, formatCurrency, formatNumber, formatPercent, MONTH_LABELS,
} from "./adminApi";
import {
  BarChart, ChartCard, LineChart, SERIES_COLORS, STATUS_COLORS, StatTile, FLOW_COLORS,
} from "./Charts";

const compactMoney = (value) => formatCurrency(value, { compact: true });

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [userType, setUserType] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [invoiceStats, setInvoiceStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      toast.error("Please log in to access the admin area.");
      navigate("/login");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      if (decoded.usertype === "admin" || decoded.usertype === "superadmin") {
        setUserType(decoded.usertype);
      } else {
        toast.error("Unauthorized access.");
        navigate("/login");
      }
    } catch {
      toast.error("Invalid token.");
      navigate("/login");
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (!userType) return undefined;

    let cancelled = false;
    (async () => {
      try {
        const [overviewRes, invoiceRes] = await Promise.all([
          adminApi.get("/analytics/overview"),
          adminApi.get("/invoices/stats"),
        ]);
        if (cancelled) return;
        setOverview(overviewRes.data);
        setInvoiceStats(invoiceRes.data);
      } catch (err) {
        if (!cancelled) toast.error(apiError(err, "Could not load dashboard figures"));
      } finally {
        if (!cancelled) setStatsLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [userType]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    toast.success("Logged out successfully.");
    navigate("/login");
  };

  const adminSections = [
    {
      path: "/admin/analytics",
      title: "Analytics",
      description: "Graphs for bookings, revenue and everything in between",
      icon: <BarChart3 size={22} />,
    },
    {
      path: "/admin/bookings",
      title: "Manage Bookings",
      description: "View and manage customer bookings",
      icon: <CalendarCheck size={22} />,
    },
    {
      path: "/admin/invoices",
      title: "Invoices & Bills",
      description: "Client invoices, vendor bills and staff salary payments",
      icon: <Receipt size={22} />,
    },
    {
      path: "/admin/finance",
      title: "Finance",
      description: "Track income, expenses, and net profit",
      icon: <Wallet size={22} />,
    },
    {
      path: "/admin/employees",
      title: "Team & Payroll",
      description: "Staff directory, salary cost and payroll history",
      icon: <Briefcase size={22} />,
    },
    {
      path: "/admin/contact",
      title: "Contact Messages",
      description: "View and respond to customer inquiries",
      icon: <MessageSquare size={22} />,
    },
  ];

  const superadminSections = [
    ...adminSections,
    {
      path: "/admin/destinations",
      title: "Manage Destinations",
      description: "Add, edit, or remove travel destinations",
      icon: <MapPin size={22} />,
    },
    {
      path: "/admin/packages",
      title: "Manage Packages",
      description: "Create and manage travel packages",
      icon: <Package size={22} />,
    },
    {
      path: "/admin/users",
      title: "Manage Users",
      description: "Add, edit, or remove admin accounts",
      icon: <Users size={22} />,
    },
  ];

  const sections = userType === "superadmin" ? superadminSections : adminSections;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <p className="text-stone-500 text-xl font-light tracking-widest">
          Preparing the space...
        </p>
      </div>
    );
  }

  const kpis = overview?.kpis;
  const monthlyBookings = overview?.monthlyBookings || [];
  const monthlyLedger = overview?.monthlyLedger || [];
  const overdueIncoming = invoiceStats?.overdue?.incoming;
  const overdueOutgoing = invoiceStats?.overdue?.outgoing;

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen py-20 pt-32 relative bg-gradient-to-b from-stone-50 via-white to-stone-100 overflow-hidden"
    >
      {/* Subtle background texture */}
      <div className="absolute inset-0 bg-[radial-gradient(#e7e0d6_0.8px,transparent_1px)] bg-[length:70px_70px] opacity-60 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">

        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-amber-600 text-sm tracking-[4px] uppercase font-light mb-4"
          >
            Administration
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="text-5xl md:text-7xl font-serif tracking-wider text-stone-900"
          >
            {userType === "superadmin" ? "Master Control" : "Control Center"}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 text-xl text-stone-500 font-light max-w-2xl mx-auto"
          >
            Everything in its place. Every detail attended to.
          </motion.p>
        </div>

        {/* Live figures */}
        {statsLoading ? (
          <div className="flex items-center justify-center py-16 text-amber-500">
            <Loader2 size={30} className="animate-spin" />
          </div>
        ) : overview ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
              <StatTile
                label="Bookings this year"
                value={formatNumber(kpis.bookingsThisYear)}
                icon={<CalendarCheck size={18} />}
                delta={kpis.bookingsGrowth}
                deltaLabel="vs last year"
                spark={monthlyBookings.map((m) => m.bookings)}
                sparkColor={SERIES_COLORS[0]}
              />
              <StatTile
                label="Booked value"
                value={compactMoney(kpis.totalBookingValue)}
                icon={<Wallet size={18} />}
                accent={FLOW_COLORS.in}
                sub={`${compactMoney(kpis.averageBookingValue)} average booking`}
              />
              <StatTile
                label="Money still owed to us"
                value={compactMoney(invoiceStats?.incoming?.outstanding)}
                icon={<Receipt size={18} />}
                accent={STATUS_COLORS.warning}
                sub={`${compactMoney(invoiceStats?.incoming?.collected)} collected so far`}
              />
              <StatTile
                label="Bills left to pay"
                value={compactMoney(invoiceStats?.outgoing?.outstanding)}
                icon={<Receipt size={18} />}
                accent={FLOW_COLORS.out}
                sub={`${compactMoney(invoiceStats?.outgoing?.collected)} already paid out`}
              />
            </div>

            {/* Things that need attention */}
            {(overview.contacts.unread > 0 || overdueIncoming?.count > 0 || overdueOutgoing?.count > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
                {overview.contacts.unread > 0 && (
                  <Link to="/admin/contact" className="flex items-center gap-4 bg-white border border-stone-200 rounded-3xl p-5 hover:border-amber-300 transition-all shadow-sm">
                    <MessageSquare size={22} className="text-amber-500 shrink-0" />
                    <p className="text-sm text-stone-600">
                      <strong className="text-stone-900">{overview.contacts.unread} unread</strong> customer message(s)
                    </p>
                    <ArrowRight size={16} className="ml-auto text-stone-300" />
                  </Link>
                )}
                {overdueIncoming?.count > 0 && (
                  <Link to="/admin/invoices" className="flex items-center gap-4 bg-red-50 border border-red-200 rounded-3xl p-5 hover:border-red-300 transition-all">
                    <AlertTriangle size={22} className="text-red-500 shrink-0" />
                    <p className="text-sm text-red-700">
                      <strong>{overdueIncoming.count} invoice(s) overdue</strong> — {formatCurrency(overdueIncoming.amount)}
                    </p>
                    <ArrowRight size={16} className="ml-auto text-red-300" />
                  </Link>
                )}
                {overdueOutgoing?.count > 0 && (
                  <Link to="/admin/invoices" className="flex items-center gap-4 bg-amber-50 border border-amber-200 rounded-3xl p-5 hover:border-amber-300 transition-all">
                    <AlertTriangle size={22} className="text-amber-600 shrink-0" />
                    <p className="text-sm text-amber-800">
                      <strong>{overdueOutgoing.count} bill(s) past due</strong> — {formatCurrency(overdueOutgoing.amount)}
                    </p>
                    <ArrowRight size={16} className="ml-auto text-amber-300" />
                  </Link>
                )}
              </div>
            )}

            {/* Mini charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-16">
              <ChartCard
                title="Bookings this year"
                subtitle={`${formatPercent(kpis.confirmationRate)} confirmed · ${kpis.averageLeadDays} days average lead time`}
                actions={
                  <Link to="/admin/analytics" className="text-amber-600 hover:text-amber-700 text-xs uppercase tracking-widest">
                    Full analytics
                  </Link>
                }
                table={{
                  columns: ["Month", "Bookings", "Travellers"],
                  rows: monthlyBookings.map((m) => [
                    MONTH_LABELS[m.month - 1], formatNumber(m.bookings), formatNumber(m.travelers),
                  ]),
                }}
              >
                <LineChart
                  height={230}
                  labels={MONTH_LABELS}
                  formatValue={formatNumber}
                  series={[
                    { key: "bookings", label: "Bookings", color: SERIES_COLORS[0], data: monthlyBookings.map((m) => m.bookings) },
                    { key: "travelers", label: "Travellers", color: SERIES_COLORS[1], data: monthlyBookings.map((m) => m.travelers) },
                  ]}
                />
              </ChartCard>

              <ChartCard
                title="Money in vs money out"
                subtitle="Recorded income and expenses this year"
                actions={
                  <Link to="/admin/finance" className="text-amber-600 hover:text-amber-700 text-xs uppercase tracking-widest">
                    Finance
                  </Link>
                }
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
                  height={230}
                  labels={MONTH_LABELS}
                  formatValue={formatCurrency}
                  formatTick={compactMoney}
                  emptyMessage="No income or expenses recorded yet."
                  series={[
                    { key: "in", label: "Money in", color: FLOW_COLORS.in, data: monthlyLedger.map((m) => m.income) },
                    { key: "out", label: "Money out", color: FLOW_COLORS.out, data: monthlyLedger.map((m) => m.expenses) },
                  ]}
                />
              </ChartCard>
            </div>
          </>
        ) : null}

        {/* Dashboard Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: index * 0.07 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group"
            >
              <Link to={section.path}>
                <div className="bg-white border border-stone-200 rounded-3xl p-8 h-full flex flex-col justify-between transition-all duration-500 hover:border-amber-400/50 hover:shadow-2xl shadow-sm">
                  <div>
                    <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 mb-6 group-hover:bg-amber-100 transition-colors">
                      {section.icon}
                    </span>
                    <h2 className="text-2xl font-serif tracking-wide text-stone-900 group-hover:text-amber-700 transition-colors">
                      {section.title}
                    </h2>
                    <p className="mt-4 text-stone-500 font-light leading-relaxed">
                      {section.description}
                    </p>
                  </div>

                  <div className="mt-10 flex justify-end">
                    <span className="inline-flex items-center text-sm uppercase tracking-[2px] font-light text-amber-600 group-hover:text-amber-700 transition-all">
                      Enter
                      <ArrowRight size={18} className="ml-3 group-hover:translate-x-2 transition-transform" />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Closing line + Logout */}
        <div className="mt-24 text-center">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-stone-400 text-lg tracking-wide max-w-md mx-auto font-light"
          >
            In this space, order becomes the only luxury.
          </motion.p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="cursor-pointer mt-12 px-14 py-5 bg-transparent border border-stone-300 hover:border-amber-400/50 text-stone-600 hover:text-stone-900 text-lg font-light tracking-widest rounded-2xl transition-all duration-300"
          >
            Return to Stillness
          </motion.button>
        </div>
      </div>
    </motion.section>
  );
}
