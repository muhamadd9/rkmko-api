import Joi from "joi";
import { generalFeilds } from "../../middleware/validation.middileware.js";

export const userIdSchema = Joi.object()
    .keys({
        id: generalFeilds.id.required(),
    })
    .required();

export const followSchema = Joi.object()
    .keys({
        id: generalFeilds.id.required(), // target user id (artist)
    })
    .required();

export const updateProfileSchema = Joi.object()
    .keys({
        username: Joi.string().min(3).max(50).optional(),
        bio: Joi.string().max(500).optional().allow(""),
    })
    .required();

export const updateProfileImageSchema = Joi.object()
    .keys({
        profileImage: Joi.object({ url: Joi.string().uri().required(), public_id: Joi.string().required() }).optional(),
    })
    .required();

export const updateCoverSchema = Joi.object()
    .keys({
        coverImage: Joi.object({ url: Joi.string().uri().required(), public_id: Joi.string().required() }).optional(),
    })
    .required();



