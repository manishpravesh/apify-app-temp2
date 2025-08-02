import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err); // Log the full error for debugging

  // ✨ FIX: Handle Apify's custom error object
  if (err.type === "invalid-input" && err.message) {
    return res.status(400).json({ message: `Invalid Input: ${err.message}` });
  }

  // Handle other known Apify errors
  if (err.statusCode === 401) {
    return res
      .status(401)
      .json({
        message: "Apify authentication failed. The API key is likely invalid.",
      });
  }

  if (err.message === "NOT_AUTHENTICATED") {
    return res
      .status(401)
      .json({ message: "Not authenticated. Please provide an API key first." });
  }

  // Generic fallback
  return res
    .status(500)
    .json({ message: err.message || "An unexpected server error occurred." });
};
