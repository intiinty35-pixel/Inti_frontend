import type { ApiPropertyType } from "@/features/listings/types/listing";

export interface NumericFieldConfig {
  key:
    | "totalArea"
    | "constructedArea"
    | "bedrooms"
    | "bathrooms"
    | "halfBathrooms"
    | "parkingSpaces"
    | "floor"
    | "floors"
    | "constructionYear";
  label: string;
  required?: boolean;
}

export interface PropertyFormConfig {
  label: string;
  fields: NumericFieldConfig[];
  amenities: string[];
}

export const PROPERTY_TYPE_OPTIONS: Array<{ value: ApiPropertyType; label: string }> = [
  { value: "APARTMENT", label: "Departamento" },
  { value: "HOUSE", label: "Casa" },
  { value: "LAND", label: "Terreno/Lote" },
  { value: "OFFICE", label: "Oficina" },
  { value: "COMMERCIAL", label: "Local comercial" },
  { value: "WAREHOUSE", label: "Almacén/Bodega" },
  { value: "ROOM", label: "Habitación" },
];

export const PROPERTY_FORM_CONFIG: Record<ApiPropertyType, PropertyFormConfig> = {
  APARTMENT: {
    label: "Departamento",
    fields: [
      { key: "totalArea", label: "Área total", required: true },
      { key: "constructedArea", label: "Área construida", required: true },
      { key: "bedrooms", label: "Dormitorios", required: true },
      { key: "bathrooms", label: "Baños", required: true },
      { key: "halfBathrooms", label: "Medios baños" },
      { key: "parkingSpaces", label: "Estacionamientos" },
      { key: "floor", label: "Piso", required: true },
      { key: "constructionYear", label: "Año construido" },
    ],
    amenities: ["Balcon", "Terraza", "Ascensor", "Seguridad 24/7", "Mascotas", "Gimnasio", "BBQ"],
  },
  HOUSE: {
    label: "Casa",
    fields: [
      { key: "totalArea", label: "Área de terreno", required: true },
      { key: "constructedArea", label: "Área construida", required: true },
      { key: "bedrooms", label: "Dormitorios", required: true },
      { key: "bathrooms", label: "Baños", required: true },
      { key: "halfBathrooms", label: "Medios baños" },
      { key: "parkingSpaces", label: "Estacionamientos" },
      { key: "floors", label: "Número de pisos" },
      { key: "constructionYear", label: "Año construido" },
    ],
    amenities: ["Jardin", "Terraza", "Piscina", "BBQ", "Cuarto de servicio", "Deposito", "Seguridad 24/7"],
  },
  LAND: {
    label: "Terreno/Lote",
    fields: [{ key: "totalArea", label: "Área total", required: true }],
    amenities: ["Acceso vial", "Agua", "Electricidad", "Zonificacion", "Uso comercial", "Cerco perimetrico"],
  },
  OFFICE: {
    label: "Oficina",
    fields: [
      { key: "totalArea", label: "Área", required: true },
      { key: "bathrooms", label: "Baños", required: true },
      { key: "floor", label: "Piso" },
      { key: "parkingSpaces", label: "Estacionamientos" },
    ],
    amenities: ["Recepcion", "Ascensor", "Aire acondicionado", "Seguridad 24/7", "Amoblada"],
  },
  COMMERCIAL: {
    label: "Local comercial",
    fields: [
      { key: "totalArea", label: "Área total", required: true },
      { key: "constructedArea", label: "Área construida" },
      { key: "bathrooms", label: "Baños" },
      { key: "floor", label: "Piso" },
      { key: "parkingSpaces", label: "Estacionamientos" },
    ],
    amenities: ["Acceso a calle", "Deposito", "Seguridad", "Energia trifasica", "Frente comercial"],
  },
  WAREHOUSE: {
    label: "Almacén/Bodega",
    fields: [
      { key: "totalArea", label: "Área de terreno", required: true },
      { key: "constructedArea", label: "Área techada" },
      { key: "bathrooms", label: "Baños" },
      { key: "parkingSpaces", label: "Estacionamientos" },
    ],
    amenities: ["Patio de maniobras", "Acceso camiones", "Seguridad", "Oficinas internas", "Energia"],
  },
  ROOM: {
    label: "Habitación",
    fields: [
      { key: "totalArea", label: "Área", required: true },
      { key: "bedrooms", label: "Ambientes", required: true },
      { key: "bathrooms", label: "Baños" },
    ],
    amenities: ["Amoblada", "Servicios incluidos", "Cocina compartida", "Lavanderia", "Mascotas"],
  },
};

export function amenityCode(label: string) {
  return label
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}
