import { FileText, Upload } from "lucide-react";
import {
  getDocumentStatusStyles,
  type DocumentStatus,
  type LogisticsDashboardProfile,
} from "../../../utils/logisticsProfileStorage";
import { useLanguage } from "../../../../i18n/LanguageContext";
import {
  translateDocumentLabel,
  translateDocumentStatus,
  translateDocumentUploadLabel,
} from "../../../../i18n/logisticsProfileHelpers";
import { Button } from "../../ui/button";
import { ProfileCard, ProfileCardBody, ProfileCardHeader } from "../farmer-profile/ProfileLayout";

const DOCUMENT_ITEMS: Array<{
  key: keyof LogisticsDashboardProfile["documents"];
}> = [
  { key: "registration" },
  { key: "transportLicense" },
  { key: "vehicleDocs" },
  { key: "insurance" },
  { key: "driverVerification" },
];

function DocumentStatusBadge({ status }: { status: DocumentStatus }) {
  const { t } = useLanguage();

  return (
    <span className={`agrivo-logistics-doc-status ${getDocumentStatusStyles(status)}`}>
      {translateDocumentStatus(t, status)}
    </span>
  );
}

export function DocumentsComplianceCard({
  profile,
  onUpload,
}: {
  profile: LogisticsDashboardProfile;
  onUpload?: (key: keyof LogisticsDashboardProfile["documents"]) => void;
}) {
  const { t } = useLanguage();

  return (
    <ProfileCard>
      <ProfileCardHeader icon={FileText} title={t("logisticsProfile.sections.documentsCompliance")} />
      <ProfileCardBody className="agrivo-logistics-doc-body">
        <ul className="agrivo-logistics-doc-list agrivo-logistics-doc-list--compact">
          {DOCUMENT_ITEMS.map((item) => (
            <li key={item.key} className="agrivo-logistics-doc-row agrivo-logistics-doc-row--compact">
              <span className="agrivo-logistics-doc-label">
                {translateDocumentLabel(t, item.key)}
              </span>
              <DocumentStatusBadge status={profile.documents[item.key]} />
            </li>
          ))}
        </ul>

        <div className="agrivo-logistics-doc-uploads agrivo-logistics-doc-uploads--compact">
          {DOCUMENT_ITEMS.slice(0, 3).map((item) => (
            <Button
              key={item.key}
              type="button"
              variant="outline"
              size="sm"
              className="agrivo-logistics-doc-upload-btn rounded-full border-[#dbe7d4] text-[#14532D] hover:bg-[#EAF7EC]"
              onClick={() => onUpload?.(item.key)}
            >
              <Upload className="mr-1.5 h-3.5 w-3.5" />
              <span className="truncate">{translateDocumentUploadLabel(t, item.key)}</span>
            </Button>
          ))}
        </div>
      </ProfileCardBody>
    </ProfileCard>
  );
}
