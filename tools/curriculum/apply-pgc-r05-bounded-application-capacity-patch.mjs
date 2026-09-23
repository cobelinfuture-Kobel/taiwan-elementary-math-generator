import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const MARKER = "PGC-R05 bounded application capacity FullFix V1";

function patchFile(relativePath, transform) {
  const filePath = path.join(repoRoot, relativePath);
  const before = fs.readFileSync(filePath, "utf8");
  if (before.includes(MARKER)) return { relativePath, changed: false };
  const after = `${transform(before).trimEnd()}\n\n// ${MARKER}\n`;
  if (after === before) throw new Error(`PGC_R05_PATCH_NO_CHANGE:${relativePath}`);
  fs.writeFileSync(filePath, after);
  return { relativePath, changed: true };
}

function replaceRequired(source, before, after, label) {
  if (source.includes(after)) return source;
  if (!source.includes(before)) throw new Error(`PGC_R05_PATCH_ANCHOR_MISSING:${label}`);
  return source.replace(before, after);
}

function patchSlice002(source) {
  source = replaceRequired(
    source,
    "const DENOMINATORS = Object.freeze([2, 3, 4, 6]);",
    `const DENOMINATORS = Object.freeze([2, 3, 4, 6]);
const UNIT_FRACTION_APPLICATION_SURFACES = Object.freeze([
  "運動會補給站把一份水果平均分成 {{denominator}} 小份。小安取得 {{count}} 小份，共是一份水果的幾分之幾？",
  "校園健康活動把一份點心平均分成 {{denominator}} 小份。參與者拿到 {{count}} 小份，占整份的幾分之幾？",
  "社區運動日將一份補給平均分成 {{denominator}} 份，其中 {{count}} 份合起來是整份的幾分之幾？",
  "體育課把一組運動貼紙平均分成 {{denominator}} 份。小安得到 {{count}} 份，得到全組的幾分之幾？",
  "健康闖關活動將一份水果盤平均分成 {{denominator}} 份，取出 {{count}} 份後，取出的部分占幾分之幾？",
  "運動社團把一份能量補給平均分成 {{denominator}} 小包。使用 {{count}} 小包，占原來一份的幾分之幾？",
  "校慶接力活動把一份飲水補給平均分成 {{denominator}} 份。分出 {{count}} 份，占全部的幾分之幾？",
  "戶外活動把一份補給品平均切成 {{denominator}} 份。隊員拿走 {{count}} 份，拿走全份的幾分之幾？",
]);`,
    "slice002-application-surfaces",
  );
  source = replaceRequired(
    source,
    `  } else if (patternSpecId === G3A_U08_UNIT_FRACTION_APPLICATION_SPEC_ID) {
    promptText = \`運動會補給站把一份水果平均分成 \${denominator} 小份。小安取得 \${unitFractionCount} 小份，共是一份水果的幾分之幾？\`;
    finalAnswer = fraction(unitFractionCount, denominator); answerText = fractionText(finalAnswer);`,
    `  } else if (patternSpecId === G3A_U08_UNIT_FRACTION_APPLICATION_SPEC_ID) {
    const surface = UNIT_FRACTION_APPLICATION_SURFACES[
      state(seed, sampleIndex, patternSpecId + ":application-surface") % UNIT_FRACTION_APPLICATION_SURFACES.length
    ];
    promptText = surface
      .replace("{{denominator}}", String(denominator))
      .replace("{{count}}", String(unitFractionCount));
    finalAnswer = fraction(unitFractionCount, denominator); answerText = fractionText(finalAnswer);`,
    "slice002-unit-fraction-application-prompt",
  );
  return source;
}

function patchP03F11(source) {
  return replaceRequired(
    source,
    `const APPLICATION_FIXTURES = Object.freeze([
  { decimalTenths: 12, integerFactor: 3 }, { decimalTenths: 34, integerFactor: 2 },
  { decimalTenths: 48, integerFactor: 3 }, { decimalTenths: 63, integerFactor: 4 },
  { decimalTenths: 27, integerFactor: 7 }, { decimalTenths: 56, integerFactor: 8 },
  { decimalTenths: 19, integerFactor: 6 }, { decimalTenths: 75, integerFactor: 5 },
]);`,
    `const APPLICATION_FIXTURES = Object.freeze([
  { decimalTenths: 12, integerFactor: 3 }, { decimalTenths: 34, integerFactor: 2 },
  { decimalTenths: 48, integerFactor: 3 }, { decimalTenths: 63, integerFactor: 4 },
  { decimalTenths: 27, integerFactor: 7 }, { decimalTenths: 56, integerFactor: 8 },
  { decimalTenths: 19, integerFactor: 6 }, { decimalTenths: 75, integerFactor: 5 },
  { decimalTenths: 13, integerFactor: 4 }, { decimalTenths: 16, integerFactor: 5 },
  { decimalTenths: 22, integerFactor: 6 }, { decimalTenths: 24, integerFactor: 7 },
  { decimalTenths: 31, integerFactor: 8 }, { decimalTenths: 36, integerFactor: 9 },
  { decimalTenths: 42, integerFactor: 5 }, { decimalTenths: 47, integerFactor: 6 },
  { decimalTenths: 52, integerFactor: 7 }, { decimalTenths: 58, integerFactor: 4 },
  { decimalTenths: 61, integerFactor: 3 }, { decimalTenths: 68, integerFactor: 8 },
  { decimalTenths: 73, integerFactor: 9 }, { decimalTenths: 81, integerFactor: 4 },
  { decimalTenths: 86, integerFactor: 5 }, { decimalTenths: 94, integerFactor: 7 },
]);`,
    "p03f11-application-fixtures",
  );
}

