import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("Error:", err); // Log error for debugging

  // Check for Apify authentication issue
  if (err?.statusCode === 401) {
    return res.status(401).json({
      message: "Apify authentication failed. The API key is likely invalid.",
    });
  }

  // Check for custom NOT_AUTHENTICATED error
  if (err?.message === "NOT_AUTHENTICATED") {
    return res.status(401).json({
      message: "Not authenticated. Please provide an API key first.",
    });
  }

  // Generic error fallback
  return res.status(500).json({
    message: err?.message || "An unexpected error occurred.",
  });
};
