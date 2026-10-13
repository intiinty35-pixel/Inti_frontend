"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { FormProvider, useForm, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ROUTES } from "@/shared/config/routes";
import { Button } from "@/shared/ui/button";
import { ArrowRightIcon, CheckCircleIcon, ChevronLeftIcon } from "@/shared/ui/icons";
import { WizardStepper, type StepStatus, type WizardStepMeta } from "@/shared/ui/stepper";
import {
  buildProjectPayload,
  createAdminProject,
  createProject,
  mergeProjectMedia,
  toProjectInput,
  updateProject,
  uploadProjectFiles,
  type CreateProjectPayload,
} from "@/features/projects/api";
import { countStepErrors, PROJECT_DRAFT_DEFAULTS } from "@/features/projects/lib/project-draft";
import { LAST_STEP_INDEX, WIZARD_STEPS, projectDraftSchema } from "@/features/projects/lib/project-schema";
import { projectDetailToDraft } from "@/features/projects/lib/project-from-api";
import type { ProjectApiDetail } from "@/features/projects/types/api";
import type { LotDraft, ProjectDraft } from "@/features/projects/types/draft";
import type { ProjectPreview } from "@/features/projects/types/preview";
import { ProjectReview } from "@/features/projects/components/project-review";
import { StepProjectInfo } from "@/features/projects/components/steps/step-project-info";
import { StepLocation } from "@/features/projects/components/steps/step-location";
import { StepLots } from "@/features/projects/components/steps/step-lots";
import { StepTimeline } from "@/features/projects/components/steps/step-timeline";
import { StepMedia } from "@/features/projects/components/steps/step-media";

const STEP_COMPONENTS = [
  StepProjectInfo,
  StepLocation,
  StepLots,
  StepTimeline,
  StepMedia,
] as const;

const STEP_SUMMARIES = [
  "Datos, precios y amenidades",
  "Departamento, provincia y dirección",
  "Fichas de lotes del inventario",
  "Fechas, hitos y certificaciones",
  "Imágenes, planos y renders",
] as const;

function StepHeader({ current, title, detail }: { current: number; title: string; detail: string }) {
  return (
    <header className="border-b border-edge pb-5">
      <p className="text-[11px] font-black tracking-[0.18em] text-accent uppercase">
        Paso {current} de {WIZARD_STEPS.length}
      </p>
      <h2 className="mt-1 font-display text-3xl font-black tracking-tight text-brand">{title}</h2>
      <p className="mt-2 text-sm font-medium text-muted">{detail}</p>
    </header>
  );
}

export interface ProjectPublishWizardProps {
  previewProjects: readonly ProjectPreview[];
  adminMode?: boolean;
  /** Proyecto existente que se edita; sin esto el asistente crea uno nuevo. */
  initialProject?: ProjectApiDetail;
  /**
   * Se invoca al confirmar el resumen. Opcional mientras no exista
   * `POST /projects`: el borrador se confirma igual en pantalla.
   */
  onSave?: (payload: CreateProjectPayload) => void;
}

