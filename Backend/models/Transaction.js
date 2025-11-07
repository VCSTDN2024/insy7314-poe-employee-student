// Backend/models/Transaction.js
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: { type: Number, required: true, min: 0.01 },
  currency: { type: String, required: true },
  provider: { type: String, required: true },
  payeeAccount: { type: String, required: true },
  swiftCode: { type: String, required: true, uppercase: true },
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'   // 
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    default: null        // 
  },
  verifiedAt: { type: Date, default: null }, // 
  createdAt: { type: Date, default: Date.now }
});

transactionSchema.index({ status: 1, createdAt: -1 });
module.exports = mongoose.model('Transaction', transactionSchema);