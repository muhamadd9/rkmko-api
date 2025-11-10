import Router from "express";
import { authentication, authorization } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validation.middileware.js";
import { followSchema, userIdSchema, updateProfileSchema, updateProfileImageSchema, updateCoverSchema } from "./user.validation.js";
import { followUser, getAllUsers, getMe, getUserById, unfollowUser, updateProfile, updateProfileImage, updateCoverImage } from "./user.service.js";
import { attachUploadedImageUrl, fileValidations, uploadSingle } from "../../utils/multer/cloudinary.js";

const userRouter = Router();

// Authenticated route - Get current user (must be before /:id to avoid route conflict)
userRouter.get("/me", authentication(), authorization(), getMe);

// Public route - Get user by ID (profile viewing)
userRouter.get("/:id", validate(userIdSchema), getUserById);

// Authenticated routes
userRouter.use(authentication(), authorization());

userRouter.get("/", getAllUsers);
userRouter.post("/:id/follow", validate(followSchema), followUser);
userRouter.post("/:id/unfollow", validate(followSchema), unfollowUser);

// Profile update endpoints (only for own profile)
userRouter.patch("/me/profile", validate(updateProfileSchema), updateProfile);
userRouter.patch(
    "/me/profile-image",
    uploadSingle({ fieldName: "profileImage", fileValidation: fileValidations.image }),
    attachUploadedImageUrl("artscape/profile-images", "profileImage"),
    validate(updateProfileImageSchema),
    updateProfileImage
);
userRouter.patch(
    "/me/cover-image",
    uploadSingle({ fieldName: "coverImage", fileValidation: fileValidations.image }),
    attachUploadedImageUrl("artscape/cover-images", "coverImage"),
    validate(updateCoverSchema),
    updateCoverImage
);

export default userRouter;



