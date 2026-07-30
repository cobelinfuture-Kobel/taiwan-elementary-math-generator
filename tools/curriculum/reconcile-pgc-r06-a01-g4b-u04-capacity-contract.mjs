import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const publicDir = path.join(repoRoot, "data/curriculum/public-generation");
const docsDir = path.join(repoRoot, "docs/curriculum/output");
const contractPath = path.join(publicDir, "generator_capacity_contract.json");
const diagnosticsPath = path.join(publicDir, "PGC-R06-A01.g4b-u04-bounded-capacity-diagnostics.json");
const inventoryPath = path.join(publicDir, "PGC-R06.reasoning-mixed-pbl-inventory.json");
const reportPath = path.join(publicDir, "PGC-R06-A01.g4b-u04-capacity-contract-reconciliation.json");
const readbackPath = path.join(docsDir, "PGC-R06-A01_G4B_U04_CAPACITY_CONTRACT_CLOSEOUT.md");

const PROGRAM_ID = "PUBLIC_KP_GENERATION_CONFORMANCE_V1";
const TASK_ID = "PGC-R06-A01_BoundedCapacityReasoningMixedPBLRouteFullFix";
const SOURCE_ID = "g4b_u04_4b04";
const HARD_CEILING = 20;
const EXPECTED_ROUTE_COUNT = 15;
const LIVE_EVIDENCE_AUTHORITY = "PGC-R06-A01_G4B-U04_TWO_SEED_20_QUESTION_LIVE_RUNTIME";
const CLEARED_GAP_CODES = new Set([
  "CAPACITY_BELOW_20",
  "ZERO_SAFE_CAPACITY",
  "CROSS_SEED_ITEM_DIVERSITY_DEFICIENT",
  "FIXTURE_SELECTOR",
  "BOUNDED_DIVERSITY",
  "NON_DIVERSE_QUALITY_STATUS",
]);

const stableHash = (value) => crypto.createHash("sha256").update(String(value)).digest("hex");
const safeArray = (value) => Array.isArray(value) ? value : [];
const unique = (values) => [...new Set(safeArray(values).filter(Boolean))];
const clone = (value) => JSON.parse(JSON.stringify(value));

