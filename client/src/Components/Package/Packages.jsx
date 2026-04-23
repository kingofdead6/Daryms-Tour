"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, MapPin, Loader2, SlidersHorizontal, Clock, Users,
  Star, Tag, ChevronRight, Flame, Sparkles
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../../api";

const CATEGORIES = ["All", "Honeymoon", "Family", "Adventure", "Luxury", "Cultural", "Solo", "Group", "Business"];
const DIFFICULTIES = ["All", "Easy", "Moderate", "Challenging", "Expert"];

const difficultyColors = {
  Easy: "bg-emerald-100 text-emerald-700",
  Moderate: "bg-blue-100 text-blue-700",
  Challenging: "bg-orange-100 text-orange-700",
  Expert: "bg-red-100 text-red-700",
};

export default function PackagesPage() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [maxPrice, setMaxPrice] = useState(15000);
  const [sortBy, setSortBy] = useState("newest");
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/packages`)
      .then((res) => setPackages(res.data))
      .catch(() => toast.error("Failed to load packages"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = packages
    .filter((p) => {
      const matchCategory = category === "All" || p.category === category;
      const matchDiff = difficulty === "All" || p.difficulty === difficulty;
      const matchPrice = p.price <= maxPrice;
      const matchSearch =
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        (p.subtitle || "").toLowerCase().includes(search.toLowerCase());
      return matchCategory && matchDiff && matchPrice && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "rating") return b.rating - a.rating;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-24 pb-20 px-6">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-2 text-[#1E88E5] font-semibold text-sm mb-3">
            <Sparkles size={16} />
            <span>Curated Travel Packages</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#0F172A] mb-3">
            Complete Travel Packages
          </h1>
          <p className="text-[#475569] text-lg max-w-xl">
            All-inclusive packages with accommodation, tours, and experiences — just pack your bags.
          </p>
        </motion.div>

        {/* FILTERS */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-5 items-end">
            {/* Search */}
            <div className="flex-1 w-full">
              <label className="text-xs font-bold uppercase text-[#475569] mb-2 block">Search Packages</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by name or theme..."
                  className="w-full pl-10 pr-4 py-3 bg-[#F8FAFC] rounded-xl outline-none focus:ring-2 ring-[#1E88E5]/20 border border-slate-200"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Sort */}
            <div className="w-full lg:w-48">
              <label className="text-xs font-bold uppercase text-[#475569] mb-2 block">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full py-3 px-4 bg-[#F8FAFC] rounded-xl border border-slate-200 outline-none focus:ring-2 ring-[#1E88E5]/20 text-[#0F172A]"
              >
                <option value="newest">Newest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

            {/* Max Price */}
            <div className="w-full lg:w-64">
              <div className="flex justify-between mb-2">
                <label className="text-xs font-bold uppercase text-[#475569]">Max Price</label>
                <span className="text-[#FF6B35] font-bold text-sm">${maxPrice.toLocaleString()}</span>
              </div>
              <input
                type="range" min="500" max="15000" step="500"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#1E88E5]"
              />
            </div>
          </div>

          {/* Category chips */}
          <div className="mt-5 pt-5 border-t border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <SlidersHorizontal size={14} className="text-[#475569]" />
              <span className="text-xs font-bold uppercase text-[#475569]">Category</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`cursor-pointer px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
                    category === c
                      ? "bg-[#1E88E5] text-white border-[#1E88E5]"
                      : "bg-white text-[#475569] border-slate-200 hover:border-[#1E88E5] hover:text-[#1E88E5]"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty chips */}
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-3">
              <Tag size={14} className="text-[#475569]" />
              <span className="text-xs font-bold uppercase text-[#475569]">Difficulty</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`cursor-pointer px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
                    difficulty === d
                      ? "bg-[#0F172A] text-white border-[#0F172A]"
                      : "bg-white text-[#475569] border-slate-200 hover:border-[#0F172A] hover:text-[#0F172A]"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Results */}
        {!loading && (
          <p className="text-sm text-[#475569] mb-6">
            Showing <span className="font-bold text-[#0F172A]">{filtered.length}</span> package{filtered.length !== 1 ? "s" : ""}
          </p>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 size={36} className="animate-spin text-[#1E88E5]" />
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24 text-[#475569]"
          >
            <MapPin size={40} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg font-semibold">No packages found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {filtered.map((pkg, i) => (
                <motion.div
                  key={pkg._id}
                  layout
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.06 }}
                  className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group border border-slate-100"
                >
                  {/* Image */}
                  <div className="relative h-60 overflow-hidden">
                    <img
                      src={pkg.images?.[0] || "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=600"}
                      alt={pkg.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex gap-2">
                      {pkg.isPopular && (
                        <span className="flex items-center gap-1 bg-[#FF6B35] text-white px-3 py-1 rounded-full text-xs font-bold">
                          <Flame size={10} /> Popular
                        </span>
                      )}
                      {pkg.isFeatured && (
                        <span className="flex items-center gap-1 bg-[#1E88E5] text-white px-3 py-1 rounded-full text-xs font-bold">
                          <Star size={10} /> Featured
                        </span>
                      )}
                    </div>

                    {/* Category */}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-[#00A896]">
                      {pkg.category}
                    </div>

                    {/* Rating */}
                    <div className="absolute bottom-4 left-4 flex items-center gap-1 text-white text-xs font-bold">
                      <Star size={12} className="fill-yellow-400 text-yellow-400" />
                      {pkg.rating} ({pkg.reviewsCount} reviews)
                    </div>

                    {/* Discount */}
                    {pkg.originalPrice && pkg.originalPrice > pkg.price && (
                      <div className="absolute bottom-4 right-4 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
                        {Math.round((1 - pkg.price / pkg.originalPrice) * 100)}% OFF
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-[#0F172A] mb-1 leading-tight">{pkg.title}</h3>
                    {pkg.subtitle && (
                      <p className="text-sm text-[#475569] mb-3">{pkg.subtitle}</p>
                    )}

                    {/* Stats row */}
                    <div className="flex gap-4 text-xs text-[#475569] mb-4">
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> {pkg.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={12} /> Up to {pkg.maxGroupSize}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full font-semibold ${difficultyColors[pkg.difficulty] || "bg-slate-100 text-slate-600"}`}>
                        {pkg.difficulty}
                      </span>
                    </div>

                    {/* Destinations preview */}
                    {pkg.destinations?.length > 0 && (
                      <div className="flex items-center gap-1 text-xs text-[#475569] mb-4">
                        <MapPin size={12} />
                        <span>{pkg.destinations.slice(0, 2).map(d => d.name).join(", ")}
                          {pkg.destinations.length > 2 ? ` +${pkg.destinations.length - 2} more` : ""}
                        </span>
                      </div>
                    )}

                    {/* Price + CTA */}
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                      <div>
                        <p className="text-xs text-[#475569]">From</p>
                        <div className="flex items-baseline gap-2">
                          <p className="text-2xl font-bold text-[#FF6B35]">${pkg.price.toLocaleString()}</p>
                          {pkg.originalPrice && pkg.originalPrice > pkg.price && (
                            <p className="text-sm text-slate-400 line-through">${pkg.originalPrice.toLocaleString()}</p>
                          )}
                        </div>
                        <p className="text-xs text-[#475569]">per person</p>
                      </div>
                      <button
                        onClick={() => navigate(`/packages/${pkg._id}`)}
                        className="cursor-pointer flex items-center gap-2 bg-[#1E88E5] text-white px-5 py-3 rounded-xl font-bold hover:bg-[#1565C0] transition-colors text-sm"
                      >
                        View <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}