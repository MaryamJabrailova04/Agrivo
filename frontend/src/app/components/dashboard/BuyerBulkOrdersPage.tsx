import { navigateToHash } from "../../../i18n/localizedRoutes";
import {
  BadgeCheck,
  CheckCircle2,
  ClipboardList,
  Handshake,
  MessageCircle,
  Package,
  Pencil,
  Search,
  Truck,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { economicRegions, getDistrictsForRegion } from "../../data/azerbaijanRegions";
import {
  acceptBulkOffer,
  cancelBulkOrder,
  createBulkOrder,
  fulfillBulkOrder,
  getBestOffer,
  getBulkOrderSummary,
  getBulkOrders,
  updateBulkOrder,
  type BulkFarmerOffer,
  type BulkOrder,
  type BulkOrderCategory,
  type BulkOrderFormInput,
  type BulkOrderUnit,
} from "../../utils/bulkOrdersStorage";
import { BuyerBulkOrderStatusBadge } from "./BuyerBulkOrderStatusBadge";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import { cn } from "../ui/utils";
import { useLanguage } from "../../../i18n/LanguageContext";
import type { Language } from "../../../i18n/translations";
import { translateBuyerProductName } from "../../../i18n/buyerDashboardHelpers";

const filterControlClass =
  "agrivo-filter-control h-11 rounded-full border-[#DEECE0] bg-[#F7FBF5] text-sm text-[#102018]";

const BULK_CATEGORIES: BulkOrderCategory[] = ["Vegetables", "Fruits", "Dairy Products"];
const UNITS: BulkOrderUnit[] = ["kg", "liter", "box", "jar"];
const STATUS_FILTERS = [
  "all",
  "Open",
  "Offers Received",
  "Accepted",
  "In Progress",
  "Fulfilled",
  "Cancelled",
] as const;

type StatusFilter = (typeof STATUS_FILTERS)[number];
type SortOption = "newest" | "oldest";

const EMPTY_FORM: BulkOrderFormInput = {
  productName: "",
  category: "Vegetables",
  quantity: 0,
  unit: "kg",
  preferredRegion: "all",
  preferredDistrict: "",
  deliveryLocation: "",
  neededBy: "",
  maxPrice: "",
  deliveryRequired: true,
  notes: "",
};

interface FormErrors {
  productName?: string;
  category?: string;
  quantity?: string;
  unit?: string;
  deliveryLocation?: string;
  neededBy?: string;
}

function translateCategoryLabel(
  t: (key: string, fallback?: string) => string,
  category: BulkOrderCategory | string,
): string {
  const keyMap: Record<string, string> = {
    Vegetables: "categories.vegetables",
    Fruits: "categories.fruits",
    "Dairy Products": "categories.dairyProducts",
  };
  const key = keyMap[category];
  return key ? t(key, category) : category;
}

function translateBulkUnit(t: (key: string, fallback?: string) => string, unit: string): string {
  const keyMap: Record<string, string> = {
    kg: "common.kg",
    liter: "buyerBulkOrders.form.units.liter",
    box: "buyerBulkOrders.form.units.box",
    jar: "buyerBulkOrders.form.units.jar",
  };
  const key = keyMap[unit];
  return key ? t(key, unit) : unit;
}

function formatLocalizedDate(value: string, language: Language): string {
  try {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleDateString(language === "az" ? "az-AZ" : "en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return value;
  }
}

function formatLocalizedPriceUnit(
  t: (key: string, fallback?: string) => string,
  language: Language,
  value: string,
): string {
  if (language !== "az") return value;
  return value.replace(/\bkg\b/gi, t("common.kg", "kq"));
}

function validateForm(
  input: BulkOrderFormInput,
  t: (key: string, fallback?: string) => string,
): FormErrors {
  const errors: FormErrors = {};
  if (!input.productName.trim()) errors.productName = t("buyerBulkOrders.feedback.requiredFields");
  if (!input.category) errors.category = t("buyerBulkOrders.feedback.chooseCategory");
  if (!input.quantity || input.quantity <= 0) errors.quantity = t("buyerBulkOrders.feedback.invalidQuantity");
  if (!input.unit) errors.unit = t("buyerBulkOrders.feedback.requiredFields");
  if (!input.deliveryLocation.trim()) errors.deliveryLocation = t("buyerBulkOrders.feedback.requiredFields");
  if (!input.neededBy) errors.neededBy = t("buyerBulkOrders.feedback.requiredFields");
  return errors;
}

function BulkSummaryCards({ orders }: { orders: BulkOrder[] }) {
  const { t } = useLanguage();
  const summary = useMemo(() => getBulkOrderSummary(orders), [orders]);

  const cards = [
    {
      label: t("buyerBulkOrders.stats.activeRequests"),
      value: summary.activeRequests,
      icon: ClipboardList,
    },
    {
      label: t("buyerBulkOrders.stats.offersReceived"),
      value: summary.offersReceived,
      icon: Handshake,
    },
    { label: t("buyerBulkOrders.stats.acceptedDeals"), value: summary.acceptedDeals, icon: CheckCircle2 },
    {
      label: t("buyerBulkOrders.stats.completedBulkOrders"),
      value: summary.completedOrders,
      icon: Package,
    },
  ];

  return (
    <div className="agrivo-bulk-summary-grid">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.label} className="agrivo-bulk-summary-card agrivo-card">
            <div className="agrivo-bulk-summary-card-icon">
              <Icon className="h-5 w-5 text-[#14532D]" />
            </div>
            <p className="agrivo-bulk-summary-card-label">{card.label}</p>
            <p className="agrivo-bulk-summary-card-value">{card.value}</p>
          </div>
        );
      })}
    </div>
  );
}

