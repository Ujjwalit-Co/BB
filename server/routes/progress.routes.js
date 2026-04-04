import express from "express";
import {
  startFreeTrial,
  getUserProgress,
  saveUserProgress,
  completeStep,
  checkTrialStatus,
  proxyAskQuestion,
} from "../controllers/progress.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

router.post("/start", startFreeTrial);
router.get("/:projectId", getUserProgress);
router.put("/:projectId", saveUserProgress);
router.post("/:projectId/complete-step", completeStep);
router.get("/:projectId/trial-status", checkTrialStatus);
router.post("/:projectId/ask", proxyAskQuestion);

export default router;
