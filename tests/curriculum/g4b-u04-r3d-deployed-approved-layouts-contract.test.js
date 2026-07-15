import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const workflow = readFileSync(
  new URL("../../.github/workflows/g4b-u04-r3d-deployed-approved-layouts.yml", import.meta.url),
  "utf8",
);
const harness = readFileSync(
  new URL("../../tools/curriculum/run-g4b-u04-r3d-deployed-approved-layouts.mjs", import.meta.url),
  "utf8",
);

test("R3D deployed workflow audits the approved production deployment on PR and Pages completion", () => {
  assert.match(workflow, /name: G4B-U04 R3D Deployed Approved Layouts/);
  assert.match(workflow, /pull_request:/);
  assert.match(workflow, /workflow_run:/);
  assert.match(workflow, /Deploy GitHub Pages/);
  assert.match(workflow, /run-g4b-u04-r3d-deployed-approved-layouts\.mjs/);
  assert.match(workflow, /latest-g4b-u04-r3d-deployed-approved-layouts\.json/);
  assert.match(workflow, /G4B_U04_R3D_DEPLOYMENT_SHA/);
});

test("R3D deployed harness uses the combined 24-prompt inverse capacity", () => {
  assert.match(harness, /kp_g4b_u04_inverse_rounding_unknown_digit/);
  assert.match(harness, /kp_g4b_u04_inverse_rounding_possible_original/);
  assert.match(harness, /pg_g4b_u04_inverse_digit_set/);
  assert.match(harness, /pg_g4b_u04_inverse_original_values/);
  assert.match(harness, /mixedKnowledgePointsSameUnit/);
  assert.match(harness, /combinedUniquePromptCapacity: 24/);
});

test("R3D deployed harness locks question-only 3x5 and 2x6 output", () => {
  assert.match(harness, /id: "auto-safe-3x5"/);
  assert.match(harness, /resolvedColumns: 3/);
  assert.match(harness, /resolvedRows: 5/);
  assert.match(harness, /questionCount: 15/);
  assert.match(harness, /id: "custom-2x6"/);
  assert.match(harness, /resolvedColumns: 2/);
  assert.match(harness, /resolvedRows: 6/);
  assert.match(harness, /questionCount: 12/);
  assert.match(harness, /responsePromptCount/);
  assert.match(harness, /interCardOverlapCount/);
  assert.match(harness, /G4B_U04_R3D_RESPONSE_PROMPT_PRESENT/);
  assert.match(harness, /G4B_U04_R3D_LAYOUT_CONTAINMENT_FAILED/);
  assert.match(harness, /G4B_U04_R3D_PRINT_TARGET_NOT_INVOKED/);
});

test("R3D deployed audit keeps curriculum and generation semantics out of scope", () => {
  assert.doesNotMatch(harness, /createPatternSpec|registerKnowledgePoint|freeFormAI\s*=\s*true/);
  assert.match(harness, /genericFallback: false/);
  assert.match(harness, /freeFormAI: false/);
});
