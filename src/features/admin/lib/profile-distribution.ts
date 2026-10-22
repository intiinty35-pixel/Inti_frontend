export type Distribution = { type: string; count: number }[];

export function countProfessionalProfiles(records: unknown): Distribution {
  if (!Array.isArray(records) || !records.every(item => item && typeof item.type === 'string')) {
    throw new Error('El listado de profesionales no tiene el formato esperado.');
  }
  // This endpoint lists professional accounts, excluding individual owners.
  return ['REAL_ESTATE_AGENCY', 'INDEPENDENT_AGENT', 'DEVELOPER'].map(type => ({
    type, count: records.filter(item => item.type === type).length,
  }));
}
