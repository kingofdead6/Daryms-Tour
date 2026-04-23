import express from "express";
import { 
  submitContact, 
  getContacts, 
  deleteContact 
} from "../Controllers/ContactController.js";

const router = express.Router();

router.post("/", submitContact);
router.get("/admin", getContacts);
router.delete("/admin/:id", deleteContact);

export default router;