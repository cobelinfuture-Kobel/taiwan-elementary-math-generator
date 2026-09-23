import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const contractPath = path.join(repoRoot, "data/curriculum/public-generation/generator_capacity_contract.json");
const diagnosticsPath = path.join(repoRoot, "data/curriculum/public-generation/PGC-R05.application-gap-diagnostics.json");
const reportPath = path.join(repoRoot, "data/curriculum/public-generation/PGC-R05.capacity-contract-reconciliation.json");
const readbackPath = path.join(repoRoot, "docs/curriculum/output/PGC-R05_CAPACITY_CONTRACT_RECONCILIATION_D0_CLOSEOUT.md");

const PROGRAM_ID = "PUBLIC_KP_GENERATION_CONFORMANCE_V1";
const TASK_ID = "PGC-R05_CapacityContractReconciliationAndD0Closeout";
const APPLICATION = "application";
const HARD_CEILING = 20;
const EXPECTED_LEGAL_APPLICATION_ROUTES = 211;
const LIVE_EVIDENCE_AUTHORITY = "PGC-R05_TWO_SEED_20_QUESTION_LIVE_RUNTIME";
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
const unique = (values) => [...new Set(values.filter(Boolean))];
const clone = (value) => JSON.parse(JSON.stringify(value));

function readJson(filePath, missingCode) {
  if (!fs.existsSync(filePath)) throw new Error(missingCode);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function assertLiveRun(routeId, run) {
  if (run?.ok !== true) throw new Error(`PGC_R05_RECONCILIATION_BUILD_NOT_OK:${routeId}:${run?.seed}`);
  if (run.questionCount !== HARD_CEILING) throw new Error(`PGC_R05_RECONCILIATION_QUESTION_COUNT:${routeId}:${run?.seed}`);
  if (run.answerKeyItemCount !== HARD_CEILING) throw new Error(`PGC_R05_RECONCILIATION_ANSWER_COUNT:${routeId}:${run?.seed}`);
  if (run.emptyPromptCount !== 0) throw new Error(`PGC_R05_RECONCILIATION_EMPTY_PROMPT:${routeId}:${run?.seed}`);
  if (run.duplicatePromptCount !== 0 || run.uniquePromptCount !== HARD_CEILING) {
    throw new Error(`PGC_R05_RECONCILIATION_DUPLICATE_PROMPT:${routeId}:${run?.seed}`);
  }
  if (safeArray(run.errorCodes).length !== 0) throw new Error(`PGC_R05_RECONCILIATION_RUNTIME_ERRORS:${routeId}:${run?.seed}`);
  if (!run.worksheetSignature) throw new Error(`PGC_R05_RECONCILIATION_WORKSHEET_SIGNATURE_MISSING:${routeId}:${run?.seed}`);
  if (!run.itemSetSignature) throw new Error(`PGC_R05_RECONCILIATION_ITEM_SET_SIGNATURE_MISSING:${routeId}:${run?.seed}`);
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
  const legal = routes.filter((route) => route.legalRoute === true);
  return {
    routeCount: routes.length,
    legalRouteCount: legal.length,
    illegalRouteCount: routes.length - legal.length,
    verified20RouteCount: legal.filter((route) => route.verifiedMaxQuestionCount === HARD_CEILING).length,
    verifiedLimitedRouteCount: legal.filter((route) => route.verifiedMaxQuestionCount > 0 && route.verifiedMaxQuestionCount < HARD_CEILING).length,
    zeroCapacityRouteCount: legal.filter((route) => route.verifiedMaxQuestionCount === 0).length,
    diversityGapRouteCount: legal.filter((route) => route.qualityStatus !== "DIVERSE_PARAMETER_GENERATOR").length,
  };
}

function bindingSummary(bindings) {
  const available = bindings.filter((binding) => Number(binding.availableRouteCount) > 0);
  return {
    currentLegalBindingCount: available.length,
    currentVerified20BindingCount: available.filter((binding) => binding.minimumVerifiedQuestionCount === HARD_CEILING).length,
    currentLimitedBindingCount: available.filter((binding) => binding.minimumVerifiedQuestionCount < HARD_CEILING).length,
    currentUnverifiedCapacityExposureCount: available.filter((binding) => !Number.isFinite(binding.minimumVerifiedQuestionCount)).length,
  };
}

function recomputeContractSummary(contract) {
  const routes = safeArray(contract.routes);
  const routeCounts = routeSummary(routes);
  const bindings = safeArray(contract.historicalBindingEvidence);
  const bindingCounts = bindingSummary(bindings);
  contract.summary = {
    ...contract.summary,
    ...bindingCounts,
    routeCount: routeCounts.routeCount,
    legalRouteCount: routeCounts.legalRouteCount,
    illegalRouteCount: routeCounts.illegalRouteCount,
    verified20RouteCount: routeCounts.verified20RouteCount,
    verifiedLimitedRouteCount: routeCounts.verifiedLimitedRouteCount,
    zeroCapacityRouteCount: routeCounts.zeroCapacityRouteCount,
    diversityGapRouteCount: routeCounts.diversityGapRouteCount,
    hardBlockerCount: safeArray(contract.hardBlockers).length,
  };
  contract.downstreamGaps = [
    { code: "CAPACITY_BELOW_20", count: routeCounts.verifiedLimitedRouteCount },
    { code: "CROSS_SEED_ITEM_DIVERSITY_DEFICIENT", count: routeCounts.diversityGapRouteCount },
    { code: "ZERO_SAFE_CAPACITY", count: routeCounts.zeroCapacityRouteCount },
  ].filter((row) => row.count > 0);
  contract.status = contract.downstreamGaps.length === 0 ? "PASS" : "PASS_WITH_DOWNSTREAM_GAPS";
}

function writeReadback(report) {
  const final = report.status === "PASS_R05_D0_CAPACITY_CONTRACT_RECONCILED_AND_ALL_LIVE_APPLICATION_ROUTES_CONFORMANT_WITH_RETAINED_CROSS_SEED_QUALITY_GAPS";
  const lines = [
    "# PGC-R05 Capacity Contract Reconciliation and D0 Closeout",
    "",
    "```text",
    `PROGRAM_ID = ${PROGRAM_ID}`,
    `TASK_ID    = ${TASK_ID}`,
    `STATUS     = ${report.status}`,
    "```",
    "",
    "## Application authority",
    "",
    "```text",
    `LEGAL_APPLICATION_ROUTES       = ${report.applicationAfter.legalRouteCount}`,
    `VERIFIED_20_APPLICATION_ROUTES = ${report.applicationAfter.verified20RouteCount}`,
    `LIMITED_APPLICATION_ROUTES     = ${report.applicationAfter.verifiedLimitedRouteCount}`,
    `ZERO_CAPACITY_APPLICATION      = ${report.applicationAfter.zeroCapacityRouteCount}`,
    `DIVERSITY_GAP_APPLICATION      = ${report.applicationAfter.diversityGapRouteCount}`,
    `RECONCILED_ROUTE_COUNT         = ${report.reconciledRouteIds.length}`,
    `UPDATED_BINDING_COUNT          = ${report.changedBindingIds.length}`,
    "```",
    "",
    "## Frozen boundary",
    "",
    `- Non-application route hash preserved: ${report.boundary.nonApplicationRoutesPreserved}`,
    `- Illegal application route hash preserved: ${report.boundary.illegalApplicationRoutesPreserved}`,
    `- Unrelated binding hash preserved: ${report.boundary.unrelatedBindingsPreserved}`,
    "- No generator, validator, renderer, Global Context, PatternSpec, PatternGroup or KnowledgePoint authority was replaced.",
    "",
    "## Distance",
    "",
    "```text",
    "GOAL_DISTANCE_BEFORE = D1_R05_211_OF_211_LIVE_APPLICATION_ROUTES_CONFORMANT_PENDING_CONTRACT_RECONCILIATION",
    `GOAL_DISTANCE_AFTER  = ${final ? "D0_R05_APPLICATION_GENERATION_CONFORMANT_AND_CONTRACT_RECONCILED" : "D1_R05_CONTRACT_RECONCILED_PENDING_FINAL_DIAGNOSTICS"}`,
    `DISTANCE_REDUCED     = ${final ? "211/211 legal application routes now have synchronized live runtime, capacity contract, quality status, public-surface limits and deterministic readback evidence" : "211 legal application route capacity and quality records reconciled; final deterministic diagnostics pending"}`,
    `REMAINING_BLOCKERS   = [${final ? "NONE" : "FINAL_DIAGNOSTICS_AND_FULL_REGRESSION"}]`,
    `NEXT_SHORTEST_STEP   = ${final ? "PGC-R06_ReasoningMixedPBLGenerationConformance" : "PGC-R05_FinalDiagnosticsAndD0Gate"}`,
    "```",
    "",
  ];
  fs.writeFileSync(readbackPath, `${lines.join("\n")}\n`);
}

function reconcile() {
  const contract = readJson(contractPath, "PGC_R05_CAPACITY_CONTRACT_MISSING");
  const diagnostics = readJson(diagnosticsPath, "PGC_R05_DIAGNOSTICS_MISSING");
  if (contract.schemaName !== "PublicGeneratorCapacityContractV3") throw new Error(`PGC_R05_CAPACITY_SCHEMA_INVALID:${contract.schemaName}`);
  if (diagnostics.summary?.legalApplicationRouteCount !== EXPECTED_LEGAL_APPLICATION_ROUTES) throw new Error("PGC_R05_LEGAL_APPLICATION_ROUTE_COUNT_INVALID");
  if (diagnostics.summary?.live20PassRouteCount !== EXPECTED_LEGAL_APPLICATION_ROUTES || diagnostics.summary?.live20FailRouteCount !== 0) {
    throw new Error("PGC_R05_LIVE_211_OF_211_REQUIRED");
  }

  const diagnosticById = new Map(safeArray(diagnostics.routes).map((route) => [route.routeId, route]));
  const routesBefore = clone(safeArray(contract.routes));
  const nonApplicationBeforeHash = stableHash(JSON.stringify(routesBefore.filter((route) => route.questionType !== APPLICATION)));
  const illegalApplicationBeforeHash = stableHash(JSON.stringify(routesBefore.filter((route) => route.questionType === APPLICATION && route.legalRoute !== true)));
  const applicationBefore = routeSummary(routesBefore.filter((route) => route.questionType === APPLICATION));
  const reconciledRouteIds = [];

  contract.routes = routesBefore.map((route) => {
    if (route.questionType !== APPLICATION || route.legalRoute !== true) return route;
    const diagnostic = diagnosticById.get(route.routeId);
    if (!diagnostic || diagnostic.accepted20AcrossSeeds !== true || safeArray(diagnostic.liveAcceptanceFailures).length !== 0) {
      throw new Error(`PGC_R05_ACCEPTED_DIAGNOSTIC_REQUIRED:${route.routeId}`);
    }
    const runs = safeArray(diagnostic.diagnosticRuns);
    if (runs.length !== 2) throw new Error(`PGC_R05_TWO_DIAGNOSTIC_RUNS_REQUIRED:${route.routeId}`);
    for (const run of runs) assertLiveRun(route.routeId, run);
    const qualityUpgradeRequired = route.qualityStatus !== "DIVERSE_PARAMETER_GENERATOR";
    const orderedWorksheetSignatures = unique(runs.map((run) => run.worksheetSignature));
    const itemSetSignatures = unique(runs.map((run) => run.itemSetSignature));
    const qualityUpgradeAdmitted = qualityUpgradeRequired && itemSetSignatures.length === runs.length;
    const capacityRuns = runs.map(capacityRun);
    reconciledRouteIds.push(route.routeId);
    return {
      ...route,
      verifiedMaxQuestionCount: HARD_CEILING,
      capacityStatus: "VERIFIED_20",
      qualityStatus: qualityUpgradeAdmitted ? "DIVERSE_PARAMETER_GENERATOR" : route.qualityStatus,
      uniqueItemSetCount: Math.max(Number(route.uniqueItemSetCount) || 0, itemSetSignatures.length),
      uniqueOrderedWorksheetCount: Math.max(Number(route.uniqueOrderedWorksheetCount) || 0, orderedWorksheetSignatures.length),
      reconciliationCodes: unique([
        ...safeArray(route.reconciliationCodes),
        "PGC_R05_LIVE_20_CAPACITY_RECONCILED",
        "PGC_R05_PER_WORKSHEET_PROMPT_DIVERSITY_RECONCILED",
        ...(qualityUpgradeAdmitted ? ["PGC_R05_CROSS_SEED_ITEM_SET_DIVERSITY_RECONCILED"] : []),
      ]),
      selectedCapacityEvidence: {
        evidenceAuthority: LIVE_EVIDENCE_AUTHORITY,
        questionCount: HARD_CEILING,
        diagnosticSeedCount: runs.length,
        runs: capacityRuns,
        replay: capacityRuns[0],
        passed: true,
      },
      downstreamGapCodes: unique([
        ...safeArray(route.downstreamGapCodes).filter((code) => !CLEARED_GAP_CODES.has(code)),
        ...(!qualityUpgradeAdmitted && route.qualityStatus !== "DIVERSE_PARAMETER_GENERATOR"
          ? ["CROSS_SEED_ITEM_DIVERSITY_DEFICIENT"]
          : []),
      ]),
    };
  });

  if (reconciledRouteIds.length !== EXPECTED_LEGAL_APPLICATION_ROUTES) throw new Error(`PGC_R05_RECONCILED_ROUTE_COUNT_INVALID:${reconciledRouteIds.length}`);

  const reconciledSet = new Set(reconciledRouteIds);
  const routeById = new Map(contract.routes.map((route) => [route.routeId, route]));
  const bindingsBefore = clone(safeArray(contract.historicalBindingEvidence));
  const unrelatedBindingsBeforeHash = stableHash(JSON.stringify(bindingsBefore.filter((binding) => !safeArray(binding.routeIds).some((id) => reconciledSet.has(id)))));
  const changedBindingIds = [];
  contract.historicalBindingEvidence = bindingsBefore.map((binding) => {
    if (!safeArray(binding.routeIds).some((id) => reconciledSet.has(id))) return binding;
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
  contract.lastReconciliation = {
    programId: PROGRAM_ID,
    taskId: TASK_ID,
    evidenceAuthority: LIVE_EVIDENCE_AUTHORITY,
    applicationRouteCount: reconciledRouteIds.length,
    hardCeiling: HARD_CEILING,
    diagnosticSeeds: safeArray(diagnostics.diagnosticSeeds),
    status: "PASS_R05_APPLICATION_CAPACITY_CONTRACT_RECONCILED",
  };

  const applicationAfter = routeSummary(contract.routes.filter((route) => route.questionType === APPLICATION));
  if (applicationAfter.legalRouteCount !== EXPECTED_LEGAL_APPLICATION_ROUTES
    || applicationAfter.verified20RouteCount !== EXPECTED_LEGAL_APPLICATION_ROUTES
    || applicationAfter.verifiedLimitedRouteCount !== 0
    || applicationAfter.zeroCapacityRouteCount !== 0) {
    throw new Error(`PGC_R05_APPLICATION_CONTRACT_NOT_CLOSED:${JSON.stringify(applicationAfter)}`);
  }

  const nonApplicationAfterHash = stableHash(JSON.stringify(contract.routes.filter((route) => route.questionType !== APPLICATION)));
  const illegalApplicationAfterHash = stableHash(JSON.stringify(contract.routes.filter((route) => route.questionType === APPLICATION && route.legalRoute !== true)));
  const unrelatedBindingsAfterHash = stableHash(JSON.stringify(contract.historicalBindingEvidence.filter((binding) => !safeArray(binding.routeIds).some((id) => reconciledSet.has(id)))));
  const boundary = {
    nonApplicationRoutesBeforeHash: nonApplicationBeforeHash,
    nonApplicationRoutesAfterHash: nonApplicationAfterHash,
    nonApplicationRoutesPreserved: nonApplicationBeforeHash === nonApplicationAfterHash,
    illegalApplicationRoutesBeforeHash: illegalApplicationBeforeHash,
    illegalApplicationRoutesAfterHash: illegalApplicationAfterHash,
    illegalApplicationRoutesPreserved: illegalApplicationBeforeHash === illegalApplicationAfterHash,
    unrelatedBindingsBeforeHash,
    unrelatedBindingsAfterHash,
    unrelatedBindingsPreserved: unrelatedBindingsBeforeHash === unrelatedBindingsAfterHash,
    generatorModified: false,
    validatorModified: false,
    rendererModified: false,
    secondWorksheetPipelineAdded: false,
  };
  if (!boundary.nonApplicationRoutesPreserved || !boundary.illegalApplicationRoutesPreserved || !boundary.unrelatedBindingsPreserved) {
    throw new Error("PGC_R05_FROZEN_BOUNDARY_VIOLATION");
  }

  const report = {
    schemaName: "PgcR05CapacityContractReconciliationV1",
    schemaVersion: 1,
    programId: PROGRAM_ID,
    taskId: TASK_ID,
    status: "PASS_R05_CAPACITY_CONTRACT_RECONCILED_PENDING_FINAL_DIAGNOSTICS",
    sourceContract: "data/curriculum/public-generation/generator_capacity_contract.json",
    sourceDiagnostics: "data/curriculum/public-generation/PGC-R05.application-gap-diagnostics.json",
    evidenceAuthority: LIVE_EVIDENCE_AUTHORITY,
    applicationBefore,
    applicationAfter,
    overallSummaryAfter: clone(contract.summary),
    reconciledRouteIds,
    changedBindingIds,
    boundary,
    nextShortestStep: "PGC-R05_FinalDiagnosticsAndD0Gate",
  };
  fs.writeFileSync(contractPath, `${JSON.stringify(contract, null, 2)}\n`);
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  writeReadback(report);
  console.log(`PGC_R05_CAPACITY_RECONCILIATION=${JSON.stringify({ status: report.status, applicationAfter, changedBindingCount: changedBindingIds.length })}`);
  return report;
}

function finalize() {
  const report = readJson(reportPath, "PGC_R05_RECONCILIATION_REPORT_MISSING");
  const diagnostics = readJson(diagnosticsPath, "PGC_R05_FINAL_DIAGNOSTICS_MISSING");
  const contract = readJson(contractPath, "PGC_R05_FINAL_CONTRACT_MISSING");
  if (diagnostics.status !== "PASS_R05_D0_ALL_LEGAL_APPLICATION_ROUTES_CAPACITY_CONFORMANT_WITH_RETAINED_CROSS_SEED_QUALITY_GAPS") throw new Error(`PGC_R05_D0_DIAGNOSTICS_REQUIRED:${diagnostics.status}`);
  if (diagnostics.summary?.contractVerified20RouteCount !== EXPECTED_LEGAL_APPLICATION_ROUTES
    || diagnostics.summary?.contractLimitedRouteCount !== 0
    || diagnostics.summary?.live20PassRouteCount !== EXPECTED_LEGAL_APPLICATION_ROUTES
    || diagnostics.summary?.live20FailRouteCount !== 0
    || diagnostics.summary?.repairRouteCount !== 0) {
    throw new Error(`PGC_R05_D0_SUMMARY_INVALID:${JSON.stringify(diagnostics.summary)}`);
  }
  const finalReport = {
    ...report,
    status: "PASS_R05_D0_CAPACITY_CONTRACT_RECONCILED_AND_ALL_LIVE_APPLICATION_ROUTES_CONFORMANT_WITH_RETAINED_CROSS_SEED_QUALITY_GAPS",
    finalDiagnosticsStatus: diagnostics.status,
    finalDiagnosticsSummary: clone(diagnostics.summary),
    overallSummaryAfter: clone(contract.summary),
    nextShortestStep: "PGC-R06_ReasoningMixedPBLGenerationConformance",
  };
  fs.writeFileSync(reportPath, `${JSON.stringify(finalReport, null, 2)}\n`);
  writeReadback(finalReport);
  console.log(`PGC_R05_D0_CLOSEOUT=${JSON.stringify({ status: finalReport.status, nextShortestStep: finalReport.nextShortestStep })}`);
  return finalReport;
}

export { finalize as finalizePgcR05CapacityContractReconciliation, reconcile as reconcilePgcR05CapacityContract };

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (process.argv.includes("--finalize")) finalize();
  else reconcile();
}

// PGC-R05 order-insensitive item-set reconciliation evidence V3

// PGC-R05 retained cross-seed quality backlog D0 closeout V2
