"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    CreditCard,
    ShieldCheck,
    ChevronRight,
    Calendar,
    User,
    PlaneTakeoff,
    Lock
} from "lucide-react";

export default function BookingPage() {
    const [step, setStep] = useState(1);

    // Mock data for summary
    const bookingSummary = {
        title: "Santorini Getaway",
        date: "June 12 - June 19, 2024",
        travelers: 2,
        basePrice: 2400,
        taxes: 150,
        total: 2550
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] pt-28 pb-20 px-6">
            <div className="max-w-6xl mx-auto">

                {/* Progress Tracker */}
                <div className="flex items-center justify-center mb-12 gap-4">
                    {[
                        { id: 1, label: "Traveler Info" },
                        { id: 2, label: "Payment Details" },
                        { id: 3, label: "Confirmation" }
                    ].map((s) => (
                        <React.Fragment key={s.id}>
                            <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step >= s.id ? "bg-[#00A896] text-white" : "bg-white text-[#475569] border border-slate-200"
                                    }`}>
                                    {s.id}
                                </div>
                                <span className={`text-sm font-bold hidden md:block ${step >= s.id ? "text-[#0F172A]" : "text-[#475569]"
                                    }`}>{s.label}</span>
                            </div>
                            {s.id < 3 && <div className="w-12 h-[2px] bg-slate-200" />}
                        </React.Fragment>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Booking Form */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Step 1: Traveler Details */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm"
                        >
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2 bg-[#1E88E5]/10 rounded-lg text-[#1E88E5]">
                                    <User size={24} />
                                </div>
                                <h2 className="text-2xl font-bold text-[#0F172A]">Traveler Information</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs font-bold uppercase text-[#475569] mb-2 block">First Name</label>
                                    <input type="text" className="w-full p-4 bg-[#F8FAFC] rounded-xl border border-slate-200 outline-none focus:ring-2 ring-[#1E88E5]/20" placeholder="John" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase text-[#475569] mb-2 block">Last Name</label>
                                    <input type="text" className="w-full p-4 bg-[#F8FAFC] rounded-xl border border-slate-200 outline-none focus:ring-2 ring-[#1E88E5]/20" placeholder="Doe" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-xs font-bold uppercase text-[#475569] mb-2 block">Email Address</label>
                                    <input type="email" className="w-full p-4 bg-[#F8FAFC] rounded-xl border border-slate-200 outline-none focus:ring-2 ring-[#1E88E5]/20" placeholder="john@example.com" />
                                </div>
                            </div>
                        </motion.div>

                        {/* Step 2: Payment (Visible or active based on step logic) */}
                        <motion.div
                            initial={{ opacity: 0.5 }}
                            className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-[#1E88E5]/10 rounded-lg text-[#1E88E5]">
                                        <CreditCard size={24} />
                                    </div>
                                    <h2 className="text-2xl font-bold text-[#0F172A]">Payment Method</h2>
                                </div>
                                <div className="flex gap-2">
                                    <div className="w-8 h-5 bg-slate-200 rounded" /> {/* Card Icon Placeholder */}
                                    <div className="w-8 h-5 bg-slate-200 rounded" />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="relative">
                                    <label className="text-xs font-bold uppercase text-[#475569] mb-2 block">Card Number</label>
                                    <input type="text" className="w-full p-4 bg-[#F8FAFC] rounded-xl border border-slate-200 outline-none" placeholder="**** **** **** 1234" />
                                    <Lock className="absolute right-4 top-10 text-slate-300" size={18} />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-xs font-bold uppercase text-[#475569] mb-2 block">Expiry Date</label>
                                        <input type="text" className="w-full p-4 bg-[#F8FAFC] rounded-xl border border-slate-200 outline-none" placeholder="MM/YY" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold uppercase text-[#475569] mb-2 block">CVV</label>
                                        <input type="text" className="w-full p-4 bg-[#F8FAFC] rounded-xl border border-slate-200 outline-none" placeholder="***" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Trust Badge */}
                        <div className="flex items-center gap-3 p-4 bg-[#00A896]/5 rounded-2xl border border-[#00A896]/10 text-[#00A896]">
                            <ShieldCheck size={20} />
                            <p className="text-sm font-medium">Your payment is encrypted and 100% secure.</p>
                        </div>
                    </div>

                    {/* Booking Summary Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-28 bg-[#0F172A] text-white rounded-3xl p-8 shadow-2xl">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <PlaneTakeoff size={20} className="text-[#00A896]" />
                                Booking Summary
                            </h3>

                            <div className="space-y-6 mb-8">
                                <div className="flex gap-4">
                                    <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0">
                                        <img src="https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=200" alt="Trip" className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <p className="font-bold">{bookingSummary.title}</p>
                                        <div className="flex items-center gap-1 text-white/60 text-sm mt-1">
                                            <Calendar size={14} />
                                            <span>7 Days</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 pt-6 border-t border-white/10">
                                    <div className="flex justify-between text-white/70">
                                        <span>{bookingSummary.travelers} Travelers</span>
                                        <span>${bookingSummary.basePrice}</span>
                                    </div>
                                    <div className="flex justify-between text-white/70">
                                        <span>Taxes & Fees</span>
                                        <span>${bookingSummary.taxes}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-4 border-t border-white/10">
                                        <span className="text-lg font-bold">Total Amount</span>
                                        <span className="text-3xl font-bold text-[#FF6B35]">${bookingSummary.total}</span>
                                    </div>
                                </div>
                            </div>

                            <button className="w-full py-5 bg-[#FF6B35] hover:bg-[#e85a24] text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 group shadow-lg shadow-orange-900/40">
                                Confirm & Pay
                                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </button>

                            <p className="mt-6 text-center text-xs text-white/40">
                                By clicking "Confirm & Pay" you agree to our Terms of Service and Cancellation Policy.
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}