import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const contractPath = path.join(repoRoot, "data/curriculum/public-generation/generator_capacity_contract.json");
const outputPath = path.join(repoRoot, "data/curriculum/public-generation/PGC-R05.application-gap-diagnostics.json");
const csvPath = path.join(repoRoot, "data/curriculum/public-generation/application_generation_gap_inventory.csv");
const readbackPath = path.join(repoRoot, "docs/curriculum/output/PGC-R05_application_generation_gap_diagnostics.md");

const APPLICATION_QUESTION_TYPE = "application";
const DIAGNOSTIC_SEEDS = Object.freeze(["pgc-r05-diagnostic-01", "pgc-r05-diagnostic-02"]);
const HARD_CEILING = 20;

const safeArray = (value) => Array.isArray(value) ? value : [];
const unique = (values) => [...new Set((values ?? []).filter(Boolean))];
const stableHash = (value, length = 20) => crypto.createHash("sha256").update(String(value)).digest("hex").slice(0, length);
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

function evidenceItems(result) {
  const document = result?.worksheetDocument;
  for (const [name, candidate] of [
    ["questionDisplayModels", document?.questionDisplayModels],
    ["generatedQuestions", document?.generatedQuestions],
    ["questions", document?.questions],
    ["answerKeyItems", document?.answerKeyItems],
  ]) {
    if (safeArray(candidate).length > 0) return { projection: name, items: candidate };
  }
  return { projection: "none", items: [] };
}

function errorCodes(result) {
  return unique(safeArray(result?.errors ?? result?.validation?.errors).map((error) => error?.code ?? String(error)));
}

function planForRoute(route, seed) {
  const plan = {
    sourceId: route.sourceId,
    questionCount: HARD_CEILING,
    ordering: "shuffleAcrossPatterns",
    includeAnswerKey: true,
    generationSeed: seed,
    selectionMode: route.selectionMode,
    selectedKnowledgePointIds: [...safeArray(route.selectedKnowledgePointIds)],
    selectedPatternGroupIds: [...safeArray(route.generationPatternGroupIds)],
    printLayout: { columns: 2, rowsPerPage: 10, showAnswerKeyPage: true },
    questionMode: APPLICATION_QUESTION_TYPE,
  };
  if (route.depthMode) plan.depthMode = route.depthMode;
  if (route.contextMode) plan.contextMode = route.contextMode;
  return plan;
}

function summarizeItem(item) {
  const prompt = promptText(item);
  const answer = answerText(item);
  return {
    prompt,
    answer,
    promptHash: stableHash(prompt),
    itemSignature: stableHash(JSON.stringify({ prompt, answer, patternSpecId: patternId(item) })),
    patternSpecId: patternId(item),
    knowledgePointIds: unique([
      item?.knowledgePointId,
      ...safeArray(item?.knowledgePointIds),
      item?.metadataSnapshot?.knowledgePointId,
      ...safeArray(item?.metadataSnapshot?.knowledgePointIds),
      item?.metadata?.knowledgePointId,
      ...safeArray(item?.metadata?.knowledgePointIds),
    ]),
    rawKind: item?.kind ?? item?.schemaName ?? item?.metadataSnapshot?.kind ?? item?.metadata?.kind ?? null,
  };
}

function runtimeLineage(result) {
  const document = result?.worksheetDocument;
  return {
    browserResolutionMode: result?.browserResolution?.mode ?? null,
    browserPlanSourceId: result?.browserResolution?.plan?.sourceId ?? null,
    sourceUnitAdapterStatus: result?.sourceUnitAdaptation?.status ?? result?.sourceUnitAdaptation?.adapterStatus ?? null,
    sourceUnitAdapterId: result?.sourceUnitAdaptation?.adapterId ?? result?.sourceUnitAdaptation?.adapter ?? null,
    authoritativeCutoverApplied: result?.authoritativeConsumerCutover?.applied ?? false,
    authoritativeCutoverAdapter: result?.authoritativeConsumerCutover?.adapter ?? null,
    documentQuestionMode: document?.metadata?.questionMode ?? document?.publicControls?.questionMode ?? null,
    documentAuthorityMode: document?.publicControls?.authorityMode ?? null,
  };
}

