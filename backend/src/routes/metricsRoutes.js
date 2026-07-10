import { Router } from "express";
import { metrics } from "../controllers/metricsController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/metrics", asyncHandler(metrics));

export default router;
