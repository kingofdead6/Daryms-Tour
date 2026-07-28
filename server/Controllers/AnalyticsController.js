import asyncHandler from "express-async-handler";
import Booking from "../Models/Booking.js";
import Destination from "../Models/Destination.js";
import Package from "../Models/Package.js";
import Contact from "../Models/Contact.js";
import Income from "../Models/Income.js";
import Expense from "../Models/Expense.js";
import Invoice from "../Models/Invoice.js";
import Employee from "../Models/Employee.js";
import User from "../Models/User.js";

const yearBounds = (year) => ({
  start: new Date(Date.UTC(year, 0, 1)),
  end: new Date(Date.UTC(year + 1, 0, 1)),
});

// Turn a [{ _id: <month number>, ... }] aggregation into a dense 12-slot array.
const spreadOverMonths = (rows, fields) =>
  Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const row = rows.find((r) => r._id === month);
    const out = { month };
    fields.forEach((field) => {
      out[field] = Number((row?.[field] || 0).toFixed(2));
    });
    return out;
  });

const round = (n) => Number((n || 0).toFixed(2));

const pctChange = (current, previous) => {
  if (!previous) return current > 0 ? 100 : 0;
  return Number((((current - previous) / previous) * 100).toFixed(1));
};

// ─── Admin overview: operations + the money that flows through them ─────────
export const getAdminAnalytics = asyncHandler(async (req, res) => {
  const year = Number(req.query.year) || new Date().getFullYear();
  const { start, end } = yearBounds(year);
  const prev = yearBounds(year - 1);
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);

  const [
    totalBookings,
    bookingsThisYear,
    bookingsLastYear,
    statusRows,
    paymentRows,
    typeRows,
    monthlyBookingRows,
    monthlyRevenueRows,
    travellerRows,
    topDestinations,
    topPackages,
    contactRows,
    monthlyContactRows,
    upcomingDepartures,
    recentBookings,
    roomTypeRows,
    leadTimeRows,
  ] = await Promise.all([
    Booking.countDocuments(),
    Booking.countDocuments({ createdAt: { $gte: start, $lt: end } }),
    Booking.countDocuments({ createdAt: { $gte: prev.start, $lt: prev.end } }),

    Booking.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 }, value: { $sum: "$totalAmount" } } },
      { $sort: { count: -1 } },
    ]),

    Booking.aggregate([
      { $group: { _id: "$paymentStatus", count: { $sum: 1 }, value: { $sum: "$totalAmount" } } },
    ]),

    Booking.aggregate([
      { $group: { _id: "$bookingType", count: { $sum: 1 }, value: { $sum: "$totalAmount" } } },
    ]),

    Booking.aggregate([
      { $match: { createdAt: { $gte: start, $lt: end } } },
      {
        $group: {
          _id: { $month: "$createdAt" },
          bookings: { $sum: 1 },
          travelers: { $sum: "$totalTravelers" },
        },
      },
    ]),

    Booking.aggregate([
      { $match: { createdAt: { $gte: start, $lt: end } } },
      {
        $group: {
          _id: { $month: "$createdAt" },
          booked: { $sum: "$totalAmount" },
          confirmed: {
            $sum: {
              $cond: [{ $in: ["$status", ["confirmed", "completed"]] }, "$totalAmount", 0],
            },
          },
          collected: {
            $sum: { $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$totalAmount", 0] },
          },
        },
      },
    ]),

    Booking.aggregate([
      {
        $group: {
          _id: null,
          adults: { $sum: "$travelers.adults" },
          children: { $sum: "$travelers.children" },
          infants: { $sum: "$travelers.infants" },
          totalTravelers: { $sum: "$totalTravelers" },
          totalValue: { $sum: "$totalAmount" },
          avgValue: { $avg: "$totalAmount" },
        },
      },
    ]),

    Booking.aggregate([
      { $match: { bookingType: "destination", destination: { $ne: null } } },
      {
        $group: {
          _id: "$destination",
          bookings: { $sum: 1 },
          revenue: { $sum: "$totalAmount" },
          travelers: { $sum: "$totalTravelers" },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 8 },
      {
        $lookup: {
          from: "destinations",
          localField: "_id",
          foreignField: "_id",
          as: "destination",
        },
      },
      { $unwind: { path: "$destination", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          name: { $ifNull: ["$destination.name", "Removed destination"] },
          country: "$destination.country",
          continent: "$destination.continent",
          bookings: 1,
          revenue: 1,
          travelers: 1,
        },
      },
    ]),

    Booking.aggregate([
      { $match: { bookingType: "package", package: { $ne: null } } },
      {
        $group: {
          _id: "$package",
          bookings: { $sum: 1 },
          revenue: { $sum: "$totalAmount" },
          travelers: { $sum: "$totalTravelers" },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 8 },
      {
        $lookup: { from: "packages", localField: "_id", foreignField: "_id", as: "package" },
      },
      { $unwind: { path: "$package", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          name: { $ifNull: ["$package.title", "Removed package"] },
          category: "$package.category",
          bookings: 1,
          revenue: 1,
          travelers: 1,
        },
      },
    ]),

    Contact.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),

    Contact.aggregate([
      { $match: { createdAt: { $gte: start, $lt: end } } },
      { $group: { _id: { $month: "$createdAt" }, messages: { $sum: 1 } } },
    ]),

    Booking.find({ departureDate: { $gte: now }, status: { $in: ["pending", "confirmed"] } })
      .populate("destination", "name country")
      .populate("package", "title")
      .sort({ departureDate: 1 })
      .limit(8)
      .lean(),

    Booking.find({ createdAt: { $gte: thirtyDaysAgo } })
      .select("totalAmount status paymentStatus createdAt")
      .lean(),

    Booking.aggregate([{ $group: { _id: "$roomType", count: { $sum: 1 } } }]),

    Booking.aggregate([
      { $match: { departureDate: { $ne: null } } },
      {
        $project: {
          leadDays: {
            $divide: [{ $subtract: ["$departureDate", "$createdAt"] }, 86400000],
          },
        },
      },
      { $group: { _id: null, avgLeadDays: { $avg: "$leadDays" } } },
    ]),
  ]);

  // Ledger + invoice money view for the same year.
  const [incomeRows, expenseRows, invoiceCashRows, invoiceTotals] = await Promise.all([
    Income.aggregate([
      { $match: { date: { $gte: start, $lt: end } } },
      { $group: { _id: { $month: "$date" }, income: { $sum: "$amount" } } },
    ]),
    Expense.aggregate([
      { $match: { date: { $gte: start, $lt: end } } },
      { $group: { _id: { $month: "$date" }, expenses: { $sum: "$amount" } } },
    ]),
    Invoice.aggregate([
      { $unwind: "$payments" },
      { $match: { "payments.date": { $gte: start, $lt: end } } },
      {
        $group: {
          _id: { $month: "$payments.date" },
          cashIn: { $sum: { $cond: [{ $eq: ["$direction", "incoming"] }, "$payments.amount", 0] } },
          cashOut: { $sum: { $cond: [{ $eq: ["$direction", "outgoing"] }, "$payments.amount", 0] } },
        },
      },
    ]),
    Invoice.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      {
        $group: {
          _id: "$direction",
          invoiced: { $sum: "$total" },
          settled: { $sum: "$amountPaid" },
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  const monthlyBookings = spreadOverMonths(monthlyBookingRows, ["bookings", "travelers"]);
  const monthlyRevenue = spreadOverMonths(monthlyRevenueRows, ["booked", "confirmed", "collected"]);
  const monthlyLedger = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    return {
      month,
      income: round(incomeRows.find((r) => r._id === month)?.income),
      expenses: round(expenseRows.find((r) => r._id === month)?.expenses),
      cashIn: round(invoiceCashRows.find((r) => r._id === month)?.cashIn),
      cashOut: round(invoiceCashRows.find((r) => r._id === month)?.cashOut),
    };
  }).map((m) => ({ ...m, net: round(m.income - m.expenses) }));

  const monthlyContacts = spreadOverMonths(monthlyContactRows, ["messages"]);

  const travellers = travellerRows[0] || {};
  const statusMap = Object.fromEntries(statusRows.map((s) => [s._id, s.count]));
  const confirmedish = (statusMap.confirmed || 0) + (statusMap.completed || 0);

  const invoiceRead = (direction) => {
    const row = invoiceTotals.find((r) => r._id === direction);
    return {
      invoiced: round(row?.invoiced),
      settled: round(row?.settled),
      outstanding: round((row?.invoiced || 0) - (row?.settled || 0)),
      count: row?.count || 0,
    };
  };

  const recentRevenue = recentBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  res.status(200).json({
    year,
    generatedAt: now,

    kpis: {
      totalBookings,
      bookingsThisYear,
      bookingsGrowth: pctChange(bookingsThisYear, bookingsLastYear),
      confirmationRate: totalBookings ? Number(((confirmedish / totalBookings) * 100).toFixed(1)) : 0,
      cancellationRate: totalBookings
        ? Number((((statusMap.cancelled || 0) / totalBookings) * 100).toFixed(1))
        : 0,
      totalBookingValue: round(travellers.totalValue),
      averageBookingValue: round(travellers.avgValue),
      totalTravelers: travellers.totalTravelers || 0,
      averageLeadDays: Math.round(leadTimeRows[0]?.avgLeadDays || 0),
      bookingsLast30Days: recentBookings.length,
      revenueLast30Days: round(recentRevenue),
    },

    bookingStatus: statusRows.map((s) => ({ status: s._id, count: s.count, value: round(s.value) })),
    paymentStatus: paymentRows.map((p) => ({ status: p._id, count: p.count, value: round(p.value) })),
    bookingType: typeRows.map((t) => ({ type: t._id, count: t.count, value: round(t.value) })),
    roomTypes: roomTypeRows.map((r) => ({ roomType: r._id || "Standard", count: r.count })),

    travelerMix: {
      adults: travellers.adults || 0,
      children: travellers.children || 0,
      infants: travellers.infants || 0,
    },

    monthlyBookings,
    monthlyRevenue,
    monthlyLedger,
    monthlyContacts,

    topDestinations: topDestinations.map((d) => ({ ...d, revenue: round(d.revenue) })),
    topPackages: topPackages.map((p) => ({ ...p, revenue: round(p.revenue) })),

    contacts: {
      total: contactRows.reduce((sum, c) => sum + c.count, 0),
      unread: contactRows.find((c) => c._id === "unread")?.count || 0,
      read: contactRows.find((c) => c._id === "read")?.count || 0,
      replied: contactRows.find((c) => c._id === "replied")?.count || 0,
    },

    invoices: {
      incoming: invoiceRead("incoming"),
      outgoing: invoiceRead("outgoing"),
    },

    upcomingDepartures: upcomingDepartures.map((b) => ({
      _id: b._id,
      referenceCode: b.referenceCode,
      guest: `${b.firstName} ${b.lastName}`,
      trip: b.bookingType === "destination" ? b.destination?.name : b.package?.title,
      departureDate: b.departureDate,
      travelers: b.totalTravelers,
      status: b.status,
      totalAmount: b.totalAmount,
    })),
  });
});

