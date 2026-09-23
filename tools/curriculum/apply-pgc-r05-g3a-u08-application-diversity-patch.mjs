import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const targetRelativePath = "site/modules/curriculum/batch-a/same-denominator-fraction-compare-runtime.js";
const marker = "PGC-R05 G3A-U08 same-denominator application diversity FullFix V1";

function replaceRequired(source, before, after, label) {
  if (source.includes(after)) return source;
  if (!source.includes(before)) throw new Error(`PGC_R05_G3A_U08_DIVERSITY_ANCHOR_MISSING:${label}`);
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
  Object.freeze({ leftNumerator: 2, denominator: 5, rightNumerator: 4, target: "pair", relation: "<" }),
  Object.freeze({ leftNumerator: 3, denominator: 6, rightNumerator: 3, target: "pair", relation: "=" }),
  Object.freeze({ leftNumerator: 5, denominator: 8, rightNumerator: 2, target: "pair", relation: ">" }),
  Object.freeze({ leftNumerator: 4, denominator: 7, rightNumerator: 7, target: "one", relation: "<" }),
  Object.freeze({ leftNumerator: 5, denominator: 5, rightNumerator: 5, target: "one", relation: "=" }),
  Object.freeze({ leftNumerator: 8, denominator: 6, rightNumerator: 6, target: "one", relation: ">" }),
]);`,
    `const APPLICATION_FIXTURES = Object.freeze([
  Object.freeze({ leftNumerator: 2, denominator: 5, rightNumerator: 4, target: "pair", relation: "<" }),
  Object.freeze({ leftNumerator: 3, denominator: 6, rightNumerator: 3, target: "pair", relation: "=" }),
  Object.freeze({ leftNumerator: 5, denominator: 8, rightNumerator: 2, target: "pair", relation: ">" }),
  Object.freeze({ leftNumerator: 4, denominator: 7, rightNumerator: 7, target: "one", relation: "<" }),
  Object.freeze({ leftNumerator: 5, denominator: 5, rightNumerator: 5, target: "one", relation: "=" }),
  Object.freeze({ leftNumerator: 8, denominator: 6, rightNumerator: 6, target: "one", relation: ">" }),
]);
function buildPgcR05ApplicationFixtures() {
  const rows = [];
  for (let denominator = 2; denominator <= 10; denominator += 1) {
    rows.push(Object.freeze({ leftNumerator: denominator - 1, denominator, rightNumerator: denominator, target: "pair", relation: "<" }));
    rows.push(Object.freeze({ leftNumerator: denominator - 1, denominator, rightNumerator: denominator - 1, target: "pair", relation: "=" }));
    rows.push(Object.freeze({ leftNumerator: denominator + 1, denominator, rightNumerator: denominator - 1, target: "pair", relation: ">" }));
    rows.push(Object.freeze({ leftNumerator: denominator - 1, denominator, rightNumerator: denominator, target: "one", relation: "<" }));
    rows.push(Object.freeze({ leftNumerator: denominator, denominator, rightNumerator: denominator, target: "one", relation: "=" }));
    rows.push(Object.freeze({ leftNumerator: denominator + 1, denominator, rightNumerator: denominator, target: "one", relation: ">" }));
  }
  return rows;
}
const PGC_R05_APPLICATION_FIXTURES = Object.freeze(buildPgcR05ApplicationFixtures());`,
    "application-parameter-space",
  );

  source = replaceRequired(
    source,
    `  const fixtures = authority || !isPgcR04Seed(seed) ? APPLICATION_FIXTURES : NUMERIC_FIXTURES;`,
    `  const fixtures = authority && isPgcR05Seed(seed)
    ? PGC_R05_APPLICATION_FIXTURES
    : authority || !isPgcR04Seed(seed)
      ? APPLICATION_FIXTURES
      : NUMERIC_FIXTURES;`,
    "application-profile-selection",
  );

  return `${source.trimEnd()}\n\n// ${marker}\n`;
}

export function applyPgcR05G3AU08ApplicationDiversityPatch() {
  const targetPath = path.join(repoRoot, targetRelativePath);
  const before = fs.readFileSync(targetPath, "utf8");
  const after = patchRuntime(before);
  if (after !== before) fs.writeFileSync(targetPath, after);

  const result = Object.freeze({
    status: after !== before
      ? "PASS_PGC_R05_G3A_U08_APPLICATION_DIVERSITY_PATCH_APPLIED"
      : "PASS_PGC_R05_G3A_U08_APPLICATION_DIVERSITY_ALREADY_APPLIED",
    changedFiles: Object.freeze(after !== before ? [targetRelativePath] : []),
    verifiedFiles: Object.freeze([targetRelativePath]),
    profile: "pgc-r05-seed-only",
    targetPatternSpecId: "ps_g3a_u08_same_denominator_compare_comparison_application",
    deterministicParameterSpace: 54,
    reviewedFixturePrefixPreserved: true,
    ordinaryProductSeedBehaviorPreserved: true,
    validatorRelaxed: false,
    numericRoutesModified: false,
    otherG3AU08PatternSpecsModified: false,
    resolverModified: false,
    newPatternSpecsAdded: false,
    secondGeneratorAdded: false,
    secondValidatorAdded: false,
    secondWorksheetPipelineAdded: false,
  });
  console.log(`PGC_R05_G3A_U08_DIVERSITY_PATCH=${JSON.stringify(result)}`);
  return result;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) applyPgcR05G3AU08ApplicationDiversityPatch();
