import { prisma } from "../config/prisma.js";

export async function healthCheck(req, res) {
  res.json({
    status: "ok",
    service: "agrivo-backend",
    message: "Agrivo backend is running",
    timestamp: new Date().toISOString(),
  });
}

export async function livenessCheck(req, res) {
  res.json({
    status: "alive",
    service: "agrivo-backend",
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
}

export async function readinessCheck(req, res) {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      status: "ready",
      service: "agrivo-backend",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: "not_ready",
      service: "agrivo-backend",
      database: "disconnected",
      message: "Backend is running but database is not reachable",
      timestamp: new Date().toISOString(),
    });
  }
}
