import asyncHandler from "express-async-handler";
import Package from "../Models/Package.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

// @desc    Create a package
// @route   POST /api/packages
// @access  Admin
export const createPackage = asyncHandler(async (req, res) => {
  const {
    title, subtitle, description, price, originalPrice, duration,
    maxGroupSize, difficulty, category, highlights, includes, excludes,
    itinerary, destinations, isVisible, isFeatured, isPopular, tags,
    departureCity, languages, minAge, rating,
  } = req.body;

  if (!title || !price || !duration || !category) {
    res.status(400);
    throw new Error("Title, price, duration, and category are required");
  }

  let imageUrls = [];
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const url = await uploadToCloudinary(file);
      imageUrls.push(url);
    }
  }

  const pkg = await Package.create({
    title: title.trim(),
    subtitle: subtitle?.trim() || "",
    description: description?.trim() || "",
    price: Number(price),
    originalPrice: originalPrice ? Number(originalPrice) : null,
    duration: duration.trim(),
    maxGroupSize: maxGroupSize ? Number(maxGroupSize) : 12,
    difficulty: difficulty || "Moderate",
    category,
    images: imageUrls,
    highlights: highlights ? JSON.parse(highlights) : [],
    includes: includes ? JSON.parse(includes) : [],
    excludes: excludes ? JSON.parse(excludes) : [],
    itinerary: itinerary ? JSON.parse(itinerary) : [],
    destinations: destinations ? JSON.parse(destinations) : [],
    isVisible: isVisible === "true" || isVisible === true,
    isFeatured: isFeatured === "true" || isFeatured === true,
    isPopular: isPopular === "true" || isPopular === true,
    tags: tags ? JSON.parse(tags) : [],
    departureCity: departureCity?.trim() || "",
    languages: languages ? JSON.parse(languages) : ["English"],
    minAge: minAge ? Number(minAge) : 0,
    rating: rating ? Number(rating) : 4.8,
  });

  res.status(201).json(pkg);
});

// @desc    Get all visible packages (public)
// @route   GET /api/packages
// @access  Public
export const getPackages = asyncHandler(async (req, res) => {
  const packages = await Package.find({ isVisible: true })
    .populate("destinations", "name country continent image price")
    .sort({ createdAt: -1 });
  res.status(200).json(packages);
});

// @desc    Get all packages (admin)
// @route   GET /api/packages/admin/all
// @access  Admin
export const getAllPackagesAdmin = asyncHandler(async (req, res) => {
  const packages = await Package.find({})
    .populate("destinations", "name country continent image price")
    .sort({ createdAt: -1 });
  res.status(200).json(packages);
});

// @desc    Get featured packages
// @route   GET /api/packages/featured
// @access  Public
export const getFeaturedPackages = asyncHandler(async (req, res) => {
  const packages = await Package.find({ isFeatured: true, isVisible: true })
    .populate("destinations", "name country continent image price")
    .sort({ createdAt: -1 });
  res.status(200).json(packages);
});

// @desc    Get popular packages
// @route   GET /api/packages/popular
// @access  Public
export const getPopularPackages = asyncHandler(async (req, res) => {
  const packages = await Package.find({ isPopular: true, isVisible: true })
    .populate("destinations", "name country continent image price")
    .sort({ createdAt: -1 });
  res.status(200).json(packages);
});

// @desc    Get single package by ID
// @route   GET /api/packages/:id
// @access  Public
export const getPackageById = asyncHandler(async (req, res) => {
  const pkg = await Package.findById(req.params.id).populate(
    "destinations",
    "name country continent image price type description duration"
  );

  if (!pkg) {
    res.status(404);
    throw new Error("Package not found");
  }

  res.status(200).json(pkg);
});

