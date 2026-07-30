import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const publicDir = path.join(repoRoot, "data/curriculum/public-generation");
const docsDir = path.join(repoRoot, "docs/curriculum/output");
const inventoryPath = path.join(publicDir, "PGC-R06.reasoning-mixed-pbl-inventory.json");
const outputPath = path.join(publicDir, "PGC-R06-A02.g5a-u02-live-diagnostics.json");
const csvPath = path.join(publicDir, "PGC-R06-A02.g5a-u02-live-diagnostics.csv");
const readbackPath = path.join(docsDir, "PGC-R06-A02_G5A_U02_live_diagnostics.md");

const PROGRAM_ID = "PUBLIC_KP_GENERATION_CONFORMANCE_V1";
const TASK_ID = "PGC-R06-A02_BoundedCapacityReasoningMixedPBLRouteFullFix";
const SOURCE_ID = "g5a_u02_5a02";
const HARD_CEILING = 20;
const EXPECTED_QUEUE_ROUTE_COUNT = 98;
const DIAGNOSTIC_SEEDS = Object.freeze(["pgc-r06-a02-g5a-u02-01", "pgc-r06-a02-g5a-u02-02"]);

const safeArray = (value) => Array.isArray(value) ? value : [];
const unique = (values) => [...new Set(safeArray(values).filter(Boolean).map(String))];
const stableHash = (value, length = 20) => crypto.createHash("sha256").update(String(value)).digest("hex").slice(0, length);

function readJson(filePath, code) {
  if (!fs.existsSync(filePath)) throw new Error(code);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

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

function patternSpecId(item) {
  return item?.patternSpecId
    ?? item?.patternId
    ?? item?.metadataSnapshot?.patternSpecId
    ?? item?.metadataSnapshot?.patternId
    ?? item?.metadata?.patternSpecId
    ?? item?.metadata?.patternId
    ?? null;
}

function evidenceItems(result) {
  const document = result?.worksheetDocument;
  for (const [projection, candidate] of [
    ["questionItems", document?.questionItems],
    ["questionDisplayModels", document?.questionDisplayModels],
    ["generatedQuestions", document?.generatedQuestions],
    ["questions", document?.questions],
    ["answerKeyItems", document?.answerKeyItems],
  ]) {
    if (safeArray(candidate).length > 0) return { projection, items: candidate };
  }
  return { projection: "none", items: [] };
}

function errorCodes(result, thrownError = null) {
  const codes = safeArray(result?.errors ?? result?.validation?.errors).map((error) => error?.code ?? String(error));
  if (thrownError) codes.push(String(thrownError?.message ?? thrownError).split("\n")[0]);
  return unique(codes);
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
    questionMode: route.questionType,
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
    itemSignature: stableHash(JSON.stringify({ prompt, answer, patternSpecId: patternSpecId(item) })),
    patternSpecId: patternSpecId(item),
    knowledgePointIds: unique([
      item?.knowledgePointId,
      ...safeArray(item?.knowledgePointIds),
      item?.metadataSnapshot?.knowledgePointId,
      ...safeArray(item?.metadataSnapshot?.knowledgePointIds),
      item?.metadata?.knowledgePointId,
      ...safeArray(item?.metadata?.knowledgePointIds),
    ]),
  };
}

