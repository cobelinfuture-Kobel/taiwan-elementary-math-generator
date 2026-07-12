import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const S62_URL = new URL(
  "../../data/curriculum/registry/g4b_u04_knowledge_point_candidates.json",
  import.meta.url,
);
const S63_URL = new URL(
  "../../data/curriculum/registry/g4b_u04_knowledge_point_candidate_qa.json",
  import.meta.url,
);
const S64_URL = new URL(
  "../../data/curriculum/mapping/g4b_u04_formal_mapping_candidates.json",
  import.meta.url,
);

async function load(url) {
  return JSON.parse(await readFile(url, "utf8"));
}

test("S64 covers all 12 S63-accepted KnowledgePoints with 12 unique PatternGroup candidates", async () => {
  const [s62, s63, s64] = await Promise.all([load(S62_URL), load(S63_URL), load(S64_URL)]);
  assert.equal(s64.schemaName, "G4BU04FormalMappingCandidateDesign");
  assert.equal(s64.task, "S64_G4B_U04_FormalMappingCandidateDesign");
  assert.equal(s64.sourceId, "g4b_u04_4b04");
  assert.equal(s64.canonicalSkillParent, "rounding_approximation");

  const sourceIds = s62.knowledgePoints.map((row) => row.knowledgePointId).sort();
  const acceptedIds = s63.boundaryDecisions
    .filter((row) => row.decision === "accept_as_distinct")
    .map((row) => row.knowledgePointId)
    .sort();
  const mappedIds = s64.knowledgePointMappings.map((row) => row.knowledgePointId).sort();

  assert.deepEqual(acceptedIds, sourceIds);
  assert.deepEqual(mappedIds, sourceIds);
  assert.equal(new Set(mappedIds).size, 12);
  assert.equal(new Set(s64.knowledgePointMappings.map((row) => row.patternGroupCandidateId)).size, 12);
});

test("S64 freezes 17 unique candidate mappings and proposed PatternSpec IDs", async () => {
  const s64 = await load(S64_URL);
  const mappings = s64.formalMappingCandidates;
  assert.equal(mappings.length, 17);
  assert.equal(new Set(mappings.map((row) => row.id)).size, 17);
  assert.equal(new Set(mappings.map((row) => row.ps)).size, 17);

  const indexedIds = s64.knowledgePointMappings.flatMap((row) => row.mappingCandidateIds).sort();
  assert.deepEqual(indexedIds, mappings.map((row) => row.id).sort());

  const knownModels = new Set(s64.answerModelCandidates);
  for (const row of mappings) {
    assert.ok(row.id.startsWith("fmc_g4b_u04_"));
    assert.ok(row.ps.startsWith("ps_g4b_u04_"));
    assert.ok(row.kp.startsWith("kp_g4b_u04_"));
    assert.ok(row.pg.startsWith("pgc_g4b_u04_"));
    assert.ok(knownModels.has(row.answer), `${row.id}: unknown answer model`);
    assert.ok(row.evidence.length > 0, `${row.id}: evidence missing`);
    assert.ok(row.evidence.every((ref) => /^s62:p[12]:/.test(ref)), `${row.id}: invalid evidence ref`);
    assert.ok(row.contract.length > 0, `${row.id}: contract missing`);
    assert.ok(row.guards.length > 0, `${row.id}: validator guards missing`);
    assert.ok(["C", "D"].includes(row.class), `${row.id}: invalid class`);
    assert.equal(row.status, "candidate_only");
  }
});

test("S64 formal rules and numeric boundaries preserve the G4B-U04 rounding contract", async () => {
  const s64 = await load(S64_URL);
  assert.deepEqual(s64.globalBoundaryCandidate, {
    inputRange: [0, 99999999],
    targetPlaceUnits: [10, 100, 1000, 10000],
    contextGroupSizes: [10, 100, 1000],
    factorOrDivisorRange: [2, 9],
    maxAnswer: 999999999,
    integerOnly: true,
    negativeAnswerAllowed: false,
    genericFallbackAllowed: false,
  });
  assert.deepEqual(s64.formalRules, {
    down: "floor(v/u)*u",
    up: "ceil(v/u)*u",
    halfUp: "floor((v+u/2)/u)*u",
    floorGroups: "floor(t/g)",
    ceilingGroups: "ceil(t/g)",
    payment: "ceil(p/d)*d",
    noteCount: "ceil(p/d)",
    inverse: "[y-u/2,y+u/2-1]",
  });
});

test("S64 keeps semantically different output shapes as separate candidate mappings", async () => {
  const s64 = await load(S64_URL);
  const byId = new Map(s64.formalMappingCandidates.map((row) => [row.id, row]));

  assert.equal(byId.get("fmc_g4b_u04_floor_complete_groups").contract, "floor(total / groupSize)");
  assert.equal(byId.get("fmc_g4b_u04_ceiling_minimum_required").contract, "ceil(total / capacityOrIncrement)");
  assert.equal(byId.get("fmc_g4b_u04_payment_amount_ceiling").answer, "moneyAmountAnswer");
  assert.equal(byId.get("fmc_g4b_u04_payment_banknote_count").answer, "banknoteCountAnswer");
  assert.equal(byId.get("fmc_g4b_u04_inverse_digit_set").answer, "digitSetAnswer");
  assert.equal(byId.get("fmc_g4b_u04_inverse_original_values").answer, "possibleValuesAnswer");

  for (const requiredId of [
    "fmc_g4b_u04_round_then_add",
    "fmc_g4b_u04_round_then_subtract",
    "fmc_g4b_u04_round_then_multiply",
    "fmc_g4b_u04_round_then_divide",
  ]) {
    assert.equal(byId.get(requiredId).mode, "operation_estimation");
  }
});

test("S64 acceptance counts and scope boundary forbid premature materialization", async () => {
  const s64 = await load(S64_URL);
  const classCounts = s64.formalMappingCandidates.reduce((counts, row) => {
    counts[row.class] = (counts[row.class] ?? 0) + 1;
    return counts;
  }, {});
  assert.deepEqual(classCounts, { C: 9, D: 8 });
  assert.deepEqual(s64.acceptance, {
    knowledgePointCount: 12,
    patternGroupCandidateCount: 12,
    formalMappingCandidateCount: 17,
    classCMappingCandidateCount: 9,
    classDMappingCandidateCount: 8,
    answerModelCandidateCount: 9,
    allKnowledgePointsCovered: true,
    allMappingsSourceEvidenced: true,
    allMappingsCandidateOnly: true,
  });
  assert.deepEqual(s64.scopeBoundary, {
    formalMappingMaterialized: false,
    patternSpecsCreated: false,
    generatorImplemented: false,
    validatorImplemented: false,
    publicSelectorEnabled: false,
    productionUse: "forbidden",
  });
});
