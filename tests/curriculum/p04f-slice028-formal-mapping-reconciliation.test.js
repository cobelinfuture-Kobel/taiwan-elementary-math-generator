import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  getP02EQuantitySemanticRoleBinding,
  resolveP02EQuantitySemanticRoleBinding,
} from "../../src/curriculum/full-product/p02e-quantity-semantic-role-binding-consumer.mjs";

const sourceAuthority = JSON.parse(fs.readFileSync(new URL("../../data/curriculum/knowledge/units/g5a_u04_5a04.knowledge-operation.json", import.meta.url), "utf8"));
const overrides = JSON.parse(fs.readFileSync(new URL("../../data/curriculum/full-product/p02e/quantity-semantic-role-overrides.json", import.meta.url), "utf8"));

const KP_ID = "kp_g5a_u04_fraction_measurement_segments";
const SOURCE_ID = "g5a_u04_5a04";

test("P04F28 q028 remains one source-authority KP with page-2 application-required scope", () => {
  const kp = sourceAuthority.knowledgePoints.find((row) => row.candidateId === KP_ID);
  assert.ok(kp);
  assert.equal(kp.name, "分數測量與等長分段");
  assert.deepEqual(kp.evidencePages, [2]);
  assert.equal(kp.applicationClassification, "APPLICATION_REQUIRED");
  assert.match(kp.scope, /總長與段數求每段分數長度/);
  assert.match(kp.scope, /容量求所需單位數/);
});

test("P04F28 q028 exact override uses one source-declared relation with two allowed targets", () => {
  const override = overrides.bindings.find((row) => row.knowledgePointId === KP_ID);
  assert.ok(override);
  assert.equal(override.relationFamilyId, "SOURCE_DECLARED_QUANTITY_RELATION");
  assert.deepEqual(override.knownRoleIds, ["KNOWN_QUANTITY_A", "KNOWN_QUANTITY_B"]);
  assert.equal(override.targetRoleId, "SOURCE_DECLARED_TARGET_QUANTITY");
  assert.equal(override.targetRoleMode, "SOURCE_DECLARED_ONLY");
  assert.deepEqual(override.allowedTargetRoleIds, ["PER_GROUP_QUANTITY", "GROUP_COUNT"]);
});

test("P04F28 q028 P02E consumer resolves both pattern targets and fails closed on unrelated target", () => {
  const binding = getP02EQuantitySemanticRoleBinding(KP_ID);
  assert.ok(binding);
  assert.equal(binding.classificationRuleId, `override:${KP_ID}`);
  assert.equal(binding.relationFamilyId, "SOURCE_DECLARED_QUANTITY_RELATION");
  assert.equal(binding.targetRoleMode, "SOURCE_DECLARED_ONLY");
  assert.deepEqual(binding.allowedTargetRoleIds, ["PER_GROUP_QUANTITY", "GROUP_COUNT"]);

  const perGroup = resolveP02EQuantitySemanticRoleBinding({
    knowledgePointId: KP_ID,
    sourceNodeId: SOURCE_ID,
    assertedRelationFamilyId: "SOURCE_DECLARED_QUANTITY_RELATION",
    assertedTargetRoleId: "PER_GROUP_QUANTITY",
  });
  assert.equal(perGroup.ok, true, JSON.stringify(perGroup.errors));

  const groupCount = resolveP02EQuantitySemanticRoleBinding({
    knowledgePointId: KP_ID,
    sourceNodeId: SOURCE_ID,
    assertedRelationFamilyId: "SOURCE_DECLARED_QUANTITY_RELATION",
    assertedTargetRoleId: "GROUP_COUNT",
  });
  assert.equal(groupCount.ok, true, JSON.stringify(groupCount.errors));

  const unrelated = resolveP02EQuantitySemanticRoleBinding({
    knowledgePointId: KP_ID,
    sourceNodeId: SOURCE_ID,
    assertedRelationFamilyId: "SOURCE_DECLARED_QUANTITY_RELATION",
    assertedTargetRoleId: "TOTAL_QUANTITY",
  });
  assert.equal(unrelated.ok, false);
  assert.equal(unrelated.blocked, true);
  assert.equal(unrelated.errors.some((code) => code.startsWith(`P02E_TARGET_ROLE_MISMATCH:${KP_ID}:TOTAL_QUANTITY`)), true);
});
