import AppError from "../Utils/error.util.js";
import User from "../models/user.model.js";
import Payment from "../models/payment.model.js";
import crypto from 'crypto';
import razorpay from "../config/razorpayConfig.js";
import Project from "../models/project.model.js";

const getRazorPayApiKey = async (req, res) => {
    res.status(200).json({
        success: true,
        message: 'RazorPay API Key',
        key: process.env.RAZORPAY_KEY_ID
    });
};

const createOrder = async (req, res, next) => {
    try {
        const { productId } = req.body;
        const project = await Project.findById(productId);
        if (!project) {
            return next(new AppError('Project not found', 404));
        }

        const options = {
            amount: project.price * 100, // in paise
            currency: "INR",
            receipt: `receipt_${project._id}`,
        };

        console.log("Creating Razorpay order for project:", productId);
        const order = await razorpay.orders.create(options);
        console.log("Razorpay order created:", order.id);

        res.status(200).json({
            success: true,
            message: 'Order created successfully',
            amount: order.amount,
            currency: order.currency,
            id: order.id,
        });
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
};

const verifyPayment = async (req, res, next) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, productId } = req.body;
        const { id } = req.user;

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        console.log("Verifying payment for order:", razorpay_order_id);

        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        console.log("Expected signature:", expectedSignature);
        console.log("Received signature:", razorpay_signature);

        if (expectedSignature !== razorpay_signature) {
            console.error("Signature mismatch!");
            return next(new AppError('Payment verification failed', 400));
        }

        await Payment.create({
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature,
            user: id
        });

        const user = await User.findById(id);
        if (productId) {
            // Check if project is already purchased to avoid duplicates
            const isAlreadyPurchased = user.purchasedProjects.some(
                (p) => p.toString() === productId
            );
            
            if (!isAlreadyPurchased) {
                user.purchasedProjects.push(productId);
                await user.save();
            }
        }

        res.status(200).json({
            success: true,
            message: 'Payment verified successfully',
        });
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
};

const getMyOrders = async (req, res, next) => {
    try {
        const { id } = req.user;
        const user = await User.findById(id).populate('purchasedProjects');
        if (!user) {
            return next(new AppError('User not found', 404));
        }

        res.status(200).json({
            success: true,
            message: 'My orders',
            orders: user.purchasedProjects
        });
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
};

export {
    getRazorPayApiKey,
    createOrder,
    verifyPayment,
    getMyOrders
};
