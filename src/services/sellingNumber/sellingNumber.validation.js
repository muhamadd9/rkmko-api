import Joi from "joi";
import { generalFeilds } from "../../middleware/validation.middileware.js";

export const createSellingNumberSchema = Joi.object()
  .keys({
    name: Joi.string().required(),
    contactNumber: Joi.string().required(),
    address: Joi.string().required(),
    numberToSell: Joi.string().required(),
    price: Joi.string().required(),
    notes: Joi.string().optional().allow(""),
  })
  .required();

