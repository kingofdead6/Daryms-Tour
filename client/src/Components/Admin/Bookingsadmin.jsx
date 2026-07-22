"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../../api";
import {
  Search, ArrowLeft, Loader2, Trash2, Eye, X, Filter,
  Calendar, Users, DollarSign, TrendingUp, Clock, CheckCircle,
  XCircle, Package, MapPin, Phone, Mail, Globe, FileText,
  ChevronDown, RefreshCw, CreditCard, AlertCircle
} from "lucide-react";
import { Link } from "react-router-dom";

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  confirmed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
  completed: "bg-blue-100 text-blue-700 border-blue-200",
  "no-show": "bg-slate-100 text-slate-600 border-slate-200",
};

const PAYMENT_COLORS = {
  unpaid: "text-red-600",
  partially_paid: "text-orange-600",
  paid: "text-emerald-600",
  refunded: "text-blue-600",
};

const STATUSES = ["pending", "confirmed", "cancelled", "completed", "no-show"];
const PAYMENT_STATUSES = ["unpaid", "partially_paid", "paid", "refunded"];

function BookingDrawer({ booking, onClose, onUpdate }) {
  const [status, setStatus] = useState(booking.status);
  const [paymentStatus, setPaymentStatus] = useState(booking.paymentStatus);
  const [adminNotes, setAdminNotes] = useState(booking.adminNotes || "");
  const [saving, setSaving] = useState(false);

  const tripName = booking.bookingType === "destination"
    ? booking.destination?.name
    : booking.package?.title;
  const tripImage = booking.bookingType === "destination"
    ? (Array.isArray(booking.destination?.image) ? booking.destination?.image[0] : booking.destination?.image)
    : booking.package?.images?.[0];

  const handleSave = async () => {
    setSaving(true);
    try {
      const [statusRes, paymentRes, notesRes] = await Promise.all([
        axios.patch(`${API_BASE_URL}/bookings/${booking._id}/status`, { status }),
        axios.patch(`${API_BASE_URL}/bookings/${booking._id}/payment`, { paymentStatus }),
        axios.patch(`${API_BASE_URL}/bookings/${booking._id}/notes`, { adminNotes }),
      ]);
      toast.success("Booking updated");
      onUpdate({ ...booking, status, paymentStatus, adminNotes });
      onClose();
    } catch {
      toast.error("Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex justify-end"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className="bg-white w-full max-w-lg h-full overflow-y-auto shadow-2xl border-l border-stone-200"
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-stone-200">
          <div>
            <h2 className="text-2xl font-serif text-stone-900">Booking Details</h2>
            <p className="text-stone-400 text-sm font-mono mt-1">{booking.referenceCode}</p>
          </div>
          <button onClick={onClose} className="cursor-pointer text-stone-400 hover:text-stone-900 transition-colors">
            <X size={28} />
          </button>
        </div>

        <div className="p-8 space-y-7">
          {/* Trip */}
          <div>
            <h3 className="text-amber-600 text-xs uppercase tracking-widest mb-3">Trip</h3>
            <div className="flex items-center gap-4 bg-stone-50 border border-stone-200 rounded-2xl p-4">
              {tripImage ? (
                <img src={tripImage} alt={tripName} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-amber-100 flex items-center justify-center">
                  {booking.bookingType === "destination" ? <MapPin size={20} className="text-amber-600" /> : <Package size={20} className="text-amber-600" />}
                </div>
              )}
              <div>
                <p className="text-stone-900 font-semibold">{tripName || "—"}</p>
                <p className="text-stone-400 text-sm capitalize">{booking.bookingType}</p>
              </div>
            </div>
          </div>

          {/* Guest info */}
          <div>
            <h3 className="text-amber-600 text-xs uppercase tracking-widest mb-3">Guest</h3>
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 space-y-3">
              {[
                { icon: <Users size={14} />, label: `${booking.firstName} ${booking.lastName}` },
                { icon: <Mail size={14} />, label: booking.email },
                { icon: <Phone size={14} />, label: booking.phone },
                { icon: <Globe size={14} />, label: booking.nationality || "—" },
                { icon: <FileText size={14} />, label: booking.passportNumber || "—" },
              ].map(({ icon, label }) => (
                <div key={label} className="flex items-center gap-3 text-stone-600 text-sm">
                  <span className="text-amber-600/70">{icon}</span>
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Trip details */}
          <div>
            <h3 className="text-amber-600 text-xs uppercase tracking-widest mb-3">Trip Details</h3>
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 space-y-2 text-sm">
              <div className="flex justify-between text-stone-500">
                <span>Departure</span>
                <span className="text-stone-900">{new Date(booking.departureDate).toLocaleDateString()}</span>
              </div>
              {booking.returnDate && (
                <div className="flex justify-between text-stone-500">
                  <span>Return</span>
                  <span className="text-stone-900">{new Date(booking.returnDate).toLocaleDateString()}</span>
                </div>
              )}
              <div className="flex justify-between text-stone-500">
                <span>Adults</span>
                <span className="text-stone-900">{booking.travelers?.adults}</span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Children</span>
                <span className="text-stone-900">{booking.travelers?.children}</span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Room Type</span>
                <span className="text-stone-900">{booking.roomType}</span>
              </div>
              {booking.specialRequests && (
                <div className="pt-2 border-t border-stone-200">
                  <p className="text-stone-400 text-xs mb-1">Special Requests</p>
                  <p className="text-stone-900 text-sm">{booking.specialRequests}</p>
                </div>
              )}
            </div>
          </div>

          {/* Financials */}
          <div>
            <h3 className="text-amber-600 text-xs uppercase tracking-widest mb-3">Financials</h3>
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 space-y-2 text-sm">
              <div className="flex justify-between text-stone-500">
                <span>Price/person</span>
                <span className="text-stone-900">${booking.pricePerPerson?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Travelers</span>
                <span className="text-stone-900">{booking.totalTravelers}</span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Subtotal</span>
                <span className="text-stone-900">${booking.subtotal?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Taxes</span>
                <span className="text-stone-900">${booking.taxes?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-stone-200 pt-2">
                <span className="font-bold text-stone-900">Total</span>
                <span className="text-amber-600 font-bold text-lg">${booking.totalAmount?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Status controls */}
          <div className="space-y-4">
            <div>
              <label className="text-amber-600 text-xs uppercase tracking-widest block mb-2">Booking Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-4 text-stone-900 outline-none focus:border-amber-400 appearance-none"
              >
                {STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-amber-600 text-xs uppercase tracking-widest block mb-2">Payment Status</label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-4 text-stone-900 outline-none focus:border-amber-400 appearance-none"
              >
                {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
              </select>
            </div>
            <div>
              <label className="text-amber-600 text-xs uppercase tracking-widest block mb-2">Admin Notes</label>
              <textarea
                rows={3}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Internal notes (not visible to customer)..."
                className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-4 text-stone-900 outline-none focus:border-amber-400 resize-none placeholder-stone-300"
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="cursor-pointer w-full bg-amber-500 text-white py-4 rounded-2xl font-bold uppercase tracking-widest hover:bg-amber-600 disabled:opacity-50 transition-all"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function BookingsAdmin() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [bookRes, statsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/bookings/admin/all`),
        axios.get(`${API_BASE_URL}/bookings/admin/stats`),
      ]);
      setBookings(bookRes.data);
      setStats(statsRes.data);
    } catch {
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/bookings/${id}`);
      setBookings((prev) => prev.filter((b) => b._id !== id));
      toast.success("Booking deleted");
      setDeleteTarget(null);
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleUpdate = (updated) => {
    setBookings((prev) => prev.map((b) => b._id === updated._id ? updated : b));
  };

  const filtered = bookings.filter((b) => {
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    const matchType = typeFilter === "all" || b.bookingType === typeFilter;
    const matchSearch =
      !search ||
      b.firstName?.toLowerCase().includes(search.toLowerCase()) ||
      b.lastName?.toLowerCase().includes(search.toLowerCase()) ||
      b.email?.toLowerCase().includes(search.toLowerCase()) ||
      b.referenceCode?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchType && matchSearch;
  });

  const statCards = [
    { icon: <FileText size={18} />, label: "Total", value: stats.total || 0, color: "text-stone-900" },
    { icon: <Clock size={18} />, label: "Pending", value: stats.pending || 0, color: "text-yellow-600" },
    { icon: <CheckCircle size={18} />, label: "Confirmed", value: stats.confirmed || 0, color: "text-emerald-600" },
    { icon: <DollarSign size={18} />, label: "Revenue", value: `$${(stats.totalRevenue || 0).toLocaleString()}`, color: "text-amber-600" },
  ];

  return (
    <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen relative pt-10 bg-stone-50">

      <AnimatePresence>
        {selectedBooking && (
          <BookingDrawer
            booking={selectedBooking}
            onClose={() => setSelectedBooking(null)}
            onUpdate={handleUpdate}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-6"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white border border-red-200 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
            >
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} className="text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-2">Delete Booking?</h3>
              <p className="text-stone-400 text-sm mb-6">This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteTarget(null)}
                  className="flex-1 py-3 rounded-2xl border border-stone-200 text-stone-500 hover:text-stone-900 transition-all font-semibold">
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
              className="text-amber-600 hover:text-amber-700 text-sm tracking-widest uppercase flex items-center gap-2 mb-4">
              <ArrowLeft size={18} /> Dashboard
            </Link>
            <h1 className="text-5xl md:text-7xl font-serif text-stone-900">Bookings</h1>
            <p className="text-stone-500 text-xl mt-4">Manage all customer bookings.</p>
          </div>
          <button onClick={fetchAll} className="cursor-pointer flex items-center gap-2 text-amber-600 hover:text-amber-700 transition-all">
            <RefreshCw size={18} /> Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-12">
          {statCards.map(({ icon, label, value, color }) => (
            <div key={label} className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm">
              <div className="text-stone-300 mb-2">{icon}</div>
              <p className="text-stone-400 text-[10px] uppercase tracking-[0.2em] mb-1">{label}</p>
              <p className={`text-3xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-5 items-start lg:items-center justify-between mb-8">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input
              type="text"
              placeholder="Search name, email, reference..."
              className="w-full bg-white border border-stone-200 rounded-2xl py-4 pl-12 pr-4 text-stone-900 outline-none focus:border-amber-400 transition-all placeholder-stone-300 shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            {/* Status filter */}
            <div className="flex gap-2 flex-wrap">
              {["all", ...STATUSES].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`cursor-pointer px-4 py-2 rounded-full border transition-all text-xs font-medium capitalize whitespace-nowrap ${
                    statusFilter === s
                      ? "bg-amber-500 border-amber-500 text-white"
                      : "bg-white border-stone-200 text-stone-500 hover:border-amber-400"
                  }`}
                >
                  {s === "all" ? "All Status" : s}
                </button>
              ))}
            </div>

            {/* Type filter */}
            <div className="flex gap-2">
              {["all", "destination", "package"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`cursor-pointer px-4 py-2 rounded-full border transition-all text-xs font-medium capitalize ${
                    typeFilter === t
                      ? "bg-stone-900 border-stone-900 text-white"
                      : "bg-white border-stone-200 text-stone-500 hover:border-amber-400"
                  }`}
                >
                  {t === "all" ? "All Types" : t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-24 text-amber-500">
              <Loader2 size={36} className="animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-24 text-center text-stone-300 italic">
              <FileText size={36} className="mx-auto mb-3 opacity-50" />
              No bookings found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[900px]">
                <thead className="bg-stone-50 text-stone-400 text-[10px] uppercase tracking-[0.2em]">
                  <tr>
                    <th className="px-6 py-5">Reference</th>
                    <th className="px-6 py-5">Guest</th>
                    <th className="px-6 py-5">Trip</th>
                    <th className="px-6 py-5">Departure</th>
                    <th className="px-6 py-5">Travelers</th>
                    <th className="px-6 py-5">Total</th>
                    <th className="px-6 py-5">Status</th>
                    <th className="px-6 py-5">Payment</th>
                    <th className="px-6 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  <AnimatePresence>
                    {filtered.map((booking, i) => {
                      const tripName = booking.bookingType === "destination"
                        ? booking.destination?.name
                        : booking.package?.title;
                      const tripImg = booking.bookingType === "destination"
                        ? (Array.isArray(booking.destination?.image) ? booking.destination?.image[0] : booking.destination?.image)
                        : booking.package?.images?.[0];

                      return (
                        <motion.tr
                          key={booking._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ delay: i * 0.03 }}
                          className="hover:bg-stone-50 transition-colors group"
                        >
                          <td className="px-6 py-4">
                            <span className="text-amber-600 font-mono text-sm font-bold">{booking.referenceCode}</span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-stone-900 text-sm font-semibold">{booking.firstName} {booking.lastName}</p>
                            <p className="text-stone-400 text-xs">{booking.email}</p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {tripImg ? (
                                <img src={tripImg} alt={tripName} className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                              ) : (
                                <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                                  {booking.bookingType === "destination" ? <MapPin size={14} className="text-amber-600" /> : <Package size={14} className="text-amber-600" />}
                                </div>
                              )}
                              <div>
                                <p className="text-stone-900 text-sm">{tripName || "—"}</p>
                                <p className="text-stone-400 text-xs capitalize">{booking.bookingType}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-stone-500 text-sm">
                            {new Date(booking.departureDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-stone-500 text-sm">
                            {booking.totalTravelers}
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-amber-600 font-bold text-sm">${booking.totalAmount?.toLocaleString()}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize border ${STATUS_COLORS[booking.status]}`}>
                              {booking.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-xs font-semibold capitalize ${PAYMENT_COLORS[booking.paymentStatus]}`}>
                              {booking.paymentStatus?.replace("_", " ")}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setSelectedBooking(booking)}
                                className="cursor-pointer p-2.5 text-stone-300 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                onClick={() => setDeleteTarget(booking._id)}
                                className="cursor-pointer p-2.5 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="text-stone-400 text-sm mt-4 text-right">
          Showing {filtered.length} of {bookings.length} bookings
        </p>
      </div>
    </motion.section>
  );
}
