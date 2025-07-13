const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  product_sku: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  product_type_id: { type: mongoose.Schema.Types.ObjectId, ref: 'product_type', required: true },
  product_category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'product_category', required: true },
  price: { type: Number, required: true },
  discount_percentage: { type: Number, default: 0 },
  is_active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('product', productSchema);
