import test from "node:test";
import assert from "node:assert/strict";

import { generateG5AU02Canonical } from "../../src/curriculum/g5a-u02/canonical-resolver.js";
import {
  buildG5AU02BrowserDynamicWorksheet,
  normalizeG5AU02SemanticDisplayItem,
} from "../../src/curriculum/g5a-u02/browser-dynamic-entry.js";

const PATTERN_ID = "ps_g5a_u02_complete_factor_list_unknown_values";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

test("S107 canonical runtime never emits duplicate unknown keys in the former legacy edge domain", () => {
  for (let seed = 1; seed <= 1000; seed += 1) {
    const item = generateG5AU02Canonical(PATTERN_ID, { seed });
    assert.equal(
      new Set(item.data.unknownKeys).size,
      item.data.unknownKeys.length,
      `seed ${seed} emitted duplicate unknown keys`,
    );
    assert.equal(item.data.solutionCount, 1);
  }
});

test("S97 normalizer remains backward compatible with a legacy duplicate-key fixture", () => {
  const canonical = generateG5AU02Canonical(PATTERN_ID, { seed: 97 });
  assert.ok(canonical.data.unknownKeys.length >= 1);

  const legacy = clone(canonical);
  legacy.data.unknownKeys.push(legacy.data.unknownKeys[0]);
  assert.notEqual(new Set(legacy.data.unknownKeys).size, legacy.data.unknownKeys.length);

  const normalized = normalizeG5AU02SemanticDisplayItem(legacy);
  assert.equal(new Set(normalized.data.unknownKeys).size, normalized.data.unknownKeys.length);
  assert.deepEqual(normalized.answer, legacy.answer);
  assert.equal(normalized.semanticNormalization.code, "G5AU02_DUPLICATE_UNKNOWN_KEY_NORMALIZED");
  assert.equal(normalized.semanticNormalization.originalUnknownKeyCount, legacy.data.unknownKeys.length);
  assert.equal(normalized.semanticNormalization.normalizedUnknownKeyCount, canonical.data.unknownKeys.length);
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
    assert.equal(question.questionDisplayModel.kind, "symbolic_complete_factor_relation_table");
    assert.match(question.prompt, /完整因數表/);
    assert.match(question.prompt, /代號方程/);
  }
});