// ─── Superadmin: the whole-business view on top of the admin one ────────────
export const getSuperAdminAnalytics = asyncHandler(async (req, res) => {
  const year = Number(req.query.year) || new Date().getFullYear();
  const { start, end } = yearBounds(year);
  const prev = yearBounds(year - 1);

  const [
    userRows,
    staffRows,
    payrollRows,
    destinationRows,
    packageRows,
    inventoryCounts,
    incomeCategoryRows,
    expenseCategoryRows,
    thisYearIncome,
    lastYearIncome,
    thisYearExpense,
    lastYearExpense,
    continentRevenue,
    packageCategoryRevenue,
    invoiceStatusRows,
    monthlyPayrollRows,
  ] = await Promise.all([
    User.aggregate([{ $group: { _id: "$usertype", count: { $sum: 1 } } }]),

    Employee.aggregate([
      { $match: { status: "active" } },
      {
        $group: {
          _id: "$department",
          headcount: { $sum: 1 },
          salaryMass: { $sum: "$monthlySalary" },
        },
      },
      { $sort: { salaryMass: -1 } },
    ]),

    Invoice.aggregate([
      { $match: { category: "Employee Salary", status: { $ne: "cancelled" } } },
      {
        $group: {
          _id: "$payrollPeriod",
          billed: { $sum: "$total" },
          paid: { $sum: "$amountPaid" },
          employees: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 24 },
    ]),

    Destination.aggregate([
      { $group: { _id: "$continent", count: { $sum: 1 }, avgPrice: { $avg: "$price" } } },
      { $sort: { count: -1 } },
    ]),

    Package.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 }, avgPrice: { $avg: "$price" } } },
      { $sort: { count: -1 } },
    ]),

    Promise.all([
      Destination.countDocuments(),
      Destination.countDocuments({ isVisible: true }),
      Package.countDocuments(),
      Package.countDocuments({ isVisible: true }),
      Package.countDocuments({ isFeatured: true }),
    ]),

    Income.aggregate([
      { $group: { _id: "$category", total: { $sum: "$amount" }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]),

    Expense.aggregate([
      { $group: { _id: "$category", total: { $sum: "$amount" }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]),

    Income.aggregate([
      { $match: { date: { $gte: start, $lt: end } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Income.aggregate([
      { $match: { date: { $gte: prev.start, $lt: prev.end } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Expense.aggregate([
      { $match: { date: { $gte: start, $lt: end } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Expense.aggregate([
      { $match: { date: { $gte: prev.start, $lt: prev.end } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),

    Booking.aggregate([
      { $match: { bookingType: "destination", destination: { $ne: null } } },
      {
        $lookup: {
          from: "destinations",
          localField: "destination",
          foreignField: "_id",
          as: "dest",
        },
      },
      { $unwind: "$dest" },
      {
        $group: {
          _id: "$dest.continent",
          revenue: { $sum: "$totalAmount" },
          bookings: { $sum: 1 },
        },
      },
      { $sort: { revenue: -1 } },
    ]),

    Booking.aggregate([
      { $match: { bookingType: "package", package: { $ne: null } } },
      { $lookup: { from: "packages", localField: "package", foreignField: "_id", as: "pkg" } },
      { $unwind: "$pkg" },
      {
        $group: {
          _id: "$pkg.category",
          revenue: { $sum: "$totalAmount" },
          bookings: { $sum: 1 },
        },
      },
      { $sort: { revenue: -1 } },
    ]),

    Invoice.aggregate([
      { $group: { _id: { direction: "$direction", status: "$status" }, count: { $sum: 1 }, total: { $sum: "$total" } } },
    ]),

    Invoice.aggregate([
      {
        $match: {
          category: "Employee Salary",
          status: { $ne: "cancelled" },
          issueDate: { $gte: start, $lt: end },
        },
      },
      { $group: { _id: { $month: "$issueDate" }, payroll: { $sum: "$total" } } },
    ]),
  ]);

  const [
    destinationTotal,
    destinationVisible,
    packageTotal,
    packageVisible,
    packageFeatured,
  ] = inventoryCounts;

  const incomeYear = round(thisYearIncome[0]?.total);
  const incomeLastYear = round(lastYearIncome[0]?.total);
  const expenseYear = round(thisYearExpense[0]?.total);
  const expenseLastYear = round(lastYearExpense[0]?.total);
  const profitYear = round(incomeYear - expenseYear);
  const profitLastYear = round(incomeLastYear - expenseLastYear);

  const salaryMass = staffRows.reduce((sum, s) => sum + s.salaryMass, 0);
  const headcount = staffRows.reduce((sum, s) => sum + s.headcount, 0);

  res.status(200).json({
    year,

    kpis: {
      incomeYear,
      expenseYear,
      profitYear,
      profitMargin: incomeYear ? Number(((profitYear / incomeYear) * 100).toFixed(1)) : 0,
      incomeGrowth: pctChange(incomeYear, incomeLastYear),
      expenseGrowth: pctChange(expenseYear, expenseLastYear),
      profitGrowth: pctChange(profitYear, profitLastYear),
      monthlySalaryMass: round(salaryMass),
      annualSalaryMass: round(salaryMass * 12),
      activeHeadcount: headcount,
      payrollShareOfExpenses: expenseYear
        ? Number((((salaryMass * 12) / expenseYear) * 100).toFixed(1))
        : 0,
    },

    users: userRows.map((u) => ({ role: u._id, count: u.count })),

    staffByDepartment: staffRows.map((s) => ({
      department: s._id,
      headcount: s.headcount,
      salaryMass: round(s.salaryMass),
    })),

    payrollByPeriod: payrollRows
      .filter((p) => p._id)
      .map((p) => ({
        period: p._id,
        billed: round(p.billed),
        paid: round(p.paid),
        outstanding: round(p.billed - p.paid),
        employees: p.employees,
      })),

    monthlyPayroll: spreadOverMonths(monthlyPayrollRows, ["payroll"]),

    inventory: {
      destinations: { total: destinationTotal, visible: destinationVisible },
      packages: { total: packageTotal, visible: packageVisible, featured: packageFeatured },
      byContinent: destinationRows.map((d) => ({
        continent: d._id,
        count: d.count,
        avgPrice: round(d.avgPrice),
      })),
      byPackageCategory: packageRows.map((p) => ({
        category: p._id,
        count: p.count,
        avgPrice: round(p.avgPrice),
      })),
    },

    incomeByCategory: incomeCategoryRows.map((c) => ({
      category: c._id,
      total: round(c.total),
      count: c.count,
    })),
    expensesByCategory: expenseCategoryRows.map((c) => ({
      category: c._id,
      total: round(c.total),
      count: c.count,
    })),

    revenueByContinent: continentRevenue.map((c) => ({
      continent: c._id,
      revenue: round(c.revenue),
      bookings: c.bookings,
    })),
    revenueByPackageCategory: packageCategoryRevenue.map((c) => ({
      category: c._id,
      revenue: round(c.revenue),
      bookings: c.bookings,
    })),

    invoiceStatus: invoiceStatusRows.map((s) => ({
      direction: s._id.direction,
      status: s._id.status,
      count: s.count,
      total: round(s.total),
    })),
  });
});
