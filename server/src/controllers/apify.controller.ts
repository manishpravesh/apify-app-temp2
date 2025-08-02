import { Request, Response, NextFunction } from "express";
import { ApifyClient } from "apify-client";

let userApifyClient: ApifyClient | null = null;

const checkAuth = () => {
  if (!userApifyClient) throw new Error("NOT_AUTHENTICATED");
  return userApifyClient;
};

export const verifyKey = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { apiKey } = req.body;
    const testClient = new ApifyClient({ token: apiKey });
    await testClient.user("me").get();
    userApifyClient = testClient;
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
    const client = checkAuth();
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
    const client = checkAuth();
    const { actorId } = req.params;

    const actor = await client.actor(actorId).get();
    const buildId = actor?.taggedBuilds?.latest?.buildId;

    if (!buildId) {
      return res
        .status(404)
        .json({ message: "No 'latest' build found for this actor." });
    }

    const buildDetails = await client.build(buildId).get();

    const inputSchemaString = buildDetails.inputSchema;

    if (!inputSchemaString) {
      return res
        .status(404)
        .json({ message: "No input schema found in the build details." });
    }

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
    const client = checkAuth();
    const { actorId } = req.params;
    const run = await client.actor(actorId).call(req.body);
    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    res.status(200).json({ results: items });
  } catch (err) {
    next(err);
  }
};
