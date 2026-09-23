import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const contract = JSON.parse(readFileSync(
  new URL("../../data/curriculum/public-generation/PGC-R07-A03.chromium-print-answer-key-matrix.json", import.meta.url),
  "utf8",
));
const runner = readFileSync(
  new URL("../../tools/curriculum/run-pgc-r07-a03-chromium-print-answer-matrix.mjs", import.meta.url),
  "utf8",
);
const workflow = readFileSync(
  new URL("../../.github/workflows/node-test.yml", import.meta.url),
  "utf8",
);

test("PGC-R07 A03 locks three surfaces by two answer-key modes", () => {
  assert.equal(contract.taskId, "PGC-R07-A03_RealChromiumPrintAndAnswerKeyMatrix");
  assert.equal(contract.scope.surfaceCount, 3);
  assert.equal(contract.scope.answerKeyModeCount, 2);
  assert.equal(contract.scope.expectedMatrixRowCount, 6);
  assert.deepEqual(contract.surfaces.map((row) => row.surfaceId), [
    "CLASSIC",
    "FALLBACK_404",
    "PIXEL",
  ]);
  assert.equal(contract.matrixRows.length, 6);
  assert.equal(contract.matrixRows.filter((row) => row.includeAnswerKey).length, 3);
  assert.equal(contract.matrixRows.filter((row) => !row.includeAnswerKey).length, 3);
});

test("PGC-R07 A03 fixes one source, config and seed across all surfaces", () => {
  assert.equal(contract.scope.sourceId, "g5a_u08_5a08");
  assert.equal(contract.scope.selectionMode, "sourceUnit");
  assert.equal(contract.scope.questionMode, "mixed");
  assert.equal(contract.scope.depthMode, "mixed");
  assert.equal(contract.scope.contextMode, "mixed");
  assert.equal(contract.scope.questionCount, 6);
  assert.equal(contract.scope.generationSeed, "pgc-r07-a03-g5a-u08-shared-seed");
  assert.equal(contract.parityContract.sameConfigAndSeedRequired, true);
  assert.equal(contract.parityContract.answerToggleMustPreserveQuestionIdentity, true);
});

test("PGC-R07 A03 runner uses real Chromium PDF and actual surface print targets", () => {
  assert.match(runner, /import \{ chromium \} from "playwright"/);
  assert.match(runner, /await printPage\.pdf\(/);
  assert.match(runner, /format: "A4"/);
  assert.match(runner, /__pgcR07A03PrintInvoked/);
  assert.match(runner, /questionIdentitySha256/);
  assert.match(runner, /answerIdentitySha256/);
  assert.match(runner, /PGC_R07_A03_QUESTION_ANSWER_BIJECTION_FAILED/);
  assert.match(runner, /PGC_R07_A03_CROSS_SURFACE_QUESTION_IDENTITY_DRIFT/);
  assert.match(runner, /PGC_R07_A03_CROSS_SURFACE_ANSWER_IDENTITY_DRIFT/);
  assert.match(runner, /overflowFindingCount/);
});

test("PGC-R07 A03 remains inside the frozen product boundary", () => {
  assert.deepEqual(contract.frozenBoundary, {
    generatorModified: false,
    validatorModified: false,
    rendererModified: false,
    productUiModified: false,
    knowledgePointModified: false,
    patternGroupModified: false,
    patternSpecModified: false,
    newWorkflowAdded: false,
    slice014Started: false,
  });
  assert.equal(contract.evidenceContract.workflow, ".github/workflows/node-test.yml");
  assert.equal(
    contract.evidenceContract.workflowPolicy,
    "EXISTING_WORKFLOW_BRANCH_SPECIFIC_STEP_NO_NEW_WORKFLOW",
  );
  assert.match(workflow, /name: Node Test/);
});
