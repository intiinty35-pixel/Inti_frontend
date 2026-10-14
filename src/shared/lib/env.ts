/**
 * Detecta los datos de ejemplo del .env.example. Mostrarlos en produccion haria
 * que un cliente transfiera dinero a una cuenta que no existe, asi que el
 * consumidor debe ocultar la seccion de pago cuando no hay datos reales.
 */
const PLACEHOLDER_PATTERNS = [/cambia/i, /reemplaza/i, /^your_/i, /^xxx+$/i];

function isPlaceholder(value: string) {
  const normalized = value.replace(/\s+/g, "");
  return normalized.length === 0 || PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(normalized));
}

/**
 * Cuenta oficial de ARIZ GROUP SAC para depositos y transferencias, definida en
 * las variables `NEXT_PUBLIC_PAYMENT_*`. Si falta `BANK_ACCOUNT` la seccion de pago
 * no se muestra. `YAPE_PLIN_NUMBER` es el celular de Yape y Plin de ARIZ.
 */
const payment = {
  yapePlinNumber: process.env.NEXT_PUBLIC_PAYMENT_YAPE_PLIN_NUMBER ?? "",
  bankName: process.env.NEXT_PUBLIC_PAYMENT_BANK_NAME ?? "",
  bankAccount: process.env.NEXT_PUBLIC_PAYMENT_BANK_ACCOUNT ?? "",
  bankCci: process.env.NEXT_PUBLIC_PAYMENT_BANK_CCI ?? "",
  accountHolder: process.env.NEXT_PUBLIC_PAYMENT_ACCOUNT_HOLDER ?? "",
  taxId: process.env.NEXT_PUBLIC_PAYMENT_TAX_ID ?? "",
} as const;

/**
 * true cuando hay datos reales de la cuenta bancaria o del celular de Yape y Plin.
 */
const paymentConfigured =
  !isPlaceholder(payment.bankAccount) || !isPlaceholder(payment.yapePlinNumber);

export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "",
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  authCookieName: process.env.AUTH_COOKIE_NAME ?? "ariz_session",
  backendUrl: (process.env.BACKEND_URL ?? "http://localhost:4000").replace(/\/$/, ""),
  payment,
  paymentConfigured,
} as const;

