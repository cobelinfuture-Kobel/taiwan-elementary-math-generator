import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const contractPath = path.join(repoRoot, "data/curriculum/public-generation/generator_capacity_contract.json");
const outputPath = path.join(repoRoot, "data/curriculum/public-generation/PGC-R04.numeric-gap-diagnostics.json");
const csvPath = path.join(repoRoot, "data/curriculum/public-generation/numeric_generation_gap_inventory.csv");
const readbackPath = path.join(repoRoot, "docs/curriculum/output/PGC-R04_numeric_generation_gap_diagnostics.md");

const NUMERIC_LIKE_QUESTION_TYPES = new Set(["numeric", "concept", "operation_estimation"]);
const DIAGNOSTIC_SEEDS = Object.freeze(["pgc-r04-diagnostic-01", "pgc-r04-diagnostic-02"]);
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
  const projections = [
    ["questionDisplayModels", document?.questionDisplayModels],
    ["generatedQuestions", document?.generatedQuestions],
    ["questions", document?.questions],
    ["answerKeyItems", document?.answerKeyItems],
  ];
  for (const [name, candidate] of projections) {
    if (safeArray(candidate).length > 0) return { projection: name, items: candidate };
  }
  return { projection: "none", items: [] };
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

function summarizeItem(item) {
  const prompt = promptText(item);
  const answer = answerText(item);
  return {
    prompt,
    answer,
    promptHash: stableHash(prompt),
    itemSignature: stableHash(JSON.stringify({ prompt, answer, patternId: patternId(item) })),
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
    itemKeys: Object.keys(item ?? {}).sort(),
    dataKeys: Object.keys(item?.data ?? {}).sort(),
    metadataKeys: Object.keys(item?.metadataSnapshot ?? item?.metadata ?? {}).sort(),
  };
}

function runtimeLineage(result) {
  const document = result?.worksheetDocument;
  return {
    resultKeys: Object.keys(result ?? {}).sort(),
    worksheetKeys: Object.keys(document ?? {}).sort(),
    browserResolutionMode: result?.browserResolution?.mode ?? null,
    browserResolutionErrors: safeArray(result?.browserResolution?.errors),
    browserPlanSourceId: result?.browserResolution?.plan?.sourceId ?? null,
    sourceUnitAdapterStatus: result?.sourceUnitAdaptation?.status ?? result?.sourceUnitAdaptation?.adapterStatus ?? null,
    sourceUnitAdapterId: result?.sourceUnitAdaptation?.adapterId ?? result?.sourceUnitAdaptation?.adapter ?? null,
    authoritativeCutoverApplied: result?.authoritativeConsumerCutover?.applied ?? false,
    authoritativeCutoverAdapter: result?.authoritativeConsumerCutover?.adapter ?? null,
    documentQuestionMode: document?.metadata?.questionMode ?? document?.publicControls?.questionMode ?? null,
    documentAuthorityMode: document?.publicControls?.authorityMode ?? null,
    documentMetadataKeys: Object.keys(document?.metadata ?? {}).sort(),
    configSnapshotKeys: Object.keys(document?.configSnapshot ?? {}).sort(),
  };
}

