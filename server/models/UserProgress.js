import mongoose from "mongoose";

const userProgressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    // FREE TRIAL FIELDS
    isFreeTrial: {
      type: Boolean,
      default: true,
    },
    trialStartedAt: {
      type: Date,
      default: Date.now,
    },
    trialExpiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
    unlockedMilestones: {
      type: Number,
      default: 1, // Free trial users get 1 milestone
    },

    // Progress Tracking
    currentMilestoneIndex: {
      type: Number,
      default: 0,
    },
    completedSteps: [
      {
        milestoneIndex: { type: Number, required: true },
        stepIndex: { type: Number, required: true },
        completedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Quiz Scores
    quizScores: [
      {
        milestoneIndex: { type: Number, required: true },
        score: { type: Number, required: true },
        attempts: [
          {
            score: { type: Number },
            answers: [{ type: Number }],
            attemptedAt: { type: Date, default: Date.now },
          },
        ],
      },
    ],

    // User Environment (saved from onboarding)
    userEnvironment: {
      os: { type: String, enum: ["windows", "macos", "linux"] },
      hasNode: { type: Boolean },
      hasPython: { type: Boolean },
      nodeVersion: { type: String },
      pythonVersion: { type: String },
      codeEditor: { type: String },
      savedAt: { type: Date },
    },

    // Saved Code State
    savedCode: [
      {
        filename: { type: String, required: true },
        content: { type: String, required: true },
        lastSavedAt: { type: Date, default: Date.now },
      },
    ],

    // Completion Status
    isComplete: {
      type: Boolean,
      default: false,
    },
    completedAt: Date,
    certificateGenerated: {
      type: Boolean,
      default: false,
    },

    // Activity Tracking
    lastActive: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Compound index for unique user-project combination
userProgressSchema.index({ user: 1, project: 1 }, { unique: true });

// Index for querying user's progress
userProgressSchema.index({ user: 1 });

// Method to check if trial has expired
userProgressSchema.methods.isTrialExpired = function () {
  if (!this.isFreeTrial) return false;
  return new Date() > this.trialExpiresAt;
};

// Method to check if milestone is unlocked
userProgressSchema.methods.isMilestoneUnlocked = function (milestoneIndex) {
  if (!this.isFreeTrial) return true; // Paid users have all milestones unlocked
  return milestoneIndex < this.unlockedMilestones;
};

// Method to mark step as complete
userProgressSchema.methods.completeStep = function (milestoneIndex, stepIndex) {
  const existingStep = this.completedSteps.find(
    (s) => s.milestoneIndex === milestoneIndex && s.stepIndex === stepIndex
  );

  if (!existingStep) {
    this.completedSteps.push({
      milestoneIndex,
      stepIndex,
      completedAt: new Date(),
    });
  }

  // Update current milestone if this is a later milestone
  if (milestoneIndex > this.currentMilestoneIndex) {
    this.currentMilestoneIndex = milestoneIndex;
  }

  this.lastActive = new Date();
  return this.save();
};

const UserProgress = mongoose.model("UserProgress", userProgressSchema);

export default UserProgress;