function patchP03F13(source) {
  return replaceRequired(
    source,
    `const APPLICATION_FIXTURES = Object.freeze([
  Object.freeze({ totalQuantity: 6, recipientCount: 4 }), Object.freeze({ totalQuantity: 5, recipientCount: 2 }),
  Object.freeze({ totalQuantity: 7, recipientCount: 3 }), Object.freeze({ totalQuantity: 8, recipientCount: 6 }),
  Object.freeze({ totalQuantity: 9, recipientCount: 4 }), Object.freeze({ totalQuantity: 10, recipientCount: 6 }),
]);`,
    `const APPLICATION_FIXTURES = Object.freeze([
  Object.freeze({ totalQuantity: 6, recipientCount: 4 }), Object.freeze({ totalQuantity: 5, recipientCount: 2 }),
  Object.freeze({ totalQuantity: 7, recipientCount: 3 }), Object.freeze({ totalQuantity: 8, recipientCount: 6 }),
  Object.freeze({ totalQuantity: 9, recipientCount: 4 }), Object.freeze({ totalQuantity: 10, recipientCount: 6 }),
  Object.freeze({ totalQuantity: 11, recipientCount: 2 }), Object.freeze({ totalQuantity: 11, recipientCount: 3 }),
  Object.freeze({ totalQuantity: 12, recipientCount: 5 }), Object.freeze({ totalQuantity: 13, recipientCount: 4 }),
  Object.freeze({ totalQuantity: 14, recipientCount: 3 }), Object.freeze({ totalQuantity: 15, recipientCount: 4 }),
  Object.freeze({ totalQuantity: 16, recipientCount: 3 }), Object.freeze({ totalQuantity: 17, recipientCount: 5 }),
  Object.freeze({ totalQuantity: 18, recipientCount: 7 }), Object.freeze({ totalQuantity: 19, recipientCount: 6 }),
  Object.freeze({ totalQuantity: 20, recipientCount: 3 }), Object.freeze({ totalQuantity: 21, recipientCount: 8 }),
  Object.freeze({ totalQuantity: 22, recipientCount: 7 }), Object.freeze({ totalQuantity: 23, recipientCount: 4 }),
  Object.freeze({ totalQuantity: 24, recipientCount: 5 }), Object.freeze({ totalQuantity: 25, recipientCount: 6 }),
  Object.freeze({ totalQuantity: 26, recipientCount: 9 }), Object.freeze({ totalQuantity: 27, recipientCount: 8 }),
]);`,
    "p03f13-application-fixtures",
  );
}

export function applyPgcR05BoundedApplicationCapacityPatch() {
  const results = [
    patchFile("site/modules/curriculum/batch-a/slice002-fraction-runtime.js", patchSlice002),
    patchFile("site/modules/curriculum/batch-a/one-decimal-times-integer-runtime.js", patchP03F11),
    patchFile("site/modules/curriculum/batch-a/quotient-as-fraction-context-runtime.js", patchP03F13),
  ];
  const result = Object.freeze({
    status: "PASS_PGC_R05_BOUNDED_APPLICATION_CAPACITY_PATCH_APPLIED",
    changedFiles: Object.freeze(results.filter((entry) => entry.changed).map((entry) => entry.relativePath)),
    verifiedFiles: Object.freeze(results.map((entry) => entry.relativePath)),
    expectedLiveFailureReduction: 6,
    existingApplicationAuthoritiesPreserved: true,
    reviewedFixturePrefixPreserved: true,
    numericRoutesModified: false,
    secondGeneratorAdded: false,
    secondValidatorAdded: false,
    secondWorksheetPipelineAdded: false,
  });
  console.log(`PGC_R05_BOUNDED_APPLICATION_CAPACITY_PATCH=${JSON.stringify(result)}`);
  return result;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) applyPgcR05BoundedApplicationCapacityPatch();
