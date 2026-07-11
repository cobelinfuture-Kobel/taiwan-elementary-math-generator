import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { buildWorksheetDocumentFromState } from "../../site/assets/browser/pipeline/build-worksheet-document.js";
import {
  BATCH_A_SELECTION_MODES,
  createConfigState,
  getBatchAWorksheetPlan,
  setBatchAGenerationSeed,
  setBatchAIncludeAnswerKey,
  setBatchAOrdering,
  setBatchAQuestionCount,
  setBatchASelectorSelection,
  setBatchASourceId
} from "../../site/assets/browser/state/config-state.js";
import {
  publicIssueMessage,
  sanitizePublicMessage
} from "../../site/assets/browser/state/public-ui-messages.js";
import { parseQueryState } from "../../site/assets/browser/state/query-state.js";
import {
  createPixelKnowledgePointSelectorState,
  togglePixelPatternGroupSelection
} from "../../site/pixel/pixel-selector-state.js";
import {
  createPixelWorksheetState
} from "../../site/pixel/pixel-worksheet-state.js";
import {
  runPixelWorksheetGeneration,
  summarizePixelGenerationResult
} from "../../site/pixel/pixel-generation-controller.js";
import {
  G4B_U01_PUBLIC_SELECTOR_PRINT_QA,
  validateG4BU01PublicSelectorPrintQAContract
} from "../../site/modules/curriculum/batch-a/g4b-u01-public-selector-print-qa.js";
import { G4B_U01_BLOCKING_CODES } from "../../site/modules/curriculum/batch-a/g4b-u01-horizontal-validator.js";
import {
  G3B_U08_PROMOTED_KNOWLEDGE_POINT_IDS,
  G3B_U08_PROMOTED_PATTERN_GROUP_IDS
} from "../../site/modules/curriculum/registry/g3b-u08-semantic-promotion.js";
import {
  G4B_U01_PROMOTED_KNOWLEDGE_POINT_IDS,
  G4B_U01_PROMOTED_PATTERN_GROUP_IDS,
  G4B_U01_PROMOTED_PATTERN_SPEC_IDS
} from "../../site/modules/curriculum/registry/g4b-u01-horizontal-promotion.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer-s59h-extension.js";

const SOURCE_ID = "g4b_u01_4b01";
const KP_IDS = [...G4B_U01_PROMOTED_KNOWLEDGE_POINT_IDS];
const GROUP_IDS = [...G4B_U01_PROMOTED_PATTERN_GROUP_IDS];
const SPEC_IDS = [...G4B_U01_PROMOTED_PATTERN_SPEC_IDS];
const INTERNAL_ID_PATTERN = /\b(?:kp|pg|ps|tpl|ctx)_[a-z0-9_]+\b/i;

const EXPECTED_ARITHMETIC_MESSAGES = Object.freeze({
  G4B_U01_IDENTITY_MISMATCH: "題目不屬於目前的多位數乘除單元，請重新產生。",
  G4B_U01_NON_HORIZONTAL_REPRESENTATION: "本單元只接受單行橫式計算題。",
  G4B_U01_APPLICATION_TEXT_FORBIDDEN: "本單元目前不提供應用題。",
  G4B_U01_PATTERN_SPEC_SCOPE_MISMATCH: "題型與知識點不相符，請重新產生。",
  G4B_U01_OPERAND_RANGE_INVALID: "運算數超出本題型允許範圍，請重新產生。",
  G4B_U01_DIGIT_COUNT_INVALID: "運算數位數不符合本題型要求，請重新產生。",
  G4B_U01_MULTIPLICATION_RESULT_INVALID: "乘法答案不正確，請重新產生。",
  G4B_U01_RESULT_RANGE_INVALID: "計算結果超出本題型允許範圍，請重新產生。",
  G4B_U01_INTERNAL_ZERO_POSITION_INVALID: "乘數中間的 0 位置不符合題型要求。",
  G4B_U01_TRAILING_ZERO_ROLE_INVALID: "尾 0 所在位置不符合題型要求。",
  G4B_U01_POWER10_SCALING_INVALID: "尾 0 簡算的位值關係不正確。",
  G4B_U01_DIVISOR_ZERO: "除數不可為 0。",
  G4B_U01_DIVISION_IDENTITY_INVALID: "除法結果不符合被除數等於除數乘商再加餘數。",
  G4B_U01_QUOTIENT_RANGE_INVALID: "商超出本題型允許範圍。",
  G4B_U01_QUOTIENT_DIGIT_COUNT_INVALID: "商的位數不符合本題型要求。",
  G4B_U01_REMAINDER_NEGATIVE: "餘數不可小於 0。",
  G4B_U01_REMAINDER_NOT_LESS_THAN_DIVISOR: "餘數必須小於除數。",
  G4B_U01_EXACT_DIVISION_HAS_REMAINDER: "整除題的餘數必須為 0。",
  G4B_U01_REMAINDER_REQUIRED_BUT_ZERO: "此題型必須產生非 0 餘數。",
  G4B_U01_COMMON_TRAILING_ZERO_INVALID: "被除數與除數的共同尾 0 關係不正確。",
  G4B_U01_REDUCED_DIVISION_INVALID: "消去共同尾 0 後的除法關係不正確。",
  G4B_U01_REMAINDER_SCALE_NOT_RESTORED: "餘數尚未恢復成原題的位值。",
  G4B_U01_ANSWER_MODEL_INVALID: "答案格式與題型不一致，請重新產生。",
  G4B_U01_GENERIC_FALLBACK_FORBIDDEN: "本單元不可改用一般題型替代，請重新產生。"
});

