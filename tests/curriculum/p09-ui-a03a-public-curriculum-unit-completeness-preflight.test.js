import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const readJson = (path) => JSON.parse(fs.readFileSync(path, "utf8"));

const preflight = readJson("data/curriculum/full-product/p09/p09-ui-a03a-public-curriculum-unit-completeness-preflight.json");
const sourceRegistry = readJson("data/curriculum/application/controller/postg-app-79-unit-registry.json");
const reconciliation = readJson("data/curriculum/global/candidates/r02/source-authority-reconciliation-index.json");
const g3aU08 = readJson("data/curriculum/knowledge/units/g3a_u08_3a08.knowledge-operation.json");
const a02 = readJson("data/curriculum/full-product/p09/p09-ui-a02-g3a-u08-two-kp-product-admission.json");
const reviewed05 = readJson("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-05.json");
const reviewed08 = readJson("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-08.json");

function allSourceNodeIds() {
  return sourceRegistry.batches.flatMap((batch) => batch.sourceNodeIds);
}
function sourceRecord(chunk, sourceNodeId) {
  return chunk.sourceRecords.find((row) => row.sourceNodeId === sourceNodeId);
}

test("P09 A03A corrects source-unit completeness without inventing canonical KPs", () => {
  assert.equal(preflight.status, "PREFLIGHT_LOCKED_PUBLIC_UNIT_COMPLETENESS_MODEL_CORRECTED");
  assert.equal(preflight.correctedCompletenessModel.canonicalSourceNodeCount, 79);
  assert.equal(preflight.correctedCompletenessModel.expectedPublicCurriculumUnitCountAfterCorrection, 78);
  assert.equal(preflight.correctedCompletenessModel.canonicalUniqueKnowledgePointCount, 482);
  assert.equal(preflight.correctedCompletenessModel.expectedPublicSourceKnowledgePointRouteProjectionCountAfterCorrection, 493);
  assert.deepEqual(
    preflight.correctedCompletenessModel.legitimateCompositeCollapse.canonicalSourceNodeIds,
    ["g5a_u02_5a02a", "g5a_u02_5a02a1"],
  );
});

test("G3A-U08 authority has seven KPs and A02 intentionally admitted its final two only as single-KP routes", () => {
  assert.equal(g3aU08.knowledgePoints.length, 7);
  const targetIds = [
    "kp_g3a_u08_whole_as_fraction",
    "kp_g3a_u08_unlike_denominator_comparison_limit",
  ];
  assert.deepEqual(a02.knowledgePoints.map((row) => row.knowledgePointId), targetIds);
  assert.equal(a02.productAdmission.singleKnowledgePointRequired, true);
  assert.equal(a02.productAdmission.sourceUnitAutoMixRequired, false);
  assert.equal(a02.productAdmission.sameUnitMixedRequired, false);
  assert.equal(preflight.diagnosis.g3aU08.requiredCorrection.includes("all seven"), true);
});

test("G4B-U03 is a real curriculum source node whose six KPs share canonical semantics with G4A-U06", () => {
  assert.ok(allSourceNodeIds().includes("g4b_u03_4b03"));
  const aliases = reconciliation.semanticIdentityRules.canonicalKnowledgePointAliases;
  const sourceAliasKeys = Object.keys(aliases).filter((id) => id.startsWith("kp_g4b_u03_"));
  assert.equal(sourceAliasKeys.length, 6);
  assert.equal(new Set(sourceAliasKeys.map((id) => aliases[id])).size, 6);
  assert.equal(preflight.diagnosis.g4bU03.canonicalKnowledgePointIds.length, 6);
});

test("G6B-U02 is a reviewed two-page source node with five shared speed KPs", () => {
  assert.ok(allSourceNodeIds().includes("g6b_u02_6b02"));
  const record = sourceRecord(reviewed08, "g6b_u02_6b02");
  assert.ok(record);
  assert.equal(record.sourceTitle, "認識速率");
  assert.equal(record.pageCount, 2);
  assert.equal(record.candidates.length, 5);
  const shared = reconciliation.semanticIdentityRules.sharedReviewedKnowledgePointIds;
  assert.deepEqual(shared.sourceNodeIds, ["g6a_u08_6a08", "g6b_u02_6b02"]);
  assert.equal(shared.policy, "MERGE_SOURCE_REFS_KEEP_ONE_SEMANTIC_IDENTITY");
});

test("G5B-U10 authority currently proves only the U10A source identity", () => {
  const ids = allSourceNodeIds().filter((id) => id.startsWith("g5b_u10"));
  assert.deepEqual(ids, ["g5b_u10_5b10a"]);
  const record = sourceRecord(reviewed05, "g5b_u10_5b10a");
  assert.ok(record);
  assert.equal(record.sourceTitle, "生活中的大單位");
  assert.equal(record.sourcePdfTitle, "meow911_5b10a_source.pdf");
  assert.equal(record.pageCount, 1);
  assert.equal(record.candidates.length, 5);
  assert.equal(preflight.diagnosis.g5bU10.status, "SOURCE_SCOPE_PARENT_OR_SPLIT_IDENTITY_UNRESOLVED");
  assert.equal(preflight.diagnosis.g5bU10.fullG5BU10SourceNodePresent, false);
  assert.equal(preflight.diagnosis.g5bU10.g5bU10BSourceNodePresent, false);
});
