const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  reference: { type: String, required: true, unique: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'successful', 'failed', 'abandoned'],
    default: 'pending'
  },
  paystackResponse: { type: mongoose.Schema.Types.Mixed },
  bookingDetails: {
    quantity: Number,
    fullName: String,
    email: String,
    phone: String,
    totalAmount: Number,
    processingFee: Number
  },
  metadata: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

module.exports = mongoose.model('Payment', PaymentSchema);