export function ProjectPublishWizard({
  previewProjects,
  adminMode = false,
  initialProject,
  onSave,
}: ProjectPublishWizardProps) {
  const editing = initialProject !== undefined;
  const initialDraft = useMemo(
    () => (initialProject ? projectDetailToDraft(initialProject) : PROJECT_DRAFT_DEFAULTS),
    [initialProject],
  );
  const form = useForm<ProjectDraft>({
    resolver: zodResolver(projectDraftSchema),
    defaultValues: initialDraft,
    mode: "onTouched",
  });

  const {
    trigger,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = form;

  const [step, setStep] = useState(0);
  const [payload, setPayload] = useState<CreateProjectPayload | null>(null);
  const [reviewedLots, setReviewedLots] = useState<readonly LotDraft[]>([]);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stepMeta = useMemo<WizardStepMeta[]>(
    () =>
      WIZARD_STEPS.map((item, index) => ({
        key: item.key,
        title: item.title,
        summary: STEP_SUMMARIES[index],
      })),
    [],
  );

  const errorCounts = useMemo(
    () => WIZARD_STEPS.map((item) => countStepErrors(errors as FieldErrors, item.fields)),
    [errors],
  );

  const statuses = useMemo<StepStatus[]>(
    () =>
      WIZARD_STEPS.map((_, index) => {
        if (index < step) {
          return "done";
        }

        return index === step ? "current" : "todo";
      }),
    [step],
  );

  const goToStep = useCallback(
    (target: number) => {
      if (target < step) {
        setStep(target);
        return;
      }

      if (target > step) {
        void trigger(WIZARD_STEPS[step].fields, { shouldFocus: true }).then((ok) => {
          if (ok) {
            setStep(target);
          }
        });
      }
    },
    [step, trigger],
  );

  const goNext = useCallback(async () => {
    const ok = await trigger(WIZARD_STEPS[step].fields, { shouldFocus: true });

    if (ok && step < LAST_STEP_INDEX) {
      setStep(step + 1);
    }
  }, [step, trigger]);

  const goBack = useCallback(() => {
    if (step > 0) {
      setStep(step - 1);
    }
  }, [step]);

  const startOver = useCallback(() => {
    reset(initialDraft);
    setStep(0);
    setPayload(null);
    setReviewedLots([]);
    setSaved(false);
    setError(null);
  }, [reset, initialDraft]);

  // Se congela el inventario al revisar: el resumen no debe depender de un
  // `watch` en vivo, que el compilador de React no puede memoizar.
  const submit = () =>
    handleSubmit((draft) => {
      setReviewedLots(getValues("lots"));
      setError(null);
      setPayload(buildProjectPayload(draft));
    })();

  // Sube los adjuntos y guarda el proyecto como borrador.
  const confirm = useCallback(
    async (next: CreateProjectPayload) => {
      setSaving(true);
      setError(null);
      try {
        const images = await uploadProjectFiles(getValues("images"), "IMAGE", 0);
        const plans = await uploadProjectFiles(getValues("plans"), "FLOOR_PLAN", images.length);
        const renders = await uploadProjectFiles(
          getValues("renderImages"),
          "RENDER",
          images.length + plans.length,
        );

        const media = mergeProjectMedia(getValues("keptMedia"), [...images, ...plans, ...renders]);
        const input = toProjectInput(next, media);
        if (initialProject) {
          await updateProject(initialProject.id, input);
        } else {
          await (adminMode ? createAdminProject(input) : createProject(input));
        }

        onSave?.(next);
        setSaved(true);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "No se pudo guardar el proyecto.");
      } finally {
        setSaving(false);
      }
    },
    [adminMode, getValues, initialProject, onSave],
  );

  if (saved) {
    return (
      <div className="grid min-w-0 justify-items-center gap-4 rounded-card border border-edge bg-surface py-12 text-center shadow-[var(--shadow-card)] sm:py-16">
        <span className="flex size-16 items-center justify-center rounded-full bg-success/12 text-success">
          <CheckCircleIcon className="size-8" />
        </span>
        <p className="text-[11px] font-black tracking-[0.2em] text-accent uppercase">
          {editing ? "Cambios guardados" : "Borrador guardado"}
        </p>
        <h2 className="font-display text-3xl font-black tracking-tight text-brand">
          {payload?.name}
        </h2>
        <p className="max-w-md text-sm text-muted">
          {editing
            ? `El proyecto se actualizó con ${payload?.lots.length ?? 0} lotes.`
            : `El proyecto quedó guardado con ${payload?.lots.length ?? 0} lotes. ${
                adminMode
                  ? "Puedes publicarlo desde Proyectos ARIZ sin consumir créditos."
                  : "Puedes publicarlo desde Mis proyectos cuando tengas crédito disponible en tu suscripción."
              }`}
        </p>
        <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row">
          {editing ? null : (
            <Button type="button" variant="secondary" onClick={startOver}>
              Crear otro proyecto
            </Button>
          )}
          <Link href={adminMode ? ROUTES.panel.admin.projects : ROUTES.panel.owner.projects}>
            <Button type="button">
              {adminMode ? "Ver proyectos ARIZ" : "Ver mis proyectos"}
              <ArrowRightIcon className="size-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (payload) {
    return (
      <div className="min-w-0 overflow-hidden rounded-card border border-edge bg-surface shadow-[var(--shadow-card)]">
        <div className="h-1.5 bg-brand" aria-hidden />
        <div className="p-5 sm:p-6 lg:p-8">
          <ProjectReview
            payload={payload}
            lots={reviewedLots}
            previewProjects={previewProjects}
            adminMode={adminMode}
            editing={editing}
            saving={saving}
            error={error}
            onSave={confirm}
            onDone={startOver}
          />
        </div>
      </div>
    );
  }

  return (
    <FormProvider {...form}>
      <form
        id="create-project-form"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
        className="grid min-w-0 gap-6"
      >
        <div className="min-w-0 overflow-hidden rounded-card border border-edge bg-surface shadow-[var(--shadow-card)]">
          <div className="h-1.5 bg-brand" aria-hidden />
          <div className="p-5">
            <h1 className="font-display text-2xl font-black tracking-tight text-brand">
              {editing ? "Editar proyecto" : "Nuevo proyecto"}
            </h1>
            <WizardStepper
              steps={stepMeta}
              statuses={statuses}
              errorCounts={errorCounts}
              activeIndex={step}
              onSelect={goToStep}
              orientation="horizontal"
              className="mt-5"
            />
          </div>
        </div>

        <main className="min-w-0 overflow-hidden rounded-card border border-edge bg-surface shadow-[var(--shadow-card)]">
          <div className="h-1.5 bg-brand" aria-hidden />
          <div className="p-5 sm:p-6 lg:p-8">
            {WIZARD_STEPS.map((item, index) => {
              const StepComponent = STEP_COMPONENTS[index];

              return (
                <section key={item.key} hidden={step !== index} className="grid gap-6">
                  <StepHeader
                    current={index + 1}
                    title={item.title}
                    detail={STEP_SUMMARIES[index]}
                  />
                  <StepComponent />
                </section>
              );
            })}

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-edge pt-6">
              <Button type="button" variant="ghost" onClick={goBack} disabled={step === 0}>
                <ChevronLeftIcon className="size-4" />
                Anterior
              </Button>

              <div className="flex items-center gap-3">
                <p className="hidden text-xs text-muted sm:block" aria-live="polite">
                  Paso {step + 1} de {WIZARD_STEPS.length}
                </p>

                {step < LAST_STEP_INDEX ? (
                  <Button type="button" onClick={() => void goNext()}>
                    Continuar
                    <ArrowRightIcon className="size-4" />
                  </Button>
                ) : (
                  <Button type="submit">
                    Revisar proyecto
                    <ArrowRightIcon className="size-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </main>
      </form>
    </FormProvider>
  );
}
