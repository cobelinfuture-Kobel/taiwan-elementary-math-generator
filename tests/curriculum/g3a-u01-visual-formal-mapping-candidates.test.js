import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const MAPPING_PATH = new URL("../../data/curriculum/mapping/g3a_u01_visual_formal_mapping_candidates.v1.json", import.meta.url);
const VISUAL_PATH = new URL("../../data/curriculum/representation/units/g3a_u01_3a01.visual-pattern-families.v1.json", import.meta.url);
const KP_PATH = new URL("../../data/curriculum/knowledge/units/g3a_u01_3a01.knowledge-operation.json", import.meta.url);

const mapping = JSON.parse(fs.readFileSync(MAPPING_PATH, "utf8"));
const visual = JSON.parse(fs.readFileSync(VISUAL_PATH, "utf8"));
const kp = JSON.parse(fs.readFileSync(KP_PATH, "utf8"));

test("G3A U01 formal mapping pass covers all 18 visual families and 228 questions", () => {
  assert.equal(mapping.schemaName, "G3AU01VisualFormalMappingCandidateRegistryV1");
  assert.equal(mapping.scopeBoundary.visualFamilyCount, 18);
  assert.equal(mapping.scopeBoundary.sourceQuestionCount, 228);
  assert.equal(mapping.mappings.length, 18);
  assert.equal(mapping.mappings.reduce((sum, row) => sum + row.questionCount, 0), 228);
  assert.deepEqual(
    mapping.mappings.map((row) => row.visualFamilyId).sort(),
    visual.families.map((row) => row.visualFamilyId).sort()
  );
});

test("mapping status partition is exact and no runtime authority is minted", () => {
  const counts = Object.fromEntries([...new Set(mapping.mappings.map((row) => row.mappingStatus))]
    .map((status) => [status, mapping.mappings.filter((row) => row.mappingStatus === status).length]));
  const candidateDependency = counts.CANDIDATE_KP_DEPENDENCY ?? 0;
  const splitRequired = counts.PATTERNSPEC_SPLIT_REQUIRED ?? 0;
  const existingMapped = mapping.mappings.length - candidateDependency - splitRequired;
  assert.equal(candidateDependency, 4);
  assert.equal(splitRequired, 1);
  assert.equal(existingMapped, 13);
  assert.equal(mapping.scopeBoundary.newKnowledgePointsMinted, false);
  assert.equal(mapping.scopeBoundary.patternSpecsMaterialized, false);
  assert.equal(mapping.scopeBoundary.productionUse, "forbidden");
});

test("existing-KP mappings point only to current G3A U01 authority and candidate KPs are explicit", () => {
  const existing = new Set(kp.knowledgePoints.map((row) => row.knowledgePointId));
  const candidates = new Set(mapping.knowledgePointCandidates.map((row) => row.knowledgePointCandidateId));
  assert.equal(candidates.size, 2);
  for (const row of mapping.mappings) {
    if (row.primaryKnowledgePointId == null) continue;
    assert.ok(existing.has(row.primaryKnowledgePointId) || candidates.has(row.primaryKnowledgePointId));
  }
  assert.ok(mapping.knowledgePointCandidates.every((row) => row.status === "candidate_only_not_minted"));
});

test("number-line source families are not forced into range-reasoning KP", () => {
  const byId = new Map(mapping.mappings.map((row) => [row.visualFamilyId, row]));
  for (const id of [
    "vf_g3a_u01_integer_number_line_read_value",
    "vf_g3a_u01_integer_number_line_mark_value",
    "vf_g3a_u01_integer_number_line_complete_scale"
  ]) {
    assert.equal(byId.get(id)?.primaryKnowledgePointId, "kpc_g3a_u01_integer_number_line_scale_location");
    assert.equal(byId.get(id)?.mappingStatus, "CANDIDATE_KP_DEPENDENCY");
  }
  assert.equal(
    byId.get("vf_g3a_u01_integer_number_line_movement")?.primaryKnowledgePointId,
    "kpc_g3a_u01_integer_number_line_movement"
  );
});

test("mixed number-line family remains split-required and cannot materialize one PatternSpec", () => {
  const row = mapping.mappings.find((item) => item.visualFamilyId === "vf_g3a_u01_integer_number_line_relation_or_compute");
  assert.equal(row.mappingStatus, "PATTERNSPEC_SPLIT_REQUIRED");
  assert.equal(row.patternSpecCandidateId, null);
  assert.equal(row.primaryKnowledgePointId, null);
});

test("PatternSpec priority ordering is complete, unique, and starts with native shortest path", () => {
  const ranks = mapping.patternSpecPriorityOrdering.map((row) => row.rank);
  assert.deepEqual([...ranks].sort((a,b)=>a-b), Array.from({length:18},(_,i)=>i+1));
  assert.equal(new Set(ranks).size, 18);
  assert.equal(mapping.patternSpecPriorityOrdering[0].visualFamilyId, "vf_g3a_u01_one_way_table_compare");
  assert.equal(mapping.patternSpecPriorityOrdering[0].rendererClassification, "NATIVE");
  assert.equal(mapping.patternSpecPriorityOrdering.at(-1).visualFamilyId, "vf_g3a_u01_receipt_range_reasoning");
});
