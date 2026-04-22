"use client";

import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-[#0c0a08] text-center text-stone-200 relative overflow-hidden">

      {/* Ambient glow background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-[#0c0a08] to-black opacity-90" />
      <div className="absolute -top-40 w-[600px] h-[600px] bg-amber-500/10 blur-[140px] rounded-full" />
      <div className="absolute bottom-0 w-[500px] h-[500px] bg-amber-400/10 blur-[160px] rounded-full" />

      {/* Content */}
      <div className="relative z-10">

        {/* 404 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-[7rem] sm:text-[10rem] md:text-[12rem] font-light tracking-tighter text-stone-600 leading-none"
        >
          404
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl sm:text-4xl md:text-5xl font-light tracking-wide mt-4"
        >
          Page Not Found
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-stone-400 text-base sm:text-lg max-w-xl mx-auto mt-5 leading-relaxed"
        >
          The page you are looking for does not exist, has been moved, or was removed.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-10"
        >
          <Link
            to="/"
            className="inline-flex items-center px-10 py-4 bg-amber-500 text-black font-semibold rounded-2xl hover:bg-amber-400 transition shadow-lg"
          >
            Return Home
          </Link>
        </motion.div>

      </div>
    </div>
  );
}