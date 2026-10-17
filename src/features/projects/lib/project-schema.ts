import { z } from "zod";
import type { FieldPath } from "react-hook-form";
import { PROJECT_AMENITIES } from "@/features/projects/data/project-catalogs";
import { isConsistentLocation } from "@/shared/data/peru-locations";
import {
  MAX_PLAN_FILES,
  MAX_PROJECT_IMAGES,
  MAX_RENDER_IMAGES,
  MIN_DESCRIPTION_LENGTH,
  type ProjectDraft,
} from "@/features/projects/types/draft";

const CATEGORY_KEYS = ["lotizacion"] as const;
const STAGE_KEYS = ["preventa", "en-construccion", "entregado"] as const;
const CURRENCY_KEYS = ["PEN", "USD"] as const;
const LOT_MODE_KEYS = ["individual", "grupo"] as const;
const LOT_STATUS_KEYS = ["disponible", "reservado", "vendido", "bloqueado"] as const;
const SERVICE_KEYS = [
  "habilitacion-urbana",
  "titulo-propiedad",
  "agua",
  "electricidad",
  "desague",
  "pistas",
  "alumbrado-publico",
  "gas-natural",
] as const;
const AMENITY_KEYS = new Set(PROJECT_AMENITIES.map((amenity) => amenity.value));

const AMOUNT_UNITS: Record<string, string> = {
  priceFrom: "precio desde",
  priceTo: "precio hasta",
  downPayment: "cuota inicial",
  monthlyPayment: "cuota mensual",
};

/**
 * `File` no es un global fiable en todos los runtimes donde se importa este
 * módulo, así que la forma del archivo se comprueba por estructura. El tipo
 * MIME exacto y el peso los rechaza el `Uploader` con feedback por archivo.
 */
function isFileLike(value: unknown): value is File {
  return (
    typeof value === "object" &&
    value !== null &&
    "name" in value &&
    "size" in value &&
    "type" in value
  );
}

const fileSchema = z.custom<File>(isFileLike);

const requiredText = (message: string) => z.string().trim().min(1, message);

const optionalText = () =>
  z
    .string()
    .trim()
    .transform((value) => (value === "" ? undefined : value))
    .optional();

const optionalUrl = (label: string) =>
  z
    .string()
    .trim()
    .refine((value) => value === "" || z.url().safeParse(value).success, {
      message: `Ingresa un enlace válido de ${label}`,
    })
    .transform((value) => (value === "" ? undefined : value))
    .optional();

/**
 * Los importes se declaran opcionales porque el input arranca vacío (`undefined`
 * es su estado "sin llenar"). La obligatoriedad de precio desde/hasta la
 * comprueba el `superRefine` del objeto, para no marcar el campo como requerido.
 */
function amount(field: keyof typeof AMOUNT_UNITS) {
  const label = AMOUNT_UNITS[field];
  return z
    .number({ error: `Ingresa el ${label}` })
    .positive(`El ${label} debe ser mayor a 0`)
    .optional();
}

const optionalCount = (label: string) =>
  z
    .number({ error: `Ingresa ${label}` })
    .int(`Ingresa un número entero en ${label}`)
    .min(0, `${label} no puede ser negativo`)
    .optional();

const isoDate = (message: string) => z.string().regex(/^\d{4}-\d{2}-\d{2}$/, message);
const optionalIsoDate = (message: string) => z.union([z.literal(""), isoDate(message)]);

const lotSchema = z.object({
  lotNumber: z.string().trim(),
  block: optionalText(),
  areaM2: z
    .number({ error: "Ingresa el área del lote" })
    .positive("El área debe ser mayor a 0")
    .optional(),
  frontM: z
    .number({ error: "Ingresa el frente en metros" })
    .positive("El frente debe ser mayor a 0")
    .optional(),
  price: z
    .number({ error: "Ingresa el precio del lote" })
    .positive("El precio debe ser mayor a 0")
    .optional(),
  status: z.enum(LOT_STATUS_KEYS),
  planLocation: optionalText(),
  lotCount: z
    .number({ error: "Ingresa la cantidad de lotes" })
    .int("La cantidad de lotes debe ser un número entero")
    .positive("La cantidad de lotes debe ser mayor a 0")
    .optional(),
});

type LotShape = z.infer<typeof lotSchema>;

/** Una fila sin nada cargado no bloquea: solo se validan las fichas empezadas. */
function isBlankLot(lot: Partial<LotShape>): boolean {
  return (
    !lot.lotNumber?.trim() &&
    !lot.block?.trim() &&
    !lot.planLocation?.trim() &&
    lot.areaM2 === undefined &&
    lot.frontM === undefined &&
    lot.price === undefined &&
    lot.lotCount === undefined
  );
}

