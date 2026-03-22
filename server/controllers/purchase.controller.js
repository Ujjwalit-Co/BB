import Purchase from "../models/Purchase.js";
import UserProgress from "../models/UserProgress.js";
import Project from "../models/Project.js";
import User from "../models/User.js";
import Razorpay from "razorpay";
import crypto from "crypto";

// Create Razorpay order
export const createOrder = async (req, res) => {
  try {
    const { projectId, amount } = req.body;
    const userId = req.user._id;

    // Check if already purchased
    const existingPurchase = await Purchase.findOne({
      buyer: userId,
      project: projectId,
      status: "completed",
    });

    if (existingPurchase) {
      return res.status(400).json({ message: "You already own this project" });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: (amount || 499) * 100, // amount in the smallest currency unit (paise)
      currency: "INR",
      receipt: `rcp_${Date.now().toString().slice(-8)}_${Math.floor(Math.random() * 1000)}`,
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Verify payment and complete purchase
export const verifyPayment = async (req, res) => {
  try {
    const {
      projectId,
      paymentId,
      orderId,
      signature,
      amount,
      isTrialConversion,
      trialProgressId,
    } = req.body;

    const userId = req.user._id;

    // Verify Razorpay signature
    const body = orderId + "|" + paymentId;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== signature) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    // Get project to find seller
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Create purchase record
    const purchase = await Purchase.create({
      buyer: userId,
      project: projectId,
      seller: project.seller,
      amount: amount || project.price,
      status: "completed",
      paymentId,
      orderId,
      signature,
      isTrialConversion: isTrialConversion || false,
      trialProgressId: trialProgressId || null,
    });

    // Update user's purchased projects
    await User.findByIdAndUpdate(userId, {
      $addToSet: { purchasedProjects: projectId },
    });

    // Update user progress - unlock all milestones
    if (isTrialConversion && trialProgressId) {
      await UserProgress.findByIdAndUpdate(trialProgressId, {
        isFreeTrial: false,
        unlockedMilestones: project.milestones.length,
      });
    } else {
      // Create full access progress
      await UserProgress.findOneAndUpdate(
        { user: userId, project: projectId },
        {
          isFreeTrial: false,
          unlockedMilestones: project.milestones.length,
          lastActive: new Date(),
        },
        { upsert: true }
      );
    }

    // Update project purchase count
    await Project.findByIdAndUpdate(projectId, {
      $inc: { purchases: 1 },
    });

    res.json({
      success: true,
      message: "Purchase successful!",
      purchase,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user's purchases
export const getUserPurchases = async (req, res) => {
  try {
    const userId = req.user._id;

    const purchases = await Purchase.find({ buyer: userId, status: "completed" })
      .populate("project", "title description badge price techStack thumbnail")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: purchases.length,
      purchases,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get purchase details
export const getPurchaseById = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id)
      .populate("buyer", "name email")
      .populate("seller", "name email")
      .populate("project");

    if (!purchase) {
      return res.status(404).json({ message: "Purchase not found" });
    }

    // Check if user is authorized
    if (
      purchase.buyer._id.toString() !== req.user._id.toString() &&
      purchase.seller._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json({ success: true, purchase });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get seller's sales
export const getSellerSales = async (req, res) => {
  try {
    const sellerId = req.user._id;

    const sales = await Purchase.find({ seller: sellerId, status: "completed" })
      .populate("buyer", "name email")
      .populate("project", "title price")
      .sort({ createdAt: -1 });

    const totalRevenue = sales.reduce((sum, sale) => sum + sale.amount, 0);

    res.json({
      success: true,
      count: sales.length,
      totalRevenue,
      sales,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
