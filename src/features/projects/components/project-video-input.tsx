"use client";

import { useEffect, useRef, useState } from "react";
import { Upload, Video } from "lucide-react";
import { useFormContext } from "react-hook-form";
import type { ProjectDraft } from "@/features/projects/types/draft";
import { TextField } from "@/shared/ui/rhf-fields";
import { validateProjectVideo } from "@/features/projects/lib/project-video";

export function ProjectVideoInput() {
  const { watch, setValue } = useFormContext<ProjectDraft>();
  const file = watch("tourVideo");
  const currentUrl = watch("tourUrl");
  const [source, setSource] = useState<"local" | "url">(() =>
    currentUrl && !/\.(mp4|webm|mov|m4v)(?:$|[?#])|\/video\/upload\//i.test(currentUrl) ? "url" : "local",
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string>();
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (previewRef.current) previewRef.current.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file, source]);

  return (
    <div className="flex flex-col gap-4">
      <fieldset className="grid grid-cols-1 gap-3 sm:grid-cols-2" disabled={checking}>
        <legend className="mb-3 text-sm font-semibold text-brand">Origen del video</legend>
        {([{ value: "local", label: "Video local", hint: "Selecciona un archivo de tu equipo. M?ximo 2 minutos." }, { value: "url", label: "URL externa", hint: "Pega el enlace de YouTube o de tu recorrido virtual." }] as const).map((option) => (
          <label key={option.value} className={`flex cursor-pointer items-start gap-3 rounded-card border p-4 ${source === option.value ? "border-brand bg-brand-soft" : "border-edge bg-surface"}`}>
            <input type="radio" name="project-video-source" value={option.value} checked={source === option.value} className="mt-1 accent-brand" onChange={() => {
              setSource(option.value);
              setError(undefined);
              if (option.value === "url") {
                setValue("tourVideo", undefined, { shouldDirty: true });
                if (currentUrl && /\.(mp4|webm|mov|m4v)(?:$|[?#])|\/video\/upload\//i.test(currentUrl)) setValue("tourUrl", "", { shouldDirty: true });
              }
            }} />
            <span className="flex flex-col gap-1.5"><span className="text-sm font-bold text-brand">{option.label}</span><span className="text-xs leading-relaxed text-muted">{option.hint}</span></span>
          </label>
        ))}
      </fieldset>
      {source === "url" ? (
        <TextField<ProjectDraft> name="tourUrl" label="Enlace del recorrido virtual" type="url" inputMode="url" placeholder="https://www.youtube.com/watch?v=..." hint="Tambi?n puedes pegar un enlace corto de YouTube (youtu.be)." />
      ) : (
    <div className="mb-4 flex flex-col gap-4 rounded-card border border-dashed border-brand/40 bg-brand-soft/30 p-5">
      <label htmlFor="project-tour-video" className="text-sm font-semibold text-brand">Video local (máximo 2 minutos)</label>
      <input
        ref={inputRef}
        className="sr-only"
        id="project-tour-video"
        type="file"
        accept="video/mp4,video/webm,video/quicktime"
        disabled={checking}
        aria-describedby="project-tour-video-hint"
        onChange={async (event) => {
          const selected = event.currentTarget.files?.[0];
          event.currentTarget.value = "";
          if (!selected) return;
          setError(undefined);
          setChecking(true);
          try {
            await validateProjectVideo(selected);
            setValue("tourVideo", selected, { shouldDirty: true });
            setValue("tourUrl", "", { shouldDirty: true, shouldValidate: true });
          } catch (cause) {
            setError(cause instanceof Error ? cause.message : "No se pudo validar el video.");
          } finally {
            setChecking(false);
          }
        }}
      />
      <div className="flex flex-wrap items-center gap-3">
        <span className="grid size-11 place-items-center rounded-full bg-brand-soft text-brand"><Video className="size-5" aria-hidden="true" /></span>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={checking}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-card bg-brand px-5 py-3 text-sm font-bold text-on-brand transition-colors hover:bg-brand-hover disabled:opacity-50"
        >
          <Upload className="size-4" aria-hidden="true" />
          {checking ? "Verificando video…" : file || currentUrl ? "Reemplazar video desde mi equipo" : "Seleccionar video desde mi equipo"}
        </button>
      </div>
      <p id="project-tour-video-hint" className="text-xs text-muted">MP4, WebM o MOV, hasta 100 MB. El video seleccionado reemplazará el enlace al guardar.</p>
      {checking && <p role="status">Verificando duración…</p>}
      {error && <p role="alert" className="text-xs text-error">{error}</p>}
      {file && (
        <div className="flex flex-col gap-3 text-sm">
          <p className="break-all font-semibold text-brand">Video seleccionado: {file.name}</p>
          <video ref={previewRef} controls playsInline preload="metadata" className="aspect-video w-full max-w-xl rounded-card bg-black" />
          <p className="text-xs text-muted">Se subirá y reemplazará el recorrido actual cuando confirmes los cambios del proyecto.</p>
          <button className="self-start text-xs font-semibold text-error" type="button" onClick={() => setValue("tourVideo", undefined, { shouldDirty: true })}>Quitar video seleccionado</button>
        </div>
      )}
      {!file && currentUrl && <p className="text-xs text-muted">El recorrido actual se conservar? hasta que selecciones un video nuevo.</p>}
    </div>
      )}
    </div>
  );
}
