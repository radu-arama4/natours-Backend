const User = require('./../models/userModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handleFactory');

const filterObj = (obj, ...alloweFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if(alloweFields.includes(el)){
      newObj[el] = obj[el];
    }
  })
  return newObj;
}

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
}

exports.deleteMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
}

exports.updateMe = catchAsync(async(req, res, next) => {
  // 1) Error of user posts password

  if(req.body.password || req.body.passwordConfirm){
    return next(new AppError('This route is not for password updates !',400))
  }

  // 2) Update user document
  const filteredBody = filterObj(req.body, 'name', 'email');
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {new: true, runValidators: true});

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  })
})

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);