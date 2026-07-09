import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { useLanguage } from "../../../../i18n/LanguageContext";
import { Button } from "../../ui/button";

export function ReportsCard({
  onExport,
  onDownloadMonthly,
  onDownloadDriver,
}: {
  onExport: () => void;
  onDownloadMonthly: () => void;
  onDownloadDriver: () => void;
}) {
  const { t } = useLanguage();

  return (
    <section className="agrivo-completed-side-card agrivo-dashboard-panel">
      <h3 className="agrivo-heading text-base font-bold text-[#102018]">
        {t("completedDeliveries.sidebar.reportsTitle")}
      </h3>
      <p className="mt-1 text-xs text-[#6b7a70]">{t("completedDeliveries.sidebar.reportsSubtitle")}</p>
      <div className="agrivo-completed-reports-actions">
        <Button
          type="button"
          variant="outline"
          className="w-full justify-start rounded-full border-[#dbe7d4] text-[#14532D] hover:bg-[#EAF7EC]"
          onClick={onExport}
        >
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          {t("completedDeliveries.sidebar.exportCompletedDeliveries")}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full justify-start rounded-full border-[#dbe7d4] text-[#14532D] hover:bg-[#EAF7EC]"
          onClick={onDownloadMonthly}
        >
          <FileText className="mr-2 h-4 w-4" />
          {t("completedDeliveries.sidebar.downloadMonthlyReport")}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full justify-start rounded-full border-[#dbe7d4] text-[#14532D] hover:bg-[#EAF7EC]"
          onClick={onDownloadDriver}
        >
          <Download className="mr-2 h-4 w-4" />
          {t("completedDeliveries.sidebar.downloadDriverPerformance")}
        </Button>
      </div>
    </section>
  );
}
