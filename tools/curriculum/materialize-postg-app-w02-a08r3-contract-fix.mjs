#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const repoPath = 'src/curriculum/application/shared/student-facing-numeric-remediation-v4.mjs';
const absolute = path.join(ROOT, repoPath);
let source = fs.readFileSync(absolute, 'utf8');
const touched = [];

function replaceOnce(before, after) {
  if (source.includes(after)) return;
  if (!source.includes(before)) throw new Error(`A08R3_CONTRACT_FIX_ANCHOR_MISSING:${before.slice(0, 48)}`);
  source = source.replace(before, after);
  touched.push(repoPath);
}

replaceOnce(
  `      const candidates = [values.firstQuantity, values.secondQuantity].sort((a, b) => fractionValue(b) - fractionValue(a));
      const givens = { larger: candidates[0], smaller: candidates[1] };`,
  `      const givens = values.larger != null && values.smaller != null
        ? { larger: values.larger, smaller: values.smaller }
        : (() => {
            const candidates = [values.firstQuantity, values.secondQuantity]
              .sort((a, b) => fractionValue(b) - fractionValue(a));
            return { larger: candidates[0], smaller: candidates[1] };
          })();`
);

replaceOnce(
  `      const upperBound = Number(values.base) * 5;`,
  `      const upperBound = Number(values.upperBound ?? Number(values.base) * 5);`
);

replaceOnce(
  `      const denominator = Number(String(values.unknownPart ?? '').split('/')[1]);`,
  `      const denominator = Number(values.denominator ?? String(values.unknownPart ?? '').split('/')[1]);`
);

if (touched.length) fs.writeFileSync(absolute, source, 'utf8');
process.stdout.write(`${JSON.stringify({ ok: true, touched }, null, 2)}\n`);
