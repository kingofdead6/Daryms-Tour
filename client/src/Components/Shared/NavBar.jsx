"use client";

import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { jwtDecode } from "jwt-decode";

const DOT_SIZE = 22;

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [userType, setUserType] = useState(null);
  const [introState, setIntroState] = useState("idle"); 
  const introPlayedRef = useRef(false);
  const pillRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // detect mobile
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" && window.innerWidth < 768
  );
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  // close on route change
  useEffect(() => { setOpen(false); }, [location.pathname]);

  // outside click
  useEffect(() => {
    if (!open) return;
    const h = (e) => {
      if (pillRef.current && !pillRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  // auth
  const checkAuth = () => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
      try { setUserType(jwtDecode(token).usertype); }
      catch { setUserType(null); }
    } else {
      setUserType(null);
    }
  };
  useEffect(() => {
    checkAuth();
    const h = () => checkAuth();
    window.addEventListener("storage", h);
    window.addEventListener("authChanged", h);
    return () => {
      window.removeEventListener("storage", h);
      window.removeEventListener("authChanged", h);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    setUserType(null);
    window.dispatchEvent(new Event("authChanged"));
    navigate("/login");
  };

  // intro animation — runs once on mount
  useEffect(() => {
    if (introPlayedRef.current) return;
    introPlayedRef.current = true;
    const t1 = setTimeout(() => {
      setIntroState("expanding");
      const t2 = setTimeout(() => {
        setIntroState("collapsing");
        const t3 = setTimeout(() => setIntroState("idle"), 440);
        return () => clearTimeout(t3);
      }, 860);
      return () => clearTimeout(t2);
    }, 600);
    return () => clearTimeout(t1);
  }, []);

  // nav items
  const normalNavItems = [
    { name: "Home", link: "/" },
    { name: "Destinations", link: "/destinations" },
    { name: "Packages", link: "/packages" },
    { name: "contact", link: "/contact" },
  ];
  const adminNavItems = [
    { name: "Dashboard", link: "/admin/dashboard" },
    { name: "Bookings", link: "/admin/bookings" },
  ];
  const superadminNavItems = [
    { name: "Dashboard", link: "/admin/dashboard" },
    { name: "Bookings", link: "/admin/bookings" },
    { name: "Destinations", link: "/admin/destinations" },
    { name: "Packages", link: "/admin/packages" },
    { name: "Users", link: "/admin/users" },
    { name: "Contact", link: "/admin/contact" },
  ];
  const navItems =
    userType === "superadmin" ? superadminNavItems :
      userType === "admin" ? adminNavItems :
        normalNavItems;
  const isAdmin = userType === "admin" || userType === "superadmin";

  const isExpanded = open || introState === "expanding";
  const introDone = introState === "idle";
  const goToBooking = () => navigate("/booking");

  // pill animate target
  const pillAnimate = (() => {
    if (introState === "expanding") {
      return isMobile
        ? { width: "100vw", height: "100vh", borderRadius: 20 }
        : { width: isAdmin ? 760 : 660, height: isAdmin ? 72 : 62, borderRadius: 31 };
    }
    if (open) {
      return isMobile
        ? { width: "90vw", height: "50vh", borderRadius: 20 }
        : { width: isAdmin ? 760 : 660, height: isAdmin ? 72 : 62, borderRadius: 31 };
    }
    return { width: DOT_SIZE, height: DOT_SIZE, borderRadius: 999 };
  })();

  const pillTransition = (() => {
    if (introState === "expanding") return { type: "spring", stiffness: 255, damping: 23 };
    if (introState === "collapsing") return { type: "spring", stiffness: 340, damping: 30 };
    return { type: "spring", stiffness: 280, damping: 28 };
  })();

  const shellStyle = isMobile
    ? { position: "fixed", top: 18, right: 18, zIndex: 1000, display: "flex", flexDirection: "column", alignItems: "flex-end" }
    : { position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", zIndex: 1000, display: "flex", flexDirection: "column", alignItems: "center" };

  return (
    <>
      <div style={shellStyle}>
        <motion.div
          ref={pillRef}
          onClick={() => { if (!open && introDone) setOpen(true); }}
          animate={pillAnimate}
          transition={pillTransition}
          style={{
            background: isExpanded ? "#0F172A" : "#1E88E5",
            overflow: "hidden",
            cursor: isExpanded ? "default" : "pointer",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: isExpanded
              ? "0 10px 50px rgba(15,23,42,0.24), 0 0 0 1px rgba(30,136,229,0.2)"
              : `0 0 0 5px rgba(30,136,229,0.18), 0 4px 16px rgba(30,136,229,0.32)`,
          }}
        >
          {/* Pulse rings */}
          <AnimatePresence>
            {!open && introDone && (
              <>
                <motion.div key="p1"
                  initial={{ scale: 1, opacity: 0.5 }}
                  animate={{ scale: 3.6, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 2.1, repeat: Infinity, ease: "easeOut" }}
                  style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#1E88E5", pointerEvents: "none" }}
                />
                <motion.div key="p2"
                  initial={{ scale: 1, opacity: 0.28 }}
                  animate={{ scale: 2.9, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 2.1, repeat: Infinity, ease: "easeOut", delay: 0.65 }}
                  style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#1E88E5", pointerEvents: "none" }}
                />
              </>
            )}
          </AnimatePresence>

          {/* Accent stripe (desktop) */}
          <AnimatePresence>
            {isExpanded && !isMobile && (
              <motion.div key="stripe"
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 0.55, scaleX: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.28, duration: 0.4 }}
                style={{
                  position: "absolute", bottom: 0, left: "18%", width: "64%", height: 2,
                  background: "linear-gradient(90deg, transparent, #00A896, #1E88E5, transparent)",
                  borderRadius: 2, pointerEvents: "none",
                }}
              />
            )}
          </AnimatePresence>

          {/* DESKTOP inner content */}
          <AnimatePresence>
            {isExpanded && !isMobile && (
              <motion.div key="desk-inner"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.2, duration: 0.2 }}
                style={{
                  display: "flex", alignItems: "center",
                  width: "100%", padding: "0 8px 0 18px",
                  whiteSpace: "nowrap", gap: 0, height: 62,
                }}
              >
                <LogoMark />
                <div style={{ width: 1, height: 22, background: "rgba(255,255,255,0.1)", margin: "0 14px", flexShrink: 0 }} />
                <nav style={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
                  {navItems.map((item) => (
                    <NavLink key={item.link} item={item} active={location.pathname === item.link} />
                  ))}
                </nav>
                {isAdmin
                  ? <LogoutBtn onClick={handleLogout} />
                  : <CtaBtn label="Book now" onClick={goToBooking} />
                }
                <CloseBtn onClick={(e) => { e.stopPropagation(); setOpen(false); }} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* MOBILE inner content */}
          <AnimatePresence>
            {isExpanded && isMobile && (
              <motion.div key="mob-inner"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.2, duration: 0.2 }}
                style={{ width: "100%", padding: "16px 18px 18px" }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                  <LogoMark />
                  <CloseBtn onClick={(e) => { e.stopPropagation(); setOpen(false); }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 14 }}>
                  {navItems.map((item) => (
                    <MobileNavLink
                      key={item.link}
                      item={item}
                      active={location.pathname === item.link}
                      onClick={() => setOpen(false)}
                    />
                  ))}
                </div>
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 14 }}>
                  {isAdmin
                    ? <LogoutBtn mobile onClick={handleLogout} />
                    : <CtaBtn mobile label="Book now" onClick={goToBooking} />
                  }
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

    </>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function LogoMark() {
  return (
    <Link to="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", flexShrink: 0 }}>
      <div style={{
        width: 28, height: 28, borderRadius: "50%",
        background: "linear-gradient(135deg, #1E88E5, #00A896)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
          <path d="M6 1L10 4V8L6 11L2 8V4Z" fill="white" fillOpacity=".9" />
        </svg>
      </div>
      <span style={{ fontSize: 15, fontWeight: 700, color: "#fff", letterSpacing: "-.02em" }}>Daryms Tour</span>
    </Link>
  );
}

function NavLink({ item, active }) {
  const [hov, setHov] = useState(false);
  return (
    <Link
      to={item.link}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        fontSize: 13.5, fontWeight: 500,
        color: active || hov ? "#fff" : "rgba(255,255,255,0.58)",
        background: active ? "rgba(30,136,229,0.28)" : hov ? "rgba(255,255,255,0.08)" : "transparent",
        textDecoration: "none",
        padding: "7px 12px", borderRadius: 22,
        transition: "color .2s, background .2s",
      }}
    >
      {item.name}
    </Link>
  );
}

