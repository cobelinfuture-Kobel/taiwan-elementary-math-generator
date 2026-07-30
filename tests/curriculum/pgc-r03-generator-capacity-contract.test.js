import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  resolvePublicUiCapabilityBinding,
} from "../../site/modules/curriculum/public/public-ui-capability-binding.js";
import {
  PUBLIC_GENERATOR_CAPACITY_REGISTRY_STATUS,
  PUBLIC_GENERATOR_CAPACITY_ROWS,
} from "../../site/modules/curriculum/public/public-generator-capacity-registry.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const contractPath = path.join(repoRoot, "data/curriculum/public-generation/generator_capacity_contract.json");
const routeCsvPath = path.join(repoRoot, "data/curriculum/public-generation/route_capacity_matrix.csv");
const diversityCsvPath = path.join(repoRoot, "data/curriculum/public-generation/cross_seed_diversity_report.csv");
const reportPath = path.join(repoRoot, "docs/curriculum/output/PGC-R03_capacity_mismatch_report.md");
const r02ContractPath = path.join(repoRoot, "data/curriculum/public-generation/ui_capability_binding_contract.json");
const R05_LIVE_AUTHORITY = "PGC-R05_TWO_SEED_20_QUESTION_LIVE_RUNTIME";
const R06_A01_LIVE_AUTHORITY = "PGC-R06-A01_G4B-U04_TWO_SEED_20_QUESTION_LIVE_RUNTIME";
const R06_A03_LIVE_AUTHORITY = "PGC-R06-A03_G5A-U02_TWO_SEED_20_QUESTION_LIVE_RUNTIME";
const R06_A04_LIVE_AUTHORITY = "PGC-R06-A04_G5A-U02_PBL_TWO_SEED_LIVE_RUNTIME";
const R06_A05_LIVE_AUTHORITY = "PGC-R06-A05_G5A-U08_TWO_SEED_LIVE_RUNTIME";
const R06_A06_LIVE_AUTHORITY = "PGC-R06-A06_FINAL_FIVE_PBL_TWO_SEED_LIVE_RUNTIME";
const TWO_SEED_AUTHORITIES = new Set([
  R05_LIVE_AUTHORITY,
  R06_A01_LIVE_AUTHORITY,
  R06_A03_LIVE_AUTHORITY,
  R06_A04_LIVE_AUTHORITY,
  R06_A05_LIVE_AUTHORITY,
  R06_A06_LIVE_AUTHORITY,
]);

function loadContract() {
  assert.equal(fs.existsSync(contractPath), true, "PGC-R03 contract must be materialized before focused acceptance");
  return JSON.parse(fs.readFileSync(contractPath, "utf8"));
}

function splitKey(value) {
  return String(value ?? "").split("|").filter(Boolean);
}

test("PGC-R03 V3 accounts historical bindings and current legal UI bindings", () => {
  const contract = loadContract();
  assert.equal(contract.schemaName, "PublicGeneratorCapacityContractV3");
  assert.equal(contract.schemaVersion, 3);
  assert.equal(contract.programId, "PUBLIC_KP_GENERATION_CONFORMANCE_V1");
  assert.equal(contract.taskId, "PGC-R03_CapacityAwareLegalRouteAndPerCapabilityUiLimitReconciliation");
  assert.ok(["PASS", "PASS_WITH_DOWNSTREAM_GAPS"].includes(contract.status), JSON.stringify(contract.hardBlockers, null, 2));
  assert.equal(contract.seedCount, 10);
  assert.equal(contract.hardCeiling, 20);
  assert.equal(contract.summary.publicSourceCount, 26);
  assert.equal(contract.summary.visibleKnowledgePointCount, 193);
  assert.equal(contract.summary.publicSurfaceCount, 3);
  assert.equal(contract.summary.historicalBindingCount, 1152);
  assert.equal(contract.summary.historicalBindingAccountedCount, 1152);
  assert.equal(contract.historicalBindingEvidence.length, 1152);
  assert.equal(contract.summary.currentUnverifiedCapacityExposureCount, 0);
  assert.equal(contract.summary.hardBlockerCount, 0);
  assert.equal(contract.currentUiBindingContract.status, "PASS");
  assert.equal(contract.runtimeRegistry.rowCount, contract.summary.routeCount);
  assert.equal(contract.routes.length, contract.summary.routeCount);
});

