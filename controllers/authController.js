const {promisify} = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { env } = require('process');

exports.signup = catchAsync(async(req, res, next) => {
    const newUser = await User.create({
        role: req.body.role,
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
    });

    const token = jwt.sign({id: newUser._id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });

    res.cookie('jwt', token, {
        expires: new Date(Date.now()+process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        //secure: true,//just https
        httpOnly: true 
    })

    res.status(201).json({
        status: 'succes',
        token,
        data: {
            user: newUser       
        }
    })
})

exports.login = catchAsync(async(req, res, next) => {
    const {email, password} = req.body;
    if(!email||!password){
        return next(new AppError('Please provide email and password', 400));
    }

    const user = await User.findOne({email}).select('+password');
    const correct = await user.correctPassword(password, user.password);

    if(!user||!correct){
        return next(new AppError('Incorrect email or password', 401));
    }

    const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });

    res.status(200).json({
        status: "Success",
        token
    })
})

exports.protect = catchAsync(async(req,res,next) => {
    let token;
    //1) Get token
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    }
    //console.log(token);
    if(!token){
        return next(new AppError('You are not logged in! Please log in...', 401));
    }
    //2) Check token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    //3) Check if the user still exists
    const freshUser = await User.findById(decoded.id);
    if(!freshUser){
        return next(new AppError('The user belonging to this token does not longer exist', 401));
    }
    //4) Check if the password wasn't changed
    if(freshUser.changedPasswordAfter(decoded.iat)){
        return next(new AppError('The user recently changed password. Please log in again !', 401));
    }
    //Grant access to protected route
    req.user = freshUser;
    next();
})

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        //roles - array of arguments - ['admin', 'lead-guide']. role='user'
        if(!roles.includes(req.user.role)){
            return next(new AppError('You do not have the permission to perform this action', 403));
        }
        next();
    };
}

exports.forgotPassword = catchAsync(async(req,res,next) => {
    //1) Get user based on Post-ed email
    const user = await User.findOne({email: req.body.email})
    if(!user){
        return next(new AppError('There is no user with this email adsress', 404));
    }
    //2) Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    //3) Send it to user's email
    
})

exports.resetPassword = (req,res,next) => {
    
}