-- Delivery Options System migration
CREATE TYPE "DeliveryMethodType" AS ENUM ('farmer_delivery', 'agrivo_logistics', 'self_pickup');
CREATE TYPE "FarmerVehicleType" AS ENUM ('motorcycle', 'car', 'pickup', 'truck');

ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "deliveryFee" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "pickupCode" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "selectedEtaWindow" TEXT;

ALTER TABLE "Delivery" ADD COLUMN IF NOT EXISTS "courierId" TEXT;
ALTER TABLE "Delivery" ADD COLUMN IF NOT EXISTS "vehicleId" TEXT;
ALTER TABLE "Delivery" ADD COLUMN IF NOT EXISTS "method" "DeliveryMethodType" NOT NULL DEFAULT 'agrivo_logistics';
ALTER TABLE "Delivery" ADD COLUMN IF NOT EXISTS "pickupCode" TEXT;

CREATE TABLE IF NOT EXISTS "FarmerDeliverySettings" (
  "id" TEXT PRIMARY KEY,
  "farmerProfileId" TEXT NOT NULL UNIQUE,
  "farmerDeliveryEnabled" BOOLEAN NOT NULL DEFAULT true,
  "deliveryFee" DOUBLE PRECISION NOT NULL DEFAULT 2,
  "radiusKm" DOUBLE PRECISION NOT NULL DEFAULT 20,
  "workingDays" TEXT NOT NULL DEFAULT 'monday,tuesday,wednesday,thursday,friday',
  "deliveryHoursStart" TEXT NOT NULL DEFAULT '09:00',
  "deliveryHoursEnd" TEXT NOT NULL DEFAULT '19:00',
  "maxDailyDeliveries" INTEGER NOT NULL DEFAULT 8,
  "vehicleType" "FarmerVehicleType" NOT NULL DEFAULT 'pickup',
  "logisticsEnabled" BOOLEAN NOT NULL DEFAULT true,
  "logisticsFee" DOUBLE PRECISION NOT NULL DEFAULT 3,
  "pickupEnabled" BOOLEAN NOT NULL DEFAULT true,
  "sameDayAvailable" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FarmerDeliverySettings_farmerProfileId_fkey"
    FOREIGN KEY ("farmerProfileId") REFERENCES "FarmerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "ProductDeliveryOptions" (
  "id" TEXT PRIMARY KEY,
  "productId" TEXT NOT NULL UNIQUE,
  "farmerDelivery" BOOLEAN NOT NULL DEFAULT true,
  "agrivoLogistics" BOOLEAN NOT NULL DEFAULT true,
  "selfPickup" BOOLEAN NOT NULL DEFAULT true,
  "farmerFeeOverride" DOUBLE PRECISION,
  "logisticsFeeOverride" DOUBLE PRECISION,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProductDeliveryOptions_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "PickupSchedule" (
  "id" TEXT PRIMARY KEY,
  "farmerProfileId" TEXT NOT NULL UNIQUE,
  "address" TEXT,
  "hoursStart" TEXT NOT NULL DEFAULT '08:00',
  "hoursEnd" TEXT NOT NULL DEFAULT '19:00',
  "prepMinutes" INTEGER NOT NULL DEFAULT 25,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PickupSchedule_farmerProfileId_fkey"
    FOREIGN KEY ("farmerProfileId") REFERENCES "FarmerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "Courier" (
  "id" TEXT PRIMARY KEY,
  "logisticsPartnerId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "phone" TEXT,
  "status" TEXT NOT NULL DEFAULT 'available',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Courier_logisticsPartnerId_fkey"
    FOREIGN KEY ("logisticsPartnerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "Vehicle" (
  "id" TEXT PRIMARY KEY,
  "logisticsPartnerId" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "plateNumber" TEXT,
  "vehicleType" TEXT NOT NULL DEFAULT 'van',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Vehicle_logisticsPartnerId_fkey"
    FOREIGN KEY ("logisticsPartnerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "TrackingEvent" (
  "id" TEXT PRIMARY KEY,
  "deliveryId" TEXT NOT NULL,
  "stepId" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TrackingEvent_deliveryId_fkey"
    FOREIGN KEY ("deliveryId") REFERENCES "Delivery"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

ALTER TABLE "Delivery"
  ADD CONSTRAINT "Delivery_courierId_fkey"
  FOREIGN KEY ("courierId") REFERENCES "Courier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Delivery"
  ADD CONSTRAINT "Delivery_vehicleId_fkey"
  FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
