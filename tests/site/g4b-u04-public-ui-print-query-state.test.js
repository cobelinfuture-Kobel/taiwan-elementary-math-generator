import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { buildWorksheetDocumentFromState } from "../../site/assets/browser/pipeline/build-worksheet-document.js";
import {
  createConfigState,
  getBatchAWorksheetPlan,
  setBatchASourceId,
} from "../../site/assets/browser/state/config-state.js";
import { publicIssueMessage } from "../../site/assets/browser/state/public-ui-messages.js";
import { parseQueryState, writeQueryStateFromState } from "../../site/assets/browser/state/query-state.js";
import {
  createPixelKnowledgePointSelectorState,
} from "../../site/pixel/pixel-selector-state.js";
import {
  createPixelWorksheetState,
  getPixelWorksheetPlan,
} from "../../site/pixel/pixel-worksheet-state.js";
import { runPixelWorksheetGeneration } from "../../site/pixel/pixel-generation-controller.js";
import {
  G4B_U04_PUBLIC_UI_PRINT_QA,
  validateG4BU04PublicUIPrintQAContract,
} from "../../site/modules/curriculum/batch-b/g4b-u04-public-ui-print-qa.js";

const SOURCE_ID = "g4b_u04_4b04";
const KP_ID = "kp_g4b_u04_round_then_add_subtract";
const GROUP_ID = "pg_g4b_u04_estimate_add_subtract";

function readText(relativePath) {
  return readFileSync(new URL(`../../${relativePath}`, import.meta.url), "utf8");
}

function query(overrides = {}) {
  const params = new URLSearchParams({
    sourceId: SOURCE_ID,
    selectionMode: "singleKnowledgePoint",
    questionMode: "operation_estimation",
    questionCount: "12",
    ordering: "shuffleAcrossPatterns",
    answerKey: "1",
    generationSeed: "s74-query",
    columns: "2",
    rowsPerPage: "4",
    ...overrides,
  });
  params.append("kp", KP_ID);
  params.append("pg", GROUP_ID);
  return `?${params.toString()}`;
}

const MODE_CASES = Object.freeze([
  ["concept", "kp_g4b_u04_approximation_language_cues", "pg_g4b_u04_approximation_language"],
  ["numeric", "kp_g4b_u04_round_half_up_place_value", "pg_g4b_u04_round_half_up"],
  ["application", "kp_g4b_u04_payment_denomination_ceiling", "pg_g4b_u04_payment_ceiling"],
  ["operation_estimation", KP_ID, GROUP_ID],
  ["reasoning", "kp_g4b_u04_inverse_rounding_unknown_digit", "pg_g4b_u04_inverse_digit_set"],
]);

test("S74 contract locks three public surfaces, six modes and three renderer profiles", () => {
  const result = validateG4BU04PublicUIPrintQAContract();
  assert.equal(result.ok, true, result.errors.join(","));
  assert.deepEqual(result.counts, {
    surfaces: 3,
    knowledgePoints: 12,
    patternGroups: 12,
    patternSpecs: 17,
    questionModes: 6,
    rendererProfiles: 3,
  });
  assert.deepEqual(G4B_U04_PUBLIC_UI_PRINT_QA.surfaces, ["classic", "fallback404", "pixel"]);
  assert.equal(G4B_U04_PUBLIC_UI_PRINT_QA.productionUse, "preview_only_pending_s75");
  assert.equal(G4B_U04_PUBLIC_UI_PRINT_QA.htmlPdfSmokeImplemented, false);
});

test("S74 query state preserves valid G4B-U04 KP, group, mode and print settings", () => {
  const parsed = parseQueryState(query());
  assert.equal(parsed.sourceId, SOURCE_ID);
  assert.equal(parsed.selectionMode, "singleKnowledgePoint");
  assert.deepEqual(parsed.selectedKnowledgePointIds, [KP_ID]);
  assert.deepEqual(parsed.selectedPatternGroupIds, [GROUP_ID]);
  assert.equal(parsed.questionMode, "operation_estimation");
  assert.equal(parsed.questionCount, 12);
  assert.equal(parsed.ordering, "shuffleAcrossPatterns");
  assert.equal(parsed.includeAnswerKey, true);
  assert.equal(parsed.columns, 2);
  assert.equal(parsed.rowsPerPage, 4);
  assert.deepEqual(parsed.selectorWarnings, []);
});

