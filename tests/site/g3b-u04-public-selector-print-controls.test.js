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
import { summarizePixelGenerationResult } from "../../site/pixel/pixel-generation-controller.js";
import { createPixelWorksheetState } from "../../site/pixel/pixel-worksheet-state.js";
import { runPixelWorksheetGeneration } from "../../site/pixel/pixel-generation-controller.js";

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const SOURCE_ID = "g3b_u04_3b04";
const KP_ID = "kp_g3b_u04_consecutive_multiplication";
const NUMERIC_GROUP_ID = "pg_g3b_u04_consecutive_multiplication_numeric";
const APPLICATION_GROUP_ID = "pg_g3b_u04_consecutive_multiplication_application";
const INTERNAL_ID_PATTERN = /\b(?:kp|pg|ps|tpl)_[a-z0-9_]+\b/i;

function readText(relativePath) {
  return readFileSync(path.join(PROJECT_ROOT, relativePath), "utf8");
}

function buildClassicWorksheet({ patternGroupIds, includeAnswerKey = true, questionCount = 12 }) {
  const state = createConfigState();
  setBatchASourceId(state, SOURCE_ID);
  setBatchAQuestionCount(state, questionCount);
  setBatchAIncludeAnswerKey(state, includeAnswerKey);
  setBatchASelectorSelection(state, {
    selectionMode: BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    selectedKnowledgePointIds: [KP_ID],
    selectedPatternGroupIds: patternGroupIds
  });
  return buildWorksheetDocumentFromState(state);
}

test("public PatternGroup selection defaults consecutive multiplication to preserved numeric", () => {
  const normalized = normalizePublicPatternGroupSelection({
    selectionMode: BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    selectedKnowledgePointIds: [KP_ID],
    selectedPatternGroupIds: []
  });

  assert.deepEqual(normalized.selectedPatternGroupIds, [NUMERIC_GROUP_ID]);
  assert.equal(normalized.choices.length, 2);
  assert.deepEqual(normalized.choices.map((choice) => choice.displayLabel), ["計算題", "應用題"]);
});

test("public PatternGroup selection supports application-only and numeric-plus-application", () => {
  const applicationOnly = normalizePublicPatternGroupSelection({
    selectionMode: BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    selectedKnowledgePointIds: [KP_ID],
    selectedPatternGroupIds: [APPLICATION_GROUP_ID]
  });
  assert.deepEqual(applicationOnly.selectedPatternGroupIds, [APPLICATION_GROUP_ID]);

  const hybrid = togglePublicPatternGroupSelection({
    selectionMode: BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    selectedKnowledgePointIds: [KP_ID],
    selectedPatternGroupIds: [NUMERIC_GROUP_ID],
    patternGroupId: APPLICATION_GROUP_ID
  });
  assert.deepEqual(new Set(hybrid.selectedPatternGroupIds), new Set([NUMERIC_GROUP_ID, APPLICATION_GROUP_ID]));
});

test("public PatternGroup selection prevents removing a KnowledgePoint's last representation", () => {
  const result = togglePublicPatternGroupSelection({
    selectionMode: BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    selectedKnowledgePointIds: [KP_ID],
    selectedPatternGroupIds: [NUMERIC_GROUP_ID],
    patternGroupId: NUMERIC_GROUP_ID
  });

  assert.deepEqual(result.selectedPatternGroupIds, [NUMERIC_GROUP_ID]);
  assert.equal(result.warnings[0]?.code, "public_pattern_group_minimum_one");
});

test("Classic query state reads G3B-U04 visible KP and both representation groups from latest registry", () => {
  const parsed = parseQueryState(`?sourceId=${SOURCE_ID}&selectionMode=singleKnowledgePoint&kp=${KP_ID}&pg=${NUMERIC_GROUP_ID}&pg=${APPLICATION_GROUP_ID}`);

  assert.equal(parsed.sourceId, SOURCE_ID);
  assert.equal(parsed.selectionMode, BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT);
  assert.deepEqual(parsed.selectedKnowledgePointIds, [KP_ID]);
  assert.deepEqual(parsed.selectedPatternGroupIds, [NUMERIC_GROUP_ID, APPLICATION_GROUP_ID]);
  assert.equal(parsed.selectorWarnings.length, 0);
});

