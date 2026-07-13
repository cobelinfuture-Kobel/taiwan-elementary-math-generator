import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const mapping = JSON.parse(fs.readFileSync("data/curriculum/mapping/S76E_G4A_U08_ExistingPatternSpecReclassification.json", "utf8"));
const registry = JSON.parse(fs.readFileSync("data/curriculum/registry/S76D_G4A_U08_KnowledgePointPatternGroupRegistry.json", "utf8"));

const index = Object.fromEntries(mapping.rowFields.map((field, i) => [field, i]));
const groupIds = new Set(registry.patternGroups.map((row) => row[0]));
const kpIds = new Set(registry.knowledgePoints.map((row) => row[0]));

function column(name) {
  return mapping.rows.map((row) => row[index[name]]);
}

test("S76E reclassifies exactly the 12 existing application templates", () => {
  assert.equal(mapping.rows.length, 12);
  assert.equal(mapping.summary.reclassifiedExistingTemplateCount, 12);
  assert.equal(mapping.summary.canonicalPatternSpecCount, 12);
  assert.equal(new Set(column("legacyTemplateId")).size, 12);
  assert.equal(new Set(column("canonicalPatternSpecId")).size, 12);
});

test("every canonical KP and PatternGroup resolves to S76D authority", () => {
  for (const row of mapping.rows) {
    assert.ok(kpIds.has(row[index.canonicalKnowledgePointId]), row[index.canonicalKnowledgePointId]);
    assert.ok(groupIds.has(row[index.patternGroupId]), row[index.patternGroupId]);
    assert.equal(row[index.mode], "application");
    assert.equal(row[index.lifecycle], "hidden_reclassified_existing_runtime");
  }
});

test("over-merged add/sub and mul/div roles are separated", () => {
  const groups = new Set(column("patternGroupId"));
  for (const id of [
    "pg_g4a_u08_app_add_subtract",
    "pg_g4a_u08_app_subtract_add",
    "pg_g4a_u08_app_subtract_subtract",
    "pg_g4a_u08_app_multiply_then_share",
    "pg_g4a_u08_app_unit_rate_then_scale",
    "pg_g4a_u08_app_divide_then_divide",
    "pg_g4a_u08_app_payment_minus_unit_cost_times_quantity",
    "pg_g4a_u08_app_subtract_or_add_divided_amount"
  ]) assert.ok(groups.has(id), id);
});

test("legacy compatibility anchors remain intact", () => {
  assert.equal(mapping.compatibility.legacyTemplateIdsPreserved, true);
  assert.equal(mapping.compatibility.legacyKnowledgePointIdsPreserved, true);
  assert.deepEqual(new Set(column("legacyKnowledgePointId")), new Set([
    "kp_g4a_u08_app_add_sub_sequence",
    "kp_g4a_u08_app_parentheses_grouping",
    "kp_g4a_u08_app_mul_div_sequence",
    "kp_g4a_u08_app_mul_div_before_add_sub"
  ]));
});

test("extension groups are deferred rather than falsely classified as existing runtime", () => {
  assert.deepEqual(new Set(mapping.extensionPatternGroupsNotMaterializedHere), new Set([
    "pg_g4a_u08_ext_comparison_chain",
    "pg_g4a_u08_ext_equal_value_unit_price",
    "pg_g4a_u08_ext_relative_difference",
    "pg_g4a_u08_ext_two_cost_component_payment"
  ]));
  const classifiedGroups = new Set(column("patternGroupId"));
  for (const id of mapping.extensionPatternGroupsNotMaterializedHere) {
    assert.ok(groupIds.has(id), id);
    assert.equal(classifiedGroups.has(id), false);
  }
});

test("S76E is metadata-only and does not claim downstream implementation", () => {
  assert.equal(mapping.scopeBoundary.metadataOnly, true);
  assert.equal(mapping.scopeBoundary.canonicalGeneratedItemAdapterImplemented, false);
  assert.equal(mapping.scopeBoundary.validatorContractImplemented, false);
  assert.equal(mapping.scopeBoundary.extensionGeneratorImplemented, false);
  assert.equal(mapping.scopeBoundary.publicRoutingEnabled, false);
  assert.equal(mapping.scopeBoundary.productionLifecycleChanged, false);
  for (const changed of [
    mapping.compatibility.runtimeGeneratorChanged,
    mapping.compatibility.validatorChanged,
    mapping.compatibility.selectorChanged,
    mapping.compatibility.worksheetChanged,
    mapping.compatibility.rendererChanged
  ]) assert.equal(changed, false);
});
