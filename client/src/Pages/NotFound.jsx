"use client";

import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-[#F8FAFC] text-center text-[#0F172A] relative overflow-hidden">

      {/* Ambient glow background - Updated to Travel Palette */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-[#F8FAFC] to-white opacity-90" />
      <div className="absolute -top-40 w-[600px] h-[600px] bg-[#1E88E5]/5 blur-[140px] rounded-full" />
      <div className="absolute bottom-0 w-[500px] h-[500px] bg-[#00A896]/5 blur-[160px] rounded-full" />

      {/* Content */}
      <div className="relative z-10">

        {/* 404 - Subtle Text Primary */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-[7rem] sm:text-[10rem] md:text-[12rem] font-bold tracking-tighter text-slate-200 leading-none"
        >
          404
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#0F172A] mt-4"
        >
          Lost in Adventure?
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-[#475569] text-base sm:text-lg max-w-xl mx-auto mt-5 leading-relaxed font-light"
        >
          Even the best travelers lose their way sometimes. The page you are looking for has taken a different route.
        </motion.p>

        {/* CTA - Sunset Orange for Urgency/Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-10"
        >
          <Link
            to="/"
            className="inline-flex items-center px-10 py-4 bg-[#1E88E5] text-white font-bold rounded-2xl hover:bg-[#1565C0] transition shadow-lg shadow-blue-200"
          >
            Return Home
          </Link>
        </motion.div>

      </div>
    </div>
  );
}