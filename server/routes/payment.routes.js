import { Router } from 'express';
import { getRazorPayApiKey, createOrder, verifyPayment, getMyOrders } from '../controllers/payment.controller.js';
import { authorizedRoles, isLoggedIn } from '../middlewares/auth.middleware.js';

const router = Router();

router.route('/razorpay-key')
    .get(isLoggedIn, getRazorPayApiKey);

router.route('/create-order')
    .post(isLoggedIn, createOrder);

router.route('/verify-payment')
    .post(isLoggedIn, verifyPayment);

router.route('/my-orders')
    .get(isLoggedIn, getMyOrders);

router.route('/')
    .get(isLoggedIn, authorizedRoles('ADMIN'), (req, res) => res.status(200).json({ success: true, message: "Use admin tools for this." }));

export default router;
