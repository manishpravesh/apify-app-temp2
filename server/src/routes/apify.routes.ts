import { Router } from "express";
import {
  verifyKey,
  listActors,
  getActorSchema,
  runActor,
} from "../controllers/apify.controller";

const router = Router();

// API Key Verification
router.post("/verify-key", verifyKey);

// List all actors
router.get("/actors", listActors);

// Get actor schema
router.get("/actors/:actorId/schema", getActorSchema); // ✅ Fixed route

// Run actor
router.post("/actors/:actorId/run", runActor);

export default router;
