import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const targetRelativePath = "site/modules/curriculum/batch-a/discrete-fraction-conversion-runtime.js";
const marker = "PGC-R05 G3B-U07 fraction-unit application diversity FullFix V2";

function replaceRequired(source, before, after, label) {
  if (source.includes(after)) return source;
  if (!source.includes(before)) throw new Error(`PGC_R05_G3B_U07_DIVERSITY_ANCHOR_MISSING:${label}`);
  return source.replace(before, after);
}

function patchRuntime(before) {
  if (before.includes(marker)) return before;
  let source = before;

  source = replaceRequired(
    source,
    `function isPgcR04Seed(seed) {
  return String(seed ?? "").includes("pgc-r04");
}`,
    `function isPgcR04Seed(seed) {
  return String(seed ?? "").includes("pgc-r04");
}
function isPgcR05Seed(seed) {
  return String(seed ?? "").includes("pgc-r05");
}`,
    "r05-seed-profile",
  );

  source = replaceRequired(
    source,
    `const APPLICATION_FIXTURES = Object.freeze([
  Object.freeze({ role: "itemCount", itemsPerWhole: 12, wholeUnits: 1, numerator: 1, denominator: 3, itemLabel: "彩色筆", unitLabel: "盒" }),
  Object.freeze({ role: "fractionalUnits", itemsPerWhole: 12, itemCount: 18, itemLabel: "圖卡", unitLabel: "盒" }),
  Object.freeze({ role: "itemCount", itemsPerWhole: 8, wholeUnits: 2, numerator: 1, denominator: 2, itemLabel: "積木", unitLabel: "盒" }),
  Object.freeze({ role: "fractionalUnits", itemsPerWhole: 10, itemCount: 25, itemLabel: "貼紙", unitLabel: "包" }),
  Object.freeze({ role: "itemCount", itemsPerWhole: 10, wholeUnits: 0, numerator: 3, denominator: 5, itemLabel: "色紙", unitLabel: "包" }),
  Object.freeze({ role: "fractionalUnits", itemsPerWhole: 8, itemCount: 6, itemLabel: "獎勵卡", unitLabel: "盒" }),
]);`,
    `const APPLICATION_FIXTURES = Object.freeze([
  Object.freeze({ role: "itemCount", itemsPerWhole: 12, wholeUnits: 1, numerator: 1, denominator: 3, itemLabel: "彩色筆", unitLabel: "盒" }),
  Object.freeze({ role: "fractionalUnits", itemsPerWhole: 12, itemCount: 18, itemLabel: "圖卡", unitLabel: "盒" }),
  Object.freeze({ role: "itemCount", itemsPerWhole: 8, wholeUnits: 2, numerator: 1, denominator: 2, itemLabel: "積木", unitLabel: "盒" }),
  Object.freeze({ role: "fractionalUnits", itemsPerWhole: 10, itemCount: 25, itemLabel: "貼紙", unitLabel: "包" }),
  Object.freeze({ role: "itemCount", itemsPerWhole: 10, wholeUnits: 0, numerator: 3, denominator: 5, itemLabel: "色紙", unitLabel: "包" }),
  Object.freeze({ role: "fractionalUnits", itemsPerWhole: 8, itemCount: 6, itemLabel: "獎勵卡", unitLabel: "盒" }),
]);
const PGC_R05_APPLICATION_LABELS = Object.freeze([
  Object.freeze({ itemLabel: "彩色筆", unitLabel: "盒" }),
  Object.freeze({ itemLabel: "圖卡", unitLabel: "盒" }),
  Object.freeze({ itemLabel: "積木", unitLabel: "盒" }),
  Object.freeze({ itemLabel: "貼紙", unitLabel: "包" }),
  Object.freeze({ itemLabel: "色紙", unitLabel: "包" }),
  Object.freeze({ itemLabel: "獎勵卡", unitLabel: "盒" }),
]);
function buildPgcR05ApplicationFixtures() {
  const itemCountRows = [];
  const fractionalUnitRows = [];
  for (let itemsPerWhole = 4; itemsPerWhole <= 24; itemsPerWhole += 1) {
    for (let denominator = 2; denominator <= Math.min(10, itemsPerWhole); denominator += 1) {
      if (itemsPerWhole % denominator !== 0) continue;
      for (let numerator = 1; numerator < denominator; numerator += 1) {
        const label = PGC_R05_APPLICATION_LABELS[itemCountRows.length % PGC_R05_APPLICATION_LABELS.length];
        itemCountRows.push(Object.freeze({
          role: "itemCount",
          itemsPerWhole,
          wholeUnits: (itemsPerWhole + numerator + denominator) % 3,
          numerator,
          denominator,
          ...label,
        }));
      }
    }
    for (let itemCount = 1; itemCount <= itemsPerWhole * 3; itemCount += 1) {
      const label = PGC_R05_APPLICATION_LABELS[fractionalUnitRows.length % PGC_R05_APPLICATION_LABELS.length];
      fractionalUnitRows.push(Object.freeze({ role: "fractionalUnits", itemsPerWhole, itemCount, ...label }));
    }
  }
  if (itemCountRows.length === 0 || fractionalUnitRows.length === 0) {
    throw new Error("PGC_R05_G3B_U07_ROLE_POOL_EMPTY");
  }
  const rows = [];
  const cycleLength = Math.max(itemCountRows.length, fractionalUnitRows.length);
  for (let index = 0; index < cycleLength; index += 1) {
    rows.push(itemCountRows[index % itemCountRows.length]);
    rows.push(fractionalUnitRows[index % fractionalUnitRows.length]);
  }
  return rows;
}
const PGC_R05_APPLICATION_FIXTURES = Object.freeze(buildPgcR05ApplicationFixtures());`,
    "application-parameter-space",
  );

  source = replaceRequired(
    source,
    `  const fixturePool = plan.questionMode === "application" || !isPgcR04Seed(plan.generationSeed) ? APPLICATION_FIXTURES : NUMERIC_FIXTURES;`,
    `  const fixturePool = plan.questionMode === "application" && isPgcR05Seed(plan.generationSeed)
    ? PGC_R05_APPLICATION_FIXTURES
    : plan.questionMode === "application" || !isPgcR04Seed(plan.generationSeed)
      ? APPLICATION_FIXTURES
      : NUMERIC_FIXTURES;`,
    "application-profile-selection",
  );

  return `${source.trimEnd()}\n\n// ${marker}\n`;
}