function readText(relativePath) {
  return readFileSync(new URL(`../../${relativePath}`, import.meta.url), "utf8");
}

function createClassicState({
  questionCount = 72,
  ordering = "groupedByPattern",
  includeAnswerKey = true,
  generationSeed = "s59i-g4b-u01"
} = {}) {
  const state = createConfigState();
  setBatchASourceId(state, SOURCE_ID);
  setBatchAQuestionCount(state, questionCount);
  setBatchAOrdering(state, ordering);
  setBatchAIncludeAnswerKey(state, includeAnswerKey);
  setBatchAGenerationSeed(state, generationSeed);
  setBatchASelectorSelection(state, {
    selectionMode: BATCH_A_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
    selectedKnowledgePointIds: KP_IDS,
    selectedPatternGroupIds: GROUP_IDS
  });
  return state;
}

function buildClassicWorksheet(options = {}) {
  return buildWorksheetDocumentFromState(createClassicState(options));
}

function createPixelExecution({
  questionCount = 72,
  ordering = "groupedByPattern",
  includeAnswerKey = true,
  generationSeed = "s59i-g4b-u01-pixel"
} = {}) {
  const selectorState = createPixelKnowledgePointSelectorState({
    sourceId: SOURCE_ID,
    selectionMode: BATCH_A_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
    selectedKnowledgePointIds: KP_IDS,
    selectedPatternGroupIds: GROUP_IDS
  });
  const state = createPixelWorksheetState({
    sourceId: SOURCE_ID,
    selectorState,
    questionCount,
    ordering,
    includeAnswerKey,
    generationSeed
  });
  return runPixelWorksheetGeneration(state);
}

function canonicalQuery({
  knowledgePointIds = KP_IDS,
  patternGroupIds = GROUP_IDS,
  questionCount = 72,
  ordering = "shuffleAcrossPatterns",
  includeAnswerKey = false
} = {}) {
  const params = new URLSearchParams({
    sourceId: SOURCE_ID,
    selectionMode: BATCH_A_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
    questionCount: String(questionCount),
    ordering,
    answerKey: includeAnswerKey ? "1" : "0"
  });
  for (const knowledgePointId of knowledgePointIds) params.append("kp", knowledgePointId);
  for (const patternGroupId of patternGroupIds) params.append("pg", patternGroupId);
  return `?${params.toString()}`;
}

test("S59I contract locks 9 horizontal KnowledgePoints, 9 groups and 12 PatternSpecs", () => {
  const result = validateG4BU01PublicSelectorPrintQAContract();
  assert.equal(result.ok, true, result.errors.join(", "));
  assert.deepEqual(result.counts, {
    visibleKnowledgePoints: 9,
    visiblePatternGroups: 9,
    promotedPatternSpecs: 12,
    publicApplicationGroups: 0
  });
  assert.deepEqual(G4B_U01_PUBLIC_SELECTOR_PRINT_QA.surfaces, ["classic", "fallback404", "pixel"]);
  assert.equal(G4B_U01_PUBLIC_SELECTOR_PRINT_QA.horizontalOnly, true);
  assert.equal(G4B_U01_PUBLIC_SELECTOR_PRINT_QA.representationToggleAllowed, false);
  assert.equal(G4B_U01_PUBLIC_SELECTOR_PRINT_QA.verticalRepresentationAllowed, false);
  assert.equal(G4B_U01_PUBLIC_SELECTOR_PRINT_QA.publicHiddenModeFlagAllowed, false);
  assert.equal(G4B_U01_PUBLIC_SELECTOR_PRINT_QA.publicQuestionCountMax, 200);
});

