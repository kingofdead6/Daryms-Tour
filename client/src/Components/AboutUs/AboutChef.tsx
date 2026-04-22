"use client";

import React from "react";
import { motion } from "framer-motion";
import chefpic from "../../assets/about/Maincheff.png";
export default function AboutChef() {
  return (
    <section className="relative py-28 md:py-40">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-12 gap-16 lg:gap-20 items-center">

          {/* Chef Portrait - Left Side */}
          <div className="lg:col-span-5">
            <motion.div 
              initial={{ opacity: 0, scale: 0.94 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2 }}
              className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/5] group"
            >
              <img 
                src={chefpic} 
                alt="Chef Matteo Rossi" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
              
              {/* Subtle gold light overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
            </motion.div>
          </div>

          {/* Story Content - Right Side */}
          <div className="lg:col-span-7">
            <div className="text-amber-400 text-sm tracking-[4px] uppercase mb-4">The Chef</div>
            
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-serif leading-none text-white mb-10">
              Matteo Rossi
            </h2>

            <div className="max-w-2xl space-y-8 text-lg md:text-xl text-amber-100/80 leading-relaxed">
              <p>
                Born in Tuscany and trained in the great kitchens of Lyon and Paris, Chef Matteo Rossi spent over two decades mastering classical French technique before choosing the path of radical simplicity.
              </p>
              
              <p>
                His philosophy was shaped not in Michelin-starred dining rooms, but in the quiet moments — watching his grandmother reduce a sauce for hours, learning that true flavor reveals itself only through patience and restraint.
              </p>

              <p>
                For Matteo, the kitchen is not a stage for performance, but a workshop of precision. Every cut, every reduction, every seasoning is done with intention. He believes that a great dish should never shout — it should whisper, linger, and be remembered long after the plate is cleared.
              </p>

              <div className="pt-6 border-t border-amber-900/50">
                <p className="italic text-amber-100/90">
                  “I don’t cook to impress. I cook to honor the ingredient and the moment. 
                  Everything else is noise.”
                </p>
                <p className="text-sm text-amber-400 mt-3">— Chef Matteo Rossi</p>
              </div>
            </div>

            {/* Experience Highlights */}
            <div className="mt-16 grid grid-cols-3 gap-8 text-sm">
              <div>
                <div className="text-amber-400 font-medium">18+</div>
                <div className="text-white/60 mt-1">Years of experience</div>
              </div>
              <div>
                <div className="text-amber-400 font-medium">3</div>
                <div className="text-white/60 mt-1">Michelin-starred kitchens</div>
              </div>
              <div>
                <div className="text-amber-400 font-medium">Tuscany • Lyon • Paris</div>
                <div className="text-white/60 mt-1">Trained across Europe</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}