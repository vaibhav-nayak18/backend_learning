import express from "express";
import { isLoggedIn } from "../middlewares/userMiddlewares";
import {
  captureStripePayment,
  sendStripeKey,
} from "../controllers/paymentControllers";

const router = express.Router();

router.route("/stripekey").get(isLoggedIn, sendStripeKey);
router.route("/capturestripe").post(isLoggedIn, captureStripePayment);

export default router;
