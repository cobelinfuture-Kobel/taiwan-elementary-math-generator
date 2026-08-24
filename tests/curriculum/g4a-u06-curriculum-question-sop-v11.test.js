import fs from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

import {
  G4A_U06_CURRENT_KP_IDS,
  G4A_U06_CURRENT_PATTERN_SPEC_IDS,
  generateG4AU06CurrentQuestions,
  validateG4AU06CurrentQuestion,
} from "../../site/modules/curriculum/batch-a/g4a-u06-current-coordinator.js";
import { buildBatchABrowserWorksheetDocument } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js";
import {
  G4A_U06_FRACTION_CLASSIFICATION_KP_ID,
  G4A_U06_FRACTION_CLASSIFICATION_SOURCE_ID,
} from "../../site/modules/curriculum/registry/g4a-u06-fraction-type-classification-selector-projection.js";
import { G4A_U06_P03F25_KP_ID } from "../../site/modules/curriculum/registry/g4a-u06-improper-mixed-conversion-selector-projection-p03f25.js";
import { G4A_U06_P03F33_KP_IDS } from "../../site/modules/curriculum/registry/g4a-u06-rank9-fraction-selector-projection-p03f33.js";
import {
  getVisibleBatchAKnowledgePoint,
  listBatchAKnowledgePointAvailabilityBySource,
  listVisibleBatchAKnowledgePoints,
  resolveVisiblePatternSpecIdsForKnowledgePoint,
} from "../../site/modules/curriculum/registry/batch-a-selector-p03f53-extension.js";
import { parseQueryState } from "../../site/assets/browser/state/query-state.js";

const SOURCE_ID = G4A_U06_FRACTION_CLASSIFICATION_SOURCE_ID;
const UNIT_LABEL = "4A-U06 假分數與帶分數";
const HIDDEN_PENDING_KP_ID = "kp_g4a_u06_fraction_times_integer_quantity";
const PUBLIC_KP_IDS = Object.freeze([...G4A_U06_CURRENT_KP_IDS]);
const SLICE017_KP_IDS = Object.freeze([G4A_U06_FRACTION_CLASSIFICATION_KP_ID]);
const SLICE025_KP_IDS = Object.freeze([G4A_U06_P03F25_KP_ID]);
const SLICE033_KP_IDS = Object.freeze([...G4A_U06_P03F33_KP_IDS]);
const SINGLE_COUNTS = Object.freeze([1, 20, 120, 121]);
const MIX_COUNTS = Object.freeze([20, 120, 240]);
const SEED_A = "unit-kp-order-a";
const SEED_B = "unit-kp-order-b";
const PRINT_LAYOUT = Object.freeze({
  paperSize: "A4",
  columns: 2,
  rowsPerPage: 4,
  showQuestionNumbers: true,
  showAnswerKeyPage: true,
});

const canonical = JSON.parse(fs.readFileSync(
  new URL("../../data/curriculum/knowledge/units/g4a_u06_4a06.knowledge-operation.json", import.meta.url),
  "utf8",
));

function normalizeVisibleText(question) {
  return String(question.blankedDisplayText ?? question.promptText ?? question.questionText ?? "")
    .normalize("NFKC")
    .replace(/\s+/g, "")
    .replace(/[，。！？、,:：;；]/g, "")
    .trim();
}

function questionIdentity(question) {
  return String(question.id ?? question.questionId ?? "").trim();
}

function questionSetKey(question) {
  return JSON.stringify({
    knowledgePointId: question.metadata?.knowledgePointId ?? null,
    patternSpecId: question.patternSpecId ?? null,
    visible: normalizeVisibleText(question),
    answer: String(question.answerText ?? question.finalAnswer ?? "").normalize("NFKC").trim(),
  });
}

function orderedSignature(questions) {
  return questions.map((question) => questionSetKey(question));
}