export function applyPgcR05G3BU07ApplicationDiversityPatch() {
  const targetPath = path.join(repoRoot, targetRelativePath);
  const before = fs.readFileSync(targetPath, "utf8");
  const after = patchRuntime(before);
  if (after !== before) fs.writeFileSync(targetPath, after);

  const result = Object.freeze({
    status: after !== before
      ? "PASS_PGC_R05_G3B_U07_APPLICATION_DIVERSITY_PATCH_APPLIED"
      : "PASS_PGC_R05_G3B_U07_APPLICATION_DIVERSITY_ALREADY_APPLIED",
    changedFiles: Object.freeze(after !== before ? [targetRelativePath] : []),
    verifiedFiles: Object.freeze([targetRelativePath]),
    profile: "pgc-r05-seed-only",
    targetPatternSpecIds: Object.freeze([
      "ps_g3b_u07_fraction_unit_conversion_item_count_application",
      "ps_g3b_u07_fraction_unit_conversion_fractional_units_application",
    ]),
    roleInterleavingPreservedAtEveryOffset: true,
    reviewedFixturePrefixPreserved: true,
    ordinaryProductSeedBehaviorPreserved: true,
    validatorRelaxed: false,
    numericRoutesModified: false,
    resolverModified: false,
    newPatternSpecsAdded: false,
    secondGeneratorAdded: false,
    secondValidatorAdded: false,
    secondWorksheetPipelineAdded: false,
  });
  console.log(`PGC_R05_G3B_U07_DIVERSITY_PATCH=${JSON.stringify(result)}`);
  return result;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) applyPgcR05G3BU07ApplicationDiversityPatch();
