import test from "node:test";
import assert from "node:assert/strict";

import {
  G4A_U06_P04F27_KP_ID,
} from "../../site/modules/curriculum/registry/g4a-u06-fraction-times-integer-quantity-selector-projection-p04f27.js";
import {
  G4A_U06_FRACTION_CLASSIFICATION_KP_ID,
} from "../../site/modules/curriculum/registry/g4a-u06-fraction-type-classification-selector-projection.js";
import {
  generateG4AU06P04F27FractionTimesIntegerQuantityQuestions,
  validateG4AU06P04F27Question,
} from "../../site/modules/curriculum/batch-a/fraction-times-integer-quantity-runtime-p04f27.js";
import {
  buildG4AU06CurrentPlan,
  generateG4AU06CurrentQuestions,
  G4A_U06_CURRENT_KP_IDS,
} from "../../site/modules/curriculum/batch-a/g4a-u06-current-coordinator.js";
import { buildBatchABrowserWorksheetDocument } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js";
import { resolvePublicUiCapabilityBinding } from "../../site/modules/curriculum/public/public-ui-capability-binding-p04f27.js";

const sourceId = "g4a_u06_4a06";
const single = (questionCount, generationSeed = "g4a-u06-q027-capacity") => ({
  sourceId,
  selectionMode: "singleKnowledgePoint",
  selectedKnowledgePointIds: [G4A_U06_P04F27_KP_ID],
  questionMode: "application",
  questionCount,
  generationSeed,
  ordering: "shuffleAcrossPatterns",
});
const mixed = (questionCount = 120, generationSeed = "g4a-u06-q027-mixed") => ({
  sourceId,
  selectionMode: "mixedKnowledgePointsSameUnit",
  selectedKnowledgePointIds: [G4A_U06_P04F27_KP_ID, G4A_U06_FRACTION_CLASSIFICATION_KP_ID],
  questionMode: "mixed",
  questionCount,
  generationSeed,
  ordering: "shuffleAcrossPatterns",
  includeAnswerKey: true,
  printLayout: { paperSize: "A4", columns: 2, rowsPerPage: 4, showQuestionNumbers: true, showAnswerKeyPage: true },
});

test("G4A-U06 current authority contains all six public KPs", () => {
  assert.equal(G4A_U06_CURRENT_KP_IDS.length, 6);
  assert.equal(G4A_U06_CURRENT_KP_IDS.includes(G4A_U06_P04F27_KP_ID), true);
});

test("fraction-times-integer produces 120, 121, and 240 distinct exact questions", () => {
  for (const count of [120, 121, 240]) {
    const options = single(count, `capacity-${count}`);
    const result = generateG4AU06P04F27FractionTimesIntegerQuantityQuestions({ ...options, plan: { ...options, patternSpecIds: ["ps_g4a_u06_fraction_times_integer_quantity_application"] } });
    assert.equal(result.ok, true, JSON.stringify(result.errors));
    assert.equal(result.questions.length, count);
    assert.equal(new Set(result.questions.map((question) => question.blankedDisplayText)).size, count);
    assert.equal(result.questions.every((question) => validateG4AU06P04F27Question(question).ok), true);
    assert.equal(result.questions.some((question) => question.metadata.quantityDimension === "CAPACITY" && question.metadata.unit === "公升"), true);
    assert.equal(result.questions.every((question) => question.metadata.unitConversion === false), true);
  }
});

test("fraction-times-integer seed is reproducible and different seeds change real order", () => {
  const generate = (seed) => generateG4AU06P04F27FractionTimesIntegerQuantityQuestions({ ...single(120, seed), plan: { ...single(120, seed), patternSpecIds: ["ps_g4a_u06_fraction_times_integer_quantity_application"] } }).questions.map((question) => question.id);
  const first = generate("seed-a");
  assert.deepEqual(generate("seed-a"), first);
  assert.notDeepEqual(generate("seed-b"), first);
  assert.deepEqual([...generate("seed-b")].sort(), [...first].sort());
});

test("q027 mixes with another G4A-U06 numeric KP through the shared coordinator", () => {
  const options = mixed();
  const plan = buildG4AU06CurrentPlan(options);
  assert.equal(plan.questionMode, "mixed");
  const result = generateG4AU06CurrentQuestions({ ...options, plan });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.questions.length, 120);
  const counts = Object.fromEntries(result.knowledgePointAllocation.map((entry) => [entry.knowledgePointId, entry.questionCount]));
  assert.deepEqual(counts, { [G4A_U06_P04F27_KP_ID]: 60, [G4A_U06_FRACTION_CLASSIFICATION_KP_ID]: 60 });
  assert.equal(result.questions.some((question) => question.questionMode === "application"), true);
  assert.equal(result.questions.some((question) => question.questionMode === "numeric"), true);
});

test("all six G4A-U06 KPs generate together at 240 with every KP represented", () => {
  const options = {
    sourceId,
    selectionMode: "mixedKnowledgePointsSameUnit",
    selectedKnowledgePointIds: [...G4A_U06_CURRENT_KP_IDS],
    questionMode: "mixed",
    questionCount: 240,
    generationSeed: "g4a-u06-all-six",
    ordering: "shuffleAcrossPatterns",
  };
  const plan = buildG4AU06CurrentPlan(options);
  const result = generateG4AU06CurrentQuestions({ ...options, plan });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.questions.length, 240);
  assert.equal(new Set(result.questions.map((question) => question.blankedDisplayText)).size, 240);
  assert.deepEqual(new Set(result.questions.map((question) => question.knowledgePointId ?? question.metadata?.knowledgePointId)), new Set(G4A_U06_CURRENT_KP_IDS));
  assert.equal(result.knowledgePointAllocation.every((entry) => entry.questionCount === 40), true);
});

test("mixed public binding and worksheet expose 240 ceiling with numeric and application output", () => {
  const options = mixed();
  const binding = resolvePublicUiCapabilityBinding(options);
  assert.equal(binding.blocked, false);
  assert.equal(binding.questionType, "mixed");
  assert.equal(binding.questionCount.max, 240);
  assert.equal(binding.selectedKnowledgePointCount, 2);
  const result = buildBatchABrowserWorksheetDocument(options);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.worksheetDocument.summary.questionCount, 120);
  assert.equal(result.worksheetDocument.summary.applicationQuestionCount, 60);
  assert.equal(result.worksheetDocument.summary.numericQuestionCount, 60);
  assert.equal(result.worksheetDocument.metadata.unitConversion, false);
});
