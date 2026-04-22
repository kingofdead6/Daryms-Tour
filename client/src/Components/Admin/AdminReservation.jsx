import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { API_BASE_URL } from "../../../api";
import { toast } from "react-toastify";
import {
  Check, X, Clock, Calendar, User, Phone,
  ArrowLeft, Armchair, AlertCircle, Trash2, RefreshCw
} from "lucide-react";
import { Link } from "react-router-dom";

const STATUS_STYLES = {
  pending:   { pill: "bg-amber-500/10 text-amber-500 border border-amber-500/20", bar: "bg-amber-400 animate-pulse", dot: "bg-amber-400" },
  confirmed: { pill: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20", bar: "bg-emerald-500", dot: "bg-emerald-400" },
  cancelled: { pill: "bg-red-500/10 text-red-400 border border-red-500/20", bar: "bg-red-500/40", dot: "bg-red-400" }
};

function CountdownTimer({ createdAt }) {
  const [remaining, setRemaining] = useState("");

  useEffect(() => {
    const tick = () => {
      const expiresAt = new Date(new Date(createdAt).getTime() + 60 * 60 * 1000);
      const diff = expiresAt - Date.now();
      if (diff <= 0) { setRemaining("Expired"); return; }
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setRemaining(`${m}m ${s.toString().padStart(2, "0")}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [createdAt]);

  const isUrgent = remaining !== "Expired" && parseInt(remaining) < 15;
  return (
    <span className={`font-mono text-xs ${isUrgent ? "text-red-400" : "text-amber-400"}`}>
      {remaining}
    </span>
  );
}

export default function AdminReservations() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/reservations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(res.data);
    } catch {
      toast.error("Failed to load reservations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    const interval = setInterval(fetchBookings, 60000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (id, status) => {
    const label = status === "confirmed" ? "Confirmed" : "Cancelled";
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      await axios.patch(`${API_BASE_URL}/reservations/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Reservation ${label}`);
      setBookings(prev => prev.map(b => b._id === id ? { ...b, status } : b));
    } catch {
      toast.error("Action failed");
    }
  };

  const deleteReservation = async (id) => {
    if (!window.confirm("Permanently delete this reservation?")) return;
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/reservations/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Reservation deleted");
      setBookings(prev => prev.filter(b => b._id !== id));
    } catch {
      toast.error("Could not delete reservation");
    }
  };

  const filtered = filter === "all" ? bookings : bookings.filter(b => b.status === filter);
  const pending = bookings.filter(b => b.status === "pending").length;

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen py-20 pt-32 bg-[#0c0a08] relative"
    >
      <div className="absolute inset-0 bg-[radial-gradient(#1f1a16_1px,transparent_1px)] bg-[length:40px_40px] opacity-30" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <Link to="/admin" className="inline-flex items-center gap-2 text-amber-400/70 hover:text-amber-400 text-xs tracking-[0.25em] uppercase font-light mb-4 transition-colors">
              <ArrowLeft size={14} /> Control Center
            </Link>
            <div className="flex items-center gap-4">
              <h1 className="text-5xl md:text-6xl font-serif tracking-wide text-white">Guest Ledger</h1>
              {pending > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-2 bg-amber-400/10 border border-amber-400/30 text-amber-400 text-xs uppercase tracking-widest font-bold px-4 py-2 rounded-full"
                >
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse inline-block" />
                  {pending} pending
                </motion.span>
              )}
            </div>
            <p className="text-amber-100/30 mt-3 text-xs uppercase tracking-[0.25em] font-bold">
              Unconfirmed tables auto-release after 60 minutes
            </p>
          </div>
          <button
            onClick={fetchBookings}
            className="cursor-pointer flex items-center gap-2 text-stone-500 hover:text-amber-400 text-xs uppercase tracking-widest font-bold transition-colors"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 bg-white/5 p-2 rounded-2xl w-full sm:w-fit overflow-x-auto sm:overflow-visible">
  {["all", "pending", "confirmed", "cancelled"].map((f) => (
    <button
      key={f}
      onClick={() => setFilter(f)}
      className={`cursor-pointer px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-[10px] sm:text-xs uppercase tracking-widest font-bold transition-all duration-300 whitespace-nowrap ${
        filter === f
          ? "bg-amber-400 text-black shadow"
          : "text-stone-500 hover:text-white"
      }`}
    >
      {f}
    </button>
  ))}
</div>

        {/* Reservations List */}
        {loading && bookings.length === 0 ? (
          <div className="py-32 text-center text-stone-600 uppercase tracking-widest text-sm">
            <RefreshCw className="animate-spin mx-auto mb-4" size={20} />
            Loading ledger...
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filtered.map((res) => {
                const styles = STATUS_STYLES[res.status] || STATUS_STYLES.pending;
                return (
                  <motion.div
                    key={res._id}
                    layout
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    className={`relative overflow-hidden rounded-[1.75rem] -mr-10 border transition-all duration-500 ${
                      res.status === "pending"
                        ? "bg-[#181410]/80 border-amber-900/30"
                        : res.status === "confirmed"
                        ? "bg-[#131a14]/60 border-emerald-900/20"
                        : "bg-[#141210]/40 border-stone-900/50 opacity-50"
                    }`}
                  >
                    {/* Left accent bar */}
                    <div className={`absolute left-0 top-0 w-1 h-full ${styles.bar}`} />

                    <div className="pl-6 pr-8 py-7">
                      <div className="flex flex-col xl:flex-row xl:items-center gap-7">

                        {/* Guest Info */}
                        <div className="flex items-center gap-5 min-w-[240px]">
                          <div className="w-14 h-14 rounded-2xl bg-black/40 flex items-center justify-center border border-white/5 flex-shrink-0">
                            <User size={22} className="text-amber-400/60" />
                          </div>
                          <div>
                            <h3 className="text-xl font-serif text-white">{res.name}</h3>
                            <div className="flex items-center gap-2 text-stone-500 text-xs mt-1">
                              <Phone size={11} /> {res.phone}
                            </div>
                          </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 flex-1">
                          <InfoBlock label="Date & Time">
                            <div className="flex items-center gap-2 text-white text-sm">
                              <Calendar size={12} className="text-stone-600" /> {res.date}
                            </div>
                            <div className="flex items-center gap-2 text-stone-400 text-xs mt-1">
                              <Clock size={12} className="text-stone-600" /> {res.time}
                            </div>
                          </InfoBlock>

                          <InfoBlock label="Table">
                            <div className="flex items-center gap-2 text-white text-sm">
                              <Armchair size={12} className="text-stone-600" />
                              Table #{res.table?.number ?? "—"}
                            </div>
                            <div className="text-stone-400 text-xs mt-1">{res.guests} Guests</div>
                          </InfoBlock>

                          <InfoBlock label="Status"> 
                            <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-widest ${styles.pill}`}>
                              {res.status}
                            </span>
                          </InfoBlock>

                          <InfoBlock label={res.status === "pending" ? "Auto-cancel in" : "Expires"}>
                            {res.status === "pending" ? (
                              <div className="flex items-center gap-2">
                                <AlertCircle size={11} className="text-amber-500" />
                                <CountdownTimer createdAt={res.createdAt} />
                              </div>
                            ) : (
                              <span className="text-stone-600 text-xs uppercase tracking-widest font-bold">Closed</span>
                            )}
                          </InfoBlock>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3 flex-shrink-0">
                          {res.status === "pending" && (
                            <>
                              <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => updateStatus(res._id, "confirmed")}
                                className="cursor-pointer bg-amber-400 hover:bg-amber-300 text-black px-7 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-amber-900/30 flex items-center gap-2"
                              >
                                <Check size={14} /> Confirm
                              </motion.button>
                              <button
                                onClick={() => updateStatus(res._id, "cancelled")}
                                className="cursor-pointer p-3.5 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                                title="Cancel"
                              >
                                <X size={18} />
                              </button>
                            </>
                          )}
                          {res.status === "confirmed" && (
                            <button
                              onClick={() => updateStatus(res._id, "cancelled")}
                              className="cursor-pointer text-[10px] uppercase tracking-widest text-stone-600 hover:text-red-400 font-bold border border-stone-800 hover:border-red-900/50 px-5 py-3 rounded-full transition-all flex items-center gap-2"
                            >
                              <X size={12} /> Cancel
                            </button>
                          )}
                          <button
                            onClick={() => deleteReservation(res._id)}
                            className="cursor-pointer p-3.5 text-stone-700 hover:text-red-500 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {!loading && filtered.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-40 text-center border-2 border-dashed border-stone-900 rounded-[2.5rem]"
              >
                <p className="text-stone-600 font-serif text-2xl italic">
                  {filter === "all" ? "The ledger is empty." : `No ${filter} reservations.`}
                </p>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </motion.section>
  );
}

function InfoBlock({ label, children }) {
  return (
    <div className="space-y-1.5">
      <span className="text-[9px] uppercase tracking-[0.25em] text-amber-400/60 font-bold">{label} : </span>
      {children}
    </div>
  );
}