function acceptanceFailures(run) {
  const failures = [];
  if (run.ok !== true) failures.push("BUILD_NOT_OK");
  if (run.questionCount !== HARD_CEILING) failures.push("QUESTION_COUNT_MISMATCH");
  if (run.answerKeyItemCount !== HARD_CEILING) failures.push("ANSWER_COUNT_MISMATCH");
  if (run.emptyPromptCount > 0) failures.push("EMPTY_PROMPT");
  if (run.duplicatePromptCount > 0) failures.push("DUPLICATE_PROMPT");
  if (run.errorCodes.length > 0) failures.push("RUNTIME_ERRORS_PRESENT");
  return failures;
}

function summarizeRun(seed, result, thrownError = null) {
  const { projection, items } = evidenceItems(result);
  const summarizedItems = items.map(summarizeItem);
  const promptHashes = summarizedItems.map((item) => item.promptHash);
  const answerKeyItems = safeArray(result?.worksheetDocument?.answerKeyItems);
  const run = {
    seed,
    requestedQuestionCount: HARD_CEILING,
    ok: thrownError == null && result?.ok === true,
    thrownError: thrownError ? String(thrownError?.stack ?? thrownError) : null,
    errorCodes: errorCodes(result),
    warnings: safeArray(result?.warnings).map((warning) => warning?.code ?? String(warning)),
    evidenceProjection: projection,
    questionCount: items.length,
    answerKeyItemCount: answerKeyItems.length,
    emptyPromptCount: summarizedItems.filter((item) => !item.prompt).length,
    duplicatePromptCount: promptHashes.length - new Set(promptHashes).size,
    uniquePromptCount: new Set(promptHashes).size,
    patternSpecIdsObserved: unique(summarizedItems.map((item) => item.patternSpecId)),
    knowledgePointIdsObserved: unique(summarizedItems.flatMap((item) => item.knowledgePointIds)),
    worksheetSignature: stableHash(JSON.stringify(summarizedItems.map((item) => item.itemSignature))),
    runtimeLineage: runtimeLineage(result),
    itemSamples: summarizedItems.slice(0, 3),
  };
  return { ...run, acceptanceFailures: acceptanceFailures(run) };
}

async function runOne(buildWorksheetDocumentFromPlan, route, seed) {
  try {
    return summarizeRun(seed, buildWorksheetDocumentFromPlan(planForRoute(route, seed)), null);
  } catch (error) {
    return summarizeRun(seed, null, error);
  }
}

function contractGapCodes(route) {
  const codes = [];
  if (route.verifiedMaxQuestionCount < HARD_CEILING) codes.push("CAPACITY_BELOW_20");
  if (route.qualityStatus === "FIXTURE_SELECTOR") codes.push("FIXTURE_SELECTOR");
  if (route.qualityStatus === "BOUNDED_DIVERSITY") codes.push("BOUNDED_DIVERSITY");
  if (route.verifiedMaxQuestionCount === 0) codes.push("ZERO_SAFE_CAPACITY");
  if (route.qualityStatus !== "DIVERSE_PARAMETER_GENERATOR") codes.push("NON_DIVERSE_QUALITY_STATUS");
  return unique(codes);
}

