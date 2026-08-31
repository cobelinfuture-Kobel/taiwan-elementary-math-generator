import test from "node:test";
import assert from "node:assert/strict";

import {
  G3A_U08_CURRENT_KP_IDS,
  generateG3AU08CurrentQuestions,
} from "../../site/modules/curriculum/batch-a/g3a-u08-current-coordinator.js";
import {
  G3A_U08_P04F24_CURRENT_KP_IDS,
  generateG3AU08CurrentQuestions as generateG3AU08P04F24CurrentQuestions,
} from "../../site/modules/curriculum/batch-a/g3a-u08-current-coordinator-p04f24.js";
import { G3A_U08_PART_WHOLE_KP_ID } from "../../site/modules/curriculum/registry/g3a-u08-part-whole-fraction-selector-projection.js";
import {
  G3A_U08_UNIT_FRACTION_KP_ID,
  G3A_U08_DISCRETE_FRACTION_KP_ID,
} from "../../site/modules/curriculum/registry/g3a-u08-slice002-selector-projection.js";
import { G3A_U08_SAME_DENOMINATOR_COMPARE_KP_ID } from "../../site/modules/curriculum/registry/g3a-u08-same-denominator-compare-selector-projection.js";
import { G3A_U08_P04F24_KP_ID } from "../../site/modules/curriculum/registry/g3a-u08-measurement-fraction-selector-projection-p04f24.js";
import { buildBatchABrowserWorksheetDocument } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer.js";

const SOURCE_ID = "g3a_u08_3a08";
const baseOptions = (overrides = {}) => ({
  sourceId: SOURCE_ID,
  selectionMode: "singleKnowledgePoint",
  selectedKnowledgePointIds: [G3A_U08_CURRENT_KP_IDS[0]],
  questionMode: "numeric",
  questionCount: 60,
  ordering: "groupedByPattern",
  generationSeed: "g3a-u08-focused",
  includeAnswerKey: true,
  printLayout: { paperSize: "A4", columns: 2, rowsPerPage: 3, showQuestionNumbers: true, showAnswerKeyPage: true },
  ...overrides,
});
const promptKeys = (questions) => questions.map((question) => question.blankedDisplayText);
const sortedPromptKeys = (questions) => [...promptKeys(questions)].sort();
const questionModesFor = (questions, knowledgePointId) => [...new Set(questions
  .filter((question) => question.metadata?.knowledgePointId === knowledgePointId)
  .map((question) => question.questionMode))].sort();

for (const knowledgePointId of G3A_U08_CURRENT_KP_IDS) {
  test(`G3A-U08 ${knowledgePointId} produces 60 unique numeric questions`, () => {
    const result = generateG3AU08CurrentQuestions(baseOptions({ selectedKnowledgePointIds: [knowledgePointId] }));
    assert.equal(result.ok, true, JSON.stringify(result.errors));
    assert.equal(result.questions.length, 60);
    assert.equal(new Set(promptKeys(result.questions)).size, 60);
    assert.deepEqual([...new Set(result.questions.map((question) => question.metadata.knowledgePointId))], [knowledgePointId]);
  });
}

test("G3A-U08 single-KP shuffle preserves membership and really changes order", () => {
  const selectedKnowledgePointIds = ["kp_g3a_u08_unit_fraction_accumulation"];
  const grouped = generateG3AU08CurrentQuestions(baseOptions({ selectedKnowledgePointIds }));
  const shuffled = generateG3AU08CurrentQuestions(baseOptions({ selectedKnowledgePointIds, ordering: "shuffleAcrossPatterns" }));
  const repeated = generateG3AU08CurrentQuestions(baseOptions({ selectedKnowledgePointIds, ordering: "shuffleAcrossPatterns" }));
  assert.equal(grouped.ok, true, JSON.stringify(grouped.errors));
  assert.equal(shuffled.ok, true, JSON.stringify(shuffled.errors));
  assert.deepEqual(sortedPromptKeys(grouped.questions), sortedPromptKeys(shuffled.questions));
  assert.notDeepEqual(promptKeys(grouped.questions), promptKeys(shuffled.questions));
  assert.deepEqual(promptKeys(shuffled.questions), promptKeys(repeated.questions));
});

