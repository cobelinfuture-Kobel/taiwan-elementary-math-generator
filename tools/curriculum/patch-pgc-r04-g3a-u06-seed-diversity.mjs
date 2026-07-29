import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const target = path.join(root, "site/modules/curriculum/batch-a/g3a-u06-division-generator.js");
const marker = "PGC_R04_G3A_U06_SEEDED_VARIATION_V1";

function exact(text, before, after, label) {
  if (!text.includes(before)) throw new Error(`PGC_R04_A02_MARKER_MISSING:${label}`);
  return text.replace(before, after);
}

export function patchPgcR04G3aU06SeedDiversity() {
  let text = fs.readFileSync(target, "utf8");
  if (text.includes(marker)) return { changed: false, marker };

  text = exact(text,
`function allocateCounts(patternSpecIds, questionCount) {`,
`// ${marker}
const specializedPoolLengths = Object.freeze({
  [remainderSpecId]: 556,
  [packagingSpecId]: 72,
  [sharingSpecId]: 72,
  [paritySpecId]: 360
});

function greatestCommonDivisor(left, right) {
  let a = Math.abs(left);
  let b = Math.abs(right);
  while (b !== 0) [a, b] = [b, a % b];
  return a;
}

function seededSequenceNumber(patternSpecId, sequenceNumber, seed) {
  const length = specializedPoolLengths[patternSpecId];
  if (!length) return sequenceNumber;
  const seedValue = hashSeed(sourceId + ":" + patternSpecId + ":" + (seed ?? "default"));
  const offset = seedValue % length;
  let step = 1;
  for (let candidate = 2 + (seedValue % (length - 1)); candidate < length * 2; candidate += 1) {
    const proposed = 1 + (candidate % (length - 1));
    if (greatestCommonDivisor(proposed, length) === 1) { step = proposed; break; }
  }
  return ((offset + ((sequenceNumber - 1) * step)) % length) + 1;
}

function allocateCounts(patternSpecIds, questionCount) {`,
"seed-helper");

  text = exact(text,
`  if (patternSpecId === remainderSpecId) return makeDivisionWithRemainderQuestion(sequenceNumber);
  if (patternSpecId === packagingSpecId) return makeQuotativeDivisionPackagingQuestion(sequenceNumber);
  if (patternSpecId === sharingSpecId) return makePartitiveDivisionEqualSharingQuestion(sequenceNumber);
  if (patternSpecId === paritySpecId) return makeParityRangeMissingDigitQuestion(sequenceNumber);`,
`  const seededNumber = seededSequenceNumber(patternSpecId, sequenceNumber, seed);
  if (patternSpecId === remainderSpecId) return makeDivisionWithRemainderQuestion(seededNumber);
  if (patternSpecId === packagingSpecId) return makeQuotativeDivisionPackagingQuestion(seededNumber);
  if (patternSpecId === sharingSpecId) return makePartitiveDivisionEqualSharingQuestion(seededNumber);
  if (patternSpecId === paritySpecId) return makeParityRangeMissingDigitQuestion(seededNumber);`,
"maker-routing");

  fs.writeFileSync(target, text);
  return { changed: true, marker };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) patchPgcR04G3aU06SeedDiversity();
