import { useState } from "react";
import { motion } from "framer-motion";
import { FaEye, FaEyeSlash, FaUser, FaLock } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API_BASE_URL } from "../../api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  const validate = () => {
    const e = {};

    if (!email.trim()) e.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(email))
      e.email = "Invalid email format";

    if (!password) e.password = "Password is required";
    else if (password.length < 6)
      e.password = "Password must be at least 6 characters";

    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/login`,
        { email, password }
      );

      const { token, usertype } = response.data;

      if (remember) {
        localStorage.setItem("token", token);
      } else {
        sessionStorage.setItem("token", token);
      }

      window.dispatchEvent(new Event("authChanged"));
      setErrors({});

      toast.success("Login successful");

      if (usertype === "admin" || usertype === "superadmin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    } catch (error) {
      const message =
        error.response?.data?.message || "Something went wrong";
      setErrors({ form: message });
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 bg-[#0c0a08]">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-light tracking-widest text-stone-100">
            Welcome Back
          </h1>
          <p className="mt-4 text-stone-400 font-light">
            Sign in to your account
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#11100e] border border-stone-800 rounded-3xl shadow-2xl p-10">
          {errors.form && (
            <div className="mb-6 p-4 bg-red-950/40 border border-red-800 text-red-300 rounded-xl text-center text-sm">
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-7">
            {/* Email */}
            <div>
              <label className="block text-sm text-stone-300 mb-2">
                Email
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center text-stone-500">
                  <FaUser />
                </div>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className={`w-full pl-12 pr-4 py-4 rounded-xl bg-[#0c0a08] border ${
                    errors.email
                      ? "border-red-700"
                      : "border-stone-700"
                  } text-stone-200 focus:outline-none focus:border-amber-400`}
                />
              </div>

              {errors.email && (
                <p className="mt-2 text-sm text-red-400">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm text-stone-300 mb-2">
                Password
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center text-stone-500">
                  <FaLock />
                </div>

                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className={`w-full pl-12 pr-12 py-4 rounded-xl bg-[#0c0a08] border ${
                    errors.password
                      ? "border-red-700"
                      : "border-stone-700"
                  } text-stone-200 focus:outline-none focus:border-amber-400`}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-4 flex items-center text-stone-500 hover:text-amber-400"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              {errors.password && (
                <p className="mt-2 text-sm text-red-400">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 bg-amber-500 text-black font-semibold rounded-2xl hover:bg-amber-400 transition shadow-lg disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}