async function diagnoseRoute(buildWorksheetDocumentFromPlan, route, index, total) {
  const runs = [];
  for (const seed of DIAGNOSTIC_SEEDS) runs.push(await runOne(buildWorksheetDocumentFromPlan, route, seed));
  const liveAcceptanceFailures = unique(runs.flatMap((run) => run.acceptanceFailures));
  console.log(`PGC_R05_DIAGNOSTIC_PROGRESS=${index + 1}/${total}:${route.routeId}`);
  return {
    routeId: route.routeId,
    caseId: route.caseId,
    sourceId: route.sourceId,
    selectionMode: route.selectionMode,
    selectedKnowledgePointIds: safeArray(route.selectedKnowledgePointIds),
    questionType: route.questionType,
    setKind: route.setKind,
    publicPatternGroupIds: safeArray(route.publicPatternGroupIds),
    generationPatternGroupIds: safeArray(route.generationPatternGroupIds),
    compatiblePatternSpecIds: safeArray(route.compatiblePatternSpecIds),
    depthMode: route.depthMode ?? null,
    contextMode: route.contextMode ?? null,
    currentVerifiedMaxQuestionCount: route.verifiedMaxQuestionCount,
    currentQualityStatus: route.qualityStatus,
    currentUniqueItemSetCount: route.uniqueItemSetCount,
    currentDownstreamGapCodes: safeArray(route.downstreamGapCodes),
    contractGapCodes: contractGapCodes(route),
    liveAcceptanceFailures,
    accepted20AcrossSeeds: liveAcceptanceFailures.length === 0 && runs.length === DIAGNOSTIC_SEEDS.length,
    requiresRepair: contractGapCodes(route).length > 0 || liveAcceptanceFailures.length > 0,
    diagnosticRuns: runs,
  };
}

function writeCsv(rows) {
  const columns = [
    "routeId", "sourceId", "selectionMode", "selectedKnowledgePointIds", "questionType", "setKind",
    "generationPatternGroupIds", "compatiblePatternSpecIds", "currentVerifiedMaxQuestionCount",
    "currentQualityStatus", "currentUniqueItemSetCount", "contractGapCodes", "liveAcceptanceFailures",
    "accepted20AcrossSeeds", "requiresRepair",
  ];
  const lines = [columns.join(",")];
  for (const row of rows) lines.push(columns.map((column) => csvEscape(row[column])).join(","));
  fs.writeFileSync(csvPath, `${lines.join("\n")}\n`);
}

const LIVE_REPAIR_TASK_BY_SOURCE = Object.freeze({
  g5a_u08_5a08: "PGC-R05_G5A_U08_ApplicationDiversityFullFix",
  g3a_u08_3a08: "PGC-R05_G3A_U08_ApplicationDiversityFullFix",
  g3b_u07_3b07: "PGC-R05_G3B_U07_ApplicationDiversityFullFix",
  g4a_u08_4a08: "PGC-R05_G4A_U08_ApplicationDiversityFullFix",
  g5a_u03_5a03a: "PGC-R05_G5A_U03_ApplicationDiversityFullFix",
  g5a_u03_5a03a1: "PGC-R05_G5A_U03A1_ApplicationDiversityFullFix",
  g3b_u08_3b08: "PGC-R05_G3B_U08_ApplicationDiversityFullFix",
  g6a_u01_6a01: "PGC-R05_G6A_U01_ApplicationDiversityFullFix",
});

function sortedCountRows(counts = {}) {
  return Object.entries(counts).sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]));
}

function reportStatus(summary) {
  if (summary.live20FailRouteCount === 0) return "PASS_R05_ALL_LIVE_APPLICATION_ROUTES_CONFORMANT_PENDING_CONTRACT_RECONCILIATION";
  return `PASS_R05_${summary.live20PassRouteCount}_OF_${summary.legalApplicationRouteCount}_LIVE_APPLICATION_ROUTES_CONFORMANT`;
}

function nextShortestStep(summary) {
  const nextSourceId = sortedCountRows(summary.liveFailureRouteCountBySource)[0]?.[0] ?? null;
  if (!nextSourceId) return "PGC-R05_CapacityContractReconciliationAndD0Closeout";
  return LIVE_REPAIR_TASK_BY_SOURCE[nextSourceId]
    ?? `PGC-R05_${nextSourceId.toUpperCase().replace(/[^A-Z0-9]+/g, "_")}_ApplicationDiversityFullFix`;
}

