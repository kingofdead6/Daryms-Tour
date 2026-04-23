"use client";

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, Users, Star, CheckCircle, Info, ArrowLeft, Loader2, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../../api";

export default function DestinationDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [destination, setDestination] = useState(null);
    const [loading, setLoading] = useState(true);

    // Slider state
    const [currentSlide, setCurrentSlide] = useState(0);

    // Booking state
    const [date, setDate] = useState("");
    const [travelers, setTravelers] = useState(1);

    useEffect(() => {
        const fetchDestination = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/destinations/${id}`);
                setDestination(res.data);
            } catch (err) {
                toast.error("Destination not found");
                navigate("/destinations");
            } finally {
                setLoading(false);
            }
        };
        fetchDestination();
    }, [id, navigate]);

    const heroImages = destination
        ? (Array.isArray(destination.image) ? destination.image : [destination.image])
        : [];

    const totalCost = destination ? destination.price * travelers : 0;

    // Slider functions
    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length);
    };

    const goToSlide = (index) => {
        setCurrentSlide(index);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 size={40} className="animate-spin text-[#1E88E5]" />
            </div>
        );
    }

    if (!destination) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <h1 className="text-2xl font-bold text-[#0F172A]">Destination not found</h1>
                <button
                    onClick={() => navigate("/destinations")}
                    className="cursor-pointer flex items-center gap-2 text-[#1E88E5] font-semibold"
                >
                    <ArrowLeft size={18} /> Back to Destinations
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">

            {/* HERO */}
            <section className="relative h-[70vh] w-full overflow-hidden">
                <motion.img
                    src={heroImages[0]}
                    initial={{ scale: 1.05, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="absolute inset-0 w-full h-full object-cover"
                    alt={destination.name}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Back button */}
                <button
                    onClick={() => navigate("/destinations")}
                    className="cursor-pointer absolute top-8 left-8 flex items-center gap-2 text-white/80 hover:text-white transition-colors bg-black/20 backdrop-blur px-4 py-2 rounded-full text-sm font-semibold"
                >
                    <ArrowLeft size={16} /> All Destinations
                </button>

                <div className="absolute bottom-12 left-12 text-white">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="flex items-center gap-2 text-white/70 text-sm mb-3">
                            <MapPin size={14} />
                            <span>{destination.country}, {destination.continent}</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold mb-4">
                            {destination.name} Getaway
                        </h1>

                        <div className="flex gap-4 items-center flex-wrap">
                            <span className="flex items-center gap-2 bg-[#FF6B35] px-4 py-1.5 rounded-full font-bold text-sm">
                                ${destination.price.toLocaleString()} / person
                            </span>
                            <span className="px-3 py-1.5 bg-white/20 backdrop-blur rounded-full text-sm font-semibold border border-white/30">
                                {destination.type}
                            </span>
                            <div className="flex items-center gap-1">
                                <Star size={16} className="fill-yellow-400 text-yellow-400" />
                                <span className="font-bold text-sm">4.9 (1.2k Reviews)</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* CONTENT */}
            <section className="py-16 px-6 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* MAIN */}
                    <div className="lg:col-span-2">

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <h2 className="text-3xl font-bold text-[#0F172A] mb-6">
                                Explore {destination.name}
                            </h2>

                            <p className="text-[#475569] text-lg leading-relaxed mb-10">
                                {destination.description || "Discover the beauty of this destination."}
                            </p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-12">
                                {[
                                    { icon: <Clock className="text-[#1E88E5] mb-2" />, label: "Duration", value: destination.duration || "N/A" },
                                    { icon: <Users className="text-[#00A896] mb-2" />, label: "Group Size", value: "Up to 12" },
                                    { icon: <Info className="text-[#1E88E5] mb-2" />, label: "Type", value: destination.type },
                                    { icon: <CheckCircle className="text-[#00A896] mb-2" />, label: "Guided", value: destination.guided ? "Yes" : "No" },
                                ].map(({ icon, label, value }) => (
                                    <motion.div
                                        key={label}
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-5 bg-[#F8FAFC] rounded-2xl border border-slate-100 hover:shadow-md transition-shadow"
                                    >
                                        {icon}
                                        <p className="text-xs text-[#475569] uppercase font-bold tracking-wide">{label}</p>
                                        <p className="font-bold text-[#0F172A] mt-1">{value}</p>
                                    </motion.div>
                                ))}
                            </div>

                            {/* INCLUDED */}
                            <h3 className="text-2xl font-bold text-[#0F172A] mb-6">
                                What's Included
                            </h3>

                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                                {(destination.includes && destination.includes.length > 0 ? destination.includes : [
                                    "5-star Hotel Accommodation",
                                    "Daily Breakfast & Dinner",
                                    "Airport Transfers",
                                    "Guided City Tours",
                                    "Private Boat Trip",
                                    "Entry to Archaeological Sites",
                                ]).map((item, i) => (
                                    <motion.li
                                        key={item}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.07 }}
                                        className="flex items-center gap-3 text-[#475569] bg-[#F8FAFC] p-4 rounded-xl border border-slate-100"
                                    >
                                        <div className="w-2 h-2 rounded-full bg-[#00A896] flex-shrink-0" />
                                        {item}
                                    </motion.li>
                                ))}
                            </ul>

                            {destination.plan && destination.plan.length > 0 && (
                                <>
                                    <h3 className="text-2xl font-bold text-[#0F172A] mb-6">
                                        Trip Plan
                                    </h3>
                                    <ol className="space-y-4 mb-10">
                                        {destination.plan.map((step, i) => (
                                            <motion.li
                                                key={step + i}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.07 }}
                                                className="rounded-2xl border border-slate-100 bg-[#F8FAFC] p-5 text-[#475569]"
                                            >
                                                <span className="font-bold text-[#0F172A] mr-2">{i + 1}.</span>
                                                {step}
                                            </motion.li>
                                        ))}
                                    </ol>
                                </>
                            )}

                            {/* Image Slider */}
                            {heroImages.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="mb-10"
                                >
                                    <h3 className="text-2xl font-bold text-[#0F172A] mb-6">
                                        Gallery
                                    </h3>
                                    <div className="relative w-full h-96 md:h-[500px] lg:h-[600px] overflow-hidden rounded-2xl">
                                        {/* Main Slider Image */}
                                        <motion.div
                                            key={currentSlide}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.5 }}
                                            className="w-full h-full"
                                        >
                                            <img
                                                src={heroImages[currentSlide]}
                                                alt={`${destination.name} ${currentSlide + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </motion.div>

                                        {/* Navigation Arrows */}
                                        {heroImages.length > 1 && (
                                            <>
                                                <button
                                                    onClick={prevSlide}
                                                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-200 backdrop-blur-sm"
                                                >
                                                    <ChevronLeft size={24} />
                                                </button>
                                                <button
                                                    onClick={nextSlide}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-200 backdrop-blur-sm"
                                                >
                                                    <ChevronRight size={24} />
                                                </button>
                                            </>
                                        )}

                                        {/* Dots Indicator */}
                                        {heroImages.length > 1 && (
                                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                                {heroImages.map((_, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => goToSlide(index)}
                                                        className={`w-3 h-3 rounded-full transition-all duration-200 ${
                                                            index === currentSlide
                                                                ? "bg-white"
                                                                : "bg-white/50 hover:bg-white/75"
                                                        }`}
                                                    />
                                                ))}
                                            </div>
                                        )}

                                        {/* Image Counter */}
                                        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                                            {currentSlide + 1} / {heroImages.length}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    </div>

                    {/* SIDEBAR BOOKING CARD */}
                    <div className="lg:col-span-1">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="sticky top-24 bg-white border border-slate-200 rounded-3xl p-8 shadow-xl shadow-slate-200/60"
                        >
                            <h4 className="text-xl font-bold text-[#0F172A] mb-1">
                                Book This Trip
                            </h4>
                            <p className="text-[#475569] text-sm mb-6">
                                Select your preferred date to see final pricing.
                            </p>

                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="text-xs font-bold uppercase text-[#475569] mb-1.5 block">
                                        Departure Date
                                    </label>
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full p-4 bg-[#F8FAFC] rounded-xl border border-slate-200 text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#1E88E5]/20"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase text-[#475569] mb-1.5 block">
                                        Number of Travelers
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={travelers}
                                        onChange={(e) => setTravelers(Number(e.target.value) || 1)}
                                        className="w-full p-4 bg-[#F8FAFC] rounded-xl border border-slate-200 text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#1E88E5]/20"
                                        placeholder="Enter number of travelers"
                                    />
                                </div>
                            </div>

                            {/* Price breakdown */}
                            <div className="bg-[#F8FAFC] rounded-2xl p-4 mb-6 space-y-2">
                                <div className="flex justify-between text-sm text-[#475569]">
                                    <span>${destination.price.toLocaleString()} × {travelers} traveler{travelers > 1 ? "s" : ""}</span>
                                    <span>${totalCost.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm text-[#475569]">
                                    <span>Service fee</span>
                                    <span>$0</span>
                                </div>
                                <div className="border-t border-slate-200 pt-2 flex justify-between items-center">
                                    <span className="font-bold text-[#0F172A]">Total</span>
                                    <span className="text-2xl font-bold text-[#FF6B35]">
                                        ${totalCost.toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            <button
                               onClick={() => {
  if (!date) {
    toast.warn("Please select a departure date");
    return;
  }

  navigate(
    `/booking?type=destination&id=${destination._id}&price=${destination.price}&title=${encodeURIComponent(destination.name)}&date=${date}&travelers=${travelers}`
  );
}}
                                   
                                className="cursor-pointer w-full py-4 bg-[#FF6B35] text-white font-bold rounded-xl shadow-lg shadow-orange-200/60 hover:bg-[#e85a24] transition-all active:scale-95"
                            >
                                Proceed to Checkout
                            </button>
                            

                            <p className="text-center text-xs text-[#475569] mt-4">
                                No payment charged yet · Free cancellation 48h before
                            </p>
                        </motion.div>
                    </div>

                </div>
            </section>
        </div>
    );
}