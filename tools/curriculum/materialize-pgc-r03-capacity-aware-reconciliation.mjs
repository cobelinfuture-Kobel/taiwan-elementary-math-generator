import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const outputDir = path.join(repoRoot, "data/curriculum/public-generation");
const docsDir = path.join(repoRoot, "docs/curriculum/output");
const contractPath = path.join(outputDir, "generator_capacity_contract.json");
const routeCsvPath = path.join(outputDir, "route_capacity_matrix.csv");
const diversityCsvPath = path.join(outputDir, "cross_seed_diversity_report.csv");
const reportPath = path.join(docsDir, "PGC-R03_capacity_mismatch_report.md");
const registryPath = path.join(repoRoot, "site/modules/curriculum/public/public-generator-capacity-registry.js");

const HARD_CEILING = 20;
const SEED_COUNT = 10;
const SEEDS = Object.freeze(Array.from({ length: SEED_COUNT }, (_, index) => `pgc-r03-seed-${String(index + 1).padStart(2, "0")}`));
const ILLEGAL_ROUTE_ERROR_CODES = new Set([
  "G5AU02_PUBLIC_CONTROL_INTERSECTION_EMPTY",
  "G5A_U08_CANONICAL_SCOPE_INVALID",
  "kp_resolver_pattern_group_not_linked_to_kp",
]);

const safeArray = (value) => Array.isArray(value) ? value : [];
const unique = (values) => [...new Set((values ?? []).filter(Boolean))];
const sortedKey = (values) => unique(values).map(String).sort().join("|");
const stableHash = (value, length = 16) => crypto.createHash("sha256").update(String(value)).digest("hex").slice(0, length);
const csvEscape = (value) => {
  const text = value == null ? "" : Array.isArray(value) ? value.join("|") : typeof value === "object" ? JSON.stringify(value) : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};

function textValue(...values) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.replace(/\s+/g, " ").trim();
    if (typeof value === "number") return String(value);
  }
  return "";
}

function promptText(item) {
  return textValue(
    item?.blankedDisplayText,
    item?.promptText,
    item?.prompt,
    item?.questionText,
    item?.displayText,
    item?.stem,
    item?.equationText,
    item?.content,
    item?.metadataSnapshot?.blankedDisplayText,
    item?.metadataSnapshot?.promptText,
    item?.metadata?.blankedDisplayText,
    item?.metadata?.promptText,
  );
}

function answerText(item) {
  return textValue(
    item?.answerText,
    item?.answer,
    item?.correctAnswer,
    item?.metadataSnapshot?.answerText,
    item?.metadata?.answerText,
  );
}

function patternId(item) {
  return item?.patternSpecId
    ?? item?.patternId
    ?? item?.metadataSnapshot?.patternId
    ?? item?.metadataSnapshot?.patternSpecId
    ?? item?.metadata?.patternId
    ?? item?.metadata?.patternSpecId
    ?? null;
}

function capacityItems(result) {
  const document = result?.worksheetDocument;
  for (const candidate of [
    document?.questionDisplayModels,
    document?.generatedQuestions,
    document?.questions,
    document?.answerKeyItems,
  ]) {
    if (safeArray(candidate).length > 0) return candidate;
  }
  return [];
}

function errorCodes(result) {
  return unique(safeArray(result?.errors ?? result?.validation?.errors).map((error) => error?.code ?? String(error)));
}

function planForRoute(route, seed, questionCount) {
  const plan = {
    sourceId: route.sourceId,
    questionCount,
    ordering: "shuffleAcrossPatterns",
    includeAnswerKey: true,
    generationSeed: seed,
    selectionMode: route.selectionMode,
    selectedKnowledgePointIds: [...safeArray(route.selectedKnowledgePointIds)],
    selectedPatternGroupIds: [...safeArray(route.generationPatternGroupIds)],
    printLayout: { columns: 2, rowsPerPage: 10, showAnswerKeyPage: true },
    questionMode: route.questionType,
  };
  if (route.depthMode) plan.depthMode = route.depthMode;
  if (route.contextMode) plan.contextMode = route.contextMode;
  return plan;
}

