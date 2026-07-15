import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  G4B_U04_LAYOUT_CAPPED_CODE,
  G4B_U04_LAYOUT_CAPPED_NOTICE,
  G4B_U04_LAYOUT_MODES,
  normalizeG4BU04LayoutMode,
  resolveG4BU04WorksheetLayout,
} from "../../site/modules/curriculum/batch-b/g4b-u04-layout-resolution.js";
import {
  buildBatchABrowserWorksheetDocument,
  G4B_U04_R2D_WORKSHEET_LAYOUT_INTEGRATION,
} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-r2d-entry.js";
import {
  G4B_U04_RENDERER_PROFILES,
} from "../../site/modules/curriculum/registry/g4b-u04-worksheet-promotion.js";
import {
  createConfigState,
  getBatchAWorksheetPlan,
  setBatchALayoutMode,
} from "../../site/assets/browser/state/config-state.js";
import {
  parseQueryState,
  writeQueryStateFromState,
} from "../../site/assets/browser/state/query-state.js";
import {
  renderPreviewFrame,
} from "../../site/assets/browser/pipeline/render-preview-frame.js";
import {
  createPixelKnowledgePointSelectorState,
} from "../../site/pixel/pixel-selector-state.js";
import {
  createPixelWorksheetState,
  getPixelWorksheetPlan,
} from "../../site/pixel/pixel-worksheet-state.js";
import {
  runPixelWorksheetGeneration,
} from "../../site/pixel/pixel-generation-controller.js";

const SOURCE_ID = "g4b_u04_4b04";

function readText(relativePath) {
  return readFileSync(new URL(`../../${relativePath}`, import.meta.url), "utf8");
}

function g4Plan({
  knowledgePointId,
  patternGroupId,
  questionMode,
  questionCount = 12,
  layoutMode = "auto_safe",
  columns = 6,
  rowsPerPage = 20,
  includeAnswerKey = true,
  seed = "r2d-layout",
} = {}) {
  return {
    sourceId: SOURCE_ID,
    worksheetMode: "batchAKnowledgePoint",
    selectionMode: "singleKnowledgePoint",
    selectedKnowledgePointIds: [knowledgePointId],
    selectedPatternGroupIds: [patternGroupId],
    questionMode,
    questionCount,
    ordering: "groupedByPattern",
    generationSeed: seed,
    includeAnswerKey,
    layoutMode,
    printLayout: {
      paperSize: "A4",
      columns,
      rowsPerPage,
      showAnswerKeyPage: includeAnswerKey,
    },
  };
}

const NUMERIC_PLAN = Object.freeze({
  knowledgePointId: "kp_g4b_u04_round_half_up_place_value",
  patternGroupId: "pg_g4b_u04_round_half_up",
  questionMode: "numeric",
});

const CONTEXTUAL_PLAN = Object.freeze({
  knowledgePointId: "kp_g4b_u04_payment_denomination_ceiling",
  patternGroupId: "pg_g4b_u04_payment_ceiling",
  questionMode: "application",
});

const INVERSE_PLAN = Object.freeze({
  knowledgePointId: "kp_g4b_u04_inverse_rounding_possible_original",
  patternGroupId: "pg_g4b_u04_inverse_original_values",
  questionMode: "reasoning",
});

test("R2D freezes two public layout modes and normalizes invalid input to auto_safe", () => {
  assert.deepEqual(G4B_U04_LAYOUT_MODES, ["auto_safe", "custom_with_caps"]);
  assert.equal(normalizeG4BU04LayoutMode("custom_with_caps"), "custom_with_caps");
  assert.equal(normalizeG4BU04LayoutMode("unsafe_unlimited"), "auto_safe");
  assert.equal(G4B_U04_R2D_WORKSHEET_LAYOUT_INTEGRATION.profileCapBypassAllowed, false);
  assert.equal(G4B_U04_R2D_WORKSHEET_LAYOUT_INTEGRATION.answerKeyProfileControlled, true);
});

