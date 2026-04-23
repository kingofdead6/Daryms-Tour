import asyncHandler from "express-async-handler";
import Booking from "../Models/Booking.js";

// @desc    Create a booking
// @route   POST /api/bookings
// @access  Public
export const createBooking = asyncHandler(async (req, res) => {
  const {
    bookingType, destination, package: pkg,
    firstName, lastName, email, phone, nationality, passportNumber,
    departureDate, returnDate,
    adults, children, infants,
    pricePerPerson,
    specialRequests, dietaryRequirements, roomType,
    paymentMethod,
  } = req.body;

  if (!bookingType || !firstName || !lastName || !email || !phone || !departureDate || !pricePerPerson) {
    res.status(400);
    throw new Error("Missing required booking fields");
  }

  if (bookingType === "destination" && !destination) {
    res.status(400);
    throw new Error("Destination ID is required for destination bookings");
  }

  if (bookingType === "package" && !pkg) {
    res.status(400);
    throw new Error("Package ID is required for package bookings");
  }

  const adultsNum = Number(adults) || 1;
  const childrenNum = Number(children) || 0;
  const infantsNum = Number(infants) || 0;
  const totalTravelers = adultsNum + childrenNum;
  const price = Number(pricePerPerson);
  const subtotal = price * totalTravelers;
  const taxes = Math.round(subtotal * 0.05); // 5% tax
  const totalAmount = subtotal + taxes;

  const booking = await Booking.create({
    bookingType,
    destination: bookingType === "destination" ? destination : null,
    package: bookingType === "package" ? pkg : null,
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: email.trim().toLowerCase(),
    phone: phone.trim(),
    nationality: nationality?.trim() || "",
    passportNumber: passportNumber?.trim() || "",
    departureDate: new Date(departureDate),
    returnDate: returnDate ? new Date(returnDate) : null,
    travelers: { adults: adultsNum, children: childrenNum, infants: infantsNum },
    pricePerPerson: price,
    totalTravelers,
    subtotal,
    taxes,
    discount: 0,
    totalAmount,
    specialRequests: specialRequests?.trim() || "",
    dietaryRequirements: dietaryRequirements?.trim() || "",
    roomType: roomType || "Standard",
    paymentMethod: paymentMethod || "credit_card",
    status: "pending",
    paymentStatus: "unpaid",
  });

  // Populate for response
  const populated = await Booking.findById(booking._id)
    .populate("destination", "name country image price")
    .populate("package", "title images price");

  res.status(201).json(populated);
});

// @desc    Get all bookings (admin)
// @route   GET /api/bookings/admin/all
// @access  Admin
export const getAllBookingsAdmin = asyncHandler(async (req, res) => {
  const { status, paymentStatus, bookingType, search } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (paymentStatus) filter.paymentStatus = paymentStatus;
  if (bookingType) filter.bookingType = bookingType;
  if (search) {
    filter.$or = [
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { referenceCode: { $regex: search, $options: "i" } },
    ];
  }

  const bookings = await Booking.find(filter)
    .populate("destination", "name country image price continent")
    .populate("package", "title images price category")
    .sort({ createdAt: -1 });

  res.status(200).json(bookings);
});

// @desc    Get a booking by ID
// @route   GET /api/bookings/:id
// @access  Admin / Owner
export const getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate("destination", "name country continent image price duration type")
    .populate("package", "title subtitle images price duration category itinerary");

  if (!booking) {
    res.status(404);
    throw new Error("Booking not found");
  }

  res.status(200).json(booking);
});

// @desc    Get booking by reference code (public lookup)
// @route   GET /api/bookings/reference/:code
// @access  Public
export const getBookingByReference = asyncHandler(async (req, res) => {
  const booking = await Booking.findOne({ referenceCode: req.params.code })
    .populate("destination", "name country continent image price duration type")
    .populate("package", "title subtitle images price duration category");

  if (!booking) {
    res.status(404);
    throw new Error("Booking not found");
  }

  res.status(200).json(booking);
});

// @desc    Update booking status
// @route   PATCH /api/bookings/:id/status
// @access  Admin
export const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const booking = await Booking.findById(req.params.id);

  if (!booking) { res.status(404); throw new Error("Booking not found"); }

  const validStatuses = ["pending", "confirmed", "cancelled", "completed", "no-show"];
  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error("Invalid status");
  }

  booking.status = status;
  await booking.save();

  const updated = await Booking.findById(booking._id)
    .populate("destination", "name country image price")
    .populate("package", "title images price");

  res.status(200).json(updated);
});

// @desc    Update payment status
// @route   PATCH /api/bookings/:id/payment
// @access  Admin
export const updatePaymentStatus = asyncHandler(async (req, res) => {
  const { paymentStatus } = req.body;
  const booking = await Booking.findById(req.params.id);

  if (!booking) { res.status(404); throw new Error("Booking not found"); }

  const valid = ["unpaid", "partially_paid", "paid", "refunded"];
  if (!valid.includes(paymentStatus)) {
    res.status(400);
    throw new Error("Invalid payment status");
  }

  booking.paymentStatus = paymentStatus;
  await booking.save();

  const updated = await Booking.findById(booking._id)
    .populate("destination", "name country image price")
    .populate("package", "title images price");

  res.status(200).json(updated);
});

// @desc    Update admin notes
// @route   PATCH /api/bookings/:id/notes
// @access  Admin
export const updateAdminNotes = asyncHandler(async (req, res) => {
  const { adminNotes } = req.body;
  const booking = await Booking.findById(req.params.id);

  if (!booking) { res.status(404); throw new Error("Booking not found"); }

  booking.adminNotes = adminNotes?.trim() || "";
  await booking.save();

  res.status(200).json(booking);
});

// @desc    Delete a booking
// @route   DELETE /api/bookings/:id
// @access  Admin
export const deleteBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) { res.status(404); throw new Error("Booking not found"); }
  await Booking.findByIdAndDelete(req.params.id);
  res.status(200).json({ message: "Booking deleted" });
});

// @desc    Get booking stats
// @route   GET /api/bookings/admin/stats
// @access  Admin
export const getBookingStats = asyncHandler(async (req, res) => {
  const total = await Booking.countDocuments();
  const pending = await Booking.countDocuments({ status: "pending" });
  const confirmed = await Booking.countDocuments({ status: "confirmed" });
  const cancelled = await Booking.countDocuments({ status: "cancelled" });
  const completed = await Booking.countDocuments({ status: "completed" });

  const revenueResult = await Booking.aggregate([
    { $match: { paymentStatus: "paid" } },
    { $group: { _id: null, total: { $sum: "$totalAmount" } } },
  ]);
  const totalRevenue = revenueResult[0]?.total || 0;

  const pendingRevenue = await Booking.aggregate([
    { $match: { status: { $in: ["pending", "confirmed"] } } },
    { $group: { _id: null, total: { $sum: "$totalAmount" } } },
  ]);

  res.status(200).json({
    total,
    pending,
    confirmed,
    cancelled,
    completed,
    totalRevenue,
    pendingRevenue: pendingRevenue[0]?.total || 0,
  });
});