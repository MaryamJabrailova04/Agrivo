import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { EconomicRegion } from "../../../data/azerbaijanRegions";
import { economicRegions, getDistrictsForRegion } from "../../../data/azerbaijanRegions";
import {
  getProductNamesForCategory,
  getVarietiesByProduct,
  supportsProductVarieties,
} from "../../../data/productVarieties";
import type {
  FarmerDeliveryOption,
  ProductFormCategory,
  ProductFormTag,
} from "../../../utils/farmerProductsStorage";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Textarea } from "../../ui/textarea";
import { cn } from "../../ui/utils";
import { ComboboxInput } from "./ComboboxInput";
import { FormField, formInputClass, formTextareaClass } from "./FormField";
import { FormGrid, FormMediaGrid } from "./FormGrid";
import { ImageUpload } from "./ImageUpload";
import { QuantityInput } from "./QuantityInput";
import { useLanguage } from "../../../../i18n/LanguageContext";
import {
  resolveLocalizedName,
  resolveLocalizedVariety,
  translateDeliveryOption,
  translateFarmerCategory,
  translateUnitLabel,
} from "../../../../i18n/farmerProductHelpers";

const CATEGORIES: ProductFormCategory[] = [
  "Fruits",
  "Vegetables",
  "Dairy",
  "Grains",
  "Herbs",
  "Other",
];

const UNITS = ["kg", "ton", "box", "piece"] as const;

const TAGS: ProductFormTag[] = ["Fresh", "Organic", "Available Now"];

const DELIVERY_OPTIONS: FarmerDeliveryOption[] = [
  "Farmer delivery",
  "Buyer pickup",
  "Logistics partner",
];

const filterSelectClass =
  "agrivo-filter-control mt-1.5 h-11 w-full rounded-xl border-[#DEECE0] bg-[#F7FBF5] text-sm text-[#102018]";

const compactTextareaClass =
  "mt-1.5 min-h-[96px] w-full rounded-xl border border-[#DEECE0] bg-[#F7FBF5] px-3.5 py-2.5 text-sm text-[#102018] transition-colors placeholder:text-[#9ca3af] focus:border-[#86efac] focus:outline-none focus:ring-2 focus:ring-[#bbf7d0]/60 lg:min-h-[140px]";

export interface ProductFormValues {
  name: string;
  category: ProductFormCategory | "";
  variety: string;
  region: EconomicRegion | "";
  district: string;
  price: string;
  quantity: number;
  unit: string;
  harvestDate: string;
  image: string;
  description: string;
  tags: ProductFormTag[];
  deliveryOption: FarmerDeliveryOption | "";
}

export interface ProductFormSubmitPayload {
  name: string;
  category: ProductFormCategory;
  variety: string;
  region: string;
  district: string;
  price: number;
  quantity: number;
  unit: string;
  harvestDate: string;
  image: string;
  description: string;
  tags: ProductFormTag[];
  deliveryOption: FarmerDeliveryOption;
}

const initialValues: ProductFormValues = {
  name: "",
  category: "",
  variety: "",
  region: "",
  district: "",
  price: "",
  quantity: 0,
  unit: "kg",
  harvestDate: "",
  image: "",
  description: "",
  tags: ["Fresh"],
  deliveryOption: "",
};

type FormErrors = Partial<Record<keyof ProductFormValues | "submit", string>>;

