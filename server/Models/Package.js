import mongoose from "mongoose";

const packageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Package title is required"],
      trim: true,
    },
    subtitle: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    originalPrice: {
      type: Number,
      default: null,
    },
    duration: {
      type: String,
      required: [true, "Duration is required"],
      trim: true,
    },
    maxGroupSize: {
      type: Number,
      default: 12,
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Moderate", "Challenging", "Expert"],
      default: "Moderate",
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ["Honeymoon", "Family", "Adventure", "Luxury", "Cultural", "Solo", "Group", "Business"],
    },
    images: {
      type: [String],
      default: [],
    },
    highlights: {
      type: [String],
      default: [],
    },
    includes: {
      type: [String],
      default: [],
    },
    excludes: {
      type: [String],
      default: [],
    },
    itinerary: [
      {
        day: Number,
        title: String,
        description: String,
      },
    ],
    destinations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Destination",
      },
    ],
    rating: {
      type: Number,
      default: 4.8,
      min: 0,
      max: 5,
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isPopular: {
      type: Boolean,
      default: false,
    },
    tags: {
      type: [String],
      default: [],
    },
    departureCity: {
      type: String,
      trim: true,
    },
    languages: {
      type: [String],
      default: ["English"],
    },
    minAge: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Package = mongoose.model("Package", packageSchema);
export default Package;