import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";

import { generateBatchABrowserQuestions as generateBaseBatchABrowserQuestions } from "../../../site/modules/curriculum/batch-a/batch-a-browser-question-router.js";
import { generateBatchABrowserQuestions as generateExtendedBatchABrowserQuestions } from "../../../site/modules/curriculum/batch-a/batch-a-browser-question-router-g3b-u04-extension.js";
import {
  validateBatchABrowserQuestion,
  validateBatchABrowserQuestions
} from "../../../site/modules/curriculum/batch-a/batch-a-browser-validator-g3b-u04-extension.js";
import {
  G3B_U04_ALL_SEMANTIC_PATTERN_SPEC_IDS,
  G3B_U04_HIDDEN_SEMANTIC_MODE,
  buildG3BU04HiddenSemanticPlan,
  canGenerateG3BU04HiddenSemanticQuestions,
  generateG3BU04HiddenSemanticQuestions,
  validateG3BU04HiddenSemanticPlan
} from "../../../site/modules/curriculum/batch-a/g3b-u04-semantic-question-generator.js";
import {
  buildG3BU04HiddenSemanticWorksheet,
  isG3BU04HiddenSemanticWorksheetOptions,
  renderG3BU04HiddenSemanticWorksheetText
} from "../../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-g3b-u04-extension.js";

const SOURCE_ID = "g3b_u04_3b04";

function hiddenOptions(overrides = {}) {
  return {
    sourceId: SOURCE_ID,
    hiddenSemanticMode: G3B_U04_HIDDEN_SEMANTIC_MODE,
    questionCount: 32,
    generationSeed: "s57e6-hidden-integration",
    ordering: "balancedByFamily",
    includeAnswerKey: true,
    ...overrides
  };
}

test("S57E6 hidden plan resolves all 32 semantic PatternSpecs without selector exposure", () => {
  const plan = buildG3BU04HiddenSemanticPlan(hiddenOptions());
  assert.equal(validateG3BU04HiddenSemanticPlan(plan).ok, true);
  assert.equal(plan.patternSpecIds.length, 32);
  assert.deepEqual(new Set(plan.patternSpecIds), new Set(G3B_U04_ALL_SEMANTIC_PATTERN_SPEC_IDS));
  assert.equal(plan.knowledgePointIds.length, 9);
  assert.equal(plan.allocation.length, 32);
  assert.equal(plan.allocation.every((entry) => entry.questionCount === 1), true);
  assert.equal(plan.selectorStatus, "hidden");
  assert.equal(plan.productionUse, "forbidden");
  assert.equal(plan.publicProjectionChanged, false);
  assert.equal(canGenerateG3BU04HiddenSemanticQuestions(hiddenOptions()), true);
  assert.equal(canGenerateG3BU04HiddenSemanticQuestions({ sourceId: SOURCE_ID }), false);
});

test("S57E6 aggregate generator produces one blocking-validated item for every family", () => {
  const result = generateG3BU04HiddenSemanticQuestions(hiddenOptions());
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.questions.length, 32);
  assert.equal(result.allocation.reduce((sum, entry) => sum + entry.questionCount, 0), 32);
  assert.deepEqual(
    new Set(result.questions.map((question) => question.patternSpecId)),
    new Set(G3B_U04_ALL_SEMANTIC_PATTERN_SPEC_IDS)
  );
  assert.equal(new Set(result.questions.map((question) => question.knowledgePointId)).size, 9);
  assert.equal(new Set(result.questions.map((question) => question.templateFamilyId)).size, 32);
  assert.equal(result.questions.every((question) => question.kind === "g3bU04SemanticWordProblem"), true);
  assert.equal(result.questions.every((question) => question.selectorStatus === "hidden"), true);
  assert.equal(result.questions.every((question) => question.productionUse === "forbidden"), true);
  assert.equal(validateBatchABrowserQuestions(result.questions).ok, true);
});

test("S57E6 router extension routes explicit hidden semantic requests and rejects accidental public routing", () => {
  const routed = generateExtendedBatchABrowserQuestions(hiddenOptions({ questionCount: 64 }));
  assert.equal(routed.ok, true, JSON.stringify(routed.errors));
  assert.equal(routed.questions.length, 64);
  assert.equal(routed.plan.hiddenSemanticMode, G3B_U04_HIDDEN_SEMANTIC_MODE);
  assert.equal(routed.questions.every((question) => question.sourceId === SOURCE_ID), true);

  const ordinarySourceOptions = {
    sourceId: "g3a_u03_3a03",
    questionCount: 8,
    generationSeed: "s57e6-delegation",
    ordering: "groupedByPattern",
    includeAnswerKey: true
  };
  const base = generateBaseBatchABrowserQuestions(ordinarySourceOptions);
  const delegated = generateExtendedBatchABrowserQuestions(ordinarySourceOptions);
  assert.deepEqual(delegated, base);

  const accidental = generateExtendedBatchABrowserQuestions({
    sourceId: SOURCE_ID,
    questionCount: 8,
    generationSeed: "ordinary-g3b-u04"
  });
  assert.equal(accidental.plan?.hiddenSemanticMode === G3B_U04_HIDDEN_SEMANTIC_MODE, false);
  assert.equal(accidental.questions?.some((question) => question.kind === "g3bU04SemanticWordProblem"), false);
});

