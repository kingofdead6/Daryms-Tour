"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Users, Star, CheckCircle, Info } from "lucide-react";
import { FAKE_DESTINATIONS } from "./DestinationsPage"; // IMPORTANT

const DETAILS_IMAGES = [
    "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=1200",
    "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?q=80&w=1200",
    "https://images.unsplash.com/photo-1469796466635-455ede02891d?q=80&w=1200"
];

export default function DestinationDetails() {
    const { id } = useParams();

    // ✅ GET REAL DATA
    const destination = FAKE_DESTINATIONS.find(
        (d) => d.id === parseInt(id)
    );

    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) =>
                prev === DETAILS_IMAGES.length - 1 ? 0 : prev + 1
            );
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    // ✅ SAFETY
    if (!destination) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <h1 className="text-2xl font-bold">Destination not found</h1>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">

            {/* HERO */}
            <section className="relative h-[70vh] w-full overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.img
                        key={index}
                        src={DETAILS_IMAGES[index]}
                        initial={{ scale: 1.2, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                </AnimatePresence>

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                <div className="absolute bottom-12 left-12 text-white">
                    <motion.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-5xl md:text-7xl font-bold mb-4"
                    >
                        {destination.name} Getaway
                    </motion.h1>

                    <div className="flex gap-6 items-center">
                        <span className="flex items-center gap-2 bg-[#FF6B35] px-4 py-1 rounded-full font-bold">
                            ${destination.price} / person
                        </span>

                        <div className="flex items-center gap-1">
                            <Star size={18} className="fill-yellow-400 text-yellow-400" />
                            <span className="font-bold">4.9 (1.2k Reviews)</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* CONTENT */}
            <section className="py-16 px-6 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* MAIN */}
                    <div className="lg:col-span-2">

                        <h2 className="text-3xl font-bold text-[#0F172A] mb-6">
                            Explore {destination.name}
                        </h2>

                        <p className="text-[#475569] text-lg leading-relaxed mb-8">
                            Discover the beauty of {destination.country}, located in {destination.continent}.
                            This {destination.type.toLowerCase()} experience is designed for travelers
                            looking for unforgettable moments and premium comfort.
                        </p>

                        {/* INFO GRID */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">

                            <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-slate-100">
                                <Clock className="text-[#1E88E5] mb-2" />
                                <p className="text-xs text-[#475569] uppercase font-bold">Duration</p>
                                <p className="font-bold text-[#0F172A]">7 Days</p>
                            </div>

                            <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-slate-100">
                                <Users className="text-[#00A896] mb-2" />
                                <p className="text-xs text-[#475569] uppercase font-bold">Group Size</p>
                                <p className="font-bold text-[#0F172A]">Up to 12</p>
                            </div>

                            <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-slate-100">
                                <Info className="text-[#1E88E5] mb-2" />
                                <p className="text-xs text-[#475569] uppercase font-bold">Type</p>
                                <p className="font-bold text-[#0F172A]">{destination.type}</p>
                            </div>

                            <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-slate-100">
                                <CheckCircle className="text-[#00A896] mb-2" />
                                <p className="text-xs text-[#475569] uppercase font-bold">Guided</p>
                                <p className="font-bold text-[#0F172A]">Yes</p>
                            </div>

                        </div>

                        {/* INCLUDED */}
                        <h3 className="text-2xl font-bold text-[#0F172A] mb-4">
                            What's Included
                        </h3>

                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                "5-star Hotel Accommodation",
                                "Daily Breakfast & Dinner",
                                "Airport Transfers",
                                "Guided City Tours",
                                "Private Boat Trip",
                                "Entry to Archaeological Sites"
                            ].map(item => (
                                <li key={item} className="flex items-center gap-3 text-[#475569]">
                                    <div className="w-2 h-2 rounded-full bg-[#00A896]" />
                                    {item}
                                </li>
                            ))}
                        </ul>

                    </div>

                    {/* SIDEBAR */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 bg-white border border-slate-200 rounded-3xl p-8 shadow-xl shadow-slate-200/50">

                            <h4 className="text-xl font-bold text-[#0F172A] mb-2">
                                Book This Trip
                            </h4>

                            <p className="text-[#475569] text-sm mb-6">
                                Select your preferred date to see final pricing.
                            </p>

                            <div className="space-y-4 mb-8">
                                <input
                                    type="date"
                                    className="w-full p-4 bg-[#F8FAFC] rounded-xl border border-slate-200"
                                />
                                <select className="w-full p-4 bg-[#F8FAFC] rounded-xl border border-slate-200">
                                    <option>1 Traveler</option>
                                    <option>2 Travelers</option>
                                </select>
                            </div>

                            <div className="flex justify-between items-center mb-8 pb-8 border-b border-slate-100">
                                <span className="text-[#0F172A] font-bold">Total Cost</span>
                                <span className="text-3xl font-bold text-[#FF6B35]">
                                    ${destination.price}
                                </span>
                            </div>

                            <button className="w-full py-4 bg-[#FF6B35] text-white font-bold rounded-xl shadow-lg shadow-orange-200 hover:bg-[#e85a24] transition-all">
                                Proceed to Checkout
                            </button>

                        </div>
                    </div>

                </div>
            </section>
        </div>
    );
}