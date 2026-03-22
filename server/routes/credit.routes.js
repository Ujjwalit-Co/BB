import express from "express";
import {
  getCreditBalance,
  purchaseCredits,
  consumeCredits,
  getCreditHistory,
  unlockMilestone,
  getCreditPacks,
} from "../controllers/credit.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get("/balance", getCreditBalance);
router.get("/packs", getCreditPacks);
router.post("/purchase", purchaseCredits);
router.post("/consume", consumeCredits);
router.get("/history", getCreditHistory);
router.post("/unlock-milestone", unlockMilestone);

export default router;
