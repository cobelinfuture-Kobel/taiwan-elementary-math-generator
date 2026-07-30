import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import {
  PUBLIC_UI_SAFE_QUESTION_COUNT,
  resolvePublicUiCapabilityBinding,
} from "../site/modules/curriculum/public/public-ui-capability-binding.js";
import {
  createConfigState,
  setBatchAQuestionCount,
} from "../site/assets/browser/state/config-state.js";

test("public question-count ceiling is 240 while default remains 20", () => {
  assert.deepEqual(PUBLIC_UI_SAFE_QUESTION_COUNT, {
    min: 1,
    default: 20,
    max: 240,
    evidence: "PGC_R03_GLOBAL_PUBLIC_HARD_CEILING",
  });
  for (const path of ["site/index.html", "site/404.html", "site/pixel/index.html"]) {
    const html = fs.readFileSync(path, "utf8");
    assert.match(html, /type="number" min="1" max="240" value="20"/);
  }
});

test("browser state accepts 240 without the previous 200 clamp", () => {
  const state = createConfigState();
  setBatchAQuestionCount(state, 240);
  assert.equal(state.batchA.questionCount, 240);
  setBatchAQuestionCount(state, 241);
  assert.equal(state.batchA.questionCount, 240);
});

test("a legal public route exposes the global 240 limit", () => {
  const binding = resolvePublicUiCapabilityBinding({ sourceId: "g3a_u01_3a01" });
  assert.equal(binding.blocked, false);
  assert.equal(binding.questionCount.max, 240);
});
