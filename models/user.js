import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide name"],
    maxlength: [40, "name should under the 40 character."],
  },
  email: {
    type: String,
    required: [true, "please provide an email"],
    validate: [validator.isEmail, "Please enter a valid email"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: [6, "Password should be atleast 6 char"],
    select: false,
  },
  role: {
    type: String,
    default: "user",
  },
  photo: {
    id: {
      type: String,
      // required: true,
    },

    secure_url: {
      type: String,
      // required: true,
    },
  },
  forgotPasswordToken: String,
  forgotPasswordExpireDate: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// encrypting password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

// validate the password with passed on user password
userSchema.methods.isValidatePassword = async function (userSendPassword) {
  return await bcrypt.compare(userSendPassword, this.password);
};

// create and return JWT token
userSchema.methods.getJWToken = function () {
  return jwt.sign(
    {
      id: this._id,
    },
    process.env.JWTOKEN,
    {
      expiresIn: process.env.JWTOKEN_EXPIRES,
    }
  );
};

// generate forgotPassword token
userSchema.methods.getForgotPasswordToken = function () {
  // generating long random string
  const forgotToken = crypto.randomBytes(19).toString("hex");

  // getting a hash
  this.forgotPasswordToken = crypto
    .createHash("sha256")
    .update(forgotToken)
    .digest("hex");

  // time of token
  this.forgotPasswordExpireDate = Date.now() + 20 * 60 * 1000;

  return forgotToken;
};
export default mongoose.model("User", userSchema);
