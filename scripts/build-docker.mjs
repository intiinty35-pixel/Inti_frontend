import { existsSync, readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const envFile = new URL('../.env', import.meta.url);
const config = { ...(existsSync(envFile) ? parseEnv(readFileSync(envFile, 'utf8')) : {}), ...process.env };
const required = ['NEXT_PUBLIC_FIREBASE_API_KEY', 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', 'NEXT_PUBLIC_FIREBASE_PROJECT_ID', 'NEXT_PUBLIC_FIREBASE_APP_ID'];
const missing = required.filter(key => !config[key]?.trim());
if (missing.length) {
  console.error(`Completa estas variables en .env antes de compilar: ${missing.join(', ')}`);
  process.exit(1);
}
const publicKeys = [
  ...required, 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET', 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID', 'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME',
  'NEXT_PUBLIC_PAYMENT_YAPE_PLIN_NUMBER', 'NEXT_PUBLIC_PAYMENT_BANK_NAME',
  'NEXT_PUBLIC_PAYMENT_BANK_ACCOUNT', 'NEXT_PUBLIC_PAYMENT_BANK_CCI',
  'NEXT_PUBLIC_PAYMENT_ACCOUNT_HOLDER', 'NEXT_PUBLIC_PAYMENT_TAX_ID',
];
// Keep the production API/site defaults in Dockerfile; local .env may use localhost.
const tag = process.argv.slice(2).find(value => value !== '--') || 'roberto523/app-arisproyectos-frontend:latest';
const args = ['build', '-t', tag];
for (const key of publicKeys) {
  if (config[key]) args.push('--build-arg', `${key}=${config[key]}`);
}
console.log('Compilando frontend con la configuración pública de Firebase y pagos.');
const result = spawnSync('docker', [...args, '.'], { cwd: root, stdio: 'inherit', shell: false });
if (result.error) console.error(`No se pudo ejecutar Docker: ${result.error.message}`);
process.exit(result.status ?? 1);
