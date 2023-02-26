import User from "../models/user.js";
import BigPromise from "./bigPromise.js";
import CustomError from "../utils/customError.js";
import jwt from "jsonwebtoken";

const isLoggedIn = BigPromise(async (req, res, next) => {
  const token =
    req.cookies.token || req.header("Authorization")?.replace("Bearer", " ");

  if (!token) {
    return next(new CustomError("Login first to access this page", 401));
  }

  const decode = jwt.verify(token, process.env.JWTOKEN);
  req.user = await User.findById(decode.id);

  next();
});

const customRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new CustomError("you are not allowed", 403));
    }
    next();
  };
};

export { isLoggedIn, customRole };
