import { Router } from "express";
import * as profileController from "../controllers/profileController.js";
import * as deliveryOptionsController from "../controllers/deliveryOptionsController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(authMiddleware, roleMiddleware("farmer", "admin"));

router.get("/profile", asyncHandler(profileController.getFarmerProfile));
router.put("/profile", asyncHandler(profileController.updateFarmerProfile));
router.get("/delivery-settings", asyncHandler(deliveryOptionsController.getMyDeliverySettings));
router.put("/delivery-settings", asyncHandler(deliveryOptionsController.updateMyDeliverySettings));

export default router;
