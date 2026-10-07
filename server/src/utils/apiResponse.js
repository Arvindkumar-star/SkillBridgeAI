const sendSuccess = (res, data, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data: data || {}
  });
};

const sendError = (res, message = 'Internal Server Error', statusCode = 500, code = 'INTERNAL_ERROR', details = null) => {
  const errorObj = {
    code: code,
    message: message
  };
  if (details) {
    errorObj.details = details;
  }
  return res.status(statusCode).json({
    success: false,
    error: errorObj
  });
};

module.exports = {
  sendSuccess,
  sendError
};
