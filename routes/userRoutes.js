import express from "express";
import {
  signup,
  login,
  logout,
  getLoggedInUserDetails,
  forgotPassword,
  passwordReset,
  changePassword,
} from "../controllers/userController.js";
import { isLoggedIn } from "../middlewares/userMiddlewares.js";

const router = express.Router();
router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/forgotPassword").post(forgotPassword);
router.route("/password/reset/:token").post(passwordReset);
router.route("/userdashboard").get(isLoggedIn, getLoggedInUserDetails);
router.route("/password/change").post(isLoggedIn, changePassword);

export default router;
