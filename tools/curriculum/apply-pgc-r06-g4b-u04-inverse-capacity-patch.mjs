import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const relativePath = "site/modules/curriculum/batch-b/g4b-u04-class-c-generator.js";
const filePath = path.join(repoRoot, relativePath);
const marker = "PGC-R06 G4B-U04 bounded reasoning capacity FullFix V1";

function replaceRequired(source, before, after, label) {
  if (source.includes(after)) return source;
  if (!source.includes(before)) throw new Error(`PGC_R06_G4BU04_PATCH_ANCHOR_MISSING:${label}`);
  return source.replace(before, after);
}

export function applyPgcR06G4BU04InverseCapacityPatch() {
  const before = fs.readFileSync(filePath, "utf8");
  if (before.includes(marker)) {
    const result = Object.freeze({
      status: "PASS_PGC_R06_G4BU04_CAPACITY_PATCH_ALREADY_APPLIED",
      changedFiles: Object.freeze([]),
    });
    console.log(`PGC_R06_G4BU04_CAPACITY_PATCH=${JSON.stringify(result)}`);
    return result;
  }

  let source = before;
  source = replaceRequired(
    source,
    `const DIGIT_SET_CASES = Object.freeze([\n  Object.freeze({ mask: "2□318", targetUnit: 10000, roundedValue: 30000 }),\n  Object.freeze({ mask: "47□61", targetUnit: 1000, roundedValue: 47000 }),\n  Object.freeze({ mask: "6□42", targetUnit: 1000, roundedValue: 6000 }),\n  Object.freeze({ mask: "8□76", targetUnit: 1000, roundedValue: 9000 }),\n]);\n\nconst ORIGINAL_VALUE_CASES = Object.freeze([\n  Object.freeze({ mask: "4□□99", targetUnit: 1000, roundedValue: 45000 }),\n  Object.freeze({ mask: "3□□49", targetUnit: 1000, roundedValue: 35000 }),\n  Object.freeze({ mask: "7□□25", targetUnit: 1000, roundedValue: 72000 }),\n  Object.freeze({ mask: "6□□75", targetUnit: 1000, roundedValue: 65000 }),\n]);`,
    `const DIGIT_SET_CASES = Object.freeze([\n  ...Array.from({ length: 8 }, (_, index) => Object.freeze({\n    mask: \`${"${index + 1}"}□318\`,\n    targetUnit: 10000,\n    roundedValue: (index + 2) * 10000,\n  })),\n  ...Array.from({ length: 8 }, (_, index) => Object.freeze({\n    mask: \`${"${index + 1}"}7□61\`,\n    targetUnit: 1000,\n    roundedValue: (index + 1) * 10000 + 8000,\n  })),\n  ...Array.from({ length: 8 }, (_, index) => Object.freeze({\n    mask: \`${"${index + 1}"}□42\`,\n    targetUnit: 1000,\n    roundedValue: (index + 2) * 1000,\n  })),\n]);\n\nconst ORIGINAL_VALUE_CASES = Object.freeze(\n  [2, 3, 4, 5, 6, 7, 8].flatMap((leadingDigit) =>\n    [25, 49, 75, 99].map((suffix) => Object.freeze({\n      mask: \`${"${leadingDigit}"}□□${"${suffix}"}\`,\n      targetUnit: 1000,\n      roundedValue: leadingDigit * 10000 + 5000,\n    })),\n  ),\n);`,
    "inverse-case-banks",
  );

  source = replaceRequired(
    source,
    `function sampleSymbolReading(seed) {`,
    `function sampleSymbolReading(seed, sequence = 0) {`,
    "symbol-signature",
  );
  source = replaceRequired(
    source,
    `    promptText: prompts[seed % prompts.length],`,
    `    promptText: prompts[((seed % prompts.length) + sequence) % prompts.length],`,
    "symbol-sequence-projection",
  );
  source = replaceRequired(
    source,
    `function sampleInverseDigitSet(seed) {\n  const selected = randomChoice(seed, 1, DIGIT_SET_CASES);`,
    `function sampleInverseDigitSet(seed, sequence = 0) {\n  const selected = DIGIT_SET_CASES[((seed % DIGIT_SET_CASES.length) + sequence) % DIGIT_SET_CASES.length];`,
    "inverse-digit-sequence-projection",
  );
  source = replaceRequired(
    source,
    `function sampleInverseOriginalValues(seed) {\n  const selected = randomChoice(seed, 1, ORIGINAL_VALUE_CASES);`,
    `function sampleInverseOriginalValues(seed, sequence = 0) {\n  const selected = ORIGINAL_VALUE_CASES[((seed % ORIGINAL_VALUE_CASES.length) + sequence) % ORIGINAL_VALUE_CASES.length];`,
    "inverse-original-sequence-projection",
  );
  source = replaceRequired(
    source,
    `function sampleForPattern(patternSpecId, seed) {`,
    `function sampleForPattern(patternSpecId, seed, sequence = 0) {`,
    "sample-router-signature",
  );
  source = replaceRequired(
    source,
    `    case "ps_g4b_u04_approx_symbol_reading": return sampleSymbolReading(seed);`,
    `    case "ps_g4b_u04_approx_symbol_reading": return sampleSymbolReading(seed, sequence);`,
    "symbol-router",
  );
  source = replaceRequired(
    source,
    `    case "ps_g4b_u04_inverse_digit_set": return sampleInverseDigitSet(seed);`,
    `    case "ps_g4b_u04_inverse_digit_set": return sampleInverseDigitSet(seed, sequence);`,
    "inverse-digit-router",
  );
  source = replaceRequired(
    source,
    `    case "ps_g4b_u04_inverse_original_values": return sampleInverseOriginalValues(seed);`,
    `    case "ps_g4b_u04_inverse_original_values": return sampleInverseOriginalValues(seed, sequence);`,
    "inverse-original-router",
  );
  source = replaceRequired(
    source,
    `  const sample = sampleForPattern(patternSpecId, hashSeed(seedLabel));`,
    `  const sample = sampleForPattern(patternSpecId, hashSeed(seedLabel), sequence);`,
    "question-sequence-binding",
  );

  source = `${source.trimEnd()}\n\n// ${marker}\n`;
  fs.writeFileSync(filePath, source);

  const result = Object.freeze({
    status: "PASS_PGC_R06_G4BU04_CAPACITY_PATCH_APPLIED",
    changedFiles: Object.freeze([relativePath]),
    digitSetCaseCount: 24,
    originalValueCaseCount: 28,
    collisionFreeSequenceProjection: true,
    secondGeneratorAdded: false,
    secondValidatorAdded: false,
  });
  console.log(`PGC_R06_G4BU04_CAPACITY_PATCH=${JSON.stringify(result)}`);
  return result;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) applyPgcR06G4BU04InverseCapacityPatch();
