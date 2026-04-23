import express from "express";
import multer from "multer";
import {
  createPackage,
  getPackages,
  getAllPackagesAdmin,
  getFeaturedPackages,
  getPopularPackages,
  getPackageById,
  updatePackage,
  togglePackageVisibility,
  togglePackageFeatured,
  togglePackagePopular,
  deletePackage,
} from "../Controllers/PackageController.js";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

// ─── Public ────────────────────────────────────────────────────────────────
router.get("/featured", getFeaturedPackages);
router.get("/popular", getPopularPackages);
router.get("/", getPackages);
router.get("/:id", getPackageById);

// ─── Admin ─────────────────────────────────────────────────────────────────
router.get("/admin/all", getAllPackagesAdmin);
router.post("/", upload.array("images", 10), createPackage);
router.put("/:id", upload.array("images", 10), updatePackage);
router.patch("/:id/visibility", togglePackageVisibility);
router.patch("/:id/featured", togglePackageFeatured);
router.patch("/:id/popular", togglePackagePopular);
router.delete("/:id", deletePackage);

export default router;