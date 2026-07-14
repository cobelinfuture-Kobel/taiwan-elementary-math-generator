import test from "node:test";
import assert from "node:assert/strict";

import {
  G5A_U02_PUBLIC_KNOWLEDGE_POINTS,
  auditG5AU02PublicKnowledgePointProjection,
  getG5AU02PublicKnowledgePoint,
  resolveG5AU02PublicPatternSpecIds,
} from "../../site/modules/curriculum/batch-b/g5a-u02-public-knowledge-points.js";

test("S96 projection exposes 18 selectable knowledge points covering all 22 patterns", () => {
  const audit = auditG5AU02PublicKnowledgePointProjection();
  assert.deepEqual(audit, {
    ok: true,
    errors: [],
    knowledgePointCount: 18,
    patternGroupCount: 18,
    patternSpecCount: 22,
    selectableCount: 18,
  });
  assert.equal(G5A_U02_PUBLIC_KNOWLEDGE_POINTS.every((row) => row.selectable), true);
});

test("S96 projection preserves canonical KP, group, class and answer-model bindings", () => {
  const pairEnumeration = getG5AU02PublicKnowledgePoint(
    "kp_g5a_u02_factor_enumeration_by_multiplication_pairs",
  );
  assert.equal(pairEnumeration.patternGroupId, "pg_g5a_u02_factor_enumeration_pairs");
  assert.deepEqual(pairEnumeration.patternSpecIds, [
    "ps_g5a_u02_factor_pair_enumeration",
    "ps_g5a_u02_factor_list_from_pairs",
  ]);
  assert.deepEqual(pairEnumeration.implementationClasses, ["C"]);
  assert.deepEqual(pairEnumeration.answerModelIds, ["factorPairListAnswer", "integerListAnswer"]);
});

test("S96 resolver supports single and multiple KP selections without duplicate patterns", () => {
  assert.deepEqual(
    resolveG5AU02PublicPatternSpecIds(["kp_g5a_u02_greatest_common_factor"]),
    ["ps_g5a_u02_greatest_common_factor"],
  );
  const mixed = resolveG5AU02PublicPatternSpecIds([
    "kp_g5a_u02_factor_enumeration_by_multiplication_pairs",
    "kp_g5a_u02_greatest_common_factor",
  ]);
  assert.deepEqual(mixed, [
    "ps_g5a_u02_factor_pair_enumeration",
    "ps_g5a_u02_factor_list_from_pairs",
    "ps_g5a_u02_greatest_common_factor",
  ]);
});

test("S96 resolver blocks empty, duplicate and unknown KP selections", () => {
  assert.throws(() => resolveG5AU02PublicPatternSpecIds([]), /SELECTION_REQUIRED/);
  assert.throws(
    () => resolveG5AU02PublicPatternSpecIds([
      "kp_g5a_u02_greatest_common_factor",
      "kp_g5a_u02_greatest_common_factor",
    ]),
    /SELECTION_DUPLICATE/,
  );
  assert.throws(() => resolveG5AU02PublicPatternSpecIds(["kp_unknown"]), /PUBLIC_KP_UNKNOWN/);
});

test("S96 projection remains pre-runtime and pre-production until later S96 gates", () => {
  for (const row of G5A_U02_PUBLIC_KNOWLEDGE_POINTS) {
    assert.equal(row.lifecycle.projectionStatus, "public_projection_materialized");
    assert.equal(row.lifecycle.selectorStatus, "pending_browser_selector_integration");
    assert.equal(row.lifecycle.browserRegenerationStatus, "pending_runtime_integration");
    assert.equal(row.lifecycle.productionUse, "forbidden_until_s96_stress_pass");
  }
});
