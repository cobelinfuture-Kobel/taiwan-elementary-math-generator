import test from "node:test";
import assert from "node:assert/strict";

import { buildWorksheetDocumentFromPlan } from "../../site/assets/browser/pipeline/build-worksheet-document.js";
import { buildBatchABrowserWorksheetDocument } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js";
import {
  G4A_U09_CURRENT_PUBLIC_KP_IDS,
  G4A_U09_HIDDEN_PENDING_KP_IDS,
} from "../../site/modules/curriculum/batch-a/g4a-u09-current-coordinator.js";
import {
  listBatchAKnowledgePointAvailabilityBySource,
  listVisibleBatchAKnowledgePoints,
} from "../../site/modules/curriculum/registry/batch-a-selector-p04f6-extension.js";

const SOURCE_ID = "g4a_u09_4a09";
const HUNDREDTH_KP = "kp_g4a_u09_hundredth_representation";
const COMPOSE_KP = "kp_g4a_u09_decimal_compose_decompose";
const base = Object.freeze({
  sourceId: SOURCE_ID,
  selectionMode: "singleKnowledgePoint",
  questionMode: "numeric",
  questionCount: 60,
  ordering: "groupedByPattern",
  includeAnswerKey: true,
  generationSeed: "g4a-u09-current-focused",
  printLayout: Object.freeze({ paperSize: "A4", columns: 2, rowsPerPage: 4, showQuestionNumbers: true, showAnswerKeyPage: true }),
});
const questions = (result) => result.worksheetDocument?.generatedQuestions ?? [];
const contentKey = (question) => `${question.patternSpecId}\u0000${question.blankedDisplayText}\u0000${question.answerText}`;
const contentKeys = (result) => questions(result).map(contentKey);

test("G4A-U09 current authority exposes exactly seven public KPs and one hidden pending KP", () => {
  const rows = listVisibleBatchAKnowledgePoints().filter((row) => row.sourceId === SOURCE_ID);
  const availability = listBatchAKnowledgePointAvailabilityBySource(SOURCE_ID);
  assert.deepEqual(rows.map((row) => row.knowledgePointId), G4A_U09_CURRENT_PUBLIC_KP_IDS);
  assert.equal(availability.visibleCount, 7);
  assert.equal(availability.hiddenPendingCount, 1);
  assert.deepEqual(G4A_U09_HIDDEN_PENDING_KP_IDS, ["kp_g4a_u09_decimal_length_conversion"]);
});

for (const knowledgePointId of [HUNDREDTH_KP, COMPOSE_KP]) {
  test(`G4A-U09 ${knowledgePointId} produces 60, 120, and 240 distinct current questions`, () => {
    for (const questionCount of [60, 120, 240]) {
      const result = buildBatchABrowserWorksheetDocument({ ...base, questionCount, selectedKnowledgePointIds: [knowledgePointId] });
      assert.equal(result.ok, true, JSON.stringify(result.errors));
      assert.equal(questions(result).length, questionCount);
      assert.equal(new Set(contentKeys(result)).size, questionCount);
      assert.equal(questions(result).every((row) => row.metadata?.knowledgePointId === knowledgePointId), true);
      assert.equal(result.worksheetDocument.questionCount, questionCount);
      assert.equal(result.worksheetDocument.answerKeyItems.length, questionCount);
    }
  });
}

test("G4A-U09 single-KP shuffle preserves the set, really changes order, and is seeded", () => {
  const options = { ...base, selectedKnowledgePointIds: [HUNDREDTH_KP] };
  const grouped = buildBatchABrowserWorksheetDocument(options);
  const shuffledA1 = buildBatchABrowserWorksheetDocument({ ...options, ordering: "shuffleAcrossPatterns" });
  const shuffledA2 = buildBatchABrowserWorksheetDocument({ ...options, ordering: "shuffleAcrossPatterns" });
  const shuffledB = buildBatchABrowserWorksheetDocument({ ...options, ordering: "shuffleAcrossPatterns", generationSeed: "g4a-u09-single-other" });
  assert.deepEqual([...contentKeys(grouped)].sort(), [...contentKeys(shuffledA1)].sort());
  assert.notDeepEqual(contentKeys(grouped), contentKeys(shuffledA1));
  assert.deepEqual(contentKeys(shuffledA1), contentKeys(shuffledA2));
  assert.notDeepEqual(contentKeys(shuffledA1), contentKeys(shuffledB));
});

test("G4A-U09 mixed-KP shuffle preserves membership and removes grouped blocks", () => {
  const options = { ...base, selectionMode: "mixedKnowledgePointsSameUnit", selectedKnowledgePointIds: [HUNDREDTH_KP, COMPOSE_KP] };
  const grouped = buildBatchABrowserWorksheetDocument(options);
  const shuffledA1 = buildBatchABrowserWorksheetDocument({ ...options, ordering: "shuffleAcrossPatterns" });
  const shuffledA2 = buildBatchABrowserWorksheetDocument({ ...options, ordering: "shuffleAcrossPatterns" });
  const shuffledB = buildBatchABrowserWorksheetDocument({ ...options, ordering: "shuffleAcrossPatterns", generationSeed: "g4a-u09-mixed-other" });
  assert.equal(grouped.ok, true, JSON.stringify(grouped.errors));
  assert.equal(shuffledA1.ok, true, JSON.stringify(shuffledA1.errors));
  assert.deepEqual([...contentKeys(grouped)].sort(), [...contentKeys(shuffledA1)].sort());
  assert.notDeepEqual(contentKeys(grouped), contentKeys(shuffledA1));
  assert.deepEqual(contentKeys(shuffledA1), contentKeys(shuffledA2));
  assert.notDeepEqual(contentKeys(shuffledA1), contentKeys(shuffledB));
  assert.deepEqual(new Set(questions(shuffledA1).map((row) => row.metadata?.knowledgePointId)), new Set([HUNDREDTH_KP, COMPOSE_KP]));
  const transitions = questions(shuffledA1).slice(1).filter((row, index) => row.metadata?.knowledgePointId !== questions(shuffledA1)[index].metadata?.knowledgePointId).length;
  assert.equal(transitions > 10, true, `expected a genuinely interleaved order, got ${transitions} transitions`);
});

test("G4A-U09 all-seven mixed mode represents every public KP", () => {
  const result = buildWorksheetDocumentFromPlan({ ...base, selectionMode: "mixedKnowledgePointsSameUnit", selectedKnowledgePointIds: G4A_U09_CURRENT_PUBLIC_KP_IDS, ordering: "shuffleAcrossPatterns" });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(questions(result).length, 60);
  assert.deepEqual(new Set(questions(result).map((row) => row.metadata?.knowledgePointId)), new Set(G4A_U09_CURRENT_PUBLIC_KP_IDS));
});

test("G4A-U09 hidden length-conversion KP cannot enter the current coordinator", () => {
  const result = buildBatchABrowserWorksheetDocument({ ...base, selectedKnowledgePointIds: G4A_U09_HIDDEN_PENDING_KP_IDS });
  assert.equal(result.ok, false);
  assert.equal(result.worksheetDocument, null);
  assert.equal(result.errors.some((row) => row.code === "g4a_u09_non_public_kp_rejected"), true);
});
