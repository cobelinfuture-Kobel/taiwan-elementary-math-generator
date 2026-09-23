import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildW01A06EOperatorApprovalReadback } from '../../src/curriculum/application/w01-a06e-operator-approval-runtime.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');

export function runPOSTGAPPW01A06EValidation() {
  return buildW01A06EOperatorApprovalReadback({ root: ROOT });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = runPOSTGAPPW01A06EValidation();
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (!result.ok) process.exitCode = 1;
}
