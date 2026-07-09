import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { getFarmerSectionHash } from "../../data/farmerDashboard";
import { navigateToHash } from "../../../i18n/localizedRoutes";
import {
  getFarmerProductById,
  mapFarmerCategoryToForm,
  mapProductFormCategory,
  resolveFarmerProductsUserId,
  updateFarmerProduct,
  type CreateFarmerProductInput,
} from "../../utils/farmerProductsStorage";
import { Button } from "../ui/button";
import { PageHeader } from "./PageHeader";
import { ProductForm, type ProductFormSubmitPayload, type ProductFormValues } from "./farmer-product-form/ProductForm";

function navigate(hash: string) {
  navigateToHash(hash);
}

function productToFormValues(product: NonNullable<ReturnType<typeof getFarmerProductById>>): ProductFormValues {
  return {
    name: product.name,
    category: mapFarmerCategoryToForm(product.category),
    variety: product.variety ?? "",
    region: (product.region as ProductFormValues["region"]) ?? "",
    district: product.district ?? "",
    price: String(product.price),
    quantity: product.availableQuantity,
    unit: product.unit,
    harvestDate: product.harvestDate,
    image: product.image,
    description: product.description,
    tags: product.productTags ?? ["Fresh"],
    deliveryOption: product.deliveryOption ?? "Farmer delivery",
  };
}

export function FarmerEditProductPage({ productId }: { productId: string }) {
  const { user } = useAuth();
  const userId = user ? resolveFarmerProductsUserId(user) : null;
  const product = userId ? getFarmerProductById(userId, productId) : undefined;

  const [toast, setToast] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const defaultValues = useMemo(
    () => (product ? productToFormValues(product) : undefined),
    [product],
  );

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 3000);
  }, []);

  const handleSubmit = async (payload: ProductFormSubmitPayload, mode: "draft" | "publish") => {
    if (!userId || !product) return;

    setIsSaving(true);
    await new Promise((resolve) => window.setTimeout(resolve, 350));

    const input: CreateFarmerProductInput = {
      ...payload,
      listingStatus: mode === "publish" ? "active" : "draft",
    };

    updateFarmerProduct(userId, product.id, {
      name: input.name.trim(),
      variety: input.variety?.trim() || undefined,
      category: mapProductFormCategory(input.category),
      image: input.image,
      price: input.price,
      unit: input.unit,
      availableQuantity: input.quantity,
      harvestDate: input.harvestDate,
      listingStatus: input.listingStatus,
      deliveryAvailable: input.deliveryOption !== "Buyer pickup",
      description: input.description.trim(),
      location: input.district.replace(/ rayonu| şəhəri/g, "").trim(),
      locationDetail: input.region,
      region: input.region,
      district: input.district,
      productTags: input.tags,
      deliveryOption: input.deliveryOption,
    });

    setIsSaving(false);
    showToast(mode === "publish" ? "Product updated and published." : "Product saved as draft.");

    window.setTimeout(() => {
      navigate(getFarmerSectionHash("products"));
    }, 700);
  };

  if (!userId) return null;

  if (!product) {
    return (
      <div className="agrivo-dashboard-empty agrivo-dashboard-panel">
        <h2 className="agrivo-heading text-xl font-bold text-[#102018]">Product not found</h2>
        <p className="mt-2 text-sm text-[#5F6F64]">
          This product may have been removed or the link is outdated.
        </p>
        <Button
          className="mt-4 rounded-full bg-[#14532D] text-white hover:bg-[#1D6A3B]"
          onClick={() => navigate(getFarmerSectionHash("products"))}
        >
          Back to My Products
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toast ? (
        <div className="agrivo-cart-toast agrivo-cart-toast--success" role="status">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{toast}</span>
        </div>
      ) : null}

      <PageHeader
        title="Edit Product"
        subtitle={`Update listing details for ${product.name}${product.variety ? ` · ${product.variety}` : ""}.`}
        actions={
          <Button
            variant="outline"
            className="rounded-full border-[#dbe7d4] text-[#14532D] hover:bg-[#EAF7EC]"
            onClick={() => navigate(getFarmerSectionHash("products"))}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to products
          </Button>
        }
      />

      <ProductForm
        key={product.id}
        mode="edit"
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        isSaving={isSaving}
      />
    </div>
  );
}
