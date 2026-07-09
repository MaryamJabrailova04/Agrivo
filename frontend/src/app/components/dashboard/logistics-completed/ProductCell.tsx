import { ProductVarietyBadge } from "../../products/ProductVarietyBadge";
import type { CompletedDelivery } from "../../../utils/completedDeliveriesStorage";
import { useLanguage } from "../../../../i18n/LanguageContext";
import {
  translateCompletedProduct,
  translateCompletedVariety,
} from "../../../../i18n/completedDeliveriesHelpers";

export function ProductCell({ delivery }: { delivery: CompletedDelivery }) {
  const { t, language } = useLanguage();

  return (
    <div className="agrivo-completed-product-cell">
      <p className="agrivo-completed-product-cell__name">
        {translateCompletedProduct(t, language, delivery)}
      </p>
      <ProductVarietyBadge
        variety={translateCompletedVariety(t, language, delivery.variety, delivery.sortKey)}
        showLabel={false}
        size="sm"
        compact
      />
    </div>
  );
}