function validateLocalized(
  values: ProductFormValues,
  isPublish: boolean,
  t: ReturnType<typeof useLanguage>["t"],
): FormErrors {
  const errors: FormErrors = {};
  if (!values.name.trim()) errors.name = t("farmerAddProduct.validation.productNameRequired");
  if (!values.category) errors.category = t("farmerAddProduct.validation.categoryRequired");
  if (!values.region) errors.region = t("farmerAddProduct.validation.regionRequired");
  if (!values.district) errors.district = t("farmerAddProduct.validation.districtRequired");
  const price = Number(values.price);
  if (!values.price.trim() || !Number.isFinite(price) || price <= 0) {
    errors.price = t("farmerAddProduct.validation.priceRequired");
  }
  if (isPublish && values.quantity <= 0) {
    errors.quantity = t("farmerAddProduct.validation.quantityGreaterThanZero");
  }
  if (!values.harvestDate) errors.harvestDate = t("farmerAddProduct.validation.harvestDateRequired");
  if (isPublish && !values.image) errors.image = t("farmerAddProduct.validation.imageRequired");
  if (isPublish && !values.description.trim()) {
    errors.description = t("farmerAddProduct.validation.descriptionRequired");
  }
  if (!values.deliveryOption) errors.deliveryOption = t("farmerAddProduct.validation.deliveryOptionRequired");
  return errors;
}

