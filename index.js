import env from "dotenv";
env.config();
import app from "./app.js";
import cloudinary from "cloudinary";
import { connectDb } from "./config/db.js";

// connecting to database
connectDb();

// connecting to cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API,
  api_secret: process.env.CLOUDINARY_SECRET,
});
app.listen(process.env.PORT, () => {
  console.log(`hello from ${process.env.PORT}`);
});
