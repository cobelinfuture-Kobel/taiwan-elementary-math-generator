import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const S78_URL = new URL(
  "../../data/curriculum/registry/g5a_u02_dual_pdf_knowledge_point_candidates.json",
  import.meta.url,
);
const S79_URL = new URL(
  "../../data/curriculum/registry/g5a_u02_dual_pdf_knowledge_point_candidate_qa.json",
  import.meta.url,
);
const S80_URL = new URL(
  "../../data/curriculum/mapping/g5a_u02_formal_mapping_candidates.json",
  import.meta.url,
);

async function load(url) {
  return JSON.parse(await readFile(url, "utf8"));
}

test("S80 maps all 18 S79 canonical KnowledgePoints to 18 unique PatternGroup candidates", async () => {
  const [s78, s79, s80] = await Promise.all([load(S78_URL), load(S79_URL), load(S80_URL)]);
  assert.equal(s80.schemaName, "G5AU02FormalMappingCandidateDesign");
  assert.equal(s80.task, "S80_G5A_U02_FormalMappingCandidateDesign");
  assert.equal(s80.unitId, "g5a_u02");
  assert.equal(s80.unitTitle, "因數與公因數");

  const sourceIds = new Set(s78.knowledgePointCandidates.map((row) => row.knowledgePointId));
  const acceptedIds = s79.boundaryDecisions
    .filter((row) => row.decision === "accept_as_distinct")
    .map((row) => row.knowledgePointId)
    .sort();
  const mappedIds = s80.knowledgePointMappings.map((row) => row.knowledgePointId).sort();

  assert.equal(sourceIds.size, 19);
  assert.equal(acceptedIds.length, 18);
  assert.deepEqual(mappedIds, acceptedIds);
  assert.equal(new Set(mappedIds).size, 18);
  assert.equal(new Set(s80.knowledgePointMappings.map((row) => row.patternGroupCandidateId)).size, 18);
});

test("S80 freezes 22 unique candidate mappings and proposed PatternSpec IDs", async () => {
  const s80 = await load(S80_URL);
  const mappings = s80.formalMappingCandidates;

  assert.equal(mappings.length, 22);
  assert.equal(new Set(mappings.map((row) => row.id)).size, 22);
  assert.equal(new Set(mappings.map((row) => row.ps)).size, 22);

  const indexedIds = s80.knowledgePointMappings.flatMap((row) => row.mappingCandidateIds).sort();
  assert.deepEqual(indexedIds, mappings.map((row) => row.id).sort());

  const knownModels = new Set(s80.answerModelCandidates);
  for (const row of mappings) {
    assert.ok(row.id.startsWith("fmc_g5a_u02_"));
    assert.ok(row.ps.startsWith("ps_g5a_u02_"));
    assert.ok(row.kp.startsWith("kp_g5a_u02_"));
    assert.ok(row.pg.startsWith("pgc_g5a_u02_"));
    assert.ok(knownModels.has(row.answer), `${row.id}: unknown answer model`);
    assert.ok(row.evidence.length > 0, `${row.id}: source evidence missing`);
    assert.ok(
      row.evidence.every((ref) => /^s78:5a02a1?:p[12]:/.test(ref)),
      `${row.id}: invalid source evidence reference`,
    );
    assert.ok(row.contract.length > 0, `${row.id}: contract missing`);
    assert.ok(row.guards.length > 0, `${row.id}: guards missing`);
    assert.ok(["C", "D"].includes(row.class), `${row.id}: invalid implementation class`);
    assert.equal(row.status, "candidate_only");
  }
});

test("S80 applies the S79 merge and does not create a standalone efficient-search group", async () => {
  const s80 = await load(S80_URL);
  const mergedId = "kp_g5a_u02_efficient_factor_pair_search";

  assert.equal(
    s80.knowledgePointMappings.some((row) => row.knowledgePointId === mergedId),
    false,
  );
  assert.equal(
    s80.formalMappingCandidates.some((row) => row.kp === mergedId),
    false,
  );

  const pairMapping = s80.formalMappingCandidates.find(
    (row) => row.id === "fmc_g5a_u02_factor_pair_enumeration",
  );
  assert.ok(pairMapping.guards.includes("search_stops_after_pair_repetition"));
  assert.ok(pairMapping.guards.includes("no_symmetric_duplicate"));
});

test("S80 preserves resolved packet roles while retaining the metadata correction gate", async () => {
  const s80 = await load(S80_URL);
  assert.equal(s80.sourceIdentity.status, "resolved_for_candidate_pipeline");
  assert.equal(s80.sourceIdentity.promotionBlockedByIdentity, false);
  assert.equal(s80.sourceIdentity.publicCatalogPromotionRequiresMetadataCorrection, true);
  assert.deepEqual(
    s80.sourceIdentity.packets.map((packet) => [
      packet.sourceId,
      packet.canonicalTitle,
      packet.canonicalRole,
    ]),
    [
      ["g5a_u02_5a02a", "因數", "factor_core"],
      ["g5a_u02_5a02a1", "公因數", "common_factor_gcf_extension"],
    ],
  );
  assert.deepEqual(s80.sourceIdentity.packets[1].requiredMetadataCorrection, {
    displayTitle: "公因數",
    sourceUrl: "https://meow911.com/5a03b/",
  });
});

