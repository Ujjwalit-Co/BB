// import upload from "../middlewares/multer.middleware.js";
import User from "../models/user.model.js";
import AppError from "../Utils/error.util.js";
import cloudinary from 'cloudinary';
import fs from 'fs/promises';
import { forgetPassword_Mail } from '../Utils/sendEmail.util.js';
import crypto from 'crypto';

const cookieOptions = {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: true
}


const register = async (req, res,next)=>{
    
    try{
        const {fullName, email, password, role} = req.body;

        if(!fullName || !email || !password){
            return next(new AppError('All fields are Required', 400));
        }


        // check user exists
        const userExists = await User.findOne({email});

        if(userExists){
            return next(new AppError('Email already Exists!!', 400));
        }

        // create user
        const user = await User.create({
            fullName,
            email,
            password,
            role,
            avatar: {
                public_id: req.file ? req.file.filename : email,
                secure_url: req.file ? `${req.protocol}://${req.get('host')}/uploads/images/${req.file.filename}` : 'https://drive.google.com/file/d/1gnXAJZh-Of70TzpU1Meja4TAgqc6CVe7/view'
            }
        });

        if(!user){
            return next(new AppError('User registration Failed, please try again', 400));
        }

        // handle file upload
        if(req.file){
            
            try{
                const result = await cloudinary.v2.uploader.upload(req.file.path, {
                    folder: 'lms',
                    width: 250,
                    height: 250,
                    gravity: 'faces',
                    crop: 'fill'
                });
                
                if(result){
                    user.avatar = {
                        public_id: result.public_id,
                        secure_url: result.secure_url
                    }

                    // remove file from server
                    await fs.rm(`uploads/images/${req.file.filename}`)
                }
            }catch(err){
                return next(new AppError(err ||'Image upload failed, try again!!', 500));
            }
        }

        
        // upload.single('avatar')(req, res, async (err)=>{
        //     if(err){
        //         return next(new AppError(err.message || 'Image upload failed', 500));
        //     }
        // });
        
        await user.save();

        user.password = undefined;

        const token = await user.generateJWTToken();

        res.cookie('token', token, cookieOptions);

        res.status(201).json({
            success: true,
            message: 'user registered successfully',
            user,
            token
        });
        

    }catch(err){
        return next(new AppError("registration not succefull", 500));
    }
};
const login = async (req, res, next)=>{
    try{
        const {email, password} = req.body;
        if(!email || !password){
            return next(new AppError('All fields are Required', 400));
        } 
        const user = await User.findOne({
            email
        }).select('+password');

        if(!user || !user.comparePassword(password)){
            return next(new AppError('Invalid Credentials', 400));
        }

        const token = await user.generateJWTToken();
        user.password = undefined;
        res.cookie('token', token, cookieOptions);

        res.status(200).json({
            success: true,
            message: 'User logged in successfully',
            user,
            token
        });
    }catch(err){
        return next(new AppError(err.message, 500));
    }
};

const logout = (req, res)=>{
    res.cookie('token', null, {
        secure: true,
        httpOnly: true,
        maxAge: 0
    })
    res.status(200).json({
        success: true,
        message: 'User logged out successfully'
    });
};

const getProfile = async (req, res)=>{
    try{
        const userId = req.user.id;
        const user = await User.findById(userId);
        res.status(200).json({
            success: true,
            user
        }); 
    }catch(err){
        return next(new AppError('fail to fetch profile', 400));
    }
};

const forgotPassword = async (req, res, next)=>{
    const {email} = req.body;

    if(!email){
        return next(new AppError('Please provide email address', 400));
    }

    const user = await User.findOne({email});
    if(!user){
        return next(new AppError('No user found with this email', 404));
    }

    const resetToken = await user.generateResetPasswordToken();

    await user.save();
    const resetPasswordURl = `${process.env.FRONTEND_URL}/reset/${resetToken}`;

    const subject = 'Password Reset';
    const message = `You can reset your password by clicking on Link: <a href=${resetPasswordURl} target="_blank">Reset Your Password</a>\n\nIf you have not requested this email, then ignore it.`;

    console.log(message);
    try{
        await forgetPassword_Mail(email, subject, message);

        res.status(200).json({
            success: true,
            message: `Reset password token has been set to ${email} successfully`
        });
    }catch(e){
        user.forgotPasswordToken = undefined;
        user.forgotPasswordExpiry = undefined;

        await user.save();
        return next(new AppError(e.message, 500));
    }

};


const resetPassword = async (req, res, next)=>{
    const {resetToken} = req.params;
    const {password} = req.body;    
    const forgotPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    const user = await User.findOne({
        forgotPasswordToken,
        forgotPasswordExpiry: {$gt: Date.now()}
    });
    if(!user){
        return next(new AppError('Invalid Reset Token or Token Expired, try again', 400));
    }

    user.password = password;
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;
    user.save();

    res.status(200).json({
        success: true,
        message: 'Password reset successfully, login with new password'
    })
};

const changePassword = async (req, res, next)=>{
    const {oldPassword, newPassword} = req.body;
    const {id} = req.user;

    if(!oldPassword || !newPassword){
        return next(new AppError('All fields are required', 400));
    }

    const user = await User.findById(id).select('+password');
    if(!user){
        return next(new AppError('User does not exist', 404));
    }

    const isPasswordValid = await user.comparePassword(oldPassword);
    if(!isPasswordValid){
        return next(new AppError('Invalid old password', 400));
    }

    user.password = newPassword;
    await user.save();
    user.password = undefined;
    res.status(200).json({
        success: true,
        message: 'Password changed successfully',
    });
};


