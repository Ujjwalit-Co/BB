import asyncHandler from "../middlewares/asyncHandler.middleware.js";
import User from "../models/user.model.js";
import AppError from "../utils/error.util.js";
import { contactUs_Mail } from "../utils/sendEmail.util.js";


export const contactUs = asyncHandler(async(req, res, next) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return next(new AppError('Name, Email, Message are required'));
      }

    try{
        const subject = "Contact Us Form";
        const textMessage = `${name} - ${email} <br /> ${message}`;

        await contactUs_Mail(email, subject, textMessage);
    } catch(error){
        return next(new AppError(error.message, 400));
    }

    res.status(200).json({
        success: true,
        message: "Your request has been submitted successfully"
    });
});

export const userStats = asyncHandler(async (req, res, next) => {
    const allUsersCount = await User.countDocuments();

    const subscribedUsersCount = await User.countDocuments({
        "subscription.status": "active"
    });

    res.status(200).json({
        success: true,
        message: 'All registered users count',
        allUsersCount,
        subscribedUsersCount,
    });
});