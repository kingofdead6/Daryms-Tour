"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Instagram, 
  Twitter, 
  Send,
  MessageSquare
} from "lucide-react";

export default function Contact() {
  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form logic here
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-28 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Page Header */}
        <div className="mb-16 text-center lg:text-left">
          <h1 className="text-4xl md:text-6xl font-bold text-[#0F172A] mb-4">
            Let’s Plan Your <span className="text-[#1E88E5]">Next Trip</span>
          </h1>
          <p className="text-[#475569] text-lg max-w-2xl">
            Have questions about a package or need a custom itinerary? Our travel experts are ready to help you explore the world.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* Left Side: Contact Information */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-10"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-8">
              
              {/* Phone */}
              <div className="flex items-start gap-5">
                <div className="p-4 bg-white rounded-2xl shadow-sm text-[#1E88E5]">
                  <Phone size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#0F172A]">Call Us</h3>
                  <p className="text-[#475569] mt-1">Direct Line: 0555 55 70 09</p>
                  <p className="text-[#00A896] text-sm font-medium">Sun - Thu, 9am - 6pm</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-5">
                <div className="p-4 bg-white rounded-2xl shadow-sm text-[#00A896]">
                  <Mail size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#0F172A]">Email Us</h3>
                  <p className="text-[#475569] mt-1">hello@darymstour.com</p>
                  <p className="text-[#475569] mt-1">support@darymstour.com</p>
                </div>
              </div>

              {/* Office */}
              <div className="flex items-start gap-5">
                <div className="p-4 bg-white rounded-2xl shadow-sm text-[#1E88E5]">
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#0F172A]">Visit Our Office</h3>
                  <p className="text-[#475569] mt-1">
                    150 Rue Ali Remli, Bouzareah 16000, Algiers, Algeria
                  </p>
                </div>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="pt-10 border-t border-slate-200">
              <h4 className="text-[#0F172A] font-bold mb-6">Follow Our Journeys</h4>
              <div className="flex gap-4">
                {[Facebook, Instagram, Twitter].map((Icon, idx) => (
                  <button 
                    key={idx}
                    className="cursor-pointer w-12 h-12 rounded-xl bg-[#0F172A] text-white flex items-center justify-center hover:bg-[#00A896] transition-all duration-300 shadow-lg"
                  >
                    <Icon size={20} />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Side: Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-slate-200/60 border border-slate-100"
          >
            <div className="flex items-center gap-3 mb-8">
              <MessageSquare className="text-[#00A896]" size={28} />
              <h2 className="text-2xl font-bold text-[#0F172A]">Send a Message</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold uppercase text-[#475569] mb-2 block">Full Name</label>
                  <input 
                    type="text" 
                    placeholder="John Doe"
                    className="w-full p-4 bg-[#F8FAFC] rounded-xl border border-slate-200 outline-none focus:border-[#1E88E5] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-[#475569] mb-2 block">Email Address</label>
                  <input 
                    type="email" 
                    placeholder="john@example.com"
                    className="w-full p-4 bg-[#F8FAFC] rounded-xl border border-slate-200 outline-none focus:border-[#1E88E5] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-[#475569] mb-2 block">Subject</label>
                <select className="w-full p-4 bg-[#F8FAFC] rounded-xl border border-slate-200 outline-none focus:border-[#1E88E5] transition-colors">
                  <option>General Inquiry</option>
                  <option>Booking Support</option>
                  <option>Custom Package Request</option>
                  <option>Partnership</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-[#475569] mb-2 block">Your Message</label>
                <textarea 
                  rows="5"
                  placeholder="Tell us about your dream destination..."
                  className="w-full p-4 bg-[#F8FAFC] rounded-xl border border-slate-200 outline-none focus:border-[#1E88E5] transition-colors resize-none"
                ></textarea>
              </div>

              <button 
                type="submit"
                className="w-full py-4 bg-[#1E88E5] hover:bg-[#00A896] text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg shadow-blue-200"
              >
                Send Message
                <Send size={18} />
              </button>
            </form>
          </motion.div>

        </div>
      </div>
    </div>
  );
}