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

export interface SpecificFieldConfig {
  key: string;
  label: string;
  type: "number" | "text" | "boolean" | "select";
  options?: string[];
}

export interface PropertyFormConfig {
  label: string;
  hint: string;
  fields: NumericFieldConfig[];
  specificFields: SpecificFieldConfig[];
  amenities: string[];
}

export const PROPERTY_TYPE_OPTIONS: Array<{ value: ApiPropertyType; label: string; hint: string }> = [
  { value: "APARTMENT", label: "Departamento", hint: "Unidad en edificio" },
  { value: "HOUSE", label: "Casa", hint: "Vivienda independiente" },
  { value: "LAND", label: "Terreno / Lote", hint: "Suelo urbano o rural" },
  { value: "OFFICE", label: "Oficina", hint: "Espacio corporativo" },
  { value: "COMMERCIAL", label: "Local comercial", hint: "Venta o atencion" },
  { value: "ROOM", label: "Habitacion", hint: "Alquiler simple" },
  { value: "WAREHOUSE", label: "Industrial / Almacen", hint: "Operacion y logistica" },
  { value: "PARKING", label: "Cochera", hint: "Estacionamiento" },
];

export const PROPERTY_FORM_CONFIG: Record<ApiPropertyType, PropertyFormConfig> = {
  APARTMENT: {
    label: "Departamento",
    hint: "Incluye distribucion, edificio, estacionamiento y areas comunes.",
    fields: [
      { key: "totalArea", label: "Area total m2", required: true },
      { key: "constructedArea", label: "Area techada m2", required: true },
      { key: "bedrooms", label: "Dormitorios", required: true },
      { key: "bathrooms", label: "Banos", required: true },
      { key: "parkingSpaces", label: "Estacionamientos" },
      { key: "floor", label: "Piso del departamento", required: true },
      { key: "floors", label: "Pisos del edificio" },
      { key: "constructionYear", label: "Ano construido" },
    ],
    specificFields: [
      { key: "livingRoom", label: "Sala", type: "boolean" },
      { key: "diningRoom", label: "Comedor", type: "boolean" },
      { key: "laundry", label: "Lavanderia", type: "boolean" },
      { key: "serviceRoom", label: "Cuarto de servicio", type: "boolean" },
      { key: "serviceBathroom", label: "Bano de servicio", type: "boolean" },
      { key: "unitsPerFloor", label: "Departamentos por piso", type: "number" },
      { key: "elevators", label: "Cantidad de ascensores", type: "number" },
      { key: "parkingType", label: "Tipo de estacionamiento", type: "select", options: ["Paralelo", "Lineal", "Independiente"] },
      { key: "viewType", label: "Vista", type: "select", options: ["Exterior", "Interior", "Mixta"] },
    ],
    amenities: ["Balcon", "Terraza", "Ascensor", "Seguridad 24/7", "Mascotas", "Gimnasio", "BBQ", "Piscina", "Coworking", "Lobby"],
  },
  HOUSE: {
    label: "Casa",
    hint: "Enfocado en area de terreno, ambientes, exteriores y cochera.",
    fields: [
      { key: "totalArea", label: "Area de terreno m2", required: true },
      { key: "constructedArea", label: "Area construida m2", required: true },
      { key: "bedrooms", label: "Dormitorios", required: true },
      { key: "bathrooms", label: "Banos", required: true },
      { key: "parkingSpaces", label: "Vehiculos" },
      { key: "floors", label: "Numero de pisos" },
      { key: "constructionYear", label: "Ano construido" },
    ],
    specificFields: [
      { key: "freeArea", label: "Area libre m2", type: "number" },
      { key: "frontLength", label: "Frente del terreno ml", type: "number" },
      { key: "depthLength", label: "Fondo del terreno ml", type: "number" },
      { key: "study", label: "Estudio", type: "boolean" },
      { key: "serviceRoom", label: "Cuarto de servicio", type: "boolean" },
      { key: "condominium", label: "En condominio", type: "boolean" },
      { key: "maintenance", label: "Mantenimiento", type: "number" },
    ],
    amenities: ["Jardin", "Patio", "Terraza", "Piscina", "Azotea", "Parrilla", "Amoblada", "Gas natural", "Pet friendly", "Seguridad"],
  },
  LAND: {
    label: "Terreno / Lote",
    hint: "Sin dormitorios ni cocina; prioriza medidas, zonificacion y documentacion.",
    fields: [{ key: "totalArea", label: "Area total m2", required: true }],
    specificFields: [
      { key: "frontLength", label: "Frente ml", type: "number" },
      { key: "depthLength", label: "Fondo ml", type: "number" },
      { key: "rightSide", label: "Lateral derecho ml", type: "number" },
      { key: "leftSide", label: "Lateral izquierdo ml", type: "number" },
      { key: "shape", label: "Forma", type: "select", options: ["Regular", "Irregular"] },
      { key: "topography", label: "Topografia", type: "select", options: ["Plana", "Pendiente", "Mixta"] },
      { key: "zoning", label: "Zonificacion", type: "text" },
      { key: "maxFloorsAllowed", label: "Pisos maximos permitidos", type: "number" },
      { key: "landUse", label: "Uso permitido", type: "text" },
      { key: "landType", label: "Tipo de terreno", type: "select", options: ["Urbano", "Industrial", "Comercial", "Agricola", "Residencial"] },
    ],
    amenities: ["Agua", "Luz", "Desague", "Gas", "Internet", "Pista asfaltada", "Vereda", "Partida registral", "Independizado", "Titulo de propiedad"],
  },
  OFFICE: {
    label: "Oficina",
    hint: "Campos orientados a edificio, implementacion y servicios corporativos.",
    fields: [
      { key: "totalArea", label: "Area total m2", required: true },
      { key: "bathrooms", label: "Banos", required: true },
      { key: "floor", label: "Piso" },
      { key: "floors", label: "Pisos del edificio" },
      { key: "parkingSpaces", label: "Estacionamientos" },
    ],
    specificFields: [
      { key: "usefulArea", label: "Area util m2", type: "number" },
      { key: "elevators", label: "Ascensores", type: "number" },
      { key: "directElevator", label: "Ascensor directo", type: "boolean" },
      { key: "privateOffices", label: "Oficinas privadas", type: "number" },
      { key: "meetingRoom", label: "Sala de reuniones", type: "boolean" },
      { key: "ownReception", label: "Recepcion propia", type: "boolean" },
      { key: "kitchenette", label: "Kitchenette", type: "boolean" },
      { key: "officeStatus", label: "Estado de oficina", type: "select", options: ["Implementada", "Semiimplementada", "Sin implementar", "Amoblada"] },
    ],
    amenities: ["Recepcion", "Seguridad 24/7", "Aire acondicionado", "Fibra optica", "Grupo electrogeno", "CCTV", "Data center", "Deposito"],
  },
  COMMERCIAL: {
    label: "Local comercial",
    hint: "Sin dormitorios; prioriza frente, giro, licencia y servicios.",
    fields: [
      { key: "totalArea", label: "Area terreno m2", required: true },
      { key: "constructedArea", label: "Area construida m2" },
      { key: "bathrooms", label: "Banos" },
      { key: "floor", label: "Piso" },
      { key: "parkingSpaces", label: "Estacionamientos" },
    ],
    specificFields: [
      { key: "commercialArea", label: "Area comercial m2", type: "number" },
      { key: "commercialFront", label: "Frente comercial ml", type: "number" },
      { key: "environments", label: "Ambientes", type: "number" },
      { key: "zoning", label: "Zonificacion", type: "text" },
      { key: "allowedBusiness", label: "Giro permitido", type: "text" },
      { key: "streetDoor", label: "Puerta a calle", type: "boolean" },
      { key: "mainAvenue", label: "Ubicado en avenida", type: "boolean" },
      { key: "mallLocation", label: "En centro comercial", type: "boolean" },
      { key: "loadingArea", label: "Zona carga/descarga", type: "boolean" },
    ],
    amenities: ["Deposito", "Oficina administrativa", "Kitchenette", "Vitrina", "Alto transito", "Luz trifasica", "Gas", "Agua", "Internet", "Aire acondicionado"],
  },
  ROOM: {
    label: "Habitacion",
    hint: "Formulario corto para alquiler por ambiente.",
    fields: [
      { key: "totalArea", label: "Area m2", required: true },
      { key: "bedrooms", label: "Ambientes", required: true },
      { key: "bathrooms", label: "Banos" },
      { key: "floor", label: "Piso" },
    ],
    specificFields: [
      { key: "bedType", label: "Cama", type: "text" },
      { key: "privateBathroom", label: "Bano privado", type: "boolean" },
      { key: "sharedBathroom", label: "Bano compartido", type: "boolean" },
      { key: "studentsOnly", label: "Solo estudiantes", type: "boolean" },
      { key: "genderRule", label: "Condicion", type: "select", options: ["Sin restriccion", "Solo hombres", "Solo mujeres"] },
      { key: "couplesAllowed", label: "Parejas permitidas", type: "boolean" },
      { key: "warrantyAmount", label: "Garantia", type: "number" },
    ],
    amenities: ["Amoblada", "Closet", "Escritorio", "TV", "Cocina compartida", "Lavanderia", "Sala compartida", "Agua incluida", "Luz incluida", "Internet incluido"],
  },
  WAREHOUSE: {
    label: "Industrial / Almacen",
    hint: "Pensado para operacion, potencia, patio y seguridad.",
    fields: [
      { key: "totalArea", label: "Area terreno m2", required: true },
      { key: "constructedArea", label: "Area construida m2" },
      { key: "bathrooms", label: "Banos" },
      { key: "parkingSpaces", label: "Estacionamientos" },
    ],
    specificFields: [
      { key: "warehouseArea", label: "Area almacen m2", type: "number" },
      { key: "officeArea", label: "Area oficinas m2", type: "number" },
      { key: "freeArea", label: "Area libre m2", type: "number" },
      { key: "shipHeight", label: "Altura de nave m", type: "number" },
      { key: "industrialZoning", label: "Zonificacion industrial", type: "text" },
      { key: "powerCapacity", label: "Potencia electrica", type: "text" },
      { key: "loadingArea", label: "Zona carga/descarga", type: "boolean" },
      { key: "truckAccess", label: "Acceso para camiones", type: "boolean" },
      { key: "gates", label: "Numero de portones", type: "number" },
    ],
    amenities: ["Patio de maniobras", "Energia trifasica", "Subestacion", "Gas industrial", "Andenes", "Vestidores", "Comedor", "Cerco perimetrico", "CCTV", "Sistema contra incendios"],
  },
  PARKING: {
    label: "Cochera / Estacionamiento",
    hint: "Formulario pequeno para venta o alquiler de estacionamiento.",
    fields: [
      { key: "totalArea", label: "Area m2", required: true },
      { key: "floor", label: "Piso / sotano" },
    ],
    specificFields: [
      { key: "parkingType", label: "Tipo", type: "select", options: ["Simple", "Doble"] },
      { key: "covered", label: "Techada", type: "boolean" },
      { key: "parkingNumber", label: "Numero de estacionamiento", type: "text" },
      { key: "independentAccess", label: "Acceso independiente", type: "boolean" },
      { key: "remoteControl", label: "Control remoto", type: "boolean" },
      { key: "nearElevator", label: "Ascensor cercano", type: "boolean" },
      { key: "suvReady", label: "Apto para SUV", type: "boolean" },
      { key: "length", label: "Largo m", type: "number" },
      { key: "width", label: "Ancho m", type: "number" },
    ],
    amenities: ["Vigilancia", "Camaras", "Mantenimiento incluido"],
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
