"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "react-toastify";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Instagram, 
  Twitter, 
  Send,
  MessageSquare,
  Loader2
} from "lucide-react";
import { API_BASE_URL } from "../../../api";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "General Inquiry",
    message: ""
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // POSTing to your backend endpoint
      await axios.post(`${API_BASE_URL}/contacts`, formData);
      toast.success("Message sent successfully!");
      // Reset form
      setFormData({ name: "", email: "", subject: "General Inquiry", message: "" });
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(error.response?.data?.message || "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
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
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    type="text" 
                    required
                    placeholder="John Doe"
                    className="w-full p-4 bg-[#F8FAFC] rounded-xl border border-slate-200 outline-none focus:border-[#1E88E5] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-[#475569] mb-2 block">Email Address</label>
                  <input 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    type="email" 
                    required
                    placeholder="john@example.com"
                    className="w-full p-4 bg-[#F8FAFC] rounded-xl border border-slate-200 outline-none focus:border-[#1E88E5] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-[#475569] mb-2 block">Subject</label>
                <select 
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full p-4 bg-[#F8FAFC] rounded-xl border border-slate-200 outline-none focus:border-[#1E88E5] transition-colors"
                >
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Booking Support">Booking Support</option>
                  <option value="Custom Package Request">Custom Package Request</option>
                  <option value="Partnership">Partnership</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-[#475569] mb-2 block">Your Message</label>
                <textarea 
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="5"
                  required
                  placeholder="Tell us about your dream destination..."
                  className="w-full p-4 bg-[#F8FAFC] rounded-xl border border-slate-200 outline-none focus:border-[#1E88E5] transition-colors resize-none"
                ></textarea>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="cursor-pointer w-full py-4 bg-[#1E88E5] hover:bg-[#00A896] text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg shadow-blue-200 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Message
                    <Send size={18} />
                  </>
                )}
              </button>
            </form>
          </motion.div>

        </div>
      </div>
    </div>
  );
}