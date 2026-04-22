import mongoose from 'mongoose';

const signaturedishesSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    poetic: { type: String, trim: true },
    image: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model('SignatureDish', signaturedishesSchema);