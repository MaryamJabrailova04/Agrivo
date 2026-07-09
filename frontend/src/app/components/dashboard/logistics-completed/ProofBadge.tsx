import type { ProofStatus } from "../../../utils/completedDeliveriesStorage";
import { useLanguage } from "../../../../i18n/LanguageContext";
import { translateProofStatus } from "../../../../i18n/completedDeliveriesHelpers";
import { cn } from "../../ui/utils";

const PROOF_TONES: Record<ProofStatus, string> = {
  photo_signature: "agrivo-completed-proof--full",
  signature: "agrivo-completed-proof--signature",
  photo: "agrivo-completed-proof--photo",
  none: "agrivo-completed-proof--none",
};

export function ProofBadge({
  proofStatus,
  className,
}: {
  proofStatus: ProofStatus;
  className?: string;
}) {
  const { t } = useLanguage();

  return (
    <span className={cn("agrivo-completed-proof", PROOF_TONES[proofStatus], className)}>
      {translateProofStatus(t, proofStatus)}
    </span>
  );
}
