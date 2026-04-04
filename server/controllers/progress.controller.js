import UserProgress from "../models/UserProgress.js";
import Project from "../models/Project.js";
import Purchase from "../models/Purchase.js";
import User from "../models/User.js";

// Start free trial for a project (NEW MODEL: 3 projects max, 1 milestone each)
export const startFreeTrial = async (req, res) => {
  try {
    const { projectId } = req.body;
    const userId = req.user._id;

    // Check if project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const user = await User.findById(userId);

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

    // Check Free Trial Limit (Max 3 projects)
    if (!user.freeTrialProjects.includes(projectId)) {
      if (user.freeTrialProjects.length >= 3) {
         return res.status(403).json({ message: "You have exhausted your 3 free project trials. Please purchase a project or use credits." });
      }
      user.freeTrialProjects.push(projectId);
      await user.save();
    }

    // Create new trial progress with message limits
    const progress = await UserProgress.create({
      user: userId,
      project: projectId,
      isFreeTrial: true,
      trialStartedAt: new Date(),
      messageLimits: {
        freeTrialMessagesPerMilestone: project.trialSettings?.freeMessageLimit || 10,
        purchasedMessagesPerMilestone: project.trialSettings?.purchasedMessageLimit || 20,
      },
      messageCounts: [], // No messages used yet
    });

    res.status(201).json({
      success: true,
      message: "Free trial started successfully",
      progress,
      messageLimit: 10, // Show user their limit
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

      let isFreeTrial = false;

      if (hasPurchased) {
        // User purchased - all milestones unlocked, 20 msg limit
        isFreeTrial = false;
      } else {
        const user = await User.findById(userId);
        if (user.freeTrialProjects.includes(projectId)) {
          isFreeTrial = true;
        } else if (user.freeTrialProjects.length < 3) {
          // Start new trial
          user.freeTrialProjects.push(projectId);
          await user.save();
          isFreeTrial = true;
        } else {
          return res.status(403).json({ 
            message: "You have exhausted your 3 free project trials.",
            needsPurchase: true 
          });
        }
      }

      progress = await UserProgress.create({
        user: userId,
        project: projectId,
        isFreeTrial,
        messageLimits: {
          freeTrialMessagesPerMilestone: project.trialSettings?.freeMessageLimit || 10,
          purchasedMessagesPerMilestone: project.trialSettings?.purchasedMessageLimit || 20,
        },
        messageCounts: [],
      });
    }

    // Calculate message limit info for frontend
    const currentMilestoneIdx = progress.currentMilestoneIndex || 0;
    const messagesUsed = progress.getMessagesUsedInMilestone(currentMilestoneIdx);
    const messageLimit = progress.isFreeTrial 
      ? progress.messageLimits.freeTrialMessagesPerMilestone 
      : progress.messageLimits.purchasedMessagesPerMilestone;
    const canSendWithoutCredits = progress.canSendMessageWithoutCredits(currentMilestoneIdx);

    res.json({
      success: true,
      progress,
      messageInfo: {
        used: messagesUsed,
        limit: messageLimit,
        remaining: messageLimit - messagesUsed,
        canSendWithoutCredits,
      },
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

    // Check if milestone is unlocked
    if (!progress.isMilestoneUnlocked(milestoneIndex)) {
      return res.status(403).json({
        success: false,
        message: "Milestone locked. Purchase project to unlock.",
        milestoneLocked: true,
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

    res.json({
      success: true,
      hasTrial: true,
      isFreeTrial: progress.isFreeTrial,
      currentMilestoneIndex: progress.currentMilestoneIndex,
      messageLimits: progress.messageLimits,
      messageCounts: progress.messageCounts,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Proxy AI Question (enforces NEW message limits and deducts credits)
export const proxyAskQuestion = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { milestoneIndex, question, files, projectContext, isSandbox } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    
    // Refresh credits if 30+ days have passed
    await user.refreshCreditsIfDue();

    let creditsDeducted = false;
    let messagesRemaining = 0;

    if (isSandbox) {
      // Sandbox mode: ALWAYS costs 2 credits per question
      if (user.credits < 2) {
        return res.status(403).json({ 
          success: false, 
          message: "Insufficient credits for Sandbox mode. Purchase credits or wait for monthly refresh.",
          credits: user.credits 
        });
      }
      user.credits -= 2;
      await user.save();
      creditsDeducted = true;
    } else {
      // Standard project mode
      let progress = await UserProgress.findOne({ user: userId, project: projectId });
      if (!progress) {
        return res.status(404).json({ success: false, message: "Progress not found. Start project first." });
      }

      // Check if milestone is unlocked
      if (!progress.isMilestoneUnlocked(milestoneIndex)) {
        return res.status(403).json({
          success: false,
          message: "Milestone locked. Purchase project to unlock.",
          milestoneLocked: true,
        });
      }

      // Check if user can send without consuming credits
      const canSendWithoutCredits = progress.canSendMessageWithoutCredits(milestoneIndex);
      
      if (!canSendWithoutCredits) {
        // Message limit reached, deduct credits
        if (user.credits < 2) {
          return res.status(403).json({ 
            success: false, 
            message: "Message limit reached and insufficient credits. Purchase credits or wait for monthly refresh.",
            credits: user.credits,
            needsCredits: true
          });
        }
        
        // Deduct 2 credits per message after limit
        user.credits -= 2;
        await user.save();
        
        // Still increment message count for tracking
        await progress.incrementMessageCount(milestoneIndex);
        
        creditsDeducted = true;
        messagesRemaining = 0;
      } else {
        // Still within free limit, increment count
        await progress.incrementMessageCount(milestoneIndex);
        
        const messagesUsed = progress.getMessagesUsedInMilestone(milestoneIndex);
        const limit = progress.isFreeTrial 
          ? progress.messageLimits.freeTrialMessagesPerMilestone 
          : progress.messageLimits.purchasedMessagesPerMilestone;
        
        messagesRemaining = limit - messagesUsed;
      }
    }

    // Call FastAPI
    const { default: axios } = await import("axios");
    const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8080';

    const fastApiUrl = `${FASTAPI_URL}/projects/${projectId}/milestones/${milestoneIndex + 1}/ask`;

    const fastApiResponse = await axios.post(fastApiUrl, {
      question,
      files: files || [],
      lab_mode: 'browser',
      project_context: projectContext
    });

    res.json({
      success: true,
      ...fastApiResponse.data,
      credits: user.credits,
      creditsDeducted,
      messagesRemaining
    });

  } catch (error) {
    console.error("Proxy Ask Error:", error.message);
    res.status(500).json({ success: false, message: "AI Request Failed", error: error.message });
  }
};
