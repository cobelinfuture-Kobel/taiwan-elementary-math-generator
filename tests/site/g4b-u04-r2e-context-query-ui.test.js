import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { buildWorksheetDocumentFromState } from "../../site/assets/browser/pipeline/build-worksheet-document.js";
import {
  createConfigState,
  getBatchAWorksheetPlan,
} from "../../site/assets/browser/state/config-state.js";
import { parseQueryState, writeQueryStateFromState } from "../../site/assets/browser/state/query-state.js";
import { createPixelKnowledgePointSelectorState } from "../../site/pixel/pixel-selector-state.js";
import { createPixelWorksheetState, getPixelWorksheetPlan } from "../../site/pixel/pixel-worksheet-state.js";
import { runPixelWorksheetGeneration } from "../../site/pixel/pixel-generation-controller.js";

const SOURCE_ID = "g4b_u04_4b04";
const KP_ID = "kp_g4b_u04_round_then_multiply_divide";
const GROUP_ID = "pg_g4b_u04_estimate_multiply_divide";

function readText(relativePath) {
  return readFileSync(new URL(`../../${relativePath}`, import.meta.url), "utf8");
}

function query(overrides = {}) {
  const params = new URLSearchParams({
    sourceId: SOURCE_ID,
    selectionMode: "singleKnowledgePoint",
    questionMode: "operation_estimation",
    contextMode: "sdg",
    layoutMode: "custom_with_caps",
    questionCount: "12",
    ordering: "groupedByPattern",
    answerKey: "1",
    generationSeed: "r2e-query",
    columns: "1",
    rowsPerPage: "3",
    ...overrides,
  });
  params.append("kp", KP_ID);
  params.append("pg", GROUP_ID);
  return `?${params}`;
}

test("R2E query parser and writer round-trip G4B contextMode", () => {
  const parsed = parseQueryState(query());
  assert.equal(parsed.contextMode, "sdg");
  assert.equal(parsed.layoutMode, "custom_with_caps");
  assert.equal(parsed.questionMode, "operation_estimation");
  const state = createConfigState({ queryState: parsed });
  const plan = getBatchAWorksheetPlan(state);
  assert.equal(plan.contextMode, "sdg");
  assert.deepEqual(plan.publicControls, {
    questionMode: "operation_estimation",
    layoutMode: "custom_with_caps",
    contextMode: "sdg",
  });

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
  const written = new URL(replaced);
  assert.equal(written.searchParams.get("contextMode"), "sdg");
  assert.equal(written.searchParams.get("layoutMode"), "custom_with_caps");
  assert.equal(written.searchParams.get("depthMode"), null);
});

test("R2E invalid G4B contextMode normalizes to mixed", () => {
  const parsed = parseQueryState(query({ contextMode: "free_form_ai" }));
  assert.equal(parsed.contextMode, "mixed");
  const plan = getBatchAWorksheetPlan(createConfigState({ queryState: parsed }));
  assert.equal(plan.contextMode, "mixed");
});

test("R2E Classic worksheet carries controlled context and resolved layout metadata", () => {
  const state = createConfigState({ queryState: parseQueryState(query()) });
  const result = buildWorksheetDocumentFromState(state);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const document = result.worksheetDocument;
  assert.equal(document.publicControls.contextMode, "sdg");
  assert.equal(document.publicControls.layoutMode, "exact_approved_matrix");
  assert.equal(document.contextAllocation.requestedMode, "sdg");
  assert.equal(document.contextAllocation.counts.sdg, 12);
  assert.equal(document.summary.sdgContextCount, 12);
  assert.equal(document.summary.dailyLifeContextCount, 0);
  assert.equal(document.metadata.contextMode, "sdg");
  assert.equal(document.configSnapshot.contextMode, "sdg");
  assert.equal(document.provenance.genericContextFallbackUsed, false);
  assert.equal(document.provenance.freeFormAIUsed, false);
  assert.equal(document.generatedQuestions.every((question) => question.contextModeApplied === "sdg"), true);
  assert.equal(document.generatedQuestions.every((question) => question.context.fictionalExerciseData === true), true);
});

test("R2E Pixel uses the same context mode and canonical worksheet path", () => {
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
    contextMode: "sdg",
    layoutMode: "auto_safe",
    questionCount: 10,
    includeAnswerKey: true,
    generationSeed: "r2e-pixel",
  });
  const plan = getPixelWorksheetPlan(state);
  assert.equal(plan.contextMode, "sdg");
  const execution = runPixelWorksheetGeneration(state);
  assert.equal(execution.summary.ok, true, JSON.stringify(execution.summary.errors));
  assert.equal(execution.result.worksheetDocument.publicControls.contextMode, "sdg");
  assert.equal(execution.result.worksheetDocument.contextAllocation.counts.sdg, 10);
});

test("R2E Classic and Pixel mount context controls and invalidate stale output", () => {
  const classic = readText("site/assets/browser/g4b-u04-public-controls.js");
  const pixel = readText("site/pixel/g4b-u04-public-controls.js");
  const pixelPrint = readText("site/pixel/pixel-print-surface.js");
  const pipeline = readText("site/assets/browser/pipeline/build-worksheet-document.js");
  assert.match(classic, /g4b-u04-context-mode/);
  assert.match(classic, /g5a-u08-context-mode/);
  assert.match(classic, /虛構練習資料/);
  assert.match(pixel, /pixel-g4b-u04-context-mode/);
  assert.match(pixel, /pixel-g5a-context-mode/);
  assert.match(pixelPrint, /pixel-g4b-u04-context-mode/);
  assert.match(pipeline, /batch-a-browser-worksheet-r2e-entry\.js/);
});
