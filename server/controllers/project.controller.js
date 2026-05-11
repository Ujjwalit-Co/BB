import Project from "../models/Project.js";
import { generateMilestones, generateProjectSummary, analyzeComplexity, enhanceReadmeForTutor, enhanceSummary as enhanceSummaryAI, enhanceMilestones as enhanceMilestonesAI, generateQuizzesForProjectBg } from "../services/ai.service.js";
import { streamRepositoryZip } from "../services/github.service.js";
import User from "../models/User.js";
import Purchase from "../models/Purchase.js";
import mongoose from "mongoose";

const CATEGORY_ALIASES = {
  "Trending in Market": "trending",
  "Hackathon Critic Favorites": "hackathon",
  "Last Minute Helpers": "last-minute",
  Trending: "trending",
  Hackathon: "hackathon",
  "Quick Builds": "last-minute",
};

function normalizeProjectPayload(payload = {}) {
  const normalized = { ...payload };

  if (normalized.category && CATEGORY_ALIASES[normalized.category]) {
    normalized.category = CATEGORY_ALIASES[normalized.category];
  }

  if (Array.isArray(normalized.screenshots)) {
    normalized.screenshots = normalized.screenshots
      .map((image) => {
        if (!image) return "";
        if (typeof image === "string") return image;
        return image.secure_url || image.url || image.src || "";
      })
      .filter(Boolean);
  }

  if (Array.isArray(normalized.uploadedImages)) {
    normalized.screenshots = normalized.uploadedImages
      .map((image) => image?.secure_url || image?.url || "")
      .filter(Boolean);
    delete normalized.uploadedImages;
  }

  if (Array.isArray(normalized.milestones)) {
    normalized.milestones = normalized.milestones.map((milestone, idx) => ({
      ...milestone,
      number: milestone.number || idx + 1,
      title: milestone.title || milestone.name || `Milestone ${idx + 1}`,
      description: milestone.description || milestone.objective || "",
      estimatedTime: milestone.estimatedTime || milestone.estimated_time || "2 hours",
      steps: Array.isArray(milestone.steps)
        ? milestone.steps.map((step, stepIdx) => ({
            ...step,
            stepNumber: step.stepNumber || step.step_number || stepIdx + 1,
            title: step.title || step.name || `Step ${stepIdx + 1}`,
            description: step.description || step.instructions || "",
          }))
        : [],
    }));
  }

  return normalized;
}

// Get public seller profile and their projects
export const getSellerProfile = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.sellerId)) {
      return res.status(400).json({ message: "Invalid seller ID format" });
    }

    const seller = await User.findById(req.params.sellerId).select('name email avatar bio createdAt');
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    const projects = await Project.find({ seller: req.params.sellerId, isPublished: true })
      .select("-milestones") // Exclude heavy learning data
      .sort({ createdAt: -1 });

    res.json({ success: true, seller, projects });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all projects (with optional filters)
