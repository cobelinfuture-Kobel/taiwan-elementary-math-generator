import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const REGISTRY_URL = new URL(
  "../../data/curriculum/registry/g4b_u04_knowledge_point_candidates.json",
  import.meta.url,
);

async function loadRegistry() {
  return JSON.parse(await readFile(REGISTRY_URL, "utf8"));
}

test("S62 materializes exactly 12 unique G4B-U04 KnowledgePoint candidates", async () => {
  const registry = await loadRegistry();
  assert.equal(registry.schemaName, "UnitKnowledgePointCandidateMap");
  assert.equal(registry.task, "S62_G4B_U04_ManualPDFKnowledgePointExtraction");
  assert.equal(registry.source.sourceId, "g4b_u04_4b04");
  assert.equal(registry.source.unitTitle, "概數");
  assert.equal(registry.source.pageCount, 2);
  assert.equal(registry.knowledgePointCount, 12);
  assert.equal(registry.knowledgePoints.length, 12);

  const ids = registry.knowledgePoints.map((row) => row.knowledgePointId);
  assert.equal(new Set(ids).size, 12);
  assert.ok(ids.every((id) => id.startsWith("kp_g4b_u04_")));
});

test("S62 candidates are page-evidenced and cover both PDF pages", async () => {
  const registry = await loadRegistry();
  const evidencePages = new Set();

  for (const row of registry.knowledgePoints) {
    assert.ok(row.displayName.length > 0, `${row.knowledgePointId}: displayName missing`);
    assert.ok(row.canonicalSkillCandidate.length > 0, `${row.knowledgePointId}: canonical skill missing`);
    assert.ok(row.subskillTags.length > 0, `${row.knowledgePointId}: subskill tags missing`);
    assert.ok(row.questionKindCandidates.length > 0, `${row.knowledgePointId}: question kinds missing`);
    assert.ok(row.representationTags.length > 0, `${row.knowledgePointId}: representation tags missing`);
    assert.ok(row.answerModelCandidates.length > 0, `${row.knowledgePointId}: answer models missing`);
    assert.ok(["C", "D"].includes(row.implementationClassCandidate));
    assert.ok(row.sourceEvidence.length > 0, `${row.knowledgePointId}: evidence missing`);

    for (const evidence of row.sourceEvidence) {
      assert.ok([1, 2].includes(evidence.page), `${row.knowledgePointId}: invalid page`);
      assert.ok(evidence.panel.length > 0, `${row.knowledgePointId}: panel missing`);
      assert.ok(evidence.summary.length > 0, `${row.knowledgePointId}: evidence summary missing`);
      evidencePages.add(evidence.page);
    }
  }

  assert.deepEqual([...evidencePages].sort(), [1, 2]);
});

test("S62 preserves source anomaly and forbids premature production promotion", async () => {
  const registry = await loadRegistry();
  assert.equal(registry.source.sourceAuthorityStatus, "manual_visual_read");
  assert.equal(registry.source.ocrAuthority, "forbidden");
  assert.ok(
    registry.source.sourceAnomalies.some((item) => item.code === "source_header_url_unit_mismatch"),
  );

  assert.deepEqual(registry.scopeBoundary, {
    formalMappingCreated: false,
    patternSpecsCreated: false,
    generatorImplemented: false,
    validatorImplemented: false,
    publicSelectorEnabled: false,
    productionUse: "forbidden",
  });

  for (const row of registry.knowledgePoints) {
    assert.equal(Object.hasOwn(row, "patternSpecIds"), false);
    assert.equal(Object.hasOwn(row, "productionUse"), false);
  }
});

test("S62 locks the expected concept, numeric, contextual, operation and inverse-rounding boundaries", async () => {
  const registry = await loadRegistry();
  const ids = new Set(registry.knowledgePoints.map((row) => row.knowledgePointId));
  const expected = [
    "kp_g4b_u04_approximation_language_cues",
    "kp_g4b_u04_approximation_symbol_reading",
    "kp_g4b_u04_three_approximation_methods_compare",
    "kp_g4b_u04_unconditional_round_down",
    "kp_g4b_u04_unconditional_round_up",
    "kp_g4b_u04_round_half_up_place_value",
    "kp_g4b_u04_context_floor_ceiling_selection",
    "kp_g4b_u04_payment_denomination_ceiling",
    "kp_g4b_u04_round_then_add_subtract",
    "kp_g4b_u04_round_then_multiply_divide",
    "kp_g4b_u04_inverse_rounding_unknown_digit",
    "kp_g4b_u04_inverse_rounding_possible_original",
  ];
  assert.deepEqual([...ids].sort(), [...expected].sort());

  const classCounts = registry.knowledgePoints.reduce(
    (counts, row) => {
      counts[row.implementationClassCandidate] += 1;
      return counts;
    },
    { C: 0, D: 0 },
  );
  assert.deepEqual(classCounts, { C: 8, D: 4 });
});