test("R2D auto_safe selects the complete compact profile and does not treat ignored generic density as a cap event", () => {
  const resolved = resolveG4BU04WorksheetLayout({
    profile: G4B_U04_RENDERER_PROFILES.compact,
    layoutMode: "auto_safe",
    requestedLayout: { paperSize: "A4", columns: 6, rowsPerPage: 20 },
  });
  assert.deepEqual(resolved.requestedQuestionLayout, { paperSize: "A4", columns: 6, rowsPerPage: 20 });
  assert.deepEqual(resolved.resolvedQuestionLayout, { paperSize: "A4", columns: 2, rowsPerPage: 6 });
  assert.deepEqual(resolved.resolvedAnswerLayout, { paperSize: "A4", columns: 2, rowsPerPage: 8 });
  assert.equal(resolved.capped, false);
  assert.equal(resolved.noticeText, null);
  assert.deepEqual(resolved.warnings, []);
  assert.equal(resolved.appliedLayoutText, "套用版面：題目 2 欄 × 6 列；答案 2 欄 × 8 列");
});

test("R2D custom_with_caps accepts lower contextual density while keeping answer layout profile-controlled", () => {
  const resolved = resolveG4BU04WorksheetLayout({
    profile: G4B_U04_RENDERER_PROFILES.contextual,
    layoutMode: "custom_with_caps",
    requestedLayout: { paperSize: "A4", columns: 1, rowsPerPage: 3 },
  });
  assert.deepEqual(resolved.resolvedQuestionLayout, { paperSize: "A4", columns: 1, rowsPerPage: 3 });
  assert.deepEqual(resolved.resolvedAnswerLayout, { paperSize: "A4", columns: 1, rowsPerPage: 6 });
  assert.equal(resolved.answerKeyProfileControlled, true);
  assert.equal(resolved.capped, false);
  assert.equal(resolved.appliedLayoutText, "套用版面：題目 1 欄 × 3 列；答案 1 欄 × 6 列");
});

test("R2D custom_with_caps clamps inverse density and emits the exact non-blocking notice", () => {
  const resolved = resolveG4BU04WorksheetLayout({
    profile: G4B_U04_RENDERER_PROFILES.inverseLong,
    layoutMode: "custom_with_caps",
    requestedLayout: { paperSize: "A4", columns: 6, rowsPerPage: 20 },
  });
  assert.deepEqual(resolved.resolvedQuestionLayout, { paperSize: "A4", columns: 2, rowsPerPage: 4 });
  assert.deepEqual(resolved.resolvedAnswerLayout, { paperSize: "A4", columns: 1, rowsPerPage: 5 });
  assert.deepEqual(resolved.cappedFields, ["columns", "rowsPerPage"]);
  assert.equal(resolved.capped, true);
  assert.equal(resolved.noticeText, G4B_U04_LAYOUT_CAPPED_NOTICE);
  assert.equal(resolved.warnings.length, 1);
  assert.equal(resolved.warnings[0].code, G4B_U04_LAYOUT_CAPPED_CODE);
  assert.equal(resolved.warnings[0].severity, "warning");
});

test("R2D worksheet auto_safe readback republishes compact profile values and re-paginates output", () => {
  const result = buildBatchABrowserWorksheetDocument(g4Plan({ ...NUMERIC_PLAN, questionCount: 12 }));
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const document = result.worksheetDocument;
  assert.equal(document.layoutResolution.layoutMode, "auto_safe");
  assert.equal(document.layoutResolution.profileId, G4B_U04_RENDERER_PROFILES.compact.profileId);
  assert.deepEqual(document.layoutResolution.resolvedQuestionLayout, { paperSize: "A4", columns: 2, rowsPerPage: 6 });
  assert.deepEqual(document.layoutResolution.resolvedAnswerLayout, { paperSize: "A4", columns: 2, rowsPerPage: 8 });
  assert.equal(document.printOptions.columns, 2);
  assert.equal(document.printOptions.rowsPerPage, 6);
  assert.equal(document.printOptions.answerKeyColumns, 2);
  assert.equal(document.printOptions.answerKeyRowsPerPage, 8);
  assert.equal(document.questionPages.length, 1);
  assert.equal(document.answerKeyPages.length, 1);
  assert.equal(document.publicControls.layoutMode, "auto_safe");
  assert.equal(document.configSnapshot.layoutMode, "auto_safe");
  assert.equal(document.appliedLayoutText, "套用版面：題目 2 欄 × 6 列；答案 2 欄 × 8 列");
});

