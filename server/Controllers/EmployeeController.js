import asyncHandler from "express-async-handler";
import Employee, {
  EMPLOYEE_DEPARTMENTS,
  EMPLOYEE_CONTRACTS,
  EMPLOYEE_STATUSES,
} from "../Models/Employee.js";
import Invoice from "../Models/Invoice.js";

export const createEmployee = asyncHandler(async (req, res) => {
  const {
    name, email, phone, position, department, contractType,
    monthlySalary, status, hireDate, endDate, paymentMethod, bankAccount, notes,
  } = req.body;

  if (!name?.trim()) {
    res.status(400);
    throw new Error("Employee name is required");
  }
  if (monthlySalary === undefined || monthlySalary === null || Number(monthlySalary) < 0) {
    res.status(400);
    throw new Error("A valid monthly salary is required");
  }
  if (department && !EMPLOYEE_DEPARTMENTS.includes(department)) {
    res.status(400);
    throw new Error("Invalid department");
  }
  if (contractType && !EMPLOYEE_CONTRACTS.includes(contractType)) {
    res.status(400);
    throw new Error("Invalid contract type");
  }
  if (status && !EMPLOYEE_STATUSES.includes(status)) {
    res.status(400);
    throw new Error("Invalid status");
  }

  const employee = await Employee.create({
    name: name.trim(),
    email: email?.trim() || "",
    phone: phone?.trim() || "",
    position: position?.trim() || "",
    department: department || "Other",
    contractType: contractType || "full_time",
    monthlySalary: Number(monthlySalary),
    status: status || "active",
    hireDate: hireDate ? new Date(hireDate) : new Date(),
    endDate: endDate ? new Date(endDate) : null,
    paymentMethod: paymentMethod || "bank_transfer",
    bankAccount: bankAccount?.trim() || "",
    notes: notes?.trim() || "",
  });

  res.status(201).json(employee);
});

export const getAllEmployees = asyncHandler(async (req, res) => {
  const { department, status, search } = req.query;

  const filter = {};
  if (department && department !== "all") filter.department = department;
  if (status && status !== "all") filter.status = status;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { position: { $regex: search, $options: "i" } },
    ];
  }

  const employees = await Employee.find(filter).sort({ name: 1 });
  res.status(200).json(employees);
});

export const getEmployeeById = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id);
  if (!employee) {
    res.status(404);
    throw new Error("Employee not found");
  }

  const invoices = await Invoice.find({ employee: employee._id })
    .sort({ issueDate: -1 })
    .lean();

  const totalPaid = invoices.reduce((sum, i) => sum + (i.amountPaid || 0), 0);
  const totalBilled = invoices
    .filter((i) => i.status !== "cancelled")
    .reduce((sum, i) => sum + (i.total || 0), 0);

  res.status(200).json({
    ...employee.toObject(),
    payroll: {
      invoiceCount: invoices.length,
      totalBilled: Number(totalBilled.toFixed(2)),
      totalPaid: Number(totalPaid.toFixed(2)),
      outstanding: Number((totalBilled - totalPaid).toFixed(2)),
      invoices,
    },
  });
});

