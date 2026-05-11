import UserProgress from "../models/UserProgress.js";
import Project from "../models/Project.js";
import Purchase from "../models/Purchase.js";
import User from "../models/User.js";
import CreditTransaction from "../models/CreditTransaction.js";
import Certificate from "../models/Certificate.js";

const ignoredCodePathPattern = /(^|\/)(node_modules|\.git|dist|build|coverage|__pycache__|\.pytest_cache|\.venv|venv|env|\.next|\.turbo|\.cache)(\/|$)|(\.pyc|\.pyo|\.log|\.map)$/i;
const maxSavedFileBytes = 160000;

function sanitizeSavedCode(files = []) {
  if (!Array.isArray(files)) return [];

  return files
    .filter((file) => {
      const filename = String(file.filename || file.name || "").replace(/\\/g, "/");
      if (!filename || ignoredCodePathPattern.test(filename)) return false;
      const content = String(file.content || "");
      return content.length <= maxSavedFileBytes;
    })
    .slice(0, 80)
    .map((file) => ({
      filename: String(file.filename || file.name).replace(/\\/g, "/"),
      content: String(file.content || ""),
      lastSavedAt: new Date(),
    }));
}

async function issueLearnerCertificate(progress) {
  const [user, project] = await Promise.all([
    User.findById(progress.user),
    Project.findById(progress.project).populate("seller", "name"),
  ]);

  if (!user || !project) return null;
  const template = project.certificateTemplate || {};
  if (template.enabled === false) return null;

  const certificateId = `BB-${project._id.toString().slice(-6).toUpperCase()}-${user._id.toString().slice(-6).toUpperCase()}`;
  const completedMilestones = project.milestones?.length || 0;

  const cert = await Certificate.findOneAndUpdate(
    { user: user._id, project: project._id, type: "learner_project_completion" },
    {
      user: user._id,
      project: project._id,
      creator: project.seller?._id,
      type: "learner_project_completion",
      title: template.headline || "Certified Project Builder",
      recipientName: user.name,
      projectTitle: project.title,
      templateName: template.name || "BrainBazaar Builder Certificate",
      templateBody: (template.body || "")
        .replaceAll("{{studentName}}", user.name)
        .replaceAll("{{projectTitle}}", project.title)
        .replaceAll("{{creatorName}}", project.seller?.name || "BrainBazaar creator"),
      certificateId,
      issuedAt: new Date(),
      metadata: { completedMilestones },
      layout: {
        backgroundImageUrl: template.backgroundImageUrl || "",
        namePositionX: template.namePositionX ?? 50,
        namePositionY: template.namePositionY ?? 50,
        nameFontSize: template.nameFontSize ?? 48,
        nameColor: template.nameColor ?? "#1E3A2F",
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  progress.certificateGenerated = true;
  progress.completedAt = progress.completedAt || new Date();
  await progress.save();
  return cert;
}

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
    const hasUsedTrialForProject = user.freeTrialProjects.some(
      (id) => id.toString() === projectId.toString()
    );

    if (!hasUsedTrialForProject) {
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
        const hasUsedTrialForProject = user.freeTrialProjects.some(
          (id) => id.toString() === projectId.toString()
        );

        if (hasUsedTrialForProject) {
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
      isComplete,
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
    if (savedCode) progress.savedCode = sanitizeSavedCode(savedCode);
    if (isComplete === true) {
      progress.isComplete = true;
      progress.completedAt = progress.completedAt || new Date();
    }

    progress.lastActive = new Date();
    await progress.save();
    const certificate = progress.isComplete && !progress.certificateGenerated
      ? await issueLearnerCertificate(progress)
      : null;

    res.json({
      success: true,
      message: "Progress saved successfully",
      progress,
      certificate,
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
    let shouldDeductCredits = false;
    let progress = null;

    if (isSandbox) {
      // Sandbox mode: ALWAYS costs 2 credits per question
      if (user.credits < 2) {
        return res.status(403).json({ 
          success: false, 
          message: "Insufficient credits for Sandbox mode. Purchase credits or wait for monthly refresh.",
          credits: user.credits 
        });
      }
      shouldDeductCredits = true;
    } else {
      // Standard project mode
      progress = await UserProgress.findOne({ user: userId, project: projectId });
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
        shouldDeductCredits = true;
      } else {
        const limit = progress.isFreeTrial 
          ? progress.messageLimits.freeTrialMessagesPerMilestone 
          : progress.messageLimits.purchasedMessagesPerMilestone;
        
        messagesRemaining = Math.max(limit - progress.getMessagesUsedInMilestone(milestoneIndex) - 1, 0);
      }
    }

    // Call FastAPI
    const { default: axios } = await import("axios");
    const FASTAPI_URL = process.env.FASTAPI_URL || 'http://127.0.0.1:8000';

    const fastApiUrl = `${FASTAPI_URL}/projects/${projectId}/milestones/${milestoneIndex + 1}/ask`;

    const cleanFiles = sanitizeSavedCode(files || []).map((file) => ({
      name: file.filename,
      content: file.content,
      language: file.filename.split(".").pop() || "text",
    }));

    const fastApiResponse = await axios.post(fastApiUrl, {
      question,
      files: cleanFiles,
      lab_mode: 'browser',
      project_context: projectContext
    });

    // Only consume credits/message allowance after the AI call succeeds.
    if (shouldDeductCredits) {
      user.credits -= 2;
      await user.save();
      creditsDeducted = true;

      await CreditTransaction.create({
        user: user._id,
        type: 'consumption',
        amount: -2,
        balanceAfter: user.credits,
        description: isSandbox ? 'Sandbox AI question' : `AI question after milestone ${milestoneIndex + 1} message limit`,
        projectId: isSandbox ? undefined : projectId,
        milestoneNumber: isSandbox ? undefined : milestoneIndex + 1,
      });
    }

    if (progress) {
      await progress.incrementMessageCount(milestoneIndex);
      if (!shouldDeductCredits) {
        const messagesUsed = progress.getMessagesUsedInMilestone(milestoneIndex);
        const limit = progress.isFreeTrial 
          ? progress.messageLimits.freeTrialMessagesPerMilestone 
          : progress.messageLimits.purchasedMessagesPerMilestone;
        messagesRemaining = Math.max(limit - messagesUsed, 0);
      }
    }

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
