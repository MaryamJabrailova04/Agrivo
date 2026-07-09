import { Search } from "lucide-react";
import {
  type CompletedDateFilter,
  type CompletedRatingFilter,
  type CompletedStatusFilter,
  type CompletionStatus,
} from "../../../utils/completedDeliveriesStorage";
import { useLanguage } from "../../../../i18n/LanguageContext";
import {
  translateCompletedDateFilter,
  translateCompletedRatingFilter,
  translateCompletedRegion,
  translateCompletedStatus,
} from "../../../../i18n/completedDeliveriesHelpers";
import { Input } from "../../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";

const STATUS_OPTIONS: CompletionStatus[] = [
  "completed_on_time",
  "completed_late",
  "completed_with_issue",
];

interface CompletedDeliveryFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  dateFilter: CompletedDateFilter;
  onDateFilterChange: (value: CompletedDateFilter) => void;
  region: string;
  onRegionChange: (value: string) => void;
  regions: string[];
  driver: string;
  onDriverChange: (value: string) => void;
  drivers: string[];
  ratingFilter: CompletedRatingFilter;
  onRatingFilterChange: (value: CompletedRatingFilter) => void;
  status: CompletedStatusFilter;
  onStatusChange: (value: CompletedStatusFilter) => void;
}

export function CompletedDeliveryFilterBar(props: CompletedDeliveryFilterBarProps) {
  const { t } = useLanguage();

  return (
    <section className="agrivo-completed-filters agrivo-dashboard-panel">
      <div className="agrivo-completed-filters__search">
        <Search className="agrivo-completed-filters__search-icon" />
        <Input
          value={props.search}
          onChange={(e) => props.onSearchChange(e.target.value)}
          placeholder={t("completedDeliveries.filters.searchPlaceholder")}
          className="agrivo-completed-filters__input"
        />
      </div>
      <div className="agrivo-completed-filters__controls">
        <Select
          value={props.dateFilter}
          onValueChange={(v) => props.onDateFilterChange(v as CompletedDateFilter)}
        >
          <SelectTrigger className="agrivo-completed-filters__select">
            <SelectValue placeholder={t("completedDeliveries.filters.date")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">{translateCompletedDateFilter(t, "today")}</SelectItem>
            <SelectItem value="week">{translateCompletedDateFilter(t, "week")}</SelectItem>
            <SelectItem value="month">{translateCompletedDateFilter(t, "month")}</SelectItem>
            <SelectItem value="all">{translateCompletedDateFilter(t, "all")}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={props.region} onValueChange={props.onRegionChange}>
          <SelectTrigger className="agrivo-completed-filters__select">
            <SelectValue placeholder={t("completedDeliveries.filters.region")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("completedDeliveries.filters.allRegions")}</SelectItem>
            {props.regions.map((r) => (
              <SelectItem key={r} value={r}>
                {translateCompletedRegion(t, r)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={props.driver} onValueChange={props.onDriverChange}>
          <SelectTrigger className="agrivo-completed-filters__select">
            <SelectValue placeholder={t("completedDeliveries.filters.driver")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("completedDeliveries.filters.allDrivers")}</SelectItem>
            {props.drivers.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={props.ratingFilter}
          onValueChange={(v) => props.onRatingFilterChange(v as CompletedRatingFilter)}
        >
          <SelectTrigger className="agrivo-completed-filters__select">
            <SelectValue placeholder={t("completedDeliveries.filters.rating")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{translateCompletedRatingFilter(t, "all")}</SelectItem>
            <SelectItem value="5">{translateCompletedRatingFilter(t, "5")}</SelectItem>
            <SelectItem value="4plus">{translateCompletedRatingFilter(t, "4plus")}</SelectItem>
            <SelectItem value="below4">{translateCompletedRatingFilter(t, "below4")}</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={props.status}
          onValueChange={(v) => props.onStatusChange(v as CompletedStatusFilter)}
        >
          <SelectTrigger className="agrivo-completed-filters__select">
            <SelectValue placeholder={t("completedDeliveries.filters.status")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("completedDeliveries.filters.allStatuses")}</SelectItem>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>
                {translateCompletedStatus(t, s)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </section>
  );
}
