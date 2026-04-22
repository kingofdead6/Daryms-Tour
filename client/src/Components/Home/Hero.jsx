"use client";

import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import HeroBG from "../../assets/HomeBG.mp4";

export default function Hero() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden font-sans">

      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        >
          <source src={HeroBG} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Travel Optimized Overlay: Gradient from Ocean Blue to Teal */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1E88E5]/70 to-[#00A896]/60 mix-blend-multiply" />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6 pt-20">
        <div className="max-w-5xl w-full text-center">

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6"
          >
            Explore the World <br />
            <span className="text-[#00A896]">with Confidence</span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 1 }}
            className="text-xl md:text-2xl text-white/90 mb-12 font-light"
          >
            Find the best travel packages tailored for you
          </motion.p>

          {/* Search Bar Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="bg-white p-4 md:p-2 rounded-2xl md:rounded-full shadow-2xl flex flex-col md:flex-row items-center gap-2 max-w-4xl mx-auto"
          >
            {/* Destination */}
            <div className="flex-1 w-full px-6 py-3 text-left border-b md:border-b-0 md:border-r border-gray-100">
              <label className="block text-[10px] uppercase tracking-wider font-bold text-[#475569]">Destination</label>
              <input
                type="text"
                placeholder="Where to?"
                className="w-full bg-transparent outline-none text-[#0F172A] placeholder-gray-400"
              />
            </div>

            {/* Date Picker */}
            <div className="flex-1 w-full px-6 py-3 text-left border-b md:border-b-0 md:border-r border-gray-100">
              <label className="block text-[10px] uppercase tracking-wider font-bold text-[#475569]">Date</label>
              <input
                type="date"
                className="w-full bg-transparent outline-none text-[#0F172A]"
              />
            </div>

            {/* Travelers */}
            <div className="flex-1 w-full px-6 py-3 text-left">
              <label className="block text-[10px] uppercase tracking-wider font-bold text-[#475569]">Travelers</label>
              <select className="w-full bg-transparent outline-none text-[#0F172A]">
                <option>1 Traveler</option>
                <option>2 Travelers</option>
                <option>Group</option>
              </select>
            </div>

            {/* Search CTA */}
            <button className="w-full md:w-auto px-8 py-4 bg-[#FF6B35] hover:bg-[#e85a24] text-white font-bold rounded-xl md:rounded-full transition-all duration-300 shadow-lg shadow-orange-500/30">
              Search Trips
            </button>
          </motion.div>

          {/* Secondary CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-8"
          >
            <Link
              to="/offers"
              className="text-white hover:text-[#00A896] font-medium underline underline-offset-8 transition-colors"
            >
              View Special Offers
            </Link>
          </motion.div>

        </div>
      </div>
    </section>
  );
}