function assertNoDuplicates(questions, label) {
  const identities = questions.map(questionIdentity);
  assert.ok(identities.every(Boolean), `${label}: every question must have identity`);
  assert.equal(new Set(identities).size, questions.length, `${label}: duplicate identity`);

  const visible = questions.map(normalizeVisibleText);
  assert.ok(visible.every(Boolean), `${label}: every question must have learner-visible content`);
  assert.equal(new Set(visible).size, questions.length, `${label}: duplicate learner-visible question`);
}

function assertGroupedByPattern(questions, label) {
  const closed = new Set();
  let current = null;
  for (const question of questions) {
    const pattern = question.patternSpecId;
    if (pattern === current) continue;
    if (current !== null) closed.add(current);
    assert.equal(closed.has(pattern), false, `${label}: ${pattern} reappeared after its group closed`);
    current = pattern;
  }
}

function assertNotFixedRoundRobin(questions, label) {
  const sequence = questions.map((question) => question.patternSpecId);
  const maxPeriod = Math.max(1, new Set(sequence).size);
  for (let period = 1; period <= maxPeriod; period += 1) {
    let periodic = true;
    for (let index = period; index < sequence.length; index += 1) {
      if (sequence[index] !== sequence[index % period]) {
        periodic = false;
        break;
      }
    }
    assert.equal(periodic, false, `${label}: ordering is fixed periodic round-robin with period ${period}`);
  }
}

function flattenQuestionPageIds(document) {
  return document.questionPages.flatMap((page) => page.cells
    .filter((cell) => cell.cellType === "question")
    .map((cell) => cell.questionId));
}

function flattenAnswerPageIds(document) {
  return document.answerKeyPages.flatMap((page) => page.cells
    .filter((cell) => cell.cellType === "answerKey")
    .map((cell) => cell.questionId));
}

function assertWorksheetStructure(result, expectedCount, label) {
  assert.equal(result.ok, true, `${label}: ${JSON.stringify(result.errors ?? [])}`);
  assert.equal(result.validation?.ok, true, `${label}: worksheet/question validation failed`);
  const document = result.worksheetDocument;
  assert.ok(document, `${label}: worksheetDocument missing`);
  assert.equal(document.questionCount, expectedCount, `${label}: questionCount mismatch`);
  assert.equal(document.generatedQuestions.length, expectedCount, `${label}: generatedQuestions mismatch`);
  assert.equal(document.questions.length, expectedCount, `${label}: questions mismatch`);
  assert.equal(document.questionDisplayModels.length, expectedCount, `${label}: questionDisplayModels mismatch`);
  assert.equal(document.answerKeyItems.length, expectedCount, `${label}: answerKeyItems mismatch`);

  const questionIds = document.generatedQuestions.map((question) => question.id);
  const displayIds = document.questionDisplayModels.map((model) => model.questionId);
  const answerIds = document.answerKeyItems.map((answer) => answer.questionId);
  assert.deepEqual(displayIds, questionIds, `${label}: display order differs from generation order`);
  assert.deepEqual(answerIds, questionIds, `${label}: answer order differs from generation order`);
  assert.deepEqual(flattenQuestionPageIds(document), questionIds, `${label}: question pagination lost/reordered items`);
  assert.deepEqual(flattenAnswerPageIds(document), questionIds, `${label}: answer pagination lost/reordered items`);

  document.answerKeyItems.forEach((answer, index) => {
    const question = document.generatedQuestions[index];
    assert.equal(answer.questionId, question.id, `${label}: answer questionId mismatch @${index}`);
    assert.equal(answer.answerText, question.answerText, `${label}: answerText mismatch @${index}`);
    assert.equal(answer.knowledgePointId, question.metadata?.knowledgePointId, `${label}: answer KP mismatch @${index}`);
  });
}

function buildCase({ knowledgePointIds, questionCount, ordering = "groupedByPattern", generationSeed }) {
  const selectionMode = knowledgePointIds.length === 1
    ? "singleKnowledgePoint"
    : "mixedKnowledgePointsSameUnit";
  return buildBatchABrowserWorksheetDocument({
    sourceId: SOURCE_ID,
    selectionMode,
    selectedKnowledgePointIds: [...knowledgePointIds],
    questionMode: "numeric",
    questionCount,
    ordering,
    generationSeed,
    includeAnswerKey: true,
    printLayout: PRINT_LAYOUT,
  });
}

