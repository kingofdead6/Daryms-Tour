// src/pages/admin/AdminDashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [userType, setUserType] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        toast.error("Please log in to access the admin area.");
        navigate("/login");
        return;
      }

      try {
        const decoded = jwtDecode(token);
        if (decoded.usertype === "admin" || decoded.usertype === "superadmin") {
          setUserType(decoded.usertype);
        } else {
          toast.error("Unauthorized access.");
          navigate("/login");
        }
      } catch (error) {
        toast.error("Invalid token.");
        navigate("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkToken();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    toast.success("Logged out successfully.");
    navigate("/login");
  };

  const adminSections = [
    { 
      path: "/admin/gallery", 
      title: "Manage Gallery", 
      description: "Manage your gallery images" 
    },
    { 
      path: "/admin/menu", 
      title: "Manage Menu", 
      description: "Edit and organize your menu items" 
    },
    {
      path: "/admin/reservations",
      title: "Manage Reservations",
      description: "View and manage customer reservations"
    },
  ];

  const superadminSections = [
    ...adminSections,
    { 
      path: "/admin/users", 
      title: "Manage Users", 
      description: "Add, edit, or remove users" 
    },
    { 
      path: "/admin/categories", 
      title: "Manage Categories", 
      description: "Organize menu and content categories" 
    },
    { 
      path: "/admin/signature-dishes", 
      title: "Manage Signature Dishes", 
      description: "Curate your restaurant's signature dishes" 
    },
    {
      path: "/admin/tables",
      title: "Manage Tables",
      description: "View and manage your restaurant's tables"
    }
  ];

  const sections = userType === "superadmin" ? superadminSections : adminSections;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0c0a08] flex items-center justify-center">
        <p className="text-amber-100/70 text-xl font-light tracking-widest">
          Preparing the space...
        </p>
      </div>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen py-20 pt-32 relative bg-gradient-to-b from-[#0c0a08] via-[#1a1612] to-[#0f0c0a] overflow-hidden"
    >
      {/* Subtle background texture */}
      <div className="absolute inset-0 bg-[radial-gradient(#2a241f_0.8px,transparent_1px)] bg-[length:70px_70px] opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-20">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-amber-400 text-sm tracking-[4px] uppercase font-light mb-4"
          >
            Administration
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="text-5xl md:text-7xl font-serif tracking-wider text-white"
          >
            {userType === "superadmin" ? "Master Control" : "Control Center"}
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 text-2xl text-amber-100/70 font-light max-w-2xl mx-auto"
          >
            Everything in its place.<br />
            Every detail attended to.
          </motion.p>
        </div>

        {/* Dashboard Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: index * 0.1 }}
              whileHover={{ y: -12, scale: 1.02 }}
              className="group"
            >
              <Link to={section.path}>
                <div className="bg-[#1a1612] border border-amber-900/30 rounded-3xl p-10 h-full flex flex-col justify-between transition-all duration-500 hover:border-amber-400/30 hover:shadow-2xl">
                  <div>
                    <h2 className="text-3xl font-serif tracking-wide text-white group-hover:text-amber-100 transition-colors">
                      {section.title}
                    </h2>
                    <p className="mt-6 text-amber-100/70 font-light leading-relaxed text-lg">
                      {section.description}
                    </p>
                  </div>

                  <div className="mt-12 flex justify-end">
                    <span className="inline-flex items-center text-sm uppercase tracking-[2px] font-light text-amber-400 group-hover:text-amber-300 transition-all">
                      Enter
                      <svg 
                        className="w-5 h-5 ml-3 group-hover:translate-x-2 transition-transform" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Closing poetic line + Logout */}
        <div className="mt-28 text-center">
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-amber-100/60 text-lg tracking-wide max-w-md mx-auto font-light"
          >
            In this space, order becomes the only luxury.
          </motion.p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="mt-12 px-14 py-5 bg-transparent border border-amber-900/50 hover:border-amber-400/50 text-amber-100/80 hover:text-white text-lg font-light tracking-widest rounded-2xl transition-all duration-300"
          >
            Return to Stillness
          </motion.button>
        </div>
      </div>
    </motion.section>
  );
}