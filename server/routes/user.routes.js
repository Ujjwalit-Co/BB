import { Router } from "express";
import {login, logout, register, getProfile, forgotPassword, resetPassword, changePassword, updateUser, deductCredits, unlockMilestone} from '../controllers/user.controller.js';
import {isLoggedIn}  from "../middlewares/auth.middleware.js";
import {uploadImage} from "../middlewares/multer.middleware.js";
const router = Router();

router.post('/register', uploadImage.single("avatar"), register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', isLoggedIn ,getProfile);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:resetToken', resetPassword);
router.post('/change-password', isLoggedIn, changePassword);
router.put('/update/:id', isLoggedIn, updateUser);
router.post('/deduct-credits', isLoggedIn, deductCredits);
router.post('/unlock-milestone', isLoggedIn, unlockMilestone);


export default router;