test("S57E6 validator extension blocks semantic mutations and delegates unrelated Batch A questions", () => {
  const generated = generateG3BU04HiddenSemanticQuestions(hiddenOptions({ questionCount: 1 }));
  assert.equal(generated.ok, true, JSON.stringify(generated.errors));
  const question = generated.questions[0];
  assert.equal(validateBatchABrowserQuestion(question).ok, true);

  const mutated = structuredClone(question);
  mutated.ownershipModel = "wrong_actor_scope";
  const blocked = validateBatchABrowserQuestion(mutated);
  assert.equal(blocked.ok, false);
  assert.equal(blocked.errors.some((error) => error.code === "G3B_U04_SEM_ACTOR_OWNERSHIP_MISMATCH"), true);

  const ordinary = generateBaseBatchABrowserQuestions({
    sourceId: "g3a_u03_3a03",
    questionCount: 1,
    generationSeed: "s57e6-validator-delegation"
  });
  assert.equal(ordinary.ok, true, JSON.stringify(ordinary.errors));
  assert.equal(validateBatchABrowserQuestion(ordinary.questions[0]).ok, true);
});

test("S57E6 builds a hidden long-text worksheet and answer key without public projection", () => {
  const result = buildG3BU04HiddenSemanticWorksheet(hiddenOptions({
    questionCount: 64,
    ordering: "shuffleAcrossPatterns",
    printLayout: { columns: 2, rowsPerPage: 4 },
    answerKeyLayout: { columns: 1, rowsPerPage: 8 }
  }));
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const document = result.worksheetDocument;
  assert.equal(document.schemaName, "G3BU04HiddenSemanticWorksheetDocument");
  assert.equal(document.summary.questionCount, 64);
  assert.equal(document.summary.answerKeyItemCount, 64);
  assert.equal(document.summary.knowledgePointCount, 9);
  assert.equal(document.summary.templateFamilyCount, 32);
  assert.equal(document.questionDisplayModels.length, 64);
  assert.equal(document.answerKeyItems.length, 64);
  assert.equal(document.questionPages.length, 8);
  assert.equal(document.answerKeyPages.length, 8);
  assert.equal(document.questionPages.every((page) => page.itemCount <= 8), true);
  assert.equal(document.answerKeyPages.every((page) => page.itemCount <= 8), true);
  assert.equal(document.questionDisplayModels.every((item) => item.layoutHints.avoidPageBreakInside), true);
  assert.equal(document.answerKeyItems.every((item) => item.equationText && item.answerText), true);
  assert.equal(document.visibilityStatus, "hidden");
  assert.equal(document.selectorStatus, "hidden");
  assert.equal(document.productionUse, "forbidden");
  assert.equal(document.publicProjectionChanged, false);
  const rendered = renderG3BU04HiddenSemanticWorksheetText(document);
  assert.ok(rendered.includes("3B-U04 兩步驟計算"));
  assert.ok(rendered.includes("答案"));
  assert.ok(rendered.includes(document.generatedQuestions[0].promptText));
  assert.ok(rendered.includes(document.generatedQuestions[0].equationModel));
  assert.ok(rendered.includes(document.generatedQuestions[0].answerText));
});

test("S57E6 hidden worksheet requires explicit mode and supports answer-key suppression", () => {
  assert.equal(isG3BU04HiddenSemanticWorksheetOptions(hiddenOptions()), true);
  assert.equal(isG3BU04HiddenSemanticWorksheetOptions({ sourceId: SOURCE_ID }), false);
  const denied = buildG3BU04HiddenSemanticWorksheet({ sourceId: SOURCE_ID, questionCount: 4 });
  assert.equal(denied.ok, false);
  assert.equal(denied.errors[0].code, "G3B_U04_SEM_WORKSHEET_MODE_REQUIRED");

  const noKey = buildG3BU04HiddenSemanticWorksheet(hiddenOptions({ questionCount: 8, includeAnswerKey: false }));
  assert.equal(noKey.ok, true, JSON.stringify(noKey.errors));
  assert.equal(noKey.worksheetDocument.answerKeyItems.length, 0);
  assert.equal(noKey.worksheetDocument.answerKeyPages.length, 0);
  assert.equal(noKey.worksheetDocument.summary.answerKeyItemCount, 0);
  assert.equal(renderG3BU04HiddenSemanticWorksheetText(noKey.worksheetDocument).includes("答案"), false);
});

test("S57E6 320-question stress remains balanced, deterministic, and blocking-valid", () => {
  const options = hiddenOptions({
    questionCount: 320,
    generationSeed: "s57e6-320-stress",
    ordering: "shuffleAcrossPatterns"
  });
  const first = generateG3BU04HiddenSemanticQuestions(options);
  const replay = generateG3BU04HiddenSemanticQuestions(options);
  assert.equal(first.ok, true, JSON.stringify(first.errors));
  assert.equal(replay.ok, true, JSON.stringify(replay.errors));
  assert.equal(first.questions.length, 320);
  assert.deepEqual(replay.questions, first.questions);
  assert.equal(first.allocation.length, 32);
  assert.equal(first.allocation.every((entry) => entry.questionCount === 10), true);
  assert.equal(validateBatchABrowserQuestions(first.questions).ok, true);
  assert.equal(first.questions.every((question) => Number.isInteger(question.finalAnswer) && question.finalAnswer > 0), true);
});

test("S57E6 hidden runtime remains isolated after later selector projection", () => {
  const selectorPath = new URL(
    "../../../site/modules/curriculum/registry/batch-a-selector-g3b-u04-semantic-extension.js",
    import.meta.url
  );
  assert.equal(existsSync(selectorPath), true);
  const plan = buildG3BU04HiddenSemanticPlan(hiddenOptions());
  assert.equal(plan.selectorStatus, "hidden");
  assert.equal(plan.productionUse, "forbidden");
  assert.equal(plan.publicProjectionChanged, false);
  assert.equal(G3B_U04_ALL_SEMANTIC_PATTERN_SPEC_IDS.length, 32);
});
