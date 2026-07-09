import { Heart } from "lucide-react";
import { getProductBySlug, type HarvestListing } from "../../data/harvestExplorer";
import { useSavedProducts } from "../../context/SavedProductsContext";
import { useAuth } from "../../auth/AuthContext";
import { cn } from "../ui/utils";
import { navigateToHash } from "../../../i18n/localizedRoutes";
import {
  savedProductFromListing,
  type SavedProduct,
} from "../../utils/savedProductsStorage";

interface ProductSaveButtonProps {
  listing?: HarvestListing;
  product?: SavedProduct;
  slug: string;
  className?: string;
  size?: "sm" | "md";
}

export function ProductSaveButton({
  listing: listingProp,
  product,
  slug,
  className,
  size = "md",
}: ProductSaveButtonProps) {
  const { isSaved, toggleSaveListing, toggleSaveProduct } = useSavedProducts();
  const { isAuthenticated } = useAuth();
  const saved = isSaved(slug);
  const listing = listingProp ?? getProductBySlug(slug) ?? undefined;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();

    let result;
    if (listing) {
      result = toggleSaveListing(listing);
    } else if (product) {
      result = toggleSaveProduct(product);
    } else {
      return;
    }

    if (!result.ok && !isAuthenticated) {
      navigateToHash("login");
    }
  };

  const sizeClass = size === "sm" ? "h-8 w-8" : "h-9 w-9";

  return (
    <button
      type="button"
      className={cn(
        "agrivo-product-save-btn",
        sizeClass,
        saved && "agrivo-product-save-btn--saved",
        className,
      )}
      aria-label={saved ? "Remove from saved products" : "Save product"}
      aria-pressed={saved}
      onClick={handleClick}
      disabled={!listing && !product}
    >
      <Heart className={cn("h-4 w-4", saved && "fill-current")} />
    </button>
  );
}