function MobileNavLink({ item, active, onClick }) {
  return (
    <Link
      to={item.link}
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        fontSize: 15, fontWeight: 500,
        color: active ? "#fff" : "rgba(255,255,255,0.65)",
        background: active ? "rgba(30,136,229,0.22)" : "transparent",
        textDecoration: "none",
        padding: "11px 14px", borderRadius: 14,
        transition: "color .2s, background .2s",
      }}
    >
      {item.name}
      <span style={{ opacity: active ? 0.85 : 0.35, color: active ? "#1E88E5" : "inherit", fontSize: 13 }}>›</span>
    </Link>
  );
}

function CtaBtn({ label, mobile = false, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: "#1E88E5", color: "#fff", border: "none",
      borderRadius: mobile ? 14 : 22,
      padding: mobile ? "12px 0" : "8px 16px",
      width: mobile ? "100%" : "auto",
      fontSize: mobile ? 14 : 13, fontWeight: 600,
      cursor: "pointer", fontFamily: "inherit",
      ...(mobile ? {} : { marginRight: 8, flexShrink: 0 }),
    }}>
      {label}
    </button>
  );
}

function LogoutBtn({ onClick, mobile = false }) {
  return (
    <button onClick={onClick} style={{
      background: "rgba(255,107,53,0.14)", color: "#FF6B35",
      border: "1px solid rgba(255,107,53,0.3)",
      borderRadius: mobile ? 14 : 22,
      padding: mobile ? "12px 0" : "7px 14px",
      width: mobile ? "100%" : "auto",
      fontSize: mobile ? 14 : 12, fontWeight: 600,
      cursor: "pointer", fontFamily: "inherit",
      ...(mobile ? {} : { marginRight: 8, flexShrink: 0 }),
    }}>
      Logout
    </button>
  );
}

function CloseBtn({ onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: 34, height: 34, borderRadius: "50%", border: "none",
        background: hov ? "rgba(255,107,53,0.2)" : "rgba(255,255,255,0.07)",
        color: hov ? "#FF6B35" : "rgba(255,255,255,0.5)",
        cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, marginRight: 6,
        transition: "background .2s, color .2s",
      }}
    >
      <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
        <path d="M1 1l9 9M10 1L1 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </button>
  );
}