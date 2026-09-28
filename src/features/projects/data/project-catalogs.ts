import type { ChipOption, RadioOption } from "@/shared/ui";
import type {
  LotMode,
  LotStatus,
  ProjectCategory,
  ProjectStage,
  ServiceKey,
} from "@/features/projects/types/draft";

export const PROJECT_CATEGORIES: readonly RadioOption[] = [
  { value: "lotizacion", label: "Lotización" },
  { value: "edificio", label: "Edificio", comingSoon: true },
  { value: "casas", label: "Casas", comingSoon: true },
  { value: "comercial", label: "Comercial", comingSoon: true },
];

export const PROJECT_CATEGORY_LABELS: Record<ProjectCategory, string> = {
  lotizacion: "Lotización",
};

export const PROJECT_STAGES: readonly RadioOption[] = [
  { value: "preventa", label: "Preventa" },
  { value: "en-construccion", label: "En construcción" },
  { value: "entregado", label: "Entregado" },
];

export const PROJECT_STAGE_LABELS: Record<ProjectStage, string> = {
  preventa: "Preventa",
  "en-construccion": "En construcción",
  entregado: "Entregado",
};

export const LOT_MODES: readonly RadioOption[] = [
  {
    value: "individual",
    label: "Lotes individuales",
    description: "Cada ficha describe un lote concreto del máster plan.",
  },
  {
    value: "grupo",
    label: "Lotes por grupo",
    description: "Cada ficha describe un grupo de lotes de la misma manzana.",
  },
];

export const LOT_MODE_LABELS: Record<LotMode, string> = {
  individual: "Lote individual",
  grupo: "Grupo de lotes",
};

export const LOT_STATUSES: readonly RadioOption[] = [
  { value: "disponible", label: "Disponible" },
  { value: "reservado", label: "Reservado" },
  { value: "vendido", label: "Vendido" },
  { value: "bloqueado", label: "Bloqueado" },
];

export const LOT_STATUS_LABELS: Record<LotStatus, string> = {
  disponible: "Disponible",
  reservado: "Reservado",
  vendido: "Vendido",
  bloqueado: "Bloqueado",
};

export const LOT_STATUS_TONES: Record<LotStatus, string> = {
  disponible: "bg-success/10 text-success",
  reservado: "bg-warning/10 text-warning",
  vendido: "bg-ink/10 text-ink",
  bloqueado: "bg-error/10 text-error",
};

export const PROJECT_SERVICES: readonly (ChipOption & { key: ServiceKey })[] = [
  { key: "habilitacion-urbana", value: "habilitacion-urbana", label: "Habilitación urbana" },
  { key: "titulo-propiedad", value: "titulo-propiedad", label: "Título de propiedad" },
  { key: "agua", value: "agua", label: "Agua" },
  { key: "electricidad", value: "electricidad", label: "Electricidad" },
  { key: "desague", value: "desague", label: "Desagüe" },
  { key: "pistas", value: "pistas", label: "Pistas" },
  { key: "alumbrado-publico", value: "alumbrado-publico", label: "Alumbrado público" },
  { key: "gas-natural", value: "gas-natural", label: "Gas natural" },
];

export const PROJECT_SERVICE_LABELS: Record<ServiceKey, string> = PROJECT_SERVICES.reduce<
  Record<ServiceKey, string>
>((labels, service) => {
  labels[service.key] = service.label;
  return labels;
}, {} as Record<ServiceKey, string>);

export const PROJECT_AMENITIES: readonly ChipOption[] = [
  { value: "parques", label: "Parques y áreas verdes" },
  { value: "zona-bbp", label: "Zona BBP" },
  { value: "porton-de-ingreso", label: "Portón de ingreso" },
  { value: "seguridad-24-7", label: "Seguridad 24/7" },
  { value: "club-house", label: "Club house" },
  { value: "pista-atletica", label: "Pista atlética" },
  { value: "piscina", label: "Piscina" },
  { value: "gimnasio", label: "Gimnasio" },
  { value: "cancha-deportiva", label: "Cancha deportiva" },
  { value: "areas-infantiles", label: "Áreas infantiles" },
  { value: "juegos-infantiles", label: "Juegos infantiles" },
  { value: "ciclopista", label: "Ciclopista" },
  { value: "estacionamiento", label: "Estacionamiento" },
  { value: "areas-comunes", label: "Áreas comunes" },
  { value: "jardinera", label: "Jardinera central" },
  { value: "paseo-peatonal", label: "Paseo peatonal" },
  { value: "mirador", label: "Mirador" },
  { value: "gimnasio-exterior", label: "Gimnasio al aire libre" },
  { value: "recepcion", label: "Recepción y vigilancia" },
  { value: "oficina-de-ventas", label: "Oficina de ventas" },
  { value: "acceso-a-carretera", label: "Acceso directo a carretera" },
];

export const PROJECT_AMENITY_LABELS: Record<string, string> = PROJECT_AMENITIES.reduce<
  Record<string, string>
>((labels, amenity) => {
  labels[amenity.value] = amenity.label;
  return labels;
}, {});
