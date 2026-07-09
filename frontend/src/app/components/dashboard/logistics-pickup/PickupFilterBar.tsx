import {
  type PickupPriority,
  type PickupPriorityFilter,
  type PickupStatusFilter,
  type PickupTaskStatus,
  type PickupTimeFilter,
} from "../../../utils/pickupTasksStorage";
import { useLanguage } from "../../../../i18n/LanguageContext";
import {
  translatePickupPriority,
  translatePickupRegion,
  translatePickupStatus,
  translatePickupTimeFilter,
} from "../../../../i18n/pickupTasksHelpers";
import { Input } from "../../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Search } from "lucide-react";

interface PickupFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: PickupStatusFilter;
  onStatusChange: (value: PickupStatusFilter) => void;
  timeFilter: PickupTimeFilter;
  onTimeFilterChange: (value: PickupTimeFilter) => void;
  region: string;
  onRegionChange: (value: string) => void;
  regions: string[];
  priority: PickupPriorityFilter;
  onPriorityChange: (value: PickupPriorityFilter) => void;
}

const STATUS_OPTIONS: PickupTaskStatus[] = [
  "scheduled",
  "ready_for_pickup",
  "driver_assigned",
  "pickup_started",
  "collected",
  "delayed",
  "cancelled",
];

const PRIORITY_OPTIONS: PickupPriority[] = ["high", "medium", "low"];

export function PickupFilterBar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  timeFilter,
  onTimeFilterChange,
  region,
  onRegionChange,
  regions,
  priority,
  onPriorityChange,
}: PickupFilterBarProps) {
  const { t } = useLanguage();

  return (
    <section className="agrivo-pickup-filters agrivo-dashboard-panel">
      <div className="agrivo-pickup-filters__search">
        <Search className="agrivo-pickup-filters__search-icon" />
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={t("pickupTasks.filters.searchPlaceholder")}
          className="agrivo-pickup-filters__input"
        />
      </div>

      <div className="agrivo-pickup-filters__controls">
        <Select value={status} onValueChange={(value) => onStatusChange(value as PickupStatusFilter)}>
          <SelectTrigger className="agrivo-pickup-filters__select">
            <SelectValue placeholder={t("pickupTasks.filters.status")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("pickupTasks.filters.allStatuses")}</SelectItem>
            {STATUS_OPTIONS.map((item) => (
              <SelectItem key={item} value={item}>
                {translatePickupStatus(t, item)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={timeFilter}
          onValueChange={(value) => onTimeFilterChange(value as PickupTimeFilter)}
        >
          <SelectTrigger className="agrivo-pickup-filters__select">
            <SelectValue placeholder={t("pickupTasks.filters.time")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">{translatePickupTimeFilter(t, "today")}</SelectItem>
            <SelectItem value="next_2_hours">{translatePickupTimeFilter(t, "next_2_hours")}</SelectItem>
            <SelectItem value="afternoon">{translatePickupTimeFilter(t, "afternoon")}</SelectItem>
            <SelectItem value="tomorrow">{translatePickupTimeFilter(t, "tomorrow")}</SelectItem>
            <SelectItem value="week">{translatePickupTimeFilter(t, "week")}</SelectItem>
            <SelectItem value="all">{translatePickupTimeFilter(t, "all")}</SelectItem>
          </SelectContent>
        </Select>

        <Select value={region} onValueChange={onRegionChange}>
          <SelectTrigger className="agrivo-pickup-filters__select">
            <SelectValue placeholder={t("pickupTasks.filters.region")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("pickupTasks.filters.allRegions")}</SelectItem>
            {regions.map((item) => (
              <SelectItem key={item} value={item}>
                {translatePickupRegion(t, item)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={priority}
          onValueChange={(value) => onPriorityChange(value as PickupPriorityFilter)}
        >
          <SelectTrigger className="agrivo-pickup-filters__select">
            <SelectValue placeholder={t("pickupTasks.filters.priority")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("pickupTasks.filters.allPriorities")}</SelectItem>
            {PRIORITY_OPTIONS.map((item) => (
              <SelectItem key={item} value={item}>
                {translatePickupPriority(t, item)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </section>
  );
}
