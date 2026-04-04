import express from "express";
import { uploadProjectImages, deleteProjectImage } from "../controllers/upload.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";
import { validateFileCount, validateFileSize } from "../middlewares/upload.middleware.js";

const router = express.Router();

// Upload multiple project images (up to 5)
router.post(
  "/project-images",
  protect,
  upload.array("images", 5),
  validateFileCount(5),
  validateFileSize(5 * 1024 * 1024), // 5MB for images
  uploadProjectImages
);

// Delete a project image
router.delete("/project-images/:publicId", protect, deleteProjectImage);

export default router;
