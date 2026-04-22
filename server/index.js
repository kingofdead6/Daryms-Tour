import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './Routes/authRoutes.js';
import { errorHandler } from './Middleware/error.js';
import categoryRoutes from './Routes/categoriesRoutes.js';
import galleryRoutes from './Routes/galleryRoutes.js';
import signatureDishesRoutes from './Routes/SignatureDishesRoutes.js';
import menuRoutes from './Routes/menuRoutes.js';
import reservationRoutes from './Routes/reservationRoutes.js';
import tableRoutes from './Routes/TableRoutes.js';

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
app.use('/api/categories', categoryRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/signature-dishes', signatureDishesRoutes); 
app.use('/api/menu', menuRoutes);
app.use('/api/reservations', reservationRoutes); 
app.use('/api/tables', tableRoutes);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));