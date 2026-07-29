import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const contractPath = path.join(repoRoot, "data/curriculum/public-generation/generator_capacity_contract.json");
const routeCsvPath = path.join(repoRoot, "data/curriculum/public-generation/route_capacity_matrix.csv");
const diversityCsvPath = path.join(repoRoot, "data/curriculum/public-generation/cross_seed_diversity_report.csv");
const mismatchPath = path.join(repoRoot, "docs/curriculum/output/PGC-R03_capacity_mismatch_report.md");

function loadContract() {
  assert.equal(fs.existsSync(contractPath), true, "PGC-R03 contract must be materialized before focused acceptance");
  return JSON.parse(fs.readFileSync(contractPath, "utf8"));
}

test("PGC-R03 contract accounts every R02 public binding", () => {
  const contract = loadContract();
  assert.equal(contract.schemaName, "PublicGeneratorCapacityContractV2");
  assert.equal(contract.schemaVersion, 2);
  assert.deepEqual(contract.evidenceProjectionPolicy, ["questionDisplayModels", "generatedQuestions", "questions", "answerKeyItems"]);
  assert.equal(contract.programId, "PUBLIC_KP_GENERATION_CONFORMANCE_V1");
  assert.equal(contract.taskId, "PGC-R03_PublicGeneratorCapacityContract");
  assert.equal(contract.defaultQuestionCount, 20);
  assert.equal(contract.seedCount, 10);
  assert.equal(contract.summary.publicSourceCount, 26);
  assert.equal(contract.summary.visibleKnowledgePointCount, 193);
  assert.equal(contract.summary.publicSurfaceCount, 3);
  assert.equal(contract.summary.bindingCount, 1152);
  assert.equal(contract.summary.bindingEvidenceCount, contract.summary.bindingCount);
  assert.ok(contract.summary.routeCount > 0);
  assert.equal(contract.bindingEvidence.length, contract.summary.bindingCount);
  for (const binding of contract.bindingEvidence) {
    assert.ok(binding.routeCount > 0, binding.bindingId);
    assert.equal(binding.declaredUiMaxQuestionCount, 20, binding.bindingId);
  }
});

test("PGC-R03 verifies 20 questions across ten seeds for every legal route", () => {
  const contract = loadContract();
  assert.equal(contract.status, "PASS", JSON.stringify(contract.mismatches, null, 2));
  assert.equal(contract.summary.failClosedRouteCount, 0);
  assert.equal(contract.summary.capacityMismatchBindingCount, 0);
  assert.equal(contract.summary.sameSeedReproFailureCount, 0);
  assert.equal(contract.summary.crossSeedDiversityFailureCount, 0);
  assert.equal(contract.summary.duplicatePromptRouteCount, 0);
  assert.equal(contract.summary.missingPromptRouteCount, 0);
  assert.equal(contract.summary.tenSeedFailureRouteCount, 0);
  assert.equal(contract.summary.verified20RouteCount, contract.summary.routeCount);
  for (const route of contract.routes) {
    assert.equal(route.capacityStatus, "VERIFIED_20", route.routeId);
    assert.equal(route.verifiedMaxQuestionCount, 20, route.routeId);
    assert.equal(route.successfulSeedCount, 10, route.routeId);
    assert.equal(route.failedSeedCount, 0, route.routeId);
    assert.equal(route.sameSeedReplayPassed, true, route.routeId);
    assert.ok(route.uniqueItemSetCount >= 2, route.routeId);
    assert.equal(route.maxMissingPromptCount, 0, route.routeId);
    assert.equal(route.maxDuplicatePromptCount, 0, route.routeId);
    assert.deepEqual(route.failureCodes, [], route.routeId);
    assert.equal(route.seedRuns.length, 10, route.routeId);
    for (const run of route.seedRuns) {
      assert.equal(run.ok, true, `${route.routeId}:${run.seed}`);
      assert.equal(run.questionCount, 20, `${route.routeId}:${run.seed}`);
      assert.equal(run.answerKeyItemCount, 20, `${route.routeId}:${run.seed}`);
      assert.equal(run.missingPromptCount, 0, `${route.routeId}:${run.seed}`);
      assert.equal(run.duplicatePromptCount, 0, `${route.routeId}:${run.seed}`);
      assert.notEqual(run.evidenceProjection, "none", `${route.routeId}:${run.seed}`);
    }
  }
});

test("PGC-R03 committed reports are complete and row-aligned", () => {
  const contract = loadContract();
  assert.equal(fs.existsSync(routeCsvPath), true);
  assert.equal(fs.existsSync(diversityCsvPath), true);
  assert.equal(fs.existsSync(mismatchPath), true);
  assert.equal(fs.readFileSync(routeCsvPath, "utf8").trim().split(/\r?\n/).length, contract.routes.length + 1);
  assert.equal(fs.readFileSync(diversityCsvPath, "utf8").trim().split(/\r?\n/).length, contract.routes.length + 1);
  const report = fs.readFileSync(mismatchPath, "utf8");
  assert.match(report, /NEXT_SHORTEST_STEP\s+= PGC-R04_NumericGenerationFullFix/);
  assert.match(report, /VERIFIED_20_ROUTES/);
});