function TagPill({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={cn(
        "agrivo-product-tag-pill",
        selected && "agrivo-product-tag-pill--selected",
      )}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function FormSection({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section className="agrivo-product-form-section agrivo-dashboard-panel">
      <div className="agrivo-product-form-section-header">
        <h3 className="agrivo-heading text-base font-bold text-[#102018] sm:text-lg">{title}</h3>
        {subtitle ? <p className="agrivo-product-form-section-subtitle">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
}

export function ProductForm({
  onSubmit,
  isSaving,
  defaultValues,
  mode = "create",
}: {
  onSubmit: (payload: ProductFormSubmitPayload, mode: "draft" | "publish") => void;
  isSaving: boolean;
  defaultValues?: Partial<ProductFormValues>;
  mode?: "create" | "edit";
}) {
  const [values, setValues] = useState<ProductFormValues>({ ...initialValues, ...defaultValues });
  const [errors, setErrors] = useState<FormErrors>({});
  const { t, language } = useLanguage();

  useEffect(() => {
    if (defaultValues) {
      setValues({ ...initialValues, ...defaultValues });
      setErrors({});
    }
  }, [defaultValues]);

  const districts = useMemo(() => {
    if (!values.region) return [];
    return getDistrictsForRegion(values.region);
  }, [values.region]);

  const productNameOptions = useMemo(
    () => (values.category ? getProductNamesForCategory(values.category) : []),
    [values.category],
  );

  const varietyOptions = useMemo(
    () =>
      values.category && values.name
        ? getVarietiesByProduct(values.category, values.name)
        : [],
    [values.category, values.name],
  );

  const hasVarietySupport = values.category ? supportsProductVarieties(values.category) : false;
  const varietyDisabled = !hasVarietySupport || !values.name.trim();

  const update = <K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const toggleTag = (tag: ProductFormTag) => {
    setValues((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const handleSubmit = (mode: "draft" | "publish") => {
    const nextErrors = validateLocalized(values, mode === "publish", t);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const price = Number(values.price);
    onSubmit(
      {
        name: values.name.trim(),
        category: values.category as ProductFormCategory,
        variety: values.variety.trim(),
        region: values.region as string,
        district: values.district,
        price,
        quantity: values.quantity,
        unit: values.unit,
        harvestDate: values.harvestDate,
        image: values.image,
        description: values.description.trim(),
        tags: values.tags,
        deliveryOption: values.deliveryOption as FarmerDeliveryOption,
      },
      mode,
    );
  };

  const localizeProductName = (name: string): string => {
    const localized = resolveLocalizedName(name);
    return localized?.[language] ?? name;
  };

  const localizeVariety = (variety: string): string => {
    const localized = resolveLocalizedVariety(variety);
    return localized?.[language] ?? variety;
  };

  return (
    <form
      className="agrivo-product-form"
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit("publish");
      }}
    >
      <FormSection
        title={t("farmerAddProduct.basic.title")}
        subtitle={t("farmerAddProduct.basic.subtitle")}
      >
        <FormGrid columns={3}>
          <FormField label={t("farmerAddProduct.fields.category")} required error={errors.category}>
            <Select
              value={values.category}
              onValueChange={(v) => {
                update("category", v as ProductFormCategory);
                update("name", "");
                update("variety", "");
              }}
              disabled={isSaving}
            >
              <SelectTrigger className={filterSelectClass}>
                <SelectValue placeholder={t("farmerAddProduct.fields.selectCategory")} />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {translateFarmerCategory(
                      t,
                      cat === "Dairy" ? "Dairy Products" : cat,
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField
            label={t("farmerAddProduct.fields.productName")}
            htmlFor="product-name"
            required
            error={errors.name}
          >
            {productNameOptions.length > 0 ? (
              <ComboboxInput
                id="product-name"
                value={values.name}
                onChange={(v) => {
                  update("name", v);
                  update("variety", "");
                }}
                options={productNameOptions.map(localizeProductName)}
                disabled={!values.category || isSaving}
                placeholder={t("farmerAddProduct.fields.productNamePlaceholder")}
                className={formInputClass}
                emptyHint={t("farmerAddProduct.fields.selectProductFirst")}
              />
            ) : (
              <Input
                id="product-name"
                value={values.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder={t("farmerAddProduct.fields.productNamePlaceholder")}
                className={formInputClass}
                disabled={!values.category || isSaving}
              />
            )}
          </FormField>

          <FormField
            label={t("farmerAddProduct.fields.productVariety")}
            htmlFor="product-variety"
            error={errors.variety}
          >
            <ComboboxInput
              id="product-variety"
              value={values.variety}
              onChange={(v) => update("variety", v)}
              options={varietyOptions.map(localizeVariety)}
              disabled={varietyDisabled || isSaving}
              placeholder={t("farmerAddProduct.fields.productVarietyPlaceholder")}
              className={formInputClass}
              emptyHint={t("farmerAddProduct.fields.selectProductFirst")}
            />
            <p className="agrivo-form-helper">
              {hasVarietySupport
                ? t("farmerAddProduct.fields.varietyHint")
                : t("farmerAddProduct.fields.optionalForCategory")}
            </p>
          </FormField>

          <FormField label={t("farmerAddProduct.fields.region")} required error={errors.region}>
            <Select
              value={values.region}
              onValueChange={(v) => {
                update("region", v as EconomicRegion);
                update("district", "");
              }}
              disabled={isSaving}
            >
              <SelectTrigger className={filterSelectClass}>
                <SelectValue placeholder={t("farmerAddProduct.fields.selectRegion")} />
              </SelectTrigger>
              <SelectContent>
                {economicRegions.map((region) => (
                  <SelectItem key={region} value={region}>
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label={t("farmerAddProduct.fields.district")} required error={errors.district}>
            <Select
              value={values.district}
              onValueChange={(v) => update("district", v)}
              disabled={!values.region || isSaving}
            >
              <SelectTrigger className={filterSelectClass}>
                <SelectValue placeholder={t("farmerAddProduct.fields.selectDistrict")} />
              </SelectTrigger>
              <SelectContent>
                {districts.map((district) => (
                  <SelectItem key={district} value={district}>
                    {district}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField
            label={t("farmerAddProduct.fields.harvestDate")}
            htmlFor="harvest-date"
            required
            error={errors.harvestDate}
          >
            <Input
              id="harvest-date"
              type="date"
              value={values.harvestDate}
              onChange={(e) => update("harvestDate", e.target.value)}
              className={formInputClass}
              disabled={isSaving}
            />
          </FormField>
        </FormGrid>
      </FormSection>

      <FormSection
        title={t("farmerAddProduct.pricing.title")}
        subtitle={t("farmerAddProduct.pricing.subtitle")}
      >
        <FormGrid columns={3}>
          <FormField
            label={t("farmerAddProduct.fields.price")}
            htmlFor="product-price"
            required
            error={errors.price}
          >
            <Input
              id="product-price"
              type="number"
              min={0}
              step="0.01"
              value={values.price}
              onChange={(e) => update("price", e.target.value)}
              placeholder="2.50"
              className={formInputClass}
              disabled={isSaving}
            />
          </FormField>

          <FormField label={t("farmerAddProduct.fields.unit")} required>
            <Select
              value={values.unit}
              onValueChange={(v) => update("unit", v)}
              disabled={isSaving}
            >
              <SelectTrigger className={filterSelectClass}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {UNITS.map((unit) => (
                  <SelectItem key={unit} value={unit}>
                    {translateUnitLabel(t, unit)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label={t("farmerAddProduct.fields.quantity")} required error={errors.quantity}>
            <QuantityInput
              id="product-quantity"
              value={values.quantity}
              onChange={(v) => update("quantity", v)}
              className="agrivo-quantity-input--compact"
            />
          </FormField>
        </FormGrid>
      </FormSection>

      <FormSection title={t("farmerAddProduct.media.title")} subtitle={t("farmerAddProduct.media.subtitle")}>
        <FormMediaGrid>
          <FormField label={t("farmerAddProduct.fields.productImage")} required error={errors.image}>
            <ImageUpload
              value={values.image}
              onChange={(v) => update("image", v)}
              error={errors.image}
              compact
            />
          </FormField>

          <div className="agrivo-form-media-fields">
            <FormField
              label={t("farmerAddProduct.fields.description")}
              htmlFor="product-description"
              required
              error={errors.description}
            >
              <Textarea
                id="product-description"
                value={values.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder={t("farmerAddProduct.fields.descriptionPlaceholder")}
                className={compactTextareaClass}
                disabled={isSaving}
              />
            </FormField>

            <FormGrid columns={2}>
              <FormField label={t("farmerAddProduct.fields.productStatus")}>
                <div className="agrivo-product-tag-group">
                  {TAGS.map((tag) => (
                    <TagPill
                      key={tag}
                      label={
                        tag === "Fresh"
                          ? t("farmerAddProduct.status.fresh")
                          : tag === "Organic"
                            ? t("farmerAddProduct.status.organic")
                            : t("farmerAddProduct.status.availableNow")
                      }
                      selected={values.tags.includes(tag)}
                      onClick={() => toggleTag(tag)}
                    />
                  ))}
                </div>
              </FormField>

              <FormField
                label={t("farmerAddProduct.fields.deliveryOption")}
                required
                error={errors.deliveryOption}
              >
                <Select
                  value={values.deliveryOption}
                  onValueChange={(v) => update("deliveryOption", v as FarmerDeliveryOption)}
                  disabled={isSaving}
                >
                  <SelectTrigger className={filterSelectClass}>
                    <SelectValue placeholder={t("farmerAddProduct.fields.deliveryMethod")} />
                  </SelectTrigger>
                  <SelectContent>
                    {DELIVERY_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {translateDeliveryOption(t, option)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </FormGrid>
          </div>
        </FormMediaGrid>
      </FormSection>

      <div className="agrivo-product-form-actions">
        <Button
          type="button"
          variant="outline"
          className="rounded-full border-[#dbe7d4] px-6 text-[#14532D] hover:bg-[#EAF7EC]"
          disabled={isSaving}
          onClick={() => handleSubmit("draft")}
        >
          {isSaving
            ? t("farmerAddProduct.actions.saving")
            : mode === "edit"
              ? t("farmerAddProduct.actions.saveDraft")
              : t("farmerAddProduct.actions.saveDraft")}
        </Button>
        <Button
          type="submit"
          className="rounded-full bg-[#14532D] px-6 text-white hover:bg-[#1D6A3B]"
          disabled={isSaving}
        >
          {isSaving
            ? mode === "edit"
              ? t("farmerAddProduct.actions.updating")
              : t("farmerAddProduct.actions.publishing")
            : mode === "edit"
              ? t("farmerAddProduct.actions.saveChanges")
              : t("farmerAddProduct.actions.publishProduct")}
        </Button>
      </div>
    </form>
  );
}
