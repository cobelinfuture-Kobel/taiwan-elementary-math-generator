import test from "node:test";
import assert from "node:assert/strict";

import { generateG5AU02Canonical } from "../../src/curriculum/g5a-u02/canonical-resolver.js";
import {
  buildG5AU02BrowserDynamicWorksheet,
  normalizeG5AU02SemanticDisplayItem,
} from "../../src/curriculum/g5a-u02/browser-dynamic-entry.js";

const PATTERN_ID = "ps_g5a_u02_complete_factor_list_unknown_values";

test("S97 normalizes duplicate legacy unknown keys without changing the canonical answer", () => {
  let witnessed = null;
  for (let seed = 1; seed <= 1000; seed += 1) {
    const item = generateG5AU02Canonical(PATTERN_ID, { seed });
    if (new Set(item.data.unknownKeys).size !== item.data.unknownKeys.length) {
      witnessed = item;
      break;
    }
  }
  assert.ok(witnessed, "expected to witness the legacy duplicate-key edge case");

  const normalized = normalizeG5AU02SemanticDisplayItem(witnessed);
  assert.equal(new Set(normalized.data.unknownKeys).size, normalized.data.unknownKeys.length);
  assert.deepEqual(normalized.answer, witnessed.answer);
  assert.equal(normalized.semanticNormalization.code, "G5AU02_DUPLICATE_UNKNOWN_KEY_NORMALIZED");
});

test("S97 public runtime remains complete for every seed in the legacy edge domain", () => {
  for (let seed = 1; seed <= 256; seed += 1) {
    const result = buildG5AU02BrowserDynamicWorksheet({
      sourceId: "g5a_u02_5a02",
      patternSpecIds: [PATTERN_ID],
      questionCount: 1,
      generationSeed: seed,
      includeAnswerKey: true,
    });
    assert.equal(result.ok, true, `seed ${seed}: ${result.errors?.join(",")}`);
    const question = result.worksheetDocument.questionItems[0];
    assert.equal(question.promptCompletenessStatus, "visible_unique_solution_data_complete");
    assert.ok(question.questionDisplayModel);
    assert.match(question.prompt, /完整因數表/);
  }
});
