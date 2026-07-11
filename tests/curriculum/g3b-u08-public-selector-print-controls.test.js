import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  BATCH_A_SELECTION_MODES,
  createConfigState,
  getBatchAWorksheetPlan
} from "../../site/assets/browser/state/config-state.js";
import {
  parseQueryState,
  writeQueryStateFromState
} from "../../site/assets/browser/state/query-state.js";
import { buildWorksheetDocumentFromState } from "../../site/assets/browser/pipeline/build-worksheet-document.js";
import { printPreviewFrame } from "../../site/assets/browser/pipeline/render-preview-frame.js";
import {
  G3B_U08_PROMOTED_KNOWLEDGE_POINT_IDS,
  G3B_U08_PROMOTED_PATTERN_GROUP_IDS
} from "../../site/modules/curriculum/registry/g3b-u08-semantic-promotion.js";
import {
  createPixelKnowledgePointSelectorState
} from "../../site/pixel/pixel-selector-state.js";
import {
  createPixelWorksheetState
} from "../../site/pixel/pixel-worksheet-state.js";
import {
  runPixelWorksheetGeneration
} from "../../site/pixel/pixel-generation-controller.js";
import {
  printPixelWorksheet,
  summarizePixelPrintAvailability
} from "../../site/pixel/pixel-print-controller.js";

const SOURCE_ID = "g3b_u08_3b08";
const [TOTAL_KP, GROUP_COUNT_KP] = G3B_U08_PROMOTED_KNOWLEDGE_POINT_IDS;
const [TOTAL_GROUP, GROUP_COUNT_GROUP] = G3B_U08_PROMOTED_PATTERN_GROUP_IDS;

function query(overrides = {}) {
  const params = new URLSearchParams({
    sourceId: SOURCE_ID,
    questionCount: "16",
    ordering: "groupedByPattern",
    answerKey: "1",
    generationSeed: "s58i-public-query",
    columns: "6",
    rowsPerPage: "20",
    selectionMode: BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    kp: TOTAL_KP,
    pg: TOTAL_GROUP,
    ...overrides
  });
  return `?${params}`;
}

function buildClassicState(search) {
  return createConfigState({ queryState: parseQueryState(search) });
}

function buildPixelExecution({
  selectionMode = BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
  selectedKnowledgePointIds = [TOTAL_KP],
  selectedPatternGroupIds = [TOTAL_GROUP],
  includeAnswerKey = true,
  questionCount = 16
} = {}) {
  const selectorState = createPixelKnowledgePointSelectorState({
    sourceId: SOURCE_ID,
    selectionMode,
    selectedKnowledgePointIds,
    selectedPatternGroupIds
  });
  const worksheetState = createPixelWorksheetState({
    sourceId: SOURCE_ID,
    selectorState,
    questionCount,
    ordering: "groupedByPattern",
    includeAnswerKey,
    generationSeed: "s58i-pixel",
    columns: 6,
    rowsPerPage: 20
  });
  return { selectorState, execution: runPixelWorksheetGeneration(worksheetState) };
}

test("S58I Classic public query preserves one visible G3B-U08 application KP and group", () => {
  const parsed = parseQueryState(query());
  assert.equal(parsed.sourceId, SOURCE_ID);
  assert.equal(parsed.selectionMode, BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT);
  assert.deepEqual(parsed.selectedKnowledgePointIds, [TOTAL_KP]);
  assert.deepEqual(parsed.selectedPatternGroupIds, [TOTAL_GROUP]);
  assert.equal(parsed.questionCount, 16);
  assert.equal(parsed.includeAnswerKey, true);
  assert.deepEqual(parsed.selectorWarnings, []);
});

test("S58I public query drops stale and cross-source selector IDs while preserving valid same-unit selection", () => {
  const params = new URLSearchParams({
    sourceId: SOURCE_ID,
    selectionMode: BATCH_A_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
    questionCount: "24",
    answerKey: "1"
  });
  params.append("kp", TOTAL_KP);
  params.append("kp", GROUP_COUNT_KP);
  params.append("kp", "kp_g3b_u04_add_then_divide");
  params.append("kp", "kp_g3b_u08_stale");
  params.append("pg", TOTAL_GROUP);
  params.append("pg", GROUP_COUNT_GROUP);
  params.append("pg", "pg_g3b_u04_add_then_divide");
  params.append("pg", "pg_g3b_u08_stale");

  const parsed = parseQueryState(`?${params}`);
  assert.equal(parsed.selectionMode, BATCH_A_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT);
  assert.deepEqual(parsed.selectedKnowledgePointIds, [TOTAL_KP, GROUP_COUNT_KP]);
  assert.deepEqual(parsed.selectedPatternGroupIds, [TOTAL_GROUP, GROUP_COUNT_GROUP]);
  assert.equal(parsed.selectorWarnings.some((entry) => entry.code === "selector_id_dropped" && entry.field === "knowledgePointIds" && entry.count === 2), true);
  assert.equal(parsed.selectorWarnings.some((entry) => entry.code === "selector_id_dropped" && entry.field === "patternGroupIds" && entry.count === 2), true);
});