function BulkOrderForm({
  initial,
  editingId,
  onSubmit,
  onCancel,
}: {
  initial?: BulkOrderFormInput;
  editingId?: string | null;
  onSubmit: (input: BulkOrderFormInput, editingId?: string | null) => void;
  onCancel?: () => void;
}) {
  const { t } = useLanguage();
  const [form, setForm] = useState<BulkOrderFormInput>(initial ?? EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    setForm(initial ?? EMPTY_FORM);
    setErrors({});
  }, [initial, editingId]);

  const districts = useMemo(() => {
    const region = form.preferredRegion === "all" ? "all" : form.preferredRegion;
    return getDistrictsForRegion(region as "all" | (typeof economicRegions)[number]);
  }, [form.preferredRegion]);

  const update = <K extends keyof BulkOrderFormInput>(key: K, value: BulkOrderFormInput[K]) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "preferredRegion") {
        next.preferredDistrict = "";
      }
      return next;
    });
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors = validateForm(form, t);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    onSubmit(form, editingId);
    if (!editingId) {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  };

  return (
    <form className="agrivo-bulk-form agrivo-dashboard-panel" onSubmit={handleSubmit} id="bulk-order-form">
      <h3 className="agrivo-bulk-form-title">
        {editingId ? t("buyerBulkOrders.form.editTitle") : t("buyerBulkOrders.form.title")}
      </h3>

      <div className="agrivo-bulk-form-grid">
        <div className="agrivo-bulk-form-field">
          <Label htmlFor="bulk-product">{t("buyerBulkOrders.form.productNeeded")}</Label>
          <Input
            id="bulk-product"
            value={form.productName}
            onChange={(e) => update("productName", e.target.value)}
            placeholder={t("buyerBulkOrders.form.productPlaceholder")}
            className="agrivo-bulk-input"
          />
          {errors.productName ? <p className="agrivo-bulk-field-error">{errors.productName}</p> : null}
        </div>

        <div className="agrivo-bulk-form-field">
          <Label>{t("buyerBulkOrders.form.category")}</Label>
          <Select value={form.category} onValueChange={(v) => update("category", v as BulkOrderCategory)}>
            <SelectTrigger className={filterControlClass}>
              <SelectValue placeholder={t("buyerBulkOrders.form.selectCategory")} />
            </SelectTrigger>
            <SelectContent>
              {BULK_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {translateCategoryLabel(t, cat)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category ? <p className="agrivo-bulk-field-error">{errors.category}</p> : null}
        </div>

        <div className="agrivo-bulk-form-field">
          <Label htmlFor="bulk-quantity">{t("buyerBulkOrders.form.quantity")}</Label>
          <Input
            id="bulk-quantity"
            type="number"
            min={1}
            value={form.quantity || ""}
            onChange={(e) => update("quantity", Number.parseInt(e.target.value, 10) || 0)}
            placeholder="300"
            className="agrivo-bulk-input"
          />
          {errors.quantity ? <p className="agrivo-bulk-field-error">{errors.quantity}</p> : null}
        </div>

        <div className="agrivo-bulk-form-field">
          <Label>{t("buyerBulkOrders.form.unit")}</Label>
          <Select value={form.unit} onValueChange={(v) => update("unit", v as BulkOrderUnit)}>
            <SelectTrigger className={filterControlClass}>
              <SelectValue placeholder={t("buyerBulkOrders.form.selectUnit")} />
            </SelectTrigger>
            <SelectContent>
              {UNITS.map((unit) => (
                <SelectItem key={unit} value={unit}>
                  {translateBulkUnit(t, unit)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.unit ? <p className="agrivo-bulk-field-error">{errors.unit}</p> : null}
        </div>

        <div className="agrivo-bulk-form-field">
          <Label>{t("buyerBulkOrders.form.preferredRegion")}</Label>
          <Select value={form.preferredRegion} onValueChange={(v) => update("preferredRegion", v)}>
            <SelectTrigger className={filterControlClass}>
              <SelectValue placeholder={t("buyerBulkOrders.form.selectRegion")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("buyerBulkOrders.form.allRegions")}</SelectItem>
              {economicRegions.map((region) => (
                <SelectItem key={region} value={region}>
                  {region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="agrivo-bulk-form-field">
          <Label>{t("buyerBulkOrders.form.preferredDistrict")}</Label>
          <Select
            value={form.preferredDistrict || "none"}
            onValueChange={(v) => update("preferredDistrict", v === "none" ? "" : v)}
          >
            <SelectTrigger className={filterControlClass}>
              <SelectValue placeholder={t("buyerBulkOrders.form.selectDistrict")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">{t("buyerBulkOrders.form.anyDistrict")}</SelectItem>
              {districts.map((district) => (
                <SelectItem key={district} value={district}>
                  {district}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="agrivo-bulk-form-field agrivo-bulk-form-field--wide">
          <Label htmlFor="bulk-delivery">{t("buyerBulkOrders.form.deliveryLocation")}</Label>
          <Input
            id="bulk-delivery"
            value={form.deliveryLocation}
            onChange={(e) => update("deliveryLocation", e.target.value)}
            placeholder={t("buyerBulkOrders.form.deliveryLocationPlaceholder")}
            className="agrivo-bulk-input"
          />
          {errors.deliveryLocation ? (
            <p className="agrivo-bulk-field-error">{errors.deliveryLocation}</p>
          ) : null}
        </div>

        <div className="agrivo-bulk-form-field">
          <Label htmlFor="bulk-needed-by">{t("buyerBulkOrders.form.neededByDate")}</Label>
          <Input
            id="bulk-needed-by"
            type="date"
            value={form.neededBy}
            onChange={(e) => update("neededBy", e.target.value)}
            className="agrivo-bulk-input"
          />
          {errors.neededBy ? <p className="agrivo-bulk-field-error">{errors.neededBy}</p> : null}
        </div>

        <div className="agrivo-bulk-form-field">
          <Label htmlFor="bulk-max-price">{t("buyerBulkOrders.form.maximumPricePerUnit")}</Label>
          <Input
            id="bulk-max-price"
            value={form.maxPrice}
            onChange={(e) => update("maxPrice", e.target.value)}
            placeholder={t("buyerBulkOrders.form.maxPricePlaceholder")}
            className="agrivo-bulk-input"
          />
          <p className="agrivo-bulk-field-hint">{t("buyerBulkOrders.form.priceHint")}</p>
        </div>

        <div className="agrivo-bulk-form-field">
          <Label>{t("buyerBulkOrders.form.deliveryRequired")}</Label>
          <RadioGroup
            value={form.deliveryRequired ? "yes" : "no"}
            onValueChange={(v) => update("deliveryRequired", v === "yes")}
            className="agrivo-bulk-radio-group"
          >
            <label className="agrivo-bulk-radio-option">
              <RadioGroupItem value="yes" />
              <span>{t("common.yes")}</span>
            </label>
            <label className="agrivo-bulk-radio-option">
              <RadioGroupItem value="no" />
              <span>{t("common.no")}</span>
            </label>
          </RadioGroup>
        </div>

        <div className="agrivo-bulk-form-field agrivo-bulk-form-field--full">
          <Label htmlFor="bulk-notes">{t("buyerBulkOrders.form.notes")}</Label>
          <Textarea
            id="bulk-notes"
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
            placeholder={t("buyerBulkOrders.form.notesPlaceholder")}
            className="agrivo-bulk-textarea"
          />
        </div>
      </div>

      <div className="agrivo-bulk-form-actions">
        {editingId && onCancel ? (
          <Button
            type="button"
            variant="outline"
            className="rounded-full border-[#dbe7d4] text-[#14532D] hover:bg-[#EAF7EC]"
            onClick={onCancel}
          >
            {t("buyerBulkOrders.form.cancelEdit")}
          </Button>
        ) : null}
        <Button type="submit" className="rounded-full bg-[#14532D] text-white hover:bg-[#1D6A3B]">
          {editingId ? t("buyerBulkOrders.form.saveChanges") : t("buyerBulkOrders.form.submit")}
        </Button>
      </div>
    </form>
  );
}

function OfferCard({
  offer,
  order,
  onAccept,
}: {
  offer: BulkFarmerOffer;
  order: BulkOrder;
  onAccept: () => void;
}) {
  const { t, language } = useLanguage();
  const isAccepted = offer.accepted;

  return (
    <article className={cn("agrivo-bulk-offer-card", isAccepted && "agrivo-bulk-offer-card--accepted")}>
      <div className="agrivo-bulk-offer-card-header">
        <div>
          <p className="agrivo-bulk-offer-farmer">{offer.farmerName}</p>
          {offer.verified ? (
            <p className="agrivo-bulk-offer-verified">
              <BadgeCheck className="h-3.5 w-3.5" />
              {t("buyerBulkOrders.modal.verifiedFarmer")}
            </p>
          ) : null}
        </div>
        {isAccepted ? (
          <span className="agrivo-bulk-offer-accepted-badge">{t("buyerBulkOrders.status.accepted")}</span>
        ) : null}
      </div>

      <dl className="agrivo-bulk-offer-details">
        <div>
          <dt>{t("buyerBulkOrders.modal.price")}</dt>
          <dd>{formatLocalizedPriceUnit(t, language, offer.pricePerUnit)}</dd>
        </div>
        <div>
          <dt>{t("buyerBulkOrders.modal.available")}</dt>
          <dd>
            {offer.availableQuantity} {translateBulkUnit(t, offer.unit)}
          </dd>
        </div>
        <div>
          <dt>{t("buyerBulkOrders.modal.delivery")}</dt>
          <dd>{offer.deliveryAvailable ? t("buyerBulkOrders.card.deliveryAvailable") : t("products.pickupOnly")}</dd>
        </div>
        <div>
          <dt>{t("buyerBulkOrders.modal.estimatedDelivery")}</dt>
          <dd>{formatLocalizedDate(offer.estimatedDelivery, language)}</dd>
        </div>
      </dl>

      <div className="agrivo-bulk-offer-actions">
        {!isAccepted && order.status !== "Cancelled" && order.status !== "Fulfilled" ? (
          <Button
            size="sm"
            className="rounded-full bg-[#14532D] text-white hover:bg-[#1D6A3B]"
            onClick={onAccept}
          >
            {t("buyerBulkOrders.modal.acceptOffer")}
          </Button>
        ) : null}
        <Button
          size="sm"
          variant="outline"
          className="rounded-full border-[#dbe7d4] text-[#14532D] hover:bg-[#EAF7EC]"
          onClick={() => {
            navigateToHash(`farmers/${offer.farmerSlug}`);
          }}
        >
          <MessageCircle className="mr-1.5 h-3.5 w-3.5" />
          {t("buyerBulkOrders.modal.contactFarmer")}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="rounded-full border-[#dbe7d4] text-[#14532D] hover:bg-[#EAF7EC]"
          onClick={() => {
            navigateToHash(`farmers/${offer.farmerSlug}`);
          }}
        >
          {t("buyerBulkOrders.modal.viewFarmerProfile")}
        </Button>
      </div>
    </article>
  );
}

function BulkOrderCard({
  order,
  onViewOffers,
  onEdit,
  onCancel,
  onFulfill,
}: {
  order: BulkOrder;
  onViewOffers: () => void;
  onEdit: () => void;
  onCancel: () => void;
  onFulfill: () => void;
}) {
  const { t, language } = useLanguage();
  const bestOffer = getBestOffer(order);
  const regionLabel =
    order.preferredRegion === "all"
      ? t("buyerBulkOrders.form.allRegions")
      : `${order.preferredRegion}${order.preferredDistrict ? ` · ${order.preferredDistrict}` : ""}`;

  return (
    <article className="agrivo-bulk-order-card agrivo-card">
      <div className="agrivo-bulk-order-card-header">
        <div>
          <h4 className="agrivo-bulk-order-card-title">
            {translateBuyerProductName(t, order.productName)} · {order.quantity} {translateBulkUnit(t, order.unit)}
          </h4>
          <p className="agrivo-bulk-order-card-meta">
            {t("buyerBulkOrders.card.createdAt")}: {formatLocalizedDate(order.createdAt, language)}
          </p>
        </div>
        <BuyerBulkOrderStatusBadge status={order.status} />
      </div>

      <dl className="agrivo-bulk-order-card-details">
        <div>
          <dt>{t("buyerBulkOrders.card.category")}</dt>
          <dd>{translateCategoryLabel(t, order.category)}</dd>
        </div>
        <div>
          <dt>{t("buyerBulkOrders.card.preferredRegion")}</dt>
          <dd>{regionLabel}</dd>
        </div>
        <div>
          <dt>{t("buyerBulkOrders.card.deliveryTo")}</dt>
          <dd>{order.deliveryLocation}</dd>
        </div>
        <div>
          <dt>{t("buyerBulkOrders.card.neededBy")}</dt>
          <dd>{formatLocalizedDate(order.neededBy, language)}</dd>
        </div>
        {order.maxPrice ? (
          <div>
            <dt>{t("buyerBulkOrders.card.maxPrice")}</dt>
            <dd>{formatLocalizedPriceUnit(t, language, order.maxPrice)}</dd>
          </div>
        ) : null}
        <div>
          <dt>{t("buyerBulkOrders.card.offers")}</dt>
          <dd>
            {t("buyerBulkOrders.modal.offersReceivedSummary").replace("{count}", String(order.offersCount))}
          </dd>
        </div>
      </dl>

      {bestOffer && order.offersCount > 0 ? (
        <div className="agrivo-bulk-order-best-offer">
          <p className="agrivo-bulk-order-best-offer-label">{t("buyerBulkOrders.card.bestOffer")}</p>
          <p className="agrivo-bulk-order-best-offer-value">
            {bestOffer.farmerName} · {formatLocalizedPriceUnit(t, language, bestOffer.pricePerUnit)}
          </p>
          <p className="agrivo-bulk-order-best-offer-meta">
            {t("buyerBulkOrders.card.available")}: {bestOffer.availableQuantity}{" "}
            {translateBulkUnit(t, bestOffer.unit)}
            {bestOffer.deliveryAvailable
              ? ` · ${t("buyerBulkOrders.card.deliveryAvailable")}`
              : ` · ${t("products.pickupOnly")}`}
          </p>
        </div>
      ) : null}

      <div className="agrivo-bulk-order-card-actions">
        <Button
          size="sm"
          className="rounded-full bg-[#14532D] text-white hover:bg-[#1D6A3B]"
          onClick={onViewOffers}
          disabled={order.offersCount === 0}
        >
          {t("buyerBulkOrders.card.viewOffers")}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="rounded-full border-[#dbe7d4] text-[#14532D] hover:bg-[#EAF7EC]"
          onClick={onEdit}
          disabled={order.status === "Cancelled" || order.status === "Fulfilled"}
        >
          <Pencil className="mr-1.5 h-3.5 w-3.5" />
          {t("buyerBulkOrders.card.editRequest")}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="rounded-full border-[#fecaca] text-[#b91c1c] hover:bg-[#fef2f2]"
          onClick={onCancel}
          disabled={order.status === "Cancelled" || order.status === "Fulfilled"}
        >
          <XCircle className="mr-1.5 h-3.5 w-3.5" />
          {t("buyerBulkOrders.card.cancel")}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="rounded-full border-[#dbe7d4] text-[#14532D] hover:bg-[#EAF7EC]"
          onClick={onFulfill}
          disabled={order.status === "Cancelled" || order.status === "Fulfilled"}
        >
          <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
          {t("buyerBulkOrders.card.markAsFulfilled")}
        </Button>
      </div>
    </article>
  );
}

export function BuyerBulkOrdersPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [orders, setOrders] = useState<BulkOrder[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sort, setSort] = useState<SortOption>("newest");
  const [offersOrder, setOffersOrder] = useState<BulkOrder | null>(null);
  const [editingOrder, setEditingOrder] = useState<BulkOrder | null>(null);

  const refresh = useCallback(() => {
    if (!user?.id) {
      setOrders([]);
      return;
    }
    setOrders(getBulkOrders(user.id));
  }, [user?.id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 3000);
  }, []);

  const handleFormSubmit = (input: BulkOrderFormInput, editingId?: string | null) => {
    if (!user?.id) return;

    if (editingId) {
      updateBulkOrder(user.id, editingId, input);
      setEditingOrder(null);
      showToast(t("buyerBulkOrders.feedback.updated"));
    } else {
      createBulkOrder(user.id, input);
      showToast(t("buyerBulkOrders.feedback.created"));
    }
    refresh();
  };

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    let results = orders.filter((order) => {
      if (statusFilter !== "all" && order.status !== statusFilter) return false;
      if (categoryFilter !== "all" && order.category !== categoryFilter) return false;
      if (!query) return true;
      return (
        order.productName.toLowerCase().includes(query) ||
        order.deliveryLocation.toLowerCase().includes(query) ||
        order.preferredRegion.toLowerCase().includes(query)
      );
    });

    results = [...results].sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      return sort === "newest" ? bTime - aTime : aTime - bTime;
    });

    return results;
  }, [orders, search, statusFilter, categoryFilter, sort]);

  const editFormInitial = useMemo((): BulkOrderFormInput | undefined => {
    if (!editingOrder) return undefined;
    return {
      productName: editingOrder.productName,
      category: editingOrder.category,
      quantity: editingOrder.quantity,
      unit: editingOrder.unit,
      preferredRegion: editingOrder.preferredRegion,
      preferredDistrict: editingOrder.preferredDistrict,
      deliveryLocation: editingOrder.deliveryLocation,
      neededBy: editingOrder.neededBy,
      maxPrice: editingOrder.maxPrice,
      deliveryRequired: editingOrder.deliveryRequired,
      notes: editingOrder.notes,
    };
  }, [editingOrder]);

  const scrollToForm = () => {
    document.getElementById("bulk-order-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="agrivo-buyer-bulk space-y-6">
      {toast ? (
        <div className="agrivo-cart-toast agrivo-cart-toast--success" role="status">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{toast}</span>
        </div>
      ) : null}

      <div className="agrivo-dashboard-page-header">
        <h2 className="agrivo-heading text-2xl font-bold text-[#102018] sm:text-3xl">{t("buyerBulkOrders.title")}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5F6F64] sm:text-base">
          {t("buyerBulkOrders.subtitle")}
        </p>
      </div>

      <BulkSummaryCards orders={orders} />

      <BulkOrderForm
        key={editingOrder?.id ?? "create"}
        initial={editFormInitial}
        editingId={editingOrder?.id ?? null}
        onSubmit={handleFormSubmit}
        onCancel={() => setEditingOrder(null)}
      />

      <section className="agrivo-bulk-orders-section">
        <div className="agrivo-bulk-orders-section-header">
          <h3 className="agrivo-bulk-orders-section-title">{t("buyerBulkOrders.list.title")}</h3>
          {orders.length > 0 ? (
            <p className="agrivo-bulk-orders-section-meta">
              {t("buyerBulkOrders.list.requestsCount").replace("{count}", String(filteredOrders.length))}
            </p>
          ) : null}
        </div>

        {orders.length > 0 ? (
          <div className="agrivo-bulk-filters agrivo-dashboard-panel">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b7a70]" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("buyerBulkOrders.list.searchPlaceholder")}
                className={cn(filterControlClass, "pl-10")}
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
              <SelectTrigger className={cn(filterControlClass, "w-full sm:w-44")}>
                <SelectValue placeholder={t("buyerBulkOrders.list.status")} />
              </SelectTrigger>
              <SelectContent>
                {STATUS_FILTERS.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status === "all"
                      ? t("buyerBulkOrders.list.allStatuses")
                      : status === "Open"
                        ? t("buyerBulkOrders.status.active")
                        : status === "Offers Received"
                          ? t("buyerBulkOrders.status.offersReceived")
                          : status === "Accepted"
                            ? t("buyerBulkOrders.status.accepted")
                            : status === "In Progress"
                              ? t("buyerBulkOrders.status.pending")
                              : status === "Fulfilled"
                                ? t("buyerBulkOrders.status.fulfilled")
                                : t("buyerBulkOrders.status.cancelled")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className={cn(filterControlClass, "w-full sm:w-40")}>
                <SelectValue placeholder={t("buyerBulkOrders.form.category")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("buyerBulkOrders.list.allCategories")}</SelectItem>
                {BULK_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {translateCategoryLabel(t, cat)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
              <SelectTrigger className={cn(filterControlClass, "w-full sm:w-40")}>
                <SelectValue placeholder={t("buyerBulkOrders.list.sort")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">{t("buyerBulkOrders.list.newestFirst")}</SelectItem>
                <SelectItem value="oldest">{t("buyerBulkOrders.list.oldestFirst")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ) : null}

        {orders.length === 0 ? (
          <div className="agrivo-bulk-empty agrivo-dashboard-panel">
            <div className="agrivo-bulk-empty-icon">
              <Truck className="h-7 w-7 text-[#14532D]" />
            </div>
            <h4 className="agrivo-bulk-empty-title">{t("buyerBulkOrders.empty.title")}</h4>
            <p className="agrivo-bulk-empty-text">
              {t("buyerBulkOrders.empty.subtitle")}
            </p>
            <Button
              className="mt-5 rounded-full bg-[#14532D] text-white hover:bg-[#1D6A3B]"
              onClick={scrollToForm}
            >
              {t("buyerBulkOrders.form.submit")}
            </Button>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="agrivo-bulk-orders-list">
            {filteredOrders.map((order) => (
              <BulkOrderCard
                key={order.id}
                order={order}
                onViewOffers={() => setOffersOrder(order)}
                onEdit={() => {
                  setEditingOrder(order);
                  scrollToForm();
                }}
                onCancel={() => {
                  if (!user?.id) return;
                  cancelBulkOrder(user.id, order.id);
                  refresh();
                  showToast(t("buyerBulkOrders.feedback.cancelled"));
                }}
                onFulfill={() => {
                  if (!user?.id) return;
                  fulfillBulkOrder(user.id, order.id);
                  refresh();
                  showToast(t("buyerBulkOrders.feedback.fulfilled"));
                }}
              />
            ))}
          </div>
        ) : (
          <div className="agrivo-bulk-empty agrivo-dashboard-panel py-10">
            <h4 className="agrivo-bulk-empty-title">{t("buyerBulkOrders.empty.noMatches")}</h4>
            <p className="agrivo-bulk-empty-text">{t("buyerBulkOrders.empty.adjustFilters")}</p>
          </div>
        )}
      </section>

      <Dialog open={!!offersOrder} onOpenChange={(open) => !open && setOffersOrder(null)}>
        <DialogContent className="agrivo-bulk-offers-dialog sm:max-w-2xl">
          {offersOrder ? (
            <>
              <DialogHeader>
                <DialogTitle className="agrivo-heading text-xl font-bold text-[#102018]">
                  {t("buyerBulkOrders.modal.title")}
                </DialogTitle>
                <DialogDescription className="text-sm text-[#5F6F64]">
                  {translateBuyerProductName(t, offersOrder.productName)} · {offersOrder.quantity}{" "}
                  {translateBulkUnit(t, offersOrder.unit)} —{" "}
                  {t("buyerBulkOrders.modal.offersReceivedSummary")
                    .replace("{count}", String(offersOrder.offersCount))}
                </DialogDescription>
              </DialogHeader>
              <div className="agrivo-bulk-offers-list">
                {offersOrder.offers.map((offer) => (
                  <OfferCard
                    key={offer.id}
                    offer={offer}
                    order={offersOrder}
                    onAccept={() => {
                      if (!user?.id) return;
                      acceptBulkOffer(user.id, offersOrder.id, offer.id);
                      refresh();
                      setOffersOrder((prev) =>
                        prev
                          ? {
                              ...prev,
                              status: "Accepted",
                              offers: prev.offers.map((o) => ({
                                ...o,
                                accepted: o.id === offer.id,
                              })),
                            }
                          : null,
                      );
                      showToast(t("buyerBulkOrders.feedback.offerAccepted"));
                    }}
                  />
                ))}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  className="rounded-full border-[#dbe7d4] text-[#14532D] hover:bg-[#EAF7EC]"
                  onClick={() => setOffersOrder(null)}
                >
                  {t("buyerBulkOrders.modal.close")}
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
