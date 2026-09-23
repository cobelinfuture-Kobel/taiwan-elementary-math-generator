import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildW02HiddenPatternSpecReadback } from '../../src/curriculum/application/w02-hidden-pattern-specs.mjs';

export function runPOSTGAPPW02A01DValidation() {
  return buildW02HiddenPatternSpecReadback();
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = runPOSTGAPPW02A01DValidation();
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (!result.ok) process.exitCode = 1;
}