function summarizeRun(route, seed, questionCount, result, thrownError = null) {
  const items = capacityItems(result);
  const prompts = items.map(promptText);
  const itemSignatures = items.map((item) => stableHash(JSON.stringify({
    prompt: promptText(item),
    answer: answerText(item),
    patternId: patternId(item),
  }), 24));
  const promptSignatures = prompts.map((prompt) => stableHash(prompt, 24));
  const answerKeyItems = safeArray(result?.worksheetDocument?.answerKeyItems);
  return {
    seed,
    requestedQuestionCount: questionCount,
    ok: thrownError == null && result?.ok === true,
    thrownError: thrownError ? String(thrownError?.stack ?? thrownError) : null,
    errorCodes: errorCodes(result),
    questionCount: items.length,
    answerKeyItemCount: answerKeyItems.length,
    missingPromptCount: prompts.filter((prompt) => !prompt).length,
    duplicatePromptCount: promptSignatures.length - new Set(promptSignatures).size,
    orderedWorksheetSignature: stableHash(itemSignatures.join("|"), 32),
    itemSetSignature: stableHash([...itemSignatures].sort().join("|"), 32),
  };
}

async function runOne(buildWorksheetDocumentFromPlan, route, seed, questionCount) {
  try {
    const result = buildWorksheetDocumentFromPlan(planForRoute(route, seed, questionCount));
    return summarizeRun(route, seed, questionCount, result, null);
  } catch (error) {
    return summarizeRun(route, seed, questionCount, null, error);
  }
}

function safeRun(run, questionCount) {
  return run.ok
    && run.questionCount === questionCount
    && run.answerKeyItemCount === questionCount
    && run.missingPromptCount === 0
    && run.duplicatePromptCount === 0;
}

function replayPassed(first, replay) {
  return first.ok === replay.ok
    && first.questionCount === replay.questionCount
    && first.orderedWorksheetSignature === replay.orderedWorksheetSignature;
}

function priorTwentyEvidence(route) {
  const runs = safeArray(route.seedRuns);
  const replay = route.replay;
  const passed = runs.length === SEED_COUNT
    && runs.every((run) => safeRun(run, HARD_CEILING))
    && replay
    && safeRun(replay, HARD_CEILING)
    && replayPassed(runs[0], replay);
  return passed ? { questionCount: HARD_CEILING, runs, replay, passed: true } : null;
}

async function auditAtCount(buildWorksheetDocumentFromPlan, route, questionCount) {
  const runs = [];
  for (const seed of SEEDS) {
    const run = await runOne(buildWorksheetDocumentFromPlan, route, seed, questionCount);
    runs.push(run);
    if (!safeRun(run, questionCount)) return { questionCount, runs, replay: null, passed: false };
  }
  const replay = await runOne(buildWorksheetDocumentFromPlan, route, SEEDS[0], questionCount);
  return {
    questionCount,
    runs,
    replay,
    passed: safeRun(replay, questionCount) && replayPassed(runs[0], replay),
  };
}

function observedErrorCodes(route) {
  return unique(safeArray(route.seedRuns).flatMap((run) => safeArray(run.errorCodes)));
}

function isIllegalRoute(route) {
  const codes = observedErrorCodes(route);
  return route.failedSeedCount === SEED_COUNT
    && codes.length > 0
    && codes.every((code) => ILLEGAL_ROUTE_ERROR_CODES.has(code));
}

function qualityForEvidence(evidence) {
  if (!evidence || !evidence.passed) return { qualityStatus: "NO_CAPACITY", uniqueItemSetCount: 0, uniqueOrderedWorksheetCount: 0 };
  const uniqueItemSetCount = new Set(evidence.runs.map((run) => run.itemSetSignature)).size;
  const uniqueOrderedWorksheetCount = new Set(evidence.runs.map((run) => run.orderedWorksheetSignature)).size;
  return {
    qualityStatus: uniqueItemSetCount >= 8
      ? "DIVERSE_PARAMETER_GENERATOR"
      : uniqueItemSetCount >= 2
        ? "BOUNDED_DIVERSITY"
        : "FIXTURE_SELECTOR",
    uniqueItemSetCount,
    uniqueOrderedWorksheetCount,
  };
}

