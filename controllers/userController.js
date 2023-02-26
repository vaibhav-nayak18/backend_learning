import BigPromise from "../middlewares/bigPromise.js";
import CustomError from "../utils/customError.js";
import { cookieToken } from "../utils/cookieToken.js";
import cloudinary from "cloudinary";
import mailHelper from "../utils/emailHelper.js";
import User from "../models/user.js";
import crypto from "crypto";

const signup = BigPromise(async (req, res, next) => {
  if (!req.files) {
    return next(new CustomError("Photo url is needed for signup", 400));
  }

  const { name, email, password } = req.body;

  if (!(name && email && password)) {
    return next(new CustomError("every field is required", 400));
  }

  let file = req.files.photo;
  const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
    folder: "users",
    width: 150,
    crop: "scale",
  });

  const user = await User.create({
    name,
    email,
    password,
    photo: {
      id: result.public_id,
      secure_url: result.secure_url,
    },
  });
  cookieToken(user, res);
});

const login = BigPromise(async (req, res, next) => {
  const { email, password } = req.body;
  // checking email and password

  if (!(email && password)) {
    return next(new CustomError("please provide required info", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new CustomError("email and password did not exist", 400));
  }

  const isPasswordCorrect = await user.isValidatePassword(password);

  if (!isPasswordCorrect) {
    return next(new CustomError("email and password are incorrect", 400));
  }
  cookieToken(user, res);
});

const logout = BigPromise(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    message: "Logout success",
  });
});

const forgotPassword = BigPromise(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return next(new CustomError("email is not found", 400));
  }

  const forgotToken = user.getForgotPasswordToken();

  await user.save({ validateBeforeSave: false });

  const myUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${forgotToken}`;

  const message = `copy paste this url \n\n ${myUrl}`;

  try {
    await mailHelper({
      toEmail: user.email,
      subject: "password reset email",
      message,
    });
    res.status(200).json({
      success: true,
      message: "email sent successfully",
    });
  } catch (error) {
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpireDate = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new CustomError("error.message", 400));
  }
});

const passwordReset = BigPromise(async (req, res, next) => {
  const token = req.params.token;

  const encryptToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    encryptToken,
    forgotPasswordExpireDate: { $gt: Date.now() },
  });

  if (!user) {
    return next(new CustomError("The token expired or invalid", 400));
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(
      new CustomError("password and confirm password does not match")
    );
  }
  user.password = req.body.password;

  user.forgotPasswordToken = undefined;
  user.forgotPasswordExpireDate = undefined;

  await user.save();

  cookieToken(user, res);
});

const getLoggedInUserDetails = BigPromise(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return next(new CustomError("user is not logout", 400));
  }
  res.status(200).json({
    success: true,
    user,
  });
});

const changePassword = BigPromise(async (req, res, next) => {
  const userId = req.user.id;

  const user = await User.findById(userId).select("+password");

  const isCorrectPassword = await user.isValidatePassword(req.body.oldPassword);

  if (!isCorrectPassword) {
    return next(new CustomError("old password is incorrect", 400));
  }
  user.password = req.body.password;

  await user.save();

  cookieToken(user, res);
});

const updateUserDetails = BigPromise(async (req, res, next) => {
  const newData = {
    name: req.body.name,
    email: req.body.email,
  };

  if (req.files) {
    const user = await User.findById(req.user.id);
    const imageId = user.photo.id;

    // delete photo in cloudinary
    const resp = await cloudinary.v2.uploader.destroy(imageId);

    // upload new photo
    const result = await cloudinary.v2.uploader.upload(
      req.files.photo.tempFilePath,
      {
        folder: "users",
        width: 150,
        crop: "scale",
      }
    );

    newData.photo = {
      id: result.public_id,
      secure_url: result.secure_url,
    };
  }
  const user = await User.findByIdAndUpdate(req.user.id, newData, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    success: true,
    user,
  });
});

const adminAllUser = BigPromise(async (req, res, next) => {
  const users = await User.find();

  if (!users) {
    return next(new CustomError("user is not an admin"));
  }

  res.status(200).json({
    success: true,
    users,
  });
});

const managerAllUser = BigPromise(async (req, res, next) => {
  const users = await User.find({ role: "user" });

  res.status(200).json({
    success: true,
    users,
  });
});

const adminGetOneUser = BigPromise(async (req, res, next) => {
  const id = req.params.id;
  const user = await User.findById(id);

  if (!user) {
    return next(new CustomError("user does not exist", 400));
  }

  res.status(200).json({
    success: true,
    user,
  });
});

const adminUpdateOneUser = BigPromise(async (req, res, next) => {
  const newData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  if (!(newData.name || newData.email || newData.role)) {
    return next(new CustomError("all fields are required"), 400);
  }

  const user = await User.findByIdAndUpdate(req.params.id, newData, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    return next(new CustomError("user does not exist"));
  }

  await user.save();

  res.status(201).json({
    success: true,
    user,
  });
});

const adminDeleteOneUser = BigPromise(async (req, res, next) => {
  const userId = req.params.id;

  const user = await User.findById(userId);

  if (!user) {
    next(new CustomError("user does not exist", 400));
  }

  const imageId = user.photo.id;

  await cloudinary.v2.uploader.destroy(imageId);

  await user.remove();

  res.status(200).json({
    success: true,
    user,
  });
});
export {
  signup,
  login,
  logout,
  forgotPassword,
  passwordReset,
  getLoggedInUserDetails,
  changePassword,
  updateUserDetails,
  adminAllUser,
  managerAllUser,
  adminGetOneUser,
  adminUpdateOneUser,
  adminDeleteOneUser,
};
