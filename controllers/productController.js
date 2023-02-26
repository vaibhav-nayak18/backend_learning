import BigPromise from "../middlewares/bigPromise.js";
import { Product } from "../models/product.js";
import CustomError from "../utils/customError.js";
import WhereClause from "../utils/whereClouse.js";
import cloudinary from "cloudinary";

const addProduct = BigPromise(async (req, res, next) => {
  let imageArray = [];

  if (!req.files) {
    return next(new CustomError("images are required", 401));
  }
  console.log("RESULT", req.files.photos[0]);

  if (req.files) {
    for (let index = 0; index < req.files.photos.length; index++) {
      console.log("UPLOAD START...");
      let result = await cloudinary.v2.uploader.upload(
        req.files.photos[index].tempFilePath,
        {
          folder: "products",
        }
      );

      // another way to upload and check error
      // let result
      // cloudinary.v2.uploader.upload(req.files.photos[index].tempFilePath, {
      //   folder: "products"
      // }, function(error, result){console.log(result, error)})

      console.log("RESULT ", result);
      imageArray.push({
        id: result.public_id,
        secure_url: result.secure_url,
      });
    }
  }

  req.body.photos = imageArray;
  req.body.user = req.user.id;
  let product;

  try {
    product = await Product.create(req.body);
  } catch (error) {
    imageArray.map(async (img) => {
      await cloudinary.v2.uploader.destroy(img.id);
    });
    return next(new CustomError(error, 400));
  }

  res.status(200).json({
    success: true,
    product,
  });
});

const getAllProducts = BigPromise(async (req, res, next) => {
  const resultPerPage = 3;
  const totalcountProduct = await Product.countDocuments();

  const productsObj = new WhereClause(Product.find(), req.query)
    .search()
    .filter();

  let products = await productsObj.base;
  const filteredProductNumber = products.length;

  //products.limit().skip()

  productsObj.pager(resultPerPage);
  products = await productsObj.base.clone();

  res.status(200).json({
    success: true,
    products,
    filteredProductNumber,
    totalcountProduct,
    resultPerPage,
  });
});

const adminGetAllProducts = BigPromise(async (req, res, next) => {
  const products = await Product.find();

  if (!products) {
    return next(new CustomError("products are not available", 400));
  }

  res.status(200).json({
    success: true,
    products,
  });
});

const getOneProduct = BigPromise(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new CustomError("no product found with this id", 401));
  }

  res.status(200).json({
    success: true,
    product,
  });
});

const adminUpdateOneProduct = BigPromise(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new CustomError("no product found with this id", 400));
  }
  let imageArray = [];
  if (req.files) {
    product.photos.map(async (img) => {
      await cloudinary.v2.uploader.destroy(img.id);
    });
    for (let index = 0; index < req.files.photos.length; index++) {
      console.log("UPLOAD START...");
      let result = await cloudinary.v2.uploader.upload(
        req.files.photos[index].tempFilePath,
        {
          folder: "products",
        }
      );

      console.log("RESULT :", result);
      imageArray.push({
        id: result.public_id,
        secure_url: result.secure_url,
      });
    }
    req.body.photos = imageArray;
  }
  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    product,
  });
});

const adminDeleteOneUser = BigPromise(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new CustomError("product does not exist"));
  }
  product.photos.map(async (img) => {
    await cloudinary.v2.uploader.destroy(img.id);
  });

  const result = await product.delete();

  res.status(200).json({
    success: true,
    result,
    message: "product is deleted",
  });
});

const addReview = BigPromise(async (req, res, next) => {
  const { rating, comment, productId } = req.body;

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  const product = await Product.findById(productId);

  if (!product) {
    return next(new CustomError("no product is found with this id", 401));
  }

  const alreadyReview = product.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );

  if (alreadyReview) {
    product.reviews.forEach((rev) => {
      if (rev.user.toString() === req.user._id.toString()) {
        review.comment = comment;
        review.rating = rating;
      }
    });
  } else {
    product.reviews.push(review);
    product.numberOfReviews = product.reviews.length;
  }

  product.ratings =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    product.reviews.length;

  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
});

const deleteReviews = BigPromise(async (req, res, next) => {
  const { productId } = req.query;

  const product = await Product.findById(productId);

  if (!product) {
    return next(new CustomError("no product is found with this id", 401));
  }

  const reviews = product.reviews.filter(
    (rev) => rev.user.toString() === req.user._id.toString()
  );

  ratings =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    product.reviews.length;

  const numberOfReviews = reviews.length;

  await Product.findByIdAndUpdate(
    productId,
    {
      reviews,
      ratings,
      numberOfReviews,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    success: true,
    product,
  });
});

const getReviewForOneProduct = BigPromise(async (req, res, next) => {
  const product = await Product.findById(req.query.id);

  if (!product) {
    return next(new CustomError("not product is found with this id ", 400));
  }

  res.status(200).json({
    success: true,
    review: product.reviews,
  });
});
export {
  addProduct,
  getOneProduct,
  getAllProducts,
  adminGetAllProducts,
  adminUpdateOneProduct,
  adminDeleteOneUser,
  addReview,
  deleteReviews,
  getReviewForOneProduct,
};
