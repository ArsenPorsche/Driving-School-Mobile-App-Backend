const mongoose = require("mongoose");

const EntitlementSchema = new mongoose.Schema({
  unit: {
    type: String,
    enum: ["lesson", "exam"],
    required: true
  },
  count: {
    type: Number,
    min: 1,
    required: true
  }
}, { _id: false });

const productSchema = new mongoose.Schema({
  code: { type: String, unique: true, required: true },
  title: { type: String, required: true },
  description: { type: String },
  category: { type: String, enum: ["single","bundle","course"], required: true },
  priceMinor: { type: Number, required: true },                
  currency: { type: String, default: "PLN" },
  entitlements: {
    type: [EntitlementSchema],
    validate: v => v.length > 0
  },
  active: { type: Boolean, default: true }
}, { timestamps: true });
const Product = mongoose.model("Product", productSchema);

module.exports = Product;