import asyncHandler from 'express-async-handler';
import Gallery from '../Models/Gallery.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';

// Get all gallery images
export const getGallery = asyncHandler(async (req, res) => {
  const gallery = await Gallery.find().sort({ createdAt: -1 });
  res.json(gallery);
});

// Add new image(s)
export const addGalleryImages = asyncHandler(async (req, res) => {
  const { caption } = req.body;

  if (!req.files || req.files.length === 0) {
    res.status(400);
    throw new Error("Aucune image envoyée");
  }

  const uploadedImages = [];

  for (const file of req.files) {
    const url = await uploadToCloudinary(file);
    const image = await Gallery.create({
      image: url,
      caption: caption || ""
    });
    uploadedImages.push(image);
  }

  res.status(201).json({
    success: true,
    message: `${uploadedImages.length} image(s) ajoutée(s)`,
    images: uploadedImages
  });
});

// Delete image
export const deleteGalleryImage = asyncHandler(async (req, res) => {
  const image = await Gallery.findById(req.params.id);
  if (!image) {
    res.status(404);
    throw new Error("Image non trouvée");
  }

  await Gallery.deleteOne({ _id: req.params.id });
  res.json({ success: true, message: "Image supprimée" });
});