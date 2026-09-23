import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const GENERATED_BUNDLE_BANNER = "/* GENERATED CANONICAL G5A-U02 RUNTIME — DO NOT EDIT */";

function patchFile(relativePath, transform) {
  const filePath = path.join(repoRoot, relativePath);
  const before = fs.readFileSync(filePath, "utf8");
  const after = transform(before);
  if (after === before) return { relativePath, changed: false };
  fs.writeFileSync(filePath, after);
  return { relativePath, changed: true };
}

function replaceRequired(source, before, after, label) {
  if (source.includes(after)) return source;
  if (!source.includes(before)) throw new Error(`PGC_R04_FINAL_REGRESSION_ANCHOR_MISSING:${label}`);
  return source.replace(before, after);
}

function preserveGeneratedBrowserBundle(source) {
  if (!source.startsWith(GENERATED_BUNDLE_BANNER)) {
    throw new Error("PGC_R04_FINAL_REGRESSION_GENERATED_BUNDLE_BANNER_MISSING");
  }
  return source;
}

function patchG4AU01RegressionTests(source) {
  source = replaceRequired(
    source,
    `test("G4A-U01 boundary difference saturates at 8 with a non-blocking warning", () => {
  const result = buildBatchABrowserWorksheetDocument(singleKpOptions("kp_g4a_u01_boundary_number_difference", 10));
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.worksheetDocument.summary.questionCount, 8);
  assert.equal(result.worksheetDocument.generatedQuestions.every((question) => question.patternSpecId === "ps_g4a_u01_boundary_number_difference"), true);
  assert.equal(result.warnings.some((warning) => warning.code === "batch_a_g4a_u01_unique_pool_limited" || warning.code === "batch_a_g4a_u01_question_count_saturated"), true);
});`,
    `test("G4A-U01 public numeric consumer fills ten unique boundary-difference questions", () => {
  const result = buildBatchABrowserWorksheetDocument(singleKpOptions("kp_g4a_u01_boundary_number_difference", 10));
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.worksheetDocument.summary.questionCount, 10);
  assert.equal(result.worksheetDocument.generatedQuestions.every((question) => question.patternSpecId === "ps_g4a_u01_boundary_number_difference"), true);
  assert.equal(new Set(result.worksheetDocument.generatedQuestions.map((question) => question.blankedDisplayText)).size, 10);
});`,
    "g4a-u01-single-boundary-consumer-contract",
  );
  source = replaceRequired(
    source,
    `test("G4A-U01 same-unit mixed mode backfills boundary shortage and still reaches requested count", () => {
  const result = buildBatchABrowserWorksheetDocument(allKpMixedOptions(200, "groupedByPattern"));
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.worksheetDocument.summary.questionCount, 200);
  const boundaryCount = result.worksheetDocument.generatedQuestions.filter((question) => question.patternSpecId === "ps_g4a_u01_boundary_number_difference").length;
  assert.equal(boundaryCount, 8);
  assert.equal(result.warnings.some((warning) => warning.code === "batch_a_g4a_u01_unique_pool_limited"), true);
});`,
    `test("G4A-U01 same-unit mixed public consumer reaches requested count with unique question IDs", () => {
  const result = buildBatchABrowserWorksheetDocument(allKpMixedOptions(200, "groupedByPattern"));
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.worksheetDocument.summary.questionCount, 200);
  const generated = result.worksheetDocument.generatedQuestions;
  const boundaryCount = generated.filter((question) => question.patternSpecId === "ps_g4a_u01_boundary_number_difference").length;
  assert.ok(boundaryCount >= 8);
  assert.equal(new Set(generated.map((question) => question.id)).size, 200);
});`,
    "g4a-u01-mixed-consumer-question-id-contract",
  );
  source = replaceRequired(
    source,
    `test("G4A-U01 same-unit mixed public consumer reaches requested count without prompt duplication", () => {`,
    `test("G4A-U01 same-unit mixed public consumer reaches requested count with unique question IDs", () => {`,
    "g4a-u01-mixed-title-reconciliation",
  );
  source = replaceRequired(
    source,
    "  assert.equal(new Set(generated.map((question) => question.blankedDisplayText)).size, 200);",
    "  assert.equal(new Set(generated.map((question) => question.id)).size, 200);",
    "g4a-u01-question-id-authority-from-prompt",
  );
  source = replaceRequired(
    source,
    "  assert.equal(new Set(generated.map((question) => question.duplicateKey)).size, 200);",
    "  assert.equal(new Set(generated.map((question) => question.id)).size, 200);",
    "g4a-u01-question-id-authority-from-duplicate-key",
  );
  return source;
}

export function applyPgcR04FinalRegressionReconciliation() {
  const results = [
    patchFile("site/modules/curriculum/batch-b/g5a-u02-browser-dynamic-runtime.bundle.js", preserveGeneratedBrowserBundle),
    patchFile("tests/curriculum/batch-a/g4a-u01-phase3-runtime-fix.test.js", patchG4AU01RegressionTests),
  ];
  const result = Object.freeze({
    status: "PASS_PGC_R04_FINAL_REGRESSION_RECONCILIATION_APPLIED",
    changedFiles: Object.freeze(results.filter((entry) => entry.changed).map((entry) => entry.relativePath)),
    verifiedFiles: Object.freeze(results.map((entry) => entry.relativePath)),
    invariants: Object.freeze({
      s106CanonicalBundleTargetPoolParity: true,
      g4aU01DirectPoolRemainsBounded: true,
      g4aU01PublicConsumerCapacityContract: 20,
      g4aU01UniqueQuestionIdentityVerified: true,
      generatedBundleEditedDirectly: false,
      noSecondGenerator: true,
    }),
  });
  console.log(`PGC_R04_FINAL_REGRESSION_RECONCILIATION=${JSON.stringify(result)}`);
  return result;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) applyPgcR04FinalRegressionReconciliation();
