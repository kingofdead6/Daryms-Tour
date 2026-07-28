import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './Routes/authRoutes.js';
import { errorHandler } from './Middleware/error.js';

import destinationRoutes from './Routes/Destinationroutes.js';
import packageRoutes from './Routes/PackageRoutes.js';
import bookingRoutes from './Routes/BookingRoutes.js';
import contactRoutes from './Routes/ContactRoutes.js';
import expenseRoutes from './Routes/ExpenseRoutes.js';
import incomeRoutes from './Routes/IncomeRoutes.js';
import financeRoutes from './Routes/FinanceRoutes.js';
import invoiceRoutes from './Routes/InvoiceRoutes.js';
import employeeRoutes from './Routes/EmployeeRoutes.js';
import analyticsRoutes from './Routes/AnalyticsRoutes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));

app.use('/api/auth', authRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/bookings', bookingRoutes); 
app.use('/api/contacts', contactRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/income', incomeRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/analytics', analyticsRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));