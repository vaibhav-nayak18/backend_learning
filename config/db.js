import mongoose from "mongoose";

mongoose.set("strictQuery", true);

export const connectDb = () => {
  mongoose
    .connect(process.env.MONGO_DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(console.log("DB connected..."))
    .catch((err) => {
      console.log(err);
      console.log("DB failed...");
    });
};
