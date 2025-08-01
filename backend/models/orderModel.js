const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  products: [
    {
      variation: {
        type: Schema.Types.ObjectId,
        ref: 'product_variation',
        required: true
      },
      name: String,
      quantity: Number,
      price: Number,
      status: {
        type: String,
        enum: ['Ordered', 'Cancelled'],
        default: 'Ordered'
      }
    }
  ],
  status: {
    type: String,
    enum: ['ORDERED', 'SHIPPED', 'DELIVERED', 'RETURNED', 'CANCELLED'],
    default: 'ORDERED'
  },
  returns: [
    {
      product: {
        type: Schema.Types.ObjectId,
        ref: 'product_variation'
      },
      reason: String,
      status: {
        type: String,
        enum: ['Requested', 'Approved', 'Rejected'],
        default: 'Requested'
      },
      refundAmount: Number
    }
  ],
  total: {
    type: Number,
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
  delivered_at: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
