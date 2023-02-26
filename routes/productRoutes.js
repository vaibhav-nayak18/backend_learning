import express from "express";
import {
  addProduct,
  addReview,
  adminDeleteOneUser,
  adminGetAllProducts,
  adminUpdateOneProduct,
  deleteReviews,
  getAllProducts,
  getOneProduct,
  getReviewForOneProduct,
} from "../controllers/productController.js";
import { customRole, isLoggedIn } from "../middlewares/userMiddlewares.js";

const router = express.Router();

router.route("/products").get(getAllProducts);
router.route("/product/:id").get(getOneProduct);
router
  .route("/review")
  .put(isLoggedIn, addReview)
  .delete(isLoggedIn, deleteReviews);
router.route("/reviews").get(isLoggedIn, getReviewForOneProduct);

router
  .route("/admin/products/add")
  .post(isLoggedIn, customRole("admin"), addProduct);

router
  .route("/admin/products")
  .get(isLoggedIn, customRole("admin"), adminGetAllProducts);

router
  .route("/admin/product/:id")
  .put(isLoggedIn, customRole("admin"), adminUpdateOneProduct)
  .delete(isLoggedIn, customRole("admin"), adminDeleteOneUser);

export default router;
