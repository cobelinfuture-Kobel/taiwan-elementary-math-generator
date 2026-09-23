import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const base = path.join(repoRoot, "site/modules/curriculum/batch-a");

function replaceExact(relativePath, replacements) {
  const filePath = path.join(base, relativePath);
  let content = fs.readFileSync(filePath, "utf8");
  for (const [before, after] of replacements) {
    if (!content.includes(before)) {
      if (content.includes(after)) continue;
      throw new Error(`PGC_R04_SEED_PATCH_ANCHOR_MISSING:${relativePath}:${before.slice(0, 80)}`);
    }
    content = content.replace(before, after);
  }
  fs.writeFileSync(filePath, content);
  return relativePath;
}

export function applyPgcR04SeedParameterizationPatch() {
  const modified = [];

  modified.push(replaceExact("g3a-u03-quality-generator.js", [
    [
`function pairFor(specId, sequenceNumber) {
  if (specId === "ps_g3a_u03_2digit_by_1digit_carry") return [10 + ((sequenceNumber * 17) % 90), 2 + ((sequenceNumber * 5) % 8)];
  if (specId === "ps_g3a_u03_10_multiple_by_1digit") return [10 * (1 + ((sequenceNumber - 1) % 9)), 2 + ((sequenceNumber * 3) % 8)];
  if (specId === "ps_g3a_u03_3digit_by_1digit") return [100 + ((sequenceNumber * 137) % 900), 2 + ((sequenceNumber * 5) % 8)];
  if (specId === zeroMiddleSpecId) return [100 * (1 + (sequenceNumber % 8)) + (1 + ((sequenceNumber * 7) % 9)), 2 + ((sequenceNumber * 5) % 8)];
  return null;
}`,
`function pairFor(specId, sequenceNumber, seed) {
  const shifted = sequenceNumber + (hashSeed(String(seed ?? "default") + ":" + specId + ":pair") % 10000);
  if (specId === "ps_g3a_u03_2digit_by_1digit_carry") return [10 + ((shifted * 17) % 90), 2 + ((shifted * 5) % 8)];
  if (specId === "ps_g3a_u03_10_multiple_by_1digit") return [10 * (1 + ((shifted - 1) % 9)), 2 + ((shifted * 3) % 8)];
  if (specId === "ps_g3a_u03_3digit_by_1digit") return [100 + ((shifted * 137) % 900), 2 + ((shifted * 5) % 8)];
  if (specId === zeroMiddleSpecId) return [100 * (1 + (shifted % 8)) + (1 + ((shifted * 7) % 9)), 2 + ((shifted * 5) % 8)];
  return null;
}`
    ],
    [
`function makeMissingQuestion(sequenceNumber) {
  const row = missingRows[(sequenceNumber - 1) % missingRows.length];`,
`function makeMissingQuestion(sequenceNumber, seed) {
  const offset = hashSeed(String(seed ?? "default") + ":" + missingInferenceSpecId + ":missing") % missingRows.length;
  const row = missingRows[(offset + sequenceNumber - 1) % missingRows.length];`
    ],
    [
`function generateU03Question(specId, sequenceNumber, seed) {
  if (specId === twoStepSpecId) return makeQuestion(specId, twoStepRows[(sequenceNumber - 1) % twoStepRows.length], sequenceNumber);
  if (specId === twoStepWordProblemSpecId) return makeWordProblemQuestion(sequenceNumber, seed);
  if (specId === missingInferenceSpecId) return makeMissingQuestion(sequenceNumber);
  return makeQuestion(specId, pairFor(specId, sequenceNumber), sequenceNumber);
}`,
`function generateU03Question(specId, sequenceNumber, seed) {
  if (specId === twoStepSpecId) return makeQuestion(specId, wordProblemRowFor(sequenceNumber, seed), sequenceNumber);
  if (specId === twoStepWordProblemSpecId) return makeWordProblemQuestion(sequenceNumber, seed);
  if (specId === missingInferenceSpecId) return makeMissingQuestion(sequenceNumber, seed);
  return makeQuestion(specId, pairFor(specId, sequenceNumber, seed), sequenceNumber);
}`
    ],
  ]));

  modified.push(replaceExact("g3a-u06-remainder-generator.js", [
    [
`function modelFor(sequenceNumber) {
  const index = Math.max(1, Number.isInteger(sequenceNumber) ? sequenceNumber : 1) - 1;
  return TWO_DIGIT_REMAINDER_MODELS[index % TWO_DIGIT_REMAINDER_MODELS.length];
}`,
`function hashSeed(value) { let acc = 2166136261; for (const char of String(value ?? "default")) { acc ^= char.charCodeAt(0); acc = Math.imul(acc, 16777619) >>> 0; } return acc || 1; }
function modelFor(sequenceNumber, seed) {
  const index = Math.max(1, Number.isInteger(sequenceNumber) ? sequenceNumber : 1) - 1;
  const offset = hashSeed(String(seed ?? "default") + ":" + G3A_U06_REMAINDER_SPEC_ID) % TWO_DIGIT_REMAINDER_MODELS.length;
  return TWO_DIGIT_REMAINDER_MODELS[(offset + index) % TWO_DIGIT_REMAINDER_MODELS.length];
}`
    ],
    ["export function makeDivisionWithRemainderQuestion(sequenceNumber = 1) {\n  const model = modelFor(sequenceNumber);", "export function makeDivisionWithRemainderQuestion(sequenceNumber = 1, seed = \"default\") {\n  const model = modelFor(sequenceNumber, seed);"],
    ["makeDivisionWithRemainderQuestion(index + 1)", "makeDivisionWithRemainderQuestion(index + 1, options.generationSeed)"],
  ]));

  modified.push(replaceExact("g3a-u06-word-problem-generator.js", [
    [
`export const G3A_U06_EQUAL_SHARING_SPEC_ID = "ps_g3a_u06_partitive_division_equal_sharing";

export function makeQuotativeDivisionPackagingQuestion(sequenceNumber = 1) {
  const itemsPerGroup = 2 + ((sequenceNumber - 1) % 8);
  const groupCount = 3 + ((sequenceNumber * 2) % 9);`,
`export const G3A_U06_EQUAL_SHARING_SPEC_ID = "ps_g3a_u06_partitive_division_equal_sharing";

function hashSeed(value) { let acc = 2166136261; for (const char of String(value ?? "default")) { acc ^= char.charCodeAt(0); acc = Math.imul(acc, 16777619) >>> 0; } return acc || 1; }
function shiftedSequence(sequenceNumber, seed, channel) { return sequenceNumber + (hashSeed(String(seed ?? "default") + ":" + channel) % 10000); }

export function makeQuotativeDivisionPackagingQuestion(sequenceNumber = 1, seed = "default") {
  const shifted = shiftedSequence(sequenceNumber, seed, G3A_U06_PACKAGING_SPEC_ID);
  const itemsPerGroup = 2 + ((shifted - 1) % 8);
  const groupCount = 3 + ((shifted * 2) % 9);`
    ],
    [
`export function makePartitiveDivisionEqualSharingQuestion(sequenceNumber = 1) {
  const groupCount = 2 + ((sequenceNumber - 1) % 8);
  const itemsPerGroup = 3 + ((sequenceNumber * 2) % 9);`,
`export function makePartitiveDivisionEqualSharingQuestion(sequenceNumber = 1, seed = "default") {
  const shifted = shiftedSequence(sequenceNumber, seed, G3A_U06_EQUAL_SHARING_SPEC_ID);
  const groupCount = 2 + ((shifted - 1) % 8);
  const itemsPerGroup = 3 + ((shifted * 2) % 9);`
    ],
    ["makeQuotativeDivisionPackagingQuestion(index + 1)", "makeQuotativeDivisionPackagingQuestion(index + 1, options.generationSeed)"],
    ["makePartitiveDivisionEqualSharingQuestion(index + 1)", "makePartitiveDivisionEqualSharingQuestion(index + 1, options.generationSeed)"],
  ]));

  modified.push(replaceExact("g3a-u06-parity-generator.js", [
    [
`function buildParityModel(sequenceNumber) {
  const index = Math.max(1, Number.isInteger(sequenceNumber) ? sequenceNumber : 1) - 1;`,
`function hashSeed(value) { let acc = 2166136261; for (const char of String(value ?? "default")) { acc ^= char.charCodeAt(0); acc = Math.imul(acc, 16777619) >>> 0; } return acc || 1; }
function buildParityModel(sequenceNumber, seed) {
  const baseIndex = Math.max(1, Number.isInteger(sequenceNumber) ? sequenceNumber : 1) - 1;
  const index = baseIndex + (hashSeed(String(seed ?? "default") + ":" + G3A_U06_PARITY_SPEC_ID) % 162);`
    ],
    ["export function makeParityRangeMissingDigitQuestion(sequenceNumber = 1) {\n  const model = buildParityModel(sequenceNumber);", "export function makeParityRangeMissingDigitQuestion(sequenceNumber = 1, seed = \"default\") {\n  const model = buildParityModel(sequenceNumber, seed);"],
    ["makeParityRangeMissingDigitQuestion(index + 1)", "makeParityRangeMissingDigitQuestion(index + 1, options.generationSeed)"],
  ]));

  modified.push(replaceExact("g3a-u06-division-generator.js", [
    ["makeDivisionWithRemainderQuestion(sequenceNumber)", "makeDivisionWithRemainderQuestion(sequenceNumber, seed)"],
    ["makeQuotativeDivisionPackagingQuestion(sequenceNumber)", "makeQuotativeDivisionPackagingQuestion(sequenceNumber, seed)"],
    ["makePartitiveDivisionEqualSharingQuestion(sequenceNumber)", "makePartitiveDivisionEqualSharingQuestion(sequenceNumber, seed)"],
    ["makeParityRangeMissingDigitQuestion(sequenceNumber)", "makeParityRangeMissingDigitQuestion(sequenceNumber, seed)"],
  ]));

  modified.push(replaceExact("quotient-fraction-runtime.js", [
    [
`const PAIRS = Object.freeze([
  Object.freeze([1, 2]), Object.freeze([2, 3]), Object.freeze([3, 4]), Object.freeze([4, 5]),
  Object.freeze([5, 6]), Object.freeze([7, 8]), Object.freeze([8, 3]), Object.freeze([9, 4]),
  Object.freeze([10, 3]), Object.freeze([11, 5]), Object.freeze([12, 5]), Object.freeze([12, 7]),
]);`,
`const PAIRS = Object.freeze(Array.from({ length: 12 }, (_, dividendIndex) => dividendIndex + 1)
  .flatMap((dividend) => Array.from({ length: 11 }, (_, divisorIndex) => divisorIndex + 2)
    .map((divisor) => Object.freeze([dividend, divisor]))));`
    ],
  ]));

  modified.push(replaceExact("simplest-fraction-runtime.js", [
    [
`const CASES = Object.freeze([
  { patternSpecId: COMMON_FACTOR_SPEC, numerator: 18, denominator: 24, commonFactor: 6, simplestNumerator: 3, simplestDenominator: 4, promptText: "18/24 約成最簡分數時，分子和分母同除的最大公因數是多少？" },
  { patternSpecId: COMMON_FACTOR_SPEC, numerator: 14, denominator: 21, commonFactor: 7, simplestNumerator: 2, simplestDenominator: 3, promptText: "14/21 約成最簡分數時，分子和分母同除的最大公因數是多少？" },
  { patternSpecId: COMMON_FACTOR_SPEC, numerator: 16, denominator: 40, commonFactor: 8, simplestNumerator: 2, simplestDenominator: 5, promptText: "16/40 約成最簡分數時，分子和分母同除的最大公因數是多少？" },
  { patternSpecId: SIMPLEST_NUMERATOR_SPEC, numerator: 27, denominator: 36, commonFactor: 9, simplestNumerator: 3, simplestDenominator: 4, promptText: "27/36 約成最簡分數後，分子是多少？" },
  { patternSpecId: SIMPLEST_NUMERATOR_SPEC, numerator: 35, denominator: 49, commonFactor: 7, simplestNumerator: 5, simplestDenominator: 7, promptText: "35/49 約成最簡分數後，分子是多少？" },
  { patternSpecId: SIMPLEST_NUMERATOR_SPEC, numerator: 42, denominator: 54, commonFactor: 6, simplestNumerator: 7, simplestDenominator: 9, promptText: "42/54 約成最簡分數後，分子是多少？" },
  { patternSpecId: SIMPLEST_DENOMINATOR_SPEC, numerator: 24, denominator: 32, commonFactor: 8, simplestNumerator: 3, simplestDenominator: 4, promptText: "24/32 約成最簡分數後，分母是多少？" },
  { patternSpecId: SIMPLEST_DENOMINATOR_SPEC, numerator: 20, denominator: 30, commonFactor: 10, simplestNumerator: 2, simplestDenominator: 3, promptText: "20/30 約成最簡分數後，分母是多少？" },
  { patternSpecId: SIMPLEST_DENOMINATOR_SPEC, numerator: 36, denominator: 48, commonFactor: 12, simplestNumerator: 3, simplestDenominator: 4, promptText: "36/48 約成最簡分數後，分母是多少？" },
]);`,
`function buildCases() {
  const rows = [];
  for (let simplestDenominator = 2; simplestDenominator <= 12; simplestDenominator += 1) {
    for (let simplestNumerator = 1; simplestNumerator < simplestDenominator; simplestNumerator += 1) {
      if (gcd(simplestNumerator, simplestDenominator) !== 1) continue;
      for (let commonFactor = 2; commonFactor <= 12; commonFactor += 1) {
        const numerator = simplestNumerator * commonFactor;
        const denominator = simplestDenominator * commonFactor;
        rows.push({ patternSpecId: COMMON_FACTOR_SPEC, numerator, denominator, commonFactor, simplestNumerator, simplestDenominator, promptText: numerator + "/" + denominator + " 約成最簡分數時，分子和分母同除的最大公因數是多少？" });
        rows.push({ patternSpecId: SIMPLEST_NUMERATOR_SPEC, numerator, denominator, commonFactor, simplestNumerator, simplestDenominator, promptText: numerator + "/" + denominator + " 約成最簡分數後，分子是多少？" });
        rows.push({ patternSpecId: SIMPLEST_DENOMINATOR_SPEC, numerator, denominator, commonFactor, simplestNumerator, simplestDenominator, promptText: numerator + "/" + denominator + " 約成最簡分數後，分母是多少？" });
      }
    }
  }
  return rows;
}
const CASES = Object.freeze(buildCases());`
    ],
  ]));

  const result = {
    status: "PASS_PGC_R04_SEED_PARAMETERIZATION_PATCHED",
    modifiedFiles: modified,
    fixedAuthorities: [
      "G3A_U03_MULTIPLICATION",
      "G3A_U06_DIVISION_REMAINDER_WORD_PARITY",
      "P03F3_QUOTIENT_AS_FRACTION",
      "P03F13_SIMPLEST_FRACTION",
    ],
  };
  console.log(`PGC_R04_SEED_PARAMETERIZATION_PATCH=${JSON.stringify(result)}`);
  return result;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) applyPgcR04SeedParameterizationPatch();
