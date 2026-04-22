import mongoose from "mongoose";

const destinationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Destination name is required"],
      trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    duration: {
        type: String,
        required: true,
        trim: true
    },
    guided: {
        type: Boolean,
        default: false
    },
    includes: {
        type: [String],
        default: []
    },
    country: {
      type: String,
      required: [true, "Country is required"],
      trim: true,
    },
    continent: {
      type: String,
      required: [true, "Continent is required"],
      enum: ["Europe", "Asia", "Africa", "North America", "South America", "Oceania", "Antarctica"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    image: {
      type: [String],
      required: [true, "Destination image is required"],
    },
    type: {
      type: String,
      required: [true, "Trip type is required"],
      enum: ["Luxury", "Cultural", "Safari", "Adventure", "Historical", "Beach", "City Break"],
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
    isPopular: { type: Boolean, default: false }

  },
  { timestamps: true }
);

const Destination = mongoose.model("Destination", destinationSchema);
export default Destination;