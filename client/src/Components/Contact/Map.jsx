"use client";

import React from "react";
import { motion } from "framer-motion";
import { MapPin, Navigation } from "lucide-react";

export default function Map() {
  // Official address for Daryms Tour
  const address = "150 Rue Ali Remli, Bouzareah 16000, Algiers, Algeria";
  const mapEmbedUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3628.0592087685527!2d3.0131764999999997!3d36.7860404!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x128fb1453dd36229%3A0x57feedd2c41b9362!2sDARYMS%20TOUR!5e1!3m2!1sen!2sdz!4v1776947946144!5m2!1sen!2sdz";

  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold text-[#0F172A] mb-4"
          >
            Visit Our Headquarters
          </motion.h2>
          <div className="flex items-center justify-center gap-2 text-[#475569]">
            <MapPin size={18} className="text-[#1E88E5]" />
            <p className="font-medium text-lg">{address}</p>
          </div>
        </div>

        {/* Real Map Container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative w-full h-[500px] rounded-[2.5rem] overflow-hidden shadow-2xl shadow-blue-100 border border-slate-100"
        >
          <iframe
            title="Daryms Tour Location"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src={mapEmbedUrl}
            className="grayscale-[20%] hover:grayscale-0 transition-all duration-700"
          ></iframe>
        </motion.div>
      </div>
    </section>
  );
}