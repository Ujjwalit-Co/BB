import express from "express";
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getSellerProjects,
  submitForReview,
  generateAIContent,
  downloadProject,
  getSellerProfile,
} from "../controllers/project.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllProjects);
router.get("/seller/my-projects", protect, getSellerProjects);
router.get("/seller/:sellerId/profile", getSellerProfile);
router.get("/:id", getProjectById);

// Protected routes (require authentication)
router.post("/", protect, createProject);
router.post("/generate-ai", protect, generateAIContent);
router.put("/:id", protect, updateProject);
router.delete("/:id", protect, deleteProject);
router.post("/:id/submit-review", protect, submitForReview);
router.get("/:id/download", protect, downloadProject);

export default router;


