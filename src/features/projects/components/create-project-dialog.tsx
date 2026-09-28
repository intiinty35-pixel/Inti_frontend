"use client";

import { useCallback, useMemo, useState } from "react";
import { FormProvider, useForm, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/shared/ui/button";
import { Modal } from "@/shared/ui/modal";
import { WizardStepper, type StepStatus, type WizardStepMeta } from "@/shared/ui/stepper";
import { ArrowRightIcon, ChevronLeftIcon } from "@/shared/ui/icons";
import { buildProjectPayload, type CreateProjectPayload } from "@/features/projects/api";
import { countStepErrors, PROJECT_DRAFT_DEFAULTS } from "@/features/projects/lib/project-draft";
import { LAST_STEP_INDEX, WIZARD_STEPS, projectDraftSchema } from "@/features/projects/lib/project-schema";
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

export interface CreateProjectDialogProps {
  open: boolean;
  previewProjects: readonly ProjectPreview[];
  onSave: (payload: CreateProjectPayload) => void;
  onClose: () => void;
}

export function CreateProjectDialog({ open, previewProjects, onSave, onClose }: CreateProjectDialogProps) {
  const form = useForm<ProjectDraft>({
    resolver: zodResolver(projectDraftSchema),
    defaultValues: PROJECT_DRAFT_DEFAULTS,
    mode: "onTouched",
  });

  const {
    trigger,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isDirty, isValidating },
  } = form;

  const [step, setStep] = useState(0);
  const [payload, setPayload] = useState<CreateProjectPayload | null>(null);
  const [reviewedLots, setReviewedLots] = useState<readonly LotDraft[]>([]);

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

  const closeAndReset = useCallback(() => {
    reset(PROJECT_DRAFT_DEFAULTS);
    setStep(0);
    setPayload(null);
    setReviewedLots([]);
    onClose();
  }, [onClose, reset]);

  const saveAndClose = useCallback(
    (reviewed: CreateProjectPayload) => {
      onSave(reviewed);
      closeAndReset();
    },
    [closeAndReset, onSave],
  );

  const requestClose = useCallback(() => {
    if (isValidating) {
      return;
    }

    if (isDirty && !payload) {
      const confirmed = window.confirm("Hay cambios sin guardar. ¿Cerrar de todas formas?");

      if (!confirmed) {
        return;
      }
    }

    closeAndReset();
  }, [closeAndReset, isDirty, isValidating, payload]);

  // Se congela el inventario al revisar: el resumen no debe depender de un
  // `watch` en vivo, que el compilador de React no puede memoizar.
  const submit = () =>
    handleSubmit((draft) => {
      setReviewedLots(getValues("lots"));
      setPayload(buildProjectPayload(draft));
    })();

  const StepComponent = STEP_COMPONENTS[step];

  const footer = payload ? null : (
    <div className="flex w-full items-center justify-between gap-3">
      <Button type="button" variant="ghost" onClick={goBack} disabled={step === 0}>
        <ChevronLeftIcon className="h-4 w-4" />
        Anterior
      </Button>

      <div className="flex items-center gap-3">
        <p className="hidden text-xs text-muted sm:block" aria-live="polite">
          Paso {step + 1} de {WIZARD_STEPS.length}
        </p>

        {step < LAST_STEP_INDEX ? (
          <Button type="button" onClick={() => void goNext()}>
            Continuar
            <ArrowRightIcon className="h-4 w-4" />
          </Button>
        ) : (
          <Button type="submit" form="create-project-form">
            Revisar proyecto
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <Modal
      open={open}
      onClose={requestClose}
      title={payload ? "Resumen del proyecto" : "Nuevo proyecto de lotización"}
      description={
        payload
          ? undefined
          : "Completa los cinco pasos. Puedes volver atrás en cualquier momento; solo se valida el paso en el que estás."
      }
      size="xl"
      footer={footer}
      className="h-[min(92vh,880px)]"
    >
      {payload ? (
        <ProjectReview
          payload={payload}
          lots={reviewedLots}
          previewProjects={previewProjects}
          onSave={saveAndClose}
          onDone={closeAndReset}
        />
      ) : (
        <FormProvider {...form}>
          <form
            id="create-project-form"
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              void submit();
            }}
            className="flex h-full min-h-0 gap-6"
          >
            <aside className="hidden w-60 shrink-0 overflow-y-auto border-r border-edge pr-4 lg:block">
              <WizardStepper
                steps={stepMeta}
                statuses={statuses}
                errorCounts={errorCounts}
                activeIndex={step}
                onSelect={goToStep}
              />
            </aside>

            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
              <div className="mb-5 lg:hidden">
                <WizardStepper
                  steps={stepMeta}
                  statuses={statuses}
                  errorCounts={errorCounts}
                  activeIndex={step}
                  onSelect={goToStep}
                />
              </div>

              <div aria-live="polite" className="sr-only">
                {`Paso ${step + 1} de ${WIZARD_STEPS.length}: ${stepMeta[step].title}`}
              </div>

              <StepComponent />
            </div>
          </form>
        </FormProvider>
      )}
    </Modal>
  );
}
