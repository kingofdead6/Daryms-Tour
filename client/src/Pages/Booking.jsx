"use client";

import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Package, Clock, Users, Star, ChevronRight, ArrowLeft,
  Loader2, CheckCircle, User, Mail, Phone, Globe, CreditCard,
  Shield, Calendar, Info, Search, X
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../api";

const STEPS = ["Select Trip", "Your Details", "Review & Pay"];
const ROOM_TYPES = ["Standard", "Deluxe", "Suite", "Family Room"];
const PAYMENT_METHODS = [
//   { id: "credit_card", label: "Credit / Debit Card", icon: "💳" },
//   { id: "bank_transfer", label: "Bank Transfer", icon: "🏦" },
//   { id: "paypal", label: "PayPal", icon: "🔵" },
  { id: "cash", label: "Cash on Arrival", icon: "💵" },
];

export default function Booking() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(null);

  // Pre-filled from URL params
  const urlType = searchParams.get("type"); // "destination" | "package"
  const urlId = searchParams.get("id");
  const urlPrice = searchParams.get("price");
  const urlTitle = searchParams.get("title");
  const urlDate = searchParams.get("date");
  const urlTravelers = searchParams.get("travelers");

  // ─── Available items for selection ───────────────────────────────────────
  const [destinations, setDestinations] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [tripSearch, setTripSearch] = useState("");
  const [tripTab, setTripTab] = useState(urlType || "destination");

  // ─── Selected trip ────────────────────────────────────────────────────────
  const [selectedItem, setSelectedItem] = useState(null);
  const [bookingType, setBookingType] = useState(urlType || "destination");

  // ─── Form state ───────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    nationality: "",
    passportNumber: "",
    departureDate: urlDate || "",
    returnDate: "",
    adults: Number(urlTravelers) || 1,
    children: 0,
    infants: 0,
    roomType: "Standard",
    specialRequests: "",
    dietaryRequirements: "",
    paymentMethod: "credit_card",
  });

  // Load destinations and packages
  useEffect(() => {
    Promise.all([
      axios.get(`${API_BASE_URL}/destinations`),
      axios.get(`${API_BASE_URL}/packages`),
    ])
      .then(([destRes, pkgRes]) => {
        setDestinations(destRes.data);
        setPackages(pkgRes.data);
        // Auto-select from URL params
        if (urlId && urlType) {
          const items = urlType === "destination" ? destRes.data : pkgRes.data;
          const found = items.find((i) => i._id === urlId);
          if (found) { setSelectedItem(found); setBookingType(urlType); setStep(1); }
        }
      })
      .catch(() => toast.error("Failed to load trips"))
      .finally(() => setLoadingItems(false));
  }, []);

  const setField = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const pricePerPerson = selectedItem
    ? (bookingType === "destination" ? selectedItem.price : selectedItem.price)
    : 0;
  const totalTravelers = form.adults + form.children;
  const subtotal = pricePerPerson * totalTravelers;
  const taxes = Math.round(subtotal * 0.05);
  const total = subtotal + taxes;

  const tripName = selectedItem
    ? (bookingType === "destination" ? selectedItem.name : selectedItem.title)
    : "";

  const tripImage = selectedItem
    ? (bookingType === "destination"
        ? (Array.isArray(selectedItem.image) ? selectedItem.image[0] : selectedItem.image)
        : selectedItem.images?.[0])
    : null;

  // Filtered trips for step 0
  const filteredTrips = (tripTab === "destination" ? destinations : packages).filter((item) => {
    const name = tripTab === "destination" ? item.name : item.title;
    return name.toLowerCase().includes(tripSearch.toLowerCase());
  });

  const handleSelectTrip = (item, type) => {
    setSelectedItem(item);
    setBookingType(type);
    setStep(1);
  };

  const handleSubmit = async () => {
    if (!selectedItem) return toast.error("Please select a trip");
    if (!form.firstName || !form.lastName || !form.email || !form.phone) {
      return toast.error("Please fill in all required fields");
    }
    if (!form.departureDate) return toast.error("Please select a departure date");

    setSubmitting(true);
    try {
      const payload = {
        bookingType,
        ...(bookingType === "destination" ? { destination: selectedItem._id } : { package: selectedItem._id }),
        ...form,
        pricePerPerson,
      };

      const res = await axios.post(`${API_BASE_URL}/bookings`, payload);
      setConfirmed(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Booking failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── CONFIRMED STATE ───────────────────────────────────────────────────────
  if (confirmed) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl p-10 max-w-lg w-full text-center shadow-2xl border border-slate-100"
        >
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-emerald-500" />
          </div>
          <h2 className="text-3xl font-bold text-[#0F172A] mb-2">Booking Confirmed!</h2>
          <p className="text-[#475569] mb-6">
            Your booking has been received. We'll contact you at <strong>{confirmed.email}</strong> shortly.
          </p>
          <div className="bg-[#F8FAFC] rounded-2xl p-5 mb-6 text-left space-y-3">
            <div className="flex justify-between">
              <span className="text-[#475569] text-sm">Reference Code</span>
              <span className="font-bold text-[#0F172A] font-mono tracking-wider">{confirmed.referenceCode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#475569] text-sm">Trip</span>
              <span className="font-semibold text-[#0F172A] text-right text-sm max-w-[60%]">{tripName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#475569] text-sm">Departure</span>
              <span className="font-semibold text-[#0F172A]">{new Date(confirmed.departureDate).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#475569] text-sm">Travelers</span>
              <span className="font-semibold text-[#0F172A]">{confirmed.totalTravelers}</span>
            </div>
            <div className="flex justify-between border-t pt-3">
              <span className="font-bold text-[#0F172A]">Total</span>
              <span className="text-xl font-bold text-[#FF6B35]">${confirmed.totalAmount?.toLocaleString()}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/")}
              className="cursor-pointer flex-1 py-3 border border-slate-200 rounded-xl text-[#475569] font-semibold hover:bg-slate-50 transition-all"
            >
              Back to Home
            </button>
            <button
              onClick={() => navigate("/destinations")}
              className="cursor-pointer flex-1 py-3 bg-[#1E88E5] text-white rounded-xl font-semibold hover:bg-[#1565C0] transition-all"
            >
              Explore More
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-24 pb-20 px-6">
      <div className="max-w-6xl mx-auto">

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="cursor-pointer flex items-center gap-2 text-[#475569] hover:text-[#0F172A] mb-8 font-semibold transition-colors"
        >
          <ArrowLeft size={18} /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT: MAIN FORM */}
          <div className="lg:col-span-2">

            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-8">
              {STEPS.map((s, i) => (
                <React.Fragment key={s}>
                  <button
                    onClick={() => i < step && setStep(i)}
                    className={`flex items-center gap-2 text-sm font-semibold transition-all ${
                      i === step ? "text-[#1E88E5]" : i < step ? "text-emerald-500 cursor-pointer" : "text-slate-300"
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      i === step ? "bg-[#1E88E5] text-white" : i < step ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-400"
                    }`}>
                      {i < step ? <CheckCircle size={14} /> : i + 1}
                    </div>
                    <span className="hidden sm:block">{s}</span>
                  </button>
                  {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 ${i < step ? "bg-emerald-500" : "bg-slate-200"}`} />}
                </React.Fragment>
              ))}
            </div>

            {/* ─── STEP 0: SELECT TRIP ─────────────────────────────── */}
            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 className="text-2xl font-bold text-[#0F172A] mb-6">Choose Your Trip</h2>

                  {/* Tabs */}
                  <div className="flex gap-1 bg-[#F1F5F9] p-1 rounded-2xl mb-6 w-fit">
                    {["destination", "package"].map((t) => (
                      <button
                        key={t}
                        onClick={() => setTripTab(t)}
                        className={`cursor-pointer flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all capitalize ${
                          tripTab === t ? "bg-white text-[#0F172A] shadow-sm" : "text-[#475569] hover:text-[#0F172A]"
                        }`}
                      >
                        {t === "destination" ? <MapPin size={15} /> : <Package size={15} />}
                        {t === "destination" ? "Destinations" : "Packages"}
                      </button>
                    ))}
                  </div>

                  {/* Search */}
                  <div className="relative mb-5">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      placeholder={`Search ${tripTab}s...`}
                      className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-slate-200 outline-none focus:ring-2 ring-[#1E88E5]/20"
                      value={tripSearch}
                      onChange={(e) => setTripSearch(e.target.value)}
                    />
                  </div>

                  {loadingItems ? (
                    <div className="flex items-center justify-center h-48">
                      <Loader2 size={30} className="animate-spin text-[#1E88E5]" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-1">
                      {filteredTrips.map((item) => {
                        const img = tripTab === "destination"
                          ? (Array.isArray(item.image) ? item.image[0] : item.image)
                          : item.images?.[0];
                        const name = tripTab === "destination" ? item.name : item.title;
                        const sub = tripTab === "destination"
                          ? `${item.country}, ${item.continent}`
                          : `${item.duration} · ${item.category}`;
                        return (
                          <motion.div
                            key={item._id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleSelectTrip(item, tripTab)}
                            className={`cursor-pointer bg-white rounded-2xl overflow-hidden border-2 transition-all ${
                              selectedItem?._id === item._id ? "border-[#1E88E5] shadow-md" : "border-slate-100 hover:border-slate-300"
                            }`}
                          >
                            <div className="relative h-36 overflow-hidden">
                              <img src={img} alt={name} className="w-full h-full object-cover" />
                              {selectedItem?._id === item._id && (
                                <div className="absolute inset-0 bg-[#1E88E5]/20 flex items-center justify-center">
                                  <div className="bg-[#1E88E5] rounded-full p-1.5">
                                    <CheckCircle size={20} className="text-white" />
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="p-4">
                              <p className="font-bold text-[#0F172A] text-sm leading-tight">{name}</p>
                              <p className="text-xs text-[#475569] mt-0.5">{sub}</p>
                              <p className="text-[#FF6B35] font-bold mt-2">${item.price.toLocaleString()}<span className="text-xs text-[#475569] font-normal">/person</span></p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}

                  <button
                    disabled={!selectedItem}
                    onClick={() => setStep(1)}
                    className="cursor-pointer mt-6 w-full py-4 bg-[#1E88E5] text-white font-bold rounded-xl hover:bg-[#1565C0] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    Continue <ChevronRight size={18} />
                  </button>
                </motion.div>
              )}

              {/* ─── STEP 1: PERSONAL DETAILS ──────────────────────── */}
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 className="text-2xl font-bold text-[#0F172A] mb-6">Traveler Details</h2>

                  <div className="space-y-6">
                    {/* Name */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold uppercase text-[#475569] mb-1.5 block">First Name *</label>
                        <div className="relative">
                          <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text" placeholder="John"
                            value={form.firstName} onChange={(e) => setField("firstName", e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-[#F8FAFC] rounded-xl border border-slate-200 outline-none focus:ring-2 ring-[#1E88E5]/20"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase text-[#475569] mb-1.5 block">Last Name *</label>
                        <input
                          type="text" placeholder="Doe"
                          value={form.lastName} onChange={(e) => setField("lastName", e.target.value)}
                          className="w-full px-4 py-3 bg-[#F8FAFC] rounded-xl border border-slate-200 outline-none focus:ring-2 ring-[#1E88E5]/20"
                        />
                      </div>
                    </div>

                    {/* Contact */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold uppercase text-[#475569] mb-1.5 block">Email *</label>
                        <div className="relative">
                          <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="email" placeholder="john@example.com"
                            value={form.email} onChange={(e) => setField("email", e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-[#F8FAFC] rounded-xl border border-slate-200 outline-none focus:ring-2 ring-[#1E88E5]/20"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase text-[#475569] mb-1.5 block">Phone *</label>
                        <div className="relative">
                          <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="tel" placeholder="+1 234 567 8900"
                            value={form.phone} onChange={(e) => setField("phone", e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-[#F8FAFC] rounded-xl border border-slate-200 outline-none focus:ring-2 ring-[#1E88E5]/20"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Passport */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold uppercase text-[#475569] mb-1.5 block">Nationality</label>
                        <div className="relative">
                          <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text" placeholder="American"
                            value={form.nationality} onChange={(e) => setField("nationality", e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-[#F8FAFC] rounded-xl border border-slate-200 outline-none focus:ring-2 ring-[#1E88E5]/20"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase text-[#475569] mb-1.5 block">Passport Number</label>
                        <input
                          type="text" placeholder="AB1234567"
                          value={form.passportNumber} onChange={(e) => setField("passportNumber", e.target.value)}
                          className="w-full px-4 py-3 bg-[#F8FAFC] rounded-xl border border-slate-200 outline-none focus:ring-2 ring-[#1E88E5]/20"
                        />
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold uppercase text-[#475569] mb-1.5 block">Departure Date *</label>
                        <div className="relative">
                          <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="date"
                            value={form.departureDate} onChange={(e) => setField("departureDate", e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-[#F8FAFC] rounded-xl border border-slate-200 outline-none focus:ring-2 ring-[#1E88E5]/20"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase text-[#475569] mb-1.5 block">Return Date</label>
                        <input
                          type="date"
                          value={form.returnDate} onChange={(e) => setField("returnDate", e.target.value)}
                          className="w-full px-4 py-3 bg-[#F8FAFC] rounded-xl border border-slate-200 outline-none focus:ring-2 ring-[#1E88E5]/20"
                        />
                      </div>
                    </div>

                    {/* Travelers */}
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { key: "adults", label: "Adults (12+)", min: 1 },
                        { key: "children", label: "Children (2-11)", min: 0 },
                        { key: "infants", label: "Infants (0-2)", min: 0 },
                      ].map(({ key, label, min }) => (
                        <div key={key}>
                          <label className="text-xs font-bold uppercase text-[#475569] mb-1.5 block">{label}</label>
                          <input
                            type="number" min={min}
                            value={form[key]}
                            onChange={(e) => setField(key, Math.max(min, Number(e.target.value)))}
                            className="w-full px-4 py-3 bg-[#F8FAFC] rounded-xl border border-slate-200 outline-none focus:ring-2 ring-[#1E88E5]/20"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Room type */}
                    <div>
                      <label className="text-xs font-bold uppercase text-[#475569] mb-1.5 block">Room Type</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {ROOM_TYPES.map((r) => (
                          <button
                            key={r}
                            onClick={() => setField("roomType", r)}
                            className={`cursor-pointer py-3 rounded-xl border text-sm font-semibold transition-all ${
                              form.roomType === r ? "bg-[#1E88E5] text-white border-[#1E88E5]" : "bg-white text-[#475569] border-slate-200 hover:border-[#1E88E5]"
                            }`}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Special requests */}
                    <div>
                      <label className="text-xs font-bold uppercase text-[#475569] mb-1.5 block">Special Requests</label>
                      <textarea
                        rows={3} placeholder="Any special requirements, accessibility needs, etc."
                        value={form.specialRequests} onChange={(e) => setField("specialRequests", e.target.value)}
                        className="w-full px-4 py-3 bg-[#F8FAFC] rounded-xl border border-slate-200 outline-none focus:ring-2 ring-[#1E88E5]/20 resize-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase text-[#475569] mb-1.5 block">Dietary Requirements</label>
                      <input
                        type="text" placeholder="Vegetarian, vegan, halal, kosher, allergies..."
                        value={form.dietaryRequirements} onChange={(e) => setField("dietaryRequirements", e.target.value)}
                        className="w-full px-4 py-3 bg-[#F8FAFC] rounded-xl border border-slate-200 outline-none focus:ring-2 ring-[#1E88E5]/20"
                      />
                    </div>

                    {/* Payment */}
                    <div>
                      <label className="text-xs font-bold uppercase text-[#475569] mb-3 block">Payment Method</label>
                      <div className="grid grid-cols-2 gap-3">
                        {PAYMENT_METHODS.map(({ id, label, icon }) => (
                          <button
                            key={id}
                            onClick={() => setField("paymentMethod", id)}
                            className={`cursor-pointer flex items-center gap-3 p-4 rounded-xl border text-sm font-semibold transition-all text-left ${
                              form.paymentMethod === id ? "bg-[#1E88E5]/5 border-[#1E88E5] text-[#1E88E5]" : "bg-white border-slate-200 text-[#475569] hover:border-slate-300"
                            }`}
                          >
                            <span className="text-xl">{icon}</span>
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-8">
                    <button
                      onClick={() => setStep(0)}
                      className="cursor-pointer px-6 py-4 border border-slate-200 rounded-xl text-[#475569] font-semibold hover:bg-slate-50 transition-all"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => {
                        if (!form.firstName || !form.lastName || !form.email || !form.phone || !form.departureDate) {
                          return toast.error("Please fill in all required fields");
                        }
                        setStep(2);
                      }}
                      className="cursor-pointer flex-1 py-4 bg-[#1E88E5] text-white font-bold rounded-xl hover:bg-[#1565C0] transition-all flex items-center justify-center gap-2"
                    >
                      Review Booking <ChevronRight size={18} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ─── STEP 2: REVIEW ─────────────────────────────────── */}
              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 className="text-2xl font-bold text-[#0F172A] mb-6">Review Your Booking</h2>

                  <div className="space-y-6">
                    {/* Trip summary */}
                    <div className="bg-[#F8FAFC] rounded-2xl p-5 border border-slate-100">
                      <h3 className="font-bold text-[#0F172A] mb-3 text-sm uppercase tracking-wide">Trip Selected</h3>
                      <div className="flex items-center gap-4">
                        {tripImage && (
                          <img src={tripImage} alt={tripName} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                        )}
                        <div>
                          <p className="font-bold text-[#0F172A]">{tripName}</p>
                          <p className="text-sm text-[#475569] capitalize">{bookingType}</p>
                          <p className="text-[#FF6B35] font-bold">${pricePerPerson.toLocaleString()}/person</p>
                        </div>
                      </div>
                    </div>

                    {/* Guest info */}
                    <div className="bg-[#F8FAFC] rounded-2xl p-5 border border-slate-100">
                      <h3 className="font-bold text-[#0F172A] mb-3 text-sm uppercase tracking-wide">Guest Information</h3>
                      <div className="grid grid-cols-2 gap-y-2 text-sm">
                        {[
                          ["Name", `${form.firstName} ${form.lastName}`],
                          ["Email", form.email],
                          ["Phone", form.phone],
                          ["Nationality", form.nationality || "—"],
                          ["Departure", form.departureDate ? new Date(form.departureDate).toLocaleDateString() : "—"],
                          ["Return", form.returnDate ? new Date(form.returnDate).toLocaleDateString() : "—"],
                          ["Adults", form.adults],
                          ["Children", form.children],
                          ["Room Type", form.roomType],
                          ["Payment", PAYMENT_METHODS.find(p => p.id === form.paymentMethod)?.label],
                        ].map(([label, value]) => (
                          <React.Fragment key={label}>
                            <span className="text-[#475569]">{label}</span>
                            <span className="font-semibold text-[#0F172A]">{value}</span>
                          </React.Fragment>
                        ))}
                      </div>
                    </div>

                    {/* Price breakdown */}
                    <div className="bg-[#F8FAFC] rounded-2xl p-5 border border-slate-100">
                      <h3 className="font-bold text-[#0F172A] mb-3 text-sm uppercase tracking-wide">Price Breakdown</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-[#475569]">
                          <span>${pricePerPerson.toLocaleString()} × {totalTravelers} traveler{totalTravelers > 1 ? "s" : ""}</span>
                          <span>${subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-[#475569]">
                          <span>Taxes & fees (5%)</span>
                          <span>${taxes.toLocaleString()}</span>
                        </div>
                        <div className="border-t border-slate-200 pt-2 flex justify-between">
                          <span className="font-bold text-[#0F172A] text-base">Total</span>
                          <span className="text-2xl font-bold text-[#FF6B35]">${total.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Policy */}
                    <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100 text-sm text-[#475569]">
                      <Info size={16} className="text-[#1E88E5] mt-0.5 flex-shrink-0" />
                      <p>By confirming, you agree to our booking terms. Free cancellation is available up to 48 hours before departure. No payment is charged at this step.</p>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-8">
                    <button
                      onClick={() => setStep(1)}
                      className="cursor-pointer px-6 py-4 border border-slate-200 rounded-xl text-[#475569] font-semibold hover:bg-slate-50 transition-all"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="cursor-pointer flex-1 py-4 bg-[#FF6B35] text-white font-bold rounded-xl hover:bg-[#e85a24] transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-orange-200/60"
                    >
                      {submitting ? <><Loader2 size={18} className="animate-spin" /> Processing...</> : "Confirm Booking"}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT: ORDER SUMMARY SIDEBAR */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-5">
              {selectedItem && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-lg"
                >
                  <div className="relative h-44 overflow-hidden">
                    {tripImage ? (
                      <img src={tripImage} alt={tripName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                        <MapPin size={30} className="text-slate-300" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <p className="font-bold">{tripName}</p>
                      <p className="text-xs text-white/70 capitalize">{bookingType}</p>
                    </div>
                    <button
                      onClick={() => { setSelectedItem(null); setStep(0); }}
                      className="cursor-pointer absolute top-3 right-3 bg-black/40 text-white p-1.5 rounded-full hover:bg-black/60 transition-all"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <div className="p-5">
                    <div className="space-y-2 text-sm text-[#475569]">
                      <div className="flex justify-between">
                        <span>Price/person</span>
                        <span className="font-semibold text-[#0F172A]">${pricePerPerson.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Travelers</span>
                        <span className="font-semibold text-[#0F172A]">{totalTravelers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span className="font-semibold text-[#0F172A]">${subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Taxes (5%)</span>
                        <span className="font-semibold text-[#0F172A]">${taxes.toLocaleString()}</span>
                      </div>
                      <div className="border-t border-slate-200 pt-2 flex justify-between">
                        <span className="font-bold text-[#0F172A]">Total</span>
                        <span className="text-xl font-bold text-[#FF6B35]">${total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Trust badges */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
                {[
                  { icon: <Shield size={16} className="text-emerald-500" />, text: "Secure booking — no payment now" },
                  { icon: <CheckCircle size={16} className="text-[#1E88E5]" />, text: "Free cancellation 48h before" },
                  { icon: <Star size={16} className="text-yellow-400 fill-yellow-400" />, text: "Trusted by 50,000+ travelers" },
                ].map(({ icon, text }) => (
                  <div key={text} className="flex items-center gap-3 text-sm text-[#475569]">
                    {icon}
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}