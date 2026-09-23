import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import {
  G5A_U01_P03F28_GROUP_ID,
  G5A_U01_P03F28_KP_ID,
  G5A_U01_P03F28_SELECTOR_PROJECTION,
  G5A_U01_P03F28_SPEC_ID,
  auditG5AU01P03F28SelectorProjection,
} from "../../site/modules/curriculum/registry/g5a-u01-rank8-decimal-selector-projection-p03f28.js";
import {
  G5A_U01_DECIMAL_READ_PLACE_KP_ID,
  G5A_U01_DECIMAL_READ_PLACE_SPEC_ID,
} from "../../site/modules/curriculum/registry/g5a-u01-decimal-read-place-selector-projection.js";
import {
  BATCH_A_SELECTOR_AVAILABILITY,
  auditP03F28PublicSelectorComposition,
  listBatchAKnowledgePointAvailabilityBySource,
  listVisibleBatchAKnowledgePoints,
} from "../../site/modules/curriculum/registry/batch-a-selector-p03f28-extension.js";
import {
  P03F28_DECIMAL_CAPABILITY_IDS,
  validateP03F28PatternDefinitions,
} from "../../site/modules/curriculum/batch-a/source-pattern-full-product-p03f28-extension.js";
import { buildBatchABrowserPlan } from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p03f28.js";
import { generateBatchABrowserQuestions } from "../../site/modules/curriculum/batch-a/batch-a-browser-question-router-p03f28.js";
import {
  validateBatchABrowserPlan,
  validateBatchABrowserQuestion,
  validateBatchABrowserQuestions,
} from "../../site/modules/curriculum/batch-a/batch-a-browser-validator-p03f28.js";
import { buildBatchABrowserWorksheetDocument } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p03f28-extension.js";

const SOURCE_ID = "g5a_u01_5a01";
const AUTHORITY_PATH = "data/curriculum/full-product/p03f/slice028-g5a-u01-rank8-decimal-authority.json";
const QUEUE_PATH = "data/curriculum/full-product/p03e/w3-direct-product-vertical-slice-queue.json";
const BASE_OPTIONS = Object.freeze({
  sourceId: SOURCE_ID,
  selectionMode: "singleKnowledgePoint",
  selectedKnowledgePointIds: [G5A_U01_P03F28_KP_ID],
  selectedPatternGroupIds: [G5A_U01_P03F28_GROUP_ID],
  patternSpecIds: [G5A_U01_P03F28_SPEC_ID],
  questionMode: "numeric",
  questionCount: 24,
  generationSeed: "p03f28-focused",
  includeAnswerKey: true,
});

const canonical = (question) => `${question.whole}.${question.digits.join("")}`;

test("P03F28 frozen authority is queue position 28 and binds Slice027 D0 predecessor", () => {
  const authority = JSON.parse(fs.readFileSync(AUTHORITY_PATH, "utf8"));
  const queue = JSON.parse(fs.readFileSync(QUEUE_PATH, "utf8"));
  assert.equal(authority.taskId, "P03F_W3DirectProductVerticalSlice028Implementation");
  assert.equal(authority.queueAuthority.queuePosition, 28);
  assert.equal(authority.queueAuthority.sliceId, queue.orderedSliceIds[27]);
  assert.equal(authority.queueAuthority.sliceId, "p03e_q028_r8_g5a_u01_5a01_profile_decimal_c1");
  assert.equal(authority.queueAuthority.previousSliceId, queue.orderedSliceIds[26]);
  assert.equal(authority.queueAuthority.previousSliceD0Complete, true);
  assert.equal(authority.queueAuthority.previousSliceCloseoutEvidence.acceptedState, "PASS_D0_CLOSED");
  assert.equal(authority.knowledgePoints.length, 1);
  assert.equal(authority.knowledgePoints[0].knowledgePointId, G5A_U01_P03F28_KP_ID);
  assert.equal(authority.knowledgePoints[0].applicationClassification, "APPLICATION_NOT_APPLICABLE");
  assert.deepEqual(authority.knowledgePoints[0].requiredW3CapabilityIds, P03F28_DECIMAL_CAPABILITY_IDS);
  assert.equal(authority.productBoundary.nextTask, "P03F_W3DirectProductVerticalSlice029Implementation");
});

test("P03F28 selector adds exactly one numeric KP to existing G5A-U01", () => {
  assert.deepEqual(auditG5AU01P03F28SelectorProjection().errors, []);
  assert.deepEqual(auditP03F28PublicSelectorComposition().errors, []);
  assert.equal(G5A_U01_P03F28_SELECTOR_PROJECTION.knowledgePointCount, 1);
  assert.equal(G5A_U01_P03F28_SELECTOR_PROJECTION.patternGroupCount, 1);
  assert.equal(G5A_U01_P03F28_SELECTOR_PROJECTION.patternSpecCount, 1);
  assert.equal(G5A_U01_P03F28_SELECTOR_PROJECTION.applicationPatternSpecCount, 0);
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.visibleCount, 219);
  const availability = listBatchAKnowledgePointAvailabilityBySource(SOURCE_ID);
  assert.equal(availability.visibleCount, 2);
  assert.equal(availability.hiddenPendingCount, 6);
  assert.equal(availability.notSelectableCount, 6);
  assert.equal(listVisibleBatchAKnowledgePoints().filter((row) => row.sourceId === SOURCE_ID).length, 2);
});

test("P03F28 pattern definition uses shared decimal domain and number-system capabilities only", () => {
  assert.deepEqual(validateP03F28PatternDefinitions().errors, []);
  assert.deepEqual(P03F28_DECIMAL_CAPABILITY_IDS, [
    "cap_decimal_domain_validator",
    "cap_decimal_number_system",
  ]);
});

test("P03F28 plan is numeric-only and generic fallback is fail-closed", () => {
  const plan = buildBatchABrowserPlan(BASE_OPTIONS);
  assert.equal(plan.sourceId, SOURCE_ID);
  assert.equal(plan.questionMode, "numeric");
  assert.equal(plan.genericFallbackAllowed, false);
  assert.deepEqual(plan.patternSpecIds, [G5A_U01_P03F28_SPEC_ID]);
  assert.deepEqual(plan.requestedKnowledgePointIds, [G5A_U01_P03F28_KP_ID]);
  assert.equal(plan.publicControls.globalContextAuthority, "NOT_APPLICABLE_FOR_PUBLIC_SLICE028");
  assert.deepEqual(validateBatchABrowserPlan(plan).errors, []);
});

test("P03F28 generates 24 exact compose/decompose questions with zero-place witnesses", () => {
  const generation = generateBatchABrowserQuestions(BASE_OPTIONS);
  assert.equal(generation.ok, true, JSON.stringify(generation.errors));
  assert.equal(generation.questions.length, 24);
  assert.ok(generation.questions.every((question) => question.patternSpecId === G5A_U01_P03F28_SPEC_ID));
  assert.ok(generation.questions.every((question) => question.metadata.knowledgePointId === G5A_U01_P03F28_KP_ID));
  assert.ok(generation.questions.every((question) => question.metadata.patternGroupId === G5A_U01_P03F28_GROUP_ID));
  assert.ok(generation.questions.every((question) => question.questionMode === "numeric" && question.metadata.contextAuthority === null));
  assert.ok(generation.questions.every((question) => question.answerText === canonical(question)));
  assert.ok(generation.questions.every((question) => question.finalAnswer.canonicalText === canonical(question) && question.finalAnswer.exact === true));
  assert.ok(generation.questions.some((question) => question.digits.slice(1, -1).includes(0)), "expected an internal zero-place witness");
  assert.ok(generation.questions.some((question) => question.digits.at(-1) === 0), "expected a trailing zero-place witness");
  const validation = validateBatchABrowserQuestions(generation.questions);
  assert.equal(validation.ok, true, JSON.stringify(validation.errors));
});

test("P03F28 current G5A-U01 mixed selection balances read/place and compose/decompose", () => {
  const options = {
    ...BASE_OPTIONS,
    selectionMode: "mixedKnowledgePointsSameUnit",
    selectedKnowledgePointIds: [G5A_U01_DECIMAL_READ_PLACE_KP_ID, G5A_U01_P03F28_KP_ID],
    selectedPatternGroupIds: [],
    patternSpecIds: [G5A_U01_DECIMAL_READ_PLACE_SPEC_ID, G5A_U01_P03F28_SPEC_ID],
    questionCount: 24,
    generationSeed: "p03f28-mixed",
  };
  const generation = generateBatchABrowserQuestions(options);
  assert.equal(generation.ok, true, JSON.stringify(generation.errors));
  const counts = Object.fromEntries(generation.allocation.map((row) => [row.patternSpecId, row.questionCount]));
  assert.equal(counts[G5A_U01_DECIMAL_READ_PLACE_SPEC_ID], 12);
  assert.equal(counts[G5A_U01_P03F28_SPEC_ID], 12);
  assert.deepEqual([...new Set(generation.questions.map((q) => q.metadata.knowledgePointId))].sort(), [G5A_U01_DECIMAL_READ_PLACE_KP_ID, G5A_U01_P03F28_KP_ID].sort());
});

test("P03F28 validator rejects a tampered exact-decimal identity", () => {
  const generation = generateBatchABrowserQuestions({ ...BASE_OPTIONS, questionCount: 1 });
  assert.equal(generation.ok, true, JSON.stringify(generation.errors));
  const question = generation.questions[0];
  const tampered = { ...question, answerText: "999.999" };
  const validation = validateBatchABrowserQuestion(tampered);
  assert.equal(validation.ok, false);
  assert.ok(validation.errors.some((error) => error.code === "p03f28_exact_decimal_identity_invalid"));
});

test("P03F28 worksheet stays on shared pagination/renderer and answer-key alignment", () => {
  const result = buildBatchABrowserWorksheetDocument({
    ...BASE_OPTIONS,
    selectionMode: "mixedKnowledgePointsSameUnit",
    selectedKnowledgePointIds: [G5A_U01_DECIMAL_READ_PLACE_KP_ID, G5A_U01_P03F28_KP_ID],
    selectedPatternGroupIds: [],
    patternSpecIds: [G5A_U01_DECIMAL_READ_PLACE_SPEC_ID, G5A_U01_P03F28_SPEC_ID],
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const doc = result.worksheetDocument;
  assert.equal(doc.questionCount, 24);
  assert.equal(doc.questionDisplayModels.length, 24);
  assert.equal(doc.answerKeyItems.length, 24);
  assert.equal(doc.summary.applicationQuestionCount, 0);
  assert.equal(doc.metadata.hiddenApplicationLineagePreserved, true);
  assert.equal(doc.metadata.worksheetAdapter.sharedPagination, true);
  assert.equal(doc.metadata.worksheetAdapter.sharedRenderer, true);
  assert.equal(doc.metadata.worksheetAdapter.parallelPipeline, false);
  assert.deepEqual([...doc.metadata.knowledgePointIds].sort(), [G5A_U01_DECIMAL_READ_PLACE_KP_ID, G5A_U01_P03F28_KP_ID].sort());
  for (let index = 0; index < 24; index += 1) {
    assert.equal(doc.questionDisplayModels[index].questionId, doc.answerKeyItems[index].questionId);
    assert.equal(doc.questionDisplayModels[index].answerText, doc.answerKeyItems[index].answerText);
  }
});
