import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { buildWorksheetDocumentFromState } from "../../site/assets/browser/pipeline/build-worksheet-document.js";
import {
  createConfigState,
  getBatchAWorksheetPlan,
} from "../../site/assets/browser/state/config-state.js";
import { publicIssueMessage } from "../../site/assets/browser/state/public-ui-messages.js";
import { parseQueryState } from "../../site/assets/browser/state/query-state.js";
import {
  createPixelKnowledgePointSelectorState,
} from "../../site/pixel/pixel-selector-state.js";
import {
  createPixelWorksheetState,
  getPixelWorksheetPlan,
} from "../../site/pixel/pixel-worksheet-state.js";
import { runPixelWorksheetGeneration } from "../../site/pixel/pixel-generation-controller.js";
import {
  G5A_U08_PUBLIC_UI_PRINT_QA,
  validateG5AU08PublicUIPrintQAContract,
} from "../../site/modules/curriculum/batch-a/g5a-u08-public-ui-print-qa.js";

const SOURCE_ID = "g5a_u08_5a08";
const KP_ID = "kp_g5a_u08_mul_div_equivalent_regroup";
const GROUP_ID = "pg_g5a_u08_mul_div_regroup_application";

function readText(relativePath) {
  return readFileSync(new URL(`../../${relativePath}`, import.meta.url), "utf8");
}

function query(overrides = {}) {
  const params = new URLSearchParams({
    sourceId: SOURCE_ID,
    selectionMode: "singleKnowledgePoint",
    questionMode: "application",
    depthMode: "N_PLUS_1",
    contextMode: "sdg",
    questionCount: "20",
    ordering: "shuffleAcrossPatterns",
    answerKey: "1",
    generationSeed: "s60k-query",
    columns: "2",
    rowsPerPage: "4",
    ...overrides,
  });
  params.append("kp", KP_ID);
  params.append("pg", GROUP_ID);
  return `?${params.toString()}`;
}

test("S60K contract locks all three public surfaces and G5A controls", () => {
  const result = validateG5AU08PublicUIPrintQAContract();
  assert.equal(result.ok, true, result.errors.join(","));
  assert.deepEqual(result.counts, {
    surfaces: 3,
    knowledgePoints: 11,
    patternGroups: 17,
    patternSpecs: 30,
    questionModes: 4,
    depthModes: 3,
    contextModes: 3,
  });
  assert.deepEqual(G5A_U08_PUBLIC_UI_PRINT_QA.surfaces, ["classic", "fallback404", "pixel"]);
  assert.equal(G5A_U08_PUBLIC_UI_PRINT_QA.publicNPlus2, false);
  assert.equal(G5A_U08_PUBLIC_UI_PRINT_QA.publicFormalEquation, false);
});

test("S60K query state preserves valid G5A KP group mode depth and SDG context", () => {
  const parsed = parseQueryState(query());
  assert.equal(parsed.sourceId, SOURCE_ID);
  assert.equal(parsed.selectionMode, "singleKnowledgePoint");
  assert.deepEqual(parsed.selectedKnowledgePointIds, [KP_ID]);
  assert.deepEqual(parsed.selectedPatternGroupIds, [GROUP_ID]);
  assert.equal(parsed.questionMode, "application");
  assert.equal(parsed.depthMode, "N_PLUS_1");
  assert.equal(parsed.contextMode, "sdg");
  assert.equal(parsed.questionCount, 20);
  assert.equal(parsed.includeAnswerKey, true);
  assert.deepEqual(parsed.selectorWarnings, []);
});

test("S60K query state sanitizes unsupported public controls and cross-unit ids", () => {
  const params = new URLSearchParams(query().slice(1));
  params.set("questionMode", "equation");
  params.set("depthMode", "N_PLUS_2");
  params.set("contextMode", "claimed_real_statistics");
  params.append("kp", "kp_g4b_u01_three_by_three_multiplication");
  params.append("pg", "pg_g4b_u01_three_by_three_multiplication");
  const parsed = parseQueryState(`?${params.toString()}`);
  assert.equal(parsed.questionMode, "mixed");
  assert.equal(parsed.depthMode, "mixed");
  assert.equal(parsed.contextMode, "mixed");
  assert.equal(parsed.selectionMode, "singleKnowledgePoint");
  assert.deepEqual(parsed.selectedKnowledgePointIds, [KP_ID]);
  assert.deepEqual(parsed.selectedPatternGroupIds, [GROUP_ID]);
  assert.ok(parsed.selectorWarnings.some((warning) => warning.code === "selector_id_dropped"));
});

