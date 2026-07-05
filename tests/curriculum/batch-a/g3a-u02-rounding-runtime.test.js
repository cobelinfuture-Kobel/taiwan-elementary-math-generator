import test from "node:test";
import assert from "node:assert/strict";

import { roundToNearestThousand } from "../../../site/modules/curriculum/batch-a/batch-a-browser-generator.js";
import { validateBatchABrowserQuestion } from "../../../site/modules/curriculum/batch-a/batch-a-browser-validator.js";
import { getBatchABrowserPatternDefinition } from "../../../site/modules/curriculum/batch-a/source-pattern-index.js";

const PATTERN_ID = "ps_g3a_u02_estimate_nearest_thousand";
const SOURCE_ID = "g3a_u02_3a02";

function makeQuestion(value, answer) {
  return {
    id: `qa-${value}`,
    patternSpecId: PATTERN_ID,
    sourceId: SOURCE_ID,
    kind: "rounding",
    value,
    unit: 1000,
    promptText: `將 ${value} 估到最接近的千位數。`,
    displayText: `${value} 約是 ${answer}`,
    blankedDisplayText: `${value} 約是 ____`,
    answerText: String(answer),
    finalAnswer: answer,
    metadata: {
      patternId: PATTERN_ID,
      sourceId: SOURCE_ID,
      skillTags: ["rounding_approximation"]
    }
  };
}

test("S43G2K rounding PatternSpec definition exists but is not selector-promoted yet", () => {
  const definition = getBatchABrowserPatternDefinition(PATTERN_ID);
  assert.equal(definition.patternSpecId, PATTERN_ID);
  assert.equal(definition.sourceId, SOURCE_ID);
  assert.equal(definition.unit, 1000);
  assert.equal(definition.min, 1000);
  assert.equal(definition.max, 9999);
});

test("S43G2K rounding rule uses nearest thousand half-up boundaries", () => {
  assert.equal(roundToNearestThousand(1499), 1000);
  assert.equal(roundToNearestThousand(1500), 2000);
  assert.equal(roundToNearestThousand(2500), 3000);
  assert.equal(roundToNearestThousand(9499), 9000);
  assert.equal(roundToNearestThousand(9500), 10000);
});

test("S43G2K validator accepts a correct rounding question", () => {
  const result = validateBatchABrowserQuestion(makeQuestion(1500, 2000));
  assert.equal(result.ok, true);
  assert.deepEqual(result.errors, []);
});

test("S43G2K validator rejects an incorrect rounding answer", () => {
  const result = validateBatchABrowserQuestion(makeQuestion(1500, 1000));
  assert.equal(result.ok, false);
  assert.equal(result.errors.some((error) => error.code === "batch_a_answer_incorrect"), true);
});
