import User from '../models/user.model.js';
import AppError from '../Utils/error.util.js';
import jwt from 'jsonwebtoken';

const isLoggedIn = async (req, res, next) => {
    const {token} = req.cookies;
    if(!token){
        return next(new AppError('Please login again to access', 401));
    }

    const userDetails = await jwt.verify(token, process.env.JWT_SECRET);
    req.user = userDetails;
    next();
}

const authorizedRoles = (...roles) => async (req, res, next) => {
    const currentUserRoles = req.user.role;

    if(!roles.includes(currentUserRoles)){
        return next(new AppError('You do no have permission to access this route',403));
    }
    next();
}

const authorizeSubscriber = async (req,  res, next)=>{
    const user = await User.findById(req.user.id);
    if(user.role !== 'ADMIN' && user.subscription.status !== 'ACTIVE'){
        return next(new AppError('please subscribe to access this route!',403));
    }
    next();
}

export{
    isLoggedIn,
    authorizedRoles,
    authorizeSubscriber
}
