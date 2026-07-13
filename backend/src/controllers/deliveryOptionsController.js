import * as deliveryOptionsService from "../services/deliveryOptionsService.js";

export async function getMyDeliverySettings(req, res) {
  const settings = await deliveryOptionsService.getMyDeliverySettings(req.user);
  res.json({ success: true, settings });
}

export async function updateMyDeliverySettings(req, res) {
  const settings = await deliveryOptionsService.updateMyDeliverySettings(req.user, req.body);
  res.json({ success: true, settings });
}

export async function getProductDeliveryOptions(req, res) {
  const options = await deliveryOptionsService.getProductDeliveryOptions(req.params.id);
  res.json({ success: true, options });
}

export async function updateProductDeliveryOptions(req, res) {
  const options = await deliveryOptionsService.updateProductDeliveryOptions(
    req.user,
    req.params.id,
    req.body,
  );
  res.json({ success: true, options });
}

export async function getOrderTracking(req, res) {
  const tracking = await deliveryOptionsService.getOrderTracking(req.params.id, req.user);
  res.json({ success: true, tracking });
}

export async function rateOrderDelivery(req, res) {
  const delivery = await deliveryOptionsService.rateDelivery(req.params.id, req.user, req.body);
  res.json({ success: true, delivery });
}
