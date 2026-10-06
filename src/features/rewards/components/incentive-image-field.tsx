"use client";

import { useState } from "react";
import { Link as LinkIcon, Upload as UploadIcon, X as XIcon } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { uploadImageToCloudinary } from "@/shared/lib/api/cloudinary";

interface IncentiveImageFieldProps {
  initialUrl?: string | null;
  initialPublicId?: string | null;
  folder?: string;
  error?: string;
}

export function IncentiveImageField({
  initialUrl,
  initialPublicId,
  folder = "ariz/incentives",
  error,
}: IncentiveImageFieldProps) {
  const [mode, setMode] = useState<"url" | "upload">(initialUrl && !initialPublicId ? "url" : "upload");
  const [imageUrl, setImageUrl] = useState(initialUrl ?? "");
  const [publicId, setPublicId] = useState(initialPublicId ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(initialUrl ?? null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("Solo se permiten imágenes");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("La imagen no debe superar 5 MB");
      return;
    }

    setUploading(true);
    setUploadError(null);
    setPreview(URL.createObjectURL(file));

    try {
      const result = await uploadImageToCloudinary(file, folder);
      setImageUrl(result.url);
      setPublicId(result.publicId);
    } catch {
      setUploadError("No se pudo subir la imagen");
      setImageUrl("");
      setPublicId("");
      setPreview(null);
    } finally {
      setUploading(false);
    }
  }

  function clearImage() {
    setImageUrl("");
    setPublicId("");
    setPreview(null);
    setUploadError(null);
  }

  function handleUrlChange(value: string) {
    setImageUrl(value);
    setPreview(value || null);
    setPublicId("");
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setMode("upload")}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors",
            mode === "upload"
              ? "bg-brand text-on-brand"
              : "bg-surface-muted text-muted hover:text-ink",
          )}
        >
          <UploadIcon className="size-4" />
          Subir imagen
        </button>
        <button
          type="button"
          onClick={() => setMode("url")}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors",
            mode === "url"
              ? "bg-brand text-on-brand"
              : "bg-surface-muted text-muted hover:text-ink",
          )}
        >
          <LinkIcon className="size-4" />
          URL de imagen
        </button>
      </div>

      {mode === "url" ? (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="imageUrl" className="text-[13px] font-semibold text-brand">
            URL de imagen
          </label>
          <input
            id="imageUrl"
            name="imageUrl"
            type="url"
            value={imageUrl}
            onChange={(e) => handleUrlChange(e.target.value)}
            className="h-10 rounded-lg border border-edge bg-surface px-3 text-sm text-ink focus:border-brand focus:outline-2 focus:outline-brand/25"
            placeholder="https://ejemplo.com/imagen.jpg"
          />
          <input type="hidden" name="publicId" value={publicId} />
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-semibold text-brand">
            Imagen
          </label>
          <div
            className={cn(
              "relative rounded-lg border border-dashed transition-colors",
              error || uploadError
                ? "border-error bg-error/5"
                : preview
                  ? "border-brand bg-surface"
                  : "border-edge bg-surface",
            )}
          >
            <input
              type="hidden"
              name="imageUrl"
              value={imageUrl}
            />
            <input
              type="hidden"
              name="publicId"
              value={publicId}
            />

            {preview ? (
              <div className="relative">
                <img
                  src={preview}
                  alt="Preview"
                  className="h-40 w-full rounded-lg object-cover"
                />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute right-2 top-2 rounded-full bg-brand/80 p-1.5 text-white backdrop-blur-sm transition-colors hover:bg-brand"
                  aria-label="Quitar imagen"
                >
                  <XIcon className="size-4" />
                </button>
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-brand/20 backdrop-blur-sm">
                    <div className="rounded-lg bg-brand px-4 py-2 text-sm font-bold text-on-brand">
                      Subiendo...
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <label className="flex cursor-pointer flex-col items-center gap-2 p-6">
                <UploadIcon className="size-8 text-muted" />
                <span className="text-sm text-muted">
                  {uploading ? "Subiendo imagen..." : "Haz clic para seleccionar una imagen"}
                </span>
                <span className="text-xs text-muted">JPG, PNG o WebP · Máx 5 MB</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  disabled={uploading}
                  className="sr-only"
                />
              </label>
            )}
          </div>
        </div>
      )}

      {(error || uploadError) && (
        <p className="text-xs text-error">{error || uploadError}</p>
      )}
    </div>
  );
}
