import { useEffect, useMemo, useState } from "react";
import { DashboardBackLink } from "../components/dashboard/DashboardBackLink";
import { DashboardLayout } from "../components/dashboard/DashboardLayout";
import { navigateToHash } from "../../i18n/localizedRoutes";
import { useLanguage } from "../../i18n/LanguageContext";
import {
  CROP_TYPE_KEYS,
  JOB_TYPE_KEYS,
  getLocalizedCrop,
  getLocalizedJobType,
  normalizeCropTypeKey,
  normalizeJobTypeKey,
  translateJobPostStatus,
} from "../../i18n/farmerJobFormHelpers";
import {
  FARMER_DASHBOARD,
  FARMER_DASHBOARD_JOBS_HASH,
} from "../components/dashboard/dashboardConfig";
import { ProtectedDashboard } from "../components/dashboard/ProtectedDashboard";
import { isFarmerUser } from "../auth/authStorage";
import { createFarmerJob, getFarmerJobById, updateFarmerJob } from "../data/farmJobsStorage";
import {
  economicRegions,
  getDistrictsForRegion,
  type EconomicRegion,
} from "../data/azerbaijanRegions";
import { setJobToast } from "../utils/jobToast";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent } from "../components/ui/card";

const inputClass =
  "agrivo-filter-control h-12 rounded-2xl border-[#DEECE0] bg-[#F7FBF5] text-sm text-[#102018] sm:h-14 sm:text-base";

const defaultForm = {
  title: "",
  jobType: "" as string,
  cropType: "" as string,
  description: "",
  economicRegion: "" as string,
  district: "",
  village: "",
  exactLocation: "",
  startDate: "",
  endDate: "",
  workersNeeded: "",
  dailyPay: "",
  workingHours: "08:00 – 17:00",
  phone: "",
  experienceRequired: false,
  mealsIncluded: false,
  transportIncluded: false,
  housingIncluded: false,
  equipmentProvided: false,
  urgent: false,
  status: "active" as "active" | "closed",
};

