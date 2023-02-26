import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "please provide a name"],
    trim: true,
    maxlength: [120, "Product name should be less than 120 char"],
  },

  price: {
    type: Number,
    required: [true, "please provide a product price"],
    maxlength: [5, "Product price should not more than 5 digits"],
  },
  description: {
    type: String,
    required: true,
  },
  photos: [
    {
      id: {
        type: String,
        required: true,
      },
      secure_url: {
        type: String,
        required: true,
      },
    },
  ],
  category: {
    type: String,
    required: [true, "please select category"],
    enum: {
      values: ["shortSleeves", "longSleeves", "sweatShirts", "hoodies"],
      message:
        "please select a category only from 'short-sleeves', 'long-sleeves', 'sweat-shirts', 'hoodies' ",
    },
  },
  brand: {
    type: String,
    required: [true, "please provide a brand name"],
  },
  ratings: {
    type: Number,
    default: 0,
  },
  numberOfReviews: {
    type: Number,
    default: 0,
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
      name: {
        type: String,
        required: true,
        maxlength: 200,
      },
      rating: {
        type: Number,
        required: true,
      },
      comment: {
        type: String,
        required: true,
      },
    },
  ],
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Product = mongoose.model("Product", productSchema);
