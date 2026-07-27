import test from "node:test";
import assert from "node:assert/strict";

import { materializeP03FSlice002ProductAdmission } from "../../src/curriculum/full-product/p03f-slice002-product-admission.mjs";
import { validateP03FSlice002ProductAdmission } from "../../tools/curriculum/validate-p03f-slice002-product-admission.mjs";
import { validateP03FSlice001ProductAdmission } from "../../tools/curriculum/validate-p03f-slice001-product-admission.mjs";
import {
  G3A_U08_UNIT_FRACTION_KP_ID,
  G3A_U08_DISCRETE_FRACTION_KP_ID,
  G3A_U08_UNIT_FRACTION_NUMERIC_GROUP_ID,
  G3A_U08_UNIT_FRACTION_APPLICATION_GROUP_ID,
  G3A_U08_DISCRETE_NUMERIC_GROUP_ID,
  G3A_U08_DISCRETE_APPLICATION_GROUP_ID,
} from "../../site/modules/curriculum/registry/g3a-u08-slice002-selector-projection.js";
import {
  generateG3AU08Slice002Questions,
  validateG3AU08Slice002Question,
} from "../../site/modules/curriculum/batch-a/slice002-fraction-runtime.js";
import { buildWorksheetDocumentFromPlan } from "../../site/assets/browser/pipeline/build-worksheet-document.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer.js";
import {
  listBatchAKnowledgePointAvailabilityBySource,
  listVisibleBatchAKnowledgePoints,
} from "../../site/modules/curriculum/registry/batch-a-selector-p03f2-extension.js";

const SOURCE_ID = "g3a_u08_3a08";
const KPS = [G3A_U08_DISCRETE_FRACTION_KP_ID, G3A_U08_UNIT_FRACTION_KP_ID];
const groups = (mode) => mode === "application"
  ? [G3A_U08_UNIT_FRACTION_APPLICATION_GROUP_ID, G3A_U08_DISCRETE_APPLICATION_GROUP_ID]
  : [G3A_U08_UNIT_FRACTION_NUMERIC_GROUP_ID, G3A_U08_DISCRETE_NUMERIC_GROUP_ID];
const plan = (mode, overrides = {}) => ({
  sourceId: SOURCE_ID,
  selectionMode: "mixedKnowledgePointsSameUnit",
  selectedKnowledgePointIds: KPS,
  selectedPatternGroupIds: groups(mode),
  questionMode: mode,
  questionCount: 6,
  ordering: "groupedByPattern",
  includeAnswerKey: true,
  generationSeed: `p03f2-focused-${mode}`,
  printLayout: { paperSize: "A4", columns: mode === "application" ? 1 : 2, rowsPerPage: 3, showQuestionNumbers: true, showAnswerKeyPage: true },
  ...overrides,
});

test("P03F2 consumes the exact two-KP frozen queue position 2", () => {
  const evidence = materializeP03FSlice002ProductAdmission();
  assert.equal(evidence.slice.queuePosition, 2);
  assert.equal(evidence.slice.sliceId, "p03e_q002_r5_g3a_u08_3a08_profile_fraction_c1");
  assert.equal(evidence.slice.previousSliceId, "p03e_q001_r4_g3a_u08_3a08_profile_fraction_c1");
  assert.deepEqual(evidence.slice.knowledgePointIds, KPS);
  assert.equal(evidence.predecessorPassed, true);
});

