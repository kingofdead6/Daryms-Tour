"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, Clock, ArrowRight } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../../api";

const PackageCard = ({ pkg }) => {
  const [currentImg, setCurrentImg] = useState(0);
  const navigate = useNavigate();

  const images =
    pkg.images?.length > 0
      ? pkg.images
      : [pkg.image ];

  const nextImg = (e) => {
    e.preventDefault();
    setCurrentImg((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevImg = (e) => {
    e.preventDefault();
    setCurrentImg((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-md hover:shadow-xl transition-all"
    >
      {/* IMAGE */}
      <div className="relative h-56 overflow-hidden group">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentImg}
            src={images[currentImg]}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full h-full object-cover"
          />
        </AnimatePresence>

        {/* arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImg}
              className="cursor-pointer absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft size={18} className="text-[#0F172A]" />
            </button>

            <button
              onClick={nextImg}
              className="cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight size={18} className="text-[#0F172A]" />
            </button>
          </>
        )}

        {/* rating */}
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
          <Star size={14} className="fill-yellow-400 text-yellow-400" />
          <span className="text-xs font-bold text-[#0F172A]">
            {pkg.rating || 4.5}
          </span>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-[#0F172A]">{pkg.title}</h3>
          <span className="text-[#FF6B35] font-bold text-xl">
            ${pkg.price}
          </span>
        </div>

        <div className="flex items-center gap-2 text-[#475569] text-sm mb-6">
          <Clock size={16} className="text-[#00A896]" />
          <span>{pkg.duration}</span>
        </div>

        <button
          onClick={() => navigate(`/packages/${pkg._id}`)}
          className="cursor-pointer w-full py-3 bg-[#1E88E5] hover:bg-[#1565C0] text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          View Details
        </button>
      </div>
    </motion.div>
  );
};

export default function TopPackages() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
const navigate = useNavigate();
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/packages`);
        setPackages(res.data);
      } catch (err) {
        console.error("Failed to load packages:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  if (loading) {
    return (
      <section className="py-20 flex justify-center items-center">
        <div className="text-[#475569]">Loading packages...</div>
      </section>
    );
  }

  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0F172A]">
              Top Travel Packages
            </h2>
            <p className="text-[#475569] mt-2">
              Hand-picked experiences for the curious traveler.
            </p>
          </div>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packages.map((pkg) => (
            <PackageCard key={pkg._id} pkg={pkg} />
          ))}
        </div>

        <div className="text-center mt-12">
          <button
            onClick={() => navigate("/packages")}
            className="cursor-pointer inline-flex items-center gap-2 text-[#1E88E5] font-semibold hover:gap-3 transition-all duration-200"
          >
            View all packages
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}