const lotsSchema = z.array(lotSchema).superRefine((rows, context) => {
  let filled = 0;

  rows.forEach((row, index) => {
    if (isBlankLot(row)) {
      return;
    }

    filled += 1;

    if (!row.lotNumber.trim()) {
      context.addIssue({
        code: "custom",
        path: [index, "lotNumber"],
        message: "Ingresa el número del lote",
      });
    }

    if (row.areaM2 === undefined) {
      context.addIssue({
        code: "custom",
        path: [index, "areaM2"],
        message: "Ingresa el área del lote",
      });
    }

    if (row.price === undefined) {
      context.addIssue({
        code: "custom",
        path: [index, "price"],
        message: "Ingresa el precio del lote",
      });
    }
  });

  if (filled === 0) {
    context.addIssue({
      code: "custom",
      path: [],
      message: "Agrega al menos un lote al inventario",
    });
  }
});

const milestoneSchema = z.object({
  title: z.string().trim(),
  date: z.string().trim(),
  note: optionalText(),
});

/** Igual que los lotes: los hitos en blanco se ignoran, los parciales se(validan). */
const milestonesSchema = z.array(milestoneSchema).superRefine((rows, context) => {
  rows.forEach((row, index) => {
    const hasTitle = Boolean(row.title?.trim());
    const hasDate = Boolean(row.date?.trim());

    if (hasTitle && !hasDate) {
      context.addIssue({
        code: "custom",
        path: [index, "date"],
        message: "Elige la fecha del hito",
      });
    }

    if (hasDate && !hasTitle) {
      context.addIssue({
        code: "custom",
        path: [index, "title"],
        message: "Describe el hito",
      });
    }
  });
});

const dateMessage = "Usa el formato de fecha del navegador";

export const projectDraftSchema = z
  .object({
    category: z.enum(CATEGORY_KEYS, { error: "Elige el tipo de propiedad" }),
    stage: z.enum(STAGE_KEYS, { error: "Elige la fase actual" }),
    name: requiredText("Ingresa el nombre del proyecto"),
    description: z
      .string()
      .trim()
      .min(
        MIN_DESCRIPTION_LENGTH,
        `Describe el proyecto con al menos ${MIN_DESCRIPTION_LENGTH} caracteres`,
      ),
    currency: z.enum(CURRENCY_KEYS, { error: "Elige la moneda del proyecto" }),
    priceFrom: amount("priceFrom"),
    priceTo: amount("priceTo"),

    // Se conserva como `string`: el RUC vacío se limpia en el payload, no en el
    // schema, para que la salida siga siendo asignable a `ProjectDraft`.
    ruc: z
      .string()
      .trim()
      .refine((value) => value === "" || /^\d{11}$/.test(value), "El RUC debe tener 11 dígitos"),
    businessName: optionalText(),
    downPayment: amount("downPayment"),
    monthlyPayment: amount("monthlyPayment"),
    financing: z.array(z.string()),
    totalBlocks: optionalCount("el total de manzanas"),
    totalLots: optionalCount("el total de lotes"),

    social: z.object({
      instagram: optionalUrl("Instagram"),
      tiktok: optionalUrl("TikTok"),
      facebook: optionalUrl("Facebook"),
      website: optionalUrl("la web"),
    }),
    services: z.array(z.enum(SERVICE_KEYS)),
    urbanizationName: optionalText(),
    registryEntry: optionalText(),
    amenities: z
      .array(z.string())
      .min(1, "Selecciona al menos una amenidad")
      .refine(
        (values) => values.every((value) => AMENITY_KEYS.has(value)),
        "Hay amenidades que ya no están disponibles",
      ),

    department: requiredText("Selecciona el departamento"),
    province: requiredText("Selecciona la provincia"),
    district: requiredText("Selecciona el distrito"),
    zone: optionalText(),
    street: z.string().trim(),
    streetNumber: z.string().trim(),
    lat: z
      .number({ error: "Ingresa la latitud" })
      .min(-90, "La latitud va de -90 a 90")
      .max(90, "La latitud va de -90 a 90")
      .optional(),
    lng: z
      .number({ error: "Ingresa la longitud" })
      .min(-180, "La longitud va de -180 a 180")
      .max(180, "La longitud va de -180 a 180")
      .optional(),

    lotMode: z.enum(LOT_MODE_KEYS),
    lots: lotsSchema,

    constructionStart: optionalIsoDate(dateMessage),
    estimatedDelivery: isoDate("Elige la fecha estimada de entrega"),
    milestones: milestonesSchema,
    certifications: z.array(z.string()),

    keptMedia: z.array(
      z.object({
        type: z.enum(["IMAGE", "FLOOR_PLAN", "RENDER"]),
        url: z.string(),
        publicId: z.string().nullable().optional(),
      }),
    ),
    images: z.array(fileSchema).max(MAX_PROJECT_IMAGES, `Máximo ${MAX_PROJECT_IMAGES} imágenes`),
    plans: z.array(fileSchema).max(MAX_PLAN_FILES, `Máximo ${MAX_PLAN_FILES} planos`),
    tourUrl: optionalUrl("recorrido virtual"),
    tourVideo: fileSchema.optional(),
    renderImages: z.array(fileSchema).max(MAX_RENDER_IMAGES, `Máximo ${MAX_RENDER_IMAGES} renders`),
  })
  .superRefine((draft, context) => {
    const keptImages = draft.keptMedia.filter((media) => media.type === "IMAGE").length;
    if (draft.images.length + keptImages === 0) {
      context.addIssue({
        code: "custom",
        path: ["images"],
        message: "Agrega al menos una imagen del proyecto",
      });
    }
    if (draft.images.length + keptImages > MAX_PROJECT_IMAGES) {
      context.addIssue({
        code: "custom",
        path: ["images"],
        message: `Máximo ${MAX_PROJECT_IMAGES} imágenes`,
      });
    }

    for (const field of ["priceFrom", "priceTo"] as const) {
      if (draft[field] === undefined) {
        context.addIssue({
          code: "custom",
          path: [field],
          message: `Ingresa el ${AMOUNT_UNITS[field]}`,
        });
      }
    }

    if (
      draft.priceFrom !== undefined &&
      draft.priceTo !== undefined &&
      draft.priceTo < draft.priceFrom
    ) {
      context.addIssue({
        code: "custom",
        path: ["priceTo"],
        message: "El precio hasta no puede ser menor que el precio desde",
      });
    }

    if (draft.lat === undefined) {
      context.addIssue({
        code: "custom",
        path: ["lat"],
        message: "Fija la ubicación en el mapa o ingresa la latitud",
      });
    }

    if (draft.lng === undefined) {
      context.addIssue({
        code: "custom",
        path: ["lng"],
        message: "Fija la ubicación en el mapa o ingresa la longitud",
      });
    }

    if (draft.ruc && !draft.businessName?.trim()) {
      context.addIssue({
        code: "custom",
        path: ["businessName"],
        message: "Ingresa la razón social del titular del RUC",
      });
    }

    if (draft.lotMode === "grupo") {
      draft.lots.forEach((lot, index) => {
        if (isBlankLot(lot) || lot.lotCount !== undefined) {
          return;
        }

        context.addIssue({
          code: "custom",
          path: ["lots", index, "lotCount"],
          message: "Ingresa cuántos lotes cubre el grupo",
        });
      });
    }

    if (draft.department && draft.province && draft.district) {
      if (!isConsistentLocation(draft.department, draft.province, draft.district)) {
        context.addIssue({
          code: "custom",
          path: ["district"],
          message: `El distrito ${draft.district} no pertenece a ${draft.province}`,
        });
      }
    }

    const start = draft.constructionStart ?? "";
    const delivery = draft.estimatedDelivery ?? "";

    if (start && delivery && delivery < start) {
      context.addIssue({
        code: "custom",
        path: ["estimatedDelivery"],
        message: "La entrega no puede ser anterior al inicio de construcción",
      });
    }
  });