const updateUser = async (req, res, next)=>{
    const {id} = req.user;
    const {fullName} = req.body;
    const user = await User.findById(id);

    if(!user){
        return next(new AppError('User not found', 400));
    }
    if(fullName){
        user.fullName = fullName;
    }
    if(req.file){        

        try{
            const result = await cloudinary.v2.uploader.upload(req.file.path, {
                folder: 'lms',
                width: 250,
                height: 250,
                gravity: 'faces',
                crop: 'fill'
            });
            
            if(result){
                user.avatar = {
                    public_id: result.public_id,
                    secure_url: result.secure_url
                }

                // remove file from server
                fs.rm(`uploads/${req.file.filename}`)
            }
        }catch(err){
            return next(new AppError(err ||'Image upload failed, try again!!', 500));
        }
    }

    await user.save();
    res.status(200).json({
        success: true,
        message: 'User details updated successfully',
    });
};

const deductCredits = async (req, res, next) => {
    try {
        const { id } = req.user;
        const { amount } = req.body;

        const user = await User.findById(id);
        if (!user) {
            return next(new AppError('User not found', 404));
        }

        if (user.credits < amount) {
            return next(new AppError('Insufficient credits', 400));
        }

        user.credits -= amount;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Credits deducted successfully',
            credits: user.credits
        });
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
};


const unlockMilestone = async (req, res, next) => {
    try {
        const { id } = req.user;
        const { projectId, milestoneId } = req.body;

        if (!projectId || !milestoneId) {
            return next(new AppError('Project ID and Milestone ID are required', 400));
        }

        const user = await User.findById(id);
        if (!user) {
            return next(new AppError('User not found', 404));
        }

        // Check if milestone already unlocked
        const alreadyUnlocked = user.unlockedMilestones.some(
            m => m.projectId === projectId && m.milestoneId === milestoneId
        );

        if (alreadyUnlocked) {
            return res.status(200).json({
                success: true,
                message: 'Milestone already unlocked',
                credits: user.credits,
                unlockedMilestones: user.unlockedMilestones
            });
        }

        if (user.credits < 50) {
            return next(new AppError('Insufficient credits to unlock this milestone (requires 50 credits)', 400));
        }

        user.credits -= 50;
        user.unlockedMilestones.push({ projectId, milestoneId });
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Milestone unlocked successfully',
            credits: user.credits,
            unlockedMilestones: user.unlockedMilestones
        });
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
};


export {
    register,
    login,
    logout,
    getProfile,
    forgotPassword,
    resetPassword,
    changePassword,
    updateUser,
    deductCredits,
    unlockMilestone
};












// import User from "../models/user.model.js";
// import AppError from "../utils/error.util.js";

// const cookieOptions = {
//     maxAge: 24 * 60 * 60 * 1000,
//     httpOnly: true,
//     secure: true
// };

// const register = async (req, res, next) => {
//     try {
//         const { fullName, email, password } = req.body;

//         if (!fullName || !email || !password) {
//             return next(new AppError('All fields are Required', 400));
//         }

//         // Check if user exists
//         const userExists = await User.findOne({ email });

//         if (userExists) {
//             return next(new AppError('Email already Exists!!', 400));
            
//         }

//         // Create user
//         const user = new User({
//             fullName,
//             email,
//             password,
//             role: 'User',
//             avatar: {
//                 public_id: email,
//                 secure_url: 'https://drive.google.com/file/d/1gnXAJZh-Of70TzpU1Meja4TAgqc6CVe7/view'
//             }
//         });

//         // Handle file upload
//         if (req.file) {
//             user.avatar.public_id = req.file.filename;
//             user.avatar.secure_url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
//         }

//         await user.save();

//         user.password = undefined;

//         const token = await user.generateJWTToken();

//         res.cookie('token', token, cookieOptions);

//         res.status(201).json({
//             success: true,
//             message: 'User registered successfully',
//             user
//         });
//     } catch (err) {
//         return next(new AppError(err.message, 500));
//     }
// };

// const login = async (req, res, next) => {
//     try {
//         const { email, password } = req.body;
//         if (!email || !password) {
//             return next(new AppError('All fields are Required', 400));
//         }
//         const user = await User.findOne({ email }).select('+password');

//         if (!user || !(await user.comparePassword(password))) {
//             return next(new AppError('Invalid Credentials', 400));
//         }

//         const token = await user.generateJWTToken();
//         user.password = undefined;
//         res.cookie('token', token, cookieOptions);

//         res.status(200).json({
//             success: true,
//             message: 'User logged in successfully',
//             user
//         });
//     } catch (err) {
//         return next(new AppError(err.message, 500));
//     }
// };

// const logout = (req, res) => {
//     res.cookie('token', null, {
//         secure: true,
//         httpOnly: true,
//         maxAge: 0
//     });
//     res.status(200).json({
//         success: true,
//         message: 'User logged out successfully'
//     });
// };

// const getProfile = async (req, res, next) => {
//     try {
//         const userId = req.user.id;
//         const user = await User.findById(userId);
//         res.status(200).json({
//             success: true,
//             user
//         });
//     } catch (err) {
//         return next(new AppError('fail to fetch profile', 400));
//     }
// };

// export {
//     register,
//     login,
//     logout,
//     getProfile
// };

