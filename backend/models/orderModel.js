const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['ORDERED', 'SHIPPED','DELIVERED','RETURNED'],
    required: true
  },
  shipping_charge: {
    type: Number,
    required: true
  },
  ordered_at: {
    type: Date,
    default: Date.now
  },
  delivered_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', orderSchema);
 