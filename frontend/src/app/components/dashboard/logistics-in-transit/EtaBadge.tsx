import type { EtaStatus } from "../../../utils/inTransitStorage";
import { useLanguage } from "../../../../i18n/LanguageContext";
import { formatEtaLabel } from "../../../../i18n/inTransitHelpers";
import { cn } from "../../ui/utils";

const ETA_TONES: Record<EtaStatus, string> = {
  on_time: "agrivo-transit-eta--on-time",
  delay_risk: "agrivo-transit-eta--risk",
  delayed: "agrivo-transit-eta--delayed",
};

export function EtaBadge({
  eta,
  etaStatus,
  className,
}: {
  eta: string;
  etaStatus: EtaStatus;
  className?: string;
}) {
  const { t } = useLanguage();
  return (
    <span className={cn("agrivo-transit-eta", ETA_TONES[etaStatus], className)}>
      {formatEtaLabel(t, eta)}
    </span>
  );
}
