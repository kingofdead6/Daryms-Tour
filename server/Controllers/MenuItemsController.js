import asyncHandler from "express-async-handler";
import MenuItem from "../Models/MenuItem.js";
import { uploadToCloudinary } from '../utils/cloudinary.js';


export const createMenuItem = asyncHandler(async (req, res) => {
  const { name, description, category, isVisible } = req.body;

  if (!name || !category) {
    res.status(400);
    throw new Error("Name and Category are required");
  }

  let imageUrl = null;
  if (req.file) {
    const uploadedUrl = await uploadToCloudinary(req.file);
    imageUrl = uploadedUrl;
  } else {
    res.status(400);
    throw new Error("A picture of the meal is required");
  }

  const meal = await MenuItem.create({
    name: name.trim(),
    description: description?.trim() || "",
    category,
    image: imageUrl,
    isVisible: isVisible === 'true' || isVisible === true
  });

  const populatedMeal = await meal.populate('category', 'name');
  res.status(201).json(populatedMeal);
});

// @desc    Get all meals (Populated)
// @route   GET /api/menu
export const getMenuItems = asyncHandler(async (req, res) => {
  const meals = await MenuItem.find({}).populate('category', 'name').sort({ createdAt: -1 });
  res.status(200).json(meals);
});

// @desc    Toggle Visibility
// @route   PATCH /api/menu/:id/visibility
export const toggleVisibility = asyncHandler(async (req, res) => {
  const meal = await MenuItem.findById(req.params.id);
  if (!meal) {
    res.status(404);
    throw new Error("Meal not found");
  }
  meal.isVisible = !meal.isVisible;
  await meal.save();
  res.status(200).json(meal);
});

// @desc    Delete meal
// @route   DELETE /api/menu/:id
export const deleteMenuItem = asyncHandler(async (req, res) => {
  const meal = await MenuItem.findById(req.params.id);
  if (!meal) {
    res.status(404);
    throw new Error("Meal not found");
  }
  await MenuItem.findByIdAndDelete(req.params.id);
  res.status(200).json({ message: "Meal removed from menu" });
});