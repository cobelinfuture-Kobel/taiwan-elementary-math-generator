import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const EXTRACTION_URL = new URL(
  "../../data/curriculum/registry/g4b_u04_knowledge_point_candidates.json",
  import.meta.url,
);
const QA_URL = new URL(
  "../../data/curriculum/registry/g4b_u04_knowledge_point_candidate_qa.json",
  import.meta.url,
);

async function loadJson(url) {
  return JSON.parse(await readFile(url, "utf8"));
}

test("S63 QA covers every S62 candidate exactly once", async () => {
  const extraction = await loadJson(EXTRACTION_URL);
  const qa = await loadJson(QA_URL);

  assert.equal(qa.schemaName, "UnitKnowledgePointCandidateQA");
  assert.equal(qa.task, "S63_G4B_U04_KnowledgePointCandidateMapQA");
  assert.equal(qa.sourceId, extraction.source.sourceId);
  assert.equal(qa.summary.candidateCount, 12);
  assert.equal(qa.boundaryDecisions.length, 12);

  const extractedIds = extraction.knowledgePoints.map((row) => row.knowledgePointId).sort();
  const qaIds = qa.boundaryDecisions.map((row) => row.knowledgePointId).sort();
  assert.deepEqual(qaIds, extractedIds);
  assert.equal(new Set(qaIds).size, 12);
});

test("S63 accepts 12 distinct boundaries under the canonical rounding parent", async () => {
  const qa = await loadJson(QA_URL);

  assert.deepEqual(qa.summary, {
    candidateCount: 12,
    acceptedCount: 12,
    mergedCount: 0,
    splitCount: 0,
    rejectedCount: 0,
    classCCount: 8,
    classDCount: 4,
  });
  assert.equal(qa.canonicalSkillParent, "rounding_approximation");

  for (const decision of qa.boundaryDecisions) {
    assert.equal(decision.decision, "accept_as_distinct");
    assert.equal(decision.canonicalSkillParent, "rounding_approximation");
    assert.ok(decision.skillVariant.length > 0);
    assert.ok(decision.boundaryRationale.length > 0);
  }

  assert.equal(new Set(qa.boundaryDecisions.map((row) => row.skillVariant)).size, 12);
});

test("S63 duplicate-boundary checks reference valid candidates and remain distinct", async () => {
  const qa = await loadJson(QA_URL);
  const validIds = new Set(qa.boundaryDecisions.map((row) => row.knowledgePointId));

  assert.equal(qa.duplicateBoundaryChecks.length, 5);
  for (const check of qa.duplicateBoundaryChecks) {
    assert.equal(check.pair.length, 2);
    assert.ok(check.pair.every((id) => validIds.has(id)));
    assert.equal(check.result, "distinct");
    assert.ok(check.reason.length > 0);
  }
});

test("S63 retains the source anomaly and blocks premature mapping or production", async () => {
  const qa = await loadJson(QA_URL);

  assert.deepEqual(qa.sourceAnomalyDisposition, {
    code: "source_header_url_unit_mismatch",
    status: "recorded_non_blocking",
    sourceIdDecision: "retain_g4b_u04_4b04",
    reason: "Uploaded filename, unit title and curriculum assignment agree on 4B-U04; only the rendered URL header differs.",
  });

  assert.deepEqual(qa.scopeBoundary, {
    knowledgePointRowsPromoted: false,
    formalMappingCreated: false,
    patternSpecsCreated: false,
    generatorImplemented: false,
    validatorImplemented: false,
    publicSelectorEnabled: false,
    productionUse: "forbidden",
  });
  assert.equal(qa.nextGate, "S64_G4B_U04_FormalMappingCandidateDesign");
});