test("S74 query state sanitizes unsupported mode and cross-unit ids", () => {
  const params = new URLSearchParams(query().slice(1));
  params.set("questionMode", "formal_equation");
  params.append("kp", "kp_g4b_u01_three_by_three_multiplication");
  params.append("pg", "pg_g4b_u01_three_by_three_multiplication");
  const parsed = parseQueryState(`?${params.toString()}`);
  assert.equal(parsed.questionMode, "mixed");
  assert.equal(parsed.selectionMode, "singleKnowledgePoint");
  assert.deepEqual(parsed.selectedKnowledgePointIds, [KP_ID]);
  assert.deepEqual(parsed.selectedPatternGroupIds, [GROUP_ID]);
  assert.ok(parsed.selectorWarnings.some((warning) => warning.code === "selector_id_dropped"));
});

test("S74 query writer round-trips G4B-U04 mode without adding G5-only controls", () => {
  const state = createConfigState({ queryState: parseQueryState(query()) });
  let replaced = null;
  const previousWindow = globalThis.window;
  globalThis.window = {
    location: { href: "https://example.test/math" },
    history: { replaceState: (_state, _title, value) => { replaced = String(value); } },
  };
  try {
    writeQueryStateFromState(state);
  } finally {
    globalThis.window = previousWindow;
  }
  assert.ok(replaced);
  const written = new URL(replaced);
  assert.equal(written.searchParams.get("sourceId"), SOURCE_ID);
  assert.equal(written.searchParams.get("questionMode"), "operation_estimation");
  assert.equal(written.searchParams.get("depthMode"), null);
  assert.equal(written.searchParams.get("contextMode"), null);
  assert.deepEqual(written.searchParams.getAll("kp"), [KP_ID]);
  assert.deepEqual(written.searchParams.getAll("pg"), [GROUP_ID]);
  const parsed = parseQueryState(written.search);
  assert.equal(parsed.questionMode, "operation_estimation");
  assert.deepEqual(parsed.selectedKnowledgePointIds, [KP_ID]);
});

test("S74 Classic query state builds printable contextual worksheet and answer key", () => {
  const state = createConfigState({ queryState: parseQueryState(query()) });
  const plan = getBatchAWorksheetPlan(state);
  assert.equal(plan.questionMode, "operation_estimation");
  assert.deepEqual(plan.publicControls, { questionMode: "operation_estimation" });
  const result = buildWorksheetDocumentFromState(state);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.worksheetDocument.generatedQuestions.length, 12);
  assert.equal(result.worksheetDocument.answerKeyItems.length, 12);
  assert.equal(result.worksheetDocument.rendererProfile.profileId, "g4b_u04_contextual_estimation_v1");
  assert.ok(result.worksheetDocument.generatedQuestions.every((item) => item.mode === "operation_estimation"));
});

test("S74 all five explicit G4B-U04 question modes remain publicly generatable", () => {
  for (const [questionMode, knowledgePointId, patternGroupId] of MODE_CASES) {
    const params = new URLSearchParams({
      sourceId: SOURCE_ID,
      selectionMode: "singleKnowledgePoint",
      questionMode,
      questionCount: "4",
      answerKey: "1",
      ordering: "groupedByPattern",
      generationSeed: `s74-${questionMode}`,
      columns: "2",
      rowsPerPage: "4",
    });
    params.append("kp", knowledgePointId);
    params.append("pg", patternGroupId);
    const result = buildWorksheetDocumentFromState(createConfigState({ queryState: parseQueryState(`?${params}`) }));
    assert.equal(result.ok, true, `${questionMode}:${JSON.stringify(result.errors)}`);
    assert.equal(result.worksheetDocument.generatedQuestions.length, 4);
    assert.ok(result.worksheetDocument.generatedQuestions.every((item) => item.mode === questionMode));
  }
});

