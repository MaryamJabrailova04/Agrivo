import { Search } from "lucide-react";
import { useLanguage } from "../../../../i18n/LanguageContext";
import {
  translateAssignedDateFilter,
  translateAssignedPriority,
  translateAssignedRegion,
  translateAssignedStatus,
} from "../../../../i18n/assignedDeliveriesHelpers";
import {
  ASSIGNED_PRIORITY_OPTIONS,
  type AssignedDateFilter,
  type AssignedDeliveryPriority,
  type AssignedPriorityFilter,
  type AssignedDeliveryStatus,
  type AssignedStatusFilter,
} from "../../../utils/assignedDeliveriesStorage";
import { Input } from "../../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";

interface DeliveryFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: AssignedStatusFilter;
  onStatusChange: (value: AssignedStatusFilter) => void;
  dateFilter: AssignedDateFilter;
  onDateFilterChange: (value: AssignedDateFilter) => void;
  region: string;
  onRegionChange: (value: string) => void;
  regions: string[];
  priority: AssignedPriorityFilter;
  onPriorityChange: (value: AssignedPriorityFilter) => void;
}

export function DeliveryFilterBar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  dateFilter,
  onDateFilterChange,
  region,
  onRegionChange,
  regions,
  priority,
  onPriorityChange,
}: DeliveryFilterBarProps) {
  const { t } = useLanguage();

  const statusValues: AssignedDeliveryStatus[] = [
    "assigned",
    "pickup_scheduled",
    "picked_up",
    "in_transit",
    "delivered",
    "delayed",
    "cancelled",
  ];

  return (
    <section className="agrivo-assigned-filters agrivo-dashboard-panel">
      <div className="agrivo-assigned-filters__search">
        <Search className="agrivo-assigned-filters__search-icon" />
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={t("assignedDeliveries.filters.searchPlaceholder")}
          className="agrivo-assigned-filters__input"
        />
      </div>

      <div className="agrivo-assigned-filters__controls">
        <Select value={status} onValueChange={(value) => onStatusChange(value as AssignedStatusFilter)}>
          <SelectTrigger className="agrivo-assigned-filters__select">
            <SelectValue placeholder={t("assignedDeliveries.filters.status")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("assignedDeliveries.filters.allStatuses")}</SelectItem>
            {statusValues.map((item) => (
              <SelectItem key={item} value={item}>
                {translateAssignedStatus(t, item)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={dateFilter}
          onValueChange={(value) => onDateFilterChange(value as AssignedDateFilter)}
        >
          <SelectTrigger className="agrivo-assigned-filters__select">
            <SelectValue placeholder={t("assignedDeliveries.filters.date")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">
              {translateAssignedDateFilter(t, "today")}
            </SelectItem>
            <SelectItem value="tomorrow">
              {translateAssignedDateFilter(t, "tomorrow")}
            </SelectItem>
            <SelectItem value="week">
              {translateAssignedDateFilter(t, "week")}
            </SelectItem>
            <SelectItem value="all">
              {translateAssignedDateFilter(t, "all")}
            </SelectItem>
          </SelectContent>
        </Select>

        <Select value={region} onValueChange={onRegionChange}>
          <SelectTrigger className="agrivo-assigned-filters__select">
            <SelectValue placeholder={t("assignedDeliveries.filters.region")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("assignedDeliveries.filters.allRegions")}</SelectItem>
            {regions.map((item) => (
              <SelectItem key={item} value={item}>
                {translateAssignedRegion(t, item)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={priority}
          onValueChange={(value) => onPriorityChange(value as AssignedPriorityFilter)}
        >
          <SelectTrigger className="agrivo-assigned-filters__select">
            <SelectValue placeholder={t("assignedDeliveries.filters.priority")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("assignedDeliveries.filters.allPriorities")}</SelectItem>
            {ASSIGNED_PRIORITY_OPTIONS.map((item) => (
              <SelectItem key={item} value={item as AssignedPriorityFilter}>
                {translateAssignedPriority(t, item as AssignedDeliveryPriority)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </section>
  );
}
