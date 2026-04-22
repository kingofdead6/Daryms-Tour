"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { API_BASE_URL } from "../../../api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Shield,
  ShieldCheck,
  Key,
  X,
} from "lucide-react";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [loading, setLoading] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    password: "",
    usertype: "admin",
  });

  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    usertype: "admin",
  });

  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      const res = await axios.get(`${API_BASE_URL}/auth/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUsers(
        res.data.filter(
          (u) => u.usertype === "admin" || u.usertype === "superadmin"
        )
      );
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterRole) {
      filtered = filtered.filter((u) => u.usertype === filterRole);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, filterRole]);

  /* ================= CREATE ================= */
  const handleCreate = async (e) => {
    e.preventDefault();

    if (createForm.password.length < 6)
      return toast.error("Password must be at least 6 characters");

    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      await axios.post(`${API_BASE_URL}/auth/register`, createForm, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("User created successfully");

      setShowCreateModal(false);
      setCreateForm({
        name: "",
        email: "",
        password: "",
        usertype: "admin",
      });

      fetchUsers();
    } catch {
      toast.error("Failed to create user");
    }
  };

  /* ================= UPDATE ================= */
  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      await axios.put(
        `${API_BASE_URL}/auth/users/${selectedUser._id}`,
        editForm,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("User updated");
      setShowEditModal(false);
      fetchUsers();
    } catch {
      toast.error("Update failed");
    }
  };

  /* ================= PASSWORD ================= */
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword)
      return toast.error("Passwords do not match");

    if (passwordForm.newPassword.length < 6)
      return toast.error("Password too short");

    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      await axios.put(
        `${API_BASE_URL}/auth/users/${selectedUser._id}/password`,
        { password: passwordForm.newPassword },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Password updated");
      setShowPasswordModal(false);
      setPasswordForm({ newPassword: "", confirmPassword: "" });
    } catch {
      toast.error("Failed to update password");
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!confirm("Delete this user?")) return;

    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      await axios.delete(`${API_BASE_URL}/auth/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("User deleted");
      fetchUsers();
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <section className="min-h-screen py-10 px-4 bg-[#0c0a08] text-stone-200 mt-16">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-light tracking-widest">
            User Management
          </h1>
        </div>

        {/* CONTROLS */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-4 bg-amber-500 text-black rounded-2xl font-semibold"
          >
            <Plus className="inline mr-2" /> Create User
          </button>

          <div className="flex flex-1 gap-4">

            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500" />
              <input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 py-4 bg-[#11100e] border border-stone-700 rounded-2xl"
              />
            </div>

            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-5 py-4 bg-[#11100e] border border-stone-700 rounded-2xl"
            >
              <option value="">All</option>
              <option value="admin">Admin</option>
              <option value="superadmin">Superadmin</option>
            </select>

          </div>
        </div>

        {/* USERS */}
        <div className="grid md:grid-cols-3 gap-6">

          {filteredUsers.map((user) => (
            <motion.div
              key={user._id}
              whileHover={{ y: -6 }}
              className="bg-[#11100e] border border-stone-800 rounded-2xl p-6 text-center"
            >
              {user.usertype === "superadmin" ? (
                <ShieldCheck className="mx-auto text-amber-400" size={50} />
              ) : (
                <Shield className="mx-auto text-stone-400" size={50} />
              )}

              <h3 className="mt-4 text-xl">{user.name}</h3>
              <p className="text-stone-400">{user.email}</p>

              <div className="mt-2 text-amber-400 text-sm">
                {user.usertype}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setSelectedUser(user);
                    setEditForm(user);
                    setShowEditModal(true);
                  }}
                  className="flex-1 py-2 bg-stone-800 rounded-xl"
                >
                  Edit
                </button>

                <button
                  onClick={() => {
                    setSelectedUser(user);
                    setShowPasswordModal(true);
                  }}
                  className="flex-1 py-2 bg-amber-500 text-black rounded-xl"
                >
                  Password
                </button>
              </div>

              {user.usertype !== "superadmin" && (
                <button
                  onClick={() => handleDelete(user._id)}
                  className="mt-4 w-full py-2 bg-red-600 rounded-xl"
                >
                  Delete
                </button>
              )}
            </motion.div>
          ))}

        </div>
      </div>

      {/* ================= MODALS ================= */}
      <AnimatePresence>

        {/* CREATE */}
        {showCreateModal && (
          <Modal title="Create User" onClose={() => setShowCreateModal(false)}>
            <form onSubmit={handleCreate} className="space-y-4">

              <Input
                label="Name"
                value={createForm.name}
                onChange={(e) =>
                  setCreateForm({ ...createForm, name: e.target.value })
                }
              />

              <Input
                label="Email"
                value={createForm.email}
                onChange={(e) =>
                  setCreateForm({ ...createForm, email: e.target.value })
                }
              />

              <Input
                label="Password"
                type="password"
                value={createForm.password}
                onChange={(e) =>
                  setCreateForm({ ...createForm, password: e.target.value })
                }
              />

              <button className="w-full py-3 bg-amber-500 text-black rounded-xl">
                Create
              </button>
            </form>
          </Modal>
        )}

        {/* EDIT */}
        {showEditModal && (
          <Modal title="Edit User" onClose={() => setShowEditModal(false)}>
            <form onSubmit={handleUpdate} className="space-y-4">

              <Input
                label="Name"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
              />

              <Input
                label="Email"
                value={editForm.email}
                onChange={(e) =>
                  setEditForm({ ...editForm, email: e.target.value })
                }
              />

              <button className="w-full py-3 bg-amber-500 text-black rounded-xl">
                Update
              </button>
            </form>
          </Modal>
        )}

        {/* PASSWORD */}
        {showPasswordModal && (
          <Modal
            title="Change Password"
            onClose={() => setShowPasswordModal(false)}
          >
            <form onSubmit={handleChangePassword} className="space-y-4">

              <Input
                label="New Password"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    newPassword: e.target.value,
                  })
                }
              />

              <Input
                label="Confirm Password"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    confirmPassword: e.target.value,
                  })
                }
              />

              <button className="w-full py-3 bg-amber-500 text-black rounded-xl">
                Update Password
              </button>
            </form>
          </Modal>
        )}

      </AnimatePresence>
    </section>
  );
}

/* ================= MODAL ================= */
function Modal({ title, children, onClose }) {
  return (
    <motion.div
      className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        className="bg-[#11100e] border border-stone-800 w-full max-w-lg rounded-3xl p-6 text-stone-200"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-light">{title}</h2>
          <button onClick={onClose}>
            <X />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}

/* ================= INPUT ================= */
function Input({ label, ...props }) {
  return (
    <div>
      <label className="text-sm text-stone-400">{label}</label>
      <input
        {...props}
        className="w-full mt-1 px-4 py-3 bg-[#0c0a08] border border-stone-700 rounded-xl"
      />
    </div>
  );
}