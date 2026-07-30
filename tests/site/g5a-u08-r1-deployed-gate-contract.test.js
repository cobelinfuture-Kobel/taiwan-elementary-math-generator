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
  G5A_U08_PROMOTED_KNOWLEDGE_POINT_IDS,
  G5A_U08_SOURCE_ID,
} from "../../site/modules/curriculum/registry/g5a-u08-promotion.js";

const workflow = readFileSync(
  new URL("../../.github/workflows/g5a-u08-r1-deployed-pages-smoke.yml", import.meta.url),
  "utf8",
);
const legacyHarness = readFileSync(
  new URL("../../tools/curriculum/run-g5a-u08-r1-deployed-pages-smoke.mjs", import.meta.url),
  "utf8",
);
const gs01Runner = readFileSync(
  new URL("../../tools/curriculum/run-gs01-g5a-u08-deployed-pages-smoke.mjs", import.meta.url),
  "utf8",
);

function optionValues(binding) {
  return binding.availableQuestionTypeOptions.map((option) => option.value);
}

test("G5A-U08-R1 deployed gate is armed through the GS01 compatibility runner", () => {
  assert.match(workflow, /workflows:\s*\n\s*- Deploy GitHub Pages/);
  assert.match(workflow, /run-gs01-g5a-u08-deployed-pages-smoke\.mjs/);
  assert.match(workflow, /latest-g5a-u08-r1-deployed-pages-smoke\.json/);
  assert.match(legacyHarness, /controlMatrix\.length !== 36/);
  assert.match(legacyHarness, /G5A_U08_R1_EMPTY_INTERSECTION_NOT_BLOCKED/);
  assert.match(legacyHarness, /G5A_U08_R1_DEPLOYED_PRINT_TARGET_NOT_INVOKED/);
  assert.match(legacyHarness, /answerKeyOffAnswerCount/);
  assert.match(gs01Runner, /requiredSegments/);
  assert.match(gs01Runner, /previewSegments/);
  assert.match(gs01Runner, /PGC-R07 A02: single-KP controls remain capacity-derived/);
});

test("GS01 accepts current extended preview metadata without weakening required fields", () => {
  const current = previewMetaSatisfiesGS01Contract(
    "Batch A 5A-U08 整數四則｜6 題｜含答案頁｜題目 3 欄 × 5 列；答案 3 欄 × 10 列",
    6,
    true,
  );
  assert.equal(current.ok, true);
  assert.deepEqual(current.missingSegments, []);

  const legacy = previewMetaSatisfiesGS01Contract("Batch A 5A-U08 整數四則｜6 題｜含答案頁", 6, true);
  assert.equal(legacy.ok, true);

  const missingCount = previewMetaSatisfiesGS01Contract("Batch A 5A-U08 整數四則｜含答案頁｜題目 3 欄 × 5 列", 6, true);
  assert.equal(missingCount.ok, false);
  assert.deepEqual(missingCount.missingSegments, ["6 題"]);

  const placeholder = previewMetaSatisfiesGS01Contract("Batch A 5A-U08 整數四則｜6 題｜含答案頁｜null", 6, true);
  assert.equal(placeholder.ok, false);
});

test("GS01 patches exactly the obsolete metadata assertion and illegal single-KP mixed preselection", () => {
  const patched = patchG5AU08DeployedSmokeHarness(legacyHarness);
  assert.doesNotMatch(patched, /endsWith\(expectedSuffix\)/);
  assert.match(patched, /missingSegments\.length > 0/);
  assert.match(patched, /G5A_U08_R1_DEPLOYED_PREVIEW_META_INVALID/);

  const singleModeIndex = patched.indexOf('selectOption("#batch-a-selection-mode-select", "singleKnowledgePoint")');
  const kpPanelIndex = patched.indexOf("const kpButtons");
  const mixedModeIndex = patched.indexOf('selectOption("#batch-a-selection-mode-select", "mixedKnowledgePointsSameUnit")');
  assert.ok(singleModeIndex >= 0 && kpPanelIndex > singleModeIndex && mixedModeIndex > kpPanelIndex);
  assert.doesNotMatch(
    patched.slice(singleModeIndex, kpPanelIndex),
    /setControls\(page, \{ questionMode: "mixed", depthMode: "mixed", contextMode: "mixed" \}\)/,
  );
  assert.match(patched.slice(mixedModeIndex), /await setControls\(page, controls\)/);
});

test("G5A-U08 UI binding keeps mixed hidden for single KP but admitted for whole-unit and same-unit mixed routes", () => {
  const firstKnowledgePointId = G5A_U08_PROMOTED_KNOWLEDGE_POINT_IDS[0];
  const single = resolvePublicUiCapabilityBinding({
    sourceId: G5A_U08_SOURCE_ID,
    selectionMode: "singleKnowledgePoint",
    selectedKnowledgePointIds: [firstKnowledgePointId],
    requestedQuestionType: "mixed",
  });
  assert.equal(optionValues(single).includes("mixed"), false);
  assert.notEqual(single.questionType, "mixed");
  assert.equal(single.blocked, false, single.blockedReasons.join("|"));

  const wholeUnit = resolvePublicUiCapabilityBinding({
    sourceId: G5A_U08_SOURCE_ID,
    selectionMode: "sourceUnit",
    requestedQuestionType: "mixed",
  });
  assert.equal(optionValues(wholeUnit).includes("mixed"), true);
  assert.equal(wholeUnit.questionType, "mixed");
  assert.equal(wholeUnit.blocked, false, wholeUnit.blockedReasons.join("|"));

  const sameUnitMixed = resolvePublicUiCapabilityBinding({
    sourceId: G5A_U08_SOURCE_ID,
    selectionMode: "mixedKnowledgePointsSameUnit",
    selectedKnowledgePointIds: [...G5A_U08_PROMOTED_KNOWLEDGE_POINT_IDS],
    requestedQuestionType: "mixed",
  });
  assert.equal(optionValues(sameUnitMixed).includes("mixed"), true);
  assert.equal(sameUnitMixed.questionType, "mixed");
  assert.equal(sameUnitMixed.blocked, false, sameUnitMixed.blockedReasons.join("|"));
});
