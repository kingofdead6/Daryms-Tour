"use client";
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { API_BASE_URL } from "../../../api";
import {
  CheckCircle, Users, Calendar, Clock, Armchair,
  ArrowRight, ArrowLeft, Loader2, Mail, Phone, User, Utensils
} from "lucide-react";
import { toast } from "react-toastify";

const TIME_SLOTS = [
  "18:00", "18:30", "19:00", "19:30",
  "20:00", "20:30", "21:00", "21:30"
];

const stepVariants = {
  enter: { opacity: 0, x: 40, filter: "blur(8px)" },
  center: { opacity: 1, x: 0, filter: "blur(0px)" },
  exit: { opacity: 0, x: -40, filter: "blur(8px)" }
};

export default function Reservation() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [availableTables, setAvailableTables] = useState([]);
  const [success, setSuccess] = useState(false);
  const [direction, setDirection] = useState(1);

  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", guests: 2,
    date: "", time: "", tableId: ""
  });

  const goTo = (next) => {
    setDirection(next > step ? 1 : -1);
    setStep(next);
  };

  const fetchAvailableTables = useCallback(async () => {
    if (!formData.date || !formData.time || !formData.guests) return;
    setLoading(true);
    setAvailableTables([]);
    try {
      const res = await axios.get(`${API_BASE_URL}/tables/availability`, {
        params: { date: formData.date, time: formData.time, guests: formData.guests }
      });
      setAvailableTables(res.data);
    } catch {
      toast.error("Could not check availability");
    } finally {
      setLoading(false);
    }
  }, [formData.date, formData.time, formData.guests]);

  useEffect(() => {
    if (step === 3) fetchAvailableTables();
  }, [step, fetchAvailableTables]);

  const handleBooking = async () => {
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/reservations`, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        guests: formData.guests,
        date: formData.date,
        time: formData.time,
        table: formData.tableId
      });
      setSuccess(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Reservation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];
  const maxDate = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0];

  if (success) return (
    <div className="min-h-screen bg-[#faf7f4]  flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 22 }}
        className="text-center max-w-md "
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
          className="w-24 h-24 bg-amber-50 border-2 border-amber-200 rounded-full flex items-center justify-center mx-auto mb-8"
        >
          <CheckCircle className="w-12 h-12 text-amber-700" strokeWidth={1.5} />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="font-serif text-5xl italic text-[#1a1210] mb-4"
        >
          Request Received
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-3"
        >
          <p className="text-stone-500 leading-relaxed">
            Your table is held for <strong className="text-amber-800">60 minutes</strong>.
          </p>
          <p className="text-stone-400 text-sm leading-relaxed">
            Our team will call you at <span className="text-stone-600 font-medium">{formData.phone}</span> to confirm. If we don't reach you within the hour, the reservation will be automatically released.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-8 p-4 bg-amber-50 rounded-2xl border border-amber-100"
        >
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-amber-700 font-bold block mb-1">Date</span>
              <span className="text-stone-700 font-medium text-sm">{formData.date}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest text-amber-700 font-bold block mb-1">Time</span>
              <span className="text-stone-700 font-medium text-sm">{formData.time}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest text-amber-700 font-bold block mb-1">Guests</span>
              <span className="text-stone-700 font-medium text-sm">{formData.guests}</span>
            </div>
          </div>
        </motion.div>
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          onClick={() => { setSuccess(false); setStep(1); setFormData({ name: "", email: "", phone: "", guests: 2, date: "", time: "", tableId: "" }); }}
          className="mt-8 text-amber-800 text-xs uppercase tracking-[0.25em] font-bold hover:text-amber-600 transition-colors"
        >
          Make another reservation
        </motion.button>
      </motion.div>
    </div>
  );

  return (
    <div className="bg-[#faf7f4] min-h-screen py-30 px-6 font-sans text-[#2d2a26]">
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-14"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-12 bg-amber-300" />
            <Utensils size={14} className="text-amber-700" />
            <div className="h-px w-12 bg-amber-300" />
          </div>
          <span className="text-amber-800 uppercase tracking-[0.35em] text-[10px] font-bold">Reserve Your Evening</span>
          <h1 className="text-5xl md:text-6xl font-serif italic mt-2 text-[#1a1210]">Book a Table</h1>
          <p className="text-stone-400 text-sm mt-3 font-light">Available for the upcoming 7 days only</p>
        </motion.header>

        {/* Progress Steps */}
        <div className="flex items-center gap-2 mb-12">
          {["Your Details", "Date & Time", "Choose Table"].map((label, i) => {
            const num = i + 1;
            const active = step === num;
            const done = step > num;
            return (
              <React.Fragment key={label}>
                <div className="flex items-center gap-2 flex-1">
                  <motion.div
                    animate={{ scale: active ? 1.1 : 1 }}
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 flex-shrink-0 transition-all duration-500 ${
                      done ? 'bg-amber-700 border-amber-700 text-white' :
                      active ? 'bg-white border-amber-700 text-amber-700 shadow-md' :
                      'bg-transparent border-stone-200 text-stone-300'
                    }`}
                  >
                    {done ? '✓' : num}
                  </motion.div>
                  <span className={`text-[10px] uppercase tracking-wider font-bold transition-colors duration-300 hidden sm:block ${
                    active ? 'text-amber-800' : done ? 'text-stone-400' : 'text-stone-300'
                  }`}>{label}</span>
                </div>
                {i < 2 && <div className={`h-px flex-1 transition-all duration-700 ${done ? 'bg-amber-700' : 'bg-stone-200'}`} />}
              </React.Fragment>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            {/* STEP 1 */}
            {step === 1 && (
              <motion.div
                key="step1"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-5"
              >
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-100 space-y-5">
                  <Field icon={<User size={16} />} label="Full Name">
                    <input
                      className="w-full outline-none bg-transparent text-[#1a1210] placeholder:text-stone-300"
                      placeholder="Jean Dupont"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                  </Field>
                  <div className="h-px bg-stone-50" />
                  <Field icon={<Phone size={16} />} label="Phone Number">
                    <input
                      className="w-full outline-none bg-transparent text-[#1a1210] placeholder:text-stone-300"
                      placeholder="+213 555 000 000"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </Field>
                  <div className="h-px bg-stone-50" />
                  <Field icon={<Mail size={16} />} label="Email Address">
                    <input
                      type="email"
                      className="w-full outline-none bg-transparent text-[#1a1210] placeholder:text-stone-300"
                      placeholder="you@email.com"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                  </Field>
                  <div className="h-px bg-stone-50" />
                  <Field icon={<Users size={16} />} label="Number of Guests">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setFormData(f => ({ ...f, guests: Math.max(1, f.guests - 1) }))}
                        className="w-8 h-8 rounded-full border-2 border-stone-200 flex items-center justify-center text-stone-500 hover:border-amber-700 hover:text-amber-700 transition-all font-bold"
                      >−</button>
                      <span className="text-2xl font-serif w-6 text-center text-[#1a1210]">{formData.guests}</span>
                      <button
                        onClick={() => setFormData(f => ({ ...f, guests: Math.min(12, f.guests + 1) }))}
                        className="w-8 h-8 rounded-full border-2 border-stone-200 flex items-center justify-center text-stone-500 hover:border-amber-700 hover:text-amber-700 transition-all font-bold"
                      >+</button>
                    </div>
                  </Field>
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  disabled={!formData.name || !formData.phone || !formData.email}
                  onClick={() => goTo(2)}
                  className="w-full bg-[#1a1210] text-white py-5 rounded-2xl uppercase tracking-[0.2em] font-bold text-sm shadow-lg shadow-stone-200 disabled:opacity-40 flex items-center justify-center gap-3 transition-all hover:bg-amber-900"
                >
                  Choose Date & Time <ArrowRight size={16} />
                </motion.button>
              </motion.div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <motion.div
                key="step2"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-6"
              >
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-100 space-y-6">
                  <div>
                    <label className="text-[10px] uppercase tracking-[0.3em] text-amber-800 font-bold flex items-center gap-2 mb-3">
                      <Calendar size={12} /> Select Date
                    </label>
                    <input
                      type="date"
                      min={today}
                      max={maxDate}
                      className="w-full p-4 rounded-2xl border border-stone-100 bg-stone-50 font-serif text-lg text-[#1a1210] outline-none focus:border-amber-300 focus:bg-white transition-all"
                      value={formData.date}
                      onChange={e => setFormData({ ...formData, date: e.target.value, time: "", tableId: "" })}
                    />
                  </div>

                  <AnimatePresence>
                    {formData.date && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <label className="text-[10px] uppercase tracking-[0.3em] text-amber-800 font-bold flex items-center gap-2 mb-3">
                          <Clock size={12} /> Available Time Slots
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                          {TIME_SLOTS.map((t, idx) => (
                            <motion.button
                              key={t}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.04 }}
                              onClick={() => {
                                setFormData({ ...formData, time: t, tableId: "" });
                                setTimeout(() => goTo(3), 250);
                              }}
                              className={`py-3 rounded-xl text-xs font-bold tracking-wider transition-all duration-300 ${
                                formData.time === t
                                  ? 'bg-amber-700 text-white shadow-md scale-105'
                                  : 'bg-stone-50 text-stone-500 hover:bg-amber-50 hover:text-amber-800 border border-stone-100'
                              }`}
                            >
                              {t}
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button onClick={() => goTo(1)} className="w-full text-stone-400 text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 hover:text-stone-600 transition-colors">
                  <ArrowLeft size={14} /> Back
                </button>
              </motion.div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <motion.div
                key="step3"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-6"
              >
                {/* Booking summary pill */}
                <div className="flex items-center justify-center gap-3 text-[10px] uppercase tracking-widest">
                  <span className="bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full font-bold">{formData.date}</span>
                  <span className="text-stone-300">•</span>
                  <span className="bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full font-bold">{formData.time}</span>
                  <span className="text-stone-300">•</span>
                  <span className="bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full font-bold">{formData.guests} guests</span>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100 min-h-[200px]">
                  <label className="text-[10px] uppercase tracking-[0.3em] text-amber-800 font-bold flex items-center gap-2 mb-5">
                    <Armchair size={12} /> Available Tables
                  </label>

                  {loading ? (
                    <div className="flex flex-col items-center py-10 text-stone-300">
                      <Loader2 className="animate-spin mb-3" size={24} />
                      <span className="text-xs uppercase tracking-widest">Checking floor plan...</span>
                    </div>
                  ) : availableTables.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {availableTables.map((table, idx) => (
                        <motion.button
                          key={table._id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.07 }}
                          onClick={() => setFormData({ ...formData, tableId: table._id })}
                          className={`p-5 rounded-2xl border-2 flex flex-col items-center gap-2.5 transition-all duration-300 ${
                            formData.tableId === table._id
                              ? 'border-amber-700 bg-amber-50 shadow-lg scale-[1.03]'
                              : 'border-stone-100 bg-white hover:border-amber-200 hover:bg-amber-50/30'
                          }`}
                        >
                          <Armchair
                            size={22}
                            className={formData.tableId === table._id ? 'text-amber-700' : 'text-stone-200'}
                            strokeWidth={1.5}
                          />
                          <span className="font-bold text-[#1a1210] text-sm">Table {table.number}</span>
                          <span className="text-[10px] uppercase tracking-tighter text-stone-400">
                            Up to {table.capacity} guests
                          </span>
                          {formData.tableId === table._id && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="text-[9px] bg-amber-700 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
                            >
                              Selected
                            </motion.span>
                          )}
                        </motion.button>
                      ))}
                    </div>
                  ) : (
                    <div className="py-10 text-center border-2 border-dashed border-stone-100 rounded-2xl">
                      <p className="text-stone-400 italic text-sm">No tables available for this slot.</p>
                      <button onClick={() => goTo(2)} className="mt-3 text-amber-700 text-xs uppercase tracking-widest font-bold hover:underline">
                        Try a different time
                      </button>
                    </div>
                  )}
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleBooking}
                  disabled={!formData.tableId || loading}
                  className="w-full bg-amber-800 hover:bg-amber-700 text-white py-5 rounded-2xl font-bold uppercase tracking-[0.2em] text-sm shadow-lg shadow-amber-100 disabled:opacity-30 transition-all flex items-center justify-center gap-3"
                >
                  {loading ? <><Loader2 size={16} className="animate-spin" /> Holding your table...</> : "Complete Reservation"}
                </motion.button>

                <button onClick={() => goTo(2)} className="w-full text-stone-400 text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 hover:text-stone-600 transition-colors">
                  <ArrowLeft size={14} /> Change Time
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function Field({ icon, label, children }) {
  return (
    <div className="flex items-center gap-4">
      <div className="text-amber-700 flex-shrink-0">{icon}</div>
      <div className="flex-1">
        <span className="text-[9px] uppercase tracking-[0.25em] text-stone-300 font-bold block mb-1">{label}</span>
        {children}
      </div>
    </div>
  );
}