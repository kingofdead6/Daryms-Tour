"use client";

import React, { useRef } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { motion } from "framer-motion";
import cheffpic from "../../assets/about/Maincheff.png";
const chefs = [
  {
    id: 1,
    name: "Chef Matteo Rossi",
    image: cheffpic,
  },
  {
    id: 2,
    name: "Chef Elena Moreau",
    image: cheffpic,
  },
  {
    id: 3,
    name: "Chef Lucas Beaumont",
    image: cheffpic,
  },
  {
    id: 4,
    name: "Chef Amélie Laurent",
    image: cheffpic,
  },
];

export default function ChefsCarousel() {
  const sliderRef = useRef(null);

  const settings = {
    dots: false,
    infinite: true,
    speed: 8000,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 0,
    cssEase: "linear",
    pauseOnHover: true,
    arrows: false,
    centerMode: true,
    centerPadding: "40px",
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 2,
          centerPadding: "30px",
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          centerPadding: "20px",
        },
      },
    ],
  };

  return (
    <section className="relative   overflow-hidden">
      {/* Background texture */}
      <div className="absolute inset-0 bg-[radial-gradient(#2a241f_0.6px,transparent_1px)] bg-[length:60px_60px] opacity-30" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-7xl font-serif tracking-wider text-white">
            Our staff
          </h2>
          <p className="mt-4 text-amber-100/60 text-lg max-w-md mx-auto">
            Masters of restraint and precision
          </p>
        </div>

        {/* Carousel */}
        <Slider ref={sliderRef} {...settings}>
          {chefs.map((chef, index) => (
            <motion.div
              key={chef.id}
              className="px-3 md:px-4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: index * 0.05 }}
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3] group">
                <img
                  src={chef.image}
                  alt={chef.name}
                  className="w-full h-full object-cover transition-transform duration-[14000ms] group-hover:scale-105"
                />
                
                {/* Elegant dark overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                
                {/* Name only - Minimal & Elegant */}
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-10">
                  <h3 className="text-3xl md:text-4xl font-serif text-white tracking-wide">
                    {chef.name}
                  </h3>
                </div>
              </div>
            </motion.div>
          ))}
        </Slider>

      </div>
    </section>
  );
}