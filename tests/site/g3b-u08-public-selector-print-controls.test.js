import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { buildWorksheetDocumentFromState } from "../../site/assets/browser/pipeline/build-worksheet-document.js";
import {
  BATCH_A_SELECTION_MODES,
  createConfigState,
  setBatchAIncludeAnswerKey,
  setBatchAOrdering,
  setBatchAQuestionCount,
  setBatchASelectorSelection,
  setBatchASourceId
} from "../../site/assets/browser/state/config-state.js";
import {
  normalizePublicPatternGroupSelection,
  togglePublicPatternGroupSelection
} from "../../site/assets/browser/state/public-pattern-group-selection.js";
import {
  publicIssueMessage,
  sanitizePublicMessage
} from "../../site/assets/browser/state/public-ui-messages.js";
import { parseQueryState } from "../../site/assets/browser/state/query-state.js";
import {
  createPixelKnowledgePointSelectorState,
  togglePixelPatternGroupSelection
} from "../../site/pixel/pixel-selector-state.js";
import { createPixelWorksheetState } from "../../site/pixel/pixel-worksheet-state.js";
import {
  runPixelWorksheetGeneration,
  summarizePixelGenerationResult
} from "../../site/pixel/pixel-generation-controller.js";
import {
  G3B_U08_PROMOTED_KNOWLEDGE_POINT_IDS,
  G3B_U08_PROMOTED_PATTERN_GROUP_IDS,
  G3B_U08_PROMOTED_SEMANTIC_PATTERN_SPEC_IDS
} from "../../site/modules/curriculum/registry/g3b-u08-semantic-promotion.js";
import {
  G3B_U08_PUBLIC_SELECTOR_PRINT_QA,
  validateG3BU08PublicSelectorProjectionForPrintQA
} from "../../site/modules/curriculum/batch-a/g3b-u08-public-selector-print-qa.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer-s58h-extension.js";

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const SOURCE_ID = "g3b_u08_3b08";
const INTERNAL_ID_PATTERN = /\b(?:kp|pg|ps|tpl|ctx)_[a-z0-9_]+\b/i;

function readText(relativePath) {
  return readFileSync(path.join(PROJECT_ROOT, relativePath), "utf8");
}

function buildClassicWorksheet({
  knowledgePointIds = G3B_U08_PROMOTED_KNOWLEDGE_POINT_IDS,
  patternGroupIds = G3B_U08_PROMOTED_PATTERN_GROUP_IDS,
  includeAnswerKey = true,
  questionCount = 24,
  ordering = "groupedByPattern",
  generationSeed = "s58i-classic"
} = {}) {
  const state = createConfigState();
  setBatchASourceId(state, SOURCE_ID);
  setBatchAQuestionCount(state, questionCount);
  setBatchAOrdering(state, ordering);
  setBatchAIncludeAnswerKey(state, includeAnswerKey);
  setBatchASelectorSelection(state, {
    selectionMode: knowledgePointIds.length === 1
      ? BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT
      : BATCH_A_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
    selectedKnowledgePointIds: knowledgePointIds,
    selectedPatternGroupIds: patternGroupIds
  });
  state.batchA.generationSeed = generationSeed;
  return buildWorksheetDocumentFromState(state);
}

test("S58I contract locks application-only public selector and print scope", () => {
  assert.deepEqual(G3B_U08_PUBLIC_SELECTOR_PRINT_QA, {
    task: "S58I_G3B_U08_PublicSelectorAndPrintControlsQA",
    sourceId: SOURCE_ID,
    status: "public_selector_and_print_controls_qa_contract",
    visibleKnowledgePointCount: 6,
    visiblePatternGroupCount: 6,
    promotedPatternSpecCount: 24,
    applicationOnly: true,
    horizontalOnly: true,
    publicNumericModeAllowed: false,
    representationToggleAllowed: false,
    publicHiddenModeFlagAllowed: false,
    classicSurfaceRequired: true,
    notFoundFallbackSurfaceRequired: true,
    pixelSurfaceRequired: true,
    publicControls: [
      "source",
      "selectionMode",
      "knowledgePoint",
      "questionCount",
      "ordering",
      "answerKey",
      "generate",
      "print"
    ],
    stalePrintInvalidationRequired: true,
    internalIdentifierRedactionRequired: true,
    rendererProfileId: "g3b_u08_semantic_long_text_v1",
    questionLayout: "2x4",
    answerLayout: "1x8",
    requiredNextGate: "S58J_G3B_U08_ProductionRegressionStressHTMLPDFPromotionCloseout"
  });
  const validation = validateG3BU08PublicSelectorProjectionForPrintQA();
  assert.equal(validation.ok, true, validation.errors.join(", "));
  assert.deepEqual(validation.counts, { knowledgePoints: 6, patternGroups: 6, patternSpecs: 24 });
});

