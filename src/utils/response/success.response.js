export const successResponse = ({ res, status = 200, data }) => {
  return res.status(status).json({ success: true, data });
};
