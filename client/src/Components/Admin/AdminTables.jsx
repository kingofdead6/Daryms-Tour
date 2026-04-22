import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { API_BASE_URL } from "../../../api";
import { toast } from "react-toastify";
import { Plus, Trash2, X, Armchair, ArrowLeft, Hash, Users, Layers } from "lucide-react";
import { Link } from "react-router-dom";

export default function AdminTables() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newTable, setNewTable] = useState({ number: "", capacity: 2 });

  useEffect(() => { fetchTables(); }, []);

  const fetchTables = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/tables`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTables(res.data);
    } catch {
      toast.error("Failed to load floor plan");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTable = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await axios.post(`${API_BASE_URL}/tables`, newTable, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTables(prev => [...prev, res.data]);
      setShowAddModal(false);
      setNewTable({ number: "", capacity: 2 });
      toast.success(`Table #${newTable.number} added`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Error adding table");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteTable = async (id, number) => {
    if (!window.confirm(`Remove Table #${number} from the floor plan?`)) return;
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/tables/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTables(prev => prev.filter(t => t._id !== id));
      toast.success("Table removed");
    } catch (err) {
      toast.error(err.response?.data?.message || "Cannot delete table with active reservations");
    }
  };

  const totalCapacity = tables.reduce((acc, t) => acc + t.capacity, 0);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen py-20 pt-32 bg-[#0c0a08] overflow-hidden relative"
    >
      <div className="absolute inset-0 bg-[radial-gradient(#2a241f_0.8px,transparent_1px)] bg-[length:50px_50px] opacity-20" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-16">
          <div>
            <Link to="/admin" className="inline-flex items-center gap-2 text-amber-400/70 hover:text-amber-400 text-xs tracking-[0.25em] uppercase font-light mb-4 transition-colors">
              <ArrowLeft size={14} /> Back to Center
            </Link>
            <h1 className="text-5xl md:text-7xl font-serif tracking-wider text-white">Floor Plan</h1>
            <p className="mt-3 text-lg text-amber-100/40 font-light italic">Orchestrating the dining room.</p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-4 bg-gradient-to-br from-[#1e1a16] to-[#131008] border border-amber-900/40 hover:border-amber-400/50 px-8 py-5 rounded-3xl transition-all duration-500 group shadow-xl"
          >
            <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-amber-400 text-black group-hover:rotate-90 transition-transform duration-500">
              <Plus size={22} />
            </div>
            <div className="text-left">
              <span className="block text-white text-base tracking-wide">Add Table</span>
              <span className="text-amber-100/40 text-[10px] uppercase tracking-widest font-bold">New Seat</span>
            </div>
          </motion.button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-5 mb-14">
          {[
            { icon: <Layers size={28} />, value: tables.length, label: "Total Tables" },
            { icon: <Users size={28} />, value: totalCapacity, label: "Total Capacity" }
          ].map(({ icon, value, label }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#1a1612]/50 border border-amber-900/20 p-6 rounded-2xl flex items-center gap-4"
            >
              <div className="text-amber-400/60">{icon}</div>
              <div>
                <span className="block text-2xl font-serif text-white">{value}</span>
                <span className="text-[10px] text-stone-500 uppercase tracking-widest font-bold">{label}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tables Grid */}
        {loading ? (
          <div className="h-64 flex items-center justify-center text-amber-100/30 tracking-[0.3em] uppercase text-xs">
            Mapping the room...
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
            <AnimatePresence>
              {tables.map((table, idx) => (
                <motion.div
                  key={table._id}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: idx * 0.04, type: "spring", stiffness: 200, damping: 20 }}
                  className="group relative aspect-square bg-gradient-to-b from-[#1e1a15] to-[#0f0c09] border border-amber-900/15 rounded-[2rem] flex flex-col items-center justify-center gap-2 hover:border-amber-400/25 transition-all duration-500 shadow-xl cursor-default"
                >
                  <div className="absolute inset-0 rounded-[2rem] bg-amber-400/0 group-hover:bg-amber-400/[0.02] transition-all duration-500" />

                  {/* Delete button */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                    <button
                      onClick={() => handleDeleteTable(table._id, table.number)}
                      className="w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-stone-600 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <div className="p-3 bg-amber-400/5 rounded-full group-hover:bg-amber-400/10 transition-colors duration-500">
                    <Armchair
                      className="text-amber-400/30 group-hover:text-amber-400/70 transition-colors duration-500"
                      size={28}
                      strokeWidth={1.5}
                    />
                  </div>
                  <span className="text-2xl font-serif text-white/90">#{table.number}</span>
                  <div className="flex items-center gap-1.5 text-stone-600">
                    <Users size={10} />
                    <span className="text-[9px] uppercase tracking-widest font-bold">{table.capacity} seats</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Empty state */}
            {!loading && tables.length === 0 && (
              <div className="col-span-full py-32 text-center border-2 border-dashed border-stone-900 rounded-[2.5rem]">
                <p className="text-stone-600 font-serif text-xl italic">No tables on the floor plan.</p>
                <button onClick={() => setShowAddModal(true)} className="mt-4 text-amber-400 text-xs uppercase tracking-widest font-bold hover:underline">
                  Add your first table
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Table Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              className="bg-[#161310] border border-amber-900/30 rounded-[2.5rem] w-full max-w-sm p-10 relative overflow-hidden"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 280, damping: 24 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Glow */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-amber-400/5 rounded-full blur-3xl" />

              <button onClick={() => setShowAddModal(false)} className="absolute top-7 right-7 text-stone-600 hover:text-white transition-colors">
                <X size={24} />
              </button>

              <h2 className="text-3xl font-serif text-white mb-1">New Table</h2>
              <p className="text-amber-100/30 text-xs mb-8 uppercase tracking-widest font-bold">Add to Floor Plan</p>

              <form onSubmit={handleAddTable} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-[0.3em] text-amber-400 font-bold">Table Number</label>
                  <div className="relative">
                    <Hash className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-600" size={15} />
                    <input
                      type="number"
                      required
                      min="1"
                      className="w-full bg-black/40 border border-stone-800 focus:border-amber-400/50 p-4 pl-12 rounded-2xl text-white outline-none transition-all text-sm placeholder:text-stone-700"
                      placeholder="e.g. 12"
                      value={newTable.number}
                      onChange={e => setNewTable({ ...newTable, number: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-[0.3em] text-amber-400 font-bold">Seating Capacity</label>
                  <div className="relative">
                    <Users className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-600" size={15} />
                    <input
                      type="number"
                      required
                      min="1"
                      max="20"
                      className="w-full bg-black/40 border border-stone-800 focus:border-amber-400/50 p-4 pl-12 rounded-2xl text-white outline-none transition-all text-sm"
                      value={newTable.capacity}
                      onChange={e => setNewTable({ ...newTable, capacity: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={isCreating}
                  className="w-full py-5 bg-amber-400 hover:bg-amber-300 text-black rounded-2xl font-bold uppercase tracking-widest text-xs transition-all disabled:opacity-30 mt-2"
                >
                  {isCreating ? "Adding..." : "Add to Floor"}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}