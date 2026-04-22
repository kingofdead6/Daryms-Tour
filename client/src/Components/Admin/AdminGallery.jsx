// src/pages/admin/AdminGallery.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../../api";
import { toast } from "react-toastify";
import { Trash2, Upload, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function AdminGallery() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/gallery`);
      setImages(res.data);
    } catch (err) {
      toast.error("Failed to load gallery");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const handleUpload = async (e) => {
    const files = e.target.files;
    if (!files.length) return;

    setUploading(true);
    const formData = new FormData();
    Array.from(files).forEach(file => formData.append("images", file));

    try {
      await axios.post(`${API_BASE_URL}/gallery`, formData);
      toast.success("Images added successfully");
      fetchGallery();
    } catch (err) {
      toast.error("Error uploading images");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this image?")) return;

    try {
      await axios.delete(`${API_BASE_URL}/gallery/${id}`);
      toast.success("Image deleted");
      fetchGallery();
    } catch (err) {
      toast.error("Error deleting image");
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen py-20 pt-32 relative bg-gradient-to-b from-[#0c0a08] via-[#1a1612] to-[#0f0c0a] overflow-hidden"
    >
      {/* Subtle background texture */}
      <div className="absolute inset-0 bg-[radial-gradient(#2a241f_0.8px,transparent_1px)] bg-[length:70px_70px] opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-16">
          <div>
            <Link 
              to="/admin" 
              className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 text-sm tracking-widest uppercase font-light mb-4 transition-colors"
            >
              <ArrowLeft size={18} />
              Back to Control Center
            </Link>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-serif tracking-wider text-white"
            >
              The Gallery
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-4 text-2xl text-amber-100/70 font-light"
            >
              Moments preserved in stillness.
            </motion.p>
          </div>

          {/* Upload Button */}
          <label className="cursor-pointer group">
            <div className="flex items-center gap-4 bg-[#1a1612] border border-amber-900/40 hover:border-amber-400/50 px-8 py-5 rounded-3xl transition-all duration-300 hover:shadow-xl">
              <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-amber-400/10 text-amber-400 group-hover:scale-110 transition-transform">
                <Upload size={28} />
              </div>
              <div>
                <span className="block text-white text-lg font-light tracking-wide">Add New Images</span>
                <span className="text-amber-100/60 text-sm">Multiple images supported</span>
              </div>
            </div>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Uploading Indicator */}
        {uploading && (
          <div className="mb-10 text-center">
            <p className="text-amber-400 text-lg font-light tracking-widest animate-pulse">
              Uploading to the collection...
            </p>
          </div>
        )}

        {/* Gallery Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <p className="text-amber-100/70 text-xl font-light tracking-widest">Gathering moments...</p>
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-32">
            <p className="text-amber-100/50 text-2xl font-light">No images yet.</p>
            <p className="text-amber-100/40 mt-3">The first moment awaits your touch.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {images.map((img, index) => (
              <motion.div
                key={img._id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="group relative rounded-3xl overflow-hidden border border-amber-900/30 bg-[#0f0c0a] aspect-square shadow-xl"
              >
                <img
                  src={img.image}
                  alt="Gallery image"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Delete Button */}
                <button
                  onClick={() => handleDelete(img._id)}
                  className="absolute top-5 right-5 bg-black/70 hover:bg-red-600 text-white p-3 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                >
                  <Trash2 size={20} />
                </button>

                {/* Subtle bottom label */}
                <div className="absolute bottom-5 left-5 text-[10px] uppercase tracking-[2px] text-amber-100/40 font-light pointer-events-none">
                  Captured moment
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Closing poetic line */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-24 text-lg text-amber-100/60 tracking-wide max-w-md mx-auto"
        >
          Every frame holds a breath of time.
        </motion.p>
      </div>
    </motion.section>
  );
}