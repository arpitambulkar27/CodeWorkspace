// backend/src/middleware/errorHandler.js

/**
 * Centralized Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error("Unhandled Application Error:", err.stack || err.message || err);

  // Handle Mongoose CastError (e.g. invalid ObjectId format passed via URL params)
  if (err.name === "CastError" && err.kind === "ObjectId") {
    return res.status(400).json({ error: `Invalid resource ID format: ${err.value}` });
  }

  // Handle SyntaxError for bad JSON payloads
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ error: "Malformed JSON payload in request body." });
  }

  // Default internal server error fallback
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  return res.status(statusCode).json({
    error: err.message || "An internal server error occurred.",
  });
};

module.exports = errorHandler;
