import { asyncHandler } from "../../utils/response/error.response.js";
import { successResponse } from "../../utils/response/success.response.js";
import SellingNumberModel from "../../DB/model/SellingNumber.model.js";
import { create, getAll } from "../../DB/dbService.js";

export const createSellingNumber = asyncHandler(async (req, res) => {
  const { name, contactNumber, address, numberToSell, price, notes } = req.body;
  const sellingNumber = await create({
    model: SellingNumberModel,
    data: { name, contactNumber, address, numberToSell, price, notes: notes || "" },
  });
  return successResponse({ res, data: sellingNumber });
});

export const getAllSellingNumbers = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.max(parseInt(req.query.limit) || 1000, 1);
  const skip = (page - 1) * limit;
  const sort = req.query.sort ? JSON.parse(req.query.sort) : { createdAt: -1 };
  
  const [count, sellingNumbers] = await getAll({
    model: SellingNumberModel,
    filter: {},
    skip,
    limit,
    sort,
  });
  return successResponse({ res, data: { count, page, limit, sellingNumbers } });
});

