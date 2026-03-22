import express from "express";
import {
  createOrder,
  verifyPayment,
  getUserPurchases,
  getPurchaseById,
  getSellerSales,
} from "../controllers/purchase.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

router.post("/order", createOrder);
router.post("/verify", verifyPayment);
router.get("/my-purchases", getUserPurchases);
router.get("/seller/sales", getSellerSales);
router.get("/:id", getPurchaseById);

export default router;
