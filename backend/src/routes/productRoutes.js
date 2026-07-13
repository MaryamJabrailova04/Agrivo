import { Router } from "express";
import * as productController from "../controllers/productController.js";
import * as deliveryOptionsController from "../controllers/deliveryOptionsController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(productController.listProducts));
router.get("/:id/delivery-options", asyncHandler(deliveryOptionsController.getProductDeliveryOptions));
router.put(
  "/:id/delivery-options",
  authMiddleware,
  roleMiddleware("farmer", "admin"),
  asyncHandler(deliveryOptionsController.updateProductDeliveryOptions),
);
router.get("/:id", asyncHandler(productController.getProduct));

router.post(
  "/",
  authMiddleware,
  roleMiddleware("farmer", "admin"),
  asyncHandler(productController.createProduct),
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("farmer", "admin"),
  asyncHandler(productController.updateProduct),
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("farmer", "admin"),
  asyncHandler(productController.deleteProduct),
);

export default router;
