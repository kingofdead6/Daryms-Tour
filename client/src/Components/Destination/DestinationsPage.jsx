"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Loader2, SlidersHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../../api";

const CONTINENTS = ["All", "Europe", "Asia", "Africa", "North America", "South America", "Oceania"];

export default function DestinationsPage() {
    const [destinations, setDestinations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [continent, setContinent] = useState("All");
    const [maxPrice, setMaxPrice] = useState(10000);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchDestinations = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/destinations`);
                setDestinations(res.data);
            } catch (err) {
                toast.error("Failed to load destinations");
            } finally {
                setLoading(false);
            }
        };
        fetchDestinations();
    }, []);

    const filtered = destinations.filter(d =>
        (continent === "All" || d.continent === continent) &&
        d.price <= maxPrice &&
        d.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC] pt-24 pb-20 px-6">
            <div className="max-w-7xl mx-auto">

                {/* HEADER */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-12"
                >
                    <h1 className="text-4xl font-bold text-[#0F172A] mb-8">
                        Find Your Next Adventure
                    </h1>

                    {/* FILTERS */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col lg:flex-row gap-6 items-end">

                        {/* SEARCH */}
                        <div className="flex-1 w-full">
                            <label className="text-xs font-bold uppercase text-[#475569] mb-2 block">
                                Search Destination
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Where do you want to go?"
                                    className="w-full pl-10 pr-4 py-3 bg-[#F8FAFC] rounded-xl outline-none focus:ring-2 ring-[#1E88E5]/20 border border-slate-200"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* CONTINENT CHIPS */}
                        <div className="w-full lg:w-auto">
                            <label className="text-xs font-bold uppercase text-[#475569] mb-2 block flex items-center gap-1">
                                <SlidersHorizontal size={12} /> Continent
                            </label>
                            <div className="flex gap-2 flex-wrap">
                                {CONTINENTS.map((c) => (
                                    <button
                                        key={c}
                                        onClick={() => setContinent(c)}
                                        className={`cursor-pointer px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
                                            continent === c
                                                ? "bg-[#1E88E5] text-white border-[#1E88E5]"
                                                : "bg-white text-[#475569] border-slate-200 hover:border-[#1E88E5] hover:text-[#1E88E5]"
                                        }`}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* PRICE */}
                        <div className="w-full lg:w-64 flex-shrink-0">
                            <div className="flex justify-between mb-2">
                                <label className="text-xs font-bold uppercase text-[#475569]">
                                    Max Price
                                </label>
                                <span className="text-[#FF6B35] font-bold text-sm">
                                    ${maxPrice.toLocaleString()}
                                </span>
                            </div>
                            <input
                                type="range"
                                min="500"
                                max="5000"
                                step="100"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(Number(e.target.value))}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#1E88E5]"
                            />
                        </div>
                    </div>
                </motion.div>

                {/* RESULTS COUNT */}
                {!loading && (
                    <p className="text-sm text-[#475569] mb-6">
                        Showing <span className="font-bold text-[#0F172A]">{filtered.length}</span> destination{filtered.length !== 1 ? "s" : ""}
                    </p>
                )}

                {/* GRID */}
                {loading ? (
                    <div className="flex items-center justify-center h-64 text-[#475569]">
                        <Loader2 size={36} className="animate-spin" />
                    </div>
                ) : filtered.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-24 text-[#475569]"
                    >
                        <MapPin size={40} className="mx-auto mb-4 opacity-30" />
                        <p className="text-lg font-semibold">No destinations found</p>
                        <p className="text-sm mt-1">Try adjusting your filters</p>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <AnimatePresence>
                            {filtered.map((dest, i) => (
                                <motion.div
                                    key={dest._id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ delay: i * 0.06 }}
                                    className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group border border-slate-100"
                                >
                                    <div className="relative h-64 overflow-hidden">
                                        <img
                                            src={Array.isArray(dest.image) ? dest.image[0] : dest.image}
                                            alt={dest.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-[#00A896]">
                                            {dest.type}
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-2xl font-bold text-[#0F172A]">
                                                    {dest.name}
                                                </h3>
                                                <div className="flex items-center gap-1 text-[#475569]">
                                                    <MapPin size={14} />
                                                    <span className="text-sm">
                                                        {dest.country}, {dest.continent}
                                                    </span>
                                                </div>
                                                {dest.description && (
                                                    <p className="text-sm text-[#475569] mt-2">
                                                        {dest.description.length > 100 ? dest.description.substring(0, 100) + "..." : dest.description}
                                                    </p>
                                                )}
                                            </div>
                                            <p className="text-2xl font-bold text-[#FF6B35]">
                                                ${dest.price.toLocaleString()}
                                            </p>
                                        </div>

                                        <button
                                            onClick={() => navigate(`/destinations/${dest._id}`)}
                                            className="cursor-pointer w-full py-4 bg-[#1E88E5] text-white font-bold rounded-xl hover:bg-[#1565C0] transition-colors"
                                        >
                                            Explore Trip
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}