"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { MapPin, Loader2, ArrowRight } from "lucide-react";
import { API_BASE_URL } from "../../../api";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.15 },
    },
};

const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: "easeOut" },
    },
};

export default function PopularDestinations() {
    const [destinations, setDestinations] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPopular = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/destinations/popular`);
                setDestinations(res.data);
            } catch (err) {
                console.error("Failed to load popular destinations", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPopular();
    }, []);

    // Don't render the section at all if no popular destinations exist
    if (!loading && destinations.length === 0) return null;

    return (
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
                    <div className="mt-4 w-24 h-1 bg-[#00A896] mx-auto rounded-full" />
                </div>

                {/* Loading state */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 size={36} className="animate-spin text-[#1E88E5]" />
                    </div>
                ) : (
                    <>
                        {/* Cards Grid */}
                        <motion.div
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.15 }}
                        >
                            {destinations.map((dest) => (
                                <motion.div
                                    key={dest._id}
                                    variants={cardVariants}
                                    whileHover={{ y: -10 }}
                                    className="bg-white rounded-3xl shadow-lg hover:shadow-2xl overflow-hidden transition-all duration-300 group cursor-pointer"
                                    onClick={() => navigate(`/destinations/${dest._id}`)}
                                >
                                    {/* Image */}
                                    <div className="relative h-64 w-full overflow-hidden">
                                        <img
                                            src={dest.image}
                                            alt={`${dest.name}, ${dest.country}`}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                                        {/* Type badge */}
                                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-[#00A896]">
                                            {dest.type}
                                        </div>

                                        {/* City/Country */}
                                        <div className="absolute bottom-5 left-6 text-white">
                                            <div className="flex items-center gap-1 text-white/70 text-xs uppercase tracking-widest mb-1">
                                                <MapPin size={11} />
                                                {dest.country}
                                            </div>
                                            <h3 className="text-2xl font-bold leading-tight">{dest.name}</h3>
                                        </div>
                                    </div>

                                    {/* Card Details */}
                                    <div className="p-6 flex flex-col gap-5">
                                        <div className="flex items-end justify-between">
                                            <p className="text-sm text-[#475569]">Starting from</p>
                                            <p className="text-2xl font-bold text-[#FF6B35]">
                                                ${dest.price.toLocaleString()}
                                            </p>
                                        </div>

                                        <button className="cursor-pointer w-full py-3.5 bg-white border border-gray-200 text-[#1E88E5] font-semibold rounded-xl group-hover:bg-[#FF6B35] group-hover:border-[#FF6B35] group-hover:text-white transition-all duration-300 flex items-center justify-center gap-2">
                                            Explore Trip
                                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* View All link */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 }}
                            className="text-center mt-12"
                        >
                            <button
                                onClick={() => navigate("/destinations")}
                                className="cursor-pointer inline-flex items-center gap-2 text-[#1E88E5] font-semibold hover:gap-3 transition-all duration-200"
                            >
                                View all destinations
                                <ArrowRight size={18} />
                            </button>
                        </motion.div>
                    </>
                )}
            </div>
        </section>
    );
}