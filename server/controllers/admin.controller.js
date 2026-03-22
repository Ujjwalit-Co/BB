import Project from "../models/Project.js";
import User from "../models/User.js";
import Purchase from "../models/Purchase.js";

// =====================
// GET PENDING PROJECTS - Admin review queue
// =====================
export const getPendingProjects = async (req, res) => {
  try {
    const projects = await Project.find({ reviewStatus: "pending" })
      .populate("seller", "name email githubUsername")
      .sort({ submittedAt: -1 });

    res.json({ success: true, count: projects.length, projects });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =====================
// APPROVE PROJECT
// =====================
export const approveProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    project.reviewStatus = "approved";
    project.isPublished = true;
    project.adminNotes = req.body.notes || "Approved by admin";
    await project.save();

    res.json({ success: true, message: "Project approved and published", project });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =====================
// DECLINE PROJECT
// =====================
export const declineProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    project.reviewStatus = "rejected";
    project.isPublished = false;
    project.adminNotes = req.body.notes || "Declined by admin";
    await project.save();

    res.json({ success: true, message: "Project declined", project });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =====================
// REQUEST CHANGES
// =====================
export const requestChanges = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    project.reviewStatus = "needs-changes";
    project.adminNotes = req.body.notes || "Changes requested";
    await project.save();

    res.json({ success: true, message: "Changes requested from seller", project });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =====================
// GET ALL PROJECTS - Admin view
// =====================
export const getAllProjectsAdmin = async (req, res) => {
  try {
    const projects = await Project.find({})
      .populate("seller", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: projects.length, projects });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =====================
// GET ADMIN STATS
// =====================
export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({});
    const totalSellers = await User.countDocuments({ role: "seller" });
    const totalProjects = await Project.countDocuments({});
    const publishedProjects = await Project.countDocuments({ isPublished: true });
    const pendingReviews = await Project.countDocuments({ reviewStatus: "pending" });
    const totalPurchases = await Purchase.countDocuments({ status: "completed" });

    // Revenue
    const purchases = await Purchase.find({ status: "completed" });
    const totalRevenue = purchases.reduce((sum, p) => sum + p.amount, 0);
    const platformRevenue = totalRevenue * 0.2; // 20% commission

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalSellers,
        totalProjects,
        publishedProjects,
        pendingReviews,
        totalPurchases,
        totalRevenue,
        platformRevenue,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