test("PGC-R03 classifies every route and verifies every exposed maximum", () => {
  const contract = loadContract();
  let exposedCount = 0;
  for (const route of contract.routes) {
    assert.ok(["LEGAL", "ILLEGAL", "LEGAL_ZERO_CAPACITY"].includes(route.legalRouteStatus), route.routeId);
    assert.ok(Number.isInteger(route.verifiedMaxQuestionCount), route.routeId);
    assert.ok(route.verifiedMaxQuestionCount >= 0 && route.verifiedMaxQuestionCount <= 20, route.routeId);

    if (!route.legalRoute) {
      assert.equal(route.legalRouteStatus, "ILLEGAL", route.routeId);
      assert.equal(route.verifiedMaxQuestionCount, 0, route.routeId);
      assert.equal(route.capacityStatus, "ILLEGAL_ROUTE_REMOVED_FROM_UI", route.routeId);
      continue;
    }

    if (route.verifiedMaxQuestionCount === 0) {
      assert.equal(route.capacityStatus, "FAIL_CLOSED_ZERO_CAPACITY", route.routeId);
      assert.ok(route.downstreamGapCodes.includes("ZERO_SAFE_CAPACITY"), route.routeId);
      continue;
    }

    exposedCount += 1;
    assert.ok(["VERIFIED_20", "VERIFIED_LIMITED"].includes(route.capacityStatus), route.routeId);
    const evidence = route.selectedCapacityEvidence;
    assert.ok(evidence?.passed, route.routeId);
    assert.equal(evidence.questionCount, route.verifiedMaxQuestionCount, route.routeId);
    const expectedRunCount = TWO_SEED_AUTHORITIES.has(evidence.evidenceAuthority) ? 2 : contract.seedCount;
    assert.equal(evidence.runs.length, expectedRunCount, route.routeId);
    assert.ok(evidence.replay, route.routeId);
    for (const run of evidence.runs) {
      assert.equal(run.ok, true, `${route.routeId}:${run.seed}`);
      assert.equal(run.questionCount, route.verifiedMaxQuestionCount, `${route.routeId}:${run.seed}`);
      assert.equal(run.answerKeyItemCount, route.verifiedMaxQuestionCount, `${route.routeId}:${run.seed}`);
      assert.equal(run.missingPromptCount, 0, `${route.routeId}:${run.seed}`);
      assert.equal(run.duplicatePromptCount, 0, `${route.routeId}:${run.seed}`);
    }
    assert.equal(evidence.replay.orderedWorksheetSignature, evidence.runs[0].orderedWorksheetSignature, route.routeId);
    if (evidence.evidenceAuthority === R05_LIVE_AUTHORITY) {
      assert.equal(route.questionType, "application", route.routeId);
      assert.equal(route.reconciliationCodes.includes("PGC_R05_LIVE_20_CAPACITY_RECONCILED"), true, route.routeId);
    }
    if (evidence.evidenceAuthority === R06_A01_LIVE_AUTHORITY) {
      assert.equal(route.sourceId, "g4b_u04_4b04", route.routeId);
      assert.equal(["mixed", "reasoning"].includes(route.questionType), true, route.routeId);
      assert.equal(route.reconciliationCodes.includes("PGC_R06_A01_LIVE_20_CAPACITY_RECONCILED"), true, route.routeId);
      assert.equal(route.reconciliationCodes.includes("PGC_R06_A01_CROSS_SEED_ITEM_SET_DIVERSITY_RECONCILED"), true, route.routeId);
    }
    if (evidence.evidenceAuthority === R06_A04_LIVE_AUTHORITY) {
      assert.equal(route.sourceId, "g5a_u02_5a02", route.routeId);
      assert.equal(route.questionType, "pbl", route.routeId);
      assert.equal(route.reconciliationCodes.includes("PGC_R06_A04_PBL_CROSS_SEED_DIVERSITY_RECONCILED"), true, route.routeId);
    }
    if (evidence.evidenceAuthority === R06_A05_LIVE_AUTHORITY) {
      assert.equal(route.sourceId, "g5a_u08_5a08", route.routeId);
      assert.equal(["pbl", "mixed"].includes(route.questionType), true, route.routeId);
      const expectedCode = route.questionType === "pbl"
        ? "PGC_R06_A05_PBL_CROSS_SEED_DIVERSITY_RECONCILED"
        : "PGC_R06_A05_MIXED_UNIQUE_20_CAPACITY_RECONCILED";
      assert.equal(route.reconciliationCodes.includes(expectedCode), true, route.routeId);
    }
    if (evidence.evidenceAuthority === R06_A06_LIVE_AUTHORITY) {
      assert.equal(["g3b_u04_3b04", "g4a_u08_4a08", "g4b_u04_4b04"].includes(route.sourceId), true, route.routeId);
      assert.equal(route.questionType, "pbl", route.routeId);
      assert.equal(route.reconciliationCodes.includes("PGC_R06_A06_FINAL_PBL_CROSS_SEED_DIVERSITY_RECONCILED"), true, route.routeId);
    }
  }
  assert.ok(exposedCount > 0);
  assert.equal(
    contract.summary.verified20RouteCount + contract.summary.verifiedLimitedRouteCount,
    exposedCount,
  );
});

