import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { API_BASE_URL } from "../../../api";

export const getToken = () =>
  localStorage.getItem("token") || sessionStorage.getItem("token");

export const getUserType = () => {
  const token = getToken();
  if (!token) return null;
  try {
    return jwtDecode(token).usertype || null;
  } catch {
    return null;
  }
};

export const isSuperAdmin = () => getUserType() === "superadmin";

// Axios instance that always carries the admin token.
const adminApi = axios.create({ baseURL: API_BASE_URL });

adminApi.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default adminApi;

// ─── Formatting helpers shared across the admin panel ───────────────────────
export const formatCurrency = (value, { compact = false, currency = "USD" } = {}) => {
  const number = Number(value) || 0;
  if (compact && Math.abs(number) >= 1000) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(number);
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: Number.isInteger(number) ? 0 : 2,
  }).format(number);
};

export const formatNumber = (value) =>
  new Intl.NumberFormat("en-US").format(Number(value) || 0);

export const formatPercent = (value, digits = 1) =>
  `${(Number(value) || 0).toFixed(digits)}%`;

export const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export const humanize = (value) =>
  String(value || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

export const apiError = (err, fallback = "Something went wrong") =>
  err?.response?.data?.message || err?.message || fallback;
