import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const publicGenerationDir = path.join(repoRoot, "data/curriculum/public-generation");
const docsDir = path.join(repoRoot, "docs/curriculum/output");
const inventoryPath = path.join(publicGenerationDir, "PGC-R06.reasoning-mixed-pbl-inventory.json");
const outputPath = path.join(publicGenerationDir, "PGC-R06-A01.g4b-u04-bounded-capacity-diagnostics.json");
const csvPath = path.join(publicGenerationDir, "PGC-R06-A01.g4b-u04-bounded-capacity-diagnostics.csv");
const readbackPath = path.join(docsDir, "PGC-R06-A01_G4B_U04_bounded_capacity_diagnostics.md");

const PROGRAM_ID = "PUBLIC_KP_GENERATION_CONFORMANCE_V1";
const TASK_ID = "PGC-R06-A01_BoundedCapacityReasoningMixedPBLRouteFullFix";
const SOURCE_ID = "g4b_u04_4b04";
const HARD_CEILING = 20;
const EXPECTED_ROUTE_COUNT = 15;
const DIAGNOSTIC_SEEDS = Object.freeze(["pgc-r06-a01-g4b-u04-01", "pgc-r06-a01-g4b-u04-02"]);

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
    ["questionDisplayModels", document?.questionDisplayModels],
    ["generatedQuestions", document?.generatedQuestions],
    ["questions", document?.questions],
    ["answerKeyItems", document?.answerKeyItems],
  ]) {
    if (safeArray(candidate).length > 0) return { projection, items: candidate };
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
  const summaries = items.map(summarizeItem);
  const promptHashes = summaries.map((item) => item.promptHash);
  const run = {
    seed,
    requestedQuestionCount: HARD_CEILING,
    ok: thrownError == null && result?.ok === true,
    thrownError: thrownError ? String(thrownError?.stack ?? thrownError) : null,
    errorCodes: errorCodes(result),
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

function csv(value) {
  const text = value == null ? "" : Array.isArray(value) ? value.join("|") : typeof value === "object" ? JSON.stringify(value) : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function writeCsv(routes) {
  const columns = [
    "routeId", "selectionMode", "knowledgePointIds", "questionType", "contextMode", "currentVerifiedMaxQuestionCount",
    "liveAccepted20AcrossSeeds", "liveFailureCodes", "seed1UniquePromptCount", "seed2UniquePromptCount",
    "seed1ItemSetSignature", "seed2ItemSetSignature",
  ];
  const rows = routes.map((route) => ({
    routeId: route.routeId,
    selectionMode: route.selectionMode,
    knowledgePointIds: route.selectedKnowledgePointIds,
    questionType: route.questionType,
    contextMode: route.contextMode,
    currentVerifiedMaxQuestionCount: route.currentVerifiedMaxQuestionCount,
    liveAccepted20AcrossSeeds: route.liveAccepted20AcrossSeeds,
    liveFailureCodes: route.liveFailureCodes,
    seed1UniquePromptCount: route.diagnosticRuns[0]?.uniquePromptCount,
    seed2UniquePromptCount: route.diagnosticRuns[1]?.uniquePromptCount,
    seed1ItemSetSignature: route.diagnosticRuns[0]?.itemSetSignature,
    seed2ItemSetSignature: route.diagnosticRuns[1]?.itemSetSignature,
  }));
  fs.writeFileSync(csvPath, `${[columns.join(","), ...rows.map((row) => columns.map((column) => csv(row[column])).join(","))].join("\n")}\n`);
}

function writeReadback(report) {
  const s = report.summary;
  const lines = [
    "# PGC-R06 A01 G4B-U04 Bounded Capacity Live Diagnostics",
    "",
    "```text",
    `PROGRAM_ID = ${report.programId}`,
    `TASK_ID    = ${report.taskId}`,
    `STATUS     = ${report.status}`,
    "```",
    "",
    "## Live acceptance",
    "",
    "```text",
    `TARGET_ROUTES          = ${s.targetRouteCount}`,
    `LIVE_20_PASS_ROUTES    = ${s.live20PassRouteCount}`,
    `LIVE_20_FAIL_ROUTES    = ${s.live20FailRouteCount}`,
    `MIXED_ROUTES           = ${s.routeCountByQuestionType.mixed ?? 0}`,
    `REASONING_ROUTES       = ${s.routeCountByQuestionType.reasoning ?? 0}`,
    `PBL_ROUTES_MODIFIED    = 0`,
    `R04_R05_ROUTES_MODIFIED = 0`,
    "```",
    "",
    "## Route results",
    "",
    "| Route | KP | Type | Context | Before | Live |",
    "|---|---|---|---|---:|---:|",
    ...report.routes.map((route) => `| \`${route.routeId}\` | ${route.selectedKnowledgePointIds.map((id) => `\`${id}\``).join("<br>")} | ${route.questionType} | ${route.contextMode ?? "-"} | ${route.currentVerifiedMaxQuestionCount} | ${route.liveAccepted20AcrossSeeds ? 20 : "FAIL"} |`),
    "",
    "## Distance",
    "",
    "```text",
    "GOAL_DISTANCE_BEFORE = D1_R06_148_REPAIR_ROUTES_FROZEN",
    s.live20FailRouteCount === 0
      ? "GOAL_DISTANCE_AFTER  = D1_R06_G4B_U04_15_BOUNDED_ROUTES_LIVE_20_CONFORMANT_PENDING_CONTRACT_RECONCILIATION"
      : `GOAL_DISTANCE_AFTER  = D1_R06_G4B_U04_${s.live20PassRouteCount}_OF_${s.targetRouteCount}_BOUNDED_ROUTES_LIVE_CONFORMANT`,
    `DISTANCE_REDUCED     = ${s.live20PassRouteCount}/${s.targetRouteCount} G4B-U04 bounded mixed/reasoning routes now have two 20-question live worksheets with unique prompts and complete answer keys`,
    `REMAINING_BLOCKERS   = [${s.live20FailRouteCount === 0 ? "R06_A01_CAPACITY_CONTRACT_RECONCILIATION" : "R06_A01_LIVE_RUNTIME_FAILURES"}]`,
    `NEXT_SHORTEST_STEP   = ${s.live20FailRouteCount === 0 ? "PGC-R06-A01_CapacityContractReconciliationAndCloseout" : "PGC-R06-A01_G4BU04RemainingLiveRouteRepair"}`,
    "```",
    "",
  ];
  fs.writeFileSync(readbackPath, `${lines.join("\n")}\n`);
}

export async function materializePgcR06A01G4BU04BoundedCapacityDiagnostics() {
  const inventory = readJson(inventoryPath, "PGC_R06_A00_INVENTORY_MISSING");
  const targets = safeArray(inventory.repairQueue).filter((route) =>
    route.sourceId === SOURCE_ID
    && route.legalRoute === true
    && safeArray(route.gapCodes).includes("CAPACITY_BELOW_20")
    && ["mixed", "reasoning"].includes(route.questionType),
  );
  if (targets.length !== EXPECTED_ROUTE_COUNT) throw new Error(`PGC_R06_A01_TARGET_ROUTE_COUNT_MISMATCH:${targets.length}`);
  if (targets.some((route) => route.questionType === "pbl")) throw new Error("PGC_R06_A01_PBL_SCOPE_LEAKAGE");

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
        routeId: route.routeId,
        sourceId: route.sourceId,
        selectionMode: route.selectionMode,
        selectedKnowledgePointIds: safeArray(route.selectedKnowledgePointIds),
        questionType: route.questionType,
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
      console.log(`PGC_R06_A01_DIAGNOSTIC_PROGRESS=${index + 1}/${targets.length}:${route.routeId}`);
    }
  } finally {
    if (priorDocument === undefined) delete globalThis.document;
    else globalThis.document = priorDocument;
  }

  const routeCountByQuestionType = Object.fromEntries(["mixed", "reasoning"].map((type) => [type, routes.filter((route) => route.questionType === type).length]));
  const summary = {
    targetRouteCount: routes.length,
    live20PassRouteCount: routes.filter((route) => route.liveAccepted20AcrossSeeds).length,
    live20FailRouteCount: routes.filter((route) => !route.liveAccepted20AcrossSeeds).length,
    routeCountByQuestionType,
    distinctKnowledgePointCount: new Set(routes.flatMap((route) => route.selectedKnowledgePointIds)).size,
  };
  const report = {
    schemaName: "PublicG4BU04BoundedReasoningMixedCapacityDiagnosticsV1",
    schemaVersion: 1,
    programId: PROGRAM_ID,
    taskId: TASK_ID,
    status: summary.live20FailRouteCount === 0
      ? "PASS_R06_A01_G4BU04_ALL_15_BOUNDED_ROUTES_LIVE_20_CONFORMANT_PENDING_CONTRACT_RECONCILIATION"
      : `PASS_R06_A01_G4BU04_${summary.live20PassRouteCount}_OF_${summary.targetRouteCount}_BOUNDED_ROUTES_LIVE_20_CONFORMANT`,
    diagnosticSeeds: [...DIAGNOSTIC_SEEDS],
    sourceInventory: path.relative(repoRoot, inventoryPath).replaceAll(path.sep, "/"),
    summary,
    routes,
    boundary: {
      pblRoutesModified: false,
      numericRoutesModified: false,
      applicationRoutesModified: false,
      secondGeneratorAdded: false,
      secondValidatorAdded: false,
      secondWorksheetPipelineAdded: false,
      slice014Started: false,
    },
  };
  fs.mkdirSync(publicGenerationDir, { recursive: true });
  fs.mkdirSync(docsDir, { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);
  writeCsv(routes);
  writeReadback(report);
  console.log(`PGC_R06_A01_DIAGNOSTIC_SUMMARY=${JSON.stringify(summary)}`);
  return report;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await materializePgcR06A01G4BU04BoundedCapacityDiagnostics();
