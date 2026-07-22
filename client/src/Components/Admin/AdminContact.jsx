"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../../api";
import {
  Search, ArrowLeft, Loader2, Trash2, Eye, X,
  Mail, MessageSquare, Calendar, User,
  RefreshCw, FileText, Tag, ChevronRight
} from "lucide-react";
import { Link } from "react-router-dom";

// --- Sub-component: Contact Drawer ---
function ContactDrawer({ inquiry, onClose }) {
  if (!inquiry) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex justify-end"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className="bg-white w-full max-w-lg h-full overflow-y-auto shadow-2xl border-l border-stone-200"
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-stone-200">
          <div>
            <h2 className="text-2xl font-serif text-stone-900">Message Details</h2>
            <p className="text-stone-400 text-sm font-mono mt-1">
              Received: {new Date(inquiry.createdAt).toLocaleString()}
            </p>
          </div>
          <button onClick={onClose} className="cursor-pointer text-stone-400 hover:text-stone-900 transition-colors">
            <X size={28} />
          </button>
        </div>

        <div className="p-8 space-y-8">
          {/* Sender Card */}
          <div>
            <h3 className="text-amber-600 text-xs uppercase tracking-widest mb-4">Sender Information</h3>
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                  <User size={20} />
                </div>
                <div>
                  <p className="text-stone-900 font-semibold text-lg">{inquiry.name}</p>
                  <p className="text-stone-400 text-sm">{inquiry.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Message Content */}
          <div>
            <h3 className="text-amber-600 text-xs uppercase tracking-widest mb-4">Inquiry Content</h3>
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Tag size={14} className="text-amber-600/70" />
                <span className="text-amber-700 font-medium px-2 py-0.5 rounded bg-amber-100 text-xs uppercase">
                  {inquiry.subject}
                </span>
              </div>
              <div className="pt-2 border-t border-stone-200">
                <p className="text-stone-700 leading-relaxed whitespace-pre-wrap italic font-serif text-lg">
                  "{inquiry.message}"
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full border border-stone-200 text-stone-500 py-4 rounded-2xl font-bold uppercase tracking-widest hover:bg-stone-50 hover:text-stone-900 transition-all mt-10"
          >
            Close Inquiry
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// --- Main Component ---
export default function AdminContacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/contacts/admin`);
      setContacts(res.data);
    } catch (err) {
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const deleteInquiry = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/contacts/admin/${id}`);
      setContacts(contacts.filter((c) => c._id !== id));
      toast.success("Inquiry removed permanently");
      setDeleteTarget(null);
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const filtered = contacts.filter((c) => {
    const searchStr = search.toLowerCase();
    return (
      c.name?.toLowerCase().includes(searchStr) ||
      c.email?.toLowerCase().includes(searchStr) ||
      c.subject?.toLowerCase().includes(searchStr)
    );
  });

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen relative pt-10 px-6 bg-stone-50"
    >
      {/* Detail Drawer */}
      <AnimatePresence>
        {selectedInquiry && (
          <ContactDrawer
            inquiry={selectedInquiry}
            onClose={() => setSelectedInquiry(null)}
          />
        )}
      </AnimatePresence>

      {/* Custom Delete Confirmation */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[110] flex items-center justify-center p-6"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white border border-red-200 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
            >
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} className="text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-2">Delete Inquiry?</h3>
              <p className="text-stone-400 text-sm mb-6">This message will be permanently removed from the database.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteTarget(null)}
                  className="flex-1 py-3 rounded-2xl border border-stone-200 text-stone-500 hover:text-stone-900 transition-all font-semibold">
                  Cancel
                </button>
                <button onClick={() => deleteInquiry(deleteTarget)}
                  className="flex-1 py-3 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold transition-all">
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-16">
          <div>
            <Link to="/admin/dashboard"
              className="text-amber-600 hover:text-amber-700 text-sm tracking-widest uppercase flex items-center gap-2 mb-4">
              <ArrowLeft size={18} /> Dashboard
            </Link>
            <h1 className="text-5xl md:text-7xl font-serif text-stone-900">Inquiries</h1>
            <p className="text-stone-500 text-xl mt-4">Review and manage customer messages.</p>
          </div>
          <button onClick={fetchContacts} className="cursor-pointer flex items-center gap-2 text-amber-600 hover:text-amber-700 transition-all">
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> Refresh List
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-5 items-start lg:items-center justify-between mb-8">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input
              type="text"
              placeholder="Search sender, email, or subject..."
              className="w-full bg-white border border-stone-200 rounded-2xl py-4 pl-12 pr-4 text-stone-900 outline-none focus:border-amber-400 transition-all placeholder-stone-300 shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="text-stone-400 text-sm font-mono">
            {filtered.length} MESSAGES FOUND
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-32 text-amber-500">
              <Loader2 size={40} className="animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-32 text-center text-stone-300 italic">
              <Mail size={48} className="mx-auto mb-4 opacity-40" />
              <p className="text-xl">No inquiries found matching your criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[800px]">
                <thead className="bg-stone-50 text-stone-400 text-[10px] uppercase tracking-[0.2em]">
                  <tr>
                    <th className="px-8 py-6">Sender</th>
                    <th className="px-8 py-6">Inquiry Preview</th>
                    <th className="px-8 py-6">Date Received</th>
                    <th className="px-8 py-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  <AnimatePresence>
                    {filtered.map((c, i) => (
                      <motion.tr
                        key={c._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: i * 0.05 }}
                        className="hover:bg-stone-50 transition-colors group cursor-pointer"
                        onClick={() => setSelectedInquiry(c)}
                      >
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600/60 group-hover:text-amber-600 transition-colors">
                              <User size={18} />
                            </div>
                            <div>
                              <p className="text-stone-900 font-semibold text-sm">{c.name}</p>
                              <p className="text-stone-400 text-xs font-mono">{c.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex flex-col gap-1">
                            <span className="text-amber-600 text-[10px] uppercase tracking-wider font-bold">
                              {c.subject}
                            </span>
                            <p className="text-stone-500 text-sm line-clamp-1 max-w-xs group-hover:text-stone-900 transition-colors">
                              {c.message}
                            </p>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2 text-stone-400 text-xs">
                            <Calendar size={14} />
                            {new Date(c.createdAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-3">
                            <button
                              onClick={() => setSelectedInquiry(c)}
                              className="p-3 text-stone-300 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(c._id)}
                              className="p-3 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </div>


      </div>
    </motion.section>
  );
}
