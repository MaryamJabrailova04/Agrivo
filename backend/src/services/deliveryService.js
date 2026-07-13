import { prisma } from "../config/prisma.js";
import { badRequest, forbidden, notFound } from "../utils/ApiError.js";

const deliveryInclude = {
  order: {
    include: {
      buyer: { select: { id: true, name: true, email: true } },
      farmer: { select: { id: true, name: true, email: true } },
      items: true,
    },
  },
  logisticsPartner: { select: { id: true, name: true, email: true, role: true } },
};

function deliveryVisibility(user) {
  if (user.role === "admin") return {};
  if (user.role === "logistics") return { logisticsPartnerId: user.id };
  return null;
}

export async function listDeliveries(user, filters = {}) {
  const visibility = deliveryVisibility(user);
  if (!visibility && user.role !== "admin") {
    throw forbidden("You do not have permission to view deliveries.");
  }

  const where = {
    ...visibility,
    ...(filters.status ? { status: filters.status } : {}),
  };

  return prisma.delivery.findMany({
    where,
    include: deliveryInclude,
    orderBy: { createdAt: "desc" },
  });
}

export async function getDeliveryById(deliveryId, user) {
  const delivery = await prisma.delivery.findUnique({
    where: { id: deliveryId },
    include: deliveryInclude,
  });

  if (!delivery) {
    throw notFound("Delivery not found.");
  }

  const canView =
    user.role === "admin" ||
    delivery.logisticsPartnerId === user.id;

  if (!canView) {
    throw forbidden("You do not have permission to view this delivery.");
  }

  return delivery;
}

export async function createDelivery(user, input) {
  const body = input || {};
  if (!body.orderId) {
    throw badRequest("orderId is required.");
  }

  const order = await prisma.order.findUnique({ where: { id: body.orderId } });
  if (!order) {
    throw notFound("Order not found.");
  }

  return prisma.delivery.create({
    data: {
      orderId: body.orderId,
      logisticsPartnerId: user.role === "logistics" ? user.id : body.logisticsPartnerId || null,
      driverName: body.driverName || null,
      vehicle: body.vehicle || null,
      pickupLocation: body.pickupLocation || null,
      dropoffLocation: body.dropoffLocation || null,
      pickupTime: body.pickupTime ? new Date(body.pickupTime) : null,
      eta: body.eta ? new Date(body.eta) : null,
      status: body.status || "assigned",
      priority: body.priority || "normal",
      currentLocation: body.currentLocation || null,
      distanceRemaining: body.distanceRemaining || null,
      progress: body.progress ?? 0,
    },
    include: deliveryInclude,
  });
}

export async function updateDeliveryStatus(deliveryId, user, status) {
  if (!status) {
    throw badRequest("status is required.");
  }

  const delivery = await prisma.delivery.findUnique({ where: { id: deliveryId } });
  if (!delivery) {
    throw notFound("Delivery not found.");
  }

  const canUpdate =
    user.role === "admin" ||
    delivery.logisticsPartnerId === user.id;

  if (!canUpdate) {
    throw forbidden("You do not have permission to update this delivery.");
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.delivery.update({
      where: { id: deliveryId },
      data: {
        status,
        ...(status === "delivered" ? { completedAt: new Date(), progress: 100 } : {}),
      },
      include: {
        ...deliveryInclude,
        trackingEvents: { orderBy: { createdAt: "asc" } },
      },
    });

    await tx.trackingEvent.create({
      data: {
        deliveryId,
        stepId: status,
        label: String(status).replaceAll("_", " "),
      },
    });

    return updated;
  });
}

export async function updateDeliveryLocation(deliveryId, user, input) {
  const body = input || {};
  const delivery = await prisma.delivery.findUnique({ where: { id: deliveryId } });
  if (!delivery) {
    throw notFound("Delivery not found.");
  }

  const canUpdate =
    user.role === "admin" ||
    delivery.logisticsPartnerId === user.id;

  if (!canUpdate) {
    throw forbidden("You do not have permission to update this delivery.");
  }

  return prisma.delivery.update({
    where: { id: deliveryId },
    data: {
      currentLocation: body.currentLocation || delivery.currentLocation,
      distanceRemaining: body.distanceRemaining || delivery.distanceRemaining,
      progress: body.progress ?? delivery.progress,
    },
    include: deliveryInclude,
  });
}

export async function getLogisticsOverview(user) {
  const deliveries = await listDeliveries(user);
  return {
    total: deliveries.length,
    assigned: deliveries.filter((d) => d.status === "assigned").length,
    pickupScheduled: deliveries.filter((d) => d.status === "pickup_scheduled").length,
    inTransit: deliveries.filter((d) => d.status === "in_transit").length,
    delivered: deliveries.filter((d) => d.status === "delivered").length,
    delayed: deliveries.filter((d) => d.status === "delayed").length,
  };
}

export async function listDeliveriesByStatus(user, statuses) {
  const deliveries = await listDeliveries(user);
  return deliveries.filter((delivery) => statuses.includes(delivery.status));
}
