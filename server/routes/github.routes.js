import express from "express";
import {
  connectGitHub,
  githubCallback,
  disconnectGitHub,
  listRepositories,
  getRepoFiles,
  getFileContent,
  getGitHubStatus,
} from "../controllers/github.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get("/connect", connectGitHub);
router.post("/callback", githubCallback);
router.post("/disconnect", disconnectGitHub);
router.get("/repositories", listRepositories);
router.get("/repos/:owner/:repo/files", getRepoFiles);
router.get("/repos/:owner/:repo/content", getFileContent);
router.get("/status", getGitHubStatus);

export default router;
