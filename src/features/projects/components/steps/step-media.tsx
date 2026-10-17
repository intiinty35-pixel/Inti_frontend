"use client";

import { ProjectVideoInput } from "@/features/projects/components/project-video-input";
import { useFormContext } from "react-hook-form";
import { FieldSet, useFieldError } from "@/shared/ui/field-shell";
import { Uploader } from "@/shared/ui/uploader";
import { ImageIcon } from "@/shared/ui/icons";
import { X } from "lucide-react";
import {
  MAX_PLAN_FILES,
  MAX_PLAN_SIZE_MB,
  MAX_PROJECT_IMAGES,
  MAX_RENDER_IMAGES,
  type KeptMedia,
  type ProjectDraft,
} from "@/features/projects/types/draft";

const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp";
const PLAN_ACCEPT = ".pdf,image/jpeg,image/png,image/webp";
const IMAGE_SIZE_MB = 8;
const RENDER_SIZE_MB = 12;

const KEPT_LABELS: Record<KeptMedia["type"], string> = {
  IMAGE: "Imágenes actuales",
  FLOOR_PLAN: "Planos actuales",
  RENDER: "Renders actuales",
};

function KeptMediaList({
  type,
  items,
  onRemove,
}: {
  type: KeptMedia["type"];
  items: readonly KeptMedia[];
  onRemove: (item: KeptMedia) => void;
}) {
  const own = items.filter((item) => item.type === type);
  if (own.length === 0) return null;

  return (
    <div className="mb-3">
      <p className="text-xs font-bold text-brand">{KEPT_LABELS[type]}</p>
      <ul className="mt-2 flex flex-wrap gap-2">
        {own.map((item, index) => (
          <li key={`${item.url}-${index}`} className="relative size-20 overflow-hidden rounded-card border border-edge bg-surface-muted">
            {type === "FLOOR_PLAN" && /\.pdf($|\?)/i.test(item.url) ? (
              <span className="flex size-full items-center justify-center text-[11px] font-bold text-brand">PDF</span>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element -- miniatura de un archivo ya subido a Cloudinary.
              <img src={item.url} alt="" className="size-full object-cover" />
            )}
            <button
              type="button"
              aria-label="Quitar archivo"
              onClick={() => onRemove(item)}
              className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-black/65 text-white hover:bg-error"
            >
              <X className="size-3" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function StepMedia() {
  const { watch, setValue } = useFormContext<ProjectDraft>();
  const keptMedia = watch("keptMedia") ?? [];
  const removeKept = (item: KeptMedia) =>
    setValue(
      "keptMedia",
      keptMedia.filter((media) => media.url !== item.url),
      { shouldDirty: true, shouldValidate: true },
    );
  const images = watch("images");
  const plans = watch("plans");
  const renderImages = watch("renderImages");

  const imagesError = useFieldError<ProjectDraft>("images");
  const plansError = useFieldError<ProjectDraft>("plans");
  const rendersError = useFieldError<ProjectDraft>("renderImages");

  return (
    <div className="flex flex-col gap-6">
      <FieldSet
        legend="Galería del proyecto"
        description="La primera imagen es la portada de la publicación."
        required
        error={imagesError}
      >
        <KeptMediaList type="IMAGE" items={keptMedia} onRemove={removeKept} />
        <Uploader
          label="Imágenes del proyecto"
          accept={IMAGE_ACCEPT}
          maxFiles={MAX_PROJECT_IMAGES}
          maxSizeMb={IMAGE_SIZE_MB}
          hint="La primera imagen se usa como portada."
          emptyLabel="JPG, PNG o WebP"
          files={images ?? []}
          onFilesChange={(files) => setValue("images", files, { shouldDirty: true, shouldValidate: true })}
          inputName="images"
        />
      </FieldSet>

      <FieldSet
        legend="Planos del máster plan"
        description="Plano general, lotización, alzados y memoria descriptiva."
        error={plansError}
      >
        <KeptMediaList type="FLOOR_PLAN" items={keptMedia} onRemove={removeKept} />
        <Uploader
          label="Planos y documentos"
          accept={PLAN_ACCEPT}
          maxFiles={MAX_PLAN_FILES}
          maxSizeMb={MAX_PLAN_SIZE_MB}
          hint={`PDF, JPG, PNG o WebP. Hasta ${MAX_PLAN_SIZE_MB} MB por archivo.`}
          emptyLabel="PDF, JPG, PNG o WebP"
          files={plans ?? []}
          onFilesChange={(files) => setValue("plans", files, { shouldDirty: true, shouldValidate: true })}
          inputName="plans"
          reorderable={false}
        />
      </FieldSet>

      <FieldSet
        legend="Recorrido virtual"
        description="Pega un enlace o selecciona un video local de hasta 2 minutos."
      >
        <ProjectVideoInput />

      </FieldSet>

      <FieldSet
        legend="Renders"
        description="Imágenes digitalizadas de acabados y entorno del proyecto."
        error={rendersError}
      >
        <KeptMediaList type="RENDER" items={keptMedia} onRemove={removeKept} />
        <Uploader
          label="Renders y aerofotografía"
          accept={IMAGE_ACCEPT}
          maxFiles={MAX_RENDER_IMAGES}
          maxSizeMb={RENDER_SIZE_MB}
          emptyLabel="JPG, PNG o WebP"
          files={renderImages ?? []}
          onFilesChange={(files) => setValue("renderImages", files, { shouldDirty: true, shouldValidate: true })}
          inputName="renderImages"
        />
      </FieldSet>

      <div className="flex items-start gap-2 rounded-card bg-surface-muted p-3 text-xs text-muted">
        <ImageIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
        <p>
          {images?.length ?? 0}/{MAX_PROJECT_IMAGES} imágenes · {plans?.length ?? 0}/{MAX_PLAN_FILES} planos ·{" "}
          {renderImages?.length ?? 0}/{MAX_RENDER_IMAGES} renders. Puedes reordenar arrastrando las miniaturas.
        </p>
      </div>
    </div>
  );
}
