import { MapPin, MessageCircle, Minus, Plus, Trash2, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { navigateToHash } from "../../../i18n/localizedRoutes";
import { useLanguage } from "../../../i18n/LanguageContext";
import {
  formatLocalizedQuantity,
  localizePriceUnit,
  translateBuyerProductName,
} from "../../../i18n/buyerDashboardHelpers";
import { getProductDetailHash } from "../../data/harvestExplorer";
import {
  formatQuantity,
  getCartItemSubtotal,
  type CartItem,
} from "../../utils/cartStorage";
import { ProductImage } from "../products/ProductImage";
import { Button } from "../ui/button";
import { cn } from "../ui/utils";

function CartQuantityControl({
  item,
  onUpdate,
}: {
  item: CartItem;
  onUpdate: (slug: string, quantity: number) => void;
}) {
  const { t, language } = useLanguage();
  const [inputValue, setInputValue] = useState(String(item.selectedQuantity));
  const [validationMsg, setValidationMsg] = useState<string | null>(null);

  useEffect(() => {
    setInputValue(String(item.selectedQuantity));
    setValidationMsg(null);
  }, [item.selectedQuantity]);

  const applyQuantity = (raw: number) => {
    if (!Number.isFinite(raw)) {
      setInputValue(String(item.selectedQuantity));
      return;
    }

    const rounded = Math.round(raw);

    if (rounded > item.availableQuantity) {
      const corrected = item.availableQuantity;
      setValidationMsg(
        `${t("buyerCart.item.available")}: ${formatLocalizedQuantity(
          t,
          language,
          formatQuantity(corrected, item.unit),
        )}`,
      );
      onUpdate(item.slug, corrected);
      setInputValue(String(corrected));
      return;
    }

    if (rounded < item.minimumOrder) {
      const corrected = item.minimumOrder;
      setValidationMsg(
        `${t("buyerCart.item.minimumOrder")}: ${formatLocalizedQuantity(
          t,
          language,
          formatQuantity(corrected, item.unit),
        )}`,
      );
      onUpdate(item.slug, corrected);
      setInputValue(String(corrected));
      return;
    }

    setValidationMsg(null);
    onUpdate(item.slug, rounded);
    setInputValue(String(rounded));
  };

  const handleDecrement = () => {
    if (item.selectedQuantity <= item.minimumOrder) {
      setValidationMsg(
        `${t("buyerCart.item.minimumOrder")}: ${formatLocalizedQuantity(
          t,
          language,
          formatQuantity(item.minimumOrder, item.unit),
        )}`,
      );
      return;
    }
    applyQuantity(item.selectedQuantity - 1);
  };

  const handleIncrement = () => {
    if (item.selectedQuantity >= item.availableQuantity) {
      setValidationMsg(
        `${t("buyerCart.item.available")}: ${formatLocalizedQuantity(
          t,
          language,
          formatQuantity(item.availableQuantity, item.unit),
        )}`,
      );
      return;
    }
    applyQuantity(item.selectedQuantity + 1);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (value === "" || /^\d+$/.test(value)) {
      setInputValue(value);
      setValidationMsg(null);
    }
  };

  const commitInput = () => {
    if (inputValue === "") {
      setInputValue(String(item.selectedQuantity));
      return;
    }
    applyQuantity(Number.parseInt(inputValue, 10));
  };

  return (
    <div className="agrivo-buyer-cart-item-qty-group">
      <div className="agrivo-buyer-cart-stepper" role="group" aria-label={t("buyerCart.item.selected")}>
        <button
          type="button"
          className="agrivo-buyer-cart-stepper-btn"
          aria-label={t("buyerCart.quantity.decrease", "Decrease quantity by 1")}
          onClick={handleDecrement}
          disabled={item.selectedQuantity <= item.minimumOrder}
        >
          <Minus className="h-4 w-4" aria-hidden="true" />
        </button>
        <div className="agrivo-buyer-cart-stepper-value">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            className="agrivo-buyer-cart-stepper-input"
            value={inputValue}
            aria-label={`${t("buyerCart.item.selected")} ${t("common.kg", item.unit)}`}
            onChange={handleInputChange}
            onBlur={commitInput}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.currentTarget.blur();
              }
            }}
          />
          <span className="agrivo-buyer-cart-stepper-unit">{t("common.kg", item.unit)}</span>
        </div>
        <button
          type="button"
          className="agrivo-buyer-cart-stepper-btn"
          aria-label={t("buyerCart.quantity.increase", "Increase quantity by 1")}
          onClick={handleIncrement}
          disabled={item.selectedQuantity >= item.availableQuantity}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      <p className="agrivo-buyer-cart-qty-hint">
        {t("buyerCart.item.minimumOrder")}:{" "}
        {formatLocalizedQuantity(t, language, formatQuantity(item.minimumOrder, item.unit))}
      </p>
      {validationMsg ? <p className="agrivo-buyer-cart-qty-error">{validationMsg}</p> : null}
    </div>
  );
}

