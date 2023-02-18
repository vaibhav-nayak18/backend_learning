import User from "../models/user.js";
import BigPromise from "./bigPromise.js";
import CustomError from "../utils/customError.js";
import jwt from "jsonwebtoken";

const isLoggedIn = BigPromise(async (req, res, next) => {
  const token =
    req.cookies.token || req.header("Authorization").replace("Bearer", " ");

  if (!token) {
    return next(new CustomError("Login first to access this page", 401));
  }

  const decode = jwt.verify(token, process.env.JWTOKEN);
  console.log(decode);
  req.user = await User.findById(decode.id);

  next();
});

export { isLoggedIn };
