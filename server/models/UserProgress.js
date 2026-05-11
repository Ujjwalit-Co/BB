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

    // FREE TRIAL & MESSAGE LIMITS (NEW MODEL)
    isFreeTrial: {
      type: Boolean,
      default: true,
    },
    trialStartedAt: {
      type: Date,
      default: Date.now,
    },
    // Message limits per milestone
    messageLimits: {
      freeTrialMessagesPerMilestone: { type: Number, default: 10 }, // Free users get 10 messages per milestone
      purchasedMessagesPerMilestone: { type: Number, default: 20 }, // Purchased users get 20 messages per milestone before credits
    },
    // Track messages used per milestone
    messageCounts: [
      {
        milestoneIndex: { type: Number, required: true },
        count: { type: Number, default: 0 },
      }
    ],

    // Progress Tracking
    currentMilestoneIndex: {
      type: Number,
      default: 0,
    },
    unlockedMilestones: {
      type: Number,
      default: 1,
      min: 1,
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
    isSandbox: {
      type: Boolean,
      default: false,
    },

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
        language: { type: String },
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

// Method to check if milestone is unlocked (for 3 free projects model, milestone 0 is always unlocked)
userProgressSchema.methods.isMilestoneUnlocked = function (milestoneIndex) {
  // Purchased users have all milestones unlocked
  if (!this.isFreeTrial) return true;
  return milestoneIndex < (this.unlockedMilestones || 1);
};

// Method to get messages used in current milestone
userProgressSchema.methods.getMessagesUsedInMilestone = function (milestoneIndex) {
  const milestoneMsg = this.messageCounts.find(
    (m) => m.milestoneIndex === milestoneIndex
  );
  return milestoneMsg ? milestoneMsg.count : 0;
};

// Method to increment message count for a milestone
userProgressSchema.methods.incrementMessageCount = function (milestoneIndex) {
  const existingMsg = this.messageCounts.find(
    (m) => m.milestoneIndex === milestoneIndex
  );

  if (existingMsg) {
    existingMsg.count += 1;
  } else {
    this.messageCounts.push({
      milestoneIndex,
      count: 1,
    });
  }

  this.lastActive = new Date();
  return this.save();
};

// Method to check if user can send more messages without consuming credits
userProgressSchema.methods.canSendMessageWithoutCredits = function (milestoneIndex) {
  const messagesUsed = this.getMessagesUsedInMilestone(milestoneIndex);
  const limit = this.isFreeTrial
    ? this.messageLimits.freeTrialMessagesPerMilestone
    : this.messageLimits.purchasedMessagesPerMilestone;
  
  return messagesUsed < limit;
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
