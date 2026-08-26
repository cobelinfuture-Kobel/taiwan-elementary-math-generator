import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const a00 = JSON.parse(readFileSync(
  new URL("../../data/curriculum/public-generation/PGC-R07-A00.surface-renderer-print-scope.json", import.meta.url),
  "utf8",
));
const a03 = JSON.parse(readFileSync(
  new URL("../../data/curriculum/public-generation/PGC-R07-A03.chromium-print-answer-key-matrix.json", import.meta.url),
  "utf8",
));
const contract = JSON.parse(readFileSync(
  new URL("../../data/curriculum/public-generation/PGC-R07-A04.overflow-clipping-font-pagination-matrix.json", import.meta.url),
  "utf8",
));
const runner = readFileSync(
  new URL("../../tools/curriculum/run-pgc-r07-a04-overflow-font-pagination-matrix.mjs", import.meta.url),
  "utf8",
);

const expectedBranches = [
  "SHARED_EXACT_LAYOUT",
  "DYNAMIC_HTML",
  "STATIC_HTML_URL",
  "SHARED_FALLBACK",
];

test("PGC-R07 A04 follows A03 and audits every frozen renderer branch", () => {
  assert.equal(a03.status, "PASS_EXACT_HEAD_CI_REAL_CHROMIUM_MATRIX");
  assert.equal(contract.taskId, "PGC-R07-A04_OverflowClippingFontPaginationFullFix");
  assert.equal(contract.previousTaskId, a03.taskId);
  assert.deepEqual(
    a00.rendererBranchesToAudit.map((row) => row.branchId),
    expectedBranches,
  );
  assert.deepEqual(
    contract.rendererBranches.map((row) => row.branchId),
    expectedBranches,
  );
  assert.equal(contract.scope.rendererBranchCount, 4);
});

test("PGC-R07 A04 locks two multi-page stress profiles and eight real PDF rows", () => {
  assert.equal(contract.scope.stressProfileCount, 2);
  assert.equal(contract.scope.expectedMatrixRowCount, 8);
  assert.deepEqual(contract.stressProfiles.map((row) => row.profileId), [
    "LONG_TEXT",
    "DENSE_NUMERIC",
  ]);
  for (const profile of contract.stressProfiles) {
    assert.ok(profile.questionCount > profile.columns * profile.rowsPerPage);
    assert.ok(profile.expectedQuestionPageCount >= 2);
    assert.ok(profile.expectedAnswerPageCount >= 2);
  }
});

test("PGC-R07 A04 locks all seven A00 geometry, font and answer dimensions", () => {
  const acceptance = contract.acceptanceContract;
  assert.equal(acceptance.pageOverflowFindingsAllowed, 0);
  assert.equal(acceptance.clippingFindingsAllowed, 0);
  assert.equal(acceptance.cellOverlapFindingsAllowed, 0);
  assert.equal(acceptance.blankPageFindingsAllowed, 0);
  assert.equal(acceptance.missingAnswerCountAllowed, 0);
  assert.equal(acceptance.questionAnswerBijectionRequired, true);
  assert.equal(acceptance.traditionalChineseFontRequired, true);
  assert.equal(acceptance.fontFaceLoadRequired, true);
  assert.equal(acceptance.replacementGlyphAllowed, false);
  assert.equal(acceptance.crossBranchQuestionIdentityRequiredPerProfile, true);
  assert.equal(acceptance.crossBranchAnswerIdentityRequiredPerProfile, true);
  assert.deepEqual(a00.acceptanceDimensions, [
    "NO_OVERFLOW",
    "NO_CLIPPING",
    "NO_QUESTION_OVERLAP",
    "NO_MISSING_ANSWERS",
    "NO_ABNORMAL_BLANK_PAGES",
    "TRADITIONAL_CHINESE_FONT_OK",
    "QUESTION_ANSWER_PAGE_BIJECTION",
  ]);
});

test("PGC-R07 A04 runner invokes actual branch routing and real Chromium PDF", () => {
  assert.match(runner, /import \{ chromium \} from "playwright"/);
  assert.match(runner, /render-preview-frame\.js/);
  assert.match(runner, /shouldUseSharedExactLayoutRenderer/);
  assert.match(runner, /renderPreviewFrame/);
  for (const branchId of expectedBranches) assert.match(runner, new RegExp(branchId));
  assert.match(runner, /await printPage\.pdf\(/);
  assert.match(runner, /format: "A4"/);
  assert.match(runner, /pageOverflowFindings/);
  assert.match(runner, /clippingFindings/);
  assert.match(runner, /overlapFindings/);
  assert.match(runner, /blankPageFindings/);
  assert.match(runner, /questionAnswerBijection/);
  assert.match(runner, /traditionalChineseFontOk/);
  assert.match(runner, /PGC_R07_A04_CROSS_BRANCH_QUESTION_IDENTITY_DRIFT/);
  assert.match(runner, /PGC_R07_A04_CROSS_BRANCH_ANSWER_IDENTITY_DRIFT/);
});

test("PGC-R07 A04 remains inside the frozen product boundary and preserves historical workflow evidence", () => {
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
});
