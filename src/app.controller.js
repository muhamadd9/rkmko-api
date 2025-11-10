import connectDB from "./DB/connection.js";
import authRouter from "./services/auth/auth.controller.js";
import numberRouter from "./services/number/number.controller.js";
import sellingNumberRouter from "./services/sellingNumber/sellingNumber.controller.js";
import { globalErrorHandler } from "./utils/response/error.response.js";
import cors from "cors";
import { fileURLToPath } from "url";

import path from "path";

const bootstrap = (app, express) => {
  connectDB();

  app.use(express.json());
  app.use(cors());
  app.use("/uploads", express.static(path.resolve("./uploads")));

  app.use("/auth", authRouter);
  app.use("/number", numberRouter);
  app.use("/selling-number", sellingNumberRouter);
  app.use(globalErrorHandler);

  app.use("*", (req, res) => {
    res.status(404).json({ message: "Page Not Found" });
  });
};

export default bootstrap;
