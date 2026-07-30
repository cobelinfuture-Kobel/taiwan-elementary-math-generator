import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const controller = JSON.parse(readFileSync(
  new URL("../../data/curriculum/public-generation/PGC-R07-A00.surface-renderer-print-scope.json", import.meta.url),
  "utf8",
));
const a03 = JSON.parse(readFileSync(
  new URL("../../data/curriculum/public-generation/PGC-R07-A03.chromium-print-answer-key-matrix.json", import.meta.url),
  "utf8",
));
const a04 = JSON.parse(readFileSync(
  new URL("../../data/curriculum/public-generation/PGC-R07-A04.overflow-clipping-font-pagination.json", import.meta.url),
  "utf8",
));
const a03Readback = readFileSync(
  new URL("../../docs/curriculum/output/PGC-R07-A03_RealChromiumPrintAndAnswerKeyMatrix.md", import.meta.url),
  "utf8",
);
const runner = readFileSync(
  new URL("../../tools/curriculum/run-pgc-r07-a04-overflow-clipping-font-pagination.mjs", import.meta.url),
  "utf8",
);

const CANONICAL_A04 = "PGC-R07-A04_OverflowClippingFontPaginationFullFix";
const NON_CANONICAL_ALIAS = "PGC-R07-A04_OverflowClippingFontAndPaginationFullFix";

test("PGC-R07 A04 uses the exact frozen controller milestone identity", () => {
  assert.ok(controller.orderedMilestones.includes(CANONICAL_A04));
  assert.equal(a04.taskId, CANONICAL_A04);
  assert.equal(a04.authorityReconciliation.canonicalTaskId, CANONICAL_A04);
  assert.equal(a03.goalDistance.nextShortestStep, CANONICAL_A04);
  assert.doesNotMatch(a03Readback, new RegExp(NON_CANONICAL_ALIAS));
});

test("PGC-R07 A04 covers all four renderer branches by answer-key on and off", () => {
  assert.equal(a04.scope.rendererBranchCount, 4);
  assert.equal(a04.scope.answerKeyModeCount, 2);
  assert.equal(a04.scope.expectedMatrixRowCount, 8);
  assert.deepEqual(a04.rendererBranches.map((row) => row.branchId), [
    "SHARED_EXACT_LAYOUT",
    "DYNAMIC_HTML",
    "STATIC_HTML_URL",
    "SHARED_FALLBACK",
  ]);
  assert.deepEqual(
    a04.rendererBranches.map((row) => row.branchId),
    controller.rendererBranchesToAudit.map((row) => row.branchId),
  );
});

test("PGC-R07 A04 implements every frozen print-quality acceptance dimension", () => {
  assert.deepEqual(a04.acceptanceDimensions, controller.acceptanceDimensions);
  for (const token of [
    "cardOverflowCount",
    "textOverflowCount",
    "pageOverflowCount",
    "clippingFindingCount",
    "interCardOverlapCount",
    "missingAnswerCount",
    "blankPageCount",
    "fontFailureCount",
    "questionAnswerBijectionFailureCount",
    "pdfPageCountMismatchCount",
  ]) {
    assert.match(runner, new RegExp(token));
  }
  assert.match(runner, /document\.fonts\?\.ready/);
  assert.match(runner, /CJK_SAMPLE/);
  assert.match(runner, /\/Type\\s\*\\\/Page\\b/);
  assert.match(runner, /printPreviewFrame/);
  assert.match(runner, /page\.pdf\(/);
});

test("PGC-R07 A04 audits compatibility branches without mutating question or answer content", () => {
  assert.equal(a04.branchWitnessRules.actualProductDocumentRequired, true);
  assert.equal(a04.branchWitnessRules.compatibilityProjectionMayOnlyRemoveHigherPriorityRendererAuthority, true);
  assert.equal(a04.branchWitnessRules.questionContentMutationAllowed, false);
  assert.equal(a04.branchWitnessRules.answerContentMutationAllowed, false);
  assert.equal(a04.branchWitnessRules.paginationContentMutationAllowed, false);
  assert.equal(a04.branchWitnessRules.rendererImplementationMutationAllowed, false);
  assert.match(runner, /withoutExactAuthority/);
  assert.match(runner, /delete document\.dynamicHtml/);
  assert.match(runner, /delete document\.staticHtmlUrl/);
});

test("PGC-R07 A04 preserves the product and program frozen boundary", () => {
  assert.deepEqual(a04.frozenBoundary, {
    generatorModified: false,
    validatorModified: false,
    productUiModified: false,
    knowledgePointModified: false,
    patternGroupModified: false,
    patternSpecModified: false,
    newWorkflowAdded: false,
    slice014Started: false,
    batchExpansionStarted: false,
  });
  assert.equal(a04.evidenceContract.workflow, ".github/workflows/node-test.yml");
  assert.equal(a04.goalDistance.nextShortestStep, "PGC-R07-A04_ExactHeadCIAndFullFixReadback");
});
