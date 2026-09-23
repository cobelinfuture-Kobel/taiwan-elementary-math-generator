import test from "node:test";
import assert from "node:assert/strict";

import { generateG5AU02Canonical } from "../../src/curriculum/g5a-u02/canonical-resolver.js";
import {
  buildG5AU02BrowserDynamicWorksheet,
  normalizeG5AU02SemanticDisplayItem,
} from "../../src/curriculum/g5a-u02/browser-dynamic-entry.js";

const PATTERN_ID = "ps_g5a_u02_complete_factor_list_unknown_values";

test("S97 normalizes a synthetic legacy duplicate unknown-key record without changing its canonical answer", () => {
  const canonical = generateG5AU02Canonical(PATTERN_ID, { seed: 97 });
  assert.equal(new Set(canonical.data.unknownKeys).size, canonical.data.unknownKeys.length);
  const legacy = JSON.parse(JSON.stringify(canonical));
  legacy.data.unknownKeys = [canonical.data.unknownKeys[0], canonical.data.unknownKeys[0], canonical.data.unknownKeys[1]];

  const normalized = normalizeG5AU02SemanticDisplayItem(legacy);
  assert.deepEqual(normalized.data.unknownKeys, canonical.data.unknownKeys);
  assert.deepEqual(normalized.answer, canonical.answer);
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