test("S60K Classic query state builds a printable N+1 SDG worksheet", () => {
  const state = createConfigState({ queryState: parseQueryState(query()) });
  const plan = getBatchAWorksheetPlan(state);
  assert.equal(plan.questionMode, "application");
  assert.equal(plan.depthMode, "N_PLUS_1");
  assert.equal(plan.contextMode, "sdg");
  const result = buildWorksheetDocumentFromState(state);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.worksheetDocument.generatedQuestions.length, 20);
  assert.equal(result.worksheetDocument.answerKeyItems.length, 20);
  assert.equal(result.worksheetDocument.rendererProfile.profileId, "g5a_u08_mixed_long_text_v1");
  assert.ok(result.worksheetDocument.generatedQuestions.every((item) => item.depth === "N_PLUS_1"));
  assert.ok(result.worksheetDocument.generatedQuestions.every((item) => item.context.contextType === "sdg"));
});

test("S60K Pixel state consumes the same G5A controls and canonical worksheet path", () => {
  const selectorState = createPixelKnowledgePointSelectorState({
    sourceId: SOURCE_ID,
    selectionMode: "singleKnowledgePoint",
    selectedKnowledgePointIds: [KP_ID],
    selectedPatternGroupIds: [GROUP_ID],
  });
  const state = createPixelWorksheetState({
    sourceId: SOURCE_ID,
    selectorState,
    questionMode: "application",
    depthMode: "N_PLUS_1",
    contextMode: "sdg",
    questionCount: 20,
    ordering: "shuffleAcrossPatterns",
    includeAnswerKey: true,
    generationSeed: "s60k-pixel",
  });
  const plan = getPixelWorksheetPlan(state);
  assert.equal(plan.questionMode, "application");
  assert.equal(plan.depthMode, "N_PLUS_1");
  assert.equal(plan.contextMode, "sdg");
  const execution = runPixelWorksheetGeneration(state);
  assert.equal(execution.summary.ok, true, JSON.stringify(execution.summary.errors));
  assert.equal(execution.summary.questionCount, 20);
  assert.equal(execution.summary.answerKeyItemCount, 20);
  assert.equal(execution.result.worksheetDocument.rendererProfile.profileId, "g5a_u08_mixed_long_text_v1");
});

test("S60K answer-key controls suppress Classic and Pixel answer pages", () => {
  const classicParams = new URLSearchParams(query().slice(1));
  classicParams.set("answerKey", "0");
  const classic = buildWorksheetDocumentFromState(createConfigState({ queryState: parseQueryState(`?${classicParams.toString()}`) }));
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
    questionMode: "application",
    depthMode: "N_PLUS_1",
    contextMode: "sdg",
    questionCount: 8,
    includeAnswerKey: false,
  }));
  assert.equal(pixel.summary.ok, true);
  assert.equal(pixel.summary.answerKeyItemCount, 0);
  assert.deepEqual(pixel.result.worksheetDocument.answerKeyPages, []);
});

test("S60K Classic fallback and Pixel surfaces expose controls without N+2 or equation mode", () => {
  for (const path of ["site/index.html", "site/404.html"]) {
    const html = readText(path);
    assert.match(html, /id="g5a-u08-question-mode"/);
    assert.match(html, /id="g5a-u08-depth-mode"/);
    assert.match(html, /id="g5a-u08-context-mode"/);
    assert.doesNotMatch(html, /value="N_PLUS_2"/);
    assert.doesNotMatch(html, /value="equation"/);
  }
  const pixelHtml = readText("site/pixel/index.html");
  assert.match(pixelHtml, /id="pixel-g5a-question-mode"/);
  assert.match(pixelHtml, /id="pixel-g5a-depth-mode"/);
  assert.match(pixelHtml, /id="pixel-g5a-context-mode"/);
  assert.doesNotMatch(pixelHtml, /value="N_PLUS_2"/);
  assert.doesNotMatch(pixelHtml, /value="equation"/);
});

test("S60K Classic and Pixel controllers invalidate stale print after control changes", () => {
  const classic = readText("site/assets/browser/main.js");
  assert.match(classic, /g5aU08QuestionMode/);
  assert.match(classic, /setBatchAQuestionMode/);
  assert.match(classic, /setBatchADepthMode/);
  assert.match(classic, /setBatchAContextMode/);
  assert.match(classic, /請重新產生後列印/);

  const pixel = readText("site/pixel/pixel-ui.js");
  assert.match(pixel, /questionModeSelect/);
  assert.match(pixel, /depthModeSelect/);
  assert.match(pixel, /contextModeSelect/);
  assert.match(pixel, /pixel:worksheet-stale/);
});

test("S60K public messages retain Traditional Chinese and redact internal identifiers", () => {
  const message = publicIssueMessage({
    code: "G5A_U08_PATTERN_SPEC_MISMATCH",
    severity: "error",
    message: "題型 ps_g5a_u08_hidden 與 kp_g5a_u08_hidden 不相符。",
  });
  assert.match(message, /題型/);
  assert.equal(message.includes("ps_g5a_u08"), false);
  assert.equal(message.includes("kp_g5a_u08"), false);
});
