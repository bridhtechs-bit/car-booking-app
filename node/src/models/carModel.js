import mongoose from "mongoose";

const carSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Le nom de la voiture est requis"],
      trim: true
    },
    brand: {
      type: String,
      required: [true, "La marque est requise"],
      trim: true
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Le propriétaire est requis"]
    },
    category: {
      type: String,
      enum: ['sedan', 'suv', 'hatchback', 'coupe', 'convertible', 'van', 'sport'],
      required: [true, "La catégorie est requise"]
    },
    year: {
      type: Number,
      default: new Date().getFullYear()
    },
    transmission: {
      type: String,
      enum: ['manual', 'automatic'],
      default: 'automatic'
    },
    fuelType: {
      type: String,
      enum: ['Petrol', 'Diesel', 'Hybrid', 'Electric'],
      default: 'Petrol'
    },
    color: {
      type: String,
      default: 'Black'
    },
    mileage: {
      type: String,
      default: '0 km'
    },
    pricePerDay: {
      type: Number,
      required: [true, "Le prix par jour est requis"]
    },
    seats: {
      type: Number,
      default: 5,
      min: 2,
      max: 10
    },
    available: {
      type: Boolean,
      default: true
    },
    featured: {
      type: Boolean,
      default: false
    },
    description: {
      type: String,
      default: ''
    },
    features: [
      {
        type: String
      }
    ],
    images: [
      {
        type: String
      }
    ],
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    reviews: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

export default mongoose.model("Car", carSchema);