import test from "node:test";
import assert from "node:assert/strict";

import {
  listG4AU08NumericCanonicalPatternSpecs,
  sampleG4AU08NumericCanonicalPatternSpec,
} from "../../site/modules/curriculum/batch-a/g4a-u08-numeric-canonical-hidden.js";
import {
  adaptG4AU08NumericSample,
  assertValidG4AU08NumericCanonicalItem,
  buildG4AU08NumericMutationCases,
  getG4AU08NumericMutationIdsByPatternGroup,
  validateG4AU08NumericCanonicalItem,
  validateG4AU08NumericValidatorRegistry,
} from "../../src/curriculum/g4a-u08/numeric-canonical-adapter-validator.js";
import {
  listBatchAKnowledgePointAvailabilityBySource,
  listVisibleBatchAKnowledgePoints,
} from "../../site/modules/curriculum/registry/batch-a-selector-extension.js";

const SOURCE_ID = "g4a_u08_4a08";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

test("S76O validator registry covers 16 PatternSpecs and all 11 numeric PatternGroups", () => {
  const result = validateG4AU08NumericValidatorRegistry();
  assert.equal(result.ok, true, result.errors.join(","));
  assert.deepEqual(result.counts, {
    patternSpecs: 16,
    patternGroups: 11,
    mutationCoveredPatternGroups: 11,
  });
  const mutationIds = getG4AU08NumericMutationIdsByPatternGroup();
  assert.equal(Object.keys(mutationIds).length, 11);
  for (const ids of Object.values(mutationIds)) assert.equal(ids.length >= 2, true);
});

test("S76O adapts and validates every historically hidden numeric PatternSpec", () => {
  for (const definition of listG4AU08NumericCanonicalPatternSpecs()) {
    const sample = sampleG4AU08NumericCanonicalPatternSpec(definition.patternSpecId, { seed: `s76o:${definition.patternSpecId}` });
    const canonical = adaptG4AU08NumericSample(sample);
    const result = validateG4AU08NumericCanonicalItem(canonical);
    assert.equal(result.valid, true, `${definition.patternSpecId}: ${JSON.stringify(result.errors)}`);
    assert.equal(result.patternGroupId, definition.patternGroupId);
    assert.equal(result.patternSpecId, definition.patternSpecId);
    assert.deepEqual(result.validatedLevels, ["L1", "L2", "L3", "L4", "L5"]);
    assert.equal(assertValidG4AU08NumericCanonicalItem(canonical), canonical);
    assert.equal(Object.isFrozen(canonical), true);
    assert.equal(Object.isFrozen(canonical.canonicalEvidence), true);
    assert.equal(canonical.lifecycle.productionUse, "forbidden");
  }
});

test("S76O canonical adapter blocks unknown or invalid samples", () => {
  assert.throws(() => adaptG4AU08NumericSample(null), /G4AU08_NUMERIC_ITEM_INVALID/);
  assert.throws(() => adaptG4AU08NumericSample({ patternSpecId: "unknown" }), /G4AU08_NUMERIC_PATTERN_SPEC_UNKNOWN/);
});

test("S76O blocks identity, arithmetic, trace and lifecycle corruption", () => {
  const sample = sampleG4AU08NumericCanonicalPatternSpec("ps_g4a_u08_mul_before_add_sub", { seed: "s76o-core-corruption" });
  const canonical = adaptG4AU08NumericSample(sample);
  const mutations = [
    { field: "sourceId", value: "g5a_u08_5a08", code: "G4AU08_NUMERIC_SOURCE_MISMATCH" },
    { field: "unitCode", value: "5A-U08", code: "G4AU08_NUMERIC_UNIT_MISMATCH" },
    { field: "knowledgePointId", value: "kp_wrong", code: "G4AU08_NUMERIC_KP_MISMATCH" },
    { field: "patternGroupId", value: "pg_wrong", code: "G4AU08_NUMERIC_PATTERN_GROUP_MISMATCH" },
    { field: "reasoningRole", value: "wrong", code: "G4AU08_NUMERIC_REASONING_ROLE_MISMATCH" },
  ];
  for (const row of mutations) {
    const item = clone(canonical);
    item[row.field] = row.value;
    const result = validateG4AU08NumericCanonicalItem(item);
    assert.equal(result.valid, false);
    assert.equal(result.errors.some((error) => error.code === row.code), true, row.field);
  }

  const wrongAnswer = clone(canonical);
  wrongAnswer.answerModel.value += 1;
  assert.equal(validateG4AU08NumericCanonicalItem(wrongAnswer).errors.some((error) => error.code === "G4AU08_NUMERIC_ANSWER_INCORRECT"), true);

  const noTrace = clone(canonical);
  noTrace.operations = [];
  assert.equal(validateG4AU08NumericCanonicalItem(noTrace).errors.some((error) => error.code === "G4AU08_NUMERIC_TRACE_INVALID"), true);

  const publicItem = clone(canonical);
  publicItem.lifecycle.canonicalRouting = "enabled";
  publicItem.lifecycle.productionUse = "allowed";
  const publicResult = validateG4AU08NumericCanonicalItem(publicItem);
  assert.equal(publicResult.errors.some((error) => error.code === "G4AU08_NUMERIC_PUBLIC_ROUTING_FORBIDDEN"), true);
  assert.equal(publicResult.errors.some((error) => error.code === "G4AU08_NUMERIC_PRODUCTION_USE_FORBIDDEN"), true);
});

test("S76O deterministically rejects every declared PatternGroup mutation", () => {
  const representativeByGroup = new Map();
  for (const definition of listG4AU08NumericCanonicalPatternSpecs()) {
    if (!representativeByGroup.has(definition.patternGroupId)) representativeByGroup.set(definition.patternGroupId, definition.patternSpecId);
  }
  assert.equal(representativeByGroup.size, 11);

  let mutationCount = 0;
  for (const [patternGroupId, patternSpecId] of representativeByGroup) {
    const sample = sampleG4AU08NumericCanonicalPatternSpec(patternSpecId, { seed: `s76o-mutation:${patternGroupId}` });
    const canonical = adaptG4AU08NumericSample(sample);
    const cases = buildG4AU08NumericMutationCases(canonical);
    assert.equal(cases.length >= 2, true, patternGroupId);
    for (const mutationCase of cases) {
      mutationCount += 1;
      const result = validateG4AU08NumericCanonicalItem(mutationCase.item);
      assert.equal(result.valid, false, `${patternGroupId}/${mutationCase.mutationId} was accepted`);
      assert.equal(result.errors.length > 0, true);
    }
  }
  assert.equal(mutationCount >= 25, true);
});

test("S76R exposes all 11 numeric KnowledgePoints while S76O validator contracts remain fail-closed", () => {
  const availability = listBatchAKnowledgePointAvailabilityBySource(SOURCE_ID);
  assert.equal(availability.visibleCount, 15);
  const visible = listVisibleBatchAKnowledgePoints().filter((row) => row.sourceId === SOURCE_ID);
  assert.equal(visible.length, 15);
  assert.equal(visible.filter((row) => row.knowledgePointId.startsWith("kp_g4a_u08_num_")).length, 11);
  assert.equal(listG4AU08NumericCanonicalPatternSpecs().every((row) => row.lifecycle.productionUse === "forbidden"), true);
});
