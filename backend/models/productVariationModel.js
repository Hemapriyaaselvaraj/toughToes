// models/productVariationModel.js
const mongoose = require('mongoose');

const productVariationSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'product', required: true },
  product_size_id: { type: mongoose.Schema.Types.ObjectId, ref: 'product_size', required: true },
  product_color_id: { type: mongoose.Schema.Types.ObjectId, ref: 'product_color', required: true },
  stock_quantity: { type: Number, required: true },
  images: [{ type: String }], // URLs from Cloudinary
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('product_variation', productVariationSchema);