function writeReadback(report) {
  const summary = report.summary;
  const sourceRows = sortedCountRows(summary.repairRouteCountBySource);
  const liveFailureRows = sortedCountRows(summary.liveFailureRouteCountBySource);
  const blockerText = liveFailureRows.length > 0
    ? liveFailureRows.map(([sourceId, count]) => `${sourceId}:${count}`).join(", ")
    : "CAPACITY_CONTRACT_RECONCILIATION";
  const nextStep = nextShortestStep(summary);
  const lines = [
    "# PGC-R05 Application Generation Runtime Gap Diagnostics",
    "",
    "```text",
    "PROGRAM_ID = PUBLIC_KP_GENERATION_CONFORMANCE_V1",
    "TASK_ID    = PGC-R05_ApplicationGenerationFullFix_RuntimeGapDiagnostics",
    `STATUS     = ${report.status}`,
    "```",
    "",
    "## Baseline",
    "",
    "```text",
    `APPLICATION_ROUTES             = ${summary.applicationRouteCount}`,
    `LEGAL_APPLICATION_ROUTES       = ${summary.legalApplicationRouteCount}`,
    `ILLEGAL_APPLICATION_ROUTES     = ${summary.illegalApplicationRouteCount}`,
    `CONTRACT_VERIFIED_20_ROUTES    = ${summary.contractVerified20RouteCount}`,
    `CONTRACT_LIMITED_ROUTES        = ${summary.contractLimitedRouteCount}`,
    `CONTRACT_QUALITY_GAP_ROUTES    = ${summary.contractQualityGapRouteCount}`,
    `LIVE_20_PASS_ROUTES            = ${summary.live20PassRouteCount}`,
    `LIVE_20_FAIL_ROUTES            = ${summary.live20FailRouteCount}`,
    `REPAIR_ROUTES                  = ${summary.repairRouteCount}`,
    "```",
    "",
    "## Live failures by source",
    "",
    "| Source | Live failing routes |",
    "|---|---:|",
    ...(liveFailureRows.length > 0
      ? liveFailureRows.map(([sourceId, count]) => `| \`${sourceId}\` | ${count} |`)
      : ["| none | 0 |"]),
    "",
    "## Scope boundary",
    "",
    "- R05 owns legal public `application` routes only.",
    "- R04 numeric routes are read-only protected baseline.",
    "- Reasoning, mixed, and PBL remain owned by R06 or later.",
    "- Existing Global Primary / canonical application authorities and the shared worksheet pipeline remain the only admitted producer-consumer lineage.",
    "",
    "## Repair routes by source",
    "",
    "| Source | Repair routes |",
    "|---|---:|",
    ...sourceRows.map(([sourceId, count]) => `| \`${sourceId}\` | ${count} |`),
    "",
    "## Distance",
    "",
    "```text",
    "GOAL_DISTANCE_BEFORE = D1_R05_APPLICATION_LIVE_GENERATION_PARTIALLY_CONFORMANT",
    `GOAL_DISTANCE_AFTER  = D1_R05_${summary.live20PassRouteCount}_OF_${summary.legalApplicationRouteCount}_LIVE_APPLICATION_ROUTES_CONFORMANT`,
    `DISTANCE_REDUCED     = ${summary.live20PassRouteCount}/${summary.legalApplicationRouteCount} legal application routes now pass two deterministic 20-question worksheets with complete prompts, answer keys and authority lineage; ${summary.live20FailRouteCount} live failures remain`,
    `REMAINING_BLOCKERS   = [${blockerText}]`,
    `NEXT_SHORTEST_STEP   = ${nextStep}`,
    "```",
    "",
  ];
  fs.writeFileSync(readbackPath, `${lines.join("\n")}\n`);
}

