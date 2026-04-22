import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
  name: {   type: String,   required: true,   trim: true, },
  description: {   type: String,   trim: true, },
  image: {  type: String,  required: true,},
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, },
  isVisible: { type: Boolean, default: true },
}, {
  timestamps: true,
});

export default mongoose.model('MenuItem', menuItemSchema);