test("S58I public query rejects cross-unit mode and never exposes hidden public mode flags", () => {
  const params = new URLSearchParams({
    sourceId: SOURCE_ID,
    selectionMode: BATCH_A_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_CROSS_UNIT,
    kp: TOTAL_KP,
    pg: TOTAL_GROUP,
    hiddenSemanticMode: "1",
    representationMode: "numeric_expression",
    numericMode: "1"
  });
  const parsed = parseQueryState(`?${params}`);
  assert.equal(parsed.selectionMode, BATCH_A_SELECTION_MODES.SOURCE_UNIT);
  assert.deepEqual(parsed.selectedKnowledgePointIds, []);
  assert.deepEqual(parsed.selectedPatternGroupIds, []);
  assert.equal(parsed.selectorWarnings.some((entry) => entry.code === "selector_mode_fallback"), true);
  assert.equal(Object.hasOwn(parsed, "hiddenSemanticMode"), false);
  assert.equal(Object.hasOwn(parsed, "representationMode"), false);
  assert.equal(Object.hasOwn(parsed, "numericMode"), false);
});

test("S58I public query serialization round-trips G3B-U08 selection without hidden flags", () => {
  const originalWindow = globalThis.window;
  let replacedUrl = null;
  globalThis.window = {
    location: { href: "https://example.test/index.html?hiddenSemanticMode=1&numericMode=1" },
    history: {
      replaceState(_state, _title, url) {
        replacedUrl = String(url);
      }
    }
  };

  try {
    const state = buildClassicState(query({ answerKey: "0", questionCount: "12" }));
    writeQueryStateFromState(state);
    assert.ok(replacedUrl);
    const serialized = new URL(replacedUrl);
    assert.equal(serialized.searchParams.get("sourceId"), SOURCE_ID);
    assert.equal(serialized.searchParams.get("selectionMode"), BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT);
    assert.deepEqual(serialized.searchParams.getAll("kp"), [TOTAL_KP]);
    assert.deepEqual(serialized.searchParams.getAll("pg"), [TOTAL_GROUP]);
    assert.equal(serialized.searchParams.get("answerKey"), "0");
    assert.equal(serialized.searchParams.has("hiddenSemanticMode"), false);
    assert.equal(serialized.searchParams.has("representationMode"), false);
    assert.equal(serialized.searchParams.has("numericMode"), false);

    const roundTrip = parseQueryState(serialized.search);
    assert.equal(roundTrip.selectionMode, BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT);
    assert.deepEqual(roundTrip.selectedKnowledgePointIds, [TOTAL_KP]);
    assert.deepEqual(roundTrip.selectedPatternGroupIds, [TOTAL_GROUP]);
  } finally {
    if (originalWindow === undefined) delete globalThis.window;
    else globalThis.window = originalWindow;
  }
});

test("S58I Classic public path generates the canonical application-only worksheet with locked print profile", () => {
  const state = buildClassicState(query({ questionCount: "16", columns: "6", rowsPerPage: "20" }));
  const plan = getBatchAWorksheetPlan(state);
  assert.equal(plan.sourceId, SOURCE_ID);
  assert.deepEqual(plan.selectedKnowledgePointIds, [TOTAL_KP]);
  assert.deepEqual(plan.selectedPatternGroupIds, [TOTAL_GROUP]);

  const result = buildWorksheetDocumentFromState(state);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const document = result.worksheetDocument;
  assert.equal(document.productionUse, "allowed");
  assert.equal(document.semanticSummary.applicationOnly, true);
  assert.equal(document.semanticSummary.horizontalOnly, true);
  assert.equal(document.summary.numericQuestionCount, 0);
  assert.equal(document.printOptions.columns, 2);
  assert.equal(document.printOptions.rowsPerPage, 4);
  assert.equal(document.printOptions.answerKeyColumns, 1);
  assert.equal(document.printOptions.answerKeyRowsPerPage, 8);
  assert.equal(document.answerKeyItems.length, 16);
  assert.equal(document.generatedQuestions.every((item) => item.representation === "horizontal_only"), true);
});

test("S58I Classic answer-page toggle suppresses answer items and pages without changing canonical question output", () => {
  const state = buildClassicState(query({ answerKey: "0", questionCount: "9" }));
  const result = buildWorksheetDocumentFromState(state);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const document = result.worksheetDocument;
  assert.equal(document.generatedQuestions.length, 9);
  assert.equal(document.questionPages.length > 0, true);
  assert.equal(document.answerKeyItems.length, 0);
  assert.equal(document.answerKeyPages.length, 0);
  assert.equal(document.printOptions.showAnswerKey, false);
  assert.equal(document.printOptions.answerKeyPlacement, "none");
});