async function reconcileRoute(buildWorksheetDocumentFromPlan, priorRoute) {
  const route = {
    routeId: priorRoute.routeId,
    caseId: priorRoute.caseId,
    sourceId: priorRoute.sourceId,
    selectionMode: priorRoute.selectionMode,
    selectedKnowledgePointIds: safeArray(priorRoute.selectedKnowledgePointIds),
    questionType: priorRoute.questionType,
    questionTypeLabel: priorRoute.questionTypeLabel,
    setKind: priorRoute.setKind,
    publicPatternGroupIds: safeArray(priorRoute.publicPatternGroupIds),
    generationPatternGroupIds: safeArray(priorRoute.generationPatternGroupIds),
    compatiblePatternSpecIds: safeArray(priorRoute.compatiblePatternSpecIds),
    depthMode: priorRoute.depthMode ?? null,
    contextMode: priorRoute.contextMode ?? null,
    declaredUiMaxQuestionCount: priorRoute.declaredUiMaxQuestionCount,
  };
  const priorCodes = observedErrorCodes(priorRoute);
  if (isIllegalRoute(priorRoute)) {
    return {
      ...route,
      legalRoute: false,
      legalRouteStatus: "ILLEGAL",
      verifiedMaxQuestionCount: 0,
      capacityStatus: "ILLEGAL_ROUTE_REMOVED_FROM_UI",
      qualityStatus: "NOT_APPLICABLE",
      uniqueItemSetCount: 0,
      uniqueOrderedWorksheetCount: 0,
      priorFailureCodes: safeArray(priorRoute.failureCodes),
      reconciliationCodes: priorCodes,
      selectedCapacityEvidence: null,
      downstreamGapCodes: [],
    };
  }

  let evidence = priorTwentyEvidence(priorRoute);
  if (!evidence) {
    for (let questionCount = HARD_CEILING - 1; questionCount >= 1; questionCount -= 1) {
      const candidate = await auditAtCount(buildWorksheetDocumentFromPlan, route, questionCount);
      if (candidate.passed) {
        evidence = candidate;
        break;
      }
    }
  }

  const verifiedMaxQuestionCount = evidence?.passed ? evidence.questionCount : 0;
  const quality = qualityForEvidence(evidence);
  const downstreamGapCodes = [];
  if (verifiedMaxQuestionCount > 0 && verifiedMaxQuestionCount < HARD_CEILING) downstreamGapCodes.push("CAPACITY_BELOW_20");
  if (verifiedMaxQuestionCount > 0 && quality.uniqueItemSetCount < 2) downstreamGapCodes.push("CROSS_SEED_ITEM_DIVERSITY_DEFICIENT");
  if (verifiedMaxQuestionCount === 0) downstreamGapCodes.push("ZERO_SAFE_CAPACITY");

  return {
    ...route,
    legalRoute: true,
    legalRouteStatus: verifiedMaxQuestionCount > 0 ? "LEGAL" : "LEGAL_ZERO_CAPACITY",
    verifiedMaxQuestionCount,
    capacityStatus: verifiedMaxQuestionCount === HARD_CEILING
      ? "VERIFIED_20"
      : verifiedMaxQuestionCount > 0
        ? "VERIFIED_LIMITED"
        : "FAIL_CLOSED_ZERO_CAPACITY",
    qualityStatus: quality.qualityStatus,
    uniqueItemSetCount: quality.uniqueItemSetCount,
    uniqueOrderedWorksheetCount: quality.uniqueOrderedWorksheetCount,
    priorFailureCodes: safeArray(priorRoute.failureCodes),
    reconciliationCodes: priorCodes,
    selectedCapacityEvidence: evidence,
    downstreamGapCodes,
  };
}

