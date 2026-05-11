import Project from "../models/Project.js";
import User from "../models/User.js";
import Purchase from "../models/Purchase.js";
import Certificate from "../models/Certificate.js";
import SystemSetting from "../models/SystemSetting.js";
import crypto from "crypto";

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
// APPROVE PROJECT — also triggers creator milestone certificate
// =====================
export const approveProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId).populate("seller", "name email");
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    project.reviewStatus = "approved";
    project.isPublished = true;
    project.adminNotes = req.body.notes || "Approved by admin";
    await project.save();

    // ── Creator milestone certificate check ──────────────────────────────
    let creatorCertificate = null;
    if (project.seller?._id) {
      const publishedCount = await Project.countDocuments({
        seller: project.seller._id,
        isPublished: true,
        reviewStatus: "approved",
      });

      const MILESTONE_TIERS = [5, 15, 30, 50];
      if (MILESTONE_TIERS.includes(publishedCount)) {
        const templateKey = `creator_cert_tier_${publishedCount}`;
        const template = await SystemSetting.findOne({ key: templateKey });

        const certId = `BCCREATOR-${project.seller._id.toString().slice(-6).toUpperCase()}-T${publishedCount}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

        creatorCertificate = await Certificate.findOneAndUpdate(
          {
            user: project.seller._id,
            type: "creator_milestone",
            "metadata.projectCount": publishedCount,
          },
          {
            user: project.seller._id,
            type: "creator_milestone",
            title: template?.title || `Tier ${publishedCount} Creator`,
            recipientName: project.seller.name,
            projectTitle: "",
            templateName: template?.title || "BrainBazaar Creator Certificate",
            certificateId: certId,
            issuedAt: new Date(),
            metadata: { completedMilestones: 0, projectCount: publishedCount },
            layout: {
              backgroundImageUrl: template?.backgroundImageUrl || "",
              namePositionX: template?.namePositionX ?? 50,
              namePositionY: template?.namePositionY ?? 50,
              nameFontSize: template?.nameFontSize ?? 48,
              nameColor: template?.nameColor ?? "#1E3A2F",
              countPositionX: template?.countPositionX ?? 50,
              countPositionY: template?.countPositionY ?? 65,
              countFontSize: template?.countFontSize ?? 36,
              countColor: template?.countColor ?? "#D4840A",
            },
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      }
    }

    res.json({
      success: true,
      message: "Project approved and published",
      project,
      creatorCertificate: creatorCertificate || undefined,
    });
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

    const purchases = await Purchase.find({ status: "completed" });
    const totalRevenue = purchases.reduce((sum, p) => sum + p.amount, 0);
    const platformRevenue = totalRevenue * 0.2;

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

// =====================
// UPDATE LEARNER CERTIFICATE TEMPLATE (per project)
// =====================
export const updateCertificateTemplate = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const existing = project.certificateTemplate || {};
    project.certificateTemplate = {
      enabled: req.body.enabled !== false,
      name: req.body.name || existing.name || "BrainBazaar Builder Certificate",
      headline: req.body.headline || existing.headline || "Certified Project Builder",
      body: req.body.body || existing.body,
      issuerName: req.body.issuerName || existing.issuerName || "BrainBazaar",
      accentColor: req.body.accentColor || existing.accentColor || "#1E3A2F",
      backgroundImageUrl: req.body.backgroundImageUrl ?? existing.backgroundImageUrl ?? "",
      namePositionX: req.body.namePositionX ?? existing.namePositionX ?? 50,
      namePositionY: req.body.namePositionY ?? existing.namePositionY ?? 50,
      nameFontSize: req.body.nameFontSize ?? existing.nameFontSize ?? 48,
      nameColor: req.body.nameColor ?? existing.nameColor ?? "#1E3A2F",
    };

    await project.save();

    res.json({
      success: true,
      message: "Certificate template updated",
      certificateTemplate: project.certificateTemplate,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// =====================
// GET ALL CREATOR CERT TEMPLATES
// =====================
export const getCreatorCertTemplates = async (req, res) => {
  try {
    const TIERS = [5, 15, 30, 50];
    const templates = await SystemSetting.find({
      key: { $in: TIERS.map((t) => `creator_cert_tier_${t}`) },
    });

    // Fill in any missing tiers with defaults
    const result = TIERS.map((tier) => {
      const found = templates.find((t) => t.tier === tier);
      return (
        found || {
          key: `creator_cert_tier_${tier}`,
          tier,
          title: "",
          backgroundImageUrl: "",
          namePositionX: 50,
          namePositionY: 50,
          nameFontSize: 48,
          nameColor: "#1E3A2F",
          countPositionX: 50,
          countPositionY: 65,
          countFontSize: 36,
          countColor: "#D4840A",
        }
      );
    });

    res.json({ success: true, templates: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// =====================
// UPDATE A SINGLE CREATOR CERT TEMPLATE
// =====================
export const updateCreatorCertTemplate = async (req, res) => {
  try {
    const tier = parseInt(req.params.tier);
    if (![5, 15, 30, 50].includes(tier)) {
      return res.status(400).json({ success: false, message: "Invalid tier. Must be 5, 15, 30 or 50." });
    }

    const key = `creator_cert_tier_${tier}`;
    const update = {
      key,
      tier,
      title: req.body.title || "",
      backgroundImageUrl: req.body.backgroundImageUrl || "",
      namePositionX: req.body.namePositionX ?? 50,
      namePositionY: req.body.namePositionY ?? 50,
      nameFontSize: req.body.nameFontSize ?? 48,
      nameColor: req.body.nameColor || "#1E3A2F",
      countPositionX: req.body.countPositionX ?? 50,
      countPositionY: req.body.countPositionY ?? 65,
      countFontSize: req.body.countFontSize ?? 36,
      countColor: req.body.countColor || "#D4840A",
    };

    const template = await SystemSetting.findOneAndUpdate({ key }, update, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    });

    res.json({ success: true, message: `Tier ${tier} template saved`, template });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
