import test from "node:test";
import assert from "node:assert/strict";

import {
  G3B_U07_P03F24_NUMERIC_SPEC_IDS,
  G3B_U07_P03F24_APPLICATION_SPEC_IDS,
} from "../../site/modules/curriculum/registry/g3b-u07-fraction-context-selector-projection-p03f24.js";
import { generateBatchABrowserQuestions } from "../../site/modules/curriculum/batch-a/batch-a-browser-question-router-p03f24.js";

const SOURCE = "g3b_u07_3b07";

for (const [questionMode, patternSpecIds, generationSeed] of [
  ["numeric", G3B_U07_P03F24_NUMERIC_SPEC_IDS, "p03f24-chromium-numeric"],
  ["application", G3B_U07_P03F24_APPLICATION_SPEC_IDS, "p03f24-chromium-application"],
]) {
  test(`Slice024 ${questionMode} 20-question pool is deterministic and prompt-unique`, () => {
    const options = { sourceId: SOURCE, patternSpecIds, questionMode, questionCount: 20, generationSeed };
    const first = generateBatchABrowserQuestions(options);
    const second = generateBatchABrowserQuestions(options);
    assert.equal(first.ok, true, JSON.stringify(first.errors));
    assert.equal(second.ok, true, JSON.stringify(second.errors));
    assert.deepEqual(first.questions, second.questions);
    assert.equal(first.questions.length, 20);
    assert.equal(new Set(first.questions.map((question) => question.blankedDisplayText)).size, 20);
    assert.deepEqual([...new Set(first.questions.map((question) => question.patternSpecId))].sort(), [...patternSpecIds].sort());
    for (const patternSpecId of patternSpecIds) {
      assert.equal(first.questions.filter((question) => question.patternSpecId === patternSpecId).length, 2, patternSpecId);
    }
  });
}
