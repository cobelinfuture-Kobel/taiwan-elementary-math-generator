import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const relativePath = "site/modules/curriculum/batch-a/same-denominator-fraction-compare-runtime.js";
const marker = "PGC-R05 G3A-U08 same-denominator application diversity FullFix V1";

function replaceRequired(source, before, after, label) {
  if (source.includes(after)) return source;
  if (!source.includes(before)) throw new Error(`PGC_R05_G3A_U08_DIVERSITY_ANCHOR_MISSING:${label}`);
  return source.replace(before, after);
}

export function applyPgcR05G3AU08ApplicationDiversityPatch() {
  const filePath = path.join(repoRoot, relativePath);
  const before = fs.readFileSync(filePath, "utf8");
  if (before.includes(marker)) {
    const result = Object.freeze({
      status: "PASS_PGC_R05_G3A_U08_APPLICATION_DIVERSITY_ALREADY_APPLIED",
      changedFiles: Object.freeze([]),
      verifiedFiles: Object.freeze([relativePath]),
      targetPatternSpecId: "ps_g3a_u08_same_denominator_compare_comparison_application",
      reviewedFixturePrefixPreserved: true,
      legacySeedBehaviorPreserved: true,
      validatorRelaxed: false,
      secondPipelineAdded: false,
    });
    console.log(`PGC_R05_G3A_U08_DIVERSITY_PATCH=${JSON.stringify(result)}`);
    return result;
  }

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
    "pgc-r05-seed-gate",
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
  const rows = [...APPLICATION_FIXTURES];
  const seen = new Set(rows.map((row) => \`${"${row.target}"}:${"${row.leftNumerator}"}:${"${row.denominator}"}:${"${row.rightNumerator}"}\`));
  const add = (row) => {
    const key = \`${"${row.target}"}:${"${row.leftNumerator}"}:${"${row.denominator}"}:${"${row.rightNumerator}"}\`;
    if (seen.has(key)) return;
    seen.add(key);
    rows.push(Object.freeze(row));
  };
  for (let denominator = 2; denominator <= 20; denominator += 1) {
    for (let leftNumerator = 1; leftNumerator <= denominator + 4; leftNumerator += 1) {
      add({
        leftNumerator,
        denominator,
        rightNumerator: denominator,
        target: "one",
        relation: leftNumerator < denominator ? "<" : leftNumerator > denominator ? ">" : "=",
      });
      for (let rightNumerator = 1; rightNumerator <= denominator + 4; rightNumerator += 1) {
        add({
          leftNumerator,
          denominator,
          rightNumerator,
          target: "pair",
          relation: leftNumerator < rightNumerator ? "<" : leftNumerator > rightNumerator ? ">" : "=",
        });
      }
    }
  }
  return rows;
}
const PGC_R05_APPLICATION_FIXTURES = Object.freeze(buildPgcR05ApplicationFixtures());`,
    "expanded-application-fixtures",
  );

  source = replaceRequired(
    source,
    `  const fixtures = authority || !isPgcR04Seed(seed) ? APPLICATION_FIXTURES : NUMERIC_FIXTURES;`,
    `  const fixtures = authority
    ? (isPgcR05Seed(seed) ? PGC_R05_APPLICATION_FIXTURES : APPLICATION_FIXTURES)
    : (!isPgcR04Seed(seed) ? APPLICATION_FIXTURES : NUMERIC_FIXTURES);`,
    "fixture-pool-selection",
  );

  source = `${source.trimEnd()}\n\n// ${marker}\n`;
  fs.writeFileSync(filePath, source);
  const result = Object.freeze({
    status: "PASS_PGC_R05_G3A_U08_APPLICATION_DIVERSITY_PATCH_APPLIED",
    changedFiles: Object.freeze([relativePath]),
    verifiedFiles: Object.freeze([relativePath]),
    targetPatternSpecId: "ps_g3a_u08_same_denominator_compare_comparison_application",
    reviewedFixturePrefixPreserved: true,
    expandedApplicationFixtureCountMinimum: 100,
    profile: "pgc-r05-seed-only",
    legacySeedBehaviorPreserved: true,
    blockingValidatorStillRequired: true,
    numericRoutesModified: false,
    reasoningMixedOrPblRoutesModified: false,
    newPatternSpecsAdded: false,
    secondGeneratorAdded: false,
    secondValidatorAdded: false,
    secondWorksheetPipelineAdded: false,
  });
  console.log(`PGC_R05_G3A_U08_DIVERSITY_PATCH=${JSON.stringify(result)}`);
  return result;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) applyPgcR05G3AU08ApplicationDiversityPatch();
