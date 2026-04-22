import asyncHandler from "express-async-handler";
import Destination from "../Models/Destination.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

// @desc    Create a destination
// @route   POST /api/destinations
// @access  Admin
export const createDestination = asyncHandler(async (req, res) => {
  const { name, country, continent, price, type, isVisible } = req.body;

  if (!name || !country || !continent || !price || !type) {
    res.status(400);
    throw new Error("Name, Country, Continent, Price, and Type are required");
  }

  let imageUrl = null;
  if (req.file) {
    imageUrl = await uploadToCloudinary(req.file);
  } else {
    res.status(400);
    throw new Error("A destination image is required");
  }

  const destination = await Destination.create({
    name: name.trim(),
    country: country.trim(),
    continent,
    price: Number(price),
    type,
    image: imageUrl,
    isVisible: isVisible === "true" || isVisible === true,
  });

  res.status(201).json(destination);
});

// @desc    Get all destinations (public — visible only)
// @route   GET /api/destinations
// @access  Public
export const getDestinations = asyncHandler(async (req, res) => {
  const destinations = await Destination.find({ isVisible: true }).sort({ createdAt: -1 });
  res.status(200).json(destinations);
});

// @desc    Get all destinations (admin — all)
// @route   GET /api/destinations/admin
// @access  Admin
export const getAllDestinationsAdmin = asyncHandler(async (req, res) => {
  const destinations = await Destination.find({}).sort({ createdAt: -1 });
  res.status(200).json(destinations);
});

// @desc    Get single destination by ID
// @route   GET /api/destinations/:id
// @access  Public
export const getDestinationById = asyncHandler(async (req, res) => {
  const destination = await Destination.findById(req.params.id);

  if (!destination) {
    res.status(404);
    throw new Error("Destination not found");
  }

  res.status(200).json(destination);
});

// @desc    Update a destination
// @route   PUT /api/destinations/:id
// @access  Admin
export const updateDestination = asyncHandler(async (req, res) => {
  const destination = await Destination.findById(req.params.id);

  if (!destination) {
    res.status(404);
    throw new Error("Destination not found");
  }

  const { name, country, continent, price, type, isVisible } = req.body;

  let imageUrl = destination.image;
  if (req.file) {
    imageUrl = await uploadToCloudinary(req.file);
  }

  destination.name = name?.trim() || destination.name;
  destination.country = country?.trim() || destination.country;
  destination.continent = continent || destination.continent;
  destination.price = price ? Number(price) : destination.price;
  destination.type = type || destination.type;
  destination.image = imageUrl;
  destination.isVisible =
    isVisible !== undefined
      ? isVisible === "true" || isVisible === true
      : destination.isVisible;

  const updated = await destination.save();
  res.status(200).json(updated);
});

// @desc    Toggle visibility
// @route   PATCH /api/destinations/:id/visibility
// @access  Admin
export const toggleVisibility = asyncHandler(async (req, res) => {
  const destination = await Destination.findById(req.params.id);

  if (!destination) {
    res.status(404);
    throw new Error("Destination not found");
  }

  destination.isVisible = !destination.isVisible;
  await destination.save();
  res.status(200).json(destination);
});

// @desc    Delete a destination
// @route   DELETE /api/destinations/:id
// @access  Admin
export const deleteDestination = asyncHandler(async (req, res) => {
  const destination = await Destination.findById(req.params.id);

  if (!destination) {
    res.status(404);
    throw new Error("Destination not found");
  }

  await Destination.findByIdAndDelete(req.params.id);
  res.status(200).json({ message: "Destination deleted successfully" });
});
export const togglePopular = asyncHandler(async (req, res) => {
  const destination = await Destination.findById(req.params.id);
 
  if (!destination) {
    res.status(404);
    throw new Error("Destination not found");
  }
 
  destination.isPopular = !destination.isPopular;
  await destination.save();
  res.status(200).json(destination);
});
 
// Also add a public route to get popular destinations only:
 
// @desc    Get popular destinations (public)
// @route   GET /api/destinations/popular
// @access  Public
export const getPopularDestinations = asyncHandler(async (req, res) => {
  const destinations = await Destination.find({
    isPopular: true,
    isVisible: true,
  }).sort({ createdAt: -1 });
 
  res.status(200).json(destinations);
});
 