function summarizeRun(route, seed, questionCount, result, thrownError = null) {
  const { projection, items } = evidenceItems(result);
  const summarizedItems = items.map(summarizeItem);
  const promptHashes = summarizedItems.map((item) => item.promptHash);
  const answerKeyItems = safeArray(result?.worksheetDocument?.answerKeyItems);
  return {
    seed,
    requestedQuestionCount: questionCount,
    ok: thrownError == null && result?.ok === true,
    thrownError: thrownError ? String(thrownError?.stack ?? thrownError) : null,
    errorCodes: errorCodes(result),
    warnings: safeArray(result?.warnings).map((warning) => warning?.code ?? String(warning)),
    evidenceProjection: projection,
    questionCount: items.length,
    answerKeyItemCount: answerKeyItems.length,
    duplicatePromptCount: promptHashes.length - new Set(promptHashes).size,
    uniquePromptCount: new Set(promptHashes).size,
    patternSpecIdsObserved: unique(summarizedItems.map((item) => item.patternSpecId)),
    knowledgePointIdsObserved: unique(summarizedItems.flatMap((item) => item.knowledgePointIds)),
    runtimeLineage: runtimeLineage(result),
    itemSamples: summarizedItems.slice(0, 5),
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

function routeNeedsR04(route) {
  return route.legalRoute === true
    && NUMERIC_LIKE_QUESTION_TYPES.has(route.questionType)
    && (route.verifiedMaxQuestionCount < HARD_CEILING || route.qualityStatus !== "DIVERSE_PARAMETER_GENERATOR");
}

function gapCodes(route) {
  const codes = [];
  if (route.verifiedMaxQuestionCount < HARD_CEILING) codes.push("CAPACITY_BELOW_20");
  if (route.qualityStatus === "FIXTURE_SELECTOR") codes.push("FIXTURE_SELECTOR");
  if (route.qualityStatus === "BOUNDED_DIVERSITY") codes.push("BOUNDED_DIVERSITY");
  if (route.verifiedMaxQuestionCount === 0) codes.push("ZERO_SAFE_CAPACITY");
  return codes;
}

async function diagnoseRoute(buildWorksheetDocumentFromPlan, route, index, total) {
  const counts = unique([HARD_CEILING, route.verifiedMaxQuestionCount].filter((count) => Number.isInteger(count) && count > 0));
  const runs = [];
  for (const questionCount of counts) {
    for (const seed of DIAGNOSTIC_SEEDS) runs.push(await runOne(buildWorksheetDocumentFromPlan, route, seed, questionCount));
  }
  console.log(`PGC_R04_DIAGNOSTIC_PROGRESS=${index + 1}/${total}:${route.routeId}`);
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
    r04GapCodes: gapCodes(route),
    diagnosticRuns: runs,
  };
}

function writeCsv(rows) {
  const columns = [
    "routeId", "sourceId", "selectionMode", "selectedKnowledgePointIds", "questionType", "setKind",
    "generationPatternGroupIds", "compatiblePatternSpecIds", "currentVerifiedMaxQuestionCount",
    "currentQualityStatus", "currentUniqueItemSetCount", "r04GapCodes",
  ];
  const lines = [columns.join(",")];
  for (const row of rows) lines.push(columns.map((column) => csvEscape(row[column])).join(","));
  fs.writeFileSync(csvPath, `${lines.join("\n")}\n`);
}

function writeReadback(report) {
  const summary = report.summary;
  const sourceRows = Object.entries(summary.gapRouteCountBySource).sort((a, b) => b[1] - a[1]);
  const lines = [
    "# PGC-R04 Numeric Generation Runtime Gap Diagnostics",
    "",
    "```text",
    "PROGRAM_ID = PUBLIC_KP_GENERATION_CONFORMANCE_V1",
    "TASK_ID    = PGC-R04_NumericGenerationFullFix_RuntimeGapDiagnostics",
    `STATUS     = ${report.status}`,
    "```",
    "",
    "## Baseline",
    "",
    "```text",
    `NUMERIC_LIKE_ROUTES       = ${summary.numericLikeRouteCount}`,
    `LEGAL_NUMERIC_LIKE_ROUTES = ${summary.legalNumericLikeRouteCount}`,
    `VERIFIED_20_ROUTES        = ${summary.verified20NumericLikeRouteCount}`,
    `LIMITED_ROUTES            = ${summary.limitedNumericLikeRouteCount}`,
    `QUALITY_GAP_ROUTES        = ${summary.qualityGapNumericLikeRouteCount}`,
    `DIAGNOSED_GAP_ROUTES      = ${summary.diagnosedGapRouteCount}`,
    "```",
    "",
    "## Gap ownership",
    "",
    "- R04 owns `numeric`, `concept`, and `operation_estimation` routes only.",
    "- Application routes remain owned by PGC-R05.",
    "- Reasoning, mixed, and PBL routes remain owned by PGC-R06 or later product acceptance.",
    "- The existing public worksheet pipeline is the only runtime consumer used by this diagnostic.",
    "",
    "## Routes by source",
    "",
    "| Source | Gap routes |",
    "|---|---:|",
    ...sourceRows.map(([sourceId, count]) => `| \`${sourceId}\` | ${count} |`),
    "",
    "## Next step",
    "",
    "```text",
    "GOAL_DISTANCE_BEFORE = D1_CAPACITY_AWARE_PUBLIC_ROUTES_CONFORMANT",
    "GOAL_DISTANCE_AFTER  = D1_NUMERIC_RUNTIME_GAPS_SOURCE_LOCATED",
    "DISTANCE_REDUCED     = every limited or low-diversity numeric-like route now has reproducible runtime item, error, projection and lineage evidence",
    "REMAINING_BLOCKERS   = [NUMERIC_CAPACITY_BELOW_20, NUMERIC_FIXTURE_SELECTOR, NUMERIC_BOUNDED_DIVERSITY]",
    "NEXT_SHORTEST_STEP   = PGC-R04_SharedNumericGeneratorAndAllocatorFullFix",
    "```",
    "",
  ];
  fs.writeFileSync(readbackPath, `${lines.join("\n")}\n`);
}

export async function materializePgcR04NumericGapDiagnostics() {
  if (!fs.existsSync(contractPath)) throw new Error("PGC_R03_CAPACITY_CONTRACT_MISSING");
  const contract = JSON.parse(fs.readFileSync(contractPath, "utf8"));
  if (contract.schemaName !== "PublicGeneratorCapacityContractV3") throw new Error(`PGC_R03_V3_REQUIRED:${contract.schemaName ?? "unknown"}`);

  const numericLikeRoutes = safeArray(contract.routes).filter((route) => NUMERIC_LIKE_QUESTION_TYPES.has(route.questionType));
  const legalRoutes = numericLikeRoutes.filter((route) => route.legalRoute === true);
  const gaps = legalRoutes.filter(routeNeedsR04);

  const priorDocument = globalThis.document;
  if (typeof globalThis.document === "undefined") globalThis.document = { getElementById: () => null, body: null };
  const { buildWorksheetDocumentFromPlan } = await import("../../site/assets/browser/pipeline/build-worksheet-document.js");
  const diagnostics = [];
  for (const [index, route] of gaps.entries()) diagnostics.push(await diagnoseRoute(buildWorksheetDocumentFromPlan, route, index, gaps.length));
  if (priorDocument === undefined) delete globalThis.document;
  else globalThis.document = priorDocument;

  const gapRouteCountBySource = Object.fromEntries([...new Set(diagnostics.map((row) => row.sourceId))]
    .sort()
    .map((sourceId) => [sourceId, diagnostics.filter((row) => row.sourceId === sourceId).length]));
  const summary = {
    numericLikeRouteCount: numericLikeRoutes.length,
    legalNumericLikeRouteCount: legalRoutes.length,
    illegalNumericLikeRouteCount: numericLikeRoutes.length - legalRoutes.length,
    verified20NumericLikeRouteCount: legalRoutes.filter((route) => route.verifiedMaxQuestionCount === HARD_CEILING).length,
    limitedNumericLikeRouteCount: legalRoutes.filter((route) => route.verifiedMaxQuestionCount < HARD_CEILING).length,
    qualityGapNumericLikeRouteCount: legalRoutes.filter((route) => route.qualityStatus !== "DIVERSE_PARAMETER_GENERATOR").length,
    diagnosedGapRouteCount: diagnostics.length,
    fixtureSelectorRouteCount: legalRoutes.filter((route) => route.qualityStatus === "FIXTURE_SELECTOR").length,
    boundedDiversityRouteCount: legalRoutes.filter((route) => route.qualityStatus === "BOUNDED_DIVERSITY").length,
    zeroSafeCapacityRouteCount: legalRoutes.filter((route) => route.verifiedMaxQuestionCount === 0).length,
    gapRouteCountBySource,
  };
  const report = {
    schemaName: "PublicNumericGenerationGapDiagnosticsV1",
    schemaVersion: 1,
    programId: "PUBLIC_KP_GENERATION_CONFORMANCE_V1",
    taskId: "PGC-R04_NumericGenerationFullFix_RuntimeGapDiagnostics",
    status: "PASS_DIAGNOSTIC_EVIDENCE_MATERIALIZED",
    sourceContract: "data/curriculum/public-generation/generator_capacity_contract.json",
    numericLikeQuestionTypes: [...NUMERIC_LIKE_QUESTION_TYPES],
    diagnosticSeeds: [...DIAGNOSTIC_SEEDS],
    summary,
    routes: diagnostics,
    boundary: {
      applicationRoutesModified: false,
      reasoningMixedOrPblRoutesModified: false,
      secondGeneratorAdded: false,
      secondValidatorAdded: false,
      secondWorksheetPipelineAdded: false,
      slice014Started: false,
    },
  };
  fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);
  writeCsv(diagnostics);
  writeReadback(report);
  console.log(`PGC_R04_DIAGNOSTIC_SUMMARY=${JSON.stringify(summary)}`);
  return report;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await materializePgcR04NumericGapDiagnostics();
