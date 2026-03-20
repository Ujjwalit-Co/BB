import { Router } from "express";
import {login, logout, register, getProfile, forgotPassword, resetPassword, changePassword, updateUser} from '../controllers/user.controller.js';
import {isLoggedIn}  from "../middlewares/auth.middleware.js";
import {uploadImage} from "../middlewares/multer.middleware.js";
const router = Router();

router.post('/register', uploadImage.single("avatar"), register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', isLoggedIn ,getProfile);
router.post('/reset', forgotPassword);
router.post('/reset/:resetToken', resetPassword);
router.post('/change-password', isLoggedIn, changePassword);
router.put('/update/:id', isLoggedIn, uploadImage.single("avatar"), updateUser);



export default router;