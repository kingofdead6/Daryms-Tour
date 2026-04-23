"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Trash2, Mail, Loader2, RefreshCw } from "lucide-react";
import { API_BASE_URL } from "../../../api";

export default function AdminContacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

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
    if (!window.confirm("Delete this message?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/contacts/admin/${id}`);
      setContacts(contacts.filter(c => c._id !== id));
      toast.success("Message removed");
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  useEffect(() => { fetchContacts(); }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#0F172A]">Inquiries</h1>
          <button onClick={fetchContacts} className="text-[#1E88E5] hover:rotate-180 transition-all">
            <RefreshCw size={24} />
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
          {loading ? (
            <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-[#1E88E5]" /></div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[#475569] text-xs uppercase font-bold">
                <tr>
                  <th className="px-6 py-4">Sender</th>
                  <th className="px-6 py-4">Message</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {contacts.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-[#0F172A]">{c.name}</div>
                      <div className="text-sm text-[#475569]">{c.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-[#1E88E5]">{c.subject}</div>
                      <div className="text-sm text-[#475569] line-clamp-1">{c.message}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => deleteInquiry(c._id)} className="text-red-400 hover:text-red-600 p-2">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}