test("G3A-U08 mixed-KP grouped and shuffle modes preserve the set but use different real orders", () => {
  const mixed = {
    selectionMode: "mixedKnowledgePointsSameUnit",
    selectedKnowledgePointIds: [...G3A_U08_CURRENT_KP_IDS],
  };
  const grouped = generateG3AU08CurrentQuestions(baseOptions({ ...mixed, ordering: "groupedByPattern" }));
  const shuffledA = generateG3AU08CurrentQuestions(baseOptions({ ...mixed, ordering: "shuffleAcrossPatterns" }));
  const shuffledB = generateG3AU08CurrentQuestions(baseOptions({ ...mixed, ordering: "shuffleAcrossPatterns", generationSeed: "g3a-u08-focused-b" }));
  assert.equal(grouped.ok, true, JSON.stringify(grouped.errors));
  assert.equal(shuffledA.ok, true, JSON.stringify(shuffledA.errors));
  assert.equal(shuffledB.ok, true, JSON.stringify(shuffledB.errors));
  assert.deepEqual(sortedPromptKeys(grouped.questions), sortedPromptKeys(shuffledA.questions));
  assert.notDeepEqual(promptKeys(grouped.questions), promptKeys(shuffledA.questions));
  assert.notDeepEqual(promptKeys(shuffledA.questions), promptKeys(shuffledB.questions));
  assert.equal(new Set(shuffledA.questions.map((question) => question.metadata.knowledgePointId)).size, 4);
});

test("G3A-U08 preview, answers and print HTML bind structured fraction models", () => {
  const result = buildBatchABrowserWorksheetDocument(baseOptions({
    selectionMode: "mixedKnowledgePointsSameUnit",
    selectedKnowledgePointIds: [...G3A_U08_CURRENT_KP_IDS],
    ordering: "shuffleAcrossPatterns",
  }));
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const document = result.worksheetDocument;
  assert.equal(document.generatedQuestions.length, 60);
  assert.equal(document.answerKeyItems.length, 60);
  assert.ok(document.questionDisplayModels.some((model) => model.promptInlineMath));
  assert.ok(document.answerKeyItems.some((item) => item.answerInlineMath));
  for (const model of document.questionDisplayModels) {
    if (/\d+\/\d+/.test(model.blankedDisplayText)) assert.ok(model.promptInlineMath);
  }
  for (const item of document.answerKeyItems) {
    if (/\d+\/\d+/.test(item.answerText)) assert.ok(item.answerInlineMath);
  }
  const html = renderWorksheetDocumentToHtml(document, { stylesheetHref: "./assets/styles/print-styles.css" });
  assert.match(html, /data-inline-math-source="g3a_u08_3a08"/);
  assert.match(html, /class="math-fraction"/);
  assert.equal(html.includes("<script>"), false);
});

for (const questionCount of [20, 60, 120]) {
  test(`G3A-U08 public five-KP mixed route produces ${questionCount} questions without collapsing to Q024`, () => {
    const options = baseOptions({
      selectionMode: "mixedKnowledgePointsSameUnit",
      selectedKnowledgePointIds: [...G3A_U08_P04F24_CURRENT_KP_IDS],
      questionMode: "mixed",
      questionCount,
      ordering: "shuffleAcrossPatterns",
      generationSeed: `g3a-u08-five-kp-mixed-${questionCount}`,
    });
    const generation = generateG3AU08P04F24CurrentQuestions(options);
    assert.equal(generation.ok, true, JSON.stringify(generation.errors));
    assert.equal(generation.questions.length, questionCount);
    assert.equal(new Set(promptKeys(generation.questions)).size, questionCount);
    assert.equal(new Set(generation.questions.map((question) => question.metadata?.knowledgePointId)).size, 5);
    assert.deepEqual(
      [...new Set(generation.questions.map((question) => question.metadata?.knowledgePointId))].sort(),
      [...G3A_U08_P04F24_CURRENT_KP_IDS].sort(),
    );
    assert.equal(
      generation.questions.filter((question) => question.metadata?.knowledgePointId === G3A_U08_P04F24_KP_ID).length,
      questionCount / 5,
    );
    assert.deepEqual(questionModesFor(generation.questions, G3A_U08_PART_WHOLE_KP_ID), ["numeric"]);
    assert.deepEqual(questionModesFor(generation.questions, G3A_U08_UNIT_FRACTION_KP_ID), ["application", "numeric"]);
    assert.deepEqual(questionModesFor(generation.questions, G3A_U08_DISCRETE_FRACTION_KP_ID), ["application", "numeric"]);
    assert.deepEqual(questionModesFor(generation.questions, G3A_U08_SAME_DENOMINATOR_COMPARE_KP_ID), ["application", "numeric"]);
    assert.deepEqual(questionModesFor(generation.questions, G3A_U08_P04F24_KP_ID), ["application"]);

    const worksheet = buildBatchABrowserWorksheetDocument(options);
    assert.equal(worksheet.ok, true, JSON.stringify(worksheet.errors));
    assert.equal(worksheet.worksheetDocument.generatedQuestions.length, questionCount);
    assert.equal(worksheet.worksheetDocument.answerKeyItems.length, questionCount);
    assert.equal(new Set(promptKeys(worksheet.worksheetDocument.generatedQuestions)).size, questionCount);
    assert.equal(new Set(worksheet.worksheetDocument.generatedQuestions.map((question) => question.metadata?.knowledgePointId)).size, 5);
  });
}