function runtimeLineage(result) {
  const document = result?.worksheetDocument;
  return {
    browserResolutionMode: result?.browserResolution?.mode ?? null,
    browserPlanSourceId: result?.browserResolution?.plan?.sourceId ?? null,
    sourceUnitAdapterStatus: result?.sourceUnitAdaptation?.status ?? result?.sourceUnitAdaptation?.adapterStatus ?? null,
    sourceUnitAdapterId: result?.sourceUnitAdaptation?.adapterId ?? result?.sourceUnitAdaptation?.adapter ?? null,
    documentSchemaName: document?.schemaName ?? null,
    documentSelectionMode: document?.selectionMode ?? null,
    documentQuestionMode: document?.metadata?.questionMode ?? document?.publicControls?.questionMode ?? null,
    dynamicProductionUse: document?.lifecycle?.productionUse ?? null,
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
  const summaries = items.map(summarizeItem);
  const promptHashes = summaries.map((item) => item.promptHash);
  const run = {
    seed,
    requestedQuestionCount: HARD_CEILING,
    ok: thrownError == null && result?.ok === true,
    thrownError: thrownError ? String(thrownError?.stack ?? thrownError) : null,
    errorCodes: errorCodes(result, thrownError),
    evidenceProjection: projection,
    questionCount: summaries.length,
    answerKeyItemCount: safeArray(result?.worksheetDocument?.answerKeyItems).length,
    emptyPromptCount: summaries.filter((item) => !item.prompt).length,
    duplicatePromptCount: promptHashes.length - new Set(promptHashes).size,
    uniquePromptCount: new Set(promptHashes).size,
    patternSpecIdsObserved: unique(summaries.map((item) => item.patternSpecId)),
    knowledgePointIdsObserved: unique(summaries.flatMap((item) => item.knowledgePointIds)),
    worksheetSignature: stableHash(JSON.stringify(summaries.map((item) => item.itemSignature))),
    itemSetSignature: stableHash(JSON.stringify([...summaries.map((item) => item.itemSignature)].sort())),
    runtimeLineage: runtimeLineage(result),
    itemSamples: summaries.slice(0, 3),
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

function countBy(rows, valueFn) {
  const counts = new Map();
  for (const row of rows) {
    for (const value of safeArray(valueFn(row))) counts.set(String(value), (counts.get(String(value)) ?? 0) + 1);
  }
  return Object.fromEntries([...counts.entries()].sort(([a], [b]) => a.localeCompare(b)));
}

function csv(value) {
  const text = value == null ? "" : Array.isArray(value) ? value.join("|") : typeof value === "object" ? JSON.stringify(value) : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function writeCsv(routes) {
  const columns = [
    "queuePosition", "routeId", "selectionMode", "knowledgePointIds", "questionType", "depthMode", "contextMode",
    "contractCapacity", "liveAccepted20AcrossSeeds", "liveFailureCodes", "runtimeErrorCodes",
    "seed1QuestionCount", "seed1UniquePromptCount", "seed2QuestionCount", "seed2UniquePromptCount",
    "patternSpecIdsObserved",
  ];
  const rows = routes.map((route) => ({
    queuePosition: route.queuePosition,
    routeId: route.routeId,
    selectionMode: route.selectionMode,
    knowledgePointIds: route.selectedKnowledgePointIds,
    questionType: route.questionType,
    depthMode: route.depthMode,
    contextMode: route.contextMode,
    contractCapacity: route.currentVerifiedMaxQuestionCount,
    liveAccepted20AcrossSeeds: route.liveAccepted20AcrossSeeds,
    liveFailureCodes: route.liveFailureCodes,
    runtimeErrorCodes: unique(route.diagnosticRuns.flatMap((run) => run.errorCodes)),
    seed1QuestionCount: route.diagnosticRuns[0]?.questionCount,
    seed1UniquePromptCount: route.diagnosticRuns[0]?.uniquePromptCount,
    seed2QuestionCount: route.diagnosticRuns[1]?.questionCount,
    seed2UniquePromptCount: route.diagnosticRuns[1]?.uniquePromptCount,
    patternSpecIdsObserved: unique(route.diagnosticRuns.flatMap((run) => run.patternSpecIdsObserved)),
  }));
  fs.writeFileSync(csvPath, `${[columns.join(","), ...rows.map((row) => columns.map((column) => csv(row[column])).join(","))].join("\n")}\n`);
}

function nextStep(report) {
  const firstFailure = report.routes.find((route) => !route.liveAccepted20AcrossSeeds) ?? null;
  if (!firstFailure) return "PGC-R06-A02_G5AU02CapacityContractReconciliationAndCloseout";
  const errorCodes = unique(firstFailure.diagnosticRuns.flatMap((run) => run.errorCodes));
  const primary = errorCodes[0] ?? firstFailure.liveFailureCodes[0] ?? "UNKNOWN";
  return `PGC-R06-A02_G5AU02_${primary.replace(/[^A-Za-z0-9]+/g, "_")}_FullFix`;
}

function writeReadback(report) {
  const s = report.summary;
  const lines = [
    "# PGC-R06 A02 G5A-U02 Live Diagnostics",
    "",
    "```text",
    `PROGRAM_ID = ${PROGRAM_ID}`,
    `TASK_ID    = ${TASK_ID}`,
    `STATUS     = ${report.status}`,
    "```",
    "",
    "## Live results",
    "",
    "```text",
    `TARGET_QUEUE_ROUTES = ${s.targetRouteCount}`,
    `LIVE_20_PASS        = ${s.live20PassRouteCount}`,
    `LIVE_20_FAIL        = ${s.live20FailRouteCount}`,
    `CAPACITY_STALE_PASS = ${s.staleContractPassRouteCount}`,
    "```",
    "",
    "## Failures by runtime error",
    "",
    ...(Object.keys(s.failureCountByRuntimeErrorCode).length
      ? Object.entries(s.failureCountByRuntimeErrorCode).map(([code, count]) => `- \`${code}\`: ${count}`)
      : ["- none"]),
    "",
    "## Failures by depth/context",
    "",
    ...Object.entries(s.failureCountByDepthMode).map(([key, value]) => `- depth \`${key}\`: ${value}`),
    ...Object.entries(s.failureCountByContextMode).map(([key, value]) => `- context \`${key}\`: ${value}`),
    "",
    "## First failed routes",
    "",
    ...report.routes.filter((route) => !route.liveAccepted20AcrossSeeds).slice(0, 20)
      .map((route) => `- \`${route.routeId}\` — ${route.selectionMode} / ${route.questionType} / ${route.depthMode ?? "-"} / ${route.contextMode ?? "-"} — ${route.diagnosticRuns.flatMap((run) => run.errorCodes).join(", ") || route.liveFailureCodes.join(", ")}`),
    "",
    "## Distance",
    "",
    "```text",
    "GOAL_DISTANCE_BEFORE = D1_R06_REPAIR_QUEUE_133",
    `GOAL_DISTANCE_AFTER  = D1_R06_G5A_U02_LIVE_${s.live20PassRouteCount}_OF_${s.targetRouteCount}_CLASSIFIED`,
    `DISTANCE_REDUCED     = all ${s.targetRouteCount} queued G5A-U02 routes now have two-seed public-pipeline evidence and producer-family failure classification`,
    `REMAINING_BLOCKERS   = [${s.live20FailRouteCount ? "G5A_U02_LIVE_CAPACITY_FAILURES" : "G5A_U02_CONTRACT_RECONCILIATION"}]`,
    `NEXT_SHORTEST_STEP   = ${report.nextShortestStep}`,
    "```",
    "",
  ];
  fs.writeFileSync(readbackPath, `${lines.join("\n")}\n`);
}

export async function materializePgcR06A02G5AU02LiveDiagnostics() {
  const inventory = readJson(inventoryPath, "PGC_R06_A02_INVENTORY_MISSING");
  const targets = safeArray(inventory.repairQueue).filter((route) => route.sourceId === SOURCE_ID);
  if (targets.length !== EXPECTED_QUEUE_ROUTE_COUNT) throw new Error(`PGC_R06_A02_TARGET_ROUTE_COUNT_MISMATCH:${targets.length}`);
  if (targets.some((route) => route.legalRoute !== true || safeArray(route.gapCodes).length === 0)) {
    throw new Error("PGC_R06_A02_TARGET_SCOPE_INVALID");
  }

  const priorDocument = globalThis.document;
  if (typeof globalThis.document === "undefined") globalThis.document = { getElementById: () => null, body: null };
  const { buildWorksheetDocumentFromPlan } = await import("../../site/assets/browser/pipeline/build-worksheet-document.js");
  const routes = [];
  try {
    for (const [index, route] of targets.entries()) {
      const diagnosticRuns = [];
      for (const seed of DIAGNOSTIC_SEEDS) diagnosticRuns.push(await runOne(buildWorksheetDocumentFromPlan, route, seed));
      const liveFailureCodes = unique(diagnosticRuns.flatMap((run) => run.acceptanceFailures));
      routes.push({
        queuePosition: index + 1,
        routeId: route.routeId,
        sourceId: route.sourceId,
        selectionMode: route.selectionMode,
        selectedKnowledgePointIds: safeArray(route.selectedKnowledgePointIds),
        questionType: route.questionType,
        depthMode: route.depthMode ?? null,
        contextMode: route.contextMode ?? null,
        generationPatternGroupIds: safeArray(route.generationPatternGroupIds),
        compatiblePatternSpecIds: safeArray(route.compatiblePatternSpecIds),
        currentVerifiedMaxQuestionCount: route.verifiedMaxQuestionCount,
        currentQualityStatus: route.qualityStatus,
        currentGapCodes: safeArray(route.gapCodes),
        liveFailureCodes,
        liveAccepted20AcrossSeeds: liveFailureCodes.length === 0 && diagnosticRuns.length === DIAGNOSTIC_SEEDS.length,
        diagnosticRuns,
      });
      console.log(`PGC_R06_A02_DIAGNOSTIC_PROGRESS=${index + 1}/${targets.length}:${route.routeId}`);
    }
  } finally {
    if (priorDocument === undefined) delete globalThis.document;
    else globalThis.document = priorDocument;
  }

  const failures = routes.filter((route) => !route.liveAccepted20AcrossSeeds);
  const runtimeErrorRows = failures.flatMap((route) => unique(route.diagnosticRuns.flatMap((run) => run.errorCodes)).map((errorCode) => ({ errorCode })));
  const summary = {
    targetRouteCount: routes.length,
    live20PassRouteCount: routes.length - failures.length,
    live20FailRouteCount: failures.length,
    staleContractPassRouteCount: routes.filter((route) => route.liveAccepted20AcrossSeeds && route.currentVerifiedMaxQuestionCount < HARD_CEILING).length,
    failureCountByRuntimeErrorCode: countBy(runtimeErrorRows, (row) => [row.errorCode]),
    failureCountBySelectionMode: countBy(failures, (route) => [route.selectionMode]),
    failureCountByQuestionType: countBy(failures, (route) => [route.questionType]),
    failureCountByDepthMode: countBy(failures, (route) => [route.depthMode ?? "none"]),
    failureCountByContextMode: countBy(failures, (route) => [route.contextMode ?? "none"]),
    failureCountByKnowledgePointId: countBy(failures, (route) => route.selectedKnowledgePointIds),
    failureCountByPatternSpecId: countBy(failures, (route) => unique(route.diagnosticRuns.flatMap((run) => run.patternSpecIdsObserved))),
  };
  const report = {
    schemaName: "PublicG5AU02ReasoningMixedPblLiveDiagnosticsV1",
    schemaVersion: 1,
    programId: PROGRAM_ID,
    taskId: TASK_ID,
    status: failures.length === 0
      ? "PASS_R06_A02_G5AU02_ALL_98_ROUTES_LIVE_20_CONFORMANT_PENDING_CONTRACT_RECONCILIATION"
      : `PASS_R06_A02_G5AU02_${summary.live20PassRouteCount}_OF_${summary.targetRouteCount}_ROUTES_LIVE_20_CONFORMANT_WITH_CLASSIFIED_FAILURES`,
    diagnosticSeeds: [...DIAGNOSTIC_SEEDS],
    sourceInventory: path.relative(repoRoot, inventoryPath).replaceAll(path.sep, "/"),
    summary,
    routes,
    nextShortestStep: null,
    boundary: {
      generatorModified: false,
      validatorModified: false,
      rendererModified: false,
      uiModified: false,
      contractModified: false,
      secondWorksheetPipelineAdded: false,
      slice014Started: false,
    },
  };
  report.nextShortestStep = nextStep(report);
  fs.mkdirSync(publicDir, { recursive: true });
  fs.mkdirSync(docsDir, { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);
  writeCsv(routes);
  writeReadback(report);
  console.log(`PGC_R06_A02_DIAGNOSTIC_SUMMARY=${JSON.stringify(summary)}`);
  return report;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await materializePgcR06A02G5AU02LiveDiagnostics();

// PGC-R06 A02 classify all legal G5A-U02 queue gaps V1