export default function CreateJobPage({ editJobId }: { editJobId?: string | null }) {
  const { t, language } = useLanguage();
  const [form, setForm] = useState(defaultForm);
  const [error, setError] = useState("");
  const farmer = isFarmerUser();
  const editingJob = editJobId ? getFarmerJobById(editJobId) : undefined;

  useEffect(() => {
    if (!farmer) {
      navigateToHash("login");
    }
  }, [farmer]);

  useEffect(() => {
    if (!editingJob) return;
    setForm({
      title: editingJob.title,
      jobType: normalizeJobTypeKey(editingJob.jobType) ?? editingJob.jobType,
      cropType: normalizeCropTypeKey(editingJob.cropType) ?? editingJob.cropType,
      description: editingJob.description,
      economicRegion: editingJob.economicRegion ?? "",
      district: editingJob.district,
      village: editingJob.village ?? "",
      exactLocation: editingJob.exactLocation ?? "",
      startDate: editingJob.startDate,
      endDate: editingJob.endDate,
      workersNeeded: String(editingJob.workersNeeded),
      dailyPay: String(editingJob.dailyPay),
      workingHours: editingJob.workingHours,
      phone: editingJob.phone,
      experienceRequired: editingJob.experienceRequired,
      mealsIncluded: editingJob.benefits.mealsIncluded ?? false,
      transportIncluded: editingJob.benefits.transportIncluded ?? false,
      housingIncluded: editingJob.benefits.housingIncluded ?? false,
      equipmentProvided: editingJob.benefits.equipmentProvided ?? false,
      urgent: editingJob.urgent ?? false,
      status: editingJob.status,
    });
  }, [editingJob]);

  const districtOptions = useMemo(
    () => (form.economicRegion ? getDistrictsForRegion(form.economicRegion as EconomicRegion) : []),
    [form.economicRegion],
  );

  const updateField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (
      !form.title ||
      !form.jobType ||
      !form.cropType ||
      !form.description ||
      !form.economicRegion ||
      !form.district ||
      !form.startDate ||
      !form.endDate ||
      !form.workersNeeded ||
      !form.dailyPay ||
      !form.workingHours ||
      !form.phone
    ) {
      setError(t("createJob.feedback.validationRequired"));
      return;
    }

    const jobTypeKey = normalizeJobTypeKey(form.jobType) ?? form.jobType;
    const cropTypeKey = normalizeCropTypeKey(form.cropType) ?? form.cropType;

    const payload = {
      title: form.title,
      jobType: jobTypeKey,
      cropType: cropTypeKey,
      description: form.description,
      economicRegion: form.economicRegion as EconomicRegion,
      district: form.district,
      village: form.village,
      exactLocation: form.exactLocation,
      startDate: form.startDate,
      endDate: form.endDate,
      workersNeeded: Number(form.workersNeeded),
      dailyPay: Number(form.dailyPay),
      workingHours: form.workingHours,
      phone: form.phone,
      experienceRequired: form.experienceRequired,
      mealsIncluded: form.mealsIncluded,
      transportIncluded: form.transportIncluded,
      housingIncluded: form.housingIncluded,
      equipmentProvided: form.equipmentProvided,
      urgent: form.urgent,
      status: form.status,
    };

    if (editingJob) {
      updateFarmerJob(editingJob.id, payload);
      setJobToast(t("createJob.feedback.updated"));
      navigateToHash(FARMER_DASHBOARD_JOBS_HASH);
      return;
    }

    createFarmerJob(payload);
    setJobToast(
      form.status === "active"
        ? t("createJob.feedback.published")
        : t("createJob.feedback.draftSaved"),
    );
    navigateToHash(FARMER_DASHBOARD_JOBS_HASH);
  };

  if (!farmer) {
    return null;
  }

  const isEditing = Boolean(editingJob);
  const required = t("createJob.fields.required");

  return (
    <ProtectedDashboard allowedRoles={["farmer"]}>
      <DashboardLayout
        config={FARMER_DASHBOARD}
        pageTitle={isEditing ? t("createJob.editPageTitle") : t("farmerJobsDashboard.createJobPost")}
        pageSubtitle={isEditing ? t("createJob.editSubtitle") : t("createJob.subtitle")}
        activeNavId={isEditing ? "farm-jobs" : "create-job"}
        hideIntro
      >
        <DashboardBackLink label={t("createJob.backToJobs")} hash={FARMER_DASHBOARD_JOBS_HASH} />

        <div className="agrivo-dashboard-panel mx-auto max-w-3xl">
          <h2 className="agrivo-heading text-2xl font-bold text-[#102018] sm:text-3xl">
            {isEditing ? t("createJob.editTitle") : t("createJob.title")}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#5F6F64] sm:text-base">
            {isEditing ? t("createJob.editSubtitle") : t("createJob.subtitle")}
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <FormSection title={t("createJob.sections.basic")}>
              <div className="space-y-4">
                <Field label={`${t("createJob.fields.jobTitle")} ${required}`}>
                  <Input
                    className={inputClass}
                    placeholder={t("createJob.fields.jobTitlePlaceholder")}
                    value={form.title}
                    onChange={(e) => updateField("title", e.target.value)}
                  />
                </Field>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label={`${t("createJob.fields.jobType")} ${required}`}>
                    <Select value={form.jobType} onValueChange={(v) => updateField("jobType", v)}>
                      <SelectTrigger className={inputClass}>
                        <SelectValue placeholder={t("createJob.fields.selectJobType")} />
                      </SelectTrigger>
                      <SelectContent>
                        {JOB_TYPE_KEYS.map((typeKey) => (
                          <SelectItem key={typeKey} value={typeKey}>
                            {getLocalizedJobType(typeKey, language, t)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label={`${t("createJob.fields.cropType")} ${required}`}>
                    <Select value={form.cropType} onValueChange={(v) => updateField("cropType", v)}>
                      <SelectTrigger className={inputClass}>
                        <SelectValue placeholder={t("createJob.fields.selectCrop")} />
                      </SelectTrigger>
                      <SelectContent>
                        {CROP_TYPE_KEYS.map((cropKey) => (
                          <SelectItem key={cropKey} value={cropKey}>
                            {getLocalizedCrop(cropKey, language, t)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
                <Field label={`${t("createJob.fields.description")} ${required}`}>
                  <Textarea
                    className="min-h-28 rounded-2xl border-[#DEECE0] bg-[#F7FBF5] text-sm text-[#102018]"
                    placeholder={t("createJob.fields.descriptionPlaceholder")}
                    value={form.description}
                    onChange={(e) => updateField("description", e.target.value)}
                  />
                </Field>
              </div>
            </FormSection>

            <FormSection title={t("createJob.sections.location")}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label={`${t("createJob.fields.economicRegion")} ${required}`}>
                  <Select
                    value={form.economicRegion}
                    onValueChange={(v) => {
                      updateField("economicRegion", v);
                      updateField("district", "");
                    }}
                  >
                    <SelectTrigger className={inputClass}>
                      <SelectValue placeholder={t("createJob.fields.selectRegion")} />
                    </SelectTrigger>
                    <SelectContent>
                      {economicRegions.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label={`${t("createJob.fields.districtCity")} ${required}`}>
                  <Select
                    value={form.district}
                    onValueChange={(v) => updateField("district", v)}
                    disabled={!form.economicRegion}
                  >
                    <SelectTrigger className={inputClass}>
                      <SelectValue placeholder={t("createJob.fields.selectDistrict")} />
                    </SelectTrigger>
                    <SelectContent>
                      {districtOptions.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label={t("createJob.fields.village")}>
                  <Input
                    className={inputClass}
                    placeholder={t("createJob.fields.villagePlaceholder")}
                    value={form.village}
                    onChange={(e) => updateField("village", e.target.value)}
                  />
                </Field>
                <Field label={t("createJob.fields.exactLocation")}>
                  <Input
                    className={inputClass}
                    placeholder={t("createJob.fields.exactLocationPlaceholder")}
                    value={form.exactLocation}
                    onChange={(e) => updateField("exactLocation", e.target.value)}
                  />
                </Field>
              </div>
            </FormSection>

            <FormSection title={t("createJob.sections.dateWork")}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label={`${t("createJob.fields.startDate")} ${required}`}>
                  <Input
                    type="date"
                    className={inputClass}
                    value={form.startDate}
                    onChange={(e) => updateField("startDate", e.target.value)}
                  />
                </Field>
                <Field label={`${t("createJob.fields.endDate")} ${required}`}>
                  <Input
                    type="date"
                    className={inputClass}
                    value={form.endDate}
                    onChange={(e) => updateField("endDate", e.target.value)}
                  />
                </Field>
                <Field label={`${t("createJob.fields.workersNeeded")} ${required}`}>
                  <Input
                    type="number"
                    min={1}
                    className={inputClass}
                    placeholder="5"
                    value={form.workersNeeded}
                    onChange={(e) => updateField("workersNeeded", e.target.value)}
                  />
                </Field>
                <Field label={`${t("createJob.fields.workingHours")} ${required}`}>
                  <Input
                    className={inputClass}
                    placeholder={t("createJob.fields.workingHoursPlaceholder")}
                    value={form.workingHours}
                    onChange={(e) => updateField("workingHours", e.target.value)}
                  />
                </Field>
              </div>
            </FormSection>

            <FormSection title={t("createJob.sections.payBenefits")}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label={`${t("createJob.fields.dailyPay")} ${required}`}>
                  <Input
                    type="number"
                    min={0}
                    className={inputClass}
                    placeholder="20"
                    value={form.dailyPay}
                    onChange={(e) => updateField("dailyPay", e.target.value)}
                  />
                </Field>
              </div>
              <div className="mt-4 flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm text-[#3f5247]">
                  <Checkbox
                    checked={form.experienceRequired}
                    onCheckedChange={(c) => updateField("experienceRequired", c === true)}
                  />
                  {t("createJob.benefits.experienceRequired")}
                </label>
                <label className="flex items-center gap-2 text-sm text-[#3f5247]">
                  <Checkbox
                    checked={form.mealsIncluded}
                    onCheckedChange={(c) => updateField("mealsIncluded", c === true)}
                  />
                  {t("createJob.benefits.mealsIncluded")}
                </label>
                <label className="flex items-center gap-2 text-sm text-[#3f5247]">
                  <Checkbox
                    checked={form.transportIncluded}
                    onCheckedChange={(c) => updateField("transportIncluded", c === true)}
                  />
                  {t("createJob.benefits.transportIncluded")}
                </label>
                <label className="flex items-center gap-2 text-sm text-[#3f5247]">
                  <Checkbox
                    checked={form.housingIncluded}
                    onCheckedChange={(c) => updateField("housingIncluded", c === true)}
                  />
                  {t("createJob.benefits.housingIncluded")}
                </label>
                <label className="flex items-center gap-2 text-sm text-[#3f5247]">
                  <Checkbox
                    checked={form.equipmentProvided}
                    onCheckedChange={(c) => updateField("equipmentProvided", c === true)}
                  />
                  {t("createJob.benefits.equipmentProvided")}
                </label>
                <label className="flex items-center gap-2 text-sm text-[#3f5247]">
                  <Checkbox checked={form.urgent} onCheckedChange={(c) => updateField("urgent", c === true)} />
                  {t("createJob.benefits.urgentJob")}
                </label>
              </div>
            </FormSection>

            <FormSection title={t("createJob.sections.contact")}>
              <Field label={`${t("createJob.fields.contactPhone")} ${required}`}>
                <Input
                  className={inputClass}
                  placeholder="+994501234567"
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                />
              </Field>
            </FormSection>

            <FormSection title={t("createJob.sections.publish")}>
              <Field label={t("createJob.fields.status")}>
                <Select
                  value={form.status}
                  onValueChange={(v) => updateField("status", v as "active" | "closed")}
                >
                  <SelectTrigger className={inputClass}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">{t("createJob.status.active")}</SelectItem>
                    <SelectItem value="closed">{t("createJob.status.closed")}</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              {error ? <p className="text-sm font-medium text-[#b91c1c]">{error}</p> : null}

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <Button
                  type="submit"
                  className="agrivo-button-soft flex-1 rounded-full bg-[#14532D] text-white hover:bg-[#1D6A3B]"
                >
                  {editingJob ? t("createJob.actions.saveChanges") : t("createJob.actions.publish")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 rounded-full border-[#dbe7d4] text-[#14532D] hover:bg-[#EAF7EC]"
                  onClick={() => {
                    navigateToHash(FARMER_DASHBOARD_JOBS_HASH);
                  }}
                >
                  {t("createJob.actions.cancel")}
                </Button>
              </div>
            </FormSection>
          </form>
        </div>
      </DashboardLayout>
    </ProtectedDashboard>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="rounded-[28px] border border-[#e5efe1] bg-white shadow-[0_8px_24px_rgba(20,83,45,0.04)]">
      <CardContent className="p-6 sm:p-7">
        <h2 className="agrivo-heading mb-5 text-lg font-bold text-[#102018]">{title}</h2>
        {children}
      </CardContent>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-semibold text-[#14532D]">{label}</Label>
      {children}
    </div>
  );
}
