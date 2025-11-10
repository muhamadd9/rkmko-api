import { validate } from "../../middleware/validation.middileware.js";
import * as authService from "./auth.service.js";

import Router from "express";
import { signupSchema, loginSchema, resetPasswordSchema } from "./auth.validation.js";

const authRouter = Router();

authRouter.post("/signup", validate(signupSchema), authService.signup);
authRouter.post("/login", validate(loginSchema), authService.login);
authRouter.post("/forgot-password", authService.forgotPassword);
authRouter.post("/reset-password/:id", validate(resetPasswordSchema), authService.resetPassword);

export default authRouter;
