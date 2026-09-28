/** Paleta categórica validada (orden fijo, nunca ciclada). Ver skill de dataviz. */
export const CATEGORICAL = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100"] as const;

/** Paleta de estado, fija, nunca reutilizada para series. */
export const STATUS = {
  good: "#0ca30c",
  warning: "#fab219",
  serious: "#ec835a",
  critical: "#d03b3b",
} as const;

export const CHART_INK = {
  primary: "#0b0b0b",
  secondary: "#52514e",
  muted: "#898781",
  grid: "#e1e0d9",
  baseline: "#c3c2b7",
  surface: "#ffffff",
} as const;