test("S80 locks candidate number-theory formulas and conservative boundaries", async () => {
  const s80 = await load(S80_URL);
  assert.deepEqual(s80.globalBoundaryCandidate, {
    targetNumberRange: [2, 999],
    pairedNumberRange: [2, 999],
    applicationQuantityRange: [2, 9999],
    geometryDimensionRange: [2, 999],
    digitRange: [0, 9],
    digitCodeLength: 4,
    positiveIntegerOnly: true,
    includeOneAndSelfAsFactors: true,
    factorListOrdering: "ascending_unique",
    zeroDivisorAllowed: false,
    leadingZeroAllowedInDigitCode: false,
    fractionalAnswerAllowed: false,
    negativeAnswerAllowed: false,
    shortDivisionExternalMediaInferenceAllowed: false,
    genericFallbackAllowed: false,
  });
  assert.deepEqual(s80.formalRules, {
    divides: "d>0 && n%d===0",
    factorSet: "sortAsc({d in Z | 1<=d<=n && n%d=0})",
    factorPairs: "sortByFirst({(a,b) in Z^2 | 1<=a<=b && a*b=n})",
    factorListFromPairs: "sortAsc(unique(flatten(factorPairs(n))))",
    commonFactorSet: "intersect(factorSet(a),factorSet(b))",
    greatestCommonFactor: "max(commonFactorSet(a,b))",
    missingFactorValues: "project factorSet(n) onto hidden positions while all visible positions remain fixed",
    equalPartitionSolutions: "filter(factorSet(total), context range and unit constraints)",
    remainderTransfer: "if D%d=0 and N=q*D+r, then N%d=r%d",
    rectangleSquareSideLengths: "commonFactorSet(length,width)",
    squareTileAreas: "sortAsc({s*s | s in commonFactorSet(length,width)})",
    problemTypeClassification: "choose one of factor|multiple|common_factor|common_multiple from quantified quantity-role semantics",
    digitCodeSolutions: "lexicographically sort all digit tuples satisfying the closed predicates; candidate item requires exactly one tuple",
  });
});

test("S80 keeps semantically different answer shapes as separate mappings", async () => {
  const s80 = await load(S80_URL);
  const byId = new Map(s80.formalMappingCandidates.map((row) => [row.id, row]));

  assert.equal(byId.get("fmc_g5a_u02_factor_pair_enumeration").answer, "factorPairListAnswer");
  assert.equal(byId.get("fmc_g5a_u02_factor_list_from_pairs").answer, "integerListAnswer");
  assert.equal(byId.get("fmc_g5a_u02_divisor_candidate_selection").answer, "selectionSetAnswer");
  assert.equal(byId.get("fmc_g5a_u02_factor_statement_judgement").answer, "booleanAnswer");
  assert.equal(byId.get("fmc_g5a_u02_complete_factor_list_unknown_values").answer, "structuredInferenceAnswer");
  assert.equal(byId.get("fmc_g5a_u02_complete_factor_list_statement_evaluation").answer, "booleanSetAnswer");
  assert.equal(byId.get("fmc_g5a_u02_rectangle_square_side_lengths").answer, "lengthListAnswer");
  assert.equal(byId.get("fmc_g5a_u02_square_tile_area_possibilities").answer, "areaListAnswer");
  assert.equal(byId.get("fmc_g5a_u02_multi_constraint_digit_code").answer, "digitTupleAnswer");
});

test("S80 acceptance counts and lifecycle prohibit premature materialization", async () => {
  const s80 = await load(S80_URL);
  const classCounts = s80.formalMappingCandidates.reduce((counts, row) => {
    counts[row.class] = (counts[row.class] ?? 0) + 1;
    return counts;
  }, {});

  assert.deepEqual(classCounts, { C: 14, D: 8 });
  assert.deepEqual(s80.acceptance, {
    knowledgePointCount: 18,
    patternGroupCandidateCount: 18,
    formalMappingCandidateCount: 22,
    classCMappingCandidateCount: 14,
    classDMappingCandidateCount: 8,
    answerModelCandidateCount: 16,
    mergedSourceCandidateCount: 1,
    allAcceptedKnowledgePointsCovered: true,
    allMappingsSourceEvidenced: true,
    allMappingsCandidateOnly: true,
    sourceIdentityResolvedForCandidatePipeline: true,
  });
  assert.deepEqual(s80.scopeBoundary, {
    sourceMetadataMutated: false,
    formalMappingMaterialized: false,
    patternSpecsCreated: false,
    generatorImplemented: false,
    validatorImplemented: false,
    publicSelectorEnabled: false,
    productionUse: "forbidden",
  });
});
