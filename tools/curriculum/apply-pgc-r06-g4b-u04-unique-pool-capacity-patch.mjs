import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const relativePath = "site/modules/curriculum/batch-b/g4b-u04-inverse-unique-case-pool.js";
const filePath = path.join(repoRoot, relativePath);
const marker = "PGC-R06 G4B-U04 canonical inverse unique pools capacity FullFix V1";

function replaceRequired(source, before, after, label) {
  if (source.includes(after)) return source;
  if (!source.includes(before)) throw new Error(`PGC_R06_G4BU04_UNIQUE_POOL_ANCHOR_MISSING:${label}`);
  return source.replace(before, after);
}

export function applyPgcR06G4BU04UniquePoolCapacityPatch() {
  const before = fs.readFileSync(filePath, "utf8");
  if (before.includes(marker)) {
    const result = Object.freeze({
      status: "PASS_PGC_R06_G4BU04_UNIQUE_POOL_PATCH_ALREADY_APPLIED",
      changedFiles: Object.freeze([]),
    });
    console.log(`PGC_R06_G4BU04_UNIQUE_POOL_PATCH=${JSON.stringify(result)}`);
    return result;
  }

  let source = before;
  source = replaceRequired(
    source,
    `export const G4B_U04_INVERSE_DIGIT_SET_CASES = Object.freeze([\n  Object.freeze({ mask: "1□3", targetUnit: 100, roundedValue: 100 }),\n  Object.freeze({ mask: "1□3", targetUnit: 100, roundedValue: 200 }),\n  Object.freeze({ mask: "2□4", targetUnit: 100, roundedValue: 200 }),\n  Object.freeze({ mask: "2□4", targetUnit: 100, roundedValue: 300 }),\n  Object.freeze({ mask: "3□5", targetUnit: 100, roundedValue: 300 }),\n  Object.freeze({ mask: "3□5", targetUnit: 100, roundedValue: 400 }),\n  Object.freeze({ mask: "4□6", targetUnit: 100, roundedValue: 400 }),\n  Object.freeze({ mask: "4□6", targetUnit: 100, roundedValue: 500 }),\n  Object.freeze({ mask: "5□7", targetUnit: 100, roundedValue: 500 }),\n  Object.freeze({ mask: "5□7", targetUnit: 100, roundedValue: 600 }),\n  Object.freeze({ mask: "6□8", targetUnit: 100, roundedValue: 600 }),\n  Object.freeze({ mask: "6□8", targetUnit: 100, roundedValue: 700 }),\n]);\n\nexport const G4B_U04_INVERSE_ORIGINAL_VALUE_CASES = Object.freeze([\n  Object.freeze({ mask: "1□□5", targetUnit: 1000, roundedValue: 1000 }),\n  Object.freeze({ mask: "1□□5", targetUnit: 1000, roundedValue: 2000 }),\n  Object.freeze({ mask: "2□□5", targetUnit: 1000, roundedValue: 2000 }),\n  Object.freeze({ mask: "2□□5", targetUnit: 1000, roundedValue: 3000 }),\n  Object.freeze({ mask: "3□□5", targetUnit: 1000, roundedValue: 3000 }),\n  Object.freeze({ mask: "3□□5", targetUnit: 1000, roundedValue: 4000 }),\n  Object.freeze({ mask: "4□□5", targetUnit: 1000, roundedValue: 4000 }),\n  Object.freeze({ mask: "4□□5", targetUnit: 1000, roundedValue: 5000 }),\n  Object.freeze({ mask: "5□□5", targetUnit: 1000, roundedValue: 5000 }),\n  Object.freeze({ mask: "5□□5", targetUnit: 1000, roundedValue: 6000 }),\n  Object.freeze({ mask: "6□□5", targetUnit: 1000, roundedValue: 6000 }),\n  Object.freeze({ mask: "6□□5", targetUnit: 1000, roundedValue: 7000 }),\n]);`,
    `export const G4B_U04_INVERSE_DIGIT_SET_CASES = Object.freeze([\n  ...Array.from({ length: 8 }, (_, index) => Object.freeze({\n    mask: \`${"${index + 1}"}□318\`,\n    targetUnit: 10000,\n    roundedValue: (index + 2) * 10000,\n  })),\n  ...Array.from({ length: 8 }, (_, index) => Object.freeze({\n    mask: \`${"${index + 1}"}7□61\`,\n    targetUnit: 1000,\n    roundedValue: (index + 1) * 10000 + 8000,\n  })),\n  ...Array.from({ length: 8 }, (_, index) => Object.freeze({\n    mask: \`${"${index + 1}"}□42\`,\n    targetUnit: 1000,\n    roundedValue: (index + 2) * 1000,\n  })),\n]);\n\nexport const G4B_U04_INVERSE_ORIGINAL_VALUE_CASES = Object.freeze(\n  [2, 3, 4, 5, 6, 7, 8].flatMap((leadingDigit) =>\n    [25, 49, 75, 99].map((suffix) => Object.freeze({\n      mask: \`${"${leadingDigit}"}□□${"${suffix}"}\`,\n      targetUnit: 1000,\n      roundedValue: leadingDigit * 10000 + 5000,\n    })),\n  ),\n);`,
    "canonical-unique-case-banks",
  );

  source = `${source.trimEnd()}\n\n// ${marker}\n`;
  fs.writeFileSync(filePath, source);
  const result = Object.freeze({
    status: "PASS_PGC_R06_G4BU04_UNIQUE_POOL_PATCH_APPLIED",
    changedFiles: Object.freeze([relativePath]),
    digitSetCapacity: 24,
    originalValueCapacity: 28,
    existingCapacityAllocatorReused: true,
    existingDeduplicationRuntimeReused: true,
  });
  console.log(`PGC_R06_G4BU04_UNIQUE_POOL_PATCH=${JSON.stringify(result)}`);
  return result;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) applyPgcR06G4BU04UniquePoolCapacityPatch();