test("Classic public path generates numeric, semantic, and hybrid G3B-U04 worksheets", () => {
  const numeric = buildClassicWorksheet({ patternGroupIds: [NUMERIC_GROUP_ID] });
  const semantic = buildClassicWorksheet({ patternGroupIds: [APPLICATION_GROUP_ID] });
  const hybrid = buildClassicWorksheet({ patternGroupIds: [NUMERIC_GROUP_ID, APPLICATION_GROUP_ID] });

  assert.equal(numeric.ok, true);
  assert.equal(semantic.ok, true);
  assert.equal(hybrid.ok, true);
  assert.equal(numeric.worksheetDocument.generatedQuestions.every((question) => question.kind !== "g3bU04SemanticWordProblem"), true);
  assert.equal(semantic.worksheetDocument.generatedQuestions.every((question) => question.kind === "g3bU04SemanticWordProblem"), true);
  assert.equal(hybrid.worksheetDocument.generatedQuestions.some((question) => question.kind === "g3bU04SemanticWordProblem"), true);
  assert.equal(hybrid.worksheetDocument.generatedQuestions.some((question) => question.kind !== "g3bU04SemanticWordProblem"), true);
});

test("semantic Classic output preserves long-text policy while using the global exact default", () => {
  const withAnswers = buildClassicWorksheet({ patternGroupIds: [APPLICATION_GROUP_ID], includeAnswerKey: true, questionCount: 16 });
  const withoutAnswers = buildClassicWorksheet({ patternGroupIds: [APPLICATION_GROUP_ID], includeAnswerKey: false, questionCount: 16 });

  assert.equal(withAnswers.ok, true);
  assert.equal(withAnswers.worksheetDocument.printOptions.columns, 3);
  assert.equal(withAnswers.worksheetDocument.printOptions.rowsPerPage, 5);
  assert.equal(withAnswers.worksheetDocument.printOptions.answerKeyColumns, 1);
  assert.equal(withAnswers.worksheetDocument.printOptions.answerKeyRowsPerPage, 8);
  assert.equal(withAnswers.worksheetDocument.printOptions.pageBreakMode, "avoidLongTextCards");
  assert.equal(withAnswers.worksheetDocument.answerKeyItems.length, 16);

  assert.equal(withoutAnswers.ok, true);
  assert.equal(withoutAnswers.worksheetDocument.answerKeyItems.length, 0);
  assert.equal(withoutAnswers.worksheetDocument.answerKeyPages.length, 0);
  assert.equal(withoutAnswers.worksheetDocument.printOptions.answerKeyPlacement, "none");
});

test("Pixel selector preserves and toggles public representation groups", () => {
  const numeric = createPixelKnowledgePointSelectorState({
    sourceId: SOURCE_ID,
    selectionMode: BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    selectedKnowledgePointIds: [KP_ID],
    selectedPatternGroupIds: [NUMERIC_GROUP_ID]
  });
  assert.deepEqual(numeric.selectedPatternGroupIds, [NUMERIC_GROUP_ID]);
  assert.equal(numeric.patternGroupChoices.length, 2);

  const hybrid = togglePixelPatternGroupSelection(numeric, APPLICATION_GROUP_ID);
  assert.deepEqual(new Set(hybrid.selectedPatternGroupIds), new Set([NUMERIC_GROUP_ID, APPLICATION_GROUP_ID]));
});

