import Contact from "../Models/Contact.js";

// Save a new inquiry from the website
export const submitContact = async (req, res) => {
  try {
    const newContact = await Contact.create(req.body);
    res.status(201).json({ success: true, data: newContact });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Admin: View all inquiries
export const getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort("-createdAt");
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Delete an inquiry
export const deleteContact = async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    res.status(404).json({ success: false, message: "Inquiry not found" });
  }
};