import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    // ─── What's being booked ──────────────────────────────────────────────
    bookingType: {
      type: String,
      enum: ["destination", "package"],
      required: [true, "Booking type is required"],
    },
    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Destination",
      default: null,
    },
    package: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Package",
      default: null,
    },

    // ─── Guest Info ───────────────────────────────────────────────────────
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, "Phone is required"],
      trim: true,
    },
    nationality: {
      type: String,
      trim: true,
    },
    passportNumber: {
      type: String,
      trim: true,
    },

    // ─── Trip Details ─────────────────────────────────────────────────────
    departureDate: {
      type: Date,
      required: [true, "Departure date is required"],
    },
    returnDate: {
      type: Date,
      default: null,
    },
    travelers: {
      adults: { type: Number, default: 1, min: 1 },
      children: { type: Number, default: 0, min: 0 },
      infants: { type: Number, default: 0, min: 0 },
    },

    // ─── Pricing ──────────────────────────────────────────────────────────
    pricePerPerson: {
      type: Number,
      required: true,
    },
    totalTravelers: {
      type: Number,
      required: true,
    },
    subtotal: {
      type: Number,
      required: true,
    },
    taxes: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },

    // ─── Special Requests ─────────────────────────────────────────────────
    specialRequests: {
      type: String,
      trim: true,
    },
    dietaryRequirements: {
      type: String,
      trim: true,
    },
    roomType: {
      type: String,
      enum: ["Standard", "Deluxe", "Suite", "Family Room"],
      default: "Standard",
    },

    // ─── Status ───────────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed", "no-show"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "partially_paid", "paid", "refunded"],
      default: "unpaid",
    },
    paymentMethod: {
      type: String,
      enum: ["credit_card", "bank_transfer", "paypal", "cash", "other"],
      default: "credit_card",
    },

    // ─── Internal Notes ───────────────────────────────────────────────────
    adminNotes: {
      type: String,
      trim: true,
    },
    referenceCode: {
      type: String,
      unique: true,
    },
  },
  { timestamps: true }
);

// Auto-generate reference code before saving
bookingSchema.pre("save", async function () {
  if (!this.referenceCode) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "BK-";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.referenceCode = code;
  }
});

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;