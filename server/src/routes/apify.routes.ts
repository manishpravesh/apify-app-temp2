import { Router } from "express";
import {
  verifyKey,
  listActors,
  getActorSchema,
  runActor,
} from "../controllers/apify.controller";

const router = Router();
router.post("/verify-key", verifyKey);
router.get("/actors", listActors);
router.get("/actors/:actorId", getActorSchema);
router.post("/actors/:actorId/run", runActor);

export default router;