test("S74 Pixel state consumes the same G4B-U04 mode and canonical worksheet path", () => {
  const selectorState = createPixelKnowledgePointSelectorState({
    sourceId: SOURCE_ID,
    selectionMode: "singleKnowledgePoint",
    selectedKnowledgePointIds: [KP_ID],
    selectedPatternGroupIds: [GROUP_ID],
  });
  const state = createPixelWorksheetState({
    sourceId: SOURCE_ID,
    selectorState,
    questionMode: "operation_estimation",
    questionCount: 8,
    ordering: "shuffleAcrossPatterns",
    includeAnswerKey: true,
    generationSeed: "s74-pixel",
  });
  const plan = getPixelWorksheetPlan(state);
  assert.equal(plan.questionMode, "operation_estimation");
  const execution = runPixelWorksheetGeneration(state);
  assert.equal(execution.summary.ok, true, JSON.stringify(execution.summary.errors));
  assert.equal(execution.summary.questionCount, 8);
  assert.equal(execution.summary.answerKeyItemCount, 8);
  assert.equal(execution.result.worksheetDocument.rendererProfile.profileId, "g4b_u04_contextual_estimation_v1");
});

test("S74 answer-key controls suppress Classic and Pixel answer pages", () => {
  const classicParams = new URLSearchParams(query().slice(1));
  classicParams.set("answerKey", "0");
  const classic = buildWorksheetDocumentFromState(createConfigState({ queryState: parseQueryState(`?${classicParams}`) }));
  assert.equal(classic.ok, true, JSON.stringify(classic.errors));
  assert.deepEqual(classic.worksheetDocument.answerKeyItems, []);
  assert.deepEqual(classic.worksheetDocument.answerKeyPages, []);

  const selectorState = createPixelKnowledgePointSelectorState({
    sourceId: SOURCE_ID,
    selectionMode: "singleKnowledgePoint",
    selectedKnowledgePointIds: [KP_ID],
    selectedPatternGroupIds: [GROUP_ID],
  });
  const pixel = runPixelWorksheetGeneration(createPixelWorksheetState({
    sourceId: SOURCE_ID,
    selectorState,
    questionMode: "operation_estimation",
    questionCount: 6,
    includeAnswerKey: false,
  }));
  assert.equal(pixel.summary.ok, true, JSON.stringify(pixel.summary.errors));
  assert.equal(pixel.summary.answerKeyItemCount, 0);
  assert.deepEqual(pixel.result.worksheetDocument.answerKeyPages, []);
});

test("S74 source switching normalizes incompatible G4 and G5 question modes", () => {
  const state = createConfigState({ queryState: { sourceId: SOURCE_ID, questionMode: "operation_estimation" } });
  assert.equal(getBatchAWorksheetPlan(state).questionMode, "operation_estimation");
  setBatchASourceId(state, "g5a_u08_5a08");
  const g5Plan = getBatchAWorksheetPlan(state);
  assert.equal(g5Plan.questionMode, "mixed");
  assert.equal(g5Plan.depthMode, "mixed");
  assert.equal(g5Plan.contextMode, "mixed");
});

test("S74 Classic, fallback and Pixel mount controls and invalidate stale print", () => {
  const classicAdapter = readText("site/assets/browser/g4b-u04-public-controls.js");
  const renderPipeline = readText("site/assets/browser/pipeline/render-preview-frame.js");
  assert.match(classicAdapter, /g4b-u04-question-mode/);
  assert.match(classicAdapter, /operation_estimation/);
  assert.match(classicAdapter, /proxy\.dispatchEvent/);
  assert.match(renderPipeline, /g4b-u04-public-controls\.js/);
  for (const path of ["site/index.html", "site/404.html"]) {
    assert.match(readText(path), /assets\/browser\/main\.js/);
  }

  const pixelAdapter = readText("site/pixel/g4b-u04-public-controls.js");
  const pixelPrint = readText("site/pixel/pixel-print-surface.js");
  assert.match(pixelAdapter, /pixel-g4b-u04-question-mode/);
  assert.match(pixelAdapter, /operation_estimation/);
  assert.match(pixelPrint, /g4b-u04-public-controls\.js/);
  assert.match(pixelPrint, /pixel-g4b-u04-question-mode/);
  assert.match(pixelPrint, /markPrintStale/);
});

test("S74 public messages retain Traditional Chinese and redact internal identifiers", () => {
  const message = publicIssueMessage({
    code: "G4B_U04_CANONICAL_GROUP_NOT_RESOLVED",
    severity: "error",
    message: "題目形式 pg_g4b_u04_hidden 與知識點 kp_g4b_u04_hidden 不相符。",
  });
  assert.match(message, /題目形式|知識點/);
  assert.equal(message.includes("pg_g4b_u04"), false);
  assert.equal(message.includes("kp_g4b_u04"), false);
});