test("R2D worksheet custom mode honors lower contextual density and records requested versus resolved values", () => {
  const result = buildBatchABrowserWorksheetDocument(g4Plan({
    ...CONTEXTUAL_PLAN,
    questionCount: 8,
    layoutMode: "custom_with_caps",
    columns: 1,
    rowsPerPage: 3,
  }));
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const document = result.worksheetDocument;
  assert.deepEqual(document.layoutResolution.requestedQuestionLayout, { paperSize: "A4", columns: 1, rowsPerPage: 3 });
  assert.deepEqual(document.layoutResolution.resolvedQuestionLayout, { paperSize: "A4", columns: 1, rowsPerPage: 3 });
  assert.deepEqual(document.layoutResolution.resolvedAnswerLayout, { paperSize: "A4", columns: 1, rowsPerPage: 6 });
  assert.equal(document.layoutResolution.capped, false);
  assert.equal(document.questionPages.length, 3);
  assert.equal(document.answerKeyPages.length, 2);
  assert.deepEqual(document.configSnapshot.requestedPrintLayout, { paperSize: "A4", columns: 1, rowsPerPage: 3 });
  assert.equal(document.summary.layoutMode, "custom_with_caps");
});

test("R2D worksheet clamps inverse custom density, keeps generation successful and exposes one warning", () => {
  const result = buildBatchABrowserWorksheetDocument(g4Plan({
    ...INVERSE_PLAN,
    questionCount: 4,
    layoutMode: "custom_with_caps",
    columns: 6,
    rowsPerPage: 20,
  }));
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const document = result.worksheetDocument;
  assert.equal(document.layoutResolution.capped, true);
  assert.deepEqual(document.layoutResolution.resolvedQuestionLayout, { paperSize: "A4", columns: 2, rowsPerPage: 4 });
  assert.deepEqual(document.layoutResolution.resolvedAnswerLayout, { paperSize: "A4", columns: 1, rowsPerPage: 5 });
  assert.equal(document.layoutNoticeText, G4B_U04_LAYOUT_CAPPED_NOTICE);
  assert.equal(result.warnings.filter((row) => row.code === G4B_U04_LAYOUT_CAPPED_CODE).length, 1);
  assert.equal(document.validationSummary.ok, true);
  assert.equal(document.questionPages.length, 1);
  assert.equal(document.answerKeyPages.length, 1);
});

test("R2D answer suppression keeps the resolved answer profile in metadata but emits no answer pages", () => {
  const result = buildBatchABrowserWorksheetDocument(g4Plan({
    ...INVERSE_PLAN,
    questionCount: 4,
    includeAnswerKey: false,
    layoutMode: "custom_with_caps",
    columns: 1,
    rowsPerPage: 2,
  }));
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.deepEqual(result.worksheetDocument.answerKeyItems, []);
  assert.deepEqual(result.worksheetDocument.answerKeyPages, []);
  assert.deepEqual(result.worksheetDocument.layoutResolution.resolvedAnswerLayout, { paperSize: "A4", columns: 1, rowsPerPage: 5 });
  assert.equal(result.worksheetDocument.layoutResolution.includeAnswerKey, false);
});

test("R2D preview HTML displays applied layout, cap notice and machine-readable requested/resolved values", () => {
  const result = buildBatchABrowserWorksheetDocument(g4Plan({
    ...INVERSE_PLAN,
    questionCount: 4,
    layoutMode: "custom_with_caps",
    columns: 6,
    rowsPerPage: 20,
  }));
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const frame = { srcdoc: "", dataset: {} };
  const rendered = renderPreviewFrame(frame, result.worksheetDocument, { stylesheetHref: "" });
  assert.equal(rendered.html, frame.srcdoc);
  assert.match(frame.srcdoc, /g4b-u04-layout-readback/);
  assert.match(frame.srcdoc, /套用版面：題目 2 欄 × 4 列；答案 1 欄 × 5 列/);
  assert.match(frame.srcdoc, /已依長文字題型自動調整為安全版面。/);
  assert.match(frame.srcdoc, /data-g4b-u04-requested-columns="6"/);
  assert.match(frame.srcdoc, /data-g4b-u04-resolved-columns="2"/);
  assert.match(frame.srcdoc, /data-public-layout-mode="custom_with_caps"/);
  assert.match(frame.srcdoc, /@media print\{\.g4b-u04-layout-readback\{display:none!important\}\}/);
});

