"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, Clock } from "lucide-react"; // Assuming lucide-react for icons

const packages = [
    {
        id: 1,
        title: "Swiss Alps Adventure",
        duration: "7 Days",
        price: 2450,
        rating: 4.9,
        images: [
            "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
        ]
    },
    {
        id: 2,
        title: "Safari in Serengeti",
        duration: "5 Days",
        price: 3100,
        rating: 4.8,
        images: [
            "https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1523805081446-99395bcfe05e?q=80&w=800&auto=format&fit=crop"
        ]
    },
    {
        id: 3,
        title: "Bali Tropical Escape",
        duration: "10 Days",
        price: 1890,
        rating: 5.0,
        images: [
            "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?q=80&w=800&auto=format&fit=crop"
        ]
    }
];

const PackageCard = ({ pkg }) => {
    const [currentImg, setCurrentImg] = useState(0);

    const nextImg = (e) => {
        e.preventDefault();
        setCurrentImg((prev) => (prev === pkg.images.length - 1 ? 0 : prev + 1));
    };

    const prevImg = (e) => {
        e.preventDefault();
        setCurrentImg((prev) => (prev === 0 ? pkg.images.length - 1 : prev - 1));
    };

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-md hover:shadow-xl transition-all"
        >
            {/* Image Carousel Area */}
            <div className="relative h-56 overflow-hidden group">
                <AnimatePresence mode="wait">
                    <motion.img
                        key={currentImg}
                        src={pkg.images[currentImg]}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="w-full h-full object-cover"
                    />
                </AnimatePresence>

                {/* Navigation Arrows */}
                <button onClick={prevImg} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronLeft size={18} className="text-[#0F172A]" />
                </button>
                <button onClick={nextImg} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight size={18} className="text-[#0F172A]" />
                </button>

                {/* Rating Badge */}
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                    <Star size={14} className="fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-bold text-[#0F172A]">{pkg.rating}</span>
                </div>
            </div>

            {/* Details Area */}
            <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-[#0F172A]">{pkg.title}</h3>
                    <span className="text-[#FF6B35] font-bold text-xl">${pkg.price}</span>
                </div>

                <div className="flex items-center gap-2 text-[#475569] text-sm mb-6">
                    <Clock size={16} className="text-[#00A896]" />
                    <span>{pkg.duration}</span>
                </div>

                <button className="w-full py-3 bg-[#1E88E5] hover:bg-[#1565C0] text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                    View Details
                </button>
            </div>
        </motion.div>
    );
};

export default function TopPackages() {
    return (
        <section className="py-20 px-6 bg-white">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold text-[#0F172A]">Top Travel Packages</h2>
                        <p className="text-[#475569] mt-2">Hand-picked experiences for the curious traveler.</p>
                    </div>
                    <button className="text-[#1E88E5] font-semibold hover:underline decoration-2 underline-offset-4">
                        See all packages
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {packages.map((pkg) => (
                        <PackageCard key={pkg.id} pkg={pkg} />
                    ))}
                </div>
            </div>
        </section>
    );
}