export const updateEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id);
  if (!employee) {
    res.status(404);
    throw new Error("Employee not found");
  }

  const {
    name, email, phone, position, department, contractType,
    monthlySalary, status, hireDate, endDate, paymentMethod, bankAccount, notes,
  } = req.body;

  if (department && !EMPLOYEE_DEPARTMENTS.includes(department)) {
    res.status(400);
    throw new Error("Invalid department");
  }
  if (contractType && !EMPLOYEE_CONTRACTS.includes(contractType)) {
    res.status(400);
    throw new Error("Invalid contract type");
  }
  if (status && !EMPLOYEE_STATUSES.includes(status)) {
    res.status(400);
    throw new Error("Invalid status");
  }

  if (name !== undefined) employee.name = name.trim();
  if (email !== undefined) employee.email = email.trim();
  if (phone !== undefined) employee.phone = phone.trim();
  if (position !== undefined) employee.position = position.trim();
  if (department !== undefined) employee.department = department;
  if (contractType !== undefined) employee.contractType = contractType;
  if (monthlySalary !== undefined) employee.monthlySalary = Number(monthlySalary);
  if (status !== undefined) employee.status = status;
  if (hireDate !== undefined) employee.hireDate = new Date(hireDate);
  if (endDate !== undefined) employee.endDate = endDate ? new Date(endDate) : null;
  if (paymentMethod !== undefined) employee.paymentMethod = paymentMethod;
  if (bankAccount !== undefined) employee.bankAccount = bankAccount.trim();
  if (notes !== undefined) employee.notes = notes.trim();

  await employee.save();
  res.status(200).json(employee);
});

export const deleteEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id);
  if (!employee) {
    res.status(404);
    throw new Error("Employee not found");
  }

  const billCount = await Invoice.countDocuments({ employee: employee._id });
  if (billCount > 0) {
    res.status(400);
    throw new Error(
      `This employee has ${billCount} payroll bill(s). Set their status to "terminated" instead of deleting.`
    );
  }

  await Employee.findByIdAndDelete(req.params.id);
  res.status(200).json({ message: "Employee deleted" });
});

// ─── Payroll overview: headcount, salary mass, and what has been paid out ───
export const getPayrollStats = asyncHandler(async (req, res) => {
  const employees = await Employee.find().lean();
  const active = employees.filter((e) => e.status === "active");

  const monthlySalaryMass = active.reduce((sum, e) => sum + (e.monthlySalary || 0), 0);

  const byDepartment = Object.values(
    active.reduce((acc, e) => {
      acc[e.department] = acc[e.department] || { department: e.department, headcount: 0, salaryMass: 0 };
      acc[e.department].headcount += 1;
      acc[e.department].salaryMass += e.monthlySalary || 0;
      return acc;
    }, {})
  ).sort((a, b) => b.salaryMass - a.salaryMass);

  const byContract = Object.values(
    active.reduce((acc, e) => {
      acc[e.contractType] = acc[e.contractType] || { contractType: e.contractType, headcount: 0 };
      acc[e.contractType].headcount += 1;
      return acc;
    }, {})
  );

  const salaryInvoices = await Invoice.aggregate([
    { $match: { category: "Employee Salary", status: { $ne: "cancelled" } } },
    {
      $group: {
        _id: null,
        billed: { $sum: "$total" },
        paid: { $sum: "$amountPaid" },
        count: { $sum: 1 },
      },
    },
  ]);

  const topEarners = [...active]
    .sort((a, b) => b.monthlySalary - a.monthlySalary)
    .slice(0, 8)
    .map((e) => ({
      _id: e._id,
      name: e.name,
      position: e.position,
      department: e.department,
      monthlySalary: e.monthlySalary,
    }));

  res.status(200).json({
    headcount: {
      total: employees.length,
      active: active.length,
      onLeave: employees.filter((e) => e.status === "on_leave").length,
      terminated: employees.filter((e) => e.status === "terminated").length,
    },
    monthlySalaryMass: Number(monthlySalaryMass.toFixed(2)),
    annualSalaryMass: Number((monthlySalaryMass * 12).toFixed(2)),
    averageSalary: active.length ? Number((monthlySalaryMass / active.length).toFixed(2)) : 0,
    byDepartment,
    byContract,
    payrollBilled: Number((salaryInvoices[0]?.billed || 0).toFixed(2)),
    payrollPaid: Number((salaryInvoices[0]?.paid || 0).toFixed(2)),
    payrollOutstanding: Number(
      ((salaryInvoices[0]?.billed || 0) - (salaryInvoices[0]?.paid || 0)).toFixed(2)
    ),
    payrollInvoiceCount: salaryInvoices[0]?.count || 0,
    topEarners,
  });
});
