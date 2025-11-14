import mongoose from "mongoose";

const numberSchema = new mongoose.Schema(
  {
    phoneNumber: { type: String, required: true, unique: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    status: { type: String, enum: ["available", "sold", "offer"], default: "available" },
  },
  { timestamps: true }
);

const NumberModel = mongoose.models.Number || mongoose.model("Number", numberSchema);

export default NumberModel;

