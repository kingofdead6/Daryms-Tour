"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Headphones, Hotel, MapPin } from "lucide-react";

const features = [
    {
        icon: <ShieldCheck size={40} className="text-[#1E88E5]" />,
        title: "Best Price Guarantee",
        description: "Found a better price? We'll match it, no questions asked. Your dream trip shouldn't break the bank."
    },
    {
        icon: <Headphones size={40} className="text-[#00A896]" />,
        title: "24/7 Support",
        description: "Our dedicated travel experts are always a call or message away, no matter the time zone."
    },
    {
        icon: <Hotel size={40} className="text-[#1E88E5]" />,
        title: "Verified Hotels",
        description: "Every hotel in our catalog is hand-picked and personally vetted for quality and comfort."
    },
    {
        icon: <MapPin size={40} className="text-[#00A896]" />,
        title: "Custom Packages",
        description: "Tailor your itinerary to your exact needs. We build the trip around you, not the other way around."
    }
];

export default function TrustSection() {
    return (
        <section className="py-24 bg-[#F8FAFC]">
            <div className="max-w-7xl mx-auto px-6">

                {/* Section Header */}
                <div className="text-center max-w-2xl mx-auto mb-20">
                    <motion.span
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="text-[#00A896] font-bold tracking-[0.2em] uppercase text-sm"
                    >
                        Why Choose Us
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-bold text-[#0F172A] mt-4"
                    >
                        Your journey, protected and perfected.
                    </motion.h2>
                </div>

                {/* Feature Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="group text-center"
                        >
                            {/* Icon Container */}
                            <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white shadow-sm group-hover:shadow-xl group-hover:-translate-y-2 transition-all duration-300">
                                {feature.icon}
                            </div>

                            {/* Text Content */}
                            <h3 className="text-xl font-bold text-[#0F172A] mb-3">
                                {feature.title}
                            </h3>
                            <p className="text-[#475569] leading-relaxed text-sm">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* Subtle Credibility Bar */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-20 pt-10 border-t border-slate-200 flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500"
                >
                    {/* Use placeholders for trust badges/logos if needed */}
                    <span className="font-bold text-xl text-[#475569]">TRUSTED PARTNER</span>
                    <span className="font-bold text-xl text-[#475569]">IATA CERTIFIED</span>
                    <span className="font-bold text-xl text-[#475569]">SECURE PAYMENTS</span>
                </motion.div>
            </div>
        </section>
    );
}