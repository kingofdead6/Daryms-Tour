import Table from "../Models/Table.js";
import Reservation from "../Models/Reservation.js";
import asyncHandler from "express-async-handler";

// POST /api/tables — Admin: Add a table
export const addTable = asyncHandler(async (req, res) => {
  const { number, capacity } = req.body;
  if (!number || !capacity) {
    res.status(400);
    throw new Error("Table number and capacity are required.");
  }
  const exists = await Table.findOne({ number });
  if (exists) {
    res.status(400);
    throw new Error(`Table #${number} already exists.`);
  }
  const table = await Table.create({ number, capacity });
  res.status(201).json(table);
});

// GET /api/tables — Admin: Get all tables
export const getTables = asyncHandler(async (req, res) => {
  const tables = await Table.find().sort({ number: 1 });
  res.json(tables);
});

// GET /api/tables/availability — Public: Get available tables for a slot
export const checkAvailability = asyncHandler(async (req, res) => {
  const { date, time, guests } = req.query;

  if (!date || !time || !guests) {
    res.status(400);
    throw new Error("date, time, and guests are required.");
  }

  // Tables with enough capacity
  const suitableTables = await Table.find({
    capacity: { $gte: Number(guests) },
    isActive: true
  }).sort({ capacity: 1 });

  // Active bookings (pending or confirmed) for this slot
  const bookings = await Reservation.find({
    date,
    time,
    status: { $in: ['pending', 'confirmed'] }
  });

  const bookedTableIds = new Set(bookings.map(b => b.table.toString()));

  const available = suitableTables.filter(t => !bookedTableIds.has(t._id.toString()));

  res.json(available);
});

// DELETE /api/tables/:id — Admin: Delete a table (only if no active reservations)
export const deleteTable = asyncHandler(async (req, res) => {
  const table = await Table.findById(req.params.id);
  if (!table) {
    res.status(404);
    throw new Error("Table not found.");
  }

  const activeReservations = await Reservation.findOne({
    table: req.params.id,
    status: { $in: ['pending', 'confirmed'] }
  });

  if (activeReservations) {
    res.status(400);
    throw new Error("Cannot delete table with active reservations.");
  }

  await table.deleteOne();
  res.json({ message: "Table removed." });
});