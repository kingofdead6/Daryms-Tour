"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Users, Map, Heart, Star, Sparkles } from "lucide-react";

const PACKAGES_DATA = [
    {
        id: "pkg-1",
        title: "Mediterranean Luxury Cruise",
        category: "Premium",
        duration: "12 Days",
        groupSize: "Up to 20",
        rating: 4.9,
        price: 3499,
        image: "https://images.unsplash.com/photo-1548574505-5e239809ee19?q=80&w=800",
        tags: ["All Inclusive", "Sea View", "Guided Tours"],
        isPopular: true
    },
    {
        id: "pkg-2",
        title: "Amazon Rainforest Expedition",
        category: "Eco-Adventure",
        duration: "8 Days",
        groupSize: "Max 8",
        rating: 4.7,
        price: 2150,
        image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=800",
        tags: ["Sustainable", "Nature", "Photography"],
        isPopular: false
    },
    {
        id: "pkg-3",
        title: "The Great European Rail Tour",
        category: "Classic",
        duration: "15 Days",
        groupSize: "Max 15",
        rating: 5.0,
        price: 4200,
        image: "https://images.unsplash.com/photo-1471874233642-a1aa18a0e27c?q=80&w=800",
        tags: ["Historical", "Train Travel", "City Hopping"],
        isPopular: false
    }
];

export default function PackagesPage() {
    const [activeTab, setActiveTab] = useState("All");

    const categories = ["All", "Premium", "Eco-Adventure", "Classic"];

    return (
        <div className="min-h-screen bg-[#F8FAFC] pt-28 pb-20 px-6">
            <div className="max-w-7xl mx-auto">

                {/* Header Section */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1E88E5]/10 text-[#1E88E5] text-sm font-bold mb-4"
                    >
                        <Sparkles size={16} />
                        <span>Curated Experiences</span>
                    </motion.div>
                    <h1 className="text-4xl md:text-6xl font-bold text-[#0F172A] mb-6">Explore Our Packages</h1>
                    <p className="text-[#475569] text-lg max-w-2xl mx-auto">
                        Choose from our expertly crafted travel bundles designed to give you
                        the perfect balance of adventure and relaxation.
                    </p>
                </div>

                {/* Category Tabs */}
                <div className="flex flex-wrap justify-center gap-4 mb-12">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveTab(cat)}
                            className={`px-8 py-3 rounded-full font-bold transition-all duration-300 ${activeTab === cat
                                    ? "bg-[#0F172A] text-white shadow-lg"
                                    : "bg-white text-[#475569] hover:bg-[#00A896]/10 border border-slate-200"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Package Listing */}
                <div className="space-y-12">
                    {PACKAGES_DATA.filter(p => activeTab === "All" || p.category === activeTab).map((pkg, idx) => (
                        <motion.div
                            key={pkg.id}
                            initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="bg-white rounded-[2rem] overflow-hidden shadow-xl shadow-slate-200/50 flex flex-col lg:flex-row group border border-slate-100"
                        >
                            {/* Image Side */}
                            <div className="lg:w-2/5 relative h-[300px] lg:h-auto overflow-hidden">
                                <img
                                    src={pkg.image}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    alt={pkg.title}
                                />
                                {pkg.isPopular && (
                                    <div className="absolute top-6 left-6 bg-[#FF6B35] text-white px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                                        <Star size={14} className="fill-current" />
                                        MOST POPULAR
                                    </div>
                                )}
                                <button className="absolute top-6 right-6 p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-red-500 transition-all">
                                    <Heart size={20} />
                                </button>
                            </div>

                            {/* Content Side */}
                            <div className="lg:w-3/5 p-8 lg:p-12 flex flex-col justify-center">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-[#00A896] font-bold text-sm tracking-widest uppercase">{pkg.category}</span>
                                    <div className="flex items-center gap-1">
                                        <Star size={16} className="text-yellow-400 fill-current" />
                                        <span className="font-bold text-[#0F172A]">{pkg.rating}</span>
                                    </div>
                                </div>

                                <h3 className="text-3xl font-bold text-[#0F172A] mb-4 group-hover:text-[#1E88E5] transition-colors">{pkg.title}</h3>

                                <div className="grid grid-cols-3 gap-4 mb-8">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2 text-[#475569]">
                                            <Calendar size={18} className="text-[#1E88E5]" />
                                            <span className="text-sm">Duration</span>
                                        </div>
                                        <p className="font-bold text-[#0F172A]">{pkg.duration}</p>
                                    </div>
                                    <div className="flex flex-col gap-1 border-x border-slate-100 px-4">
                                        <div className="flex items-center gap-2 text-[#475569]">
                                            <Users size={18} className="text-[#1E88E5]" />
                                            <span className="text-sm">Size</span>
                                        </div>
                                        <p className="font-bold text-[#0F172A]">{pkg.groupSize}</p>
                                    </div>
                                    <div className="flex flex-col gap-1 pl-4">
                                        <div className="flex items-center gap-2 text-[#475569]">
                                            <Map size={18} className="text-[#1E88E5]" />
                                            <span className="text-sm">Destinations</span>
                                        </div>
                                        <p className="font-bold text-[#0F172A]">Multiple</p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 mb-8">
                                    {pkg.tags.map(tag => (
                                        <span key={tag} className="px-3 py-1 bg-[#F8FAFC] border border-slate-200 rounded-lg text-xs font-medium text-[#475569]">
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between pt-8 border-t border-slate-100">
                                    <div>
                                        <p className="text-sm text-[#475569]">Package starts at</p>
                                        <p className="text-4xl font-bold text-[#0F172A]">${pkg.price}</p>
                                    </div>
                                    <button className="px-10 py-4 bg-[#1E88E5] hover:bg-[#FF6B35] text-white font-bold rounded-2xl transition-all duration-300 shadow-lg shadow-blue-200 transform hover:-translate-y-1">
                                        View Package Details
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}