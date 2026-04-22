import asyncHandler from "express-async-handler";
import SignatureDish from "../Models/SignatureDish.js";   // Adjust path if needed
import { uploadToCloudinary } from '../utils/cloudinary.js';

export const createSignatureDish = asyncHandler(async (req, res) => {
  const { name, poetic } = req.body;

  // Validation
  if (!name || name.trim().length === 0) {
    res.status(400);
    throw new Error("The name of the signature dish is required");
  }

  // Check if already exists
  const dishExists = await SignatureDish.findOne({ 
    name: name.trim().toLowerCase() 
  });

  if (dishExists) {
    res.status(400);
    throw new Error("This signature dish already exists");
  }

  let imageUrl = null;

  // Handle image upload
  if (req.file) {
    try {
      console.log("Uploading image for Signature Dish:", req.file.originalname);

      const uploadedUrl = await uploadToCloudinary(req.file);

      if (uploadedUrl) {
        imageUrl = uploadedUrl;
        console.log("✅ Image uploaded successfully:", imageUrl);
      }
    } catch (uploadError) {
      console.error("❌ Cloudinary upload failed:", uploadError.message);
      res.status(500);
      throw new Error("Erreur lors de l'upload de l'image");
    }
  } else {
    res.status(400);
    throw new Error("Une image est requise pour le plat signature");
  }

  // Create the dish
  const signatureDish = await SignatureDish.create({
    name: name.trim(),
    poetic: poetic ? poetic.trim() : "",
    image: imageUrl
  });

  console.log("Signature Dish created successfully:", signatureDish.name);
  res.status(201).json(signatureDish);
});

// ====================== GET ALL Signature Dishes ======================
export const getSignatureDishes = asyncHandler(async (req, res) => {
  const dishes = await SignatureDish.find({}).sort({ name: 1 });
  res.status(200).json(dishes);
});

// ====================== DELETE Signature Dish ======================
export const deleteSignatureDish = asyncHandler(async (req, res) => {
  const dish = await SignatureDish.findById(req.params.id);

  if (!dish) {
    res.status(404);
    throw new Error("Plat signature non trouvé");
  }

  await SignatureDish.findByIdAndDelete(req.params.id);
  
  res.status(200).json({ 
    message: "Plat signature supprimé avec succès",
    id: req.params.id 
  });
});