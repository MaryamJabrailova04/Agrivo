import { Search } from "lucide-react";
import {
  type EtaStatusFilter,
  type InTransitStatus,
  type InTransitStatusFilter,
} from "../../../utils/inTransitStorage";
import { useLanguage } from "../../../../i18n/LanguageContext";
import {
  translateEtaStatus,
  translateInTransitRegion,
  translateInTransitStatus,
} from "../../../../i18n/inTransitHelpers";
import { Input } from "../../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";

const STATUS_OPTIONS: InTransitStatus[] = [
  "in_transit",
  "near_destination",
  "delayed",
  "issue_reported",
];

interface InTransitFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: InTransitStatusFilter;
  onStatusChange: (value: InTransitStatusFilter) => void;
  region: string;
  onRegionChange: (value: string) => void;
  regions: string[];
  etaFilter: EtaStatusFilter;
  onEtaFilterChange: (value: EtaStatusFilter) => void;
  driver: string;
  onDriverChange: (value: string) => void;
  drivers: string[];
}

export function InTransitFilterBar(props: InTransitFilterBarProps) {
  const { t } = useLanguage();

  return (
    <section className="agrivo-transit-filters agrivo-dashboard-panel">
      <div className="agrivo-transit-filters__search">
        <Search className="agrivo-transit-filters__search-icon" />
        <Input
          value={props.search}
          onChange={(e) => props.onSearchChange(e.target.value)}
          placeholder={t("inTransitPage.filters.searchPlaceholder")}
          className="agrivo-transit-filters__input"
        />
      </div>
      <div className="agrivo-transit-filters__controls">
        <Select value={props.status} onValueChange={(v) => props.onStatusChange(v as InTransitStatusFilter)}>
          <SelectTrigger className="agrivo-transit-filters__select">
            <SelectValue placeholder={t("inTransitPage.filters.status")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("inTransitPage.filters.allStatuses")}</SelectItem>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>
                {translateInTransitStatus(t, s)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={props.region} onValueChange={props.onRegionChange}>
          <SelectTrigger className="agrivo-transit-filters__select">
            <SelectValue placeholder={t("inTransitPage.filters.region")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("inTransitPage.filters.allRegions")}</SelectItem>
            {props.regions.map((r) => (
              <SelectItem key={r} value={r}>
                {translateInTransitRegion(t, r)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={props.etaFilter} onValueChange={(v) => props.onEtaFilterChange(v as EtaStatusFilter)}>
          <SelectTrigger className="agrivo-transit-filters__select">
            <SelectValue placeholder={t("inTransitPage.filters.eta")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("inTransitPage.filters.allEtas")}</SelectItem>
            <SelectItem value="arriving_soon">{t("inTransitPage.filters.arrivingSoon")}</SelectItem>
            <SelectItem value="on_time">{translateEtaStatus(t, "on_time")}</SelectItem>
            <SelectItem value="delayed">{translateEtaStatus(t, "delayed")}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={props.driver} onValueChange={props.onDriverChange}>
          <SelectTrigger className="agrivo-transit-filters__select">
            <SelectValue placeholder={t("inTransitPage.filters.driver")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("inTransitPage.filters.allDrivers")}</SelectItem>
            {props.drivers.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </section>
  );
}
