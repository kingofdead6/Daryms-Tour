"use client";

import React from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CTASection() {
  const navigate = useNavigate();

  const handleBookingRedirect = () => {
    navigate("/booking"); 
  };

  return (
    <section className="relative py-20 px-6 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#1E88E5] to-[#00A896]" />

      {/* Decorative shapes */}
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
            <button
              onClick={handleBookingRedirect}
              className="cursor-pointer w-full sm:w-auto px-10 py-5 bg-[#FF6B35] hover:bg-[#e85a24] text-white font-bold text-lg rounded-full transition-all duration-300 shadow-xl shadow-orange-900/20 hover:scale-105"
            >
              Book Your Trip Now
            </button>
          </div>

          <p className="mt-8 text-white/60 text-sm italic">
            * No credit card required to browse our exclusive offers.
          </p>
        </motion.div>
      </div>
    </section>
  );
}