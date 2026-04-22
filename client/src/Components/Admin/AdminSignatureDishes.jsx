// src/pages/admin/AdminSignatureDishes.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { API_BASE_URL } from "../../../api";
import { toast } from "react-toastify";
import { Plus, Search, Trash2, X, Upload, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function AdminSignatureDishes() {
  const [dishes, setDishes] = useState([]);
  const [filteredDishes, setFilteredDishes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  // Add modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDishName, setNewDishName] = useState("");
  const [newPoetic, setNewPoetic] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchDishes();
  }, []);

  useEffect(() => {
    const filtered = dishes.filter(dish =>
      dish.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredDishes(filtered);
  }, [dishes, searchTerm]);

  const fetchDishes = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/signature-dishes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDishes(res.data);
    } catch (err) {
      toast.error("Failed to load signature dishes");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAddDish = async (e) => {
    e.preventDefault();

    if (!newDishName.trim()) {
      return toast.error("Dish name is required");
    }
    if (!selectedImage) {
      return toast.error("An image is required for signature dishes");
    }

    setIsCreating(true);

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");

      const formData = new FormData();
      formData.append("name", newDishName.trim());
      if (newPoetic.trim()) {
        formData.append("poetic", newPoetic.trim());
      }
      formData.append("image", selectedImage);

      const res = await axios.post(`${API_BASE_URL}/signature-dishes`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setDishes([...dishes, res.data]);
      resetForm();
      setShowAddModal(false);
      toast.success("Signature dish added successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error adding signature dish");
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = () => {
    setNewDishName("");
    setNewPoetic("");
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleDeleteDish = async (id, name) => {
    if (!window.confirm(`Delete the signature dish "${name}"?`)) return;

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/signature-dishes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDishes(dishes.filter(dish => dish._id !== id));
      toast.success("Signature dish deleted");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error deleting signature dish");
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
              Signature Dishes
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-4 text-2xl text-amber-100/70 font-light"
            >
              The heart of the experience.
            </motion.p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-4 bg-[#1a1612] border border-amber-900/40 hover:border-amber-400/50 px-8 py-5 rounded-3xl transition-all duration-300 group"
          >
            <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-amber-400/10 text-amber-400 group-hover:scale-110 transition-transform">
              <Plus size={28} />
            </div>
            <div>
              <span className="block text-white text-lg font-light tracking-wide">New Signature Dish</span>
              <span className="text-amber-100/60 text-sm">With poetic touch</span>
            </div>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-xl mb-16">
          <Search size={22} className="absolute left-6 top-1/2 -translate-y-1/2 text-amber-400/70" />
          <input
            type="text"
            placeholder="Search signature dishes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#1a1612] border border-amber-900/30 focus:border-amber-400/50 pl-16 pr-6 py-5 rounded-3xl text-white placeholder-amber-100/40 outline-none text-lg"
          />
        </div>

        {/* Dishes Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <p className="text-amber-100/70 text-xl font-light tracking-widest">Curating the signatures...</p>
          </div>
        ) : filteredDishes.length === 0 ? (
          <div className="text-center py-32">
            <p className="text-2xl text-amber-100/50 font-light">No signature dishes yet.</p>
            <p className="text-amber-100/40 mt-3">Begin crafting the essence.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredDishes.map((dish, index) => (
              <motion.div
                key={dish._id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                whileHover={{ y: -8 }}
                className="group relative bg-[#1a1612] border border-amber-900/30 rounded-3xl overflow-hidden"
              >
                {/* Image */}
                <div className="relative h-64 overflow-hidden">
                  {dish.image ? (
                    <img
                      src={dish.image}
                      alt={dish.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#0f0c0a] flex items-center justify-center">
                      <span className="text-amber-100/30 text-sm tracking-widest">No image</span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                </div>

                {/* Content */}
                <div className="p-8">
                  <h3 className="text-2xl font-serif text-white tracking-wide">{dish.name}</h3>
                  {dish.poetic && (
                    <p className="mt-5 text-amber-100/70 font-light italic leading-relaxed line-clamp-3">
                      “{dish.poetic}”
                    </p>
                  )}
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => handleDeleteDish(dish._id, dish.name)}
                  className="absolute top-6 right-6 p-3 bg-black/70 hover:bg-red-600 text-white rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300"
                >
                  <Trash2 size={20} />
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {/* Closing poetic line */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center mt-24 text-lg text-amber-100/60 tracking-wide max-w-md mx-auto"
        >
          Each dish tells its own story of time and craft.
        </motion.p>
      </div>

      {/* Add Signature Dish Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { setShowAddModal(false); resetForm(); }}
          >
            <motion.div
              className="bg-[#1a1612] border border-amber-900/50 rounded-3xl w-full max-w-lg overflow-hidden"
              initial={{ scale: 0.95, y: 40, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 40, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-10">
                <div className="flex justify-between items-center mb-10">
                  <h2 className="text-3xl font-serif text-white tracking-wide">New Signature Dish</h2>
                  <button 
                    onClick={() => { setShowAddModal(false); resetForm(); }} 
                    className="text-amber-100/60 hover:text-white transition-colors"
                  >
                    <X size={32} />
                  </button>
                </div>

                <form onSubmit={handleAddDish} className="space-y-8">
                  <div>
                    <label className="block text-amber-100/70 text-sm tracking-widest mb-3">DISH NAME <span className="text-amber-400">*</span></label>
                    <input
                      type="text"
                      value={newDishName}
                      onChange={(e) => setNewDishName(e.target.value)}
                      className="w-full bg-transparent border border-amber-900/50 focus:border-amber-400 text-white px-6 py-5 rounded-2xl outline-none text-lg"
                      placeholder="e.g. Slow-Cooked Lamb Tajine"
                      required
                      disabled={isCreating}
                    />
                  </div>

                  <div>
                    <label className="block text-amber-100/70 text-sm tracking-widest mb-3">POETIC DESCRIPTION (OPTIONAL)</label>
                    <textarea
                      value={newPoetic}
                      onChange={(e) => setNewPoetic(e.target.value)}
                      className="w-full bg-transparent border border-amber-900/50 focus:border-amber-400 text-white px-6 py-5 rounded-2xl outline-none h-28 resize-y"
                      placeholder="A whisper of saffron, a memory of fire..."
                      disabled={isCreating}
                    />
                  </div>

                  <div>
                    <label className="block text-amber-100/70 text-sm tracking-widest mb-3">IMAGE <span className="text-amber-400">*</span></label>
                    <div className="border-2 border-dashed border-amber-900/50 hover:border-amber-400/50 rounded-3xl p-10 text-center transition-all">
                      <input
                        type="file"
                        onChange={handleImageChange}
                        className="hidden"
                        id="dish-image"
                        disabled={isCreating}
                      />
                      <label htmlFor="dish-image" className="cursor-pointer flex flex-col items-center">
                        <Upload size={48} className="text-amber-400/70 mb-4" />
                        <span className="text-white">Choose an image</span>
                        <span className="text-amber-100/50 text-sm mt-1">Recommended: 1200×800 px or higher</span>
                      </label>
                    </div>

                    {imagePreview && (
                      <div className="mt-6 relative rounded-2xl overflow-hidden border border-amber-900/30">
                        <img src={imagePreview} alt="Preview" className="w-full h-52 object-cover" />
                        <button
                          type="button"
                          onClick={() => { setSelectedImage(null); setImagePreview(null); }}
                          className="absolute top-3 right-3 bg-black/80 hover:bg-red-600 p-2 rounded-xl text-white"
                          disabled={isCreating}
                        >
                          <X size={18} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4 pt-6">
                    <button
                      type="button"
                      onClick={() => { setShowAddModal(false); resetForm(); }}
                      className="flex-1 py-5 border border-amber-900/50 text-amber-100/80 hover:text-white rounded-2xl font-light tracking-wider transition"
                      disabled={isCreating}
                    >
                      Cancel
                    </button>
                    
                    <button
                      type="submit"
                      disabled={isCreating || !newDishName.trim() || !selectedImage}
                      className="flex-1 py-5 bg-amber-400 hover:bg-amber-300 disabled:bg-amber-400/40 text-black font-light tracking-wider rounded-2xl transition flex items-center justify-center gap-3"
                    >
                      {isCreating ? (
                        <>
                          <span className="animate-spin h-5 w-5 border-2 border-black border-t-transparent rounded-full" />
                          Creating...
                        </>
                      ) : (
                        "Create Signature Dish"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}