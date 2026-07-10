import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import authRoutes from "./routes/authRoutes.js";
import buyerProfileRoutes from "./routes/buyerProfileRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import deliveryRoutes from "./routes/deliveryRoutes.js";
import farmerProfileRoutes from "./routes/farmerProfileRoutes.js";
import farmerRoutes from "./routes/farmerRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";
import logisticsRoutes from "./routes/logisticsRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import metricsRoutes from "./routes/metricsRoutes.js";
const app = express();

app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true,
  }),
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Agrivo API",
    health: "/api/health",
  });
});

app.use("/api", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/farmers", farmerRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/deliveries", deliveryRoutes);
app.use("/api/farmer", farmerProfileRoutes);
app.use("/api/logistics", logisticsRoutes);
app.use("/api/buyer", buyerProfileRoutes);
app.use("/api", metricsRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
