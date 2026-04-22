import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { API_BASE_URL } from "../../../api";
import { toast } from "react-toastify";
import { 
  Plus, 
  Search, 
  Trash2, 
  X, 
  Upload, 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  Filter 
} from "lucide-react";
import { Link } from "react-router-dom";

export default function AdminMenu() {
  const [meals, setMeals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({ 
    name: "", 
    description: "", 
    category: "", 
    isVisible: true 
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [mealsRes, catsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/menu`),
        axios.get(`${API_BASE_URL}/categories`)
      ]);
      setMeals(mealsRes.data);
      setCategories(catsRes.data);
    } catch (err) {
      toast.error("Error loading menu data");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVisibility = async (id) => {
    try {
      await axios.patch(`${API_BASE_URL}/menu/${id}/visibility`);
      setMeals(meals.map(m => m._id === id ? { ...m, isVisible: !m.isVisible } : m));
      toast.success("Visibility updated");
    } catch (err) {
      toast.error("Failed to update visibility");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this meal?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/menu/${id}`);
      setMeals(meals.filter(m => m._id !== id));
      toast.success("Meal deleted");
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const handleAddMeal = async (e) => {
    e.preventDefault();
    if (!selectedImage) return toast.error("Please upload an image");
    
    setIsCreating(true);
    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("category", formData.category);
    data.append("isVisible", formData.isVisible);
    data.append("image", selectedImage);

    try {
      const res = await axios.post(`${API_BASE_URL}/menu`, data);
      setMeals([res.data, ...meals]);
      setShowAddModal(false);
      resetForm();
      toast.success("New meal added successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error creating meal");
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: "", description: "", category: "", isVisible: true });
    setSelectedImage(null);
    setImagePreview(null);
  };

  // Logic for dual filtering: Search text AND Category chip
  const filteredMeals = meals.filter((meal) => {
    const matchesSearch = meal.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || meal.category?._id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <motion.section 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="min-h-screen relative pt-10"
    >
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-16">
          <div>
            <Link to="/admin/dashboard" className="text-amber-400 hover:text-amber-300 text-sm tracking-widest uppercase flex items-center gap-2 mb-4">
              <ArrowLeft size={18} /> Dashboard
            </Link>
            <h1 className="text-5xl md:text-7xl font-serif text-white">The Menu</h1>
            <p className="text-amber-100/60 text-xl mt-4">Curate your culinary selection.</p>
          </div>
          <button onClick={() => setShowAddModal(true)} className="cursor-pointer bg-amber-400 text-black px-8 py-4 rounded-2xl flex items-center gap-3 font-medium hover:bg-amber-300 transition-all hover:scale-105 active:scale-95">
            <Plus size={24} /> Add New Meal
          </button>
        </div>

        {/* Filters & Search */}
        <div className="space-y-6 mb-12">
          <div className="flex flex-col lg:flex-row gap-6 lg:items-center justify-between">
            {/* Search Box */}
            <div className="relative max-w-md w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-900/50" />
              <input 
                type="text" 
                placeholder="Search by name..." 
                className="w-full bg-[#1a1612] border border-amber-900/20 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-amber-400/50 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Category Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
              <div className="flex items-center gap-2 pr-4 border-r border-amber-900/20 mr-2 text-amber-400/60">
                <Filter size={16} />
                <span className="text-xs uppercase tracking-widest">Filter</span>
              </div>
              <button
                onClick={() => setSelectedCategory("all")}
                className={`cursor-pointer px-6 py-2.5 rounded-full border transition-all whitespace-nowrap text-sm font-medium ${
                  selectedCategory === "all" 
                  ? "bg-amber-400 border-amber-400 text-black" 
                  : "bg-[#1a1612] border-amber-900/20 text-amber-100/60 hover:border-amber-400/50 hover:text-amber-400"
                }`}
              >
                All Dishes
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => setSelectedCategory(cat._id)}
                  className={`cursor-pointer -6 py-2.5 rounded-full border transition-all whitespace-nowrap text-sm font-medium ${
                    selectedCategory === cat._id 
                    ? "bg-amber-400 border-amber-400 text-black" 
                    : "bg-[#1a1612] border-amber-900/20 text-amber-100/60 hover:border-amber-400/50 hover:text-amber-400"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#1a1612] border border-amber-900/20 rounded-3xl overflow-hidden shadow-2xl">
          {loading ? (
            <div className="p-20 text-center text-amber-400">Loading menu...</div>
          ) : filteredMeals.length === 0 ? (
            <div className="p-20 text-center text-amber-100/40 italic">No matches found in this category.</div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-[#0c0a08] text-amber-100/40 text-[10px] uppercase tracking-[0.2em]">
                <tr>
                  <th className="px-8 py-6">Plate Detail</th>
                  <th className="px-8 py-6">Category</th>
                  <th className="px-8 py-6 text-center">Visibility</th>
                  <th className="px-8 py-6 text-right">Options</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-900/10">
                {filteredMeals.map((meal) => (
                  <tr key={meal._id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-5">
                        <img src={meal.image} alt="" className="w-20 h-20 rounded-2xl object-cover border border-amber-900/20" />
                        <div>
                          <div className="text-white font-serif text-lg">{meal.name}</div>
                          <div className="text-amber-100/30 text-xs line-clamp-1 max-w-xs">{meal.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-amber-400 text-xs tracking-widest uppercase py-1 px-3 bg-amber-400/5 rounded-lg border border-amber-400/10">
                        {meal.category?.name || "Uncategorized"}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex justify-center">
                        <button 
                          onClick={() => handleToggleVisibility(meal._id)}
                          className={`cursor-pointer flex flex-col items-center gap-1 transition-all ${meal.isVisible ? 'text-green-400' : 'text-white/10'}`}
                        >
                          {meal.isVisible ? <Eye size={20} /> : <EyeOff size={20} />}
                          <span className="text-[9px] uppercase font-bold tracking-tighter">
                            {meal.isVisible ? 'Public' : 'Hidden'}
                          </span>
                        </button>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        onClick={() => handleDelete(meal._id)}
                        className="cursor-pointer p-3 text-red-400/30 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                      >
                        <Trash2 size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal logic remains consistent with previous response... */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div 
            className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[100] flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.form 
              onSubmit={handleAddMeal}
              className="bg-[#110e0c] border border-amber-900/30 rounded-[2.5rem] p-10 max-w-2xl w-full shadow-2xl overflow-y-auto max-h-[90vh]"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
            >
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-4xl font-serif text-white">New Creation</h2>
                <button type="button" onClick={() => setShowAddModal(false)} className="cursor-pointer text-amber-100/40 hover:text-white transition-colors">
                  <X size={32} />
                </button>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="text-amber-400 text-xs uppercase tracking-widest block mb-3 ml-1">Plate Name</label>
                  <input 
                    type="text" required placeholder="e.g. Truffle Infused Risotto"
                    className="w-full bg-black/40 border border-amber-900/20 rounded-2xl p-5 text-white outline-none focus:border-amber-400/50 transition-all"
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-amber-400 text-xs uppercase tracking-widest block mb-3 ml-1">Category</label>
                    <select 
                      required className="w-full bg-black/40 border border-amber-900/20 rounded-2xl p-5 text-white outline-none focus:border-amber-400/50 appearance-none"
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                    >
                      <option value="">Select Category</option>
                      {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-amber-400 text-xs uppercase tracking-widest block mb-3 ml-1">Initial Status</label>
                    <select 
                      className="w-full bg-black/40 border border-amber-900/20 rounded-2xl p-5 text-white outline-none focus:border-amber-400/50 appearance-none"
                      onChange={(e) => setFormData({...formData, isVisible: e.target.value === 'true'})}
                    >
                      <option value="true">Visible to Public</option>
                      <option value="false">Save as Draft</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-amber-400 text-xs uppercase tracking-widest block mb-3 ml-1">Short Description</label>
                  <textarea 
                    placeholder="Describe the flavors and ingredients..."
                    className="w-full bg-black/40 border border-amber-900/20 rounded-2xl p-5 text-white outline-none h-32 focus:border-amber-400/50 resize-none transition-all"
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                <div className="flex flex-col md:flex-row items-center gap-6 p-6 border-2 border-dashed border-amber-900/20 rounded-3xl bg-black/20">
                   <label className="flex flex-col items-center cursor-pointer group">
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                        const file = e.target.files[0];
                        if(file) {
                          setSelectedImage(file);
                          setImagePreview(URL.createObjectURL(file));
                        }
                      }} />
                      <div className="w-16 h-16 bg-amber-400/10 rounded-full flex items-center justify-center mb-3 group-hover:bg-amber-400/20 transition-all">
                        <Upload className="text-amber-400" />
                      </div>
                      <span className="text-amber-100/40 text-[10px] uppercase tracking-widest">Select Visual</span>
                   </label>
                   
                   {imagePreview ? (
                     <div className="relative group ml-auto">
                        <img src={imagePreview} className="w-40 h-28 rounded-2xl object-cover border border-amber-400" alt="Preview" />
                        <button 
                          onClick={() => {setSelectedImage(null); setImagePreview(null);}}
                          className="cursor-pointer absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={14} />
                        </button>
                     </div>
                   ) : (
                     <div className="ml-auto text-amber-100/10 italic text-sm">No image selected</div>
                   )}
                </div>

                <button 
                  disabled={isCreating}
                  className="cursor-pointer w-full bg-amber-400 text-black py-6 rounded-2xl font-bold uppercase tracking-[0.2em] hover:bg-amber-300 disabled:opacity-50 transition-all shadow-xl shadow-amber-400/10"
                >
                  {isCreating ? "Artisan at work (Uploading...)" : "Add to Menu"}
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}