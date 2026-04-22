"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { API_BASE_URL } from "../../../api"; 
import { Loader2 } from "lucide-react";

export default function Menu() {
  const [meals, setMeals] = useState([]);
  const [activeCategories, setActiveCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        const [mealsRes, catsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/menu`),
          axios.get(`${API_BASE_URL}/categories`)
        ]);

        // 1. Get all visible meals
        const visibleMeals = mealsRes.data.filter(meal => meal.isVisible);
        
        // 2. Filter categories: Only keep those that have at least one visible meal
        const categoriesWithItems = catsRes.data.filter(cat => 
          visibleMeals.some(meal => 
            (meal.category?._id || meal.category) === cat._id
          )
        );

        setMeals(visibleMeals);
        setActiveCategories(categoriesWithItems);
        
        // 3. Set default active category to the first one that actually has items
        if (categoriesWithItems.length > 0) {
          setActiveCategory(categoriesWithItems[0]._id);
        }
      } catch (err) {
        console.error("Error fetching menu:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuData();
  }, []);

  // Filter meals based on selected category ID
  const activeMeals = meals.filter(
    (meal) => (meal.category?._id || meal.category) === activeCategory
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0806] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-amber-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className=" min-h-screen text-white pb-20">
      {/* Hero Header */}
      <section className="relative h-[25vh] flex items-center justify-center overflow-hidden border-b border-amber-900/10">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
        <motion.div 
          initial={{ opacity: 0, letterSpacing: "0.2em" }}
          animate={{ opacity: 1, letterSpacing: "0.5em" }}
          className="relative z-10 text-center"
        >
          <h1 className="text-5xl md:text-7xl font-serif text-white uppercase italic">The Menu</h1>
          <div className="h-px w-24 bg-amber-400 mx-auto mt-6"></div>
        </motion.div>
      </section>

      <div className="max-w-7xl mx-auto px-6">
        
        {/* Navigation: Only shows categories that have items */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-10 my-12">
          {activeCategories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => setActiveCategory(cat._id)}
              className={`cursor-pointer group relative py-2 text-xs md:text-sm uppercase tracking-[0.3em] transition-all duration-500
                ${activeCategory === cat._id ? "text-amber-400" : "text-white/30 hover:text-white"}`}
            >
              {cat.name}
              <motion.div 
                className={`cursor-pointer absolute -bottom-1 left-0 h-[1px] bg-amber-400 transition-all duration-500
                  ${activeCategory === cat._id ? "w-full" : "w-0 group-hover:w-1/2"}`}
              />
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        <AnimatePresence mode="wait">
          {activeCategories.length > 0 ? (
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-x-20 gap-y-16"
            >
              {activeMeals.map((meal, index) => (
                <motion.div
                  key={meal._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="group flex flex-col sm:flex-row gap-8 items-center  sm:items-start text-center sm:text-left"
                >
                  {/* Circular Image frame for extra elegance */}
                  <div className="relative w-32 h-32 flex-shrink-0">
                    <div className="absolute inset-0 rounded-full border border-amber-400/20 scale-110 group-hover:scale-125 transition-transform duration-700"></div>
                    <img 
                      src={meal.image} 
                      alt={meal.name}
                      className="w-full h-full object-cover rounded-full grayscale-[40%] group-hover:grayscale-0 transition-all duration-700"
                    />
                  </div>

                  <div className="flex-1 pt-2">
                    <div className="flex flex-col sm:flex-row justify-between items-center sm:items-baseline mb-2">
                      <h3 className="text-2xl font-serif text-white tracking-wide">
                        {meal.name}
                      </h3>
                      <span className="text-amber-400/60 font-light text-sm tracking-tighter">— Seasonal</span>
                    </div>
                    <p className="text-amber-100/40 font-light italic leading-relaxed text-sm md:text-base">
                      {meal.description || "Inspiration of the chef, crafted with the morning's harvest."}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-40">
              <p className="text-amber-100/20 tracking-widest uppercase">The kitchen is preparing a new journey...</p>
            </div>
          )}
        </AnimatePresence>

        {/* Branding Footer */}
        <div className="mt-40 text-center">
          <div className="inline-block p-8 border border-amber-900/20 rounded-full mb-8">
             <div className="w-12 h-12 border-2 border-amber-400 rotate-45 flex items-center justify-center">
                <span className="rotate-[-45deg] text-amber-400 font-serif text-xl">G</span>
             </div>
          </div>
          <p className="max-w-md mx-auto text-amber-100/30 text-[10px] uppercase tracking-[0.4em] leading-loose">
            Respect for the ingredient. <br/> Loyalty to the season.
          </p>
        </div>
      </div>
    </div>
  );
}