function runtimeRows(routes) {
  return routes.map((route) => [
    route.sourceId,
    route.selectionMode,
    route.selectionMode === "sourceUnit" ? "" : sortedKey(route.selectedKnowledgePointIds),
    route.questionType,
    sortedKey(route.publicPatternGroupIds),
    route.depthMode ?? "",
    route.contextMode ?? "",
    route.verifiedMaxQuestionCount,
    route.legalRouteStatus === "ILLEGAL" ? "ILLEGAL" : "LEGAL",
    route.qualityStatus,
    route.routeId,
  ]);
}

function writeRegistry(routes) {
  const rows = runtimeRows(routes);
  const content = [
    'export const PUBLIC_GENERATOR_CAPACITY_REGISTRY_STATUS = "MATERIALIZED_PGC_R03_V3";',
    `export const PUBLIC_GENERATOR_CAPACITY_ROWS = Object.freeze(${JSON.stringify(rows)});`,
    "",
  ].join("\n");
  fs.writeFileSync(registryPath, content);
  return rows;
}

function historicalBindingEvidence(prior, routes) {
  const routeById = new Map(routes.map((route) => [route.routeId, route]));
  return safeArray(prior.bindingEvidence).map((binding) => {
    const linked = safeArray(binding.routeIds).map((routeId) => routeById.get(routeId)).filter(Boolean);
    const available = linked.filter((route) => route.legalRoute && route.verifiedMaxQuestionCount > 0);
    return {
      bindingId: binding.bindingId,
      routeIds: linked.map((route) => route.routeId),
      accountedRouteCount: linked.length,
      availableRouteCount: available.length,
      status: available.length > 0 ? "RECONCILED_TO_CAPACITY_AWARE_UI" : "REMOVED_ILLEGAL_OR_ZERO_CAPACITY",
      minimumVerifiedQuestionCount: available.length > 0 ? Math.min(...available.map((route) => route.verifiedMaxQuestionCount)) : 0,
      maximumVerifiedQuestionCount: available.length > 0 ? Math.max(...available.map((route) => route.verifiedMaxQuestionCount)) : 0,
    };
  });
}

function writeCsv(filePath, columns, rows) {
  const lines = [columns.join(",")];
  for (const row of rows) lines.push(columns.map((column) => csvEscape(row[column])).join(","));
  fs.writeFileSync(filePath, `${lines.join("\n")}\n`);
}

function writeReport(contract) {
  const summary = contract.summary;
  const lines = [
    "# PGC-R03 Capacity-aware Legal Route Reconciliation",
    "",
    "```text",
    "PROGRAM_ID = PUBLIC_KP_GENERATION_CONFORMANCE_V1",
    "TASK_ID    = PGC-R03_CapacityAwareLegalRouteAndPerCapabilityUiLimitReconciliation",
    `STATUS     = ${contract.status}`,
    "```",
    "",
    "## Reconciled capacity",
    "",
    "```text",
    `HISTORICAL_R02_BINDINGS        = ${summary.historicalBindingCount}`,
    `CURRENT_LEGAL_BINDINGS         = ${summary.currentLegalBindingCount}`,
    `ROUTES                         = ${summary.routeCount}`,
    `LEGAL_ROUTES                   = ${summary.legalRouteCount}`,
    `ILLEGAL_ROUTES_REMOVED         = ${summary.illegalRouteCount}`,
    `VERIFIED_20_ROUTES             = ${summary.verified20RouteCount}`,
    `VERIFIED_LIMITED_ROUTES        = ${summary.verifiedLimitedRouteCount}`,
    `ZERO_CAPACITY_ROUTES_HIDDEN    = ${summary.zeroCapacityRouteCount}`,
    `DIVERSITY_GAP_ROUTES           = ${summary.diversityGapRouteCount}`,
    `CURRENT_UNVERIFIED_EXPOSURES   = ${summary.currentUnverifiedCapacityExposureCount}`,
    `HARD_BLOCKERS                  = ${summary.hardBlockerCount}`,
    "```",
    "",
    "Illegal control intersections are not treated as weak generators. They are removed from the public route set. Legal routes retain their measured maximum; fixed fixture routes may remain usable while their diversity debt is transferred to PGC-R04 or PGC-R05.",
    "",
    "## Downstream gaps",
    "",
    ...contract.downstreamGaps.map((gap) => `- \`${gap.code}\`: ${gap.count}`),
    "",
    "## Distance update",
    "",
    "```text",
    "GOAL_DISTANCE_BEFORE = D1_GENERATOR_CAPACITY_FAIL_CLOSED",
    `GOAL_DISTANCE_AFTER  = ${summary.hardBlockerCount === 0 ? "D1_CAPACITY_AWARE_PUBLIC_ROUTES_CONFORMANT" : "D1_CAPACITY_RECONCILIATION_BLOCKED"}`,
    "DISTANCE_REDUCED     = illegal routes are removed and every exposed route is clamped to its verified safe question count",
    "REMAINING_BLOCKERS   = [PGC-R04_NUMERIC_QUALITY, PGC-R05_APPLICATION_QUALITY, PGC-R06_TO_R08_PRODUCT_ACCEPTANCE]",
    "NEXT_SHORTEST_STEP   = PGC-R04_NumericGenerationFullFix",
    "```",
    "",
  ];
  fs.writeFileSync(reportPath, `${lines.join("\n")}\n`);
}

