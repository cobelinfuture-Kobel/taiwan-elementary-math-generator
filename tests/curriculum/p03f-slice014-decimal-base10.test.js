import test from "node:test";
import assert from "node:assert/strict";

import { materializeP03FSlice014ProductAdmission } from "../../src/curriculum/full-product/p03f-slice014-product-admission.mjs";
import { validateP03FSlice014ProductAdmission } from "../../tools/curriculum/validate-p03f-slice014-product-admission.mjs";
import {
  G5B_U05_DECIMAL_BASE10_SOURCE_ID,
  G5B_U05_DECIMAL_BASE10_KP_ID,
  G5B_U05_DECIMAL_BASE10_GROUP_ID,
  G5B_U05_DECIMAL_BASE10_PATTERN_SPEC_IDS,
} from "../../site/modules/curriculum/registry/g5b-u05-decimal-base10-selector-projection.js";
import {
  generateG5BU05DecimalBase10Questions,
  validateG5BU05DecimalBase10Question,
} from "../../site/modules/curriculum/batch-a/decimal-base10-structure-runtime.js";
import { listVisibleBatchAKnowledgePoints } from "../../site/modules/curriculum/registry/batch-a-selector-p03f14-extension.js";
import { buildWorksheetDocumentFromPlan } from "../../site/assets/browser/pipeline/build-worksheet-document.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer.js";

const CAPS = ["cap_decimal_domain_validator", "cap_decimal_number_system"];
const plan = (overrides = {}) => ({
  sourceId: G5B_U05_DECIMAL_BASE10_SOURCE_ID,
  selectionMode: "singleKnowledgePoint",
  selectedKnowledgePointIds: [G5B_U05_DECIMAL_BASE10_KP_ID],
  selectedPatternGroupIds: [G5B_U05_DECIMAL_BASE10_GROUP_ID],
  questionMode: "numeric",
  questionCount: 16,
  ordering: "groupedByPattern",
  includeAnswerKey: true,
  generationSeed: "p03f14-focused",
  printLayout: { paperSize: "A4", columns: 2, rowsPerPage: 5, showQuestionNumbers: true, showAnswerKeyPage: true },
  ...overrides,
});

test("P03F14 consumes exact queue position 14 after Slice013 D0", () => {
  const evidence = materializeP03FSlice014ProductAdmission();
  assert.equal(evidence.predecessorPassed, true);
  assert.equal(evidence.slice.queuePosition, 14);
  assert.equal(evidence.slice.sliceId, "p03e_q014_r6_g5b_u05_5b05a_profile_decimal_c1");
  assert.equal(evidence.slice.previousSliceId, "p03e_q013_r6_g5a_u04_5a04_profile_fraction_c1");
  assert.deepEqual(evidence.slice.knowledgePointIds, [G5B_U05_DECIMAL_BASE10_KP_ID]);
  assert.deepEqual(evidence.slice.requiredW3CapabilityIds, CAPS);
});

test("P03F14 preserves the R02 source-backed decimal base-10 boundary", () => {
  const evidence = materializeP03FSlice014ProductAdmission();
  assert.equal(evidence.authority.knowledgePoint.canonicalNameZh, "整數小數十進位結構");
  assert.equal(evidence.authority.knowledgePoint.capabilityStatement, "學生能連結整數位與小數位的10倍、十分之一關係。");
  assert.equal(evidence.authority.knowledgePoint.reasoningInvariant, "小數點兩側相鄰位值均維持10倍關係。");
  assert.deepEqual(evidence.authority.knowledgePoint.requiredCapabilityIds, CAPS);
  assert.equal(evidence.unblockRow.capabilityUnblocked, true);
  assert.deepEqual(evidence.unblockRow.requiredW3CapabilityIds, CAPS);
});

test("P03F14 adds one KP to the existing four-KP G5B-U05 W1 source without a new source", () => {
  const evidence = materializeP03FSlice014ProductAdmission();
  const rows = listVisibleBatchAKnowledgePoints().filter((row) => row.sourceId === G5B_U05_DECIMAL_BASE10_SOURCE_ID);
  assert.equal(rows.length, 5);
  assert.equal(rows.filter((row) => row.knowledgePointId === G5B_U05_DECIMAL_BASE10_KP_ID).length, 1);
  assert.equal(evidence.metrics.newPublicSourceCount, 0);
  assert.equal(evidence.currentSources.filter((row) => row.sourceId === G5B_U05_DECIMAL_BASE10_SOURCE_ID).length, 1);
  assert.equal(evidence.availability.visibleCount, 5);
  assert.equal(evidence.availability.hiddenPendingCount, 0);
});

test("P03F14 deterministically generates sixteen unique witnesses across both PatternSpecs", () => {
  const first = generateG5BU05DecimalBase10Questions(plan());
  const second = generateG5BU05DecimalBase10Questions(plan());
  assert.equal(first.ok, true, JSON.stringify(first.errors));
  assert.deepEqual(first.questions, second.questions);
  assert.equal(first.questions.length, 16);
  assert.equal(new Set(first.questions.map((row) => row.blankedDisplayText)).size, 16);
  assert.deepEqual([...new Set(first.questions.map((row) => row.patternSpecId))].sort(), [...G5B_U05_DECIMAL_BASE10_PATTERN_SPEC_IDS].sort());
  assert.ok(first.questions.some((row) => row.crossDecimalPoint === true));
  assert.ok(first.questions.some((row) => row.crossDecimalPoint === false));
  for (const question of first.questions) {
    assert.equal(question.relationBase, 10);
    assert.deepEqual(question.metadata.requiredCapabilityIds, CAPS);
    assert.equal(question.metadata.applicationClassification, "APPLICATION_NOT_APPLICABLE");
    assert.equal(validateG5BU05DecimalBase10Question(question).ok, true);
  }
});

test("P03F14 validator rejects base-10, PatternSpec and application tampering", () => {
  const original = generateG5BU05DecimalBase10Questions(plan({ questionCount: 2 })).questions[0];
  assert.equal(validateG5BU05DecimalBase10Question({ ...original, relationBase: 100 }).ok, false);
  assert.equal(validateG5BU05DecimalBase10Question({ ...original, questionMode: "application" }).ok, false);
  assert.equal(validateG5BU05DecimalBase10Question({ ...original, crossDecimalPoint: !original.crossDecimalPoint }).ok, false);
  assert.equal(validateG5BU05DecimalBase10Question({ ...original, metadata: { ...original.metadata, requiredCapabilityIds: ["cap_decimal_arithmetic"] } }).ok, false);
});

test("P03F14 shared worksheet and answer key render all sixteen items", () => {
  const result = buildWorksheetDocumentFromPlan(plan());
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.worksheetDocument.generatedQuestions.length, 16);
  assert.equal(result.worksheetDocument.answerKeyItems.length, 16);
  const html = renderWorksheetDocumentToHtml(result.worksheetDocument, { stylesheetHref: "" });
  assert.match(html, /<!doctype html>/);
  assert.match(html, /worksheet-page--questions/);
  assert.match(html, /worksheet-page--answer-key/);
});

test("P03F14 pre-D0 validator passes implementation while remaining fail-closed on production admission", () => {
  const result = validateP03FSlice014ProductAdmission();
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.productAdmissionState, "RUNTIME_CONNECTED_PENDING_CHROMIUM_ACCEPTANCE");
  assert.equal(result.d0Complete, false);
  assert.equal(result.metrics.newProductAdmissionCount, 0);
  assert.equal(result.metrics.questionWitnessCount, 16);
  assert.equal(result.metrics.answerKeyWitnessCount, 16);
});
