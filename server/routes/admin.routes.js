import express from "express";
import {
  getPendingProjects,
  approveProject,
  declineProject,
  requestChanges,
  getAllProjectsAdmin,
  getAdminStats,
} from "../controllers/admin.controller.js";
import { protect, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

// All routes require authentication + admin role
router.use(protect);
router.use(authorize("admin"));

router.get("/pending-projects", getPendingProjects);
router.post("/:projectId/approve", approveProject);
router.post("/:projectId/decline", declineProject);
router.post("/:projectId/request-changes", requestChanges);
router.get("/all-projects", getAllProjectsAdmin);
router.get("/stats", getAdminStats);

export default router;
