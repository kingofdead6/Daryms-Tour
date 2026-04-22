"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../../api";
import {
    Plus, Search, Trash2, X, Upload, ArrowLeft,
    Eye, EyeOff, Filter, Pencil, Loader2, MapPin,
    Globe, DollarSign, LayoutGrid, Star
} from "lucide-react";
import { Link } from "react-router-dom";

const CONTINENTS = ["Europe", "Asia", "Africa", "North America", "South America", "Oceania", "Antarctica"];
const TYPES = ["Luxury", "Cultural", "Safari", "Adventure", "Historical", "Beach", "City Break"];

const emptyForm = {
    name: "", country: "", continent: "Europe",
    price: "", type: "Luxury", isVisible: true,
    description: "", duration: "", guided: false, includes: [],
};

// ─── Form Modal ────────────────────────────────────────────────────────────
function DestinationModal({ mode, destination, onClose, onSaved }) {
    const fileRef = useRef();
    const [form, setForm] = useState(
        mode === "edit" && destination
            ? {
                  name: destination.name,
                  country: destination.country,
                  continent: destination.continent,
                  price: destination.price,
                  type: destination.type,
                  isVisible: destination.isVisible,
                  description: destination.description || "",
                  duration: destination.duration || "",
                  guided: destination.guided || false,
                  includes: destination.includes || [],
              }
            : emptyForm
    );
    const [selectedImages, setSelectedImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState(mode === "edit" ? (destination?.image || []) : []);
    const [submitting, setSubmitting] = useState(false);

    const handleFile = (e) => {
        const files = Array.from(e.target.files);
        setSelectedImages(files);
        setImagePreviews(files.map(file => URL.createObjectURL(file)));
    };

    const handleSubmit = async () => {
        if (!form.name || !form.country || !form.price) {
            toast.error("Name, country and price are required");
            return;
        }
        if (mode === "create" && (!selectedImages || selectedImages.length === 0)) {
            toast.error("Please upload at least one destination image");
            return;
        }
        setSubmitting(true);
        const fd = new FormData();
        fd.append("name", form.name);
        fd.append("country", form.country);
        fd.append("continent", form.continent);
        fd.append("price", form.price);
        fd.append("type", form.type);
        fd.append("isVisible", form.isVisible);
        fd.append("description", form.description);
        fd.append("duration", form.duration);
        fd.append("guided", form.guided);
        fd.append("includes", JSON.stringify(form.includes)); // since it's array
        if (selectedImages && selectedImages.length > 0) {
            selectedImages.forEach((image, index) => {
                fd.append("images", image);
            });
        }

        try {
            if (mode === "create") {
                const res = await axios.post(`${API_BASE_URL}/destinations`, fd);
                toast.success("Destination created!");
                onSaved(res.data, "create");
            } else {
                const res = await axios.put(`${API_BASE_URL}/destinations/${destination._id}`, fd);
                toast.success("Destination updated!");
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
                        {mode === "edit" ? "Edit Destination" : "New Destination"}
                    </h2>
                    <button onClick={onClose} className="cursor-pointer text-amber-100/40 hover:text-white transition-colors">
                        <X size={32} />
                    </button>
                </div>

                <div className="space-y-6">
                    <div
                        className="relative h-48 rounded-3xl border-2 border-dashed border-amber-900/30 hover:border-amber-400/50 transition-colors cursor-pointer overflow-hidden group"
                        onClick={() => fileRef.current.click()}
                    >
                        {imagePreviews.length > 0 ? (
                            <div className="flex space-x-2 h-full">
                                {imagePreviews.slice(0, 3).map((preview, index) => (
                                    <img key={index} src={preview} alt="" className="w-full h-full object-cover rounded-3xl" />
                                ))}
                                {imagePreviews.length > 3 && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-3xl">
                                        <span className="text-white text-lg font-bold">+{imagePreviews.length - 3} more</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-3xl">
                                    <Upload className="text-white" size={28} />
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-amber-100/30 group-hover:text-amber-400 transition-colors">
                                <Upload size={28} className="mb-2" />
                                <p className="text-xs uppercase tracking-widest">Upload Destination Images</p>
                            </div>
                        )}
                        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFile} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-amber-400 text-xs uppercase tracking-widest block mb-2 ml-1">Destination Name</label>
                            <input className={inputCls} placeholder="e.g. Santorini" value={form.name}
                                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                        </div>
                        <div>
                            <label className="text-amber-400 text-xs uppercase tracking-widest block mb-2 ml-1">Country</label>
                            <input className={inputCls} placeholder="e.g. Greece" value={form.country}
                                onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-amber-400 text-xs uppercase tracking-widest block mb-2 ml-1">Continent</label>
                            <select className={selectCls} value={form.continent}
                                onChange={(e) => setForm((f) => ({ ...f, continent: e.target.value }))}>
                                {CONTINENTS.map((c) => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-amber-400 text-xs uppercase tracking-widest block mb-2 ml-1">Trip Type</label>
                            <select className={selectCls} value={form.type}
                                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
                                {TYPES.map((t) => <option key={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-amber-400 text-xs uppercase tracking-widest block mb-2 ml-1">Price (per person $)</label>
                            <input type="number" min="0" className={inputCls} placeholder="1200" value={form.price}
                                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} />
                        </div>
                        <div>
                            <label className="text-amber-400 text-xs uppercase tracking-widest block mb-2 ml-1">Initial Status</label>
                            <select className={selectCls} value={form.isVisible}
                                onChange={(e) => setForm((f) => ({ ...f, isVisible: e.target.value === "true" }))}>
                                <option value="true">Visible to Public</option>
                                <option value="false">Save as Draft</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="text-amber-400 text-xs uppercase tracking-widest block mb-2 ml-1">Description</label>
                        <textarea className={inputCls} placeholder="Describe the destination..." value={form.description}
                            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-amber-400 text-xs uppercase tracking-widest block mb-2 ml-1">Duration</label>
                            <input className={inputCls} placeholder="e.g. 7 days" value={form.duration}
                                onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))} />
                        </div>
                        <div className="flex items-center">
                            <label className="text-amber-400 text-xs uppercase tracking-widest block mb-2 ml-1 mr-4">Guided Tour</label>
                            <input type="checkbox" checked={form.guided}
                                onChange={(e) => setForm((f) => ({ ...f, guided: e.target.checked }))} />
                        </div>
                    </div>

                    <div>
                        <label className="text-amber-400 text-xs uppercase tracking-widest block mb-2 ml-1">Includes (comma separated)</label>
                        <textarea className={inputCls} placeholder="e.g. Accommodation, Meals, Transport" value={form.includes.join(', ')}
                            onChange={(e) => setForm((f) => ({ ...f, includes: e.target.value.split(',').map(s => s.trim()).filter(s => s) }))} rows={2} />
                    </div>

                    <button
                        disabled={submitting}
                        onClick={handleSubmit}
                        className="cursor-pointer w-full bg-amber-400 text-black py-5 rounded-2xl font-bold uppercase tracking-[0.2em] hover:bg-amber-300 disabled:opacity-50 transition-all shadow-xl shadow-amber-400/10"
                    >
                        {submitting ? "Saving..." : mode === "edit" ? "Save Changes" : "Create Destination"}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

// ─── Main Admin Page ───────────────────────────────────────────────────────
export default function DestinationsAdmin() {
    const [destinations, setDestinations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedContinent, setSelectedContinent] = useState("all");
    const [modal, setModal] = useState(null);
    const [editing, setEditing] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const fetchDestinations = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/destinations/admin/all`);
            setDestinations(res.data);
        } catch {
            toast.error("Failed to load destinations");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDestinations(); }, []);

    const handleToggleVisibility = async (id) => {
        try {
            await axios.patch(`${API_BASE_URL}/destinations/${id}/visibility`);
            setDestinations((prev) =>
                prev.map((d) => d._id === id ? { ...d, isVisible: !d.isVisible } : d)
            );
            toast.success("Visibility updated");
        } catch {
            toast.error("Failed to update visibility");
        }
    };

    // ✅ NEW: Toggle Popular
    const handleTogglePopular = async (id) => {
        try {
            const res = await axios.patch(`${API_BASE_URL}/destinations/${id}/popular`);
            setDestinations((prev) =>
                prev.map((d) => d._id === id ? { ...d, isPopular: res.data.isPopular } : d)
            );
            toast.success(res.data.isPopular ? "Added to Popular ⭐" : "Removed from Popular");
        } catch {
            toast.error("Failed to update popular status");
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${API_BASE_URL}/destinations/${id}`);
            setDestinations((prev) => prev.filter((d) => d._id !== id));
            toast.success("Destination deleted");
            setDeleteTarget(null);
        } catch {
            toast.error("Delete failed");
        }
    };

    const handleSaved = (saved, mode) => {
        if (mode === "create") {
            setDestinations((prev) => [saved, ...prev]);
        } else {
            setDestinations((prev) => prev.map((d) => d._id === saved._id ? saved : d));
        }
    };

    const filtered = destinations.filter((d) => {
        const matchesSearch =
            d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.country.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesContinent = selectedContinent === "all" || d.continent === selectedContinent;
        return matchesSearch && matchesContinent;
    });

    const stats = {
        total: destinations.length,
        visible: destinations.filter((d) => d.isVisible).length,
        popular: destinations.filter((d) => d.isPopular).length,
        continents: new Set(destinations.map((d) => d.continent)).size,
    };

    return (
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen relative pt-10">

            <AnimatePresence>
                {(modal === "create" || modal === "edit") && (
                    <DestinationModal
                        mode={modal}
                        destination={editing}
                        onClose={() => { setModal(null); setEditing(null); }}
                        onSaved={handleSaved}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {deleteTarget && (
                    <motion.div
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="bg-[#110e0c] border border-red-900/30 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
                            initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                        >
                            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 size={26} className="text-red-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Delete Destination?</h3>
                            <p className="text-amber-100/40 text-sm mb-6">This cannot be undone.</p>
                            <div className="flex gap-3">
                                <button onClick={() => setDeleteTarget(null)}
                                    className="flex-1 py-3 rounded-2xl border border-amber-900/30 text-amber-100/60 hover:text-white transition-all font-semibold">
                                    Cancel
                                </button>
                                <button onClick={() => handleDelete(deleteTarget)}
                                    className="flex-1 py-3 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold transition-all">
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="max-w-7xl mx-auto px-6 relative z-10">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-16">
                    <div>
                        <Link to="/admin/dashboard"
                            className="text-amber-400 hover:text-amber-300 text-sm tracking-widest uppercase flex items-center gap-2 mb-4">
                            <ArrowLeft size={18} /> Dashboard
                        </Link>
                        <h1 className="text-5xl md:text-7xl font-serif text-white">Destinations</h1>
                        <p className="text-amber-100/60 text-xl mt-4">Manage your travel portfolio.</p>
                    </div>
                    <button
                        onClick={() => setModal("create")}
                        className="cursor-pointer bg-amber-400 text-black px-8 py-4 rounded-2xl flex items-center gap-3 font-medium hover:bg-amber-300 transition-all hover:scale-105 active:scale-95"
                    >
                        <Plus size={24} /> Add Destination
                    </button>
                </div>

                {/* Stats — popular replaces avg price */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-12">
                    {[
                        { icon: <LayoutGrid size={18} />, label: "Total", value: stats.total, color: "text-white" },
                        { icon: <Eye size={18} />, label: "Visible", value: stats.visible, color: "text-emerald-400" },
                        { icon: <Star size={18} />, label: "Popular", value: stats.popular, color: "text-yellow-400" },
                        { icon: <Globe size={18} />, label: "Continents", value: stats.continents, color: "text-[#60A5FA]" },
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
                            type="text"
                            placeholder="Search destinations or countries..."
                            className="w-full bg-[#1a1612] border border-amber-900/20 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-amber-400/50 transition-all placeholder-amber-100/20"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-2 pr-4 border-r border-amber-900/20 mr-1 text-amber-400/60">
                            <Filter size={14} />
                            <span className="text-xs uppercase tracking-widest">Filter</span>
                        </div>
                        {["all", ...CONTINENTS].map((c) => (
                            <button key={c}
                                onClick={() => setSelectedContinent(c)}
                                className={`cursor-pointer px-4 py-2 rounded-full border transition-all whitespace-nowrap text-xs font-medium ${
                                    selectedContinent === c
                                        ? "bg-amber-400 border-amber-400 text-black"
                                        : "bg-[#1a1612] border-amber-900/20 text-amber-100/60 hover:border-amber-400/50 hover:text-amber-400"
                                }`}
                            >
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
                            <MapPin size={36} className="mx-auto mb-3 opacity-30" />
                            No destinations found.
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-[#0c0a08] text-amber-100/40 text-[10px] uppercase tracking-[0.2em]">
                                <tr>
                                    <th className="px-8 py-6">Destination</th>
                                    <th className="px-8 py-6">Location</th>
                                    <th className="px-8 py-6">Type</th>
                                    <th className="px-8 py-6">Price</th>
                                    <th className="px-8 py-6 text-center">Visibility</th>
                                    <th className="px-8 py-6 text-center">Popular</th>
                                    <th className="px-8 py-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-amber-900/10">
                                <AnimatePresence>
                                    {filtered.map((dest, i) => (
                                        <motion.tr
                                            key={dest._id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 10 }}
                                            transition={{ delay: i * 0.04 }}
                                            className="group hover:bg-white/[0.02] transition-colors"
                                        >
                                            {/* Image + Name */}
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-5">
                                                    <div className="relative flex-shrink-0">
                                                        <img src={dest.image} alt={dest.name}
                                                            className="w-16 h-16 rounded-2xl object-cover border border-amber-900/20" />
                                                        {/* Popular badge on thumbnail */}
                                                        {dest.isPopular && (
                                                            <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                                                                <Star size={10} className="fill-black text-black" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="text-white font-serif text-lg">{dest.name}</span>
                                                </div>
                                            </td>

                                            {/* Location */}
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-1 text-amber-100/40 text-xs">
                                                    <MapPin size={12} />
                                                    {dest.country}, {dest.continent}
                                                </div>
                                            </td>

                                            {/* Type */}
                                            <td className="px-8 py-5">
                                                <span className="text-amber-400 text-xs tracking-widest uppercase py-1 px-3 bg-amber-400/5 rounded-lg border border-amber-400/10">
                                                    {dest.type}
                                                </span>
                                            </td>

                                            {/* Price */}
                                            <td className="px-8 py-5">
                                                <span className="text-white font-bold text-sm">${dest.price.toLocaleString()}</span>
                                            </td>

                                            {/* Visibility toggle */}
                                            <td className="px-8 py-5">
                                                <div className="flex justify-center">
                                                    <button
                                                        onClick={() => handleToggleVisibility(dest._id)}
                                                        className={`cursor-pointer flex flex-col items-center gap-1 transition-all ${dest.isVisible ? "text-emerald-400" : "text-white/10"}`}
                                                    >
                                                        {dest.isVisible ? <Eye size={20} /> : <EyeOff size={20} />}
                                                        <span className="text-[9px] uppercase font-bold tracking-tighter">
                                                            {dest.isVisible ? "Public" : "Hidden"}
                                                        </span>
                                                    </button>
                                                </div>
                                            </td>

                                            {/* ✅ Popular toggle — NEW COLUMN */}
                                            <td className="px-8 py-5">
                                                <div className="flex justify-center">
                                                    <button
                                                        onClick={() => handleTogglePopular(dest._id)}
                                                        title={dest.isPopular ? "Remove from Popular" : "Mark as Popular"}
                                                        className={`cursor-pointer flex flex-col items-center gap-1 transition-all group/star ${
                                                            dest.isPopular
                                                                ? "text-yellow-400"
                                                                : "text-white/10 hover:text-yellow-400/50"
                                                        }`}
                                                    >
                                                        <Star
                                                            size={20}
                                                            className={dest.isPopular ? "fill-yellow-400" : "group-hover/star:fill-yellow-400/30"}
                                                        />
                                                        <span className="text-[9px] uppercase font-bold tracking-tighter">
                                                            {dest.isPopular ? "Featured" : "Normal"}
                                                        </span>
                                                    </button>
                                                </div>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => { setEditing(dest); setModal("edit"); }}
                                                        className="cursor-pointer p-3 text-amber-100/30 hover:text-amber-400 hover:bg-amber-400/10 rounded-xl transition-all"
                                                    >
                                                        <Pencil size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteTarget(dest._id)}
                                                        className="cursor-pointer p-3 text-red-400/30 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                                                    >
                                                        <Trash2 size={18} />
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