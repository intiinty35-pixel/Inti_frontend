<<<<<<< HEAD
=======
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

const payment = {
  yapeNumber: process.env.NEXT_PUBLIC_PAYMENT_YAPE_NUMBER ?? "",
  plinNumber: process.env.NEXT_PUBLIC_PAYMENT_PLIN_NUMBER ?? "",
  bankName: process.env.NEXT_PUBLIC_PAYMENT_BANK_NAME ?? "",
  bankAccount: process.env.NEXT_PUBLIC_PAYMENT_BANK_ACCOUNT ?? "",
  accountHolder: process.env.NEXT_PUBLIC_PAYMENT_ACCOUNT_HOLDER ?? "",
} as const;

/**
 * true solo cuando Yape o Plin tienen un numero real: son los unicos canales
 * que el cliente puede usar sin verificar el titular por su cuenta.
 */
const paymentConfigured = !isPlaceholder(payment.yapeNumber) || !isPlaceholder(payment.plinNumber);

>>>>>>> 9329d94156582eafd16ce5945e63ae0b09f6e33a
export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "",
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  authCookieName: process.env.AUTH_COOKIE_NAME ?? "ariz_session",
  backendUrl: (process.env.BACKEND_URL ?? "http://localhost:4000").replace(/\/$/, ""),
<<<<<<< HEAD
} as const;
=======
  payment,
  paymentConfigured,
} as const;

>>>>>>> 9329d94156582eafd16ce5945e63ae0b09f6e33a
