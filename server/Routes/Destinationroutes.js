import express from "express";
import multer from "multer";
import {
  createDestination,
  getDestinations,
  getAllDestinationsAdmin,
  getDestinationById,
  updateDestination,
  toggleVisibility,
  deleteDestination,
  getPopularDestinations,
  togglePopular,
} from "../Controllers/Destinationcontroller.js";

const router = express.Router();

// Multer — memory storage (for Cloudinary upload)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

router.get("/popular", getPopularDestinations);   

router.patch("/:id/popular", togglePopular);
// ─── Public ────────────────────────────────────────────────────────────────
// GET /api/destinations          → visible destinations only
router.get("/", getDestinations);

// GET /api/destinations/:id      → single destination
router.get("/:id", getDestinationById);



// ─── Admin ─────────────────────────────────────────────────────────────────
// GET  /api/destinations/admin/all        → all destinations (incl. hidden)
router.get("/admin/all", getAllDestinationsAdmin);

// POST /api/destinations                  → create with image upload
router.post("/", upload.array("images", 10), createDestination);

// PUT  /api/destinations/:id              → update (image optional)
router.put("/:id", upload.single("image"), updateDestination);

// PATCH /api/destinations/:id/visibility  → toggle visibility
router.patch("/:id/visibility", toggleVisibility);

// DELETE /api/destinations/:id            → delete
router.delete("/:id", deleteDestination);



export default router;