import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import swagger from "swagger-ui-express";
import YAML from "yamljs";

const app = express();

// for swagger documentation
const swaggerDocument = YAML.load("./swagger.yaml");
app.use("/api-docs", swagger.serve, swagger.setup(swaggerDocument));

//  regular middleware
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

// cookie and file middleware
app.use(cookieParser());
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/temp/",
  })
);

// morgan middleware
app.use(morgan("tiny"));

// import all router
import homeRoute from "./routes/homeRoute.js";
import userRoute from "./routes/userRoutes.js";

// router middleware
app.use("/api/v1/", homeRoute);
app.use("/api/v1/", userRoute);

export default app;