const STEP_ONE_FIELDS = [
  "category",
  "stage",
  "name",
  "description",
  "currency",
  "priceFrom",
  "priceTo",
  "ruc",
  "businessName",
  "downPayment",
  "monthlyPayment",
  "financing",
  "totalBlocks",
  "totalLots",
  "social.instagram",
  "social.tiktok",
  "social.facebook",
  "social.website",
  "services",
  "urbanizationName",
  "registryEntry",
  "amenities",
] as const satisfies readonly FieldPath<ProjectDraft>[];

const STEP_TWO_FIELDS = [
  "department",
  "province",
  "district",
  "zone",
  "street",
  "streetNumber",
  "lat",
  "lng",
] as const satisfies readonly FieldPath<ProjectDraft>[];

const STEP_THREE_FIELDS = ["lotMode", "lots"] as const satisfies readonly FieldPath<ProjectDraft>[];

const STEP_FOUR_FIELDS = [
  "constructionStart",
  "estimatedDelivery",
  "milestones",
  "certifications",
] as const satisfies readonly FieldPath<ProjectDraft>[];

const STEP_FIVE_FIELDS = [
  "images",
  "plans",
  "tourUrl",
  "tourVideo",
  "renderImages",
] as const satisfies readonly FieldPath<ProjectDraft>[];

export interface WizardStep {
  key: string;
  title: string;
  fields: readonly FieldPath<ProjectDraft>[];
}

export const WIZARD_STEPS: readonly WizardStep[] = [
  { key: "info", title: "Información y financiamiento", fields: STEP_ONE_FIELDS },
  { key: "location", title: "Ubicación del inmueble", fields: STEP_TWO_FIELDS },
  { key: "lots", title: "Inventario de lotes", fields: STEP_THREE_FIELDS },
  { key: "timeline", title: "Timeline del proyecto", fields: STEP_FOUR_FIELDS },
  { key: "media", title: "Imágenes y video", fields: STEP_FIVE_FIELDS },
];

export const LAST_STEP_INDEX = WIZARD_STEPS.length - 1;
