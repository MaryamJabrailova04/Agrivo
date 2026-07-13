import { prisma } from "../config/prisma.js";
import { badRequest, forbidden, notFound } from "../utils/ApiError.js";

function mapSettings(row, farmerProfile) {
  if (!row) {
    return {
      farmerDeliveryEnabled: true,
      deliveryFee: 2,
      radiusKm: 20,
      workingDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
      deliveryHoursStart: "09:00",
      deliveryHoursEnd: "19:00",
      maxDailyDeliveries: 8,
      vehicleType: "pickup",
      logisticsEnabled: true,
      logisticsFee: 3,
      pickupEnabled: true,
      pickupAddress: farmerProfile?.address || "Farm gate",
      pickupHoursStart: "08:00",
      pickupHoursEnd: "19:00",
      pickupPrepMinutes: 25,
      sameDayAvailable: true,
    };
  }

  return {
    farmerDeliveryEnabled: row.farmerDeliveryEnabled,
    deliveryFee: row.deliveryFee,
    radiusKm: row.radiusKm,
    workingDays: String(row.workingDays || "")
      .split(",")
      .map((d) => d.trim())
      .filter(Boolean),
    deliveryHoursStart: row.deliveryHoursStart,
    deliveryHoursEnd: row.deliveryHoursEnd,
    maxDailyDeliveries: row.maxDailyDeliveries,
    vehicleType: row.vehicleType,
    logisticsEnabled: row.logisticsEnabled,
    logisticsFee: row.logisticsFee,
    pickupEnabled: row.pickupEnabled,
    pickupAddress: farmerProfile?.pickupSchedule?.address || farmerProfile?.address || "Farm gate",
    pickupHoursStart: farmerProfile?.pickupSchedule?.hoursStart || "08:00",
    pickupHoursEnd: farmerProfile?.pickupSchedule?.hoursEnd || "19:00",
    pickupPrepMinutes: farmerProfile?.pickupSchedule?.prepMinutes || 25,
    sameDayAvailable: row.sameDayAvailable,
  };
}

export async function getMyDeliverySettings(user) {
  const profile = await prisma.farmerProfile.findUnique({
    where: { userId: user.id },
    include: { deliverySettings: true, pickupSchedule: true },
  });
  if (!profile) throw notFound("Farmer profile not found.");
  return mapSettings(profile.deliverySettings, profile);
}

export async function updateMyDeliverySettings(user, input) {
  const body = input || {};
  const profile = await prisma.farmerProfile.findUnique({ where: { userId: user.id } });
  if (!profile) throw notFound("Farmer profile not found.");

  const workingDays = Array.isArray(body.workingDays)
    ? body.workingDays.join(",")
    : body.workingDays || "monday,tuesday,wednesday,thursday,friday";

  const settings = await prisma.farmerDeliverySettings.upsert({
    where: { farmerProfileId: profile.id },
    create: {
      farmerProfileId: profile.id,
      farmerDeliveryEnabled: body.farmerDeliveryEnabled ?? true,
      deliveryFee: Number(body.deliveryFee ?? 2),
      radiusKm: Number(body.radiusKm ?? 20),
      workingDays,
      deliveryHoursStart: body.deliveryHoursStart || "09:00",
      deliveryHoursEnd: body.deliveryHoursEnd || "19:00",
      maxDailyDeliveries: Number(body.maxDailyDeliveries ?? 8),
      vehicleType: body.vehicleType || "pickup",
      logisticsEnabled: body.logisticsEnabled ?? true,
      logisticsFee: Number(body.logisticsFee ?? 3),
      pickupEnabled: body.pickupEnabled ?? true,
      sameDayAvailable: body.sameDayAvailable ?? true,
    },
    update: {
      farmerDeliveryEnabled: body.farmerDeliveryEnabled ?? true,
      deliveryFee: Number(body.deliveryFee ?? 2),
      radiusKm: Number(body.radiusKm ?? 20),
      workingDays,
      deliveryHoursStart: body.deliveryHoursStart || "09:00",
      deliveryHoursEnd: body.deliveryHoursEnd || "19:00",
      maxDailyDeliveries: Number(body.maxDailyDeliveries ?? 8),
      vehicleType: body.vehicleType || "pickup",
      logisticsEnabled: body.logisticsEnabled ?? true,
      logisticsFee: Number(body.logisticsFee ?? 3),
      pickupEnabled: body.pickupEnabled ?? true,
      sameDayAvailable: body.sameDayAvailable ?? true,
    },
  });

  await prisma.pickupSchedule.upsert({
    where: { farmerProfileId: profile.id },
    create: {
      farmerProfileId: profile.id,
      address: body.pickupAddress || profile.address || "Farm gate",
      hoursStart: body.pickupHoursStart || "08:00",
      hoursEnd: body.pickupHoursEnd || "19:00",
      prepMinutes: Number(body.pickupPrepMinutes ?? 25),
    },
    update: {
      address: body.pickupAddress || profile.address || "Farm gate",
      hoursStart: body.pickupHoursStart || "08:00",
      hoursEnd: body.pickupHoursEnd || "19:00",
      prepMinutes: Number(body.pickupPrepMinutes ?? 25),
    },
  });

  const refreshed = await prisma.farmerProfile.findUnique({
    where: { id: profile.id },
    include: { deliverySettings: true, pickupSchedule: true },
  });
  return mapSettings(settings, refreshed);
}