test("P03F2 deterministically generates three numeric and three application PatternSpecs", () => {
  for (const mode of ["numeric", "application"]) {
    const first = generateG3AU08Slice002Questions(plan(mode));
    const second = generateG3AU08Slice002Questions(plan(mode));
    assert.equal(first.ok, true, JSON.stringify(first.errors));
    assert.deepEqual(first.questions, second.questions);
    assert.equal(first.questions.length, 6);
    assert.equal(first.allocation.length, 3);
    assert.equal(new Set(first.questions.map((row) => row.patternSpecId)).size, 3);
    for (const question of first.questions) {
      assert.equal(question.questionMode, mode);
      assert.equal(validateG3AU08Slice002Question(question).ok, true);
      assert.ok(question.numerator > 0 && question.numerator < question.denominator);
      assert.doesNotMatch(question.blankedDisplayText, /(?:算式|_{2,}|答\s*[:：]|\{\{)/);
    }
  }
});

test("P03F2 preserves discrete quantity bidirectionally and fails closed on tampering", () => {
  const generated = generateG3AU08Slice002Questions(plan("numeric"));
  const discrete = generated.questions.filter((row) => row.operationFamilyId === "discrete_fraction_conversion");
  assert.ok(discrete.length >= 4);
  for (const question of discrete) {
    assert.equal((question.numerator * question.itemsPerWhole) % question.denominator, 0);
    assert.equal(question.itemCount, question.wholeUnits * question.itemsPerWhole + question.numerator * question.itemsPerWhole / question.denominator);
  }
  const original = discrete[0];
  assert.equal(validateG3AU08Slice002Question({ ...original, itemCount: original.itemCount + 1 }).ok, false);
  assert.equal(validateG3AU08Slice002Question({ ...original, itemsPerWhole: 11 }).ok, false);
  assert.equal(validateG3AU08Slice002Question({ ...original, numerator: original.denominator }).ok, false);
});

test("P03F2 application questions consume the three Global Context authority records", () => {
  const generated = generateG3AU08Slice002Questions(plan("application"));
  const macroIds = new Set(generated.questions.map((row) => row.metadata.contextLineage?.macroContextId));
  assert.deepEqual([...macroIds].sort(), ["gctx_macro_culture_history", "gctx_macro_health_sports", "gctx_macro_household_family"]);
  for (const question of generated.questions) {
    assert.equal(question.globalContextProduction.status, "GLOBAL_CONTEXT_BOUND");
    assert.match(question.metadata.applicationQuestionRecordId, /^app_qr_w02_/);
    assert.match(question.metadata.bindingCandidateId, /^w02_bind_/);
  }
});

test("P03F2 current selector exposes three G3A-U08 KPs while the source count stays 20", () => {
  const rows = listVisibleBatchAKnowledgePoints().filter((row) => row.sourceId === SOURCE_ID);
  assert.equal(rows.length, 3);
  assert.deepEqual(new Set(rows.map((row) => row.knowledgePointId)), new Set(["kp_g3a_u08_part_whole_fraction", ...KPS]));
  const availability = listBatchAKnowledgePointAvailabilityBySource(SOURCE_ID);
  assert.equal(availability.visibleCount, 3);
  assert.equal(availability.hiddenPendingCount, 4);
});

test("P03F2 shared worksheet and answer key render both modes", () => {
  for (const mode of ["numeric", "application"]) {
    const result = buildWorksheetDocumentFromPlan(plan(mode));
    assert.equal(result.ok, true, JSON.stringify(result.errors));
    assert.equal(result.worksheetDocument.generatedQuestions.length, 6);
    assert.equal(result.worksheetDocument.answerKeyItems.length, 6);
    const html = renderWorksheetDocumentToHtml(result.worksheetDocument, { stylesheetHref: "" });
    assert.match(html, /<!doctype html>/);
    assert.match(html, /worksheet-page--questions/);
    assert.match(html, /worksheet-page--answer-key/);
  }
});

test("P03F2 aggregate admission is E4 fail-closed before Chromium, and slice001 remains D0", () => {
  const predecessor = validateP03FSlice001ProductAdmission();
  assert.equal(predecessor.ok, true, JSON.stringify(predecessor.errors));
  const result = validateP03FSlice002ProductAdmission();
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.productAdmissionState, "PRODUCT_ACCEPTANCE_PENDING");
  assert.equal(result.d0Complete, false);
  assert.equal(result.metrics.questionWitnessCount, 12);
  assert.equal(result.metrics.answerKeyWitnessCount, 12);
  assert.equal(result.metrics.globalContextBindingCount, 3);
  assert.equal(result.metrics.newProductAdmissionCount, 0);
  assert.equal(result.metrics.remainingDirectSliceCount, 52);
  assert.equal(result.metrics.remainingDirectKnowledgePointCount, 81);
});
