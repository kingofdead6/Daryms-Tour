"use client";

import React from "react";
import { motion } from "framer-motion";

// Fake Data for Destinations
const destinations = [
    {
        id: 1,
        image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=600&auto=format&fit=crop", // Santorini
        city: "Oia",
        country: "Greece",
        price: 1299,
    },
    {
        id: 2,
        image: "https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?q=80&w=600&auto=format&fit=crop", // Kyoto
        city: "Kyoto",
        country: "Japan",
        price: 1850,
    },
    {
        id: 3,
        image: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?q=80&w=600&auto=format&fit=crop", // Venice
        city: "Venice",
        country: "Italy",
        price: 1420,
    },
    {
        id: 4,
        image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=600&auto=format&fit=crop", // Thailand
        city: "Phuket",
        country: "Thailand",
        price: 999,
    },
];

// Motion Animation Variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2, // Cards appear one after another
        },
    },
};

const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: "easeOut" }
    },
};

export default function PopularDestinations() {
    return (
        // Section Background: #F8FAFC (Main Background)
        <section className="py-24 px-6 bg-[#F8FAFC]">
            <div className="max-w-7xl mx-auto">

                {/* Title */}
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: -10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.5 }}
                        className="text-4xl md:text-5xl font-bold tracking-tight text-[#0F172A]"
                    >
                        Popular Destinations
                    </motion.h2>
                    <div className="mt-4 w-24 h-1 bg-[#00A896] mx-auto rounded-full" /> {/* Teal Accent Line */}
                </div>

                {/* Destination Cards Grid */}
                <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                >
                    {destinations.map((dest) => (
                        <motion.div
                            key={dest.id}
                            variants={cardVariants}
                            whileHover={{ y: -10 }} // Subtle lift on hover
                            className="bg-white rounded-3xl shadow-lg hover:shadow-2xl overflow-hidden transition-all duration-300 group"
                        >
                            {/* Image Container */}
                            <div className="relative h-64 w-full overflow-hidden">
                                <img
                                    src={dest.image}
                                    alt={`${dest.city}, ${dest.country}`}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                                {/* City/Country Overlayed on Image */}
                                <div className="absolute bottom-5 left-6 text-white">
                                    <p className="text-xs uppercase tracking-widest text-white/80">{dest.country}</p>
                                    <h3 className="text-2xl font-bold">{dest.city}</h3>
                                </div>
                            </div>

                            {/* Card Details */}
                            <div className="p-6 flex flex-col gap-5">
                                <div className="flex items-end justify-between">
                                    <p className="text-sm text-[#475569]">Starting from</p>

                                    {/* Price using Accent Orange for visual hierarchy */}
                                    <p className="text-2xl font-bold text-[#FF6B35]">
                                        ${dest.price.toLocaleString()}
                                    </p>
                                </div>

                                {/* Explore Button: Full width CTA */}
                                <button className="w-full py-3.5 bg-white border border-gray-200 text-[#1E88E5] font-semibold rounded-xl group-hover:bg-[#FF6B35] group-hover:border-[#FF6B35] group-hover:text-white transition-all duration-300">
                                    Explore Trip
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}