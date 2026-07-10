import { Router } from "express";
import {
  healthCheck,
  livenessCheck,
  readinessCheck,
} from "../controllers/healthController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/health", asyncHandler(healthCheck));
router.get("/health/live", asyncHandler(livenessCheck));
router.get("/health/ready", asyncHandler(readinessCheck));

export default router;