test("S58I public selection auto-applies one application group per KnowledgePoint without a representation toggle", () => {
  const normalized = normalizePublicPatternGroupSelection({
    selectionMode: BATCH_A_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
    selectedKnowledgePointIds: G3B_U08_PROMOTED_KNOWLEDGE_POINT_IDS,
    selectedPatternGroupIds: []
  });

  assert.deepEqual(normalized.selectedPatternGroupIds, [...G3B_U08_PROMOTED_PATTERN_GROUP_IDS]);
  assert.equal(normalized.choices.length, 6);
  assert.equal(normalized.choices.every((choice) => choice.displayLabel === "應用題"), true);
  assert.equal(normalized.choices.every((choice) => choice.hasRepresentationChoice === false), true);
  assert.equal(normalized.choices.every((choice) => choice.selected === true), true);
  assert.equal(normalized.warnings.length, 0);
});

test("S58I prevents removing the sole application group and exposes no numeric alternative", () => {
  const result = togglePublicPatternGroupSelection({
    selectionMode: BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    selectedKnowledgePointIds: [G3B_U08_PROMOTED_KNOWLEDGE_POINT_IDS[0]],
    selectedPatternGroupIds: [G3B_U08_PROMOTED_PATTERN_GROUP_IDS[0]],
    patternGroupId: G3B_U08_PROMOTED_PATTERN_GROUP_IDS[0]
  });

  assert.deepEqual(result.selectedPatternGroupIds, [G3B_U08_PROMOTED_PATTERN_GROUP_IDS[0]]);
  assert.equal(result.warnings[0]?.code, "public_pattern_group_minimum_one");
  assert.equal(result.choices.some((choice) => choice.representationTag === "numeric"), false);
});

test("S58I Classic query state preserves all six public KPs and application groups", () => {
  const query = new URLSearchParams({
    sourceId: SOURCE_ID,
    selectionMode: BATCH_A_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
    questionCount: "24",
    ordering: "shuffleAcrossPatterns",
    includeAnswerKey: "false"
  });
  for (const knowledgePointId of G3B_U08_PROMOTED_KNOWLEDGE_POINT_IDS) query.append("kp", knowledgePointId);
  for (const patternGroupId of G3B_U08_PROMOTED_PATTERN_GROUP_IDS) query.append("pg", patternGroupId);
  const parsed = parseQueryState(`?${query.toString()}`);

  assert.equal(parsed.sourceId, SOURCE_ID);
  assert.equal(parsed.selectionMode, BATCH_A_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT);
  assert.deepEqual(parsed.selectedKnowledgePointIds, [...G3B_U08_PROMOTED_KNOWLEDGE_POINT_IDS]);
  assert.deepEqual(parsed.selectedPatternGroupIds, [...G3B_U08_PROMOTED_PATTERN_GROUP_IDS]);
  assert.equal(parsed.questionCount, 24);
  assert.equal(parsed.ordering, "shuffleAcrossPatterns");
  assert.equal(parsed.includeAnswerKey, false);
  assert.equal(parsed.selectorWarnings.length, 0);
});

test("S58I Classic public path produces a complete 24-family printable worksheet", () => {
  const result = buildClassicWorksheet();
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const document = result.worksheetDocument;

  assert.equal(document.generatedQuestions.length, 24);
  assert.equal(document.generatedQuestions.every((question) => question.kind === "g3bU08SemanticApplication"), true);
  assert.equal(document.generatedQuestions.every((question) => question.representation === "horizontal_only"), true);
  assert.deepEqual(
    new Set(document.generatedQuestions.map((question) => question.patternSpecId)),
    new Set(G3B_U08_PROMOTED_SEMANTIC_PATTERN_SPEC_IDS)
  );
  assert.equal(document.rendererProfile.profileId, "g3b_u08_semantic_long_text_v1");
  assert.equal(document.printOptions.columns, 2);
  assert.equal(document.printOptions.rowsPerPage, 4);
  assert.equal(document.printOptions.answerKeyColumns, 1);
  assert.equal(document.printOptions.answerKeyRowsPerPage, 8);
  assert.equal(document.printOptions.pageBreakMode, "avoidLongTextCards");
  assert.equal(document.questionPages.length, 3);
  assert.equal(document.answerKeyPages.length, 3);
  assert.equal(document.answerKeyItems.length, 24);
});

