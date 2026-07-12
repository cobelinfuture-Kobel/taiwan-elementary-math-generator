import assert from "node:assert/strict";
import test from "node:test";

import {
  G5A_U08_PROMOTED_KNOWLEDGE_POINT_IDS,
  G5A_U08_PROMOTED_PATTERN_GROUP_IDS,
  G5A_U08_PROMOTED_PATTERN_SPEC_IDS,
} from "../../site/modules/curriculum/registry/g5a-u08-promotion.js";
import {
  G5A_U08_PRODUCTION_LIFECYCLE,
  validateG5AU08ProductionPromotionProjection,
} from "../../site/modules/curriculum/registry/g5a-u08-production-promotion.js";
import { buildBatchABrowserWorksheetDocument } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-s60l-extension.js";

const SOURCE_ID = "g5a_u08_5a08";
const PUBLIC_COUNTS = [1, 11, 29, 72, 120, 200];

function options(questionCount, seed, overrides = {}) {
  return {
    sourceId: SOURCE_ID,
    selectionMode: "mixedKnowledgePointsSameUnit",
    selectedKnowledgePointIds: [...G5A_U08_PROMOTED_KNOWLEDGE_POINT_IDS],
    selectedPatternGroupIds: [...G5A_U08_PROMOTED_PATTERN_GROUP_IDS],
    questionMode: "mixed",
    depthMode: "mixed",
    contextMode: "mixed",
    questionCount,
    ordering: "shuffleAcrossPatterns",
    includeAnswerKey: true,
    generationSeed: seed,
    printLayout: { columns: 2, rowsPerPage: 4, showAnswerKeyPage: true },
    ...overrides,
  };
}

function build(questionCount, seed, overrides = {}) {
  const result = buildBatchABrowserWorksheetDocument(options(questionCount, seed, overrides));
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.ok(result.worksheetDocument);
  return result.worksheetDocument;
}

test("S60L production promotion accepts all 11 KPs, 17 groups and 30 specs", () => {
  const checked = validateG5AU08ProductionPromotionProjection();
  assert.equal(checked.ok, true, checked.errors.join(","));
  assert.deepEqual(checked.counts, { knowledgePoints: 11, patternGroups: 17, patternSpecs: 30 });
  assert.equal(G5A_U08_PRODUCTION_LIFECYCLE.productionUse, "allowed");
  assert.equal(G5A_U08_PRODUCTION_LIFECYCLE.worksheetStatus, "production_eligible");
});

test("S60L public count matrix produces exact production worksheets", () => {
  for (const count of PUBLIC_COUNTS) {
    const document = build(count, `s60l-public-${count}`);
    assert.equal(document.productionUse, "allowed");
    assert.equal(document.generatedQuestions.length, count);
    assert.equal(document.questionDisplayModels.length, count);
    assert.equal(document.answerKeyItems.length, count);
    assert.equal(document.summary.questionCount, count);
    assert.equal(document.validationSummary.ok, true);
    assert.equal(document.generatedQuestions.every((row) => row.productionUse === "allowed"), true);
    assert.equal(document.generatedQuestions.some((row) => row.depth === "N_PLUS_2"), false);
  }
});

test("S60L aggregate 1000-question stress reaches complete public coverage", () => {
  const questions = [];
  for (let batch = 0; batch < 5; batch += 1) {
    questions.push(...build(200, `s60l-aggregate-${batch}`).generatedQuestions);
  }
  assert.equal(questions.length, 1000);
  assert.deepEqual(
    [...new Set(questions.map((row) => row.knowledgePointId))].sort(),
    [...G5A_U08_PROMOTED_KNOWLEDGE_POINT_IDS].sort(),
  );
  assert.deepEqual(
    [...new Set(questions.map((row) => row.resolvedPatternGroupId ?? row.patternGroupId))].sort(),
    [...G5A_U08_PROMOTED_PATTERN_GROUP_IDS].sort(),
  );
  assert.deepEqual(
    [...new Set(questions.map((row) => row.patternSpecId))].sort(),
    [...G5A_U08_PROMOTED_PATTERN_SPEC_IDS].sort(),
  );
  assert.deepEqual([...new Set(questions.map((row) => row.mode))].sort(), ["application", "numeric", "reasoning"]);
  assert.deepEqual([...new Set(questions.map((row) => row.depth))].sort(), ["N", "N_PLUS_1"]);
  assert.deepEqual([...new Set(questions.map((row) => row.context?.contextType).filter(Boolean))].sort(), ["daily_life", "sdg"]);
  assert.equal(new Set(questions.map((row) => row.templateFamilyId).filter(Boolean)).size, 10);
  assert.deepEqual(
    [...new Set(questions.map((row) => row.context?.sdgGoalId).filter(Boolean))].sort(),
    ["SDG_11", "SDG_12", "SDG_13", "SDG_15", "SDG_2", "SDG_4", "SDG_6", "SDG_7"].sort(),
  );
  assert.deepEqual(
    [...new Set(questions.map((row) => row.answerModelShape))].sort(),
    ["allocationTransferAnswer", "averageInverseAnswer", "equalityJudgementAnswer", "expressionAnswer", "numericAnswer", "operatorSequenceAnswer"].sort(),
  );
});

test("S60L grouped and shuffled production replay remain deterministic", () => {
  for (const ordering of ["groupedByPattern", "shuffleAcrossPatterns"]) {
    const first = build(120, `s60l-deterministic-${ordering}`, { ordering });
    const second = build(120, `s60l-deterministic-${ordering}`, { ordering });
    assert.deepEqual(first.orderedQuestionIds, second.orderedQuestionIds);
    assert.deepEqual(first.generatedQuestions, second.generatedQuestions);
  }
});

test("S60L answer-key suppression remains production-safe", () => {
  const document = build(72, "s60l-no-answers", { includeAnswerKey: false });
  assert.equal(document.productionUse, "allowed");
  assert.deepEqual(document.answerKeyItems, []);
  assert.deepEqual(document.answerKeyPages, []);
  assert.equal(document.printOptions.showAnswerKey, false);
});
