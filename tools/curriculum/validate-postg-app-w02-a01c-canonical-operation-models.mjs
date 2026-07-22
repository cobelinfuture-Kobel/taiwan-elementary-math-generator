import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildW02CanonicalOperationModelReadback } from '../../src/curriculum/application/w02-canonical-operation-models.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');

export function runPOSTGAPPW02A01CValidation() {
  return buildW02CanonicalOperationModelReadback({ root: ROOT });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = runPOSTGAPPW02A01CValidation();
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (!result.ok) process.exitCode = 1;
}