test("S58I answer-key control suppresses answer records and pages without changing questions", () => {
  const withAnswers = buildClassicWorksheet({ questionCount: 12, generationSeed: "s58i-answer-on" });
  const withoutAnswers = buildClassicWorksheet({
    questionCount: 12,
    includeAnswerKey: false,
    generationSeed: "s58i-answer-off"
  });

  assert.equal(withAnswers.ok, true, JSON.stringify(withAnswers.errors));
  assert.equal(withoutAnswers.ok, true, JSON.stringify(withoutAnswers.errors));
  assert.equal(withAnswers.worksheetDocument.generatedQuestions.length, 12);
  assert.equal(withoutAnswers.worksheetDocument.generatedQuestions.length, 12);
  assert.equal(withAnswers.worksheetDocument.answerKeyItems.length, 12);
  assert.equal(withoutAnswers.worksheetDocument.answerKeyItems.length, 0);
  assert.equal(withoutAnswers.worksheetDocument.answerKeyPages.length, 0);
  assert.equal(withoutAnswers.worksheetDocument.printOptions.showAnswerKey, false);
  assert.equal(withoutAnswers.worksheetDocument.printOptions.answerKeyPlacement, "none");
});

test("S58I public renderer prints horizontal equations and unit-bearing answers without internal IDs", () => {
  const result = buildClassicWorksheet({ questionCount: 12, generationSeed: "s58i-render" });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const document = result.worksheetDocument;
  const firstAnswer = document.answerKeyItems[0];
  const html = renderWorksheetDocumentToHtml(document, {
    title: document.title,
    stylesheetHref: "",
    debugDataAttributes: false
  });

  assert.match(html, /worksheet-renderer--g3b-u08-semantic/);
  assert.match(html, /data-renderer-profile="g3b_u08_semantic_long_text_v1"/);
  assert.match(html, /id="g3b-u08-semantic-long-text-style"/);
  assert.match(html, /break-inside: avoid/);
  assert.ok(html.includes(`算式：${firstAnswer.equationText}`));
  assert.ok(html.includes(`答案：${firstAnswer.answerText}`));
  assert.ok(html.includes(firstAnswer.finalAnswerWithUnit));
  assert.doesNotMatch(html, INTERNAL_ID_PATTERN);
  assert.doesNotMatch(html, /直式|長除法/);
});

test("S58I Pixel selector keeps all G3B-U08 groups application-only and auto-selected", () => {
  const selectorState = createPixelKnowledgePointSelectorState({
    sourceId: SOURCE_ID,
    selectionMode: BATCH_A_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
    selectedKnowledgePointIds: G3B_U08_PROMOTED_KNOWLEDGE_POINT_IDS,
    selectedPatternGroupIds: []
  });

  assert.deepEqual(selectorState.selectedPatternGroupIds, [...G3B_U08_PROMOTED_PATTERN_GROUP_IDS]);
  assert.equal(selectorState.patternGroupChoices.length, 6);
  assert.equal(selectorState.patternGroupChoices.every((choice) => choice.hasRepresentationChoice === false), true);
  const unchanged = togglePixelPatternGroupSelection(selectorState, G3B_U08_PROMOTED_PATTERN_GROUP_IDS[0]);
  assert.deepEqual(unchanged.selectedPatternGroupIds, [...G3B_U08_PROMOTED_PATTERN_GROUP_IDS]);
});

test("S58I Pixel public generation produces the same printable application-only contract", () => {
  const selectorState = createPixelKnowledgePointSelectorState({
    sourceId: SOURCE_ID,
    selectionMode: BATCH_A_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
    selectedKnowledgePointIds: G3B_U08_PROMOTED_KNOWLEDGE_POINT_IDS,
    selectedPatternGroupIds: G3B_U08_PROMOTED_PATTERN_GROUP_IDS
  });
  const state = createPixelWorksheetState({
    sourceId: SOURCE_ID,
    selectorState,
    questionCount: 24,
    includeAnswerKey: true,
    ordering: "shuffleAcrossPatterns",
    generationSeed: "s58i-pixel"
  });
  const execution = runPixelWorksheetGeneration(state);

  assert.equal(execution.summary.ok, true, JSON.stringify(execution.summary.errors));
  assert.equal(execution.summary.questionCount, 24);
  assert.equal(execution.summary.answerKeyItemCount, 24);
  assert.equal(execution.result.worksheetDocument.generatedQuestions.every((question) => question.kind === "g3bU08SemanticApplication"), true);
  assert.equal(execution.result.worksheetDocument.printOptions.columns, 2);
  assert.equal(execution.result.worksheetDocument.printOptions.rowsPerPage, 4);
});

