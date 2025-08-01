import { Request, Response } from "express";
import { ApifyClient } from "apify-client";

let userApifyClient: ApifyClient | null = null;

const checkAuth = () => {
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

export const getActorSchema = async (
  req: Request,
  res: Response,
  next: Function
) => {
  try {
    const client = checkAuth();
    const { actorId } = req.params;
    const actor = await client.actor(actorId).get();
    res.status(200).json(actor);
  } catch (err) {
    next(err);
  }
};

export const runActor = async (req: Request, res: Response, next: Function) => {
  try {
    const client = checkAuth();
    const { actorId } = req.params;
    const run = await client.actor(actorId).call(req.body);
    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    res.status(200).json({ runInfo: run, results: items });
  } catch (err) {
    next(err);
  }
};
