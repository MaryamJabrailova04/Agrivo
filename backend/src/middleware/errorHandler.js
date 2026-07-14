import { ApiError } from "../utils/ApiError.js";

export function notFoundHandler(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

function mapPrismaError(err) {
  if (!err) return null;

  if (err.name === "PrismaClientValidationError") {
    const detail = String(err.message || "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .pop();
    return {
      statusCode: 400,
      message: detail || "Invalid data sent to the database.",
    };
  }

  if (err.code === "P2002") {
    return { statusCode: 409, message: "A conflicting record already exists." };
  }

  if (err.code === "P2003") {
    return {
      statusCode: 400,
      message: "Invalid related record. Check product, farmer, or buyer IDs.",
    };
  }

  if (err.code === "P2025") {
    return { statusCode: 404, message: "Requested record was not found." };
  }

  return null;
}

export function errorHandler(err, req, res, next) {
  const mapped = mapPrismaError(err);
  const statusCode = err.statusCode ?? mapped?.statusCode ?? 500;
  const message = mapped?.message ?? err.message ?? "Internal server error";

  if (statusCode >= 500 || process.env.NODE_ENV === "development") {
    console.error("API ERROR:", {
      method: req.method,
      path: req.originalUrl,
      statusCode,
      message,
      error: err,
    });
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development"
      ? {
          error: err.message,
          ...(statusCode >= 500 ? { stack: err.stack } : {}),
        }
      : {}),
  });
}
