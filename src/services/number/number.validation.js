import Joi from "joi";
import { generalFeilds } from "../../middleware/validation.middileware.js";

export const createNumberSchema = Joi.object()
  .keys({
    phoneNumber: Joi.string().required(),
    rating: Joi.number().integer().min(1).max(5).required(),
    status: Joi.string().valid("available", "sold", "offer").optional(),
  })
  .required();

export const updateNumberSchema = Joi.object()
  .keys({
    id: Joi.string().optional(), // id comes from params, so it's optional here
    phoneNumber: Joi.string().optional(),
    rating: Joi.number().integer().min(1).max(5).optional(),
    status: Joi.string().valid("available", "sold", "offer").optional(),
  })
  .unknown(true) // Allow unknown fields (like id from params)
  .required();

export const numberIdSchema = Joi.object()
  .keys({
    id: generalFeilds.id.required(),
  })
  .required();