test("S59I Classic query state preserves valid G4B-U01 selection exactly", () => {
  const parsed = parseQueryState(canonicalQuery());
  assert.equal(parsed.sourceId, SOURCE_ID);
  assert.equal(parsed.questionCount, 72);
  assert.equal(parsed.ordering, "shuffleAcrossPatterns");
  assert.equal(parsed.includeAnswerKey, false);
  assert.equal(parsed.selectionMode, BATCH_A_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT);
  assert.deepEqual(parsed.selectedKnowledgePointIds, KP_IDS);
  assert.deepEqual(parsed.selectedPatternGroupIds, GROUP_IDS);
  assert.deepEqual(parsed.selectorWarnings, []);
});

test("S59I Classic query state rejects stale and cross-unit selector ids", () => {
  const stale = parseQueryState(canonicalQuery({
    knowledgePointIds: [KP_IDS[0], "kp_stale"],
    patternGroupIds: [GROUP_IDS[0], "pg_stale"]
  }));
  assert.equal(stale.selectionMode, BATCH_A_SELECTION_MODES.SOURCE_UNIT);
  assert.deepEqual(stale.selectedKnowledgePointIds, []);
  assert.deepEqual(stale.selectedPatternGroupIds, []);
  assert.ok(stale.selectorWarnings.some((entry) => entry.code === "selector_id_dropped"));
  assert.ok(stale.selectorWarnings.some((entry) => entry.code === "selector_mode_fallback"));

  const crossUnit = parseQueryState(canonicalQuery({
    knowledgePointIds: [KP_IDS[0], G3B_U08_PROMOTED_KNOWLEDGE_POINT_IDS[0]],
    patternGroupIds: [GROUP_IDS[0], G3B_U08_PROMOTED_PATTERN_GROUP_IDS[0]]
  }));
  assert.equal(crossUnit.selectionMode, BATCH_A_SELECTION_MODES.SOURCE_UNIT);
  assert.deepEqual(crossUnit.selectedKnowledgePointIds, []);
  assert.deepEqual(crossUnit.selectedPatternGroupIds, []);
  assert.ok(crossUnit.selectorWarnings.some((entry) => entry.code === "selector_id_dropped"));
  assert.ok(crossUnit.selectorWarnings.some((entry) => entry.code === "selector_mode_fallback"));
});

test("S59I Classic public state builds a printable 72-question all-family worksheet", () => {
  const state = createClassicState();
  const plan = getBatchAWorksheetPlan(state);
  assert.equal(plan.sourceId, SOURCE_ID);
  assert.deepEqual(plan.selectedKnowledgePointIds, KP_IDS);
  assert.deepEqual(plan.selectedPatternGroupIds, GROUP_IDS);
  const result = buildWorksheetDocumentFromState(state);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const document = result.worksheetDocument;
  assert.equal(document.generatedQuestions.length, 72);
  assert.equal(document.answerKeyItems.length, 72);
  assert.deepEqual(new Set(document.generatedQuestions.map((question) => question.patternSpecId)), new Set(SPEC_IDS));
  assert.equal(document.rendererProfile.profileId, "g4b_u01_horizontal_numeric_v1");
  assert.equal(document.printOptions.columns, 3);
  assert.equal(document.printOptions.rowsPerPage, 8);
  assert.equal(document.printOptions.answerKeyColumns, 3);
  assert.equal(document.printOptions.answerKeyRowsPerPage, 10);
  assert.ok(document.generatedQuestions.every((question) => question.representation === "horizontal_only"));
  assert.ok(document.generatedQuestions.every((question) => question.applicationText === false));
});

test("S59I Pixel selector auto-applies one horizontal group per KnowledgePoint", () => {
  const selectorState = createPixelKnowledgePointSelectorState({
    sourceId: SOURCE_ID,
    selectionMode: BATCH_A_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
    selectedKnowledgePointIds: KP_IDS,
    selectedPatternGroupIds: []
  });
  assert.deepEqual(selectorState.selectedPatternGroupIds, GROUP_IDS);
  assert.equal(selectorState.patternGroupChoices.length, 9);
  assert.equal(selectorState.patternGroupChoices.every((choice) => choice.hasRepresentationChoice === false), true);
  const unchanged = togglePixelPatternGroupSelection(selectorState, GROUP_IDS[0]);
  assert.deepEqual(unchanged.selectedPatternGroupIds, GROUP_IDS);
});

