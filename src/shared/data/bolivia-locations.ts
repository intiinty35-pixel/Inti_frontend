export const BOLIVIA_DEPARTMENTS: readonly string[] = [
  "Beni",
  "Chuquisaca",
  "Cochabamba",
  "La Paz",
  "Oruro",
  "Pando",
  "Potosí",
  "Santa Cruz",
  "Tarija",
];

/** Bolivia uses department, province and municipality for project locations. */
export function isConsistentLocation(
  department: string,
  province: string,
  municipality: string,
): boolean {
  return BOLIVIA_DEPARTMENTS.includes(department)
    && province.trim().length > 0
    && municipality.trim().length > 0;
}
