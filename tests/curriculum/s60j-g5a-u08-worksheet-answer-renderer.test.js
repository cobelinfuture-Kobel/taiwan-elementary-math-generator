import assert from "node:assert/strict";
import test from "node:test";

import {
  G5A_U08_RENDERER_PROFILES,
  G5A_U08_WORKSHEET_LIFECYCLE,
  validateG5AU08WorksheetPromotionProjection,
} from "../../site/modules/curriculum/registry/g5a-u08-worksheet-promotion.js";
import {
  G5A_U08_CANONICAL_WORKSHEET_INTEGRATION,
  buildBatchABrowserWorksheetDocument,
  isS60JG5AU08WorksheetOptions,
} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-s60j-extension.js";
import {
  validateG5AU08WorksheetEligibility,
} from "../../site/modules/curriculum/batch-a/g5a-u08-worksheet-eligibility.js";
import {
  renderWorksheetDocumentToHtml,
} from "../../site/modules/renderer/html-renderer-s60j-extension.js";
import {
  renderWorksheetDocumentToHtml as renderPreS60JWorksheetDocumentToHtml,
} from "../../site/modules/renderer/html-renderer-s59j-r1-extension.js";

const SOURCE_ID = "g5a_u08_5a08";

function options(overrides = {}) {
  return {
    sourceId: SOURCE_ID,
    selectionMode: "singleKnowledgePoint",
    selectedKnowledgePointIds: ["kp_g5a_u08_mixed_operation_order"],
    selectedPatternGroupIds: ["pg_g5a_u08_mixed_operation_order_numeric"],
    questionMode: "numeric",
    depthMode: "N",
    contextMode: "mixed",
    questionCount: 24,
    ordering: "groupedByPattern",
    generationSeed: "s60j-g5a-u08",
    includeAnswerKey: true,
    ...overrides,
  };
}

function realCells(pages, key) {
  return pages.flatMap((page) => page.cells ?? []).filter((cell) => cell.cellType !== "filler" && cell[key]);
}

function build(overrides = {}) {
  const result = buildBatchABrowserWorksheetDocument(options(overrides));
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  return result;
}

test("S60J worksheet promotion overlay covers all promoted G5A-U08 nodes without production release", () => {
  const checked = validateG5AU08WorksheetPromotionProjection();
  assert.equal(checked.ok, true, checked.errors.join(","));
  assert.deepEqual(checked.counts, { knowledgePoints: 11, patternGroups: 17, patternSpecs: 30 });
  assert.equal(G5A_U08_WORKSHEET_LIFECYCLE.worksheetStatus, "worksheet_eligible");
  assert.equal(G5A_U08_WORKSHEET_LIFECYCLE.productionUse, "preview_only_pending_s60l");
  assert.equal(G5A_U08_CANONICAL_WORKSHEET_INTEGRATION.answerModelShapes.length, 6);
});

test("S60J numeric worksheet preserves exact question and answer counts", () => {
  assert.equal(isS60JG5AU08WorksheetOptions(options()), true);
  const result = build();
  const document = result.worksheetDocument;
  assert.equal(validateG5AU08WorksheetEligibility(result.generation.plan).ok, true);
  assert.equal(document.rendererProfile.profileId, G5A_U08_RENDERER_PROFILES.numeric.profileId);
  assert.equal(document.generatedQuestions.length, 24);
  assert.equal(document.questionDisplayModels.length, 24);
  assert.equal(document.answerKeyItems.length, 24);
  assert.equal(realCells(document.questionPages, "displayModel").length, 24);
  assert.equal(realCells(document.answerKeyPages, "answerKeyItem").length, 24);
  assert.equal(document.summary.questionCount, 24);
  assert.equal(document.summary.numericQuestionCount, 24);
  assert.equal(document.summary.applicationQuestionCount, 0);
  assert.equal(document.productionUse, "preview_only_pending_s60l");
});

test("S60J N+1 SDG application worksheet uses long-text profile and expression answers", () => {
  const result = build({
    selectedKnowledgePointIds: ["kp_g5a_u08_mul_div_equivalent_regroup"],
    selectedPatternGroupIds: ["pg_g5a_u08_mul_div_regroup_application"],
    questionMode: "application",
    depthMode: "N_PLUS_1",
    contextMode: "sdg",
    questionCount: 16,
  });
  const document = result.worksheetDocument;
  assert.equal(document.rendererProfile.profileId, G5A_U08_RENDERER_PROFILES.mixedLongText.profileId);
  assert.equal(document.generatedQuestions.every((row) => row.applicationText === true), true);
  assert.equal(document.generatedQuestions.every((row) => row.depth === "N_PLUS_1"), true);
  assert.equal(document.generatedQuestions.every((row) => row.context.contextType === "sdg"), true);
  assert.equal(document.answerKeyItems.every((row) => row.answerModelShape === "expressionAnswer"), true);
  assert.equal(document.answerKeyItems.every((row) => row.answerText.includes("＝")), true);
  assert.equal(document.questionDisplayModels.every((row) => row.responsePrompt.includes("算式")), true);
});

