import { asyncHandler } from "../../utils/response/error.response.js";
import { successResponse } from "../../utils/response/success.response.js";
import NumberModel from "../../DB/model/Number.model.js";
import { create, findById, findByIdAndDelete, findByIdAndUpdate, getAll } from "../../DB/dbService.js";

export const createNumber = asyncHandler(async (req, res) => {
  const { phoneNumber, rating, status } = req.body;
  const number = await create({
    model: NumberModel,
    data: { phoneNumber, rating, status: status || "available" },
  });
  return successResponse({ res, data: number });
});

export const updateNumber = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { phoneNumber, rating, status } = req.body;
  const number = await findById({ model: NumberModel, id });
  if (!number) return next(new Error("Number not found", { cause: 404 }));
  
  // Build update data object with only provided fields
  const updateData = {};
  if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
  if (rating !== undefined) updateData.rating = rating;
  if (status !== undefined) updateData.status = status; // Can be "available" or "sold"
  
  const updated = await findByIdAndUpdate({
    model: NumberModel,
    id,
    data: updateData,
    options: { new: true },
  });
  return successResponse({ res, data: updated });
});

export const deleteNumber = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const number = await findById({ model: NumberModel, id });
  if (!number) return next(new Error("Number not found", { cause: 404 }));
  
  await findByIdAndDelete({ model: NumberModel, id });
  return successResponse({ res, data: { deleted: true } });
});

export const getAllNumbers = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.max(parseInt(req.query.limit) || 1000, 1);
  const skip = (page - 1) * limit;
  const sort = req.query.sort ? JSON.parse(req.query.sort) : { createdAt: -1 };
  
  const [count, numbers] = await getAll({
    model: NumberModel,
    filter: {},
    skip,
    limit,
    sort,
  });
  return successResponse({ res, data: { count, page, limit, numbers } });
});

export const getNumberById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const number = await findById({ model: NumberModel, id });
  if (!number) return next(new Error("Number not found", { cause: 404 }));
  return successResponse({ res, data: number });
});

