import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  patchG5AU08DeployedSmokeHarness,
  previewMetaSatisfiesGS01Contract,
} from "../../tools/curriculum/run-gs01-g5a-u08-deployed-pages-smoke.mjs";

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

test("GS01 patches exactly the obsolete suffix assertion", () => {
  const patched = patchG5AU08DeployedSmokeHarness(legacyHarness);
  assert.doesNotMatch(patched, /endsWith\(expectedSuffix\)/);
  assert.match(patched, /missingSegments\.length > 0/);
  assert.match(patched, /G5A_U08_R1_DEPLOYED_PREVIEW_META_INVALID/);
});
