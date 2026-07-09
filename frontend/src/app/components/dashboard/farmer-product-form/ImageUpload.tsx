import { ImagePlus, Upload, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { Button } from "../../ui/button";
import { cn } from "../../ui/utils";
import { useLanguage } from "../../../../i18n/LanguageContext";

export function ImageUpload({
  value,
  onChange,
  error,
  compact = false,
}: {
  value: string;
  onChange: (dataUrl: string) => void;
  error?: string;
  compact?: boolean;
}) {
  const { t } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          onChange(reader.result);
        }
      };
      reader.readAsDataURL(file);
    },
    [onChange],
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  if (value) {
    return (
      <div className={cn("agrivo-image-upload-preview", compact && "agrivo-image-upload-preview--compact")}>
        <img src={value} alt={t("farmerAddProduct.upload.productPreview")} className="agrivo-image-upload-preview-img" />
        <div className="agrivo-image-upload-preview-actions">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full border-[#dbe7d4] bg-white/95 text-[#14532D] hover:bg-[#EAF7EC]"
            onClick={() => inputRef.current?.click()}
          >
            {t("farmerAddProduct.upload.changePhoto")}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full border-[#fecaca] bg-white/95 text-[#b91c1c] hover:bg-[#fef2f2]"
            onClick={() => onChange("")}
            aria-label={t("farmerAddProduct.upload.removeImage")}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) processFile(file);
          }}
        />
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        className={cn(
          "agrivo-image-upload-dropzone",
          compact && "agrivo-image-upload-dropzone--compact",
          isDragging && "agrivo-image-upload-dropzone--active",
          error && "agrivo-image-upload-dropzone--error",
        )}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <div className="agrivo-image-upload-icon">
          <ImagePlus className="h-6 w-6 text-[#43A047]" />
        </div>
        <p className={cn("text-sm font-semibold text-[#102018]", compact ? "mt-2" : "mt-3")}>
          {t("farmerAddProduct.upload.title")}
        </p>
        <p className="mt-0.5 text-xs text-[#6b7a70]">{t("farmerAddProduct.upload.subtitle")}</p>
        <span
          className={cn(
            "agrivo-image-upload-cta inline-flex items-center gap-1.5 text-xs font-semibold text-[#14532D]",
            compact ? "mt-2" : "mt-4",
          )}
        >
          <Upload className="h-3.5 w-3.5" />
          {t("farmerAddProduct.upload.chooseFile")}
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) processFile(file);
        }}
      />
      {error ? <p className="agrivo-form-error mt-2">{error}</p> : null}
    </div>
  );
}
