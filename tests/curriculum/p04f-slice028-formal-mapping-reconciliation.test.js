import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const sourceAuthority = JSON.parse(fs.readFileSync(new URL("../../data/curriculum/knowledge/units/g5a_u04_5a04.knowledge-operation.json", import.meta.url), "utf8"));
const sliceAuthority = JSON.parse(fs.readFileSync(new URL("../../data/curriculum/full-product/p04f/slice028-g5a-u04-fraction-measurement-segments-formal-mapping-authority.json", import.meta.url), "utf8"));
const p02eOverrides = JSON.parse(fs.readFileSync(new URL("../../data/curriculum/full-product/p02e/quantity-semantic-role-overrides.json", import.meta.url), "utf8"));

const KP_ID = "kp_g5a_u04_fraction_measurement_segments";

test("P04F28 q028 remains one source-authority KP with page-2 application-required scope", () => {
  const kp = sourceAuthority.knowledgePoints.find((row) => row.candidateId === KP_ID);
  assert.ok(kp);
  assert.equal(kp.name, "分數測量與等長分段");
  assert.deepEqual(kp.evidencePages, [2]);
  assert.equal(kp.applicationClassification, "APPLICATION_REQUIRED");
  assert.match(kp.scope, /總長與段數求每段分數長度/);
  assert.match(kp.scope, /容量求所需單位數/);
});

test("P04F28 q028 uses slice-local source-declared FormalMapping and does not mutate P02E historical overrides", () => {
  assert.equal(sliceAuthority.queue.sliceId, "p04e_q028_r6_g5a_u04_5a04_profile_quantity_measurement_c1");
  assert.deepEqual(sliceAuthority.source.primaryWitnessPages, [2]);
  assert.equal(sliceAuthority.knowledgePoints.length, 1);
  assert.equal(sliceAuthority.knowledgePoints[0].knowledgePointId, KP_ID);
  assert.equal(sliceAuthority.knowledgePoints[0].kpSplitAllowed, false);
  assert.equal(sliceAuthority.formalMapping.authorityMode, "P04F_SLICE_LOCAL_EXACT");
  assert.equal(sliceAuthority.formalMapping.relationFamilyId, "SOURCE_DECLARED_QUANTITY_RELATION");
  assert.deepEqual(sliceAuthority.formalMapping.knownRoleIds, ["KNOWN_QUANTITY_A", "KNOWN_QUANTITY_B"]);
  assert.equal(sliceAuthority.formalMapping.targetRoleId, "SOURCE_DECLARED_TARGET_QUANTITY");
  assert.equal(sliceAuthority.formalMapping.targetRoleMode, "SOURCE_DECLARED_ONLY");
  assert.deepEqual(sliceAuthority.formalMapping.allowedTargetRoleIds, ["PER_GROUP_QUANTITY", "GROUP_COUNT"]);
  assert.equal(p02eOverrides.bindings.some((row) => row.knowledgePointId === KP_ID), false);
  assert.equal(sliceAuthority.authorityBoundary.p02eHistoricalDependentInventoryMutable, false);
  assert.equal(sliceAuthority.authorityBoundary.p02eExactOverrideRequired, false);
  assert.equal(sliceAuthority.authorityBoundary.p02eConsumerResolutionRequired, false);
});

test("P04F28 q028 locks exactly two pattern target contracts without materializing PatternSpec yet", () => {
  const contracts = sliceAuthority.formalMapping.patternTargetContracts;
  assert.equal(contracts.length, 2);
  assert.deepEqual(contracts.map((row) => row.targetRoleId), ["PER_GROUP_QUANTITY", "GROUP_COUNT"]);
  assert.deepEqual(contracts[0], {
    patternFamilyId: "PER_GROUP_QUANTITY",
    semanticRelation: "PARTITIVE_DIVISION",
    knownRoleIds: ["TOTAL_QUANTITY", "GROUP_COUNT"],
    targetRoleId: "PER_GROUP_QUANTITY",
  });
  assert.deepEqual(contracts[1], {
    patternFamilyId: "GROUP_COUNT",
    semanticRelation: "QUOTATIVE_DIVISION",
    knownRoleIds: ["TOTAL_QUANTITY", "PER_GROUP_QUANTITY"],
    targetRoleId: "GROUP_COUNT",
  });
  assert.equal(sliceAuthority.authorityBoundary.patternSpecMaterialized, false);
  assert.equal(sliceAuthority.authorityBoundary.generatorMaterialized, false);
  assert.equal(sliceAuthority.authorityBoundary.selectorPromoted, false);
  assert.equal(sliceAuthority.authorityBoundary.worksheetEnabled, false);
  assert.equal(sliceAuthority.authorityBoundary.q029Touched, false);
});