export interface CartProductCardProps {
  item: CartItem;
  onUpdate: (slug: string, quantity: number) => void;
  onRemove: (slug: string) => void;
  className?: string;
}

/** Reusable cart line-item card used on the buyer cart page. */
export function CartProductCard({ item, onUpdate, onRemove, className }: CartProductCardProps) {
  const { t, language } = useLanguage();
  const subtotal = getCartItemSubtotal(item);
  const locationDisplay = item.location.replace(/>/g, " → ");
  const productName = translateBuyerProductName(t, item.name);

  return (
    <article className={cn("agrivo-buyer-cart-item", className)}>
      <div className="agrivo-buyer-cart-item-header">
        <div className="agrivo-buyer-cart-item-thumb">
          <ProductImage
            name={productName}
            src={item.image}
            alt={productName}
            className="h-full w-full"
          />
        </div>

        <div className="agrivo-buyer-cart-item-info">
          <h3 className="agrivo-buyer-cart-item-name">{productName}</h3>
          <p className="agrivo-buyer-cart-item-farmer">
            {t("buyerCart.item.farmer")}:{" "}
            <strong>{item.farmer === "Farmer" ? t("buyerCart.item.farmer") : item.farmer}</strong>
          </p>
          <p className="agrivo-buyer-cart-item-location">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-[#43A047]" aria-hidden="true" />
            <span>{locationDisplay}</span>
          </p>
        </div>

        <div className="agrivo-buyer-cart-item-subtotal-block">
          <p className="agrivo-buyer-cart-item-subtotal-label">{t("buyerCart.item.subtotal")}</p>
          <p className="agrivo-buyer-cart-item-subtotal-value">{subtotal.toFixed(2)} AZN</p>
        </div>
      </div>

      <div className="agrivo-buyer-cart-item-stats">
        <div className="agrivo-buyer-cart-item-stat">
          <span className="agrivo-buyer-cart-item-stat-label">{t("buyerCart.item.price")}</span>
          <span className="agrivo-buyer-cart-item-stat-value">
            {localizePriceUnit(t, language, item.price)}
            {item.unit ? ` / ${t("common.kg", item.unit)}` : ""}
          </span>
        </div>
        <div className="agrivo-buyer-cart-item-stat">
          <span className="agrivo-buyer-cart-item-stat-label">{t("buyerCart.item.available")}</span>
          <span className="agrivo-buyer-cart-item-stat-value">
            {formatLocalizedQuantity(t, language, item.availableQuantityLabel)}
          </span>
        </div>
        <div className="agrivo-buyer-cart-item-stat">
          <span className="agrivo-buyer-cart-item-stat-label">{t("buyerCart.item.selected")}</span>
          <span className="agrivo-buyer-cart-item-stat-value">
            {formatLocalizedQuantity(t, language, formatQuantity(item.selectedQuantity, item.unit))}
          </span>
        </div>
      </div>

      <div className="agrivo-buyer-cart-item-badge-row">
        {item.deliveryAvailable ? (
          <span className="agrivo-buyer-cart-delivery-badge">
            <Truck className="h-3.5 w-3.5" aria-hidden="true" />
            {t("buyerCart.item.deliveryAvailable")}
          </span>
        ) : (
          <span className="agrivo-buyer-cart-pickup-badge">{t("product.pickupOnly")}</span>
        )}
      </div>

      <CartQuantityControl item={item} onUpdate={onUpdate} />

      <div className="agrivo-buyer-cart-item-actions">
        <div className="agrivo-buyer-cart-item-actions-row">
          <Button
            variant="outline"
            className="agrivo-buyer-cart-action-btn"
            onClick={() => {
              navigateToHash(getProductDetailHash(item.slug));
            }}
          >
            {t("buyerCart.item.viewProduct")}
          </Button>
          <Button
            variant="outline"
            className="agrivo-buyer-cart-action-btn"
            onClick={() => {
              if (item.farmerSlug) {
                navigateToHash(`farmers/${item.farmerSlug}`);
              } else {
                navigateToHash("login");
              }
            }}
          >
            <MessageCircle className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
            {t("buyerCart.item.contactFarmer")}
          </Button>
        </div>
        <Button
          variant="outline"
          className="agrivo-buyer-cart-action-btn agrivo-buyer-cart-action-btn--remove"
          onClick={() => onRemove(item.slug)}
        >
          <Trash2 className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
          {t("buyerCart.item.remove")}
        </Button>
      </div>
    </article>
  );
}
