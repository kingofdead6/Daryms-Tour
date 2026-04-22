"use client";

import React from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";

export default function CTASection() {
  return (
    <section className="relative py-20 px-6 overflow-hidden">
      {/* Background with the Travel Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#1E88E5] to-[#00A896]" />

      {/* Decorative White Circles for a modern travel feel */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-black/10 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            Ready to start your <br /> next adventure?
          </h2>

          <p className="text-white/80 text-lg md:text-xl mb-10 max-w-2xl mx-auto font-light">
            Join 50,000+ travelers who book their dream vacations with us every year.
            Get exclusive deals delivered straight to your inbox.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* Primary Action */}
            <button className="w-full sm:w-auto px-10 py-5 bg-[#FF6B35] hover:bg-[#e85a24] text-white font-bold text-lg rounded-full transition-all duration-300 shadow-xl shadow-orange-900/20 hover:scale-105">
              Book Your Trip Now
            </button>

            {/* Newsletter Input */}
            <div className="flex w-full sm:w-auto bg-white/10 backdrop-blur-md border border-white/20 rounded-full p-1 pl-6 items-center group focus-within:bg-white/20 transition-all">
              <input
                type="email"
                placeholder="Enter your email"
                className="bg-transparent border-none outline-none text-white placeholder-white/60 w-full sm:w-48 py-2"
              />
              <button className="p-4 bg-white text-[#1E88E5] rounded-full hover:bg-[#F8FAFC] transition-colors">
                <Send size={20} />
              </button>
            </div>
          </div>

          <p className="mt-8 text-white/60 text-sm italic">
            * No credit card required to browse our exclusive offers.
          </p>
        </motion.div>
      </div>
    </section>
  );
}