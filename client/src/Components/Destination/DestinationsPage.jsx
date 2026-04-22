"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

/* ✅ EXPORT so details page can reuse it */
export const FAKE_DESTINATIONS = [
    { id: 1, name: "Santorini", country: "Greece", continent: "Europe", price: 1200, image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=800", type: "Luxury" },
    { id: 2, name: "Kyoto", country: "Japan", continent: "Asia", price: 1800, image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800", type: "Cultural" },
    { id: 3, name: "Maasai Mara", country: "Kenya", continent: "Africa", price: 2500, image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=800", type: "Safari" },
    { id: 4, name: "Banff", country: "Canada", continent: "North America", price: 900, image: "https://images.unsplash.com/photo-1517059224940-d4af9eec41b7?q=80&w=800", type: "Adventure" },
    { id: 5, name: "Machu Picchu", country: "Peru", continent: "South America", price: 1500, image: "https://images.unsplash.com/photo-1587590227264-0ac64ce63ce8?q=80&w=800", type: "Historical" },
];

export default function DestinationsPage() {
    const [search, setSearch] = useState("");
    const [continent, setContinent] = useState("All");
    const [maxPrice, setMaxPrice] = useState(3000);

    const navigate = useNavigate();

    const filtered = FAKE_DESTINATIONS.filter(d =>
        (continent === "All" || d.continent === continent) &&
        d.price <= maxPrice &&
        d.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC] pt-24 pb-20 px-6">
            <div className="max-w-7xl mx-auto">

                {/* HEADER */}
                <div className="mb-12">
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
                                    className="w-full pl-10 pr-4 py-3 bg-[#F8FAFC] rounded-xl outline-none focus:ring-2 ring-[#1E88E5]/20"
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* CONTINENT */}
                        <div className="w-full lg:w-48">
                            <label className="text-xs font-bold uppercase text-[#475569] mb-2 block">
                                Continent
                            </label>
                            <select
                                className="w-full p-3 bg-[#F8FAFC] rounded-xl outline-none"
                                onChange={(e) => setContinent(e.target.value)}
                            >
                                <option value="All">All Continents</option>
                                <option value="Europe">Europe</option>
                                <option value="Asia">Asia</option>
                                <option value="Africa">Africa</option>
                                <option value="North America">North America</option>
                                <option value="South America">South America</option>
                            </select>
                        </div>

                        {/* PRICE */}
                        <div className="w-full lg:w-64">
                            <div className="flex justify-between mb-2">
                                <label className="text-xs font-bold uppercase text-[#475569]">
                                    Max Price
                                </label>
                                <span className="text-[#FF6B35] font-bold">
                                    ${maxPrice}
                                </span>
                            </div>
                            <input
                                type="range"
                                min="500"
                                max="3000"
                                step="100"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(Number(e.target.value))}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#1E88E5]"
                            />
                        </div>
                    </div>
                </div>

                {/* GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <AnimatePresence>
                        {filtered.map((dest) => (
                            <motion.div
                                key={dest.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-shadow group border border-slate-100"
                            >
                                <div className="relative h-64 overflow-hidden">
                                    <img
                                        src={dest.image}
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
                                        </div>
                                        <p className="text-2xl font-bold text-[#FF6B35]">
                                            ${dest.price}
                                        </p>
                                    </div>

                                    {/* ✅ NAVIGATION BUTTON */}
                                    <button
                                        onClick={() => navigate(`/destinations/${dest.id}`)}
                                        className="w-full py-4 bg-[#1E88E5] text-white font-bold rounded-xl hover:bg-[#1565C0] transition-colors"
                                    >
                                        Explore Trip
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

            </div>
        </div>
    );
}