import React, { useState, useEffect } from "react";

import Hero from "../Components/Home/Hero";

import CTASection from "../Components/Home/CTA";


import PopularDestinations from "../Components/Home/PopularDestinations";
import TopPackages from "../Components/Home/TopPackages";
import TrustSection from "../Components/Home/TrustSection";

const HomePage = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const handleVideoEnd = () => {
    setShowIntro(false);
  };


  return (
    <div className=" relative">
      {/*
{showIntro && (
  <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
    
    
      <button
        onClick={() => setShowIntro(false)}
        className="cursor-pointer absolute top-6 right-6 z-50 px-4 py-2 bg-white text-black rounded-full font-medium hover:bg-gray-200 transition"
      >
        Skip
      </button>

      <video
        className="w-full h-full object-cover"
        autoPlay
        muted
        playsInline
        onEnded={handleVideoEnd}
      >
        <source src={BG} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  )
} */}

      {/* 🧠 MAIN WEBSITE */}
      {/* { */}
      {/* !showIntro && ( */}
      <>
        <Hero />
        <PopularDestinations />
        <TopPackages />
        <TrustSection />
        <CTASection />

      </>
      {/* )} */}
      {/* } */}
    </div >
  );
};

export default HomePage;