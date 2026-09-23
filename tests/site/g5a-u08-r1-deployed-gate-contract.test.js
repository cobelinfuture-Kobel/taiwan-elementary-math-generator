import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  patchG5AU08DeployedSmokeHarness,
  previewMetaSatisfiesGS01Contract,
} from "../../tools/curriculum/run-gs01-g5a-u08-deployed-pages-smoke.mjs";
import {
  resolvePublicUiCapabilityBinding,
} from "../../site/modules/curriculum/public/public-ui-capability-binding.js";
import {
  listVisibleBatchAKnowledgePoints,
} from "../../site/modules/curriculum/registry/batch-a-selector-p03f13-extension.js";
import {
  G5A_U08_PROMOTED_KNOWLEDGE_POINT_IDS,
  G5A_U08_PROMOTED_PATTERN_GROUP_IDS,
  G5A_U08_SOURCE_ID,
} from "../../site/modules/curriculum/registry/g5a-u08-promotion.js";

const workflow = readFileSync(new URL("../../.github/workflows/g5a-u08-r1-deployed-pages-smoke.yml", import.meta.url), "utf8");
const legacyHarness = readFileSync(new URL("../../tools/curriculum/run-g5a-u08-r1-deployed-pages-smoke.mjs", import.meta.url), "utf8");
const gs01Runner = readFileSync(new URL("../../tools/curriculum/run-gs01-g5a-u08-deployed-pages-smoke.mjs", import.meta.url), "utf8");

function optionValues(binding) {
  return binding.availableQuestionTypeOptions.map((option) => option.value);
}

test("G5A-U08-R1 deployed gate is armed through the capacity-aware GS01 runner", () => {
  assert.match(workflow, /workflows:\s*\n\s*- Deploy GitHub Pages/);
  assert.match(workflow, /run-gs01-g5a-u08-deployed-pages-smoke\.mjs/);
  assert.match(legacyHarness, /controlMatrix\.length !== 36/);
  assert.match(gs01Runner, /resolvePublicUiCapabilityBinding/);
  assert.match(gs01Runner, /publicAdmitted/);
  assert.match(gs01Runner, /assertNotExposed/);
  assert.match(gs01Runner, /actual: \"not_exposed\"/);
  assert.match(gs01Runner, /selectAvailableOption/);
  assert.match(gs01Runner, /G5A_U08_R1_MATRIX_ROW_STATE_NOT_ISOLATED/);
});

test("GS01 accepts extended preview metadata without weakening required fields", () => {
  assert.equal(previewMetaSatisfiesGS01Contract("Batch A｜6 題｜含答案頁｜題目 3 欄", 6, true).ok, true);
  assert.equal(previewMetaSatisfiesGS01Contract("Batch A｜含答案頁", 6, true).ok, false);
  assert.equal(previewMetaSatisfiesGS01Contract("Batch A｜6 題｜含答案頁｜null", 6, true).ok, false);
});

test("GS01 patches metadata, early preselection, matrix authority and row-isolated blocked semantics", () => {
  const patched = patchG5AU08DeployedSmokeHarness(legacyHarness);
  assert.doesNotMatch(patched, /endsWith\(expectedSuffix\)/);
  assert.match(patched, /resolvePublicUiCapabilityBinding/);
  assert.match(patched, /publicAdmitted/);
  assert.match(patched, /capacityRouteIds/);
  assert.match(patched, /G5A_U08_R1_UNADMITTED_CONTROL_INTERSECTION_EXPOSED/);
  assert.match(patched, /actual: \"not_exposed\"/);
  assert.match(patched, /rowUrl\.searchParams\.delete\("kp"\)/);
  assert.match(patched, /rowUrl\.searchParams\.delete\("pg"\)/);
  assert.match(patched, /G5A_U08_R1_MATRIX_ROW_STATE_NOT_ISOLATED/);
  assert.match(patched, /page\.goto\(rowUrl\.href, \{ waitUntil: "networkidle", timeout: 120000 \}\)/);
  const singleModeIndex = patched.indexOf('selectOption("#batch-a-selection-mode-select", "singleKnowledgePoint")');
  const kpPanelIndex = patched.indexOf("const kpButtons");
  assert.ok(singleModeIndex >= 0 && kpPanelIndex > singleModeIndex);
  assert.doesNotMatch(patched.slice(singleModeIndex, kpPanelIndex), /setControls\(page, \{ questionMode: "mixed"/);
});

test("public capacity admits same-unit mixed but does not admit same-unit numeric", () => {
  const visible = listVisibleBatchAKnowledgePoints().filter((row) => row.sourceId === G5A_U08_SOURCE_ID);
  assert.equal(visible.length, G5A_U08_PROMOTED_KNOWLEDGE_POINT_IDS.length);
  const base = {
    sourceId: G5A_U08_SOURCE_ID,
    selectionMode: "mixedKnowledgePointsSameUnit",
    selectedKnowledgePointIds: visible.map((row) => row.knowledgePointId),
    selectedPatternGroupIds: [...G5A_U08_PROMOTED_PATTERN_GROUP_IDS],
  };
  const mixed = resolvePublicUiCapabilityBinding({ ...base, requestedQuestionType: "mixed", requestedDepthMode: "mixed", requestedContextMode: "mixed" });
  assert.equal(optionValues(mixed).includes("mixed"), true);
  assert.equal(mixed.blocked, false, mixed.blockedReasons.join("|"));
  assert.ok(mixed.capacityRouteIds.length > 0);

  const numeric = resolvePublicUiCapabilityBinding({ ...base, requestedQuestionType: "numeric", requestedDepthMode: "mixed", requestedContextMode: "mixed" });
  assert.equal(optionValues(numeric).includes("numeric"), false);
  assert.notEqual(numeric.questionType, "numeric");
});