// @desc    Update a package
// @route   PUT /api/packages/:id
// @access  Admin
export const updatePackage = asyncHandler(async (req, res) => {
  const pkg = await Package.findById(req.params.id);

  if (!pkg) {
    res.status(404);
    throw new Error("Package not found");
  }

  const {
    title, subtitle, description, price, originalPrice, duration,
    maxGroupSize, difficulty, category, highlights, includes, excludes,
    itinerary, destinations, isVisible, isFeatured, isPopular, tags,
    departureCity, languages, minAge, rating,
  } = req.body;

  let imageUrls = pkg.images;
  if (req.files && req.files.length > 0) {
    imageUrls = [];
    for (const file of req.files) {
      const url = await uploadToCloudinary(file);
      imageUrls.push(url);
    }
  }

  pkg.title = title?.trim() || pkg.title;
  pkg.subtitle = subtitle?.trim() ?? pkg.subtitle;
  pkg.description = description?.trim() ?? pkg.description;
  pkg.price = price ? Number(price) : pkg.price;
  pkg.originalPrice = originalPrice ? Number(originalPrice) : pkg.originalPrice;
  pkg.duration = duration?.trim() || pkg.duration;
  pkg.maxGroupSize = maxGroupSize ? Number(maxGroupSize) : pkg.maxGroupSize;
  pkg.difficulty = difficulty || pkg.difficulty;
  pkg.category = category || pkg.category;
  pkg.images = imageUrls;
  pkg.highlights = highlights ? JSON.parse(highlights) : pkg.highlights;
  pkg.includes = includes ? JSON.parse(includes) : pkg.includes;
  pkg.excludes = excludes ? JSON.parse(excludes) : pkg.excludes;
  pkg.itinerary = itinerary ? JSON.parse(itinerary) : pkg.itinerary;
  pkg.destinations = destinations ? JSON.parse(destinations) : pkg.destinations;
  pkg.isVisible = isVisible !== undefined ? (isVisible === "true" || isVisible === true) : pkg.isVisible;
  pkg.isFeatured = isFeatured !== undefined ? (isFeatured === "true" || isFeatured === true) : pkg.isFeatured;
  pkg.isPopular = isPopular !== undefined ? (isPopular === "true" || isPopular === true) : pkg.isPopular;
  pkg.tags = tags ? JSON.parse(tags) : pkg.tags;
  pkg.departureCity = departureCity?.trim() ?? pkg.departureCity;
  pkg.languages = languages ? JSON.parse(languages) : pkg.languages;
  pkg.minAge = minAge ? Number(minAge) : pkg.minAge;
  pkg.rating = rating ? Number(rating) : pkg.rating;

  const updated = await pkg.save();
  res.status(200).json(updated);
});

// @desc    Toggle visibility
// @route   PATCH /api/packages/:id/visibility
// @access  Admin
export const togglePackageVisibility = asyncHandler(async (req, res) => {
  const pkg = await Package.findById(req.params.id);
  if (!pkg) { res.status(404); throw new Error("Package not found"); }
  pkg.isVisible = !pkg.isVisible;
  await pkg.save();
  res.status(200).json(pkg);
});

// @desc    Toggle featured
// @route   PATCH /api/packages/:id/featured
// @access  Admin
export const togglePackageFeatured = asyncHandler(async (req, res) => {
  const pkg = await Package.findById(req.params.id);
  if (!pkg) { res.status(404); throw new Error("Package not found"); }
  pkg.isFeatured = !pkg.isFeatured;
  await pkg.save();
  res.status(200).json(pkg);
});

// @desc    Toggle popular
// @route   PATCH /api/packages/:id/popular
// @access  Admin
export const togglePackagePopular = asyncHandler(async (req, res) => {
  const pkg = await Package.findById(req.params.id);
  if (!pkg) { res.status(404); throw new Error("Package not found"); }
  pkg.isPopular = !pkg.isPopular;
  await pkg.save();
  res.status(200).json(pkg);
});

// @desc    Delete a package
// @route   DELETE /api/packages/:id
// @access  Admin
export const deletePackage = asyncHandler(async (req, res) => {
  const pkg = await Package.findById(req.params.id);
  if (!pkg) { res.status(404); throw new Error("Package not found"); }
  await Package.findByIdAndDelete(req.params.id);
  res.status(200).json({ message: "Package deleted successfully" });
});