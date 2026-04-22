"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Pencil, Trash2, Eye, EyeOff,
  MapPin, X, Upload, Loader2, Globe, CheckCircle
} from "lucide-react";

const API = "http://localhost:5000/api/destinations";

const CONTINENTS = ["Europe", "Asia", "Africa", "North America", "South America", "Oceania", "Antarctica"];
const TYPES = ["Luxury", "Cultural", "Safari", "Adventure", "Historical", "Beach", "City Break"];

const emptyForm = {
  name: "", country: "", continent: "Europe",
  price: "", type: "Luxury", isVisible: true, image: null,
};

// ─── Reusable Field ────────────────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-bold uppercase tracking-widest text-slate-400">{label}</label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full px-4 py-3 bg-[#0D1117] border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#FF6B35] transition-colors";

// ─── Modal ─────────────────────────────────────────────────────────────────
function Modal({ title, onClose, onSubmit, loading, form, setForm }) {
  const fileRef = useRef();
  const [preview, setPreview] = useState(form.existingImage || null);

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setForm((f) => ({ ...f, image: file }));
    setPreview(URL.createObjectURL(file));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative z-10 w-full max-w-lg bg-[#161B22] border border-slate-700 rounded-3xl p-8 shadow-2xl"
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-5">
          {/* Image Upload */}
          <Field label="Destination Image">
            <div
              onClick={() => fileRef.current.click()}
              className="relative h-44 rounded-2xl border-2 border-dashed border-slate-600 hover:border-[#FF6B35] transition-colors cursor-pointer overflow-hidden group"
            >
              {preview ? (
                <img src={preview} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 group-hover:text-[#FF6B35] transition-colors">
                  <Upload size={28} className="mb-2" />
                  <p className="text-sm font-medium">Click to upload image</p>
                </div>
              )}
              {preview && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Upload size={28} className="text-white" />
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Destination Name">
              <input className={inputCls} placeholder="e.g. Santorini" value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </Field>
            <Field label="Country">
              <input className={inputCls} placeholder="e.g. Greece" value={form.country}
                onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Continent">
              <select className={inputCls} value={form.continent}
                onChange={(e) => setForm((f) => ({ ...f, continent: e.target.value }))}>
                {CONTINENTS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Type">
              <select className={inputCls} value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
                {TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Price (per person $)">
              <input type="number" min="0" className={inputCls} placeholder="1200" value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} />
            </Field>
            <Field label="Visibility">
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, isVisible: !f.isVisible }))}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border font-bold transition-all ${
                  form.isVisible
                    ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                    : "bg-slate-700/30 border-slate-600 text-slate-400"
                }`}
              >
                {form.isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                {form.isVisible ? "Visible" : "Hidden"}
              </button>
            </Field>
          </div>
        </div>

        <button
          onClick={onSubmit}
          disabled={loading}
          className="mt-8 w-full py-4 bg-[#FF6B35] hover:bg-[#e85a24] disabled:opacity-50 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {loading ? <><Loader2 size={18} className="animate-spin" /> Saving...</> : "Save Destination"}
        </button>
      </motion.div>
    </div>
  );
}

// ─── Main Admin Panel ──────────────────────────────────────────────────────
export default function DestinationsAdmin() {
  const [destinations, setDestinations] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [modal, setModal] = useState(null); // null | "create" | "edit"
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // ── Fetch ────────────────────────────────────────────────────────────────
  async function fetchAll() {
    try {
      const res = await fetch(`${API}/admin/all`);
      const data = await res.json();
      setDestinations(data);
    } catch {
      showToast("Failed to load destinations", "error");
    } finally {
      setFetching(false);
    }
  }

  useEffect(() => { fetchAll(); }, []);

  // ── Toast ────────────────────────────────────────────────────────────────
  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  // ── Open create ──────────────────────────────────────────────────────────
  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setModal("create");
  }

  // ── Open edit ────────────────────────────────────────────────────────────
  function openEdit(dest) {
    setEditing(dest);
    setForm({
      name: dest.name, country: dest.country,
      continent: dest.continent, price: dest.price,
      type: dest.type, isVisible: dest.isVisible,
      image: null, existingImage: dest.image,
    });
    setModal("edit");
  }

  // ── Submit ───────────────────────────────────────────────────────────────
  async function handleSubmit() {
    if (!form.name || !form.country || !form.price) {
      showToast("Name, country and price are required", "error");
      return;
    }
    if (modal === "create" && !form.image) {
      showToast("Please upload an image", "error");
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("country", form.country);
      fd.append("continent", form.continent);
      fd.append("price", form.price);
      fd.append("type", form.type);
      fd.append("isVisible", form.isVisible);
      if (form.image) fd.append("image", form.image);

      const url = modal === "edit" ? `${API}/${editing._id}` : API;
      const method = modal === "edit" ? "PUT" : "POST";

      const res = await fetch(url, { method, body: fd });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Request failed");
      }

      showToast(modal === "edit" ? "Destination updated!" : "Destination created!");
      setModal(null);
      fetchAll();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  // ── Toggle visibility ────────────────────────────────────────────────────
  async function handleToggle(id) {
    try {
      const res = await fetch(`${API}/${id}/visibility`, { method: "PATCH" });
      if (!res.ok) throw new Error();
      setDestinations((prev) =>
        prev.map((d) => d._id === id ? { ...d, isVisible: !d.isVisible } : d)
      );
    } catch {
      showToast("Failed to toggle visibility", "error");
    }
  }

  // ── Delete ───────────────────────────────────────────────────────────────
  async function handleDelete(id) {
    try {
      const res = await fetch(`${API}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      showToast("Destination deleted");
      setDeleteConfirm(null);
      setDestinations((prev) => prev.filter((d) => d._id !== id));
    } catch {
      showToast("Failed to delete", "error");
    }
  }

  // ── Stats ────────────────────────────────────────────────────────────────
  const stats = {
    total: destinations.length,
    visible: destinations.filter((d) => d.isVisible).length,
    avgPrice: destinations.length
      ? Math.round(destinations.reduce((s, d) => s + d.price, 0) / destinations.length)
      : 0,
  };

  return (
    <div className="min-h-screen bg-[#0D1117] text-white font-sans">

      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl font-semibold text-sm ${
              toast.type === "error"
                ? "bg-red-500/20 border border-red-500/40 text-red-300"
                : "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300"
            }`}
          >
            <CheckCircle size={16} />
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Delete Confirm ── */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setDeleteConfirm(null)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative z-10 bg-[#161B22] border border-slate-700 rounded-3xl p-8 max-w-sm w-full mx-4 text-center"
            >
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={28} className="text-red-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Delete Destination?</h3>
              <p className="text-slate-400 text-sm mb-6">This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-3 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors font-semibold">
                  Cancel
                </button>
                <button onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition-colors">
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Modal ── */}
      <AnimatePresence>
        {modal && (
          <Modal
            title={modal === "edit" ? `Edit — ${editing?.name}` : "Add New Destination"}
            onClose={() => setModal(null)}
            onSubmit={handleSubmit}
            loading={loading}
            form={form}
            setForm={setForm}
          />
        )}
      </AnimatePresence>

      {/* ── Header ── */}
      <header className="border-b border-slate-800 px-8 py-5 flex items-center justify-between sticky top-0 bg-[#0D1117]/95 backdrop-blur z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#FF6B35] rounded-xl flex items-center justify-center">
            <Globe size={18} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-white leading-none">Destinations</h1>
            <p className="text-xs text-slate-500 leading-none mt-0.5">Admin Panel</p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#FF6B35] hover:bg-[#e85a24] text-white font-bold rounded-xl transition-colors text-sm"
        >
          <Plus size={16} /> Add Destination
        </button>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">

        {/* ── Stats ── */}
        <div className="grid grid-cols-3 gap-5 mb-10">
          {[
            { label: "Total Destinations", value: stats.total, color: "text-white" },
            { label: "Visible", value: stats.visible, color: "text-emerald-400" },
            { label: "Avg. Price", value: `$${stats.avgPrice}`, color: "text-[#FF6B35]" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-[#161B22] border border-slate-800 rounded-2xl p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">{label}</p>
              <p className={`text-3xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* ── Table ── */}
        {fetching ? (
          <div className="flex items-center justify-center h-48 text-slate-500">
            <Loader2 size={32} className="animate-spin" />
          </div>
        ) : destinations.length === 0 ? (
          <div className="text-center py-24 text-slate-500">
            <MapPin size={40} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg font-semibold">No destinations yet</p>
            <p className="text-sm mt-1">Click "Add Destination" to get started</p>
          </div>
        ) : (
          <div className="bg-[#161B22] border border-slate-800 rounded-3xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  {["Destination", "Location", "Type", "Price", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left text-xs font-bold uppercase tracking-widest text-slate-500 px-6 py-4">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {destinations.map((dest, i) => (
                    <motion.tr
                      key={dest._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ delay: i * 0.04 }}
                      className="border-b border-slate-800/60 hover:bg-white/[0.02] transition-colors"
                    >
                      {/* Image + Name */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <img
                            src={dest.image}
                            alt={dest.name}
                            className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                          />
                          <span className="font-bold text-white">{dest.name}</span>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-slate-400 text-sm">
                          <MapPin size={12} />
                          {dest.country}, {dest.continent}
                        </div>
                      </td>

                      {/* Type */}
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-[#1E88E5]/10 text-[#60A5FA] text-xs font-bold rounded-full border border-[#1E88E5]/20">
                          {dest.type}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="px-6 py-4 font-bold text-[#FF6B35]">
                        ${dest.price.toLocaleString()}
                      </td>

                      {/* Visibility */}
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggle(dest._id)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                            dest.isVisible
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                              : "bg-slate-700/30 border-slate-600 text-slate-500 hover:bg-slate-700/50"
                          }`}
                        >
                          {dest.isVisible ? <Eye size={12} /> : <EyeOff size={12} />}
                          {dest.isVisible ? "Visible" : "Hidden"}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEdit(dest)}
                            className="p-2 rounded-xl bg-slate-700/40 hover:bg-[#1E88E5]/20 hover:text-[#60A5FA] text-slate-400 transition-all"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(dest._id)}
                            className="p-2 rounded-xl bg-slate-700/40 hover:bg-red-500/20 hover:text-red-400 text-slate-400 transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}