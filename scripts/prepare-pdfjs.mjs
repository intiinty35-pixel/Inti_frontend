import { cp, mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const source = dirname(require.resolve('pdfjs-dist/package.json'));
const target = fileURLToPath(new URL('../public/pdfjs/', import.meta.url));
await mkdir(target, { recursive: true });
await cp(join(source, 'build/pdf.worker.min.mjs'), join(target, 'pdf.worker.min.mjs'));
for (const folder of ['cmaps', 'standard_fonts', 'wasm', 'iccs']) {
  await cp(join(source, folder), join(target, folder), { recursive: true }).catch(error => { if (error.code !== 'ENOENT') throw error; });
}
