"use client";

import React from "react";
import { Link } from "react-router-dom";
import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Mail,
  Phone,
  MapPin,
  ArrowUpRight
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0F172A] text-white pt-20 pb-10 px-6">
      <div className="max-w-7xl mx-auto">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

          {/* Brand Column */}
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold tracking-tight">
              Daryms  <span className="text-[#00A896]">Tour</span>
            </h2>
            <p className="text-[#475569] leading-relaxed">
              Crafting unforgettable journeys since 2010. We believe exploration
              is the best way to find yourself.
            </p>
            <div className="flex gap-4">
              {[Facebook, Instagram, Twitter, Youtube].map((Icon, index) => (
                <a
                  key={index}
                  href="#"
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#1E88E5] transition-all duration-300"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-6">Quick Links</h4>
            <ul className="space-y-4">
              {["About Us", "Our Packages", "Travel Insurance", "Help Center", "Privacy Policy"].map((link) => (
                <li key={link}>
                  <Link to="#" className="text-[#475569] hover:text-[#00A896] transition-colors flex items-center gap-2 group">
                    {link}
                    <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Top Destinations */}
          <div>
            <h4 className="text-lg font-bold mb-6">Top Destinations</h4>
            <ul className="space-y-4 text-[#475569]">
              {["Santorini, Greece", "Kyoto, Japan", "Bali, Indonesia", "Swiss Alps, Switzerland"].map((dest) => (
                <li key={dest} className="hover:text-white cursor-pointer transition-colors">
                  {dest}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-bold mb-6">Get in Touch</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-[#475569]">
                <MapPin size={20} className="text-[#1E88E5] shrink-0" />
                <span>123 Adventure Way, <br />Travel Suite 100</span>
              </li>
              <li className="flex items-center gap-3 text-[#475569]">
                <Phone size={20} className="text-[#1E88E5] shrink-0" />
                <span>+1 (555) 000-1234</span>
              </li>
              <li className="flex items-center gap-3 text-[#475569]">
                <Mail size={20} className="text-[#1E88E5] shrink-0" />
                <span>hello@DarymsTour.com</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-[#475569]">
          <p>© {currentYear} Daryms Tour . All rights reserved.</p>

        </div>
      </div>
    </footer>
  );
}