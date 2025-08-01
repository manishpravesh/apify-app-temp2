import { Request, Response } from "express";
import { ApifyClient } from "apify-client";

let userApifyClient: ApifyClient | null = null;

const checkAuth = (): ApifyClient => {
  if (!userApifyClient) throw new Error("NOT_AUTHENTICATED");
  return userApifyClient;
};

export const verifyKey = async (
  req: Request,
  res: Response,
  next: Function
) => {
  try {
    const { apiKey } = req.body;
    if (!apiKey) {
      return res.status(400).json({ message: "API key is required." });
    }

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
  next: Function
) => {
  try {
    const client = checkAuth();
    const actorList = await client.actors().list();
    res.status(200).json(actorList.items);
  } catch (err) {
    next(err);
  }
};

interface ActorVersionWithSchema {
  inputSchema?: Record<string, unknown>;
}

export const getActorSchema = async (
  req: Request,
  res: Response,
  next: Function
) => {
  try {
    const client = checkAuth();
    const { actorId } = req.params;

    const actor = await client.actor(actorId).get();

    const buildId = actor.taggedBuilds?.latest?.buildId;
    if (!buildId) {
      return res
        .status(404)
        .json({ message: "No build found for this actor." });
    }

    const build = await client.build(buildId).get();

    if (!build.inputSchema) {
      return res
        .status(404)
        .json({ message: "No input schema found for this actor." });
    }

    const parsedSchema =
      typeof build.inputSchema === "string"
        ? JSON.parse(build.inputSchema)
        : build.inputSchema;

    res.status(200).json({ inputSchema: parsedSchema });
  } catch (err) {
    next(err);
  }
};

export const runActor = async (req: Request, res: Response, next: Function) => {
  try {
    const client = checkAuth();
    const { actorId } = req.params;

    if (!actorId) {
      return res.status(400).json({ message: "Actor ID is required." });
    }

    const run = await client.actor(actorId).call(req.body);

    if (!run?.defaultDatasetId) {
      return res
        .status(500)
        .json({ message: "Actor run completed, but no dataset found." });
    }

    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    res.status(200).json({ runInfo: run, results: items });
  } catch (err) {
    next(err);
  }
};
