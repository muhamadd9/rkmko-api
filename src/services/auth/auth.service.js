import { asyncHandler } from "../../utils/response/error.response.js";
import userModel from "../../DB/model/User.model.js";
import { compareHash, hashPassword } from "../../utils/security/hash.js";
import emailEvent from "../../utils/events/email.event.js";
import { successResponse } from "../../utils/response/success.response.js";
import { createToken, decodedToken, tokenTypes, verifyToken } from "../../utils/security/token.js";
import { create, findById, findOne, updateOne } from "../../DB/dbService.js";

/* Sign up */
export const signup = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (await findOne({ model: userModel, filter: { email } })) {
    return next(new Error("Email already exists"));
  }
  await create({
    model: userModel,
    data: { email, password: hashPassword({ plainText: password }) },
  });

  return res.json({ success: true, message: "user has been created" });
});
/* Login */
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await findOne({ model: userModel, filter: { email } });

  if (!user) {
    return next(new Error("user not found", { cause: 404 }));
  }

  if (!compareHash({ plainText: password, hash: user.password })) {
    return next(new Error("invalid password", { cause: 400 }));
  }

  const access_token = createToken({
    payload: { email: user.email, id: user._id, role: user.role },
    signature: process.env.USER_ACCESS_TOKEN,
  });

  successResponse({ res, data: { access_token } });
});
/* Reset Password */
export const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await findOne({ model: userModel, filter: { email } });

  if (!user) {
    return next(new Error("user not found", { cause: 404 }));
  }

  emailEvent.emit("forgetPassword", {
    email,
    userId: user._id,
  });

  return successResponse({ res, data: "Email sent successfully" });
});

export const resetPassword = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { password } = req.body;

  const user = await findById({ model: userModel, id });

  if (!user) {
    return next(new Error("user not found", { cause: 404 }));
  }

  await updateOne({
    model: userModel,
    filter: { _id: user._id },
    data: {
      password: hashPassword({ plainText: password }),
    },
  });

  return successResponse({ res, data: "Password Changed Successfully " });
});
