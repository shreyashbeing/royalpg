/**
 * Success Response
 */
export const successResponse = (
  res,
  message = "Success",
  data = {},
  statusCode = 200
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Error Response
 */
export const errorResponse = (
  res,
  message = "Something went wrong",
  statusCode = 500,
  error = null
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error,
  });
};