export async function materializePgcR03CapacityAwareReconciliation() {
  if (!fs.existsSync(contractPath)) throw new Error("PGC_R03_V2_CONTRACT_MISSING");
  const prior = JSON.parse(fs.readFileSync(contractPath, "utf8"));
  const priorDocument = globalThis.document;
  if (typeof globalThis.document === "undefined") globalThis.document = { getElementById: () => null, body: null };
  const { buildWorksheetDocumentFromPlan } = await import("../../site/assets/browser/pipeline/build-worksheet-document.js");

  const routes = [];
  for (const [index, route] of safeArray(prior.routes).entries()) {
    routes.push(await reconcileRoute(buildWorksheetDocumentFromPlan, route));
    if ((index + 1) % 25 === 0 || index + 1 === prior.routes.length) {
      console.log(`PGC_R03_V3_PROGRESS=${index + 1}/${prior.routes.length}`);
    }
  }
  if (priorDocument === undefined) delete globalThis.document;
  else globalThis.document = priorDocument;

  const registryRows = writeRegistry(routes);
  const r02Module = await import(`./materialize-pgc-r02-ui-capability-binding-r03.mjs?pgcR03=${Date.now()}`);
  const currentR02 = r02Module.materializePgcR02UiCapabilityBinding();
  const historicalEvidence = historicalBindingEvidence(prior, routes);

  const downstreamGaps = [
    { code: "CAPACITY_BELOW_20", count: routes.filter((route) => route.downstreamGapCodes.includes("CAPACITY_BELOW_20")).length },
    { code: "CROSS_SEED_ITEM_DIVERSITY_DEFICIENT", count: routes.filter((route) => route.downstreamGapCodes.includes("CROSS_SEED_ITEM_DIVERSITY_DEFICIENT")).length },
    { code: "ZERO_SAFE_CAPACITY", count: routes.filter((route) => route.downstreamGapCodes.includes("ZERO_SAFE_CAPACITY")).length },
  ];
  const hardBlockers = [];
  if (registryRows.length !== routes.length) hardBlockers.push("REGISTRY_ROUTE_COUNT_MISMATCH");
  if (historicalEvidence.length !== safeArray(prior.bindingEvidence).length) hardBlockers.push("HISTORICAL_BINDING_ACCOUNTING_MISMATCH");
  if (currentR02.status !== "PASS") hardBlockers.push("CURRENT_R02_CAPACITY_AWARE_BINDING_FAILED");
  if (currentR02.summary.unverifiedCapacityExposureCount !== 0) hardBlockers.push("CURRENT_UI_UNVERIFIED_CAPACITY_EXPOSED");

  const summary = {
    publicSourceCount: prior.summary.publicSourceCount,
    visibleKnowledgePointCount: prior.summary.visibleKnowledgePointCount,
    publicSurfaceCount: prior.summary.publicSurfaceCount,
    historicalBindingCount: historicalEvidence.length,
    historicalBindingAccountedCount: historicalEvidence.filter((binding) => binding.accountedRouteCount > 0).length,
    currentLegalBindingCount: currentR02.bindings.length,
    currentVerified20BindingCount: currentR02.summary.verified20BindingCount,
    currentLimitedBindingCount: currentR02.summary.limitedCapacityBindingCount,
    currentUnverifiedCapacityExposureCount: currentR02.summary.unverifiedCapacityExposureCount,
    routeCount: routes.length,
    legalRouteCount: routes.filter((route) => route.legalRoute).length,
    illegalRouteCount: routes.filter((route) => !route.legalRoute).length,
    verified20RouteCount: routes.filter((route) => route.capacityStatus === "VERIFIED_20").length,
    verifiedLimitedRouteCount: routes.filter((route) => route.capacityStatus === "VERIFIED_LIMITED").length,
    zeroCapacityRouteCount: routes.filter((route) => route.capacityStatus === "FAIL_CLOSED_ZERO_CAPACITY").length,
    diversityGapRouteCount: routes.filter((route) => route.downstreamGapCodes.includes("CROSS_SEED_ITEM_DIVERSITY_DEFICIENT")).length,
    hardBlockerCount: hardBlockers.length,
  };
  const status = hardBlockers.length === 0
    ? downstreamGaps.some((gap) => gap.count > 0) ? "PASS_WITH_DOWNSTREAM_GAPS" : "PASS"
    : "FAIL_CLOSED";

  const contract = {
    schemaName: "PublicGeneratorCapacityContractV3",
    schemaVersion: 3,
    programId: "PUBLIC_KP_GENERATION_CONFORMANCE_V1",
    taskId: "PGC-R03_CapacityAwareLegalRouteAndPerCapabilityUiLimitReconciliation",
    status,
    hardCeiling: HARD_CEILING,
    seedCount: SEED_COUNT,
    legalRoutePolicy: {
      illegalErrorCodes: [...ILLEGAL_ROUTE_ERROR_CODES],
      illegalRoutesRemovedFromUi: true,
      zeroCapacityRoutesRemovedFromUi: true,
      perCapabilityVerifiedMaxApplied: true,
      crossSeedDiversityIsDownstreamQualityGap: true,
    },
    summary,
    hardBlockers,
    downstreamGaps,
    routes,
    historicalBindingEvidence: historicalEvidence,
    currentUiBindingContract: {
      schemaName: currentR02.schemaName,
      status: currentR02.status,
      summary: currentR02.summary,
    },
    runtimeRegistry: {
      path: "site/modules/curriculum/public/public-generator-capacity-registry.js",
      status: "MATERIALIZED_PGC_R03_V3",
      rowCount: registryRows.length,
    },
  };

  fs.writeFileSync(contractPath, `${JSON.stringify(contract, null, 2)}\n`);
  writeCsv(routeCsvPath, [
    "routeId", "caseId", "sourceId", "selectionMode", "selectedKnowledgePointIds", "questionType",
    "setKind", "publicPatternGroupIds", "generationPatternGroupIds", "depthMode", "contextMode",
    "legalRouteStatus", "verifiedMaxQuestionCount", "capacityStatus", "qualityStatus",
    "uniqueItemSetCount", "uniqueOrderedWorksheetCount", "reconciliationCodes", "downstreamGapCodes",
  ], routes);
  writeCsv(diversityCsvPath, [
    "routeId", "sourceId", "questionType", "verifiedMaxQuestionCount", "qualityStatus",
    "uniqueItemSetCount", "uniqueOrderedWorksheetCount", "crossSeedDiversityPassed",
  ], routes.filter((route) => route.legalRoute && route.verifiedMaxQuestionCount > 0)
    .map((route) => ({ ...route, crossSeedDiversityPassed: route.uniqueItemSetCount >= 2 })));
  writeReport(contract);
  console.log(`PGC_R03_V3_SUMMARY=${JSON.stringify(summary)}`);
  return contract;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const contract = await materializePgcR03CapacityAwareReconciliation();
  if (contract.status === "FAIL_CLOSED") process.exitCode = 2;
}