test("S60J mixes numeric and application groups in one canonical worksheet", () => {
  const result = build({
    selectionMode: "mixedKnowledgePointsSameUnit",
    selectedKnowledgePointIds: [
      "kp_g5a_u08_mixed_operation_order",
      "kp_g5a_u08_mul_div_equivalent_regroup",
    ],
    selectedPatternGroupIds: [
      "pg_g5a_u08_mixed_operation_order_numeric",
      "pg_g5a_u08_mul_div_regroup_application",
    ],
    questionMode: "mixed",
    depthMode: "mixed",
    contextMode: "mixed",
    questionCount: 20,
    ordering: "shuffleAcrossPatterns",
  });
  const document = result.worksheetDocument;
  assert.equal(document.summary.questionCount, 20);
  assert.equal(document.summary.numericQuestionCount > 0, true);
  assert.equal(document.summary.applicationQuestionCount > 0, true);
  assert.equal(document.rendererProfile.profileId, G5A_U08_RENDERER_PROFILES.mixedLongText.profileId);
  assert.deepEqual(new Set(document.questionDisplayModels.map((row) => row.renderKind)), new Set(["numeric_expression", "word_problem"]));
});

test("S60J dedicated models render operator sequence, equality judgement and contextual average reasoning", () => {
  const operator = build({
    selectedKnowledgePointIds: ["kp_g5a_u08_missing_operator_inference"],
    selectedPatternGroupIds: ["pg_g5a_u08_missing_operator_reasoning"],
    questionMode: "reasoning",
    questionCount: 8,
  }).worksheetDocument;
  assert.equal(operator.answerKeyItems.every((row) => row.answerModelShape === "operatorSequenceAnswer"), true);
  assert.equal(operator.questionDisplayModels.every((row) => row.renderKind === "operator_sequence"), true);

  const equality = build({
    selectedKnowledgePointIds: ["kp_g5a_u08_equivalence_error_judgement"],
    selectedPatternGroupIds: ["pg_g5a_u08_equivalence_reasoning"],
    questionMode: "reasoning",
    questionCount: 8,
  }).worksheetDocument;
  assert.equal(equality.answerKeyItems.every((row) => row.answerModelShape === "equalityJudgementAnswer"), true);
  assert.equal(equality.questionDisplayModels.every((row) => row.responsePrompt.includes("相等")), true);

  const average = build({
    selectedKnowledgePointIds: ["kp_g5a_u08_average_inverse_update"],
    selectedPatternGroupIds: ["pg_g5a_u08_average_reasoning"],
    questionMode: "reasoning",
    depthMode: "N_PLUS_1",
    contextMode: "sdg",
    questionCount: 8,
  }).worksheetDocument;
  assert.equal(average.answerKeyItems.every((row) => row.answerModelShape === "averageInverseAnswer"), true);
  assert.equal(average.questionDisplayModels.every((row) => row.renderKind === "average_reasoning"), true);
});

test("S60J answer suppression omits answer items, pages and visible answer content", () => {
  const result = build({ includeAnswerKey: false, questionCount: 9 });
  const document = result.worksheetDocument;
  assert.deepEqual(document.answerKeyItems, []);
  assert.deepEqual(document.answerKeyPages, []);
  assert.equal(document.printOptions.showAnswerKey, false);
  const html = renderWorksheetDocumentToHtml(document, { stylesheetHref: "" });
  assert.equal(html.includes("worksheet-section--answer-key"), false);
  for (const question of document.generatedQuestions) {
    assert.equal(html.includes(`>${question.answerText}<`), false);
  }
});

test("S60J renderer emits Traditional Chinese, dedicated answer-shape markup and no internal IDs", () => {
  const document = build({
    selectedKnowledgePointIds: ["kp_g5a_u08_equivalence_error_judgement"],
    selectedPatternGroupIds: ["pg_g5a_u08_equivalence_reasoning"],
    questionMode: "reasoning",
    questionCount: 6,
  }).worksheetDocument;
  const html = renderWorksheetDocumentToHtml(document, { stylesheetHref: "" });
  assert.match(html, /lang="zh-Hant"/);
  assert.match(html, /data-answer-shape="equalityJudgementAnswer"/);
  assert.match(html, /判斷與理由/);
  assert.match(html, /Noto Sans CJK TC/);
  assert.equal(html.includes("kp_g5a_u08"), false);
  assert.equal(html.includes("pg_g5a_u08"), false);
  assert.equal(html.includes("ps_g5a_u08"), false);
  assert.equal(html.includes("promotionRegistryId"), false);
});

test("S60J renderer delegates unrelated worksheet documents unchanged", () => {
  const unrelated = {
    worksheetKind: "batchAWorksheet",
    rendererProfile: { profileId: "unrelated" },
    questionPages: [],
    answerKeyPages: [],
  };
  assert.equal(
    renderWorksheetDocumentToHtml(unrelated, { stylesheetHref: "" }),
    renderPreS60JWorksheetDocumentToHtml(unrelated, { stylesheetHref: "" }),
  );
});
