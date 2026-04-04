import User from "../models/User.js";
import CreditTransaction from "../models/CreditTransaction.js";
import Razorpay from "razorpay";
import crypto from "crypto";

// Credit packs definition
const CREDIT_PACKS = {
  pack1: { id: "pack1", credits: 100, price: 100, name: "Starter Spark" },
  pack2: { id: "pack2", credits: 500, price: 450, name: "Pro Pulse" },
  pack3: { id: "pack3", credits: 1200, price: 1000, name: "Expert Energy" },
  milestone: { id: "milestone", credits: 70, price: 99, name: "Milestone Unlock" },
};

// =====================
// GET CREDIT BALANCE
// =====================
export const getCreditBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      balance: user.credits || 0,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =====================
// CREATE CREDIT ORDER
// =====================
export const createCreditOrder = async (req, res) => {
  try {
    const { packId } = req.body;
    const pack = CREDIT_PACKS[packId];

    if (!pack) {
      return res.status(400).json({ message: "Invalid credit pack" });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: pack.price * 100, // paise
      currency: "INR",
      receipt: `cred_rcp_${Date.now().toString().slice(-8)}_${Math.floor(Math.random() * 1000)}`,
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      order,
      pack,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =====================
// VERIFY CREDIT PAYMENT
// =====================
export const verifyCreditPayment = async (req, res) => {
  try {
    const { paymentId, orderId, signature, packId } = req.body;
    const pack = CREDIT_PACKS[packId];

    if (!pack) {
      return res.status(400).json({ message: "Invalid credit pack" });
    }

    // Verify Razorpay signature
    const body = orderId + "|" + paymentId;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== signature) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    const user = await User.findById(req.user._id);
    user.credits = (user.credits || 0) + pack.credits;
    await user.save();

    // Log transaction
    await CreditTransaction.create({
      user: user._id,
      type: 'purchase',
      amount: pack.credits,
      balanceAfter: user.credits,
      description: `Purchased ${pack.name}`,
      packName: packId,
    });

    res.json({
      success: true,
      message: `${pack.name} purchased! ${pack.credits} credits added.`,
      balance: user.credits,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =====================
// CONSUME CREDITS
// =====================
export const consumeCredits = async (req, res) => {
  try {
    const { amount, description, projectId } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid credit amount" });
    }

    const user = await User.findById(req.user._id);

    if ((user.credits || 0) < amount) {
      return res.status(400).json({
        message: "Insufficient credits",
        balance: user.credits || 0,
        required: amount,
      });
    }

    user.credits -= amount;
    await user.save();

    // Log transaction
    await CreditTransaction.create({
      user: user._id,
      type: 'consumption',
      amount: -amount,
      balanceAfter: user.credits,
      description: description || 'Credit consumption',
      projectId: projectId || undefined,
    });

    res.json({
      success: true,
      message: `${amount} credits consumed`,
      balance: user.credits,
      consumed: amount,
      description,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =====================
// GET CREDIT HISTORY
// =====================
export const getCreditHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const transactions = await CreditTransaction.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('projectId', 'title');

    res.json({
      success: true,
      balance: user.credits || 0,
      transactions,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =====================
// UNLOCK MILESTONE WITH CREDITS
// =====================
export const unlockMilestone = async (req, res) => {
  try {
    const { projectId, milestoneIndex } = req.body;
    const MILESTONE_COST = 70;

    const user = await User.findById(req.user._id);

    if ((user.credits || 0) < MILESTONE_COST) {
      return res.status(400).json({
        message: "Insufficient credits. You need 70 credits to unlock a milestone.",
        balance: user.credits || 0,
        required: MILESTONE_COST,
      });
    }

    // Deduct credits
    user.credits -= MILESTONE_COST;
    await user.save();

    // Log transaction
    await CreditTransaction.create({
      user: user._id,
      type: 'consumption',
      amount: -MILESTONE_COST,
      balanceAfter: user.credits,
      description: `Unlocked milestone ${milestoneIndex + 1}`,
      projectId: projectId,
      milestoneNumber: milestoneIndex + 1,
    });

    // Update user progress to unlock the milestone
    const { default: UserProgress } = await import("../models/UserProgress.js");
    const progress = await UserProgress.findOne({ user: req.user._id, project: projectId });

    if (progress) {
      progress.unlockedMilestones = Math.max(progress.unlockedMilestones, milestoneIndex + 1);
      await progress.save();
    }

    res.json({
      success: true,
      message: `Milestone ${milestoneIndex + 1} unlocked!`,
      balance: user.credits,
      unlockedMilestones: progress?.unlockedMilestones || milestoneIndex + 1,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =====================
// GET AVAILABLE PACKS
// =====================
export const getCreditPacks = async (req, res) => {
  try {
    res.json({
      success: true,
      packs: Object.values(CREDIT_PACKS),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
