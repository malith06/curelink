const ApiError = require('../utils/ApiError');

const notFound = (req, res, next) => {
  next(new ApiError(`Cannot find ${req.originalUrl} on this server`, 404));
};

module.exports = notFound;