export const getAllProjects = async (req, res) => {
  try {
    const { category, badge, tech, search } = req.query;
    
    let query = { isPublished: true };
    
    if (category) query.category = CATEGORY_ALIASES[category] || category;
    if (badge) query.badge = badge;
    if (tech) query.techStack = { $in: [tech] };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const projects = await Project.find(query)
      .populate("seller", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single project by ID
export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("seller", "name email avatar")
      .populate("reviews.user", "name avatar");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Increment views using findByIdAndUpdate to avoid full document save
    await Project.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    res.json({ success: true, project });
  } catch (error) {
    console.error("[getProjectById] Error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Submit or update a learner review
export const rateProject = async (req, res) => {
  try {
    const { rating, comment = "" } = req.body;
    const numericRating = Number(rating);

    if (!Number.isFinite(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.seller.toString() === req.user._id.toString()) {
      return res.status(403).json({ message: "Creators cannot review their own course" });
    }

    const hasAccess = Number(project.price) === 0
      || req.user.role === "admin"
      || await Purchase.hasPurchased(req.user._id, project._id);

    if (!hasAccess) {
      return res.status(403).json({ message: "Unlock the course before leaving a rating" });
    }

    const existingReview = project.reviews.find((review) => review.user.toString() === req.user._id.toString());
    if (existingReview) {
      existingReview.rating = numericRating;
      existingReview.comment = String(comment).trim().slice(0, 500);
      existingReview.createdAt = new Date();
    } else {
      project.reviews.push({
        user: req.user._id,
        rating: numericRating,
        comment: String(comment).trim().slice(0, 500),
      });
    }

    const total = project.reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0);
    project.rating = project.reviews.length ? Number((total / project.reviews.length).toFixed(1)) : 0;
    await project.save();

    const updatedProject = await Project.findById(project._id)
      .populate("seller", "name email avatar")
      .populate("reviews.user", "name avatar");

    res.json({ success: true, project: updatedProject });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create project (seller only)
export const createProject = async (req, res) => {
  try {
    const projectData = {
      ...normalizeProjectPayload(req.body),
      seller: req.user._id,
    };

    const project = await Project.create(projectData);
    
    // Auto-generate quizzes in the background
    generateQuizzesForProjectBg(project._id).catch(err => console.error("Bg Quiz Error:", err));

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      project,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update project
export const updateProject = async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Safely extract the seller ID (handles if it's an object or string)
    const projectSellerId = project.seller._id ? project.seller._id.toString() : project.seller.toString();

    // Check if user is the seller or admin
    if (projectSellerId !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to update this project" });
    }

    project = await Project.findByIdAndUpdate(req.params.id, normalizeProjectPayload(req.body), {
      new: true,
      runValidators: true,
    });

    // Auto-generate quizzes in the background (if any are missing)
    generateQuizzesForProjectBg(project._id).catch(err => console.error("Bg Quiz Error:", err));

    res.json({ success: true, project });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Fetch or generate dynamic quiz for a standalone milestone
export const getMilestoneQuiz = async (req, res) => {
  try {
    const { id, milestoneNumber } = req.params;
    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ error: "Project not found" });
    
    const msNum = parseInt(milestoneNumber);
    const ms = project.milestones.find(m => m.number === msNum);
    if (!ms) return res.status(404).json({ error: "Milestone not found" });

    if (ms.quiz && ms.quiz.questions && ms.quiz.questions.length > 0) {
      // Check if the first question has a correctAnswer. If missing, the quiz is broken.
      const isBroken = ms.quiz.questions.some(q => q.correctAnswer === undefined && q.correct_answer === undefined);
      if (!isBroken) {
        return res.json({ questions: ms.quiz.questions });  // Changed from quiz to questions
      }
      console.log(`[project.controller] Quiz for milestone ${msNum} is broken (missing correctAnswer). Re-generating...`);
    }

    const { generateQuiz } = await import("../services/ai.service.js");
    const quizData = await generateQuiz(project, ms, msNum);
    
    if (quizData && (quizData.quiz || quizData.questions)) {
      const rawQuestions = quizData.questions || quizData.quiz || [];
      
      // Normalize questions to match schema and ensure consistency
      const normalizedQuestions = rawQuestions.map(q => {
        if (!q || typeof q !== 'object') return null;

        const options = Array.isArray(q.options) 
          ? q.options.map(opt => String(opt).trim()) 
          : [];
        
        let correctIdx = q.correctAnswer ?? q.correct_answer ?? q.answer;
        let finalIdx = 0;
        
        if (typeof correctIdx === 'number') {
          finalIdx = correctIdx;
        } else if (typeof correctIdx === 'string') {
          const trimmedCorrect = correctIdx.trim();
          // 1. Try exact match in options
          const exactIdx = options.indexOf(trimmedCorrect);
          if (exactIdx !== -1) {
            finalIdx = exactIdx;
          } else {
            // 2. Try case-insensitive match
            const lowerCorrect = trimmedCorrect.toLowerCase();
            const caseInsensitiveIdx = options.findIndex(opt => opt.toLowerCase() === lowerCorrect);
            if (caseInsensitiveIdx !== -1) {
              finalIdx = caseInsensitiveIdx;
            } else {
              // 3. Try parsing as a number index
              const parsed = parseInt(trimmedCorrect);
              if (!isNaN(parsed) && parsed >= 0 && parsed < options.length) {
                finalIdx = parsed;
              }
            }
          }
        }
        
        // Final bounds check
        if (finalIdx < 0 || finalIdx >= options.length) {
          finalIdx = 0;
        }
        
        return {
          question: String(q.question || "Conceptual Question").trim(),
          options: options.length >= 2 ? options : ["Option A", "Option B", "Option C", "Option D"],
          correctAnswer: finalIdx,
          explanation: String(q.explanation || "").trim()
        };
      }).filter(Boolean);

      if (normalizedQuestions.length > 0) {
        ms.quiz = { questions: normalizedQuestions };
        await project.save();
        return res.json({ questions: normalizedQuestions });
      }
    }
    
    res.status(500).json({ error: "Failed to generate dynamic quiz" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete project
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Safely extract the seller ID
    const projectSellerId = project.seller._id ? project.seller._id.toString() : project.seller.toString();

    // Check if user is the seller or admin
    if (projectSellerId !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this project" });
    }

    await project.deleteOne();

    res.json({ success: true, message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get seller's own projects
export const getSellerProjects = async (req, res) => {
  try {
    const projects = await Project.find({ seller: req.user._id })
      .sort({ createdAt: -1 });

    res.json({ success: true, count: projects.length, projects });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Submit project for admin review
export const submitForReview = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    project.reviewStatus = "pending";
    project.submittedAt = new Date();
    await project.save();

    // Generate missing quizzes during seller-controlled review flow, not public page views.
    generateQuizzesForProjectBg(project._id).catch(err => console.error("Bg Quiz Error:", err));

    res.json({ success: true, message: "Project submitted for review", project });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =====================
// GENERATE AI CONTENT (milestones, summary, description)
// =====================
export const generateAIContent = async (req, res) => {
  try {
    const { readme, files, techStack } = req.body;

    if (!readme) {
      return res.status(400).json({ message: "README content is required" });
    }

    const [overviewResult, complexityResult] = await Promise.allSettled([
      generateMilestones(readme, files, techStack),
      analyzeComplexity(files, techStack),
    ]);

    const overview = overviewResult.status === 'fulfilled' ? overviewResult.value : {};
    const complexity = complexityResult.status === 'fulfilled' ? complexityResult.value : { complexity: 'beginner' };

    // Flatten into a clean response the frontend can directly consume
    res.json({
      success: true,
      readme: overview.readme || readme,
      summary: overview.summary || readme.substring(0, 300),
      milestones: overview.milestones || [],
      complexity,
      aiAvailable: overview.success !== false, // tells frontend if AI actually ran or fallback was used
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =====================
// ENHANCE README FOR AI TUTOR
// =====================
export const enhanceReadme = async (req, res) => {
  try {
    const { readme } = req.body;
    if (!readme) {
      return res.status(400).json({ message: "README content is required" });
    }
    const result = await enhanceReadmeForTutor(readme);
    res.json({ success: true, enhanced_readme: result.enhanced_readme, aiAvailable: result.success });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =====================
// ENHANCE SUMMARY
// =====================
export const enhanceSummaryContent = async (req, res) => {
  try {
    const { summary, readme } = req.body;
    if (!summary) {
      return res.status(400).json({ message: "Summary content is required" });
    }
    const result = await enhanceSummaryAI(summary, readme || '');
    res.json({ success: true, enhanced_summary: result.enhanced_summary, aiAvailable: result.success });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =====================
// ENHANCE MILESTONES
// =====================
export const enhanceMilestonesContent = async (req, res) => {
  try {
    const { milestones, readme } = req.body;
    if (!milestones || !Array.isArray(milestones)) {
      return res.status(400).json({ message: "Milestones array is required" });
    }
    const result = await enhanceMilestonesAI(milestones, readme || '');
    res.json({ success: true, enhanced_milestones: result.enhanced_milestones, aiAvailable: result.success });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =====================
// DOWNLOAD PROJECT (after purchase verification)
// =====================
export const downloadProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Verify user has purchased this project
    const { default: Purchase } = await import("../models/Purchase.js");
    const purchase = await Purchase.findOne({
      buyer: req.user._id,
      project: project._id,
      status: 'completed',
    });

    if (!purchase && req.user.role !== 'admin') {
      return res.status(403).json({ message: "You haven't purchased this project" });
    }

    // --- PATH 1 (Primary): Fetch full repo from GitHub server-side ---
    const githubUrl = project.githubUrl || "";
    if (githubUrl) {
      try {
        const seller = await User.findById(project.seller._id || project.seller);
        if (seller && seller.githubAccessToken) {
          const { decrypt } = await import("../controllers/github.controller.js");
          const decryptedToken = decrypt(seller.githubAccessToken);

          const urlParts = githubUrl.replace("https://github.com/", "").split("/");
          const owner = urlParts[0];
          const repo = urlParts[1]?.replace(".git", "");

          if (owner && repo) {
            const ghResponse = await fetch(
              `https://api.github.com/repos/${owner}/${repo}/zipball/main`,
              {
                headers: {
                  Authorization: `Bearer ${decryptedToken}`,
                  Accept: "application/vnd.github.v3+json",
                },
                redirect: "follow",
              }
            );

            if (ghResponse.ok) {
              const safeName = (project.title || "project").replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase();
              res.setHeader("Content-Type", "application/zip");
              res.setHeader("Content-Disposition", `attachment; filename="${safeName}.zip"`);

              const { Readable } = await import("stream");
              const readable = Readable.fromWeb(ghResponse.body);
              readable.pipe(res);
              return;
            }
            // If GitHub fetch failed, fall through to codeFiles
            console.warn(`GitHub download failed (${ghResponse.status}), falling back to codeFiles`);
          }
        }
      } catch (ghError) {
        console.warn("GitHub download error, falling back to codeFiles:", ghError.message);
      }
    }

    // --- PATH 2 (Fallback): Build ZIP from stored codeFiles in MongoDB ---
    if (project.codeFiles && project.codeFiles.length > 0) {
      const archiver = (await import("archiver")).default;
      const archive = archiver("zip", { zlib: { level: 9 } });

      const safeName = (project.title || "project").replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase();

      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", `attachment; filename="${safeName}.zip"`);

      archive.on("error", (err) => {
        console.error("Archive error:", err);
        res.status(500).end();
      });

      archive.pipe(res);

      for (const file of project.codeFiles) {
        const filename = file.filename || file.path || `file_${Math.random().toString(36).slice(2, 8)}`;
        archive.append(file.content || "", { name: filename });
      }

      if (project.readme) {
        archive.append(project.readme, { name: "README.md" });
      }

      await archive.finalize();
      return;
    }

    // Nothing available
    return res.status(400).json({ message: "No code files or repository available for download" });
  } catch (error) {
    console.error("Download error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
};

