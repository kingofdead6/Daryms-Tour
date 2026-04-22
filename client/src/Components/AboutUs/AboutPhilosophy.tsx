"use client";

import React from "react";
import { motion } from "framer-motion";

const philosophyPoints = [
  "Simplicity is complexity refined",
  "Ingredients lead, not recipes",
  "Silence is part of the experience",
];

export default function AboutPhilosophy() {
  return (
    <section className=" relative pt-28 md:pt-40">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="text-amber-400 text-sm tracking-[4px] uppercase mb-4">Our Philosophy</div>
          <h2 className="text-5xl md:text-6xl font-serif text-white">Less, but better.</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-10">
          {philosophyPoints.map((point, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className="w-16 h-px bg-amber-400/60 mx-auto mb-8" />
              <p className="text-2xl text-amber-100/90 font-light leading-tight">
                {point}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}