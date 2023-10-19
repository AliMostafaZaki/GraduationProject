const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

// Get User Wallet
exports.getWallet = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ name: req.params.user }, { wallet: 1 });

  res.status(200).json({
    status: 'success',
    data: user,
  });
});

// Update User Wallet
exports.updateWallet = catchAsync(async (req, res, next) => {
  const wallet = await User.updateOne(
    { name: req.params.user },
    { wallet: req.body.wallet }
  );

  res.status(200).json({
    status: 'success',
    data: wallet,
  });
});

// Get All Users Details
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const doc = await User.find(
    { role: 'user' },
    { name: 1, wallet: 1, lastTimeProfitTaken: 1, profitRatio: 1, capital: 1 }
  );

  res.status(200).json({
    status: 'success',
    data: doc,
  });
});

// Update User Details
exports.updateUser = catchAsync(async (req, res, next) => {
  const doc = await User.updateOne(
    { name: req.body.name },
    {
      wallet: req.body.wallet,
      lastTimeProfitTaken: req.body.lastTimeProfitTaken,
    }
  );

  res.status(200).json({
    status: 'success',
    data: doc,
  });
});

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getMe = async (req, res, next) => {
  req.params.id = req.user.id;

  const doc = await User.findById(req.params.id);

  res.status(200).json({
    status: 'success',
    data: {
      data: doc,
    },
  });
};

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword.',
        400
      )
    );
  }

  const filteredBody = filterObj(req.body, 'name', 'email');
  if (req.file) filteredBody.photo = req.file.filename;

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});
