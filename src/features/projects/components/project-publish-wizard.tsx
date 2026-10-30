"use client";

import { useCallback, useMemo, useState } from "react";
import { validateProjectVideo } from "@/features/projects/lib/project-video";
import { uploadToCloudinary, PROJECT_MEDIA_FOLDER } from "@/shared/lib/api/cloudinary";
import Link from "next/link";
import { FormProvider, useForm, useWatch, type FieldErrors } from "react-hook-form";
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
import { LAST_STEP_INDEX, WIZARD_STEPS, createProjectDraftSchema } from "@/features/projects/lib/project-schema";
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
  "Imágenes, video, planos y renders",
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
  const managedInventory = Boolean(initialProject?.hasSitePlan);
  const validationSchema = useMemo(() => createProjectDraftSchema({ managedInventory }), [managedInventory]);
  const initialDraft = useMemo(
    () => (initialProject ? projectDetailToDraft(initialProject) : PROJECT_DRAFT_DEFAULTS),
    [initialProject],
  );
  const form = useForm<ProjectDraft>({
    resolver: zodResolver(validationSchema),
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
  const apartments = useWatch({ control: form.control, name: "category" }) === "departamentos";

  const [step, setStep] = useState(0);
  const [payload, setPayload] = useState<CreateProjectPayload | null>(null);
  const [reviewedLots, setReviewedLots] = useState<readonly LotDraft[]>([]);
  const [saved, setSaved] = useState(false);
  const [savedId, setSavedId] = useState(initialProject?.id);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stepMeta = useMemo<WizardStepMeta[]>(
    () =>
      WIZARD_STEPS.map((item, index) => ({
        key: item.key,
        title: apartments && index === 2 ? "Edificios y departamentos" : item.title,
        summary: apartments && index === 2 ? "Distribución por edificio y piso" : STEP_SUMMARIES[index],
      })),
    [apartments],
  );

  const errorCounts = useMemo(
    () => WIZARD_STEPS.map((item) => countStepErrors(errors as FieldErrors, item.fields)),
    [errors],
  );

  const statuses = useMemo<StepStatus[]>(
    () =>
      WIZARD_STEPS.map((_, index) => {
        // Al editar, el proyecto ya esta completo: todos los pasos se pueden abrir.
        if (index < step || (editing && index !== step)) {
          return "done";
        }

        return index === step ? "current" : "todo";
      }),
    [step, editing],
  );

  const goToStep = useCallback(
    (target: number) => {
      if (target < step || editing) {
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
    [step, trigger, editing],
  );

  const goNext = useCallback(async () => {
    if (editing) {
      setStep((current) => Math.min(current + 1, LAST_STEP_INDEX));
      return;
    }
    const ok = await trigger(WIZARD_STEPS[step].fields, { shouldFocus: true });

    if (ok && step < LAST_STEP_INDEX) {
      setStep(step + 1);
    }
  }, [step, trigger, editing]);

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
    }, (invalid) => {
      const firstInvalidStep = WIZARD_STEPS.findIndex((item) => countStepErrors(invalid as FieldErrors, item.fields) > 0);
      if (firstInvalidStep >= 0) setStep(firstInvalidStep);
    })();

  // Sube los adjuntos y guarda el proyecto como borrador.
  const confirm = useCallback(
    async (next: CreateProjectPayload) => {
      setSaving(true);
      setError(null);
      try {
        const video = getValues("tourVideo");
        let tourUrl = next.tourUrl;
        if (video) {
          await validateProjectVideo(video);
          tourUrl = (await uploadToCloudinary(video, PROJECT_MEDIA_FOLDER, "video")).url;
        }
        const images = await uploadProjectFiles(getValues("images"), "IMAGE", 0);
        const plans = await uploadProjectFiles(getValues("plans"), "FLOOR_PLAN", images.length);
        const renders = await uploadProjectFiles(
          getValues("renderImages"),
          "RENDER",
          images.length + plans.length,
        );

        const media = mergeProjectMedia(getValues("keptMedia"), [...images, ...plans, ...renders]);
        const input = toProjectInput({ ...next, tourUrl }, media);
        if (managedInventory) input.lots = [];
        if (initialProject) {
          await updateProject(initialProject.id, input);
        } else {
          const created = await (adminMode ? createAdminProject(input) : createProject(input));
          setSavedId(created.id);
        }

        onSave?.(next);
        setSaved(true);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "No se pudo guardar el proyecto.");
      } finally {
        setSaving(false);
      }
    },
    [adminMode, getValues, initialProject, managedInventory, onSave],
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
          {apartments ? "Proyecto guardado. Administra los edificios, pisos y departamentos desde el editor del plano." : editing
            ? `El proyecto se actualizó con ${payload?.lots.length ?? 0} lotes.`
            : `El proyecto quedó guardado con ${payload?.lots.length ?? 0} lotes. ${
                adminMode
                  ? "Puedes publicarlo desde Proyectos INTI sin consumir créditos."
                  : "Puedes publicarlo desde Mis proyectos cuando tengas crédito disponible en tu suscripción."
              }`}
        </p>
        <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row">
          {adminMode && apartments && savedId && <Link href={`/panel/admin/projects/${savedId}/site-plan`}><Button type="button">Configurar edificios y departamentos</Button></Link>}
          {editing ? null : (
            <Button type="button" variant="secondary" onClick={startOver}>
              Crear otro proyecto
            </Button>
          )}
          <Link href={adminMode ? ROUTES.panel.admin.projects : ROUTES.panel.owner.projects}>
            <Button type="button">
              {adminMode ? "Ver proyectos INTI" : "Ver mis proyectos"}
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
                <section key={item.key} hidden={step !== index} className={step === index ? "grid gap-6" : "hidden"}>
                  <StepHeader
                    current={index + 1}
                    title={apartments && index === 2 ? "Edificios y departamentos" : item.title}
                    detail={apartments && index === 2 ? "La distribución se configura en el editor del plano" : STEP_SUMMARIES[index]}
                  />
                  {index === 2 && initialProject?.hasSitePlan ? (
                    <div className="rounded-xl border border-edge bg-surface-muted p-5 text-sm">
                      <p>Este inventario se administra desde el editor del plano. Los cambios generales del proyecto conservan sus unidades y dibujos.</p>
                      {adminMode && <Link className="mt-3 inline-block font-bold text-brand" href={`/panel/admin/projects/${initialProject.id}/site-plan`}>{apartments ? "Abrir edificios, pisos y departamentos →" : "Abrir editor de plano y lotes →"}</Link>}
                    </div>
                  ) : <StepComponent />}
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
                  <Button key="next-step" type="button" onClick={(event) => {
                    event.preventDefault();
                    void goNext();
                  }}>
                    {step === LAST_STEP_INDEX - 1 ? "Continuar a imágenes y video" : "Continuar"}
                    <ArrowRightIcon className="size-4" />
                  </Button>
                ) : (
                  <Button key="review-project" type="button" onClick={() => void submit()}>
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