function assertRuntimeCase({ knowledgePointIds, questionCount, ordering = "groupedByPattern", generationSeed, label }) {
  const result = buildCase({ knowledgePointIds, questionCount, ordering, generationSeed });
  assertWorksheetStructure(result, questionCount, label);
  const questions = result.worksheetDocument.generatedQuestions;
  assert.equal(questions.length, questionCount, `${label}: output count mismatch`);
  assertNoDuplicates(questions, label);

  const selectedSet = new Set(knowledgePointIds);
  const observedKps = new Set();
  for (const question of questions) {
    assert.equal(question.sourceId, SOURCE_ID, `${label}: sourceId mismatch`);
    const kpId = question.metadata?.knowledgePointId;
    assert.equal(selectedSet.has(kpId), true, `${label}: unselected KP leaked: ${kpId}`);
    observedKps.add(kpId);
    const allowedSpecs = resolveVisiblePatternSpecIdsForKnowledgePoint(kpId, "numeric");
    assert.equal(allowedSpecs.includes(question.patternSpecId), true, `${label}: PatternSpec not allowed for ${kpId}: ${question.patternSpecId}`);
    const validation = validateG4AU06CurrentQuestion(question);
    assert.equal(validation.ok, true, `${label}: question validator failed: ${JSON.stringify(validation.errors)}`);
    assert.ok(String(question.answerText ?? question.finalAnswer ?? "").trim(), `${label}: answer missing`);
  }

  assert.deepEqual([...observedKps].sort(), [...selectedSet].sort(), `${label}: at least one selected KP produced no question`);
  const allocation = result.generation.knowledgePointAllocation ?? [];
  assert.equal(allocation.length, knowledgePointIds.length, `${label}: allocation KP count mismatch`);
  const counts = allocation.map((entry) => entry.questionCount);
  assert.ok(Math.max(...counts) - Math.min(...counts) <= 1, `${label}: unweighted allocation differs by more than 1`);
  return result;
}

function crossSlicePairs() {
  const pairs = [];
  for (const a of SLICE017_KP_IDS) for (const b of SLICE025_KP_IDS) pairs.push([a, b]);
  for (const a of SLICE017_KP_IDS) for (const b of SLICE033_KP_IDS) pairs.push([a, b]);
  for (const a of SLICE025_KP_IDS) for (const b of SLICE033_KP_IDS) pairs.push([a, b]);
  return pairs;
}

test("G4A-U06 SOP v1.1 preflight locks canonical/open/hidden denominator and public wiring", () => {
  assert.equal(canonical.sourceNodeId, SOURCE_ID);
  assert.equal(canonical.counts.knowledgePointCandidateCount, 6);
  assert.equal(canonical.knowledgePoints.length, 6);
  assert.equal(canonical.knowledgePoints.some((row) => row.candidateId === HIDDEN_PENDING_KP_ID), true);

  assert.equal(PUBLIC_KP_IDS.length, 5);
  assert.equal(new Set(PUBLIC_KP_IDS).size, 5);
  assert.equal(G4A_U06_CURRENT_PATTERN_SPEC_IDS.length, 10);
  assert.equal(new Set(G4A_U06_CURRENT_PATTERN_SPEC_IDS).size, 10);

  const availability = listBatchAKnowledgePointAvailabilityBySource(SOURCE_ID);
  assert.equal(availability.visibleCount, 5);
  assert.equal(availability.hiddenPendingCount, 1);
  assert.equal(availability.notSelectableCount, 0);

  const publicRows = listVisibleBatchAKnowledgePoints().filter((row) => row.sourceId === SOURCE_ID);
  assert.deepEqual(publicRows.map((row) => row.knowledgePointId).sort(), [...PUBLIC_KP_IDS].sort());
  assert.equal(getVisibleBatchAKnowledgePoint(HIDDEN_PENDING_KP_ID), null);
  for (const kpId of PUBLIC_KP_IDS) {
    assert.ok(getVisibleBatchAKnowledgePoint(kpId), `public KP missing from current selector: ${kpId}`);
    assert.ok(resolveVisiblePatternSpecIdsForKnowledgePoint(kpId, "numeric").length > 0, `numeric PatternSpec missing: ${kpId}`);
  }
});

