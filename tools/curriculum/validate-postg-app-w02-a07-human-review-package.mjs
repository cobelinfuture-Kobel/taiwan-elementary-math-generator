// Diagnostic-only synchronize marker; runtime behavior is unchanged.
import { buildW02A07Readback } from '../../src/curriculum/application/w02-a07-human-review-package.mjs';

const readback = buildW02A07Readback({ root: process.cwd() });
console.log(JSON.stringify(readback, null, 2));
if (!readback.ok) process.exitCode = 1;