test("R2D Classic query state round-trips layoutMode and keeps G5-only controls absent", () => {
  const params = new URLSearchParams({
    sourceId: SOURCE_ID,
    selectionMode: "singleKnowledgePoint",
    questionMode: "application",
    layoutMode: "custom_with_caps",
    questionCount: "8",
    ordering: "groupedByPattern",
    answerKey: "1",
    generationSeed: "r2d-query",
    columns: "1",
    rowsPerPage: "3",
  });
  params.append("kp", CONTEXTUAL_PLAN.knowledgePointId);
  params.append("pg", CONTEXTUAL_PLAN.patternGroupId);
  const parsed = parseQueryState(`?${params}`);
  assert.equal(parsed.layoutMode, "custom_with_caps");
  const state = createConfigState({ queryState: parsed });
  assert.equal(getBatchAWorksheetPlan(state).layoutMode, "custom_with_caps");
  setBatchALayoutMode(state, "auto_safe");
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
  assert.equal(written.searchParams.get("layoutMode"), "auto_safe");
  assert.equal(written.searchParams.get("depthMode"), null);
  assert.equal(written.searchParams.get("contextMode"), null);
});

test("R2D Pixel state generates through the same capped layout resolver", () => {
  const selectorState = createPixelKnowledgePointSelectorState({
    sourceId: SOURCE_ID,
    selectionMode: "singleKnowledgePoint",
    selectedKnowledgePointIds: [INVERSE_PLAN.knowledgePointId],
    selectedPatternGroupIds: [INVERSE_PLAN.patternGroupId],
  });
  const state = createPixelWorksheetState({
    sourceId: SOURCE_ID,
    selectorState,
    questionMode: "reasoning",
    layoutMode: "custom_with_caps",
    questionCount: 4,
    columns: 6,
    rowsPerPage: 20,
    includeAnswerKey: true,
  });
  assert.equal(getPixelWorksheetPlan(state).layoutMode, "custom_with_caps");
  const execution = runPixelWorksheetGeneration(state);
  assert.equal(execution.summary.ok, true, JSON.stringify(execution.summary.errors));
  assert.equal(execution.result.worksheetDocument.layoutResolution.capped, true);
  assert.equal(execution.result.worksheetDocument.appliedLayoutText, "套用版面：題目 2 欄 × 4 列；答案 1 欄 × 5 列");
});

test("R2D public adapters expose layout controls and stale-output wiring on Classic and Pixel", () => {
  const classic = readText("site/assets/browser/g4b-u04-public-controls.js");
  const pixel = readText("site/pixel/g4b-u04-public-controls.js");
  const pixelPrint = readText("site/pixel/pixel-print-surface.js");
  const preview = readText("site/assets/browser/pipeline/render-preview-frame.js");
  assert.match(classic, /g4b-u04-layout-mode/);
  assert.match(classic, /custom_with_caps/);
  assert.match(classic, /proxyLayoutChange/);
  assert.match(pixel, /pixel-g4b-u04-layout-mode/);
  assert.match(pixel, /proxyLayoutChange/);
  assert.match(pixelPrint, /pixel-g4b-u04-layout-mode/);
  assert.match(preview, /g4b-u04-applied-layout/);
  assert.match(preview, /preview-meta/);
});

test("R2D leaves unrelated worksheet routes without G4B-U04 layout metadata", () => {
  const result = buildBatchABrowserWorksheetDocument({
    sourceId: "g3a_u02_3a02",
    selectionMode: "sourceUnit",
    questionCount: 4,
    ordering: "groupedByPattern",
    generationSeed: "r2d-delegation",
    includeAnswerKey: true,
    printLayout: { columns: 4, rowsPerPage: 10, showAnswerKeyPage: true },
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.worksheetDocument.layoutResolution, undefined);
  assert.equal(result.worksheetDocument.appliedLayoutText, undefined);
});