test("S58I maps G3B-U08 canonical and production failures to Traditional Chinese public messages", () => {
  const cases = [
    ["G3B_U08_CANONICAL_SCOPE_INVALID", "目前的乘法與除法應用題選擇無法產生題目，請重新選擇。"],
    ["G3B_U08_PRODUCTION_RESOLVER_REQUIRED", "請從公開知識點重新建立出題設定。"],
    ["G3B_U08_PRODUCTION_QUESTION_COUNT_INVALID", "題目數量必須介於 1 到 200 題。"],
    ["G3B_U08_PRODUCTION_HIDDEN_OR_REPRESENTATION_MODE_FORBIDDEN", "本單元只提供應用題，不需要選擇其他題目形式。"]
  ];
  for (const [code, expected] of cases) {
    const message = publicIssueMessage({ code, message: `${code} ${G3B_U08_PROMOTED_KNOWLEDGE_POINT_IDS[0]}` });
    assert.equal(message, expected);
    assert.doesNotMatch(message, INTERNAL_ID_PATTERN);
  }

  const sanitized = sanitizePublicMessage(`PatternSpec ps_example and ctx_example belong to ${SOURCE_ID}`);
  assert.doesNotMatch(sanitized, /ps_example/);
  assert.equal(sanitized.includes(SOURCE_ID), false);

  const pixelSummary = summarizePixelGenerationResult({
    ok: false,
    stage: "preflight",
    errors: [{ code: "G3B_U08_PRODUCTION_ROUTE_INVALID", message: `Invalid ${G3B_U08_PROMOTED_PATTERN_GROUP_IDS[0]}` }],
    warnings: []
  });
  assert.equal(pixelSummary.errors[0], "請重新選擇乘法與除法應用題知識點。");
  assert.doesNotMatch(pixelSummary.statusText, /preflight|kp_|pg_|ps_|tpl_|ctx_/i);
});

test("S58I Classic, 404, and Pixel surfaces expose required controls without internal curriculum IDs", () => {
  const classic = readText("site/index.html");
  const notFound = readText("site/404.html");
  const pixel = readText("site/pixel/index.html");

  for (const html of [classic, notFound]) {
    assert.match(html, /id="batch-a-source-select"/);
    assert.match(html, /id="batch-a-selection-mode-select"/);
    assert.match(html, /id="batch-a-knowledge-point-panel"/);
    assert.match(html, /id="batch-a-question-count-input"/);
    assert.match(html, /id="batch-a-ordering-select"/);
    assert.match(html, /id="batch-a-answer-key-input"/);
    assert.match(html, /id="regenerate-button"/);
    assert.match(html, /id="print-button"/);
    assert.doesNotMatch(html, INTERNAL_ID_PATTERN);
  }

  assert.match(pixel, /id="pixel-source-select"/);
  assert.match(pixel, /id="pixel-selection-mode"/);
  assert.match(pixel, /id="pixel-knowledge-point-panel"/);
  assert.match(pixel, /id="pixel-question-count"/);
  assert.match(pixel, /id="pixel-ordering"/);
  assert.match(pixel, /id="pixel-answer-key"/);
  assert.match(pixel, /id="pixel-generate-button"/);
  assert.match(pixel, /id="pixel-print-button"/);
  assert.doesNotMatch(pixel, INTERNAL_ID_PATTERN);
});

test("S58I public UI hides single-form representation controls and invalidates stale print output", () => {
  const classicMain = readText("site/assets/browser/main.js");
  const pixelUi = readText("site/pixel/pixel-ui.js");
  const pixelPrint = readText("site/pixel/pixel-print-surface.js");

  assert.match(classicMain, /if \(!choice\.hasRepresentationChoice\) continue/);
  assert.match(classicMain, /目前選取的知識點只有一種題目形式，系統已自動套用/);
  assert.match(classicMain, /markOutputStale/);
  assert.match(classicMain, /請重新產生後列印/);
  assert.match(pixelUi, /hasRepresentationChoice/);
  assert.match(pixelPrint, /markPrintStale/);
  for (const source of [classicMain, pixelUi]) {
    assert.equal(source.includes("hiddenSemanticMode"), false);
    assert.equal(source.includes("g3bU08Semantic"), false);
  }
});
