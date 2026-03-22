import mongoose from "mongoose";

const purchaseSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    paymentId: {
      type: String,
      required: [true, "Payment ID is required"],
    },
    orderId: {
      type: String,
      required: true,
    },
    signature: {
      type: String,
      required: true,
    },
    // Trial Conversion Tracking
    isTrialConversion: {
      type: Boolean,
      default: false,
    },
    trialProgressId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserProgress",
    },
    // Payment Method
    paymentMethod: {
      type: String,
      enum: ["card", "upi", "netbanking", "wallet"],
    },
    // Refund (if applicable)
    refundId: String,
    refundedAt: Date,
    refundReason: String,
  },
  { timestamps: true }
);

// Indexes for common queries
purchaseSchema.index({ buyer: 1, status: 1 });
purchaseSchema.index({ seller: 1 });
purchaseSchema.index({ project: 1 });
purchaseSchema.index({ paymentId: 1 }, { unique: true });

// Virtual for invoice URL
purchaseSchema.virtual("invoiceUrl").get(function () {
  return `/api/purchases/${this._id}/invoice`;
});

// Method to mark as completed
purchaseSchema.methods.complete = function (paymentDetails) {
  this.status = "completed";
  this.paymentId = paymentDetails.paymentId;
  this.orderId = paymentDetails.orderId;
  this.signature = paymentDetails.signature;
  this.paymentMethod = paymentDetails.method;
  return this.save();
};

// Static method to check if user has purchased a project
purchaseSchema.statics.hasPurchased = async function (userId, projectId) {
  const purchase = await this.findOne({
    buyer: userId,
    project: projectId,
    status: "completed",
  });
  return !!purchase;
};

const Purchase = mongoose.model("Purchase", purchaseSchema);

export default Purchase;
