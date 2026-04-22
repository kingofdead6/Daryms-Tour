import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  guests: { type: Number, required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  time: { type: String, required: true },
  table: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending'
  },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 60 * 60 * 1000) } // 1 hour from creation
}, { timestamps: true });


reservationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('Reservation', reservationSchema);