test("S59I Pixel public generation consumes the same canonical worksheet path", () => {
  const execution = createPixelExecution();
  assert.equal(execution.summary.ok, true, JSON.stringify(execution.summary.errors));
  assert.equal(execution.summary.questionCount, 72);
  assert.equal(execution.summary.answerKeyItemCount, 72);
  const document = execution.result.worksheetDocument;
  assert.equal(document.rendererProfile.profileId, "g4b_u01_horizontal_numeric_v1");
  assert.deepEqual(new Set(document.generatedQuestions.map((question) => question.patternSpecId)), new Set(SPEC_IDS));
  assert.ok(document.generatedQuestions.every((question) => question.representation === "horizontal_only"));
  assert.ok(document.generatedQuestions.every((question) => question.applicationText === false));
});

test("S59I Classic and Pixel answer-key controls suppress answer pages", () => {
  const classic = buildClassicWorksheet({ questionCount: 24, includeAnswerKey: false });
  assert.equal(classic.ok, true, JSON.stringify(classic.errors));
  assert.equal(classic.worksheetDocument.generatedQuestions.length, 24);
  assert.equal(classic.worksheetDocument.answerKeyItems.length, 0);
  assert.equal(classic.worksheetDocument.answerKeyPages.length, 0);
  assert.equal(classic.worksheetDocument.printOptions.showAnswerKey, false);

  const pixel = createPixelExecution({ questionCount: 24, includeAnswerKey: false });
  assert.equal(pixel.summary.ok, true, JSON.stringify(pixel.summary.errors));
  assert.equal(pixel.result.worksheetDocument.generatedQuestions.length, 24);
  assert.equal(pixel.result.worksheetDocument.answerKeyItems.length, 0);
  assert.equal(pixel.result.worksheetDocument.answerKeyPages.length, 0);
  assert.equal(pixel.result.worksheetDocument.printOptions.showAnswerKey, false);
});

test("S59I grouped and shuffled generation are deterministic and preserve membership", () => {
  const groupedA = buildClassicWorksheet({ questionCount: 72, ordering: "groupedByPattern", generationSeed: "s59i-membership" });
  const groupedB = buildClassicWorksheet({ questionCount: 72, ordering: "groupedByPattern", generationSeed: "s59i-membership" });
  const shuffledA = buildClassicWorksheet({ questionCount: 72, ordering: "shuffleAcrossPatterns", generationSeed: "s59i-membership" });
  const shuffledB = buildClassicWorksheet({ questionCount: 72, ordering: "shuffleAcrossPatterns", generationSeed: "s59i-membership" });
  assert.equal(groupedA.ok, true, JSON.stringify(groupedA.errors));
  assert.equal(shuffledA.ok, true, JSON.stringify(shuffledA.errors));

  const signature = (result) => result.worksheetDocument.generatedQuestions.map((row) => `${row.patternSpecId}:${row.answerText}`);
  assert.deepEqual(signature(groupedA), signature(groupedB));
  assert.deepEqual(signature(shuffledA), signature(shuffledB));
  assert.deepEqual([...signature(shuffledA)].sort(), [...signature(groupedA)].sort());
});

test("S59I Classic, 404 and Pixel surfaces expose generation and print controls", () => {
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
  assert.match(pixel, /id="pixel-selection-mode-select"/);
  assert.match(pixel, /id="pixel-kp-panel"/);
  assert.match(pixel, /id="pixel-question-count"/);
  assert.match(pixel, /id="pixel-ordering"/);
  assert.match(pixel, /id="pixel-answer-key"/);
  assert.match(pixel, /id="pixel-generate-button"/);
  assert.match(pixel, /id="pixel-print-button"/);
  assert.doesNotMatch(pixel, INTERNAL_ID_PATTERN);
});

test("S59I public UI hides representation controls and invalidates stale print output", () => {
  const classicMain = readText("site/assets/browser/main.js");
  const pixelUi = readText("site/pixel/pixel-ui.js");
  const pixelPrint = readText("site/pixel/pixel-print-surface.js");
  assert.match(classicMain, /if \(!choice\.hasRepresentationChoice\) continue/);
  assert.match(classicMain, /markOutputStale/);
  assert.match(classicMain, /請重新產生後列印/);
  assert.match(pixelUi, /hasRepresentationChoice/);
  assert.match(pixelPrint, /markPrintStale/);
  for (const source of [classicMain, pixelUi]) {
    assert.equal(source.includes("g4bU01Mode"), false);
    assert.equal(source.includes("verticalRepresentation"), false);
  }
});

