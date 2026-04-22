import asyncHandler from "express-async-handler";
import Reservation from "../Models/Reservation.js";
import Table from "../Models/Table.js";

// POST /api/reservations — Public: Create a reservation request
export const createReservation = asyncHandler(async (req, res) => {
  const { name, email, phone, guests, date, time, table } = req.body;

  if (!name || !email || !phone || !guests || !date || !time || !table) {
    res.status(400);
    throw new Error("Please provide all required fields");
  }

  // One-week window restriction
  const bookingDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const oneWeekFromNow = new Date();
  oneWeekFromNow.setDate(today.getDate() + 7);

  if (bookingDate < today || bookingDate > oneWeekFromNow) {
    res.status(400);
    throw new Error("Reservations are only open for the upcoming 7 days.");
  }

  // Check the table exists and has enough capacity
  const tableDoc = await Table.findById(table);
  if (!tableDoc || !tableDoc.isActive) {
    res.status(400);
    throw new Error("Selected table is not available.");
  }
  if (tableDoc.capacity < guests) {
    res.status(400);
    throw new Error("Table capacity is insufficient for your group.");
  }

  // Check for double-booking (ignore cancelled reservations)
  const alreadyBooked = await Reservation.findOne({
    date,
    time,
    table,
    status: { $in: ['pending', 'confirmed'] }
  });
  if (alreadyBooked) {
    res.status(400);
    throw new Error("This table is already reserved for this time slot.");
  }

  // expiresAt: 1 hour from now — MongoDB TTL will delete it if still pending
  const reservation = await Reservation.create({
    name, email, phone, guests, date, time, table,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000)
  });

  const populated = await reservation.populate('table');
  res.status(201).json(populated);
});

// GET /api/reservations — Admin: Get all reservations
export const getReservations = asyncHandler(async (req, res) => {
  const reservations = await Reservation.find()
    .populate('table')
    .sort({ date: 1, time: 1 });
  res.status(200).json(reservations);
});

// PATCH /api/reservations/:id/status — Admin: Confirm or Cancel
export const updateReservationStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['confirmed', 'cancelled'].includes(status)) {
    res.status(400);
    throw new Error("Invalid status. Use 'confirmed' or 'cancelled'.");
  }

  const reservation = await Reservation.findById(req.params.id);
  if (!reservation) {
    res.status(404);
    throw new Error("Reservation not found.");
  }

  reservation.status = status;

  if (status === 'confirmed') {
    // Remove expiresAt so the TTL index won't delete confirmed bookings
    reservation.expiresAt = undefined;
  }

  await reservation.save();
  const populated = await reservation.populate('table');
  res.json(populated);
});

// DELETE /api/reservations/:id — Admin: Hard delete
export const deleteReservation = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findById(req.params.id);
  if (!reservation) {
    res.status(404);
    throw new Error("Reservation not found.");
  }
  await reservation.deleteOne();
  res.json({ message: "Reservation deleted." });
});