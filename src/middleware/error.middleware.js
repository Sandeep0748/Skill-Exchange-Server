const errorHandler = (err, req, res, next) => {
  console.error("❌ Error:", err);

  // Default error response
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || "Internal Server Error";

  // Mongoose Validation Error
  if (err.name === "ValidationError") {
    statusCode = 400;
    const errors = Object.values(err.errors).map((error) => error.message);
    message = "Validation Error";
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
    });
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyPattern)[0];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    return res.status(statusCode).json({
      success: false,
      message,
    });
  }

  // Mongoose Cast Error
  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid ID format";
    return res.status(statusCode).json({
      success: false,
      message,
    });
  }

  // JWT Errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
    return res.status(statusCode).json({
      success: false,
      message,
    });
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
    return res.status(statusCode).json({
      success: false,
      message,
    });
  }

  // Generic error response
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { error: err.stack }),
  });
};

module.exports = errorHandler;
