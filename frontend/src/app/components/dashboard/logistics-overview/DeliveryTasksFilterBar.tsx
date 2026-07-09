import { Search } from "lucide-react";
import { useLanguage } from "../../../../i18n/LanguageContext";
import {
  translateLogisticsPriority,
  translateLogisticsRegion,
  translateLogisticsStatus,
} from "../../../../i18n/logisticsDashboardHelpers";
import {
  type DeliveryDateFilter,
  type DeliveryPriorityFilter,
  type DeliveryStatusFilter,
} from "../../../utils/logisticsDashboardStorage";
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

const STATUS_FILTERS: DeliveryStatusFilter[] = [
  "all",
  "assigned",
  "pickup_scheduled",
  "picked_up",
  "in_transit",
  "delivered",
  "delayed",
];

const DATE_FILTERS: DeliveryDateFilter[] = ["all", "today", "week"];

const PRIORITY_FILTERS: DeliveryPriorityFilter[] = ["all", "high", "normal", "low"];

interface DeliveryTasksFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: DeliveryStatusFilter;
  onStatusChange: (value: DeliveryStatusFilter) => void;
  region: string;
  onRegionChange: (value: string) => void;
  regions: string[];
  dateFilter: DeliveryDateFilter;
  onDateFilterChange: (value: DeliveryDateFilter) => void;
  priority: DeliveryPriorityFilter;
  onPriorityChange: (value: DeliveryPriorityFilter) => void;
}

export function DeliveryTasksFilterBar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  region,
  onRegionChange,
  regions,
  dateFilter,
  onDateFilterChange,
  priority,
  onPriorityChange,
}: DeliveryTasksFilterBarProps) {
  const { t } = useLanguage();

  const dateLabels: Record<DeliveryDateFilter, string> = {
    all: t("logisticsDashboard.filters.allTime"),
    today: t("logisticsDashboard.filters.today"),
    week: t("logisticsDashboard.filters.thisWeek"),
  };

  return (
    <div className="agrivo-logistics-tasks-filters">
      <div className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b7a70]" />
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={t("logisticsDashboard.filters.searchPlaceholder")}
          className="h-11 rounded-full border-[#DEECE0] bg-[#F7FBF5] pl-10 text-sm"
        />
      </div>

      <Select value={status} onValueChange={(value) => onStatusChange(value as DeliveryStatusFilter)}>
        <SelectTrigger className={cn(filterClass, "w-full sm:w-[170px]")}>
          <SelectValue placeholder={t("logisticsDashboard.filters.status")} />
        </SelectTrigger>
        <SelectContent>
          {STATUS_FILTERS.map((item) => (
            <SelectItem key={item} value={item}>
              {item === "all"
                ? t("logisticsDashboard.filters.allStatuses")
                : translateLogisticsStatus(t, item)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={region} onValueChange={onRegionChange}>
        <SelectTrigger className={cn(filterClass, "w-full sm:w-[150px]")}>
          <SelectValue placeholder={t("logisticsDashboard.filters.region")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("logisticsDashboard.filters.allRegions")}</SelectItem>
          {regions.map((item) => (
            <SelectItem key={item} value={item}>
              {translateLogisticsRegion(t, item)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={dateFilter} onValueChange={(value) => onDateFilterChange(value as DeliveryDateFilter)}>
        <SelectTrigger className={cn(filterClass, "w-full sm:w-[140px]")}>
          <SelectValue placeholder={t("logisticsDashboard.filters.date")} />
        </SelectTrigger>
        <SelectContent>
          {DATE_FILTERS.map((item) => (
            <SelectItem key={item} value={item}>
              {dateLabels[item]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={priority}
        onValueChange={(value) => onPriorityChange(value as DeliveryPriorityFilter)}
      >
        <SelectTrigger className={cn(filterClass, "w-full sm:w-[140px]")}>
          <SelectValue placeholder={t("logisticsDashboard.filters.priority")} />
        </SelectTrigger>
        <SelectContent>
          {PRIORITY_FILTERS.map((item) => (
            <SelectItem key={item} value={item}>
              {item === "all"
                ? t("logisticsDashboard.filters.allPriorities")
                : translateLogisticsPriority(t, item)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
