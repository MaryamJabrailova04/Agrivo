import type { LogisticsDashboardProfile } from "../utils/logisticsProfileStorage";

export const LOGISTICS_PROFILE_SEED: Omit<
  LogisticsDashboardProfile,
  "avatar" | "memberSince" | "phoneVerified" | "identityVerified"
> & {
  avatar: string | null;
  memberSince: string;
  phoneVerified: boolean;
  identityVerified: boolean;
} = {
  companyName: "GreenWay Logistics",
  contactPerson: "Kamran Mammadov",
  registrationNumber: "AZ-LOG-2026-001",
  location: "Baku, Azerbaijan",
  address: "Narimanov district, Baku",
  phone: "+994 50 111 22 33",
  email: "ops@greenwaylogistics.az",
  whatsapp: "+994 50 111 22 33",
  emergencyContact: "+994 50 999 88 77",
  preferredContactMethod: "Phone",
  description:
    "We provide reliable agricultural transport services including farm pickups, market deliveries, refrigerated transport, and intercity logistics support.",
  descriptionAz:
    "Biz fermer təsərrüfatlarından məhsul götürülməsi, bazarlara çatdırılma, soyuduculu daşınma və şəhərlərarası logistika dəstəyi daxil olmaqla etibarlı kənd təsərrüfatı nəqliyyat xidmətləri göstəririk.",
  addressAz: "Nərimanov rayonu, Bakı",
  driversCount: 12,
  vehiclesCount: 8,
  vehicleTypes: ["vans", "miniTrucks", "refrigeratedTrucks"],
  maxDailyCapacity: "10 tons",
  supportedDeliveryTypes: ["farmPickup", "buyerDelivery", "intercityTransfer"],
  coldChainSupport: true,
  sameDayDelivery: true,
  serviceRegions: [
    "Baku",
    "Abşeron-Xızı",
    "Lənkəran-Astara",
    "Quba-Xaçmaz",
    "Gəncə-Daşkəsən",
  ],
  mainRoutes: ["lankaranBaku", "qubaSumgayit", "ganjaBaku"],
  deliveryRadius: "Up to 350 km",
  operatingHours: "08:00 - 20:00",
  workingDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
  openingTime: "08:00",
  closingTime: "20:00",
  totalDeliveries: 248,
  onTimeRate: 94,
  rating: 4.8,
  verified: true,
  phoneVerified: true,
  identityVerified: true,
  avatar: null,
  memberSince: "2026-01-10T00:00:00.000Z",
  documents: {
    registration: "verified",
    transportLicense: "verified",
    insurance: "verified",
    vehicleDocs: "pending",
    driverVerification: "verified",
  },
};
