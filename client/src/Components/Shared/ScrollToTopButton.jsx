"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ duration: 0.25 }}
          onClick={scrollToTop}
          aria-label="Scroll to top"
          className="
            fixed z-50
            bottom-5 right-5
            sm:bottom-6 sm:right-6

            w-12 h-12 sm:w-14 sm:h-14
            flex items-center justify-center

            rounded-full
            bg-amber-500 text-black
            shadow-lg shadow-black/40

            hover:bg-amber-400 active:scale-95
            transition

            cursor-pointer
            select-none

            /* prevents iOS bottom bar overlap */
            pb-[env(safe-area-inset-bottom)]
            mr-[env(safe-area-inset-right)]
          "
        >
          <ArrowUp size={22} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}