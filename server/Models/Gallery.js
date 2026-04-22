// models/Gallery.js
import mongoose from 'mongoose';

const gallerySchema = new mongoose.Schema({
    image: { type: String, required: true },
    caption: { type: String, default: "" },   // optional title
}, { timestamps: true });

export default mongoose.model('Gallery', gallerySchema);