import mongoose from "mongoose";

// Stores global admin-configured settings, including creator certificate
// templates for each milestone tier (5, 15, 30, 50 published projects).
const systemSettingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },

    // Creator certificate tier settings
    tier: { type: Number },
    title: { type: String, default: "" }, // e.g. "Junior Master"

    // Certificate visual layout
    backgroundImageUrl: { type: String, default: "" },

    // {{creatorName}} placement (as % of image width/height)
    namePositionX: { type: Number, default: 50 },
    namePositionY: { type: Number, default: 50 },
    nameFontSize: { type: Number, default: 48 },
    nameColor: { type: String, default: "#1E3A2F" },

    // {{projectCount}} placement
    countPositionX: { type: Number, default: 50 },
    countPositionY: { type: Number, default: 65 },
    countFontSize: { type: Number, default: 36 },
    countColor: { type: String, default: "#D4840A" },
  },
  { timestamps: true }
);

const SystemSetting = mongoose.model("SystemSetting", systemSettingSchema);

export default SystemSetting;
