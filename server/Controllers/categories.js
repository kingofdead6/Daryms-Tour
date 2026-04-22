import asyncHandler from "express-async-handler";
import Categories from "../Models/Categories.js";

export const createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name || name.trim().length === 0) {
    res.status(400);
    throw new Error("The name of the category is required");
  }

  const categoryExists = await Categories.findOne({ name: name.trim() });
  if (categoryExists) {
    res.status(400);
    throw new Error("This category already exists");
  }

  // Create category
  const category = await Categories.create({
    name: name.trim(),
  });

  console.log("Category created:", category.name);

  res.status(201).json(category);
});

// Get All Categories
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Categories.find({}).sort({ name: 1 });
  res.status(200).json(categories);
});

// Delete Category
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Categories.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }
  await Categories.findByIdAndDelete(req.params.id);
  res.status(200).json({ message: "Category removed successfully" });
});