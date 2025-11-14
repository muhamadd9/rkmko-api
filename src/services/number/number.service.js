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

  // Helper function to count zeros in phone number
  const countZeros = (phoneNumber) => {
    if (!phoneNumber) return 0;
    // Remove dots and spaces, then count zeros
    const cleaned = phoneNumber.toString().replace(/[.\s]/g, '');
    return (cleaned.match(/0/g) || []).length;
  };

  // Fetch all numbers first (we need to sort by zero count, which requires all data)
  const [count, allNumbers] = await getAll({
    model: NumberModel,
    filter: {},
    skip: 0,
    limit: 10000, // Fetch a large number to ensure we get all
    sort: {},
  });

  // Sort by zero count (descending - more zeros first), then by createdAt (newest first) as secondary sort
  const sortedNumbers = allNumbers.sort((a, b) => {
    const zerosA = countZeros(a.phoneNumber);
    const zerosB = countZeros(b.phoneNumber);

    // Primary sort: by zero count (descending)
    if (zerosB !== zerosA) {
      return zerosB - zerosA;
    }

    // Secondary sort: by createdAt (newest first)
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  // Apply pagination after sorting
  const paginatedNumbers = sortedNumbers.slice(skip, skip + limit);

  return successResponse({ res, data: { count, page, limit, numbers: paginatedNumbers } });
});

export const getNumberById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const number = await findById({ model: NumberModel, id });
  if (!number) return next(new Error("Number not found", { cause: 404 }));
  return successResponse({ res, data: number });
});