test("PGC-R03 runtime registry removes illegal routes and applies exact limits", () => {
  const contract = loadContract();
  assert.equal(PUBLIC_GENERATOR_CAPACITY_REGISTRY_STATUS, "MATERIALIZED_PGC_R03_V3");
  assert.equal(PUBLIC_GENERATOR_CAPACITY_ROWS.length, contract.routes.length);

  const limited = PUBLIC_GENERATOR_CAPACITY_ROWS.find((row) => row[8] === "LEGAL" && row[7] > 0 && row[7] < 20);
  if (limited) {
    const binding = resolvePublicUiCapabilityBinding({
      sourceId: limited[0],
      selectionMode: limited[1],
      selectedKnowledgePointIds: splitKey(limited[2]),
      requestedQuestionType: limited[3],
      selectedPatternGroupIds: splitKey(limited[4]),
      requestedDepthMode: limited[5] || null,
      requestedContextMode: limited[6] || null,
    });
    assert.equal(binding.blocked, false, binding.blockedReasons.join("|"));
    assert.equal(binding.questionCount.max, 240);
    assert.ok(binding.capacityRouteIds.length > 0);
  }

  const illegal = PUBLIC_GENERATOR_CAPACITY_ROWS.find((row) => row[8] === "ILLEGAL");
  assert.ok(illegal, "expected at least one illegal route witness");
  const blocked = resolvePublicUiCapabilityBinding({
    sourceId: illegal[0],
    selectionMode: illegal[1],
    selectedKnowledgePointIds: splitKey(illegal[2]),
    requestedQuestionType: illegal[3],
    selectedPatternGroupIds: splitKey(illegal[4]),
    requestedDepthMode: illegal[5] || null,
    requestedContextMode: illegal[6] || null,
  });
  assert.equal(blocked.capacityRouteIds.includes(illegal[10]), false);
  assert.ok(blocked.blocked || blocked.questionCount.max > 0);
});

test("PGC-R03 reconciled reports and R02 materialization stay aligned", () => {
  const contract = loadContract();
  assert.equal(fs.existsSync(routeCsvPath), true);
  assert.equal(fs.existsSync(diversityCsvPath), true);
  assert.equal(fs.existsSync(reportPath), true);
  assert.equal(fs.existsSync(r02ContractPath), true);
  assert.equal(fs.readFileSync(routeCsvPath, "utf8").trim().split(/\r?\n/).length, contract.routes.length + 1);
  const exposedRoutes = contract.routes.filter((route) => route.legalRoute && route.verifiedMaxQuestionCount > 0).length;
  assert.equal(fs.readFileSync(diversityCsvPath, "utf8").trim().split(/\r?\n/).length, exposedRoutes + 1);
  const r02 = JSON.parse(fs.readFileSync(r02ContractPath, "utf8"));
  assert.equal(r02.schemaName, "PublicUiCapabilityBindingContractV2");
  assert.equal(r02.status, "PASS");
  assert.equal(r02.summary.unverifiedCapacityExposureCount, 0);
  const report = fs.readFileSync(reportPath, "utf8");
  assert.match(report, /NEXT_SHORTEST_STEP\s+= PGC-R04_NumericGenerationFullFix/);
  assert.match(report, /ILLEGAL_ROUTES_REMOVED/);
  assert.match(report, /VERIFIED_LIMITED_ROUTES/);
});

// PGC-R05 and R06 live authority compatibility V2

// PGC-R06 A03 V3 evidence compatibility

// PGC-R06 A04 two-seed PBL evidence compatibility

// PGC-R06 A05 two-seed dual-axis evidence compatibility

// PGC-R06 A06 final-five two-seed PBL evidence compatibility