test("Pixel public generation consumes hybrid representation state and produces printable output", () => {
  const selectorState = createPixelKnowledgePointSelectorState({
    sourceId: SOURCE_ID,
    selectionMode: BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    selectedKnowledgePointIds: [KP_ID],
    selectedPatternGroupIds: [NUMERIC_GROUP_ID, APPLICATION_GROUP_ID]
  });
  const state = createPixelWorksheetState({
    sourceId: SOURCE_ID,
    selectorState,
    questionCount: 12,
    includeAnswerKey: true,
    generationSeed: "s57f6-pixel-hybrid"
  });
  const execution = runPixelWorksheetGeneration(state);

  assert.equal(execution.summary.ok, true);
  assert.equal(execution.summary.questionCount, 12);
  assert.equal(execution.summary.answerKeyItemCount, 12);
  assert.equal(execution.result.worksheetDocument.generatedQuestions.some((question) => question.kind === "g3bU04SemanticWordProblem"), true);
  assert.equal(execution.result.worksheetDocument.generatedQuestions.some((question) => question.kind !== "g3bU04SemanticWordProblem"), true);
});

test("public error messages are Traditional Chinese and remove internal identifiers", () => {
  const message = publicIssueMessage({
    code: "kp_resolver_pattern_group_not_linked_to_kp",
    message: `PatternGroup '${APPLICATION_GROUP_ID}' is not linked to '${KP_ID}'.`
  });
  assert.equal(message, "題目形式與所選知識點不相符，請重新選擇。");
  assert.doesNotMatch(message, INTERNAL_ID_PATTERN);

  const sanitized = sanitizePublicMessage(`PatternSpec ps_example and tpl_example belong to ${SOURCE_ID}`);
  assert.doesNotMatch(sanitized, INTERNAL_ID_PATTERN);
  assert.equal(sanitized.includes(SOURCE_ID), false);

  const pixelSummary = summarizePixelGenerationResult({
    ok: false,
    stage: "preflight",
    errors: [{ code: "pixel_generation_single_kp_selection_invalid", message: `Invalid ${KP_ID}` }],
    warnings: []
  });
  assert.equal(pixelSummary.errors[0], "單一知識點模式需要一個知識點與至少一種題目形式。");
  assert.doesNotMatch(pixelSummary.statusText, /preflight|kp_|pg_|ps_|tpl_/i);
});

test("Classic, 404, and Pixel public surfaces expose representation, generate, answer-key, and print controls", () => {
  const classic = readText("site/index.html");
  const notFound = readText("site/404.html");
  const pixel = readText("site/pixel/index.html");

  for (const html of [classic, notFound]) {
    assert.match(html, /id="batch-a-pattern-group-selector"/);
    assert.match(html, /id="batch-a-pattern-group-panel"/);
    assert.match(html, /id="batch-a-answer-key-input"/);
    assert.match(html, /id="regenerate-button"/);
    assert.match(html, /id="print-button"/);
    assert.doesNotMatch(html, INTERNAL_ID_PATTERN);
  }

  assert.match(pixel, /id="pixel-pattern-group-selector"/);
  assert.match(pixel, /id="pixel-pattern-group-panel"/);
  assert.match(pixel, /id="pixel-answer-key"/);
  assert.match(pixel, /id="pixel-generate-button"/);
  assert.match(pixel, /id="pixel-print-button"/);
  assert.doesNotMatch(pixel, INTERNAL_ID_PATTERN);
});

test("public UI source does not expose hidden semantic switches and invalidates stale print output", () => {
  const classicMain = readText("site/assets/browser/main.js");
  const pixelUi = readText("site/pixel/pixel-ui.js");
  const pixelPrint = readText("site/pixel/pixel-print-surface.js");

  for (const source of [classicMain, pixelUi]) {
    assert.equal(source.includes("hiddenSemanticMode"), false);
    assert.equal(source.includes("g3bU04Semantic"), false);
  }
  assert.match(classicMain, /markOutputStale/);
  assert.match(classicMain, /請重新產生後列印/);
  assert.match(pixelPrint, /pixel-pattern-group-panel/);
  assert.match(pixelPrint, /markPrintStale/);
});
