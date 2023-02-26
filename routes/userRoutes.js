import express from "express";
import {
  signup,
  login,
  logout,
  getLoggedInUserDetails,
  forgotPassword,
  passwordReset,
  changePassword,
  updateUserDetails,
  adminAllUser,
  managerAllUser,
  adminGetOneUser,
  adminUpdateOneUser,
  adminDeleteOneUser,
} from "../controllers/userController.js";
import { customRole, isLoggedIn } from "../middlewares/userMiddlewares.js";

const router = express.Router();
router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/forgotPassword").post(forgotPassword);
router.route("/password/reset/:token").post(passwordReset);
router.route("/userdashboard").get(isLoggedIn, getLoggedInUserDetails);
router.route("/password/change").post(isLoggedIn, changePassword);
router.route("/dashboard/update").post(isLoggedIn, updateUserDetails);

router.route("/admin/users").get(isLoggedIn, customRole("admin"), adminAllUser);

router
  .route("/manager/users")
  .get(isLoggedIn, customRole("manager"), managerAllUser);

router
  .route("/admin/users/:id")
  .get(isLoggedIn, customRole("admin"), adminGetOneUser)
  .put(isLoggedIn, customRole("admin"), adminUpdateOneUser)
  .delete(isLoggedIn, customRole("admin"), adminDeleteOneUser);

export default router;
