import { Request, Response, NextFunction } from "express";
import { ApifyClientError } from "apify-client";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err); // Log error for debugging
  if (err instanceof ApifyClientError && err.statusCode === 401) {
    return res.status(401).json({
      message: "Apify authentication failed. The API key is likely invalid.",
    });
  }
  if (err.message === "NOT_AUTHENTICATED") {
    return res
      .status(401)
      .json({ message: "Not authenticated. Please provide an API key first." });
  }
  return res.status(500).json({ message: "An unexpected error occurred." });
};
