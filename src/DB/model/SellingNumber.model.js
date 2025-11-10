import mongoose from "mongoose";

const sellingNumberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    contactNumber: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    numberToSell: { type: String, required: true, trim: true },
    price: { type: String, required: true, trim: true },
    notes: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

const SellingNumberModel = mongoose.models.SellingNumber || mongoose.model("SellingNumber", sellingNumberSchema);

export default SellingNumberModel;