test("S59I renderer output is horizontal, printable and redacts internal ids", () => {
  const result = buildClassicWorksheet({ questionCount: 24, generationSeed: "s59i-renderer" });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const html = renderWorksheetDocumentToHtml(result.worksheetDocument, {
    title: result.worksheetDocument.title,
    stylesheetHref: "",
    debugDataAttributes: false
  });
  assert.match(html, /worksheet-renderer--g4b-u01-horizontal/);
  assert.match(html, /data-renderer-profile="g4b_u01_horizontal_numeric_v1"/);
  assert.match(html, /white-space: nowrap/);
  assert.doesNotMatch(html, INTERNAL_ID_PATTERN);
  assert.doesNotMatch(html, /word_problem|vertical_algorithm|hiddenMode/);
});

test("S59I maps all 24 arithmetic blocking codes to exact Traditional Chinese messages", () => {
  assert.deepEqual(G4B_U01_BLOCKING_CODES, Object.keys(EXPECTED_ARITHMETIC_MESSAGES));
  for (const code of G4B_U01_BLOCKING_CODES) {
    const message = publicIssueMessage({ code, message: `${code} ${KP_IDS[0]}` });
    assert.equal(message, EXPECTED_ARITHMETIC_MESSAGES[code]);
    assert.equal(message.includes(code), false);
    assert.doesNotMatch(message, INTERNAL_ID_PATTERN);
  }
});

test("S59I maps canonical and production failures without exposing raw ids", () => {
  const cases = [
    ["G4B_U01_CANONICAL_RESOLVER_REQUIRED", "請從公開知識點與橫式題型重新建立出題設定。"],
    ["G4B_U01_CANONICAL_PUBLIC_MODE_FLAG_FORBIDDEN", "公開介面不接受內部或其他表示模式。"],
    ["G4B_U01_PRODUCTION_ROUTE_INVALID", "請重新選擇多位數乘除的橫式知識點。"],
    ["G4B_U01_PRODUCTION_QUESTION_COUNT_INVALID", "題目數量必須介於 1 到 200 題。"],
    ["G4B_U01_CANONICAL_QUESTION_REPRESENTATION_INVALID", "本單元只接受橫式純計算題。"]
  ];
  for (const [code, expected] of cases) {
    const message = publicIssueMessage({ code, message: `${code} ${GROUP_IDS[0]}` });
    assert.equal(message, expected);
    assert.doesNotMatch(message, INTERNAL_ID_PATTERN);
  }

  const sanitized = sanitizePublicMessage(`PatternSpec ps_example belongs to ${SOURCE_ID}`);
  assert.doesNotMatch(sanitized, /ps_example/);
  assert.equal(sanitized.includes(SOURCE_ID), false);

  const pixelSummary = summarizePixelGenerationResult({
    ok: false,
    stage: "preflight",
    errors: [{ code: "G4B_U01_PRODUCTION_ROUTE_INVALID", message: `Invalid ${GROUP_IDS[0]}` }],
    warnings: []
  });
  assert.equal(pixelSummary.errors[0], "請重新選擇多位數乘除的橫式知識點。");
  assert.doesNotMatch(pixelSummary.statusText, /preflight|kp_|pg_|ps_|tpl_|ctx_/i);

  assert.equal(
    publicIssueMessage({ code: "G4B_U01_UNKNOWN_RAW_CODE", message: "G4B_U01_UNKNOWN_RAW_CODE" }),
    "無法完成出題，請確認知識點、題目形式與題數設定。"
  );
});

test("S59I public QA exposes no application, vertical, hidden or representation-toggle mode", () => {
  assert.equal(G4B_U01_PUBLIC_SELECTOR_PRINT_QA.publicApplicationGroupCount, 0);
  assert.equal(G4B_U01_PUBLIC_SELECTOR_PRINT_QA.horizontalOnly, true);
  assert.equal(G4B_U01_PUBLIC_SELECTOR_PRINT_QA.verticalRepresentationAllowed, false);
  assert.equal(G4B_U01_PUBLIC_SELECTOR_PRINT_QA.representationToggleAllowed, false);
  assert.equal(G4B_U01_PUBLIC_SELECTOR_PRINT_QA.publicHiddenModeFlagAllowed, false);
  assert.equal(G4B_U01_PUBLIC_SELECTOR_PRINT_QA.requiredNextGate, "S59J_G4B_U01_ProductionStressHTMLPDFPromotionCloseout");
});
