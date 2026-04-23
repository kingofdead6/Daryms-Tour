"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../../api";
import {
  Plus, Search, Trash2, X, Upload, ArrowLeft,
  Eye, EyeOff, Filter, Pencil, Loader2, MapPin,
  Star, Package, Flame, LayoutGrid, Globe
} from "lucide-react";
import { Link } from "react-router-dom";

const CATEGORIES = ["Honeymoon", "Family", "Adventure", "Luxury", "Cultural", "Solo", "Group", "Business"];
const DIFFICULTIES = ["Easy", "Moderate", "Challenging", "Expert"];

const emptyForm = {
  title: "", subtitle: "", description: "", price: "", originalPrice: "",
  duration: "", maxGroupSize: 12, difficulty: "Moderate", category: "Luxury",
  isVisible: true, isFeatured: false, isPopular: false,
  highlights: "", includes: "", excludes: "", itinerary: "", tags: "",
  departureCity: "", languages: "English", minAge: 0, rating: 4.8,
};

function PackageModal({ mode, pkg, onClose, onSaved }) {
  const fileRef = useRef();
  const [form, setForm] = useState(
    mode === "edit" && pkg
      ? {
          title: pkg.title, subtitle: pkg.subtitle || "", description: pkg.description || "",
          price: pkg.price, originalPrice: pkg.originalPrice || "",
          duration: pkg.duration, maxGroupSize: pkg.maxGroupSize, difficulty: pkg.difficulty,
          category: pkg.category, isVisible: pkg.isVisible, isFeatured: pkg.isFeatured,
          isPopular: pkg.isPopular, highlights: (pkg.highlights || []).join(", "),
          includes: (pkg.includes || []).join(", "), excludes: (pkg.excludes || []).join(", "),
          itinerary: JSON.stringify(pkg.itinerary || []),
          tags: (pkg.tags || []).join(", "), departureCity: pkg.departureCity || "",
          languages: (pkg.languages || ["English"]).join(", "),
          minAge: pkg.minAge || 0, rating: pkg.rating || 4.8,
        }
      : emptyForm
  );
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState(mode === "edit" ? (pkg?.images || []) : []);
  const [submitting, setSubmitting] = useState(false);

  const handleFile = (e) => {
    const files = Array.from(e.target.files);
    setSelectedImages(files);
    setImagePreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = async () => {
    if (!form.title || !form.price || !form.duration || !form.category) {
      toast.error("Title, price, duration, and category are required");
      return;
    }
    setSubmitting(true);
    const fd = new FormData();

    const arrayFields = ["highlights", "includes", "excludes", "tags"];
    const plainFields = ["title", "subtitle", "description", "price", "originalPrice", "duration",
      "maxGroupSize", "difficulty", "category", "isVisible", "isFeatured", "isPopular",
      "departureCity", "minAge", "rating"];

    plainFields.forEach((f) => fd.append(f, form[f]));
    arrayFields.forEach((f) => {
      const arr = form[f].split(",").map((s) => s.trim()).filter(Boolean);
      fd.append(f, JSON.stringify(arr));
    });

    // Languages
    const langs = form.languages.split(",").map((s) => s.trim()).filter(Boolean);
    fd.append("languages", JSON.stringify(langs));

    // Itinerary
    try {
      const itin = JSON.parse(form.itinerary || "[]");
      fd.append("itinerary", JSON.stringify(itin));
    } catch {
      fd.append("itinerary", JSON.stringify([]));
    }

    selectedImages.forEach((img) => fd.append("images", img));

    try {
      if (mode === "create") {
        const res = await axios.post(`${API_BASE_URL}/packages`, fd);
        toast.success("Package created!");
        onSaved(res.data, "create");
      } else {
        const res = await axios.put(`${API_BASE_URL}/packages/${pkg._id}`, fd);
        toast.success("Package updated!");
        onSaved(res.data, "update");
      }
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = "w-full bg-black/40 border border-amber-900/20 rounded-2xl p-4 text-white outline-none focus:border-amber-400/50 transition-all placeholder-amber-100/20";
  const selectCls = "w-full bg-black/40 border border-amber-900/20 rounded-2xl p-4 text-white outline-none focus:border-amber-400/50 appearance-none";
  const labelCls = "text-amber-400 text-xs uppercase tracking-widest block mb-2 ml-1";

  return (
    <motion.div
      className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[100] flex items-center justify-center p-6"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-[#110e0c] border border-amber-900/30 rounded-[2.5rem] p-10 max-w-2xl w-full shadow-2xl overflow-y-auto max-h-[90vh]"
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
      >
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-4xl font-serif text-white">
            {mode === "edit" ? "Edit Package" : "New Package"}
          </h2>
          <button onClick={onClose} className="cursor-pointer text-amber-100/40 hover:text-white transition-colors">
            <X size={32} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Image upload */}
          <div
            className="relative h-48 rounded-3xl border-2 border-dashed border-amber-900/30 hover:border-amber-400/50 transition-colors cursor-pointer overflow-hidden group"
            onClick={() => fileRef.current.click()}
          >
            {imagePreviews.length > 0 ? (
              <div className="flex h-full gap-1">
                {imagePreviews.slice(0, 3).map((src, i) => (
                  <img key={i} src={src} alt="" className="flex-1 object-cover" />
                ))}
                {imagePreviews.length > 3 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-bold">+{imagePreviews.length - 3} more</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Upload className="text-white" size={28} />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-amber-100/30 group-hover:text-amber-400 transition-colors">
                <Upload size={28} className="mb-2" />
                <p className="text-xs uppercase tracking-widest">Upload Package Images</p>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFile} />
          </div>

          {/* Title + Subtitle */}
          <div>
            <label className={labelCls}>Package Title</label>
            <input className={inputCls} placeholder="e.g. Greek Island Hopper" value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          </div>
          <div>
            <label className={labelCls}>Subtitle (optional)</label>
            <input className={inputCls} placeholder="e.g. 7 days of luxury island life" value={form.subtitle}
              onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Category</label>
              <select className={selectCls} value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Difficulty</label>
              <select className={selectCls} value={form.difficulty}
                onChange={(e) => setForm((f) => ({ ...f, difficulty: e.target.value }))}>
                {DIFFICULTIES.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Price (per person $)</label>
              <input type="number" min="0" className={inputCls} placeholder="2500" value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} />
            </div>
            <div>
              <label className={labelCls}>Original Price (optional)</label>
              <input type="number" min="0" className={inputCls} placeholder="3000 (for discount display)" value={form.originalPrice}
                onChange={(e) => setForm((f) => ({ ...f, originalPrice: e.target.value }))} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Duration</label>
              <input className={inputCls} placeholder="e.g. 7 days / 6 nights" value={form.duration}
                onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))} />
            </div>
            <div>
              <label className={labelCls}>Max Group Size</label>
              <input type="number" min="1" className={inputCls} placeholder="12" value={form.maxGroupSize}
                onChange={(e) => setForm((f) => ({ ...f, maxGroupSize: e.target.value }))} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Description</label>
            <textarea rows={3} className={inputCls} placeholder="Describe this package..." value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </div>

          <div>
            <label className={labelCls}>Highlights (comma separated)</label>
            <textarea rows={2} className={inputCls} placeholder="e.g. Sunset cruise, Wine tasting, City tour" value={form.highlights}
              onChange={(e) => setForm((f) => ({ ...f, highlights: e.target.value }))} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Includes (comma separated)</label>
              <textarea rows={2} className={inputCls} placeholder="Hotel, Meals, Flights..." value={form.includes}
                onChange={(e) => setForm((f) => ({ ...f, includes: e.target.value }))} />
            </div>
            <div>
              <label className={labelCls}>Excludes (comma separated)</label>
              <textarea rows={2} className={inputCls} placeholder="Visa, Insurance..." value={form.excludes}
                onChange={(e) => setForm((f) => ({ ...f, excludes: e.target.value }))} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Departure City</label>
              <input className={inputCls} placeholder="e.g. New York" value={form.departureCity}
                onChange={(e) => setForm((f) => ({ ...f, departureCity: e.target.value }))} />
            </div>
            <div>
              <label className={labelCls}>Languages (comma separated)</label>
              <input className={inputCls} placeholder="English, French" value={form.languages}
                onChange={(e) => setForm((f) => ({ ...f, languages: e.target.value }))} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Status</label>
              <select className={selectCls} value={form.isVisible}
                onChange={(e) => setForm((f) => ({ ...f, isVisible: e.target.value === "true" }))}>
                <option value="true">Visible</option>
                <option value="false">Draft</option>
              </select>
            </div>
            <div className="flex flex-col justify-center">
              <label className={labelCls}>Featured</label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.isFeatured}
                  onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))}
                  className="w-5 h-5 rounded" />
                <span className="text-amber-100/60 text-sm">Featured</span>
              </label>
            </div>
            <div className="flex flex-col justify-center">
              <label className={labelCls}>Popular</label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.isPopular}
                  onChange={(e) => setForm((f) => ({ ...f, isPopular: e.target.checked }))}
                  className="w-5 h-5 rounded" />
                <span className="text-amber-100/60 text-sm">Popular</span>
              </label>
            </div>
          </div>

          <button
            disabled={submitting}
            onClick={handleSubmit}
            className="cursor-pointer w-full bg-amber-400 text-black py-5 rounded-2xl font-bold uppercase tracking-[0.2em] hover:bg-amber-300 disabled:opacity-50 transition-all shadow-xl shadow-amber-400/10"
          >
            {submitting ? "Saving..." : mode === "edit" ? "Save Changes" : "Create Package"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function PackagesAdmin() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/packages/admin/all`);
      setPackages(res.data);
    } catch {
      toast.error("Failed to load packages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPackages(); }, []);

  const handleToggleVisibility = async (id) => {
    try {
      const res = await axios.patch(`${API_BASE_URL}/packages/${id}/visibility`);
      setPackages((prev) => prev.map((p) => p._id === id ? { ...p, isVisible: res.data.isVisible } : p));
      toast.success("Visibility updated");
    } catch { toast.error("Failed"); }
  };

  const handleToggleFeatured = async (id) => {
    try {
      const res = await axios.patch(`${API_BASE_URL}/packages/${id}/featured`);
      setPackages((prev) => prev.map((p) => p._id === id ? { ...p, isFeatured: res.data.isFeatured } : p));
      toast.success(res.data.isFeatured ? "Marked as Featured ⭐" : "Removed from Featured");
    } catch { toast.error("Failed"); }
  };

  const handleTogglePopular = async (id) => {
    try {
      const res = await axios.patch(`${API_BASE_URL}/packages/${id}/popular`);
      setPackages((prev) => prev.map((p) => p._id === id ? { ...p, isPopular: res.data.isPopular } : p));
      toast.success(res.data.isPopular ? "Marked as Popular 🔥" : "Removed from Popular");
    } catch { toast.error("Failed"); }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/packages/${id}`);
      setPackages((prev) => prev.filter((p) => p._id !== id));
      toast.success("Package deleted");
      setDeleteTarget(null);
    } catch { toast.error("Delete failed"); }
  };

  const handleSaved = (saved, mode) => {
    if (mode === "create") setPackages((prev) => [saved, ...prev]);
    else setPackages((prev) => prev.map((p) => p._id === saved._id ? saved : p));
  };

  const filtered = packages.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "all" || p.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const stats = {
    total: packages.length,
    visible: packages.filter((p) => p.isVisible).length,
    featured: packages.filter((p) => p.isFeatured).length,
    popular: packages.filter((p) => p.isPopular).length,
  };

  return (
    <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen relative pt-10">

      <AnimatePresence>
        {(modal === "create" || modal === "edit") && (
          <PackageModal
            mode={modal} pkg={editing}
            onClose={() => { setModal(null); setEditing(null); }}
            onSaved={handleSaved}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteTarget && (
          <motion.div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-[#110e0c] border border-red-900/30 rounded-3xl p-8 max-w-sm w-full text-center"
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={26} className="text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Delete Package?</h3>
              <p className="text-amber-100/40 text-sm mb-6">This cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteTarget(null)} className="flex-1 py-3 rounded-2xl border border-amber-900/30 text-amber-100/60 hover:text-white font-semibold">Cancel</button>
                <button onClick={() => handleDelete(deleteTarget)} className="flex-1 py-3 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-6 relative z-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-16">
          <div>
            <Link to="/admin/dashboard" className="text-amber-400 hover:text-amber-300 text-sm tracking-widest uppercase flex items-center gap-2 mb-4">
              <ArrowLeft size={18} /> Dashboard
            </Link>
            <h1 className="text-5xl md:text-7xl font-serif text-white">Packages</h1>
            <p className="text-amber-100/60 text-xl mt-4">Manage your travel packages.</p>
          </div>
          <button
            onClick={() => setModal("create")}
            className="cursor-pointer bg-amber-400 text-black px-8 py-4 rounded-2xl flex items-center gap-3 font-medium hover:bg-amber-300 transition-all hover:scale-105 active:scale-95"
          >
            <Plus size={24} /> Add Package
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-12">
          {[
            { icon: <LayoutGrid size={18} />, label: "Total", value: stats.total, color: "text-white" },
            { icon: <Eye size={18} />, label: "Visible", value: stats.visible, color: "text-emerald-400" },
            { icon: <Star size={18} />, label: "Featured", value: stats.featured, color: "text-yellow-400" },
            { icon: <Flame size={18} />, label: "Popular", value: stats.popular, color: "text-orange-400" },
          ].map(({ icon, label, value, color }) => (
            <div key={label} className="bg-[#1a1612] border border-amber-900/20 rounded-3xl p-6">
              <div className="text-amber-100/30 mb-2">{icon}</div>
              <p className="text-amber-100/40 text-[10px] uppercase tracking-[0.2em] mb-1">{label}</p>
              <p className={`text-3xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-5 items-start lg:items-center justify-between mb-10">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-900/50" size={18} />
            <input
              type="text" placeholder="Search packages..."
              className="w-full bg-[#1a1612] border border-amber-900/20 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-amber-400/50 transition-all placeholder-amber-100/20"
              value={search} onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {["all", ...CATEGORIES].map((c) => (
              <button key={c}
                onClick={() => setCategoryFilter(c)}
                className={`cursor-pointer px-4 py-2 rounded-full border transition-all text-xs font-medium whitespace-nowrap ${
                  categoryFilter === c ? "bg-amber-400 border-amber-400 text-black" : "bg-[#1a1612] border-amber-900/20 text-amber-100/60 hover:border-amber-400/50"
                }`}>
                {c === "all" ? "All" : c}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#1a1612] border border-amber-900/20 rounded-3xl overflow-hidden shadow-2xl">
          {loading ? (
            <div className="flex items-center justify-center py-24 text-amber-400">
              <Loader2 size={36} className="animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-24 text-center text-amber-100/30 italic">
              <Package size={36} className="mx-auto mb-3 opacity-30" />
              No packages found.
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-[#0c0a08] text-amber-100/40 text-[10px] uppercase tracking-[0.2em]">
                <tr>
                  <th className="px-8 py-6">Package</th>
                  <th className="px-8 py-6">Category</th>
                  <th className="px-8 py-6">Duration</th>
                  <th className="px-8 py-6">Price</th>
                  <th className="px-8 py-6 text-center">Visibility</th>
                  <th className="px-8 py-6 text-center">Featured</th>
                  <th className="px-8 py-6 text-center">Popular</th>
                  <th className="px-8 py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-900/10">
                <AnimatePresence>
                  {filtered.map((pkg, i) => (
                    <motion.tr
                      key={pkg._id}
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="group hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <img
                            src={pkg.images?.[0] || "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=200"}
                            alt={pkg.title}
                            className="w-14 h-14 rounded-2xl object-cover border border-amber-900/20"
                          />
                          <div>
                            <p className="text-white font-serif text-base">{pkg.title}</p>
                            {pkg.subtitle && <p className="text-amber-100/40 text-xs">{pkg.subtitle}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-amber-400 text-xs tracking-widest uppercase py-1 px-3 bg-amber-400/5 rounded-lg border border-amber-400/10">
                          {pkg.category}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-amber-100/60 text-sm">{pkg.duration}</td>
                      <td className="px-8 py-5">
                        <span className="text-white font-bold text-sm">${pkg.price.toLocaleString()}</span>
                        {pkg.originalPrice && pkg.originalPrice > pkg.price && (
                          <span className="text-amber-100/30 text-xs line-through ml-2">${pkg.originalPrice.toLocaleString()}</span>
                        )}
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex justify-center">
                          <button onClick={() => handleToggleVisibility(pkg._id)}
                            className={`cursor-pointer flex flex-col items-center gap-1 transition-all ${pkg.isVisible ? "text-emerald-400" : "text-white/10"}`}>
                            {pkg.isVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                            <span className="text-[9px] uppercase font-bold">{pkg.isVisible ? "Public" : "Hidden"}</span>
                          </button>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex justify-center">
                          <button onClick={() => handleToggleFeatured(pkg._id)}
                            className={`cursor-pointer flex flex-col items-center gap-1 transition-all ${pkg.isFeatured ? "text-yellow-400" : "text-white/10 hover:text-yellow-400/50"}`}>
                            <Star size={18} className={pkg.isFeatured ? "fill-yellow-400" : ""} />
                            <span className="text-[9px] uppercase font-bold">{pkg.isFeatured ? "Featured" : "Normal"}</span>
                          </button>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex justify-center">
                          <button onClick={() => handleTogglePopular(pkg._id)}
                            className={`cursor-pointer flex flex-col items-center gap-1 transition-all ${pkg.isPopular ? "text-orange-400" : "text-white/10 hover:text-orange-400/50"}`}>
                            <Flame size={18} className={pkg.isPopular ? "fill-orange-400" : ""} />
                            <span className="text-[9px] uppercase font-bold">{pkg.isPopular ? "Popular" : "Normal"}</span>
                          </button>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => { setEditing(pkg); setModal("edit"); }}
                            className="cursor-pointer p-3 text-amber-100/30 hover:text-amber-400 hover:bg-amber-400/10 rounded-xl transition-all">
                            <Pencil size={16} />
                          </button>
                          <button onClick={() => setDeleteTarget(pkg._id)}
                            className="cursor-pointer p-3 text-red-400/30 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          )}
        </div>
      </div>
    </motion.section>
  );
}