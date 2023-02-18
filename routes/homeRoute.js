import express from "express";
import { home, dummy } from "../controllers/homeController.js";
const route = express.Router();

route.route("/").get(home);
route.route("/dummy").get(dummy);
export default route;