function readJson(filePath, code) {
  if (!fs.existsSync(filePath)) throw new Error(code);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function assertRun(routeId, run) {
  if (run?.ok !== true) throw new Error(`PGC_R06_A01_RECONCILIATION_BUILD_NOT_OK:${routeId}:${run?.seed}`);
  if (run.questionCount !== HARD_CEILING) throw new Error(`PGC_R06_A01_RECONCILIATION_QUESTION_COUNT:${routeId}:${run?.seed}`);
  if (run.answerKeyItemCount !== HARD_CEILING) throw new Error(`PGC_R06_A01_RECONCILIATION_ANSWER_COUNT:${routeId}:${run?.seed}`);
  if (run.emptyPromptCount !== 0 || run.duplicatePromptCount !== 0 || run.uniquePromptCount !== HARD_CEILING) {
    throw new Error(`PGC_R06_A01_RECONCILIATION_PROMPT_DIVERSITY:${routeId}:${run?.seed}`);
  }
  if (safeArray(run.errorCodes).length > 0 || safeArray(run.acceptanceFailures).length > 0) {
    throw new Error(`PGC_R06_A01_RECONCILIATION_RUNTIME_ERRORS:${routeId}:${run?.seed}`);
  }
  if (!run.worksheetSignature || !run.itemSetSignature) throw new Error(`PGC_R06_A01_RECONCILIATION_SIGNATURE_MISSING:${routeId}:${run?.seed}`);
}

function capacityRun(run) {
  return {
    seed: run.seed,
    requestedQuestionCount: HARD_CEILING,
    ok: run.ok,
    thrownError: run.thrownError ?? null,
    errorCodes: safeArray(run.errorCodes),
    evidenceProjection: run.evidenceProjection ?? null,
    questionCount: run.questionCount,
    answerKeyItemCount: run.answerKeyItemCount,
    missingPromptCount: run.emptyPromptCount,
    duplicatePromptCount: run.duplicatePromptCount,
    uniquePromptCount: run.uniquePromptCount,
    orderedWorksheetSignature: run.worksheetSignature,
    itemSetSignature: run.itemSetSignature,
    patternSpecIdsObserved: safeArray(run.patternSpecIdsObserved),
    knowledgePointIdsObserved: safeArray(run.knowledgePointIdsObserved),
    runtimeLineage: run.runtimeLineage ?? null,
  };
}

function routeSummary(routes) {
  const legal = safeArray(routes).filter((route) => route.legalRoute === true);
  return {
    routeCount: safeArray(routes).length,
    legalRouteCount: legal.length,
    illegalRouteCount: safeArray(routes).length - legal.length,
    verified20RouteCount: legal.filter((route) => route.verifiedMaxQuestionCount === HARD_CEILING).length,
    verifiedLimitedRouteCount: legal.filter((route) => route.verifiedMaxQuestionCount > 0 && route.verifiedMaxQuestionCount < HARD_CEILING).length,
    zeroCapacityRouteCount: legal.filter((route) => route.verifiedMaxQuestionCount === 0).length,
    diversityGapRouteCount: legal.filter((route) => route.qualityStatus !== "DIVERSE_PARAMETER_GENERATOR").length,
  };
}

function bindingSummary(bindings) {
  const available = safeArray(bindings).filter((binding) => Number(binding.availableRouteCount) > 0);
  return {
    currentLegalBindingCount: available.length,
    currentVerified20BindingCount: available.filter((binding) => binding.minimumVerifiedQuestionCount === HARD_CEILING).length,
    currentLimitedBindingCount: available.filter((binding) => binding.minimumVerifiedQuestionCount < HARD_CEILING).length,
    currentUnverifiedCapacityExposureCount: available.filter((binding) => !Number.isFinite(binding.minimumVerifiedQuestionCount)).length,
  };
}

function recomputeContractSummary(contract) {
  const counts = routeSummary(contract.routes);
  contract.summary = {
    ...contract.summary,
    ...bindingSummary(contract.historicalBindingEvidence),
    routeCount: counts.routeCount,
    legalRouteCount: counts.legalRouteCount,
    illegalRouteCount: counts.illegalRouteCount,
    verified20RouteCount: counts.verified20RouteCount,
    verifiedLimitedRouteCount: counts.verifiedLimitedRouteCount,
    zeroCapacityRouteCount: counts.zeroCapacityRouteCount,
    diversityGapRouteCount: counts.diversityGapRouteCount,
    hardBlockerCount: safeArray(contract.hardBlockers).length,
  };
  contract.downstreamGaps = [
    { code: "CAPACITY_BELOW_20", count: counts.verifiedLimitedRouteCount },
    { code: "CROSS_SEED_ITEM_DIVERSITY_DEFICIENT", count: counts.diversityGapRouteCount },
    { code: "ZERO_SAFE_CAPACITY", count: counts.zeroCapacityRouteCount },
  ].filter((row) => row.count > 0);
  contract.status = contract.downstreamGaps.length === 0 ? "PASS" : "PASS_WITH_DOWNSTREAM_GAPS";
}

function nextStepForQueue(queue) {
  const first = safeArray(queue)[0] ?? null;
  if (!first) return "PGC-R06_FinalContractReconciliationAndD0Closeout";
  if (safeArray(first.gapCodes).includes("ZERO_SAFE_CAPACITY") || safeArray(first.gapCodes).includes("CAPACITY_BELOW_20")) {
    return "PGC-R06-A02_BoundedCapacityReasoningMixedPBLRouteFullFix";
  }
  return "PGC-R06-A02_ReasoningMixedPBLDiversityFullFix";
}

function writeReadback(report) {
  const final = String(report.status).startsWith("PASS_R06_A01_G4BU04_15_BOUNDED_ROUTES_CONTRACT_RECONCILED_AND_CLOSED");
  const lines = [
    "# PGC-R06 A01 G4B-U04 Capacity Contract Closeout",
    "",
    "```text",
    `PROGRAM_ID = ${PROGRAM_ID}`,
    `TASK_ID    = ${TASK_ID}`,
    `STATUS     = ${report.status}`,
    "```",
    "",
    "## Reconciliation",
    "",
    "```text",
    `RECONCILED_ROUTE_COUNT = ${report.reconciledRouteIds.length}`,
    `UPDATED_BINDING_COUNT  = ${report.changedBindingIds.length}`,
    `VERIFIED_20_BEFORE     = ${report.targetBefore.verified20RouteCount}`,
    `VERIFIED_20_AFTER      = ${report.targetAfter.verified20RouteCount}`,
    `LIMITED_AFTER          = ${report.targetAfter.verifiedLimitedRouteCount}`,
    `DIVERSITY_GAPS_AFTER   = ${report.targetAfter.diversityGapRouteCount}`,
    "```",
    "",
    "## Frozen boundary",
    "",
    `- Non-target routes preserved: ${report.boundary.nonTargetRoutesPreserved}`,
    `- G4B-U04 PBL routes preserved: ${report.boundary.g4bU04PblRoutesPreserved}`,
    `- Unrelated bindings preserved: ${report.boundary.unrelatedBindingsPreserved}`,
    "- No second generator, validator, renderer or worksheet pipeline was introduced.",
    "",
    "## Distance",
    "",
    "```text",
    "GOAL_DISTANCE_BEFORE = D1_R06_G4B_U04_15_BOUNDED_ROUTES_LIVE_20_CONFORMANT_PENDING_CONTRACT_RECONCILIATION",
    `GOAL_DISTANCE_AFTER  = ${final ? "D1_R06_G4B_U04_BOUNDED_CAPACITY_CLOSED_AND_QUEUE_ADVANCED" : "D1_R06_G4B_U04_CONTRACT_RECONCILED_PENDING_QUEUE_REFRESH"}`,
    `DISTANCE_REDUCED     = ${final ? "15 G4B-U04 mixed/reasoning routes now have synchronized producer, validator, capacity contract, public binding, runtime consumer and live worksheet evidence" : "15 G4B-U04 route and binding contracts reconciled to verified capacity 20"}`,
    `REMAINING_BLOCKERS   = [${final ? `R06_REPAIR_QUEUE_${report.remainingRepairQueueCount}` : "R06_QUEUE_REFRESH_AND_FULL_REGRESSION"}]`,
    `NEXT_SHORTEST_STEP   = ${report.nextShortestStep}`,
    "```",
    "",
  ];
  fs.writeFileSync(readbackPath, `${lines.join("\n")}\n`);
}

function reconcile() {
  const contract = readJson(contractPath, "PGC_R06_A01_CAPACITY_CONTRACT_MISSING");
  const diagnostics = readJson(diagnosticsPath, "PGC_R06_A01_DIAGNOSTICS_MISSING");
  if (contract.schemaName !== "PublicGeneratorCapacityContractV3") throw new Error(`PGC_R06_A01_CAPACITY_SCHEMA_INVALID:${contract.schemaName}`);
  if (diagnostics.summary?.targetRouteCount !== EXPECTED_ROUTE_COUNT
    || diagnostics.summary?.live20PassRouteCount !== EXPECTED_ROUTE_COUNT
    || diagnostics.summary?.live20FailRouteCount !== 0) {
    throw new Error("PGC_R06_A01_LIVE_15_OF_15_REQUIRED");
  }

  const diagnosticById = new Map(safeArray(diagnostics.routes).map((route) => [route.routeId, route]));
  const targetIds = new Set(diagnosticById.keys());
  if (targetIds.size !== EXPECTED_ROUTE_COUNT) throw new Error(`PGC_R06_A01_DIAGNOSTIC_ROUTE_COUNT_INVALID:${targetIds.size}`);
  const routesBefore = clone(contract.routes);
  const targetBeforeRoutes = routesBefore.filter((route) => targetIds.has(route.routeId));
  if (targetBeforeRoutes.length !== EXPECTED_ROUTE_COUNT) throw new Error(`PGC_R06_A01_CONTRACT_TARGET_COUNT_INVALID:${targetBeforeRoutes.length}`);
  const targetBefore = routeSummary(targetBeforeRoutes);
  const nonTargetBeforeHash = stableHash(JSON.stringify(routesBefore.filter((route) => !targetIds.has(route.routeId))));
  const g4bU04PblBeforeHash = stableHash(JSON.stringify(routesBefore.filter((route) => route.sourceId === SOURCE_ID && route.questionType === "pbl")));
  const reconciledRouteIds = [];

  contract.routes = routesBefore.map((route) => {
    if (!targetIds.has(route.routeId)) return route;
    if (route.sourceId !== SOURCE_ID || !["mixed", "reasoning"].includes(route.questionType) || route.legalRoute !== true) {
      throw new Error(`PGC_R06_A01_TARGET_SCOPE_INVALID:${route.routeId}`);
    }
    const diagnostic = diagnosticById.get(route.routeId);
    if (diagnostic?.liveAccepted20AcrossSeeds !== true || safeArray(diagnostic.liveFailureCodes).length > 0) {
      throw new Error(`PGC_R06_A01_ACCEPTED_DIAGNOSTIC_REQUIRED:${route.routeId}`);
    }
    const runs = safeArray(diagnostic.diagnosticRuns);
    if (runs.length !== 2) throw new Error(`PGC_R06_A01_TWO_DIAGNOSTIC_RUNS_REQUIRED:${route.routeId}`);
    for (const run of runs) assertRun(route.routeId, run);
    const orderedSignatures = unique(runs.map((run) => run.worksheetSignature));
    const itemSetSignatures = unique(runs.map((run) => run.itemSetSignature));
    if (itemSetSignatures.length !== 2) throw new Error(`PGC_R06_A01_CROSS_SEED_ITEM_SET_DIVERSITY_REQUIRED:${route.routeId}`);
    const capacityRuns = runs.map(capacityRun);
    reconciledRouteIds.push(route.routeId);
    return {
      ...route,
      verifiedMaxQuestionCount: HARD_CEILING,
      capacityStatus: "VERIFIED_20",
      qualityStatus: "DIVERSE_PARAMETER_GENERATOR",
      uniqueItemSetCount: Math.max(Number(route.uniqueItemSetCount) || 0, itemSetSignatures.length),
      uniqueOrderedWorksheetCount: Math.max(Number(route.uniqueOrderedWorksheetCount) || 0, orderedSignatures.length),
      reconciliationCodes: unique([
        ...safeArray(route.reconciliationCodes),
        "PGC_R06_A01_LIVE_20_CAPACITY_RECONCILED",
        "PGC_R06_A01_PER_WORKSHEET_PROMPT_DIVERSITY_RECONCILED",
        "PGC_R06_A01_CROSS_SEED_ITEM_SET_DIVERSITY_RECONCILED",
      ]),
      selectedCapacityEvidence: {
        evidenceAuthority: LIVE_EVIDENCE_AUTHORITY,
        questionCount: HARD_CEILING,
        diagnosticSeedCount: runs.length,
        runs: capacityRuns,
        replay: capacityRuns[0],
        passed: true,
      },
      downstreamGapCodes: unique(safeArray(route.downstreamGapCodes).filter((code) => !CLEARED_GAP_CODES.has(code))),
    };
  });
  if (reconciledRouteIds.length !== EXPECTED_ROUTE_COUNT) throw new Error(`PGC_R06_A01_RECONCILED_ROUTE_COUNT_INVALID:${reconciledRouteIds.length}`);

  const routeById = new Map(contract.routes.map((route) => [route.routeId, route]));
  const bindingsBefore = clone(contract.historicalBindingEvidence);
  const unrelatedBindingsBeforeHash = stableHash(JSON.stringify(bindingsBefore.filter((binding) => !safeArray(binding.routeIds).some((id) => targetIds.has(id)))));
  const changedBindingIds = [];
  contract.historicalBindingEvidence = bindingsBefore.map((binding) => {
    if (!safeArray(binding.routeIds).some((id) => targetIds.has(id))) return binding;
    const available = safeArray(binding.routeIds).map((id) => routeById.get(id)).filter((route) => route?.legalRoute === true);
    const counts = available.map((route) => route.verifiedMaxQuestionCount);
    const updated = {
      ...binding,
      accountedRouteCount: safeArray(binding.routeIds).length,
      availableRouteCount: available.length,
      minimumVerifiedQuestionCount: counts.length > 0 ? Math.min(...counts) : 0,
      maximumVerifiedQuestionCount: counts.length > 0 ? Math.max(...counts) : 0,
    };
    if (JSON.stringify(updated) !== JSON.stringify(binding)) changedBindingIds.push(binding.bindingId);
    return updated;
  });

  recomputeContractSummary(contract);
  contract.lastR06Reconciliation = {
    programId: PROGRAM_ID,
    taskId: TASK_ID,
    evidenceAuthority: LIVE_EVIDENCE_AUTHORITY,
    sourceId: SOURCE_ID,
    reconciledRouteCount: reconciledRouteIds.length,
    hardCeiling: HARD_CEILING,
    diagnosticSeeds: safeArray(diagnostics.diagnosticSeeds),
    status: "PASS_R06_A01_G4BU04_CAPACITY_CONTRACT_RECONCILED",
  };

  const targetAfter = routeSummary(contract.routes.filter((route) => targetIds.has(route.routeId)));
  if (targetAfter.verified20RouteCount !== EXPECTED_ROUTE_COUNT
    || targetAfter.verifiedLimitedRouteCount !== 0
    || targetAfter.zeroCapacityRouteCount !== 0
    || targetAfter.diversityGapRouteCount !== 0) {
    throw new Error(`PGC_R06_A01_TARGET_CONTRACT_NOT_CLOSED:${JSON.stringify(targetAfter)}`);
  }
  const boundary = {
    nonTargetRoutesBeforeHash: nonTargetBeforeHash,
    nonTargetRoutesAfterHash: stableHash(JSON.stringify(contract.routes.filter((route) => !targetIds.has(route.routeId)))),
    nonTargetRoutesPreserved: false,
    g4bU04PblRoutesBeforeHash: g4bU04PblBeforeHash,
    g4bU04PblRoutesAfterHash: stableHash(JSON.stringify(contract.routes.filter((route) => route.sourceId === SOURCE_ID && route.questionType === "pbl"))),
    g4bU04PblRoutesPreserved: false,
    unrelatedBindingsBeforeHash,
    unrelatedBindingsAfterHash: stableHash(JSON.stringify(contract.historicalBindingEvidence.filter((binding) => !safeArray(binding.routeIds).some((id) => targetIds.has(id))))),
    unrelatedBindingsPreserved: false,
    generatorModified: false,
    validatorModified: false,
    rendererModified: false,
    secondWorksheetPipelineAdded: false,
  };
  boundary.nonTargetRoutesPreserved = boundary.nonTargetRoutesBeforeHash === boundary.nonTargetRoutesAfterHash;
  boundary.g4bU04PblRoutesPreserved = boundary.g4bU04PblRoutesBeforeHash === boundary.g4bU04PblRoutesAfterHash;
  boundary.unrelatedBindingsPreserved = boundary.unrelatedBindingsBeforeHash === boundary.unrelatedBindingsAfterHash;
  if (!boundary.nonTargetRoutesPreserved || !boundary.g4bU04PblRoutesPreserved || !boundary.unrelatedBindingsPreserved) {
    throw new Error("PGC_R06_A01_FROZEN_BOUNDARY_VIOLATION");
  }

  const report = {
    schemaName: "PgcR06A01G4BU04CapacityContractReconciliationV1",
    schemaVersion: 1,
    programId: PROGRAM_ID,
    taskId: TASK_ID,
    status: "PASS_R06_A01_G4BU04_CAPACITY_CONTRACT_RECONCILED_PENDING_QUEUE_REFRESH",
    sourceContract: "data/curriculum/public-generation/generator_capacity_contract.json",
    sourceDiagnostics: "data/curriculum/public-generation/PGC-R06-A01.g4b-u04-bounded-capacity-diagnostics.json",
    evidenceAuthority: LIVE_EVIDENCE_AUTHORITY,
    targetBefore,
    targetAfter,
    overallSummaryAfter: clone(contract.summary),
    reconciledRouteIds,
    changedBindingIds,
    boundary,
    remainingRepairQueueCount: null,
    nextRepairRoute: null,
    nextShortestStep: "PGC-R06-A01_RefreshRepairQueueAndCloseout",
  };
  fs.writeFileSync(contractPath, `${JSON.stringify(contract, null, 2)}\n`);
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  writeReadback(report);
  console.log(`PGC_R06_A01_CONTRACT_RECONCILIATION=${JSON.stringify({ status: report.status, targetAfter, changedBindingCount: changedBindingIds.length })}`);
  return report;
}

function finalize() {
  const report = readJson(reportPath, "PGC_R06_A01_RECONCILIATION_REPORT_MISSING");
  const inventory = readJson(inventoryPath, "PGC_R06_A01_REFRESHED_INVENTORY_MISSING");
  const remainingTargetRoutes = safeArray(inventory.repairQueue).filter((route) => report.reconciledRouteIds.includes(route.routeId));
  if (remainingTargetRoutes.length !== 0) throw new Error(`PGC_R06_A01_TARGET_ROUTES_STILL_IN_QUEUE:${remainingTargetRoutes.length}`);
  const remainingG4BU04 = safeArray(inventory.repairQueue).filter((route) => route.sourceId === SOURCE_ID);
  if (remainingG4BU04.some((route) => safeArray(route.gapCodes).includes("CAPACITY_BELOW_20") || safeArray(route.gapCodes).includes("ZERO_SAFE_CAPACITY"))) {
    throw new Error("PGC_R06_A01_G4BU04_BOUNDED_CAPACITY_GAP_REMAINS");
  }
  if (remainingG4BU04.some((route) => route.questionType !== "pbl")) throw new Error("PGC_R06_A01_G4BU04_NON_PBL_REPAIR_ROUTE_REMAINS");
  const first = safeArray(inventory.repairQueue)[0] ?? null;
  const finalReport = {
    ...report,
    status: "PASS_R06_A01_G4BU04_15_BOUNDED_ROUTES_CONTRACT_RECONCILED_AND_CLOSED",
    refreshedInventoryStatus: inventory.status,
    refreshedInventorySummary: clone(inventory.summary),
    remainingRepairQueueCount: inventory.summary?.repairQueueCount ?? safeArray(inventory.repairQueue).length,
    remainingG4BU04RepairRouteCount: remainingG4BU04.length,
    nextRepairRoute: first ? {
      routeId: first.routeId,
      sourceId: first.sourceId,
      questionType: first.questionType,
      gapCodes: safeArray(first.gapCodes),
    } : null,
    nextShortestStep: nextStepForQueue(inventory.repairQueue),
  };
  fs.writeFileSync(reportPath, `${JSON.stringify(finalReport, null, 2)}\n`);
  writeReadback(finalReport);
  console.log(`PGC_R06_A01_CLOSEOUT=${JSON.stringify({ status: finalReport.status, remainingRepairQueueCount: finalReport.remainingRepairQueueCount, nextRepairRoute: finalReport.nextRepairRoute, nextShortestStep: finalReport.nextShortestStep })}`);
  return finalReport;
}

export { finalize as finalizePgcR06A01G4BU04CapacityContract, reconcile as reconcilePgcR06A01G4BU04CapacityContract };

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (process.argv.includes("--finalize")) finalize();
  else reconcile();
}
