import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "seller", "admin"],
      default: "user",
    },
    avatar: {
      public_id: String,
      secure_url: String,
    },
    credits: {
      type: Number,
      default: 20, // Free credits on signup
    },
    lastCreditRefresh: {
      type: Date,
      default: Date.now,
    },
    // Track which projects user has used free trial on (max 3)
    freeTrialProjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
      }
    ],
    purchasedProjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
      },
    ],
    // GitHub OAuth (Seller)
    githubAccessToken: { type: String }, // Stored encrypted
    githubConnected: { type: Boolean, default: false },
    githubUsername: { type: String },
    // Seller Fields
    isVerifiedSeller: { type: Boolean, default: false },
    totalEarnings: { type: Number, default: 0 },
    pendingPayouts: { type: Number, default: 0 },
    razorpayAccountId: { type: String },
    forgotPasswordToken: String,
    forgotPasswordExpiry: Date,
  },
  { timestamps: true }
);

// Password hashing middleware
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance methods
userSchema.methods = {
  // Generate JWT token
  generateJWTToken: async function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });
  },

  // Match password
  matchPassword: async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  },

  // Check if credits need monthly refresh and refresh if needed
  refreshCreditsIfDue: function () {
    const now = new Date();
    const lastRefresh = this.lastCreditRefresh;
    const daysSinceRefresh = (now - lastRefresh) / (1000 * 60 * 60 * 24);

    // If 30+ days have passed, refresh credits
    if (daysSinceRefresh >= 30) {
      this.credits = 20; // Reset to 20 free credits
      this.lastCreditRefresh = now;
      return this.save();
    }

    return Promise.resolve(this);
  },

  // Generate password reset token
  generateResetPasswordToken: async function () {
    const resetToken = crypto.randomBytes(20).toString("hex");

    this.forgotPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    this.forgotPasswordExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes

    return resetToken;
  },
};

const User = mongoose.model("User", userSchema);

export default User;
