// src/pages/admin/AdminCategories.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { API_BASE_URL } from "../../../api";
import { toast } from "react-toastify";
import { Plus, Search, Trash2, X, Upload, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  // Add modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const filtered = categories.filter(cat =>
      cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCategories(filtered);
  }, [categories, searchTerm]);

const fetchCategories = async () => {
  setLoading(true);
  try {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");

    const res = await axios.get(`${API_BASE_URL}/categories`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    console.log("Fetched categories:", res.data); // 👈 ADD THIS
    setCategories(res.data);

  } catch (err) {
    console.log("FETCH ERROR:", err.response?.data || err.message); // 👈 ADD THIS
    toast.error("Failed to load categories");
  } finally {
    setLoading(false);
  }
};

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      return toast.error("Category name is required");
    }

    setIsCreating(true);

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");

      const res = await axios.post(`${API_BASE_URL}/categories`,{ name: newCategoryName.trim() },
  {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  }
);

setCategories((prev) => [...prev, res.data]);

      setCategories([...categories, res.data]);
      resetForm();
      setShowAddModal(false);
      toast.success("Category created successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error creating category");
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = () => {
    setNewCategoryName("");
  };

  const handleDeleteCategory = async (id, name) => {
    if (!window.confirm(`Delete the category "${name}"?`)) return;

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(categories.filter(cat => cat._id !== id));
      toast.success("Category deleted");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error deleting category");
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
              Categories
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-4 text-2xl text-amber-100/70 font-light"
            >
              Define the chapters of your story.
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
              <span className="block text-white text-lg font-light tracking-wide">New Category</span>
            </div>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-xl mb-16">
          <Search size={22} className="absolute left-6 top-1/2 -translate-y-1/2 text-amber-400/70" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#1a1612] border border-amber-900/30 focus:border-amber-400/50 pl-16 pr-6 py-5 rounded-3xl text-white placeholder-amber-100/40 outline-none text-lg"
          />
        </div>

        {/* Categories Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <p className="text-amber-100/70 text-xl font-light tracking-widest">Curating the collection...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-32">
            <p className="text-2xl text-amber-100/50 font-light">No categories found.</p>
            <p className="text-amber-100/40 mt-3">Create the first chapter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredCategories.map((category, index) => (
              <motion.div
                key={category._id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                whileHover={{ y: -8 }}
                className="group relative bg-[#1a1612] border border-amber-900/30 rounded-3xl overflow-hidden"
              >
                <div className="p-6">
                  <h3 className="text-2xl font-serif text-white tracking-wide mb-2">{category.name}</h3>
                </div>
                {/* Delete Button */}
                <button
                  onClick={() => handleDeleteCategory(category._id, category.name)}
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
          Every category is a doorway to experience.
        </motion.p>
      </div>

      {/* Add Category Modal - Dark & Elegant */}
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
                  <h2 className="text-3xl font-serif text-white tracking-wide">New Category</h2>
                  <button 
                    onClick={() => { setShowAddModal(false); resetForm(); }} 
                    className="text-amber-100/60 hover:text-white transition-colors"
                  >
                    <X size={32} />
                  </button>
                </div>

                <form onSubmit={handleAddCategory} className="space-y-8">
                  <div>
                    <label className="block text-amber-100/70 text-sm tracking-widest mb-3">CATEGORY NAME</label>
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="w-full bg-transparent border border-amber-900/50 focus:border-amber-400 text-white px-6 py-5 rounded-2xl outline-none text-lg"
                      placeholder="e.g. Signature Dishes"
                      required
                      disabled={isCreating}
                    />
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
                      disabled={isCreating || !newCategoryName.trim()}
                      className="flex-1 py-5 bg-amber-400 hover:bg-amber-300 disabled:bg-amber-400/40 text-black font-light tracking-wider rounded-2xl transition flex items-center justify-center gap-3"
                    >
                      {isCreating ? (
                        <>
                          <span className="animate-spin h-5 w-5 border-2 border-black border-t-transparent rounded-full" />
                          Creating...
                        </>
                      ) : (
                        "Create Category"
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