import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const runner = fs.readFileSync("tools/curriculum/run-pgc-r09-a03-public-site-smoke.mjs", "utf8");

test("R09 A03 targets the canonical GitHub Pages project site", () => {
  assert.match(runner, /https:\/\/cobelinfuture-kobel\.github\.io\/taiwan-elementary-math-generator\//);
  assert.match(runner, /PGC_R09_PUBLIC_SITE_URL/);
});

test("R09 A03 exercises deployed public generation and answer-key output", () => {
  assert.match(runner, /#batch-a-source-select/);
  assert.match(runner, /#batch-a-selection-mode-select/);
  assert.match(runner, /#batch-a-question-count-input/);
  assert.match(runner, /#batch-a-answer-key-input/);
  assert.match(runner, /#regenerate-button/);
  assert.match(runner, /#preview-frame/);
  assert.match(runner, /PASS_DEPLOYED_PUBLIC_SITE_SMOKE/);
  assert.match(runner, /renderedQuestionCount/);
  assert.match(runner, /renderedAnswerCount/);
  assert.match(runner, /browserConsoleErrorCount/);
  assert.match(runner, /browserPageErrorCount/);
});

test("R09 A03 release-candidate readback keeps Slice014 frozen", () => {
  assert.match(runner, /a01rPullRequest:\s*504/);
  assert.match(runner, /a01rMergeSha:\s*"94f3661052cdcfc1760f1a2fffcde29160535e93"/);
  assert.match(runner, /a02MergeSha:\s*"6ade4ad2bcbee06a01c550a559859f12e39ff9e2"/);
  assert.match(runner, /slice014Frozen:\s*true/);
});
