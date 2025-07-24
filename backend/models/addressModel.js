const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const addressSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  label: {
    type: String
  },
  type: {
    type: String,
    enum: ['HOME', 'WORK', 'OTHER'],
    default: 'HOME'
  },
  house_number: {
    type: String
  },
  locality: {
    type: String
  },
  city: {
    type: String
  },
  state: {
    type: String
  },
  pincode: {
    type: Number
  },
  phone_number: {
    type: String
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Address', addressSchema);