test("G4A-U06 SOP v1.1 hidden-pending forced query is dropped and restored to a safe sourceUnit state", () => {
  const state = parseQueryState(`?sourceId=${SOURCE_ID}&selectionMode=singleKnowledgePoint&kp=${HIDDEN_PENDING_KP_ID}&questionCount=20&ordering=groupedByPattern`);
  assert.equal(state.sourceId, SOURCE_ID);
  assert.equal(state.selectionMode, "sourceUnit");
  assert.deepEqual(state.selectedKnowledgePointIds, []);
  assert.ok(state.selectorWarnings.some((row) => row.code === "selector_id_dropped"));
  assert.ok(state.selectorWarnings.some((row) => row.code === "selector_mode_fallback"));

  const result = buildBatchABrowserWorksheetDocument({
    sourceId: state.sourceId,
    selectionMode: state.selectionMode,
    selectedKnowledgePointIds: state.selectedKnowledgePointIds,
    questionMode: "numeric",
    questionCount: state.questionCount,
    ordering: state.ordering,
    generationSeed: "hidden-query-safe-state",
    includeAnswerKey: true,
    printLayout: PRINT_LAYOUT,
  });
  assertWorksheetStructure(result, 20, "hidden-query-safe-state");
  assert.equal(result.worksheetDocument.generatedQuestions.some((question) => question.metadata?.knowledgePointId === HIDDEN_PENDING_KP_ID), false);
});

for (const kpId of PUBLIC_KP_IDS) {
  for (const questionCount of SINGLE_COUNTS) {
    test(`G4A-U06 SOP v1.1 single ${kpId} supports ${questionCount} distinct validated questions`, () => {
      assertRuntimeCase({
        knowledgePointIds: [kpId],
        questionCount,
        ordering: "groupedByPattern",
        generationSeed: `sop-v11-single:${kpId}:${questionCount}`,
        label: `single:${kpId}:${questionCount}`,
      });
    });
  }
}

const REQUIRED_CROSS_SLICE_PAIRS = crossSlicePairs();
assert.equal(REQUIRED_CROSS_SLICE_PAIRS.length, 7);
for (const pair of REQUIRED_CROSS_SLICE_PAIRS) {
  for (const questionCount of MIX_COUNTS) {
    test(`G4A-U06 SOP v1.1 cross-slice ${pair.join("+")} supports ${questionCount}`, () => {
      assertRuntimeCase({
        knowledgePointIds: pair,
        questionCount,
        ordering: "groupedByPattern",
        generationSeed: `sop-v11-cross:${pair.join(":")}:${questionCount}`,
        label: `cross:${pair.join("+")}:${questionCount}`,
      });
    });
  }
}

for (const questionCount of MIX_COUNTS) {
  test(`G4A-U06 SOP v1.1 all five public KPs support ${questionCount}`, () => {
    assertRuntimeCase({
      knowledgePointIds: PUBLIC_KP_IDS,
      questionCount,
      ordering: "groupedByPattern",
      generationSeed: `sop-v11-all:${questionCount}`,
      label: `all-five:${questionCount}`,
    });
  });
}

test("G4A-U06 SOP v1.1 groupedByPattern keeps every PatternSpec in one contiguous block", () => {
  const result = assertRuntimeCase({
    knowledgePointIds: PUBLIC_KP_IDS,
    questionCount: 120,
    ordering: "groupedByPattern",
    generationSeed: SEED_A,
    label: "ordering:grouped:seed-a",
  });
  assertGroupedByPattern(result.worksheetDocument.generatedQuestions, "ordering:grouped:seed-a");
});

