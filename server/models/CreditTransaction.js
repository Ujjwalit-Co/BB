import mongoose from 'mongoose';

const creditTransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['purchase', 'consumption', 'refund', 'bonus'],
    required: true,
  },
  amount: {
    type: Number,
    required: true, // positive for additions, negative for deductions
  },
  balanceAfter: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
  },
  milestoneNumber: Number,
  paymentId: String, // Razorpay payment ID for purchase transactions
  packName: String,  // e.g. 'starter', 'builder', 'milestone'
}, {
  timestamps: true,
});

// Index for efficient queries
creditTransactionSchema.index({ user: 1, createdAt: -1 });
creditTransactionSchema.index({ type: 1 });

const CreditTransaction = mongoose.model('CreditTransaction', creditTransactionSchema);
export default CreditTransaction;
