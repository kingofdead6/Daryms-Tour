"use client";

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Clock, Users, Star, CheckCircle, XCircle, ArrowLeft, Loader2, MapPin,
  ChevronLeft, ChevronRight, Tag, Globe, Calendar, Flame, Shield,
  Phone, Zap
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../../api";

const difficultyColors = {
  Easy: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Moderate: "bg-blue-100 text-blue-700 border-blue-200",
  Challenging: "bg-orange-100 text-orange-700 border-orange-200",
  Expert: "bg-red-100 text-red-700 border-red-200",
};

export default function PackageDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [travelers, setTravelers] = useState(1);
  const [date, setDate] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/packages/${id}`)
      .then((res) => setPkg(res.data))
      .catch(() => { toast.error("Package not found"); navigate("/packages"); })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 size={40} className="animate-spin text-[#1E88E5]" />
      </div>
    );
  }

  if (!pkg) return null;

  const images = pkg.images?.length > 0 ? pkg.images : ["https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800"];
  const totalCost = pkg.price * travelers;
  const taxes = Math.round(totalCost * 0.05);
  const discount = pkg.originalPrice && pkg.originalPrice > pkg.price
    ? Math.round((1 - pkg.price / pkg.originalPrice) * 100)
    : 0;

  const tabs = ["overview", "itinerary", "includes", "destinations"];

  return (
    <div className="min-h-screen bg-white">

      {/* HERO */}
      <section className="relative h-[75vh] w-full overflow-hidden">
        <motion.img
          key={currentSlide}
          src={images[currentSlide]}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 w-full h-full object-cover"
          alt={pkg.title}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Slider controls */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => setCurrentSlide((p) => (p - 1 + images.length) % images.length)}
              className="cursor-pointer absolute left-6 top-1/2 -translate-y-1/2 bg-black/40 backdrop-blur text-white p-3 rounded-full hover:bg-black/60 transition-all"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              onClick={() => setCurrentSlide((p) => (p + 1) % images.length)}
              className="cursor-pointer absolute right-6 top-1/2 -translate-y-1/2 bg-black/40 backdrop-blur text-white p-3 rounded-full hover:bg-black/60 transition-all"
            >
              <ChevronRight size={22} />
            </button>
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${i === currentSlide ? "bg-white" : "bg-white/40"}`}
                />
              ))}
            </div>
          </>
        )}

        <button
          onClick={() => navigate("/packages")}
          className="cursor-pointer absolute top-8 left-8 flex items-center gap-2 text-white/80 hover:text-white bg-black/20 backdrop-blur px-4 py-2 rounded-full text-sm font-semibold"
        >
          <ArrowLeft size={16} /> All Packages
        </button>

        <div className="absolute bottom-10 left-10 text-white max-w-3xl">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
            <div className="flex gap-2 flex-wrap mb-4">
              <span className="px-3 py-1 bg-[#1E88E5] text-white rounded-full text-xs font-bold">{pkg.category}</span>
              {pkg.isPopular && (
                <span className="flex items-center gap-1 px-3 py-1 bg-[#FF6B35] text-white rounded-full text-xs font-bold">
                  <Flame size={10} /> Popular
                </span>
              )}
              {discount > 0 && (
                <span className="px-3 py-1 bg-red-500 text-white rounded-full text-xs font-bold">{discount}% OFF</span>
              )}
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-2">{pkg.title}</h1>
            {pkg.subtitle && <p className="text-white/70 text-lg mb-4">{pkg.subtitle}</p>}

            <div className="flex gap-4 items-center flex-wrap text-sm">
              <div className="flex items-center gap-1">
                <Star size={15} className="fill-yellow-400 text-yellow-400" />
                <span className="font-bold">{pkg.rating}</span>
                <span className="text-white/60">({pkg.reviewsCount} reviews)</span>
              </div>
              <span className="flex items-center gap-1 text-white/80"><Clock size={14} />{pkg.duration}</span>
              <span className="flex items-center gap-1 text-white/80"><Users size={14} />Up to {pkg.maxGroupSize}</span>
              {pkg.departureCity && (
                <span className="flex items-center gap-1 text-white/80"><MapPin size={14} />From {pkg.departureCity}</span>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* STICKY TABS */}
      <div className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`cursor-pointer px-6 py-4 text-sm font-semibold capitalize transition-all border-b-2 ${
                activeTab === tab
                  ? "border-[#1E88E5] text-[#1E88E5]"
                  : "border-transparent text-[#475569] hover:text-[#0F172A]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <section className="py-12 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* MAIN */}
          <div className="lg:col-span-2 space-y-12">

            {/* Overview */}
            {activeTab === "overview" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-2xl font-bold text-[#0F172A] mb-4">About This Package</h2>
                <p className="text-[#475569] leading-relaxed text-lg mb-8">
                  {pkg.description || "An unforgettable travel experience awaits you with this carefully curated package."}
                </p>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {[
                    { icon: <Clock className="text-[#1E88E5]" size={20} />, label: "Duration", value: pkg.duration },
                    { icon: <Users className="text-[#00A896]" size={20} />, label: "Group Size", value: `Up to ${pkg.maxGroupSize}` },
                    { icon: <Tag className="text-[#FF6B35]" size={20} />, label: "Difficulty", value: pkg.difficulty },
                    { icon: <Globe className="text-[#1E88E5]" size={20} />, label: "Languages", value: pkg.languages?.join(", ") || "English" },
                  ].map(({ icon, label, value }) => (
                    <div key={label} className="p-5 bg-[#F8FAFC] rounded-2xl border border-slate-100">
                      <div className="mb-2">{icon}</div>
                      <p className="text-xs text-[#475569] uppercase font-bold tracking-wide">{label}</p>
                      <p className="font-bold text-[#0F172A] mt-1 text-sm">{value}</p>
                    </div>
                  ))}
                </div>

                {/* Highlights */}
                {pkg.highlights?.length > 0 && (
                  <>
                    <h3 className="text-xl font-bold text-[#0F172A] mb-4">Highlights</h3>
                    <ul className="space-y-3 mb-8">
                      {pkg.highlights.map((h, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex items-start gap-3 text-[#475569]"
                        >
                          <Zap size={16} className="text-[#FF6B35] mt-0.5 flex-shrink-0" />
                          {h}
                        </motion.li>
                      ))}
                    </ul>
                  </>
                )}
              </motion.div>
            )}

            {/* Itinerary */}
            {activeTab === "itinerary" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-2xl font-bold text-[#0F172A] mb-6">Day-by-Day Itinerary</h2>
                {pkg.itinerary?.length > 0 ? (
                  <div className="relative">
                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200" />
                    <div className="space-y-6">
                      {pkg.itinerary.map((item, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -15 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.07 }}
                          className="relative flex gap-6"
                        >
                          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#1E88E5] text-white flex items-center justify-center font-bold text-sm z-10">
                            {item.day}
                          </div>
                          <div className="flex-1 bg-[#F8FAFC] rounded-2xl p-5 border border-slate-100">
                            <h4 className="font-bold text-[#0F172A] mb-2">{item.title}</h4>
                            <p className="text-[#475569] text-sm leading-relaxed">{item.description}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-[#475569] italic">Detailed itinerary will be provided upon booking.</p>
                )}
              </motion.div>
            )}

            {/* Includes / Excludes */}
            {activeTab === "includes" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-bold text-[#0F172A] mb-4 flex items-center gap-2">
                      <CheckCircle size={20} className="text-emerald-500" /> What's Included
                    </h3>
                    <ul className="space-y-3">
                      {(pkg.includes?.length > 0 ? pkg.includes : [
                        "5-Star Hotel Accommodation",
                        "Daily Breakfast & Dinner",
                        "Airport Transfers",
                        "Professional Guide",
                        "All Entry Fees",
                      ]).map((item, i) => (
                        <li key={i} className="flex items-center gap-3 text-[#475569] bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#0F172A] mb-4 flex items-center gap-2">
                      <XCircle size={20} className="text-red-400" /> What's Not Included
                    </h3>
                    <ul className="space-y-3">
                      {(pkg.excludes?.length > 0 ? pkg.excludes : [
                        "International Flights",
                        "Travel Insurance",
                        "Personal Expenses",
                        "Optional Activities",
                      ]).map((item, i) => (
                        <li key={i} className="flex items-center gap-3 text-[#475569] bg-red-50 p-3 rounded-xl border border-red-100">
                          <div className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Destinations */}
            {activeTab === "destinations" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-2xl font-bold text-[#0F172A] mb-6">Included Destinations</h2>
                {pkg.destinations?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {pkg.destinations.map((dest) => (
                      <motion.div
                        key={dest._id}
                        whileHover={{ y: -2 }}
                        className="bg-[#F8FAFC] rounded-2xl overflow-hidden border border-slate-100 cursor-pointer group"
                        onClick={() => navigate(`/destinations/${dest._id}`)}
                      >
                        <div className="relative h-36 overflow-hidden">
                          <img
                            src={Array.isArray(dest.image) ? dest.image[0] : dest.image}
                            alt={dest.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                          <div className="absolute bottom-3 left-3 text-white">
                            <p className="font-bold">{dest.name}</p>
                            <p className="text-xs text-white/70 flex items-center gap-1">
                              <MapPin size={10} /> {dest.country}
                            </p>
                          </div>
                        </div>
                        <div className="p-4 flex justify-between items-center">
                          <span className="text-xs font-semibold text-[#1E88E5]">{dest.type}</span>
                          <span className="text-[#FF6B35] font-bold text-sm">${dest.price?.toLocaleString()}/person</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[#475569] italic">This package covers multiple destinations. Contact us for details.</p>
                )}
              </motion.div>
            )}
          </div>

          {/* BOOKING SIDEBAR */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="sticky top-24 bg-white border border-slate-200 rounded-3xl p-8 shadow-xl shadow-slate-200/60"
            >
              {/* Price */}
              <div className="mb-6">
                <p className="text-[#475569] text-sm">Starting from</p>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-[#0F172A]">${pkg.price.toLocaleString()}</span>
                  {pkg.originalPrice && pkg.originalPrice > pkg.price && (
                    <span className="text-slate-400 line-through text-lg">${pkg.originalPrice.toLocaleString()}</span>
                  )}
                </div>
                <p className="text-xs text-[#475569]">per person, taxes not included</p>
              </div>

              {/* Form fields */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-xs font-bold uppercase text-[#475569] mb-1.5 block">Departure Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-4 bg-[#F8FAFC] rounded-xl border border-slate-200 text-[#0F172A] focus:outline-none focus:ring-2 ring-[#1E88E5]/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-[#475569] mb-1.5 block">Travelers</label>
                  <input
                    type="number" min="1" max={pkg.maxGroupSize}
                    value={travelers}
                    onChange={(e) => setTravelers(Math.min(Number(e.target.value) || 1, pkg.maxGroupSize))}
                    className="w-full p-4 bg-[#F8FAFC] rounded-xl border border-slate-200 text-[#0F172A] focus:outline-none focus:ring-2 ring-[#1E88E5]/20"
                  />
                </div>
              </div>

              {/* Price breakdown */}
              <div className="bg-[#F8FAFC] rounded-2xl p-4 mb-6 space-y-2">
                <div className="flex justify-between text-sm text-[#475569]">
                  <span>${pkg.price.toLocaleString()} × {travelers} traveler{travelers > 1 ? "s" : ""}</span>
                  <span>${totalCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-[#475569]">
                  <span>Taxes (5%)</span>
                  <span>${taxes.toLocaleString()}</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between">
                  <span className="font-bold text-[#0F172A]">Total</span>
                  <span className="text-2xl font-bold text-[#FF6B35]">${(totalCost + taxes).toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={() => navigate(`/booking?type=package&id=${pkg._id}&price=${pkg.price}&title=${encodeURIComponent(pkg.title)}&date=${date}&travelers=${travelers}`)}
                className="cursor-pointer w-full py-4 bg-[#FF6B35] text-white font-bold rounded-xl shadow-lg shadow-orange-200/60 hover:bg-[#e85a24] transition-all active:scale-95"
              >
                Book This Package
              </button>

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-xs text-[#475569]">
                  <Shield size={12} className="text-emerald-500" />
                  <span>Free cancellation 48h before departure</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#475569]">
                  <Phone size={12} className="text-[#1E88E5]" />
                  <span>24/7 support included</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}