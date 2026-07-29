class ApiError extends Error {
  constructor(message, statusCode, errors = []) {
    // Hack to support codebase using (statusCode, message)
    if (typeof message === 'number') {
      const temp = message;
      message = statusCode;
      statusCode = temp;
    }

    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.errors = errors;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
