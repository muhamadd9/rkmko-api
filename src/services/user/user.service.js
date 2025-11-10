import { asyncHandler } from "../../utils/response/error.response.js";
import { successResponse } from "../../utils/response/success.response.js";
import userModel from "../../DB/model/User.model.js";
import { findById, getAll, findByIdAndUpdate } from "../../DB/dbService.js";
import { v2 as cloudinary } from "cloudinary";

export const getAllUsers = asyncHandler(async (req, res) => {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 20, 1);
    const skip = (page - 1) * limit;
    const sort = req.query.sort ? JSON.parse(req.query.sort) : { createdAt: -1 };
    const [count, users] = await getAll({ model: userModel, skip, limit, sort });
    return successResponse({ res, data: { count, page, limit, users } });
});

export const getUserById = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const user = await findById({ 
        model: userModel, 
        id,
        populate: [
            { path: 'followers', select: 'username profileImage' },
            { path: 'following', select: 'username profileImage' }
        ]
    });
    if (!user) return next(new Error("user not found", { cause: 404 }));
    
    const userObj = user.toObject ? user.toObject() : user;
    userObj.followersCount = user.followers?.length || 0;
    userObj.followingCount = user.following?.length || 0;
    
    return successResponse({ res, data: userObj });
});

export const getMe = asyncHandler(async (req, res, next) => {
    const currentUserId = req.user?.id;
    const me = await findById({ 
        model: userModel, 
        id: currentUserId, 
        select: "-password",
        populate: [
            { path: 'followers', select: 'username profileImage' },
            { path: 'following', select: 'username profileImage' }
        ]
    });
    if (!me) return next(new Error("user not found", { cause: 404 }));
    
    const userObj = me.toObject ? me.toObject() : me;
    userObj.followersCount = me.followers?.length || 0;
    userObj.followingCount = me.following?.length || 0;
    
    return successResponse({ res, data: userObj });
});

export const followUser = asyncHandler(async (req, res, next) => {
    const targetId = req.params.id;
    const currentUserId = req.user.id;
    if (String(targetId) === String(currentUserId)) {
        return next(new Error("You cannot follow yourself", { cause: 400 }));
    }
    const target = await findById({ model: userModel, id: targetId });
    if (!target) return next(new Error("user not found", { cause: 404 }));
    
    // Add current user to target's followers
    await findByIdAndUpdate({
        model: userModel,
        id: targetId,
        data: { $addToSet: { followers: currentUserId } },
    });
    
    // Add target to current user's following
    await findByIdAndUpdate({
        model: userModel,
        id: currentUserId,
        data: { $addToSet: { following: targetId } },
    });
    
    const updated = await findById({ model: userModel, id: targetId });
    return successResponse({ res, data: updated });
});

export const unfollowUser = asyncHandler(async (req, res, next) => {
    const targetId = req.params.id;
    const currentUserId = req.user.id;
    if (String(targetId) === String(currentUserId)) {
        return next(new Error("You cannot unfollow yourself", { cause: 400 }));
    }
    const target = await findById({ model: userModel, id: targetId });
    if (!target) return next(new Error("user not found", { cause: 404 }));
    
    // Remove current user from target's followers
    await findByIdAndUpdate({
        model: userModel,
        id: targetId,
        data: { $pull: { followers: currentUserId } },
    });
    
    // Remove target from current user's following
    await findByIdAndUpdate({
        model: userModel,
        id: currentUserId,
        data: { $pull: { following: targetId } },
    });
    
    const updated = await findById({ model: userModel, id: targetId });
    return successResponse({ res, data: updated });
});

export const updateProfile = asyncHandler(async (req, res, next) => {
    const currentUserId = req.user.id;
    const { username, bio } = req.body;
    
    // Check if username already exists (excluding current user)
    if (username) {
        const existingUser = await userModel.findOne({ username, _id: { $ne: currentUserId } });
        if (existingUser) {
            return next(new Error("Username already exists", { cause: 400 }));
        }
    }
    
    const updated = await findByIdAndUpdate({
        model: userModel,
        id: currentUserId,
        data: { username, bio },
        options: { new: true, select: "-password" },
    });
    return successResponse({ res, data: updated });
});

export const updateProfileImage = asyncHandler(async (req, res, next) => {
    const currentUserId = req.user.id;
    const user = await findById({ model: userModel, id: currentUserId });
    if (!user) return next(new Error("user not found", { cause: 404 }));
    
    // Delete old profile image from Cloudinary if exists
    if (user.profileImage?.public_id && req.body.profileImage?.public_id !== user.profileImage.public_id) {
        try { 
            await cloudinary.uploader.destroy(user.profileImage.public_id); 
        } catch { }
    }
    
    const updated = await findByIdAndUpdate({
        model: userModel,
        id: currentUserId,
        data: { profileImage: req.body.profileImage },
        options: { new: true, select: "-password" },
    });
    return successResponse({ res, data: updated });
});

export const updateCoverImage = asyncHandler(async (req, res, next) => {
    const currentUserId = req.user.id;
    const user = await findById({ model: userModel, id: currentUserId });
    if (!user) return next(new Error("user not found", { cause: 404 }));
    
    // Delete old cover image from Cloudinary if exists
    if (user.coverImage?.public_id && req.body.coverImage?.public_id !== user.coverImage.public_id) {
        try { 
            await cloudinary.uploader.destroy(user.coverImage.public_id); 
        } catch { }
    }
    
    const updated = await findByIdAndUpdate({
        model: userModel,
        id: currentUserId,
        data: { coverImage: req.body.coverImage },
        options: { new: true, select: "-password" },
    });
    return successResponse({ res, data: updated });
});



