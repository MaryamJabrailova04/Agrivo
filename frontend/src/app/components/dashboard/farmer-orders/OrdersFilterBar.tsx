import { Search } from "lucide-react";
import {
  type FarmerManagementOrderStatus,
  type FarmerOrderDateFilter,
  type FarmerOrderSortOption,
} from "../../../utils/farmerOrdersStorage";
import { useLanguage } from "../../../../i18n/LanguageContext";
import { translateFarmerOrderStatus } from "../../../../i18n/farmerOrderHelpers";
import { Input } from "../../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { cn } from "../../ui/utils";

const filterClass =
  "agrivo-filter-control h-11 rounded-full border-[#DEECE0] bg-[#F7FBF5] text-sm text-[#102018]";

const STATUS_FILTERS: Array<FarmerManagementOrderStatus | "all"> = [
  "all",
  "pending",
  "accepted",
  "preparing",
  "ready_for_pickup",
  "delivered",
  "cancelled",
];

const DATE_FILTERS: FarmerOrderDateFilter[] = ["all", "today", "week", "month"];

const SORT_OPTIONS: FarmerOrderSortOption[] = ["newest", "oldest", "value-desc"];

interface OrdersFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: FarmerManagementOrderStatus | "all";
  onStatusChange: (value: FarmerManagementOrderStatus | "all") => void;
  dateFilter: FarmerOrderDateFilter;
  onDateFilterChange: (value: FarmerOrderDateFilter) => void;
  sort: FarmerOrderSortOption;
  onSortChange: (value: FarmerOrderSortOption) => void;
}

export function OrdersFilterBar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  dateFilter,
  onDateFilterChange,
  sort,
  onSortChange,
}: OrdersFilterBarProps) {
  const { t } = useLanguage();

  const dateFilterLabels: Record<FarmerOrderDateFilter, string> = {
    all: t("farmerOrders.filters.allTime"),
    today: t("farmerOrders.filters.today"),
    week: t("farmerOrders.filters.thisWeek"),
    month: t("farmerOrders.filters.thisMonth"),
  };

  const sortLabels: Record<FarmerOrderSortOption, string> = {
    newest: t("farmerOrders.filters.newestFirst"),
    oldest: t("farmerOrders.filters.oldestFirst"),
    "value-desc": t("farmerOrders.filters.highestValue"),
  };

  return (
    <div className="agrivo-farmer-order-filters">
      <div className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b7a70]" />
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={t("farmerOrders.filters.searchPlaceholder")}
          className="h-11 rounded-full border-[#DEECE0] bg-[#F7FBF5] pl-10 text-sm"
        />
      </div>

      <Select value={status} onValueChange={(value) => onStatusChange(value as FarmerManagementOrderStatus | "all")}>
        <SelectTrigger className={cn(filterClass, "w-full sm:w-[190px]")}>
          <SelectValue placeholder={t("farmerOrders.labels.status")} />
        </SelectTrigger>
        <SelectContent>
          {STATUS_FILTERS.map((item) => (
            <SelectItem key={item} value={item}>
              {item === "all"
                ? t("farmerOrders.filters.allStatuses")
                : translateFarmerOrderStatus(t, item)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={dateFilter} onValueChange={(value) => onDateFilterChange(value as FarmerOrderDateFilter)}>
        <SelectTrigger className={cn(filterClass, "w-full sm:w-[160px]")}>
          <SelectValue placeholder={t("farmerOrders.filters.allTime")} />
        </SelectTrigger>
        <SelectContent>
          {DATE_FILTERS.map((item) => (
            <SelectItem key={item} value={item}>
              {dateFilterLabels[item]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={sort} onValueChange={(value) => onSortChange(value as FarmerOrderSortOption)}>
        <SelectTrigger className={cn(filterClass, "w-full sm:w-[170px]")}>
          <SelectValue placeholder={t("farmerOrders.labels.sort")} />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((item) => (
            <SelectItem key={item} value={item}>
              {sortLabels[item]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