test("G4A-U06 SOP v1.1 seeded shuffle is reproducible, changes across seeds, preserves the set, and is not round-robin", () => {
  const grouped = assertRuntimeCase({
    knowledgePointIds: PUBLIC_KP_IDS,
    questionCount: 120,
    ordering: "groupedByPattern",
    generationSeed: SEED_A,
    label: "ordering:grouped:seed-a:set",
  });
  const shuffledA1 = assertRuntimeCase({
    knowledgePointIds: PUBLIC_KP_IDS,
    questionCount: 120,
    ordering: "shuffleAcrossPatterns",
    generationSeed: SEED_A,
    label: "ordering:shuffle:seed-a:first",
  });
  const shuffledA2 = assertRuntimeCase({
    knowledgePointIds: PUBLIC_KP_IDS,
    questionCount: 120,
    ordering: "shuffleAcrossPatterns",
    generationSeed: SEED_A,
    label: "ordering:shuffle:seed-a:second",
  });
  const shuffledB = assertRuntimeCase({
    knowledgePointIds: PUBLIC_KP_IDS,
    questionCount: 120,
    ordering: "shuffleAcrossPatterns",
    generationSeed: SEED_B,
    label: "ordering:shuffle:seed-b",
  });

  const groupedQuestions = grouped.worksheetDocument.generatedQuestions;
  const a1 = shuffledA1.worksheetDocument.generatedQuestions;
  const a2 = shuffledA2.worksheetDocument.generatedQuestions;
  const b = shuffledB.worksheetDocument.generatedQuestions;

  assert.deepEqual(orderedSignature(a1), orderedSignature(a2), "same seed + options must reproduce content and order");
  assert.notDeepEqual(orderedSignature(a1), orderedSignature(b), "different seed must change content or order");
  assert.deepEqual([...orderedSignature(groupedQuestions)].sort(), [...orderedSignature(a1)].sort(), "grouped and shuffled with same seed must preserve the same set");
  assert.notDeepEqual(orderedSignature(groupedQuestions), orderedSignature(a1), "shuffle must differ from grouped ordering");
  assertNotFixedRoundRobin(a1, "ordering:shuffle:seed-a");
});

test("G4A-U06 SOP v1.1 direct coordinator never allocates the hidden pending KP", () => {
  const generation = generateG4AU06CurrentQuestions({
    sourceId: SOURCE_ID,
    selectionMode: "mixedKnowledgePointsSameUnit",
    selectedKnowledgePointIds: [...PUBLIC_KP_IDS, HIDDEN_PENDING_KP_ID],
    questionMode: "numeric",
    questionCount: 240,
    ordering: "groupedByPattern",
    generationSeed: "hidden-allocation-guard",
  });
  assert.equal(generation.ok, true, JSON.stringify(generation.errors));
  assert.equal(generation.questions.length, 240);
  assert.equal(generation.questions.some((question) => question.metadata?.knowledgePointId === HIDDEN_PENDING_KP_ID), false);
  assert.equal(generation.knowledgePointAllocation.some((row) => row.knowledgePointId === HIDDEN_PENDING_KP_ID), false);
});

console.log(JSON.stringify({
  authority: "SOP-curriculum-question-generation-validation-v1.1",
  unitLabel: UNIT_LABEL,
  sourceId: SOURCE_ID,
  canonicalKnowledgePointCount: 6,
  openSelectableKnowledgePointCount: PUBLIC_KP_IDS.length,
  hiddenPendingKnowledgePointCount: 1,
  hiddenPendingKnowledgePointId: HIDDEN_PENDING_KP_ID,
  capacityValidationDenominator: PUBLIC_KP_IDS.length,
  singleRequiredCounts: SINGLE_COUNTS,
  crossSlicePairCount: REQUIRED_CROSS_SLICE_PAIRS.length,
  mixedRequiredCounts: MIX_COUNTS,
  single240Claimed: false,
}, null, 2));
