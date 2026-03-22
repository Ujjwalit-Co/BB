import express from "express";
import {
  registerUser,
  registerSeller,
  loginUser,
  getCurrentUser,
  updateProfile,
  logoutUser,
} from "../controllers/auth.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/register-seller", registerSeller);
router.post("/login", loginUser);

// Protected routes
router.get("/me", protect, getCurrentUser);
router.put("/me", protect, updateProfile);
router.post("/logout", protect, logoutUser);

export default router;
