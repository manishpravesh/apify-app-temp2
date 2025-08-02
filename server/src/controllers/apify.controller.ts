import { Request, Response, NextFunction } from "express";
import { ApifyClient } from "apify-client";

// This helper function creates a client on-demand from the request header
const getClientFromRequest = (req: Request): ApifyClient => {
  const apiKey = req.header("x-apify-key");
  if (!apiKey) {
    // This will be caught by our error handler
    throw new Error("NOT_AUTHENTICATED");
  }
  return new ApifyClient({ token: apiKey });
};

export const verifyKey = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const client = getClientFromRequest(req);
    await client.user("me").get();
    res.status(200).json({ message: "API key verified successfully." });
  } catch (err) {
    next(err);
  }
};

export const listActors = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const client = getClientFromRequest(req);
    const actorList = await client.actors().list();
    res.status(200).json(actorList.items);
  } catch (err) {
    next(err);
  }
};

export const getActorSchema = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const client = getClientFromRequest(req);
    const { actorId } = req.params;
    const actor = await client.actor(actorId).get();
    const buildId = actor?.taggedBuilds?.latest?.buildId;

    if (!buildId) {
      return res
        .status(404)
        .json({ message: "No 'latest' build found for this actor." });
    }

    const buildDetails = await client.build(buildId).get();
    if (!buildDetails || !buildDetails.inputSchema) {
      return res
        .status(404)
        .json({ message: "No input schema found in the build details." });
    }
    const inputSchemaString = buildDetails.inputSchema;

    const parsedSchema = JSON.parse(inputSchemaString);
    res.status(200).json({ inputSchema: parsedSchema });
  } catch (err) {
    next(err);
  }
};

export const runActor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const client = getClientFromRequest(req);
    const { actorId } = req.params;
    const run = await client.actor(actorId).call(req.body);
    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    res.status(200).json({ results: items });
  } catch (err) {
    next(err);
  }
};