export async function materializePgcR05ApplicationGapDiagnostics() {
  if (!fs.existsSync(contractPath)) throw new Error("PGC_R03_CAPACITY_CONTRACT_MISSING");
  const contract = JSON.parse(fs.readFileSync(contractPath, "utf8"));
  if (contract.schemaName !== "PublicGeneratorCapacityContractV3") throw new Error(`PGC_R03_V3_REQUIRED:${contract.schemaName ?? "unknown"}`);

  const applicationRoutes = safeArray(contract.routes).filter((route) => route.questionType === APPLICATION_QUESTION_TYPE);
  const legalRoutes = applicationRoutes.filter((route) => route.legalRoute === true);

  const priorDocument = globalThis.document;
  if (typeof globalThis.document === "undefined") globalThis.document = { getElementById: () => null, body: null };
  const { buildWorksheetDocumentFromPlan } = await import("../../site/assets/browser/pipeline/build-worksheet-document.js");
  const diagnostics = [];
  try {
    for (const [index, route] of legalRoutes.entries()) diagnostics.push(await diagnoseRoute(buildWorksheetDocumentFromPlan, route, index, legalRoutes.length));
  } finally {
    if (priorDocument === undefined) delete globalThis.document;
    else globalThis.document = priorDocument;
  }

  const repairRoutes = diagnostics.filter((row) => row.requiresRepair);
  const liveFailureRoutes = diagnostics.filter((row) => !row.accepted20AcrossSeeds);
  const repairRouteCountBySource = Object.fromEntries([...new Set(repairRoutes.map((row) => row.sourceId))]
    .sort()
    .map((sourceId) => [sourceId, repairRoutes.filter((row) => row.sourceId === sourceId).length]));
  const liveFailureRouteCountBySource = Object.fromEntries([...new Set(liveFailureRoutes.map((row) => row.sourceId))]
    .sort()
    .map((sourceId) => [sourceId, liveFailureRoutes.filter((row) => row.sourceId === sourceId).length]));
  const summary = {
    applicationRouteCount: applicationRoutes.length,
    legalApplicationRouteCount: legalRoutes.length,
    illegalApplicationRouteCount: applicationRoutes.length - legalRoutes.length,
    contractVerified20RouteCount: legalRoutes.filter((route) => route.verifiedMaxQuestionCount === HARD_CEILING).length,
    contractLimitedRouteCount: legalRoutes.filter((route) => route.verifiedMaxQuestionCount < HARD_CEILING).length,
    contractQualityGapRouteCount: legalRoutes.filter((route) => route.qualityStatus !== "DIVERSE_PARAMETER_GENERATOR").length,
    live20PassRouteCount: diagnostics.filter((row) => row.accepted20AcrossSeeds).length,
    live20FailRouteCount: diagnostics.filter((row) => !row.accepted20AcrossSeeds).length,
    repairRouteCount: repairRoutes.length,
    zeroSafeCapacityRouteCount: legalRoutes.filter((route) => route.verifiedMaxQuestionCount === 0).length,
    repairRouteCountBySource,
    liveFailureRouteCountBySource,
  };
  const report = {
    schemaName: "PublicApplicationGenerationGapDiagnosticsV1",
    schemaVersion: 1,
    programId: "PUBLIC_KP_GENERATION_CONFORMANCE_V1",
    taskId: "PGC-R05_ApplicationGenerationFullFix_RuntimeGapDiagnostics",
    status: reportStatus(summary),
    sourceContract: "data/curriculum/public-generation/generator_capacity_contract.json",
    applicationQuestionType: APPLICATION_QUESTION_TYPE,
    diagnosticSeeds: [...DIAGNOSTIC_SEEDS],
    summary,
    routes: diagnostics,
    boundary: {
      numericRoutesModified: false,
      reasoningMixedOrPblRoutesModified: false,
      globalApplicationAuthorityReplaced: false,
      secondGeneratorAdded: false,
      secondValidatorAdded: false,
      secondWorksheetPipelineAdded: false,
      slice014Started: false,
    },
  };
  fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);
  writeCsv(diagnostics);
  writeReadback(report);
  console.log(`PGC_R05_DIAGNOSTIC_SUMMARY=${JSON.stringify(summary)}`);
  return report;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await materializePgcR05ApplicationGapDiagnostics();

// PGC-R05 live progress readback controller V1
