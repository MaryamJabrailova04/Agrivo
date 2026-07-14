import { prisma } from "../config/prisma.js";
import { badRequest, conflict, forbidden, notFound } from "../utils/ApiError.js";

const VALID_DELIVERY_METHODS = new Set(["farmer_delivery", "agrivo_logistics", "self_pickup"]);

const orderInclude = {
  items: true,
  buyer: { select: { id: true, name: true, email: true, role: true } },
  farmer: { select: { id: true, name: true, email: true, role: true } },
  delivery: true,
};

function normalizeDeliveryMethod(value) {
  if (!value) return "agrivo_logistics";
  const normalized = String(value).trim().toLowerCase();
  if (VALID_DELIVERY_METHODS.has(normalized)) return normalized;
  throw badRequest(
    `Invalid delivery method. Expected one of: ${[...VALID_DELIVERY_METHODS].join(", ")}.`,
  );
}

async function resolveDeliveryFee(farmerId, deliveryMethod, requestedFee) {
  if (deliveryMethod === "self_pickup") return 0;

  const profile = await prisma.farmerProfile.findUnique({
    where: { userId: farmerId },
    include: { deliverySettings: true },
  });

  const settings = profile?.deliverySettings;
  if (!settings) {
    if (requestedFee != null && Number.isFinite(Number(requestedFee))) {
      return Math.max(0, Number(requestedFee));
    }
    return deliveryMethod === "farmer_delivery" ? 2 : 3;
  }

  if (deliveryMethod === "farmer_delivery") {
    return Number(settings.deliveryFee ?? 2);
  }

  return Number(settings.logisticsFee ?? 3);
}

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

  if (!buyerId) {
    throw badRequest("Authenticated buyer is required.");
  }

  if (!Array.isArray(body.items) || body.items.length === 0) {
    throw badRequest("At least one order item is required.");
  }

  const farmerId = body.farmerId ? String(body.farmerId).trim() : "";
  if (!farmerId) {
    throw badRequest("farmerId is required.");
  }

  const farmer = await prisma.user.findUnique({ where: { id: farmerId } });
  if (!farmer || farmer.role !== "farmer") {
    throw badRequest("Invalid farmerId. Farmer was not found.");
  }

  const deliveryMethod = normalizeDeliveryMethod(body.deliveryMethod);
  if (deliveryMethod !== "self_pickup") {
    const address = typeof body.deliveryAddress === "string" ? body.deliveryAddress.trim() : "";
    if (!address || address.length < 5) {
      throw badRequest("Delivery address is required.");
    }
  }

  const productIds = body.items.map((item) => item?.productId).filter(Boolean);
  if (productIds.length !== body.items.length) {
    throw badRequest("Each order item requires a valid productId and quantity.");
  }

  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
  });
  const productMap = new Map(products.map((product) => [product.id, product]));

  const itemsData = [];
  let subtotal = 0;

  for (const item of body.items) {
    const quantity = Number(item.quantity);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      throw badRequest("Each order item requires a positive numeric quantity.");
    }

    const product = productMap.get(item.productId);
    if (!product) {
      throw notFound(`Product not found: ${item.productId}`);
    }

    if (product.farmerId !== farmerId) {
      throw badRequest("All products must belong to the same farmer.");
    }

    if (product.status === "out_of_stock" || product.quantity <= 0) {
      throw conflict(`Product "${product.name}" is no longer available.`);
    }

    if (quantity > product.quantity) {
      throw conflict(
        `Insufficient stock for "${product.name}". Available: ${product.quantity} ${product.unit}.`,
      );
    }

    const unitPrice = Number(product.price);
    const totalPrice = unitPrice * quantity;
    subtotal += totalPrice;

    itemsData.push({
      productId: product.id,
      productName: product.name,
      variety: product.variety,
      quantity,
      unit: product.unit,
      pricePerUnit: unitPrice,
      totalPrice,
    });
  }

  const deliveryFee = await resolveDeliveryFee(farmerId, deliveryMethod, body.deliveryFee);
  const totalAmount = subtotal + deliveryFee;
  const pickupCode =
    deliveryMethod === "self_pickup"
      ? Array.from({ length: 6 }, () =>
          "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 32)],
        ).join("")
      : null;

  const deliveryAddress =
    deliveryMethod === "self_pickup"
      ? body.deliveryAddress?.trim() || "Self pickup"
      : String(body.deliveryAddress).trim();

  try {
    return await prisma.$transaction(async (tx) => {
      for (const item of itemsData) {
        const updated = await tx.product.updateMany({
          where: {
            id: item.productId,
            quantity: { gte: item.quantity },
          },
          data: {
            quantity: { decrement: item.quantity },
          },
        });

        if (updated.count !== 1) {
          throw conflict(`Insufficient stock for "${item.productName}".`);
        }

        const refreshed = await tx.product.findUnique({ where: { id: item.productId } });
        if (refreshed && refreshed.quantity <= 0 && refreshed.status !== "out_of_stock") {
          await tx.product.update({
            where: { id: item.productId },
            data: { status: "out_of_stock" },
          });
        }
      }

      const order = await tx.order.create({
        data: {
          buyerId,
          farmerId,
          totalAmount,
          deliveryMethod,
          deliveryFee,
          pickupCode,
          selectedEtaWindow: body.selectedEtaWindow || null,
          deliveryAddress,
          items: { create: itemsData },
        },
        include: orderInclude,
      });

      const delivery = await tx.delivery.create({
        data: {
          orderId: order.id,
          method: deliveryMethod,
          pickupCode,
          dropoffLocation: deliveryAddress,
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
  } catch (error) {
    console.error("ORDER CREATION ERROR:", error);
    if (error?.statusCode) throw error;
    if (error?.code === "P2003") {
      throw badRequest("Invalid reference while creating order. Check product and farmer IDs.");
    }
    if (error?.name === "PrismaClientValidationError") {
      throw badRequest(error.message.split("\n").filter(Boolean).pop() || "Invalid order data.");
    }
    throw error;
  }
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
