"use client";

import React from "react";
import { motion } from "framer-motion";
import storybg from "../../assets/about/aboutstory.png";

export default function AboutStory() {
  return (
    <section className="relative min-h-[90vh] md:min-h-screen flex items-end md:items-center overflow-hidden py-16 md:py-0">
      
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={storybg}
          alt="Crafted in silence"
          className="w-full h-full object-cover object-center"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 text-center">
        
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="max-w-3xl mx-auto"
        >
          {/* Accent */}
          <div className="inline-flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
            <div className="h-px w-8 sm:w-12 bg-amber-400" />
            <span className="text-amber-400 text-[10px] sm:text-sm tracking-[3px] sm:tracking-[4px] uppercase font-light">
              Our Craft
            </span>
            <div className="h-px w-8 sm:w-12 bg-amber-400" />
          </div>

          {/* Title */}
          <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-serif tracking-wide sm:tracking-widest leading-tight text-white mb-6 sm:mb-10">
            Crafted, not constructed
          </h2>

          {/* Text */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 1 }}
            className="text-base sm:text-xl md:text-2xl text-amber-100/90 font-light leading-relaxed tracking-normal sm:tracking-wide"
          >
            We believe cuisine is discipline before it is creativity.
            Every dish is reduced to what matters — and nothing more.
          </motion.p>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-amber-400/60 text-[10px] sm:text-xs tracking-widest"
      >
        <div className="h-px w-5 sm:w-6 bg-amber-400/60" />
        SCROLL
        <div className="h-px w-5 sm:w-6 bg-amber-400/60" />
      </motion.div>
    </section>
  );
}