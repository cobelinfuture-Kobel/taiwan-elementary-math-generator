import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildW02Source13PdfEvidenceReadback } from '../../src/curriculum/application/w02-source13-pdf-evidence-runtime.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');

export function runPOSTGAPPW02A01AValidation() {
  return buildW02Source13PdfEvidenceReadback({ root: ROOT });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = runPOSTGAPPW02A01AValidation();
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (!result.ok) process.exitCode = 1;
}
