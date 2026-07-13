import { Router } from "express";
import * as orderController from "../controllers/orderController.js";
import * as deliveryOptionsController from "../controllers/deliveryOptionsController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(authMiddleware);

router.get("/", asyncHandler(orderController.listOrders));
router.get("/:id/tracking", asyncHandler(deliveryOptionsController.getOrderTracking));
router.post("/:id/rate-delivery", roleMiddleware("buyer", "admin"), asyncHandler(deliveryOptionsController.rateOrderDelivery));
router.get("/:id", asyncHandler(orderController.getOrder));
router.post("/", roleMiddleware("buyer", "admin"), asyncHandler(orderController.createOrder));
router.patch("/:id/status", asyncHandler(orderController.updateOrderStatus));

export default router;
