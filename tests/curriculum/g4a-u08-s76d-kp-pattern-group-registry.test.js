import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const registryPath = path.resolve(
  __dirname,
  "../../data/curriculum/registry/S76D_G4A_U08_KnowledgePointPatternGroupRegistry.json",
);
const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));

function rowsToObjects(fields, rows) {
  return rows.map((row) => Object.fromEntries(fields.map((field, index) => [field, row[index]])));
}

const knowledgePoints = rowsToObjects(registry.knowledgePointRowFields, registry.knowledgePoints);
const patternGroups = rowsToObjects(registry.patternGroupRowFields, registry.patternGroups);

test("S76D registry has exact source-authority counts", () => {
  assert.equal(registry.schemaName, "G4AU08KnowledgePointPatternGroupRegistry");
  assert.equal(registry.sourceId, "g4a_u08_4a08");
  assert.equal(knowledgePoints.length, 15);
  assert.equal(knowledgePoints.filter((row) => row.domain === "numeric").length, 11);
  assert.equal(knowledgePoints.filter((row) => row.domain === "application").length, 4);
  assert.equal(patternGroups.length, 28);
  assert.equal(patternGroups.filter((row) => row.lifecycle === "extension_hidden").length, 4);
});

test("S76D ids are unique and every PatternGroup resolves to one KnowledgePoint", () => {
  const kpIds = knowledgePoints.map((row) => row.knowledgePointId);
  const groupIds = patternGroups.map((row) => row.patternGroupId);
  assert.equal(new Set(kpIds).size, kpIds.length);
  assert.equal(new Set(groupIds).size, groupIds.length);
  const kpSet = new Set(kpIds);
  for (const group of patternGroups) assert.ok(kpSet.has(group.knowledgePointId), group.patternGroupId);
});

test("S76D separates previously over-merged multiplication/division roles", () => {
  const roles = new Set(
    patternGroups
      .filter((row) => row.knowledgePointId === "kp_g4a_u08_app_mul_div_sequence")
      .map((row) => row.reasoningRole),
  );
  for (const required of [
    "find_total_then_share",
    "find_unit_rate_then_scale",
    "two_stage_equal_partition",
    "equal_total_value_find_unit_price",
    "same_direction_relative_increment",
  ]) assert.ok(roles.has(required), required);
});

test("S76D extension groups remain hidden and unrouted", () => {
  const extensionIds = new Set([
    "pg_g4a_u08_ext_comparison_chain",
    "pg_g4a_u08_ext_equal_value_unit_price",
    "pg_g4a_u08_ext_relative_difference",
    "pg_g4a_u08_ext_two_cost_component_payment",
  ]);
  for (const group of patternGroups.filter((row) => extensionIds.has(row.patternGroupId))) {
    assert.equal(group.lifecycle, "extension_hidden");
  }
  assert.equal(registry.lifecycle.selectorVisibility, "hidden");
  assert.equal(registry.lifecycle.canonicalRouting, "disabled");
  assert.equal(registry.lifecycle.productionUse, "forbidden_for_rebase_registry");
});

test("S76D does not import grade-5-only objectives or mutate runtime scope", () => {
  const serialized = JSON.stringify(registry);
  for (const forbidden of ["distributive", "average_inverse", "unknown_operator", "N_PLUS_1", "sdg"]) {
    assert.equal(serialized.includes(forbidden), false, forbidden);
  }
  assert.equal(registry.scopeBoundary.runtimeChanged, false);
  assert.equal(registry.scopeBoundary.publicSelectorChanged, false);
  assert.equal(registry.scopeBoundary.worksheetChanged, false);
  assert.equal(registry.scopeBoundary.rendererChanged, false);
});
