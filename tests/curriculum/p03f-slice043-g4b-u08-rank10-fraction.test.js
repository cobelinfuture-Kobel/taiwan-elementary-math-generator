import test from "node:test";
import assert from "node:assert/strict";
import {
  BATCH_A_SELECTOR_AVAILABILITY,
  auditP03F43PublicSelectorComposition,
  listBatchAKnowledgePointAvailabilityBySource,
  listVisibleBatchAKnowledgePoints,
} from "../../site/modules/curriculum/registry/batch-a-selector-p03f43-extension.js";
import {
  G4B_U08_P03F43_BOUNDS_GROUP_ID,
  G4B_U08_P03F43_BOUNDS_KP_ID,
  G4B_U08_P03F43_BOUNDS_SPEC_ID,
  G4B_U08_P03F43_COORDINATE_SPEC_ID,
  G4B_U08_P03F43_DISTANCE_SPEC_ID,
  G4B_U08_P03F43_NUMBER_LINE_GROUP_ID,
  G4B_U08_P03F43_NUMBER_LINE_KP_ID,
  G4B_U08_P03F43_SOURCE_ID,
  P03F43_KP_IDS,
  P03F43_SPEC_IDS,
} from "../../site/modules/curriculum/registry/g4b-u08-rank10-fraction-selector-projection-p03f43.js";
import { generateG4BU08P03F43Questions, validateG4BU08P03F43Question } from "../../site/modules/curriculum/batch-a/g4b-u08-rank10-fraction-runtime-p03f43.js";
import { buildBatchABrowserWorksheetDocument } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p03f43-extension.js";

const BASE = {
  sourceId: G4B_U08_P03F43_SOURCE_ID,
  questionMode: "numeric",
  questionCount: 24,
  generationSeed: "p03f43-focused",
  includeAnswerKey: true,
  ordering: "groupedByPattern",
  printLayout: { paperSize: "A4", columns: 2, rowsPerPage: 4, showQuestionNumbers: true, showAnswerKeyPage: true },
};
const allTargetPlan = { ...BASE, selectionMode: "mixedKnowledgePointsSameUnit", requestedKnowledgePointIds: P03F43_KP_IDS, patternSpecIds: P03F43_SPEC_IDS, genericFallbackAllowed: false };

test("P03F43 selector promotes the final two G4B-U08 KPs to 33 sources / 243 visible KPs", () => {
  assert.equal(auditP03F43PublicSelectorComposition().ok, true);
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.sourceCount, 33);
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.visibleCount, 243);
  const availability = listBatchAKnowledgePointAvailabilityBySource(G4B_U08_P03F43_SOURCE_ID);
  assert.deepEqual([availability.visibleCount, availability.hiddenPendingCount, availability.notSelectableCount], [7, 0, 0]);
  const rows = listVisibleBatchAKnowledgePoints().filter((row) => row.sourceId === G4B_U08_P03F43_SOURCE_ID);
  assert.equal(rows.length, 7);
  for (const id of P03F43_KP_IDS) assert.equal(rows.some((row) => row.knowledgePointId === id), true);
});

test("P03F43 target runtime gives 8 exact witnesses per numeric PatternSpec", () => {
  const result = generateG4BU08P03F43Questions({ ...BASE, plan: allTargetPlan });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.questions.length, 24);
  assert.deepEqual(result.allocation.map((row) => row.questionCount), [8, 8, 8]);
  assert.equal(new Set(result.questions.map((question) => `${question.patternSpecId}|${question.blankedDisplayText}`)).size, 24);
  for (const question of result.questions) {
    assert.equal(validateG4BU08P03F43Question(question).ok, true);
    assert.equal(question.questionMode, "numeric");
    assert.equal(question.globalContextProduction, null);
    assert.equal(question.metadata.requiredCapabilityIds.includes("cap_fraction_arithmetic"), false);
  }
  assert.equal(result.questions.filter((question) => question.numberLine?.kind === "fraction_number_line").length, 16);
  assert.equal(result.questions.filter((question) => question.patternSpecId === G4B_U08_P03F43_BOUNDS_SPEC_ID).length, 8);
});

test("P03F43 exact validators fail closed on coordinate, distance and exhaustive bounds tampering", () => {
  const result = generateG4BU08P03F43Questions({ ...BASE, plan: allTargetPlan });
  const coordinate = result.questions.find((question) => question.patternSpecId === G4B_U08_P03F43_COORDINATE_SPEC_ID);
  const distance = result.questions.find((question) => question.patternSpecId === G4B_U08_P03F43_DISTANCE_SPEC_ID);
  const bounds = result.questions.find((question) => question.patternSpecId === G4B_U08_P03F43_BOUNDS_SPEC_ID);
  assert.equal(validateG4BU08P03F43Question({ ...coordinate, coordinateNumerator: coordinate.coordinateNumerator + 1 }).ok, false);
  assert.equal(validateG4BU08P03F43Question({ ...distance, distanceNumerator: distance.distanceNumerator + 1 }).ok, false);
  assert.equal(validateG4BU08P03F43Question({ ...bounds, possibleValues: bounds.possibleValues.slice(1) }).ok, false);
});

test("P03F43 mixed q043 worksheet uses both KPs and all three numeric PatternSpecs", () => {
  const options = {
    ...BASE,
    selectionMode: "mixedKnowledgePointsSameUnit",
    selectedKnowledgePointIds: [G4B_U08_P03F43_NUMBER_LINE_KP_ID, G4B_U08_P03F43_BOUNDS_KP_ID],
    selectedPatternGroupIds: [G4B_U08_P03F43_NUMBER_LINE_GROUP_ID, G4B_U08_P03F43_BOUNDS_GROUP_ID],
    patternSpecIds: P03F43_SPEC_IDS,
  };
  const result = buildBatchABrowserWorksheetDocument(options);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const doc = result.worksheetDocument;
  assert.equal(doc.generatedQuestions.length, 24);
  assert.equal(doc.answerKeyItems.length, 24);
  assert.equal(doc.questionPages.length, 3);
  assert.equal(doc.answerKeyPages.length, 3);
  assert.deepEqual(new Set(doc.metadata.knowledgePointIds), new Set(P03F43_KP_IDS));
  assert.deepEqual(new Set(doc.generatedQuestions.map((question) => question.patternSpecId)), new Set(P03F43_SPEC_IDS));
  assert.equal(doc.summary.fractionNumberLineQuestionCount, 16);
  assert.equal(doc.summary.mixedFractionBoundsQuestionCount, 8);
  assert.equal(doc.summary.applicationQuestionCount, 0);
  assert.equal(doc.metadata.applicationExpansion, false);
  assert.equal(doc.metadata.fractionArithmeticExpansion, false);
  assert.equal(doc.metadata.slice044Expansion, false);
  assert.equal(doc.metadata.worksheetAdapter.parallelPipeline, false);
});
