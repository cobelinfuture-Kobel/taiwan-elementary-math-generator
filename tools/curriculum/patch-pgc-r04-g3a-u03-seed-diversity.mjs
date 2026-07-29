import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const generatorPath = path.join(repoRoot, "site/modules/curriculum/batch-a/g3a-u03-quality-generator.js");
const PATCH_MARKER = "PGC_R04_G3A_U03_SEEDED_VARIATION_V1";

function replaceExact(text, before, after, label) {
  if (!text.includes(before)) throw new Error(`PGC_R04_PATCH_MARKER_MISSING:${label}`);
  return text.replace(before, after);
}

export function patchPgcR04G3aU03SeedDiversity() {
  let text = fs.readFileSync(generatorPath, "utf8");
  if (text.includes(PATCH_MARKER)) {
    console.log(`PGC_R04_G3A_U03_PATCH=ALREADY_APPLIED:${PATCH_MARKER}`);
    return { changed: false, marker: PATCH_MARKER };
  }

  const pairBefore = `function pairFor(specId, sequenceNumber) {
  if (specId === "ps_g3a_u03_2digit_by_1digit_carry") return [10 + ((sequenceNumber * 17) % 90), 2 + ((sequenceNumber * 5) % 8)];
  if (specId === "ps_g3a_u03_10_multiple_by_1digit") return [10 * (1 + ((sequenceNumber - 1) % 9)), 2 + ((sequenceNumber * 3) % 8)];
  if (specId === "ps_g3a_u03_3digit_by_1digit") return [100 + ((sequenceNumber * 137) % 900), 2 + ((sequenceNumber * 5) % 8)];
  if (specId === zeroMiddleSpecId) return [100 * (1 + (sequenceNumber % 8)) + (1 + ((sequenceNumber * 7) % 9)), 2 + ((sequenceNumber * 5) % 8)];
  return null;
}`;
  const pairAfter = `// ${PATCH_MARKER}: every numeric pool consumes generationSeed through a full-cycle permutation.
const pairPoolLengths = Object.freeze({
  "ps_g3a_u03_2digit_by_1digit_carry": 360,
  "ps_g3a_u03_10_multiple_by_1digit": 72,
  "ps_g3a_u03_3digit_by_1digit": 1800,
  [zeroMiddleSpecId]: 72
});

function seededPoolIndex(specId, sequenceNumber, seed, length) {
  const seedValue = hashSeed(\`\${sourceId}:\${specId}:\${seed ?? "default"}\`);
  const offset = seedValue % length;
  const step = permutationStep(seedValue, length);
  return (offset + ((sequenceNumber - 1) * step)) % length;
}

function pairFor(specId, sequenceNumber, seed) {
  const poolLength = pairPoolLengths[specId];
  const seededSequenceNumber = poolLength
    ? seededPoolIndex(specId, sequenceNumber, seed, poolLength) + 1
    : sequenceNumber;
  if (specId === "ps_g3a_u03_2digit_by_1digit_carry") return [10 + ((seededSequenceNumber * 17) % 90), 2 + ((seededSequenceNumber * 5) % 8)];
  if (specId === "ps_g3a_u03_10_multiple_by_1digit") return [10 * (1 + ((seededSequenceNumber - 1) % 9)), 2 + ((seededSequenceNumber * 3) % 8)];
  if (specId === "ps_g3a_u03_3digit_by_1digit") return [100 + ((seededSequenceNumber * 137) % 900), 2 + ((seededSequenceNumber * 5) % 8)];
  if (specId === zeroMiddleSpecId) return [100 * (1 + (seededSequenceNumber % 8)) + (1 + ((seededSequenceNumber * 7) % 9)), 2 + ((seededSequenceNumber * 5) % 8)];
  return null;
}`;
  text = replaceExact(text, pairBefore, pairAfter, "pairFor");

  const missingBefore = `function makeMissingQuestion(sequenceNumber) {
  const row = missingRows[(sequenceNumber - 1) % missingRows.length];`;
  const missingAfter = `function makeMissingQuestion(sequenceNumber, seed) {
  const row = missingRows[seededPoolIndex(missingInferenceSpecId, sequenceNumber, seed, missingRows.length)];`;
  text = replaceExact(text, missingBefore, missingAfter, "makeMissingQuestion");

  const generateBefore = `function generateU03Question(specId, sequenceNumber, seed) {
  if (specId === twoStepSpecId) return makeQuestion(specId, twoStepRows[(sequenceNumber - 1) % twoStepRows.length], sequenceNumber);
  if (specId === twoStepWordProblemSpecId) return makeWordProblemQuestion(sequenceNumber, seed);
  if (specId === missingInferenceSpecId) return makeMissingQuestion(sequenceNumber);
  return makeQuestion(specId, pairFor(specId, sequenceNumber), sequenceNumber);
}`;
  const generateAfter = `function generateU03Question(specId, sequenceNumber, seed) {
  if (specId === twoStepSpecId) {
    const row = twoStepRows[seededPoolIndex(twoStepSpecId, sequenceNumber, seed, twoStepRows.length)];
    return makeQuestion(specId, row, sequenceNumber);
  }
  if (specId === twoStepWordProblemSpecId) return makeWordProblemQuestion(sequenceNumber, seed);
  if (specId === missingInferenceSpecId) return makeMissingQuestion(sequenceNumber, seed);
  return makeQuestion(specId, pairFor(specId, sequenceNumber, seed), sequenceNumber);
}`;
  text = replaceExact(text, generateBefore, generateAfter, "generateU03Question");

  fs.writeFileSync(generatorPath, text);
  console.log(`PGC_R04_G3A_U03_PATCH=APPLIED:${PATCH_MARKER}`);
  return { changed: true, marker: PATCH_MARKER };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  patchPgcR04G3aU03SeedDiversity();
}
