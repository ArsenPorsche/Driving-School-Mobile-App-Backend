const mongoose = require("mongoose");

const OrderItemSchema = new mongoose.Schema({
  productCode: { type: String, required: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  quantity: { type: Number, min: 1, required: true },
  priceMinor: { type: Number, required: true },        
  totalLineMinor: { type: Number, required: true }, 
  entitlements: [{
    unit: { type: String, enum: ["lesson", "exam"], required: true },
    count: { type: Number, min: 1, required: true }
  }]
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true,
    index: true 
  },
  items: {
    type: [OrderItemSchema],
    validate: v => Array.isArray(v) && v.length > 0
  },
  totalMinor: { type: Number, required: true },
  currency: { type: String, default: "PLN" },
  status: { 
    type: String, 
    enum: ["pending", "paid", "failed", "refunded"], 
    default: "paid",
    index: true 
  },
  paymentMethod: { type: String },                     
}, { timestamps: true });


OrderSchema.index({ user: 1, createdAt: -1 });

OrderSchema.virtual('totalPLN').get(function() {
  return this.totalMinor / 100;
});

OrderSchema.methods.calculateEntitlements = function() {
  const totals = {};
  
  this.items.forEach(item => {
    item.entitlements.forEach(ent => {
      const key = ent.unit;
      const totalCount = ent.count * item.quantity;
      totals[key] = (totals[key] || 0) + totalCount;
    });
  });
  
  return totals;
};

const Order = mongoose.model("Order", OrderSchema);

module.exports = Order;
