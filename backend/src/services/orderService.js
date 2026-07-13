import { prisma } from "../config/prisma.js";
import { badRequest, forbidden, notFound } from "../utils/ApiError.js";

const orderInclude = {
  items: true,
  buyer: { select: { id: true, name: true, email: true, role: true } },
  farmer: { select: { id: true, name: true, email: true, role: true } },
  delivery: true,
};

export async function listOrders(user) {
  const where =
    user.role === "admin"
      ? {}
      : user.role === "farmer"
        ? { farmerId: user.id }
        : user.role === "buyer"
          ? { buyerId: user.id }
          : null;

  if (!where) {
    throw forbidden("You do not have permission to view orders.");
  }

  return prisma.order.findMany({
    where,
    include: orderInclude,
    orderBy: { createdAt: "desc" },
  });
}

export async function getOrderById(orderId, user) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: orderInclude,
  });

  if (!order) {
    throw notFound("Order not found.");
  }

  const canView =
    user.role === "admin" ||
    order.buyerId === user.id ||
    order.farmerId === user.id;

  if (!canView) {
    throw forbidden("You do not have permission to view this order.");
  }

  return order;
}

export async function createOrder(buyerId, input) {
  const body = input || {};

  if (!Array.isArray(body.items) || body.items.length === 0) {
    throw badRequest("Order items are required.");
  }

  const farmerId = body.farmerId;
  if (!farmerId) {
    throw badRequest("farmerId is required.");
  }

  const itemsData = [];
  let totalAmount = 0;

  for (const item of body.items) {
    if (!item.productId || !item.quantity) {
      throw badRequest("Each order item requires productId and quantity.");
    }

    const product = await prisma.product.findUnique({ where: { id: item.productId } });
    if (!product) {
      throw badRequest(`Product not found: ${item.productId}`);
    }

    if (product.farmerId !== farmerId) {
      throw badRequest("All products must belong to the same farmer.");
    }

    const quantity = Number(item.quantity);
    const totalPrice = product.price * quantity;
    totalAmount += totalPrice;

    itemsData.push({
      productId: product.id,
      productName: product.name,
      variety: product.variety,
      quantity,
      unit: product.unit,
      pricePerUnit: product.price,
      totalPrice,
    });
  }

  const deliveryMethod = body.deliveryMethod || "agrivo_logistics";
  const deliveryFee = Number(body.deliveryFee || 0);
  const pickupCode =
    deliveryMethod === "self_pickup"
      ? Array.from({ length: 6 }, () => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 32)]).join("")
      : null;

  const methodEnum = ["farmer_delivery", "agrivo_logistics", "self_pickup"].includes(deliveryMethod)
    ? deliveryMethod
    : "agrivo_logistics";

  return prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        buyerId,
        farmerId,
        totalAmount: totalAmount + deliveryFee,
        deliveryMethod: methodEnum,
        deliveryFee,
        pickupCode,
        selectedEtaWindow: body.selectedEtaWindow || null,
        deliveryAddress: body.deliveryAddress || null,
        items: { create: itemsData },
      },
      include: orderInclude,
    });

    const delivery = await tx.delivery.create({
      data: {
        orderId: order.id,
        method: methodEnum,
        pickupCode,
        dropoffLocation: body.deliveryAddress || null,
        status: "assigned",
        progress: 5,
      },
    });

    await tx.trackingEvent.create({
      data: {
        deliveryId: delivery.id,
        stepId: "order_confirmed",
        label: "Order Confirmed",
      },
    });

    return tx.order.findUnique({
      where: { id: order.id },
      include: {
        ...orderInclude,
        delivery: { include: { trackingEvents: true } },
      },
    });
  });
}

export async function updateOrderStatus(orderId, user, status) {
  if (!status) {
    throw badRequest("status is required.");
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    throw notFound("Order not found.");
  }

  const canUpdate =
    user.role === "admin" ||
    (user.role === "farmer" && order.farmerId === user.id) ||
    (user.role === "buyer" && order.buyerId === user.id && status === "cancelled");

  if (!canUpdate) {
    throw forbidden("You do not have permission to update this order.");
  }

  return prisma.order.update({
    where: { id: orderId },
    data: { status },
    include: orderInclude,
  });
}
