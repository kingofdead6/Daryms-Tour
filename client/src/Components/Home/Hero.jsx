"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import HeroBG from "../../assets/HomeBG.mp4";

export default function Hero() {
  const navigate = useNavigate();
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [travelers, setTravelers] = useState("1");

  const handleSearch = () => {
    navigate(
      `/destinations?search=${encodeURIComponent(destination)}`
    );
  };

  return (
    <section className="relative min-h-screen w-full overflow-hidden font-sans">

      {/* VIDEO */}
      <div className="absolute inset-0 z-0">
        <video autoPlay muted loop playsInline className="w-full h-full object-cover">
          <source src={HeroBG} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-br from-[#1E88E5]/70 to-[#00A896]/60 mix-blend-multiply" />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* CONTENT */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6 pt-20">
        <div className="max-w-5xl w-full text-center">

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Explore the World <br />
            <span className="text-[#00A896]">with Confidence</span>
          </h1>

          <p className="text-xl md:text-2xl text-white/90 mb-12">
            Find the best travel packages tailored for you
          </p>

          {/* SEARCH BAR */}
          <div className="bg-white p-4 rounded-2xl md:rounded-full shadow-2xl flex flex-col md:flex-row gap-2 max-w-4xl mx-auto">

            {/* DESTINATION INPUT */}
            <div className="flex-1 px-4 py-2">
              <label className="text-xs font-bold text-[#475569]">Destination</label>
              <input
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Where to?"
                className="w-full outline-none"
              />
            </div>

            {/* DATE */}
            <div className="flex-1 px-4 py-2">
              <label className="text-xs font-bold text-[#475569]">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full outline-none"
              />
            </div>

            {/* TRAVELERS */}
            <div className="flex-1 px-4 py-2">
              <label className="text-xs font-bold text-[#475569]">Travelers</label>
              <select
                value={travelers}
                onChange={(e) => setTravelers(e.target.value)}
                className="w-full outline-none"
              >
                <option value="1">1 Traveler</option>
                <option value="2">2 Travelers</option>
                <option value="group">Group</option>
              </select>
            </div>

            {/* BUTTON */}
            <button
              onClick={handleSearch}
              className="cursor-pointer px-8 py-4 bg-[#FF6B35] text-white font-bold rounded-xl md:rounded-full hover:bg-[#e85a24]"
            >
              Search Trips
            </button>

          </div>

        </div>
      </div>
    </section>
  );
}