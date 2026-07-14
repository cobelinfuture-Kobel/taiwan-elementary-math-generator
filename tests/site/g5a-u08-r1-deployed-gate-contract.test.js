import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const workflow = readFileSync(
  new URL("../../.github/workflows/g5a-u08-r1-deployed-pages-smoke.yml", import.meta.url),
  "utf8",
);
const harness = readFileSync(
  new URL("../../tools/curriculum/run-g5a-u08-r1-deployed-pages-smoke.mjs", import.meta.url),
  "utf8",
);

test("G5A-U08-R1 deployed gate is armed on the default branch", () => {
  assert.match(workflow, /workflows:\s*\n\s*- Deploy GitHub Pages/);
  assert.match(workflow, /run-g5a-u08-r1-deployed-pages-smoke\.mjs/);
  assert.match(workflow, /latest-g5a-u08-r1-deployed-pages-smoke\.json/);
  assert.match(harness, /controlMatrix\.length !== 36/);
  assert.match(harness, /G5A_U08_R1_EMPTY_INTERSECTION_NOT_BLOCKED/);
  assert.match(harness, /G5A_U08_R1_DEPLOYED_PRINT_TARGET_NOT_INVOKED/);
  assert.match(harness, /answerKeyOffAnswerCount/);
});
