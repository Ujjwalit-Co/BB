import UserProgress from "../models/UserProgress.js";
import Project from "../models/Project.js";
import Purchase from "../models/Purchase.js";

// Start free trial for a project
export const startFreeTrial = async (req, res) => {
  try {
    const { projectId } = req.body;
    const userId = req.user._id;

    // Check if project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Check if user already has progress or purchased
    const existingProgress = await UserProgress.findOne({ user: userId, project: projectId });
    if (existingProgress) {
      return res.json({
        success: true,
        progress: existingProgress,
        message: "Trial already active",
      });
    }

    const hasPurchased = await Purchase.hasPurchased(userId, projectId);
    if (hasPurchased) {
      return res.status(400).json({ message: "You already own this project" });
    }

    // Create new trial progress
    const progress = await UserProgress.create({
      user: userId,
      project: projectId,
      isFreeTrial: true,
      trialStartedAt: new Date(),
      trialExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      unlockedMilestones: project.trialSettings?.trialMilestones || 1,
    });

    res.status(201).json({
      success: true,
      message: "Free trial started successfully",
      progress,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user progress for a project
export const getUserProgress = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user._id;

    let progress = await UserProgress.findOne({ user: userId, project: projectId })
      .populate("project", "title milestones trialSettings");

    // If no progress exists, create initial trial progress
    if (!progress) {
      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Check if user has purchased
      const hasPurchased = await Purchase.hasPurchased(userId, projectId);

      progress = await UserProgress.create({
        user: userId,
        project: projectId,
        isFreeTrial: !hasPurchased,
        unlockedMilestones: hasPurchased ? project.milestones.length : (project.trialSettings?.trialMilestones || 1),
      });
    }

    // Check if trial expired
    const isExpired = progress.isTrialExpired();
    if (isExpired && progress.isFreeTrial) {
      return res.json({
        success: true,
        progress,
        trialExpired: true,
        message: "Free trial has expired. Please purchase to continue.",
      });
    }

    res.json({
      success: true,
      progress,
      trialExpired: false,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Save/update user progress
export const saveUserProgress = async (req, res) => {
  try {
    const { projectId } = req.params;
    const {
      currentMilestoneIndex,
      completedSteps,
      quizScores,
      userEnvironment,
      savedCode,
    } = req.body;

    const userId = req.user._id;

    let progress = await UserProgress.findOne({ user: userId, project: projectId });

    if (!progress) {
      return res.status(404).json({ message: "Progress not found. Start a trial first." });
    }

    // Check if trial expired
    if (progress.isTrialExpired()) {
      return res.status(403).json({
        success: false,
        message: "Free trial has expired. Please purchase to continue.",
        trialExpired: true,
      });
    }

    // Update fields
    if (currentMilestoneIndex !== undefined) {
      progress.currentMilestoneIndex = currentMilestoneIndex;
    }

    if (completedSteps) {
      completedSteps.forEach((step) => {
        progress.completeStep(step.milestoneIndex, step.stepIndex);
      });
    }

    if (quizScores) progress.quizScores = quizScores;
    if (userEnvironment) progress.userEnvironment = { ...progress.userEnvironment, ...userEnvironment, savedAt: new Date() };
    if (savedCode) progress.savedCode = savedCode;

    progress.lastActive = new Date();
    await progress.save();

    res.json({
      success: true,
      message: "Progress saved successfully",
      progress,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Complete a milestone step
export const completeStep = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { milestoneIndex, stepIndex } = req.body;
    const userId = req.user._id;

    let progress = await UserProgress.findOne({ user: userId, project: projectId });

    if (!progress) {
      return res.status(404).json({ message: "Progress not found" });
    }

    // Check if trial expired
    if (progress.isTrialExpired()) {
      return res.status(403).json({
        success: false,
        message: "Free trial has expired",
        trialExpired: true,
      });
    }

    // Check if milestone is unlocked
    if (!progress.isMilestoneUnlocked(milestoneIndex)) {
      return res.status(403).json({
        success: false,
        message: "Milestone locked. Purchase to unlock.",
        milestoneLocked: true,
        unlockedMilestones: progress.unlockedMilestones,
      });
    }

    await progress.completeStep(milestoneIndex, stepIndex);

    res.json({
      success: true,
      message: "Step completed successfully",
      progress,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Check trial status
export const checkTrialStatus = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user._id;

    const progress = await UserProgress.findOne({ user: userId, project: projectId });

    if (!progress) {
      return res.json({
        success: true,
        hasTrial: false,
        message: "No trial started yet",
      });
    }

    const expired = progress.isTrialExpired();

    res.json({
      success: true,
      hasTrial: true,
      expired,
      isFreeTrial: progress.isFreeTrial,
      unlockedMilestones: progress.unlockedMilestones,
      trialExpiresAt: progress.trialExpiresAt,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
