import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, default: "General Inquiry" },
  message: { type: String, required: true },
  status: { 
    type: String, 
    enum: ["unread", "read", "replied"], 
    default: "unread" 
  },
  createdAt: { type: Date, default: Date.now }
});

const Contact = mongoose.model("Contact", contactSchema);
export default Contact;