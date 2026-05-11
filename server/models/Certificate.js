import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    type: {
      type: String,
      enum: ["learner_project_completion", "creator_milestone"],
      required: true,
    },
    title: { type: String, required: true },
    recipientName: { type: String, required: true },
    projectTitle: { type: String, default: "" },
    templateName: { type: String, default: "BrainBazaar Builder Certificate" },
    templateBody: { type: String, default: "" },
    certificateId: { type: String, required: true, unique: true },
    issuedAt: { type: Date, default: Date.now },
    metadata: {
      completedMilestones: { type: Number, default: 0 },
      projectCount: { type: Number, default: 0 },
    },
    // Permanent snapshot of the visual template at time of issuance.
    // This ensures old certs are never affected by future admin edits.
    layout: {
      backgroundImageUrl: { type: String, default: "" },
      namePositionX: { type: Number, default: 50 },
      namePositionY: { type: Number, default: 50 },
      nameFontSize: { type: Number, default: 48 },
      nameColor: { type: String, default: "#1E3A2F" },
      // Only for creator_milestone certs
      countPositionX: { type: Number, default: 50 },
      countPositionY: { type: Number, default: 65 },
      countFontSize: { type: Number, default: 36 },
      countColor: { type: String, default: "#D4840A" },
    },
  },
  { timestamps: true }
);

certificateSchema.index({ user: 1, type: 1 });
certificateSchema.index({ project: 1, user: 1, type: 1 }, { unique: true, sparse: true });

const Certificate = mongoose.model("Certificate", certificateSchema);

export default Certificate;
