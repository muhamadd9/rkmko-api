import { validate } from "../../middleware/validation.middileware.js";
import { authentication, authorization } from "../../middleware/auth.middleware.js";
import * as numberService from "./number.service.js";
import { createNumberSchema, updateNumberSchema, numberIdSchema } from "./number.validation.js";
import Router from "express";

const numberRouter = Router();

// Public routes
numberRouter.get("/", numberService.getAllNumbers);
numberRouter.get("/:id", validate(numberIdSchema), numberService.getNumberById);

// Admin only routes
numberRouter.post("/", authentication(), authorization(["admin"]), validate(createNumberSchema), numberService.createNumber);
numberRouter.put("/:id", authentication(), authorization(["admin"]), validate(updateNumberSchema), numberService.updateNumber);
numberRouter.delete("/:id", authentication(), authorization(["admin"]), validate(numberIdSchema), numberService.deleteNumber);

export default numberRouter;

