import type { InTransitIssue } from "../../../utils/inTransitStorage";
import { useLanguage } from "../../../../i18n/LanguageContext";
import { translateTransitIssueLabel, translateTransitIssueStatus } from "../../../../i18n/inTransitHelpers";
import { Button } from "../../ui/button";

export function IssueCenterCard({
  issues,
  onViewIssue,
}: {
  issues: InTransitIssue[];
  onViewIssue: (taskId: string) => void;
}) {
  const { t } = useLanguage();
  const openIssues = issues.filter((i) => i.status === "open");

  return (
    <section className="agrivo-transit-side-card agrivo-dashboard-panel">
      <h3 className="agrivo-heading text-base font-bold text-[#102018]">
        {t("inTransitPage.sidebar.issueCenterTitle")}
      </h3>
      <p className="mt-1 text-xs text-[#6b7a70]">{t("inTransitPage.sidebar.issueCenterSubtitle")}</p>

      {openIssues.length > 0 ? (
        <ul className="agrivo-transit-issues-list">
          {openIssues.map((issue) => (
            <li key={issue.id} className="agrivo-transit-issue-item">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[#102018]">{issue.taskId}</p>
                <p className="text-xs text-[#5F6F64]">{translateTransitIssueLabel(t, issue.label)}</p>
                <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-[#c2410c]">
                  {translateTransitIssueStatus(t, issue.status)}
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="rounded-full border-[#dbe7d4] text-[#14532D] hover:bg-[#EAF7EC]"
                onClick={() => onViewIssue(issue.taskId)}
              >
                {t("inTransitPage.sidebar.view")}
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="agrivo-transit-issues-empty">{t("inTransitPage.sidebar.noActiveIssues")}</p>
      )}
    </section>
  );
}