export async function getProductDeliveryOptions(productId) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      deliveryOptions: true,
      farmer: { include: { farmerProfile: { include: { deliverySettings: true, pickupSchedule: true } } } },
    },
  });
  if (!product) throw notFound("Product not found.");

  const settings = mapSettings(
    product.farmer.farmerProfile?.deliverySettings,
    product.farmer.farmerProfile,
  );
  const options = product.deliveryOptions;

  return {
    productId: product.id,
    farmerDelivery: options?.farmerDelivery ?? settings.farmerDeliveryEnabled,
    agrivoLogistics: options?.agrivoLogistics ?? settings.logisticsEnabled,
    selfPickup: options?.selfPickup ?? settings.pickupEnabled,
    farmerFee: options?.farmerFeeOverride ?? settings.deliveryFee,
    logisticsFee: options?.logisticsFeeOverride ?? settings.logisticsFee,
    settings,
  };
}

export async function updateProductDeliveryOptions(user, productId, input) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw notFound("Product not found.");
  if (user.role !== "admin" && product.farmerId !== user.id) {
    throw forbidden("You do not own this product.");
  }

  const body = input || {};
  return prisma.productDeliveryOptions.upsert({
    where: { productId },
    create: {
      productId,
      farmerDelivery: body.farmerDelivery ?? true,
      agrivoLogistics: body.agrivoLogistics ?? true,
      selfPickup: body.selfPickup ?? true,
      farmerFeeOverride: body.farmerFeeOverride ?? null,
      logisticsFeeOverride: body.logisticsFeeOverride ?? null,
    },
    update: {
      farmerDelivery: body.farmerDelivery ?? true,
      agrivoLogistics: body.agrivoLogistics ?? true,
      selfPickup: body.selfPickup ?? true,
      farmerFeeOverride: body.farmerFeeOverride ?? null,
      logisticsFeeOverride: body.logisticsFeeOverride ?? null,
    },
  });
}

export async function getOrderTracking(orderId, user) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      delivery: {
        include: {
          trackingEvents: { orderBy: { createdAt: "asc" } },
          courier: true,
          assignedVehicle: true,
        },
      },
    },
  });
  if (!order) throw notFound("Order not found.");

  const canView =
    user.role === "admin" ||
    order.buyerId === user.id ||
    order.farmerId === user.id ||
    order.delivery?.logisticsPartnerId === user.id;

  if (!canView) throw forbidden("You do not have permission to view this tracking.");
  if (!order.delivery) throw badRequest("No delivery record for this order.");

  return {
    orderId: order.id,
    method: order.delivery.method,
    status: order.delivery.status,
    pickupCode: order.delivery.pickupCode || order.pickupCode,
    deliveryFee: order.deliveryFee,
    courierName: order.delivery.courier?.name || order.delivery.driverName,
    vehicleLabel: order.delivery.assignedVehicle?.label || order.delivery.vehicle,
    currentLocation: order.delivery.currentLocation,
    events: order.delivery.trackingEvents,
    rating: order.delivery.rating,
    feedback: order.delivery.feedback,
  };
}

export async function rateDelivery(orderId, user, input) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { delivery: true },
  });
  if (!order) throw notFound("Order not found.");
  if (user.role !== "admin" && order.buyerId !== user.id) {
    throw forbidden("Only the buyer can rate this delivery.");
  }
  if (!order.delivery) throw badRequest("No delivery record for this order.");

  return prisma.delivery.update({
    where: { id: order.delivery.id },
    data: {
      rating: Number(input?.rating || 0),
      feedback: input?.feedback || null,
    },
  });
}
