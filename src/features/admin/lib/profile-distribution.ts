export type Distribution = { type: string; count: number }[];

export function normalizeProfileDistribution(records: unknown): Distribution {
  if (
    !Array.isArray(records) ||
    !records.every(
      (item) =>
        item &&
        typeof item.type === "string" &&
        (item.count === undefined || (typeof item.count === "number" && Number.isFinite(item.count) && item.count >= 0)),
    )
  ) {
    throw new Error("La distribución de perfiles no tiene el formato esperado.");
  }

  const hasAggregatedCounts = records.some((item) => item.count !== undefined);
  if (hasAggregatedCounts && !records.every((item) => typeof item.count === "number")) {
    throw new Error("La distribución de perfiles contiene conteos incompletos.");
  }

  return ["REAL_ESTATE_AGENCY", "INDEPENDENT_AGENT", "DEVELOPER"].map((type) => ({
    type,
    count: hasAggregatedCounts
      ? records.find((item) => item.type === type)?.count ?? 0
      : records.filter((item) => item.type === type).length,
  }));
}
