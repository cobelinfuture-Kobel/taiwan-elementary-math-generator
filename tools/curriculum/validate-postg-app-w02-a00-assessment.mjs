import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildW02Source13ApplicationAssessmentReadback } from '../../src/curriculum/application/w02-source13-application-assessment.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');

export function runPOSTGAPPW02A00Validation() {
  return buildW02Source13ApplicationAssessmentReadback({ root: ROOT });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = runPOSTGAPPW02A00Validation();
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (!result.ok) process.exitCode = 1;
}