test("S58I Classic and Pixel print controllers focus and print only successful preview output", () => {
  const calls = [];
  const previewFrame = {
    contentWindow: {
      focus() { calls.push("focus"); },
      print() { calls.push("print"); }
    }
  };
  printPreviewFrame(previewFrame);
  assert.deepEqual(calls, ["focus", "print"]);
  assert.throws(() => printPreviewFrame({}), /Preview frame window is not available/);

  const { execution } = buildPixelExecution({ questionCount: 8 });
  const availability = printPixelWorksheet(previewFrame, execution);
  assert.equal(availability.ready, true);
  assert.equal(availability.includesAnswerKey, true);
  assert.equal(availability.buttonLabel, "列印題目卷＋答案頁");
  assert.deepEqual(calls, ["focus", "print", "focus", "print"]);
  assert.throws(() => printPixelWorksheet(previewFrame, { summary: { ok: false } }), /successful worksheet generation/);
});

test("S58I Classic index and 404 expose safe selector, answer-page and print controls only", () => {
  for (const relativePath of ["../../site/index.html", "../../site/404.html"]) {
    const html = readFileSync(new URL(relativePath, import.meta.url), "utf8");
    assert.match(html, /id="batch-a-selection-mode-select"/);
    assert.match(html, /value="singleKnowledgePoint"/);
    assert.match(html, /value="mixedKnowledgePointsSameUnit"/);
    assert.match(html, /value="mixedKnowledgePointsCrossUnit" disabled/);
    assert.match(html, /id="batch-a-answer-key-input"[^>]*checked/);
    assert.match(html, /id="print-button"[^>]*disabled/);
    assert.doesNotMatch(html, /(?:id|name)="[^"]*(?:hiddenSemanticMode|representationMode|numericMode)[^"]*"/i);
  }
});

test("S58I Pixel selector exposes six application-only KPs and no representation toggle", () => {
  const selectorState = createPixelKnowledgePointSelectorState({
    sourceId: SOURCE_ID,
    selectionMode: BATCH_A_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
    selectedKnowledgePointIds: G3B_U08_PROMOTED_KNOWLEDGE_POINT_IDS,
    selectedPatternGroupIds: G3B_U08_PROMOTED_PATTERN_GROUP_IDS
  });
  assert.equal(selectorState.visibleCount, 6);
  assert.deepEqual(selectorState.selectedKnowledgePointIds, G3B_U08_PROMOTED_KNOWLEDGE_POINT_IDS);
  assert.deepEqual(selectorState.selectedPatternGroupIds, G3B_U08_PROMOTED_PATTERN_GROUP_IDS);
  assert.equal(selectorState.patternGroupChoices.length, 6);
  assert.equal(selectorState.patternGroupChoices.every((choice) => choice.hasRepresentationChoice === false), true);
});

test("S58I Pixel single and mixed public paths share canonical answer-page and locked print behavior", () => {
  const single = buildPixelExecution({ questionCount: 8, includeAnswerKey: true });
  assert.equal(single.execution.summary.ok, true, JSON.stringify(single.execution.summary.errors));
  assert.equal(single.execution.result.worksheetDocument.productionUse, "allowed");
  assert.equal(single.execution.result.worksheetDocument.printOptions.columns, 2);
  assert.equal(single.execution.result.worksheetDocument.printOptions.rowsPerPage, 4);
  assert.equal(single.execution.summary.answerKeyItemCount, 8);
  const singlePrint = summarizePixelPrintAvailability(single.execution);
  assert.equal(singlePrint.ready, true);
  assert.equal(singlePrint.outputLabel, "題目卷＋答案頁");

  const mixed = buildPixelExecution({
    selectionMode: BATCH_A_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
    selectedKnowledgePointIds: [TOTAL_KP, GROUP_COUNT_KP],
    selectedPatternGroupIds: [TOTAL_GROUP, GROUP_COUNT_GROUP],
    includeAnswerKey: false,
    questionCount: 12
  });
  assert.equal(mixed.execution.summary.ok, true, JSON.stringify(mixed.execution.summary.errors));
  assert.equal(mixed.execution.result.worksheetDocument.semanticSummary.knowledgePointCount, 2);
  assert.equal(mixed.execution.result.worksheetDocument.answerKeyItems.length, 0);
  assert.equal(mixed.execution.result.worksheetDocument.answerKeyPages.length, 0);
  const mixedPrint = summarizePixelPrintAvailability(mixed.execution);
  assert.equal(mixedPrint.ready, true);
  assert.equal(mixedPrint.includesAnswerKey, false);
  assert.equal(mixedPrint.outputLabel, "僅題目卷");
  assert.equal(mixedPrint.buttonLabel, "列印題目卷");
});

test("S58I Pixel public HTML keeps cross-unit mode and hidden representation controls unavailable", () => {
  const html = readFileSync(new URL("../../site/pixel/index.html", import.meta.url), "utf8");
  assert.match(html, /跨單元知識點混合尚未開放/);
  assert.match(html, /id="pixel-answer-key"[^>]*checked/);
  assert.match(html, /id="pixel-print-button"[^>]*disabled/);
  assert.doesNotMatch(html, /(?:id|name)="[^"]*(?:hiddenSemanticMode|representationMode|numericMode)[^"]*"/i);
});
