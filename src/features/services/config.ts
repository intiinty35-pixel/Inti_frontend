import type { ComponentType, SVGProps } from "react";
import {
  BuildingIcon,
  CameraIcon,
  ChartIcon,
  CheckCircleIcon,
  FileIcon,
  HomeIcon,
  MapIcon,
  PinIcon,
  RulerIcon,
  SearchIcon,
  SparkleIcon,
  StoreIcon,
  UserIcon,
} from "@/shared/ui/icons";
import { ARIZ_WHATSAPP_DIGITS as SHARED_ARIZ_WHATSAPP_DIGITS } from "@/shared/lib/whatsapp";

export type ServiceIcon = ComponentType<SVGProps<SVGSVGElement>>;
export const ARIZ_WHATSAPP_DIGITS = SHARED_ARIZ_WHATSAPP_DIGITS;

export function buildServiceWhatsappUrl(serviceName: string): string {
  const message = `Hola ARIZ Proyectos, quiero cotizar el servicio de ${serviceName} para mi proyecto inmobiliario`;
  return `https://wa.me/${ARIZ_WHATSAPP_DIGITS}?text=${encodeURIComponent(message)}`;
}

export const SERVICES_CONTACT_HREF = "#contacto";

export const SERVICES_HERO_IMAGE = "/servicios/servicios.png?v=2";

export const SERVICE_IMAGE_FALLBACK =
  "linear-gradient(135deg, #0B1B5C 0%, #00124f 100%)";


export interface ServiceItem {
  key: string;
  name: string;
  title: string;
  description: string;
  bullets: readonly string[];
  icon: ServiceIcon;
  image: string;
  imageAlt: string;
}

export const SERVICES: readonly ServiceItem[] = [
  {
    key: "prospeccion",
    name: "Prospección",
    title: "Prospección y evaluación de terrenos",
    description:
      "Identificamos el terreno correcto para tu proyecto y validamos su potencial real antes de invertir, con datos de mercado y parámetros urbanísticos sobre la mesa.",
    bullets: [
      "Búsqueda y evaluación de terrenos y lotes",
      "Estudio de mercado y análisis de factibilidad",
      "Revisión de zonificación y parámetros urbanísticos",
      "Identificación de oportunidades de inversión",
    ],
    icon: SearchIcon,
    image: "/servcios/teerrenos).jpg",
    imageAlt:
      "Equipo de ARIZ Proyectos revisando planos sobre un terreno durante la evaluación de un lote",
  },
  {
    key: "legal",
    name: "Legal",
    title: "Asesoría legal para tu proyecto",
    description:
      "Ordenamos la parte legal del proyecto para que puedas vender con tranquilidad: títulos saneados, contratos claros y expedientes listos para su inscripción.",
    bullets: [
      "Estudio de títulos y saneamiento legal",
      "Contratos de compraventa y promesas",
      "Inscripciones en SUNARP",
      "Habilitación urbana, licencias y conformidad de obra",
    ],
    icon: FileIcon,
    image: "/servcios/legal.jpg",
    imageAlt:
      "Abogados firmando contratos junto a la maqueta de un proyecto inmobiliario",
  },
  {
    key: "contable",
    name: "Contable",
    title: "Gestión contable y financiera",
    description:
      "Ponemos en orden los números del proyecto con una estructura tributaria eficiente y reportes financieros claros para inversionistas y entidades bancarias.",
    bullets: [
      "Estructuración tributaria del proyecto",
      "Declaraciones y cumplimiento ante SUNAT",
      "Flujo de caja y control de costos",
      "Informes financieros para inversionistas y bancos",
    ],
    icon: ChartIcon,
    image: "/servcios/contable.jpg",
    imageAlt:
      "Contador revisando reportes financieros en su laptop durante el control contable de un proyecto",
  },
];

export interface TrustLogo {
  key: string;
  label: string;
  /** Iniciales que se dibujan mientras no haya logo oficial en Cloudinary. */
  initials: string;
  icon: ServiceIcon;
}

/** Instituciones con las que ARIZ trabaja a diario. */
export const TRUST_LOGOS: readonly TrustLogo[] = [
  { key: "sunat", label: "SUNAT", initials: "SU", icon: BuildingIcon },
  { key: "sunarp", label: "SUNARP", initials: "SR", icon: FileIcon },
  { key: "bcp", label: "BCP", initials: "BC", icon: StoreIcon },
  { key: "notarias", label: "Notarías", initials: "NO", icon: UserIcon },
  { key: "municipalidades", label: "Municipalidades", initials: "MU", icon: HomeIcon },
  { key: "bancos", label: "Bancos y financieras", initials: "BF", icon: ChartIcon },
];

export interface Capability {
  key: string;
  title: string;
  description: string;
  icon: ServiceIcon;
}

/** Fila 2: todo lo que un proyecto inmobiliario necesita dia a dia. */
export const PROJECT_CAPABILITIES: readonly Capability[] = [
  {
    key: "prospeccion",
    title: "Prospección de terrenos",
    description: "Encontramos el lote ideal para tu proyecto.",
    icon: SearchIcon,
  },
  {
    key: "ventas",
    title: "Ventas",
    description: "Equipo comercial enfocado en cerrar operaciones.",
    icon: PinIcon,
  },
  {
    key: "marketing",
    title: "Marketing inmobiliario",
    description: "Campañas y contenido que atraen compradores reales.",
    icon: CameraIcon,
  },
  {
    key: "corretaje",
    title: "Corretaje",
    description: "Intermediación profesional en cada compraventa.",
    icon: HomeIcon,
  },
  {
    key: "comercial",
    title: "Gestión comercial",
    description: "Estrategia, precios y metas bajo un mismo plan.",
    icon: ChartIcon,
  },
  {
    key: "inversion",
    title: "Asesoría de inversión",
    description: "Rentabilidad proyectada y escenarios de retorno.",
    icon: SparkleIcon,
  },
];

/** Fila 3: el respaldo integral que acompaña al desarrollador. */
export const INTEGRAL_SUPPORT: readonly Capability[] = [
  {
    key: "legal",
    title: "Legal",
    description: "Contratos y títulos revisados por especialistas.",
    icon: FileIcon,
  },
  {
    key: "contable",
    title: "Contable",
    description: "Tributación y reportes siempre al día.",
    icon: ChartIcon,
  },
  {
    key: "saneamiento",
    title: "Saneamiento",
    description: "Partidas y habilitaciones listas para inscribir.",
    icon: CheckCircleIcon,
  },
  {
    key: "tramites",
    title: "Trámites y licencias",
    description: "Gestionamos expedientes ante cada entidad.",
    icon: RulerIcon,
  },
  {
    key: "financiamiento",
    title: "Financiamiento",
    description: "Vinculación con bancos y fuentes de capital.",
    icon: StoreIcon,
  },
  {
    key: "postventa",
    title: "Postventa",
    description: "Acompañamos al cliente después de la entrega.",
    icon: MapIcon,
  },
];
