import { validate } from "../../middleware/validation.middileware.js";
import { authentication, authorization } from "../../middleware/auth.middleware.js";
import * as sellingNumberService from "./sellingNumber.service.js";
import { createSellingNumberSchema } from "./sellingNumber.validation.js";
import Router from "express";

const sellingNumberRouter = Router();

// Anyone can create
sellingNumberRouter.post("/", validate(createSellingNumberSchema), sellingNumberService.createSellingNumber);

// Admin only - get all
sellingNumberRouter.get("/", authentication(), authorization(["admin"]), sellingNumberService.getAllSellingNumbers);

export default sellingNumberRouter;

