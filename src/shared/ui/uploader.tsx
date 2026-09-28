"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { AlertIcon, FileIcon, PlusIcon, TrashIcon, UploadIcon } from "@/shared/ui/icons";
import { cn } from "@/shared/lib/cn";

export interface UploaderProps {
  /** Visible para lectores de pantalla y asociado al input. */
  label: string;
  files: readonly File[];
  onFilesChange: (files: File[]) => void;
  accept: string;
  maxFiles?: number;
  maxSizeMb?: number;
  hint?: string;
  error?: string;
  /** Muestra flechas para reordenar. La posición 0 es la portada del proyecto. */
  reorderable?: boolean;
  emptyLabel?: string;
  inputName?: string;
  className?: string;
}

function accepts(file: File, accept: string): boolean {
  return accept.split(",").some((rule) => {
    const token = rule.trim().toLowerCase();
    if (token === "") {
      return false;
    }
    if (token.startsWith(".")) {
      return file.name.toLowerCase().endsWith(token);
    }
    if (token.endsWith("/*")) {
      return file.type.toLowerCase().startsWith(token.slice(0, -1));
    }
    return file.type.toLowerCase() === token;
  });
}

function formatSize(bytes: number): string {
  return bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function FileThumb({ file, alt }: { file: File; alt: string }) {
  const url = useMemo(
    () => (file.type.startsWith("image/") ? URL.createObjectURL(file) : null),
    [file],
  );

  useEffect(() => {
    return () => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [url]);

  if (!url) {
    return (
      <span className="grid h-full w-full place-items-center bg-surface-muted text-muted">
        <FileIcon className="size-5" />
      </span>
    );
  }

  // eslint-disable-next-line @next/next/no-img-element -- La URL es un blob local revocado al desmontar; next/image no lo soporta.
  return <img src={url} alt={alt} className="h-full w-full object-cover" />;
}

export function Uploader({
  label,
  files,
  onFilesChange,
  accept,
  maxFiles,
  maxSizeMb = 20,
  hint,
  error,
  reorderable = false,
  emptyLabel = "Sin archivos",
  inputName,
  className,
}: UploaderProps) {
  const generatedId = useId();
  const inputId = inputName ?? `${generatedId}-input`;
  const messageId = `${generatedId}-message`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [rejected, setRejected] = useState<string[]>([]);

  const full = maxFiles !== undefined && files.length >= maxFiles;

  function handleSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(event.target.files ?? []);

    if (picked.length === 0) {
      return;
    }

    const problems: string[] = [];
    const valid: File[] = [];
    const room = maxFiles === undefined ? picked.length : Math.max(0, maxFiles - files.length);

    for (const file of picked) {
      if (!accepts(file, accept)) {
        problems.push(`${file.name}: formato no permitido`);
        continue;
      }

      if (file.size > maxSizeMb * 1024 * 1024) {
        problems.push(`${file.name}: supera ${maxSizeMb} MB`);
        continue;
      }

      valid.push(file);
    }

    if (valid.length > room) {
      problems.push(`Solo caben ${room} archivo(s) más`);
    }

    onFilesChange([...files, ...valid.slice(0, room)]);
    setRejected(problems);
    event.target.value = "";
  }

  function remove(index: number) {
    onFilesChange(files.filter((_, position) => position !== index));
    setRejected([]);
  }

  function move(index: number, delta: number) {
    const target = index + delta;

    if (target < 0 || target >= files.length) {
      return;
    }

    const next = [...files];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    onFilesChange(next);
  }

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={inputId} className="text-[13px] font-semibold text-brand">
        {label}
      </label>

      <div
        className={cn(
          "rounded-card border border-dashed p-3 transition-colors",
          error ? "border-error bg-error/5" : "border-edge bg-surface",
          full ? "opacity-60" : "",
        )}
      >
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          multiple
          accept={accept}
          disabled={full}
          onChange={handleSelect}
          aria-describedby={hint || error || rejected.length > 0 ? messageId : undefined}
          aria-invalid={error ? true : undefined}
          className="sr-only"
        />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] text-muted">
            {maxFiles !== undefined ? `Máximo ${maxFiles} archivo(s)` : null}
            {maxFiles !== undefined ? " · " : null}
            {`hasta ${maxSizeMb} MB por archivo`}
          </p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={full}
            className="inline-flex items-center gap-1.5 rounded-card border border-edge bg-surface px-2.5 py-1.5 text-xs font-semibold text-brand transition-colors hover:border-brand disabled:pointer-events-none disabled:opacity-50"
          >
            <UploadIcon className="size-3.5" />
            {files.length === 0 ? "Seleccionar" : "Agregar"}
          </button>
        </div>

        {files.length === 0 ? (
          <p className="mt-2.5 flex items-center justify-center gap-2 rounded-card bg-surface-muted py-4 text-[11px] text-muted">
            <PlusIcon className="size-3.5" />
            {emptyLabel}
          </p>
        ) : (
          <ul className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {files.map((file, index) => (
              <li
                key={`${file.name}-${index}`}
                className="group relative overflow-hidden rounded-card border border-edge bg-surface"
              >
                <div className="aspect-4/3 w-full">
                  <FileThumb file={file} alt={`Vista previa de ${file.name}`} />
                </div>

                {index === 0 && reorderable ? (
                  <span className="absolute top-1 left-1 rounded-full bg-accent px-1.5 py-0.5 text-[9px] font-bold text-on-accent">
                    Portada
                  </span>
                ) : null}

                <div className="flex items-center gap-1 border-t border-edge p-1">
                  <span className="min-w-0 flex-1 truncate text-[10px] text-muted" title={file.name}>
                    {file.name}
                  </span>
                  <span className="shrink-0 text-[9px] text-muted">{formatSize(file.size)}</span>
                </div>

                <div className="absolute top-1 right-1 flex gap-0.5">
                  {reorderable && index > 0 ? (
                    <IconAction label="Subir" onClick={() => move(index, -1)}>
                      ↑
                    </IconAction>
                  ) : null}
                  {reorderable && index < files.length - 1 ? (
                    <IconAction label="Bajar" onClick={() => move(index, 1)}>
                      ↓
                    </IconAction>
                  ) : null}
                  <IconAction label={`Quitar ${file.name}`} onClick={() => remove(index)} danger>
                    <TrashIcon className="size-3" />
                  </IconAction>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error ? (
        <p id={messageId} role="alert" className="flex items-start gap-1.5 text-xs text-error">
          <AlertIcon className="mt-px size-3.5 shrink-0" />
          {error}
        </p>
      ) : rejected.length > 0 ? (
        <ul id={messageId} role="alert" className="flex flex-col gap-0.5 text-xs text-warning">
          {rejected.map((problem) => (
            <li key={problem} className="flex items-start gap-1.5">
              <AlertIcon className="mt-px size-3.5 shrink-0" />
              {problem}
            </li>
          ))}
        </ul>
      ) : hint ? (
        <p id={messageId} className="text-xs text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function IconAction({
  label,
  onClick,
  danger = false,
  children,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={cn(
        "grid size-5 place-items-center rounded-full text-[10px] font-bold shadow-[var(--shadow-card)] transition-colors",
        danger
          ? "bg-surface text-error hover:bg-error hover:text-white"
          : "bg-surface text-brand hover:bg-brand hover:text-on-brand",
      )}
    >
      {children}
    </button>
  );
}
