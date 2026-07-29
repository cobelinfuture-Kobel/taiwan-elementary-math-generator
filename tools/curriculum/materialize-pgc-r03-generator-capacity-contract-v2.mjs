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
const mismatchPath = path.join(docsDir, "PGC-R03_capacity_mismatch_report.md");

const DEFAULT_QUESTION_COUNT = 20;
const SEED_COUNT = 10;
const SEEDS = Object.freeze(Array.from({ length: SEED_COUNT }, (_, index) => `pgc-r03-seed-${String(index + 1).padStart(2, "0")}`));
const GENERATOR_CLASSES = Object.freeze([
  "TRUE_PARAMETER_GENERATOR",
  "BOUNDED_PARAMETER_GENERATOR",
  "FIXTURE_SELECTOR",
  "RETRY_EXHAUSTION_RISK",
  "CAPACITY_DEFICIENT",
]);

const safeArray = (value) => Array.isArray(value) ? value : [];
const unique = (values) => [...new Set((values ?? []).filter(Boolean))];
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
  const candidates = [
    document?.questionDisplayModels,
    document?.generatedQuestions,
    document?.questions,
    document?.answerKeyItems,
  ];
  for (const candidate of candidates) {
    if (safeArray(candidate).length > 0) return candidate;
  }
  return [];
}

function itemSignature(item) {
  return stableHash(JSON.stringify({
    prompt: promptText(item),
    answer: answerText(item),
    patternId: patternId(item),
  }), 24);
}

function errorCodes(result) {
  return unique(safeArray(result?.errors ?? result?.validation?.errors).map((error) => error?.code ?? String(error)));
}

function planForRoute(route, seed) {
  const plan = {
    sourceId: route.sourceId,
    questionCount: DEFAULT_QUESTION_COUNT,
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

function summarizeRun(route, seed, result, thrownError = null) {
  const items = capacityItems(result);
  const prompts = items.map(promptText);
  const itemSignatures = items.map(itemSignature);
  const promptSignatures = prompts.map((prompt) => stableHash(prompt, 24));
  const answerKeyItems = safeArray(result?.worksheetDocument?.answerKeyItems);
  const missingPromptCount = prompts.filter((prompt) => !prompt).length;
  return {
    seed,
    ok: thrownError == null && result?.ok === true,
    thrownError: thrownError ? String(thrownError?.stack ?? thrownError) : null,
    errorCodes: errorCodes(result),
    evidenceProjection: safeArray(result?.worksheetDocument?.questionDisplayModels).length > 0
      ? "questionDisplayModels"
      : safeArray(result?.worksheetDocument?.generatedQuestions).length > 0
        ? "generatedQuestions"
        : safeArray(result?.worksheetDocument?.questions).length > 0
          ? "questions"
          : safeArray(result?.worksheetDocument?.answerKeyItems).length > 0
            ? "answerKeyItems"
            : "none",
    questionCount: items.length,
    answerKeyItemCount: answerKeyItems.length,
    missingPromptCount,
    duplicateItemCount: itemSignatures.length - new Set(itemSignatures).size,
    duplicatePromptCount: promptSignatures.length - new Set(promptSignatures).size,
    orderedWorksheetSignature: stableHash(itemSignatures.join("|"), 32),
    itemSetSignature: stableHash([...itemSignatures].sort().join("|"), 32),
    patternSpecIdsObserved: unique(items.map(patternId)),
    knowledgePointIdsObserved: unique(items.flatMap((item) => [
      item?.knowledgePointId,
      item?.metadataSnapshot?.knowledgePointId,
      item?.metadata?.knowledgePointId,
      ...safeArray(item?.knowledgePointIds),
      ...safeArray(item?.metadataSnapshot?.knowledgePointIds),
      ...safeArray(item?.metadata?.knowledgePointIds),
    ])),
    requestedRouteId: route.routeId,
  };
}

async function runOne(buildWorksheetDocumentFromPlan, route, seed) {
  try {
    const result = buildWorksheetDocumentFromPlan(planForRoute(route, seed));
    return summarizeRun(route, seed, result, null);
  } catch (error) {
    return summarizeRun(route, seed, null, error);
  }
}

function classify(runs, replayPassed) {
  const failed = runs.filter((run) => !run.ok
    || run.questionCount !== DEFAULT_QUESTION_COUNT
    || run.duplicatePromptCount > 0
    || run.missingPromptCount > 0);
  if (failed.length > 0) {
    const retryLike = failed.some((run) => /retry|exhaust|attempt/i.test(`${run.thrownError ?? ""}|${run.errorCodes.join("|")}`));
    return retryLike ? "RETRY_EXHAUSTION_RISK" : "CAPACITY_DEFICIENT";
  }
  if (!replayPassed) return "CAPACITY_DEFICIENT";
  const itemSetDiversity = new Set(runs.map((run) => run.itemSetSignature)).size;
  if (itemSetDiversity >= Math.max(8, SEED_COUNT - 2)) return "TRUE_PARAMETER_GENERATOR";
  if (itemSetDiversity >= 2) return "BOUNDED_PARAMETER_GENERATOR";
  return "FIXTURE_SELECTOR";
}

async function auditRoute(buildWorksheetDocumentFromPlan, route) {
  const seedRuns = [];
  for (const seed of SEEDS) seedRuns.push(await runOne(buildWorksheetDocumentFromPlan, route, seed));
  const replay = await runOne(buildWorksheetDocumentFromPlan, route, SEEDS[0]);
  const sameSeedReplayPassed = seedRuns[0].ok === replay.ok
    && seedRuns[0].orderedWorksheetSignature === replay.orderedWorksheetSignature
    && seedRuns[0].questionCount === replay.questionCount;
  const successfulRuns = seedRuns.filter((run) => run.ok);
  const uniqueOrderedWorksheetCount = new Set(successfulRuns.map((run) => run.orderedWorksheetSignature)).size;
  const uniqueItemSetCount = new Set(successfulRuns.map((run) => run.itemSetSignature)).size;
  const generatorClass = classify(seedRuns, sameSeedReplayPassed);
  const failureCodes = [];
  if (!sameSeedReplayPassed) failureCodes.push("SAME_SEED_NOT_REPRODUCIBLE");
  if (seedRuns.some((run) => !run.ok)) failureCodes.push("TEN_SEED_GENERATION_FAILURE");
  if (seedRuns.some((run) => run.questionCount !== DEFAULT_QUESTION_COUNT)) failureCodes.push("QUESTION_COUNT_MISMATCH");
  if (seedRuns.some((run) => run.answerKeyItemCount !== DEFAULT_QUESTION_COUNT)) failureCodes.push("ANSWER_KEY_COUNT_MISMATCH");
  if (seedRuns.some((run) => run.missingPromptCount > 0)) failureCodes.push("MISSING_PROMPT_EVIDENCE");
  if (seedRuns.some((run) => run.duplicatePromptCount > 0)) failureCodes.push("DUPLICATE_PROMPT_IN_WORKSHEET");
  if (uniqueItemSetCount < 2) failureCodes.push("CROSS_SEED_ITEM_DIVERSITY_DEFICIENT");
  const capacityStatus = failureCodes.length === 0 ? "VERIFIED_20" : "FAIL_CLOSED";
  return {
    ...route,
    defaultQuestionCount: DEFAULT_QUESTION_COUNT,
    seedCount: SEED_COUNT,
    sameSeedReplayPassed,
    successfulSeedCount: successfulRuns.length,
    failedSeedCount: SEED_COUNT - successfulRuns.length,
    minQuestionCountObserved: Math.min(...seedRuns.map((run) => run.questionCount)),
    maxQuestionCountObserved: Math.max(...seedRuns.map((run) => run.questionCount)),
    maxMissingPromptCount: Math.max(...seedRuns.map((run) => run.missingPromptCount)),
    maxDuplicatePromptCount: Math.max(...seedRuns.map((run) => run.duplicatePromptCount)),
    maxDuplicateItemCount: Math.max(...seedRuns.map((run) => run.duplicateItemCount)),
    uniqueOrderedWorksheetCount,
    uniqueItemSetCount,
    generatorClass,
    verifiedMaxQuestionCount: capacityStatus === "VERIFIED_20" ? 20 : 0,
    capacityStatus,
    failureCodes,
    seedRuns,
    replay,
  };
}

function rebuildBindingEvidence(existingBindingEvidence, routeResults) {
  const routeById = new Map(routeResults.map((route) => [route.routeId, route]));
  return existingBindingEvidence.map((binding) => {
    const routes = safeArray(binding.routeIds).map((routeId) => routeById.get(routeId)).filter(Boolean);
    const verifiedMaxQuestionCount = routes.length > 0 ? Math.min(...routes.map((route) => route.verifiedMaxQuestionCount)) : 0;
    return {
      ...binding,
      verifiedMaxQuestionCount,
      capacityStatus: routes.length > 0 && routes.every((route) => route.capacityStatus === "VERIFIED_20") ? "VERIFIED_20" : "FAIL_CLOSED",
    };
  });
}

function summaryFor(contract, routes, bindingEvidence) {
  const generatorClassCounts = Object.fromEntries(GENERATOR_CLASSES.map((name) => [name, routes.filter((route) => route.generatorClass === name).length]));
  return {
    ...contract.summary,
    bindingCount: bindingEvidence.length,
    bindingEvidenceCount: bindingEvidence.filter((binding) => binding.routeCount > 0).length,
    routeCount: routes.length,
    verified20RouteCount: routes.filter((route) => route.capacityStatus === "VERIFIED_20").length,
    failClosedRouteCount: routes.filter((route) => route.capacityStatus !== "VERIFIED_20").length,
    capacityMismatchBindingCount: bindingEvidence.filter((binding) => binding.capacityStatus !== "VERIFIED_20").length,
    sameSeedReproFailureCount: routes.filter((route) => !route.sameSeedReplayPassed).length,
    crossSeedDiversityFailureCount: routes.filter((route) => route.uniqueItemSetCount < 2).length,
    duplicatePromptRouteCount: routes.filter((route) => route.maxDuplicatePromptCount > 0).length,
    missingPromptRouteCount: routes.filter((route) => route.maxMissingPromptCount > 0).length,
    tenSeedFailureRouteCount: routes.filter((route) => route.failedSeedCount > 0).length,
    generatorClassCounts,
  };
}

function writeCsv(filePath, columns, rows) {
  const lines = [columns.join(",")];
  for (const row of rows) lines.push(columns.map((column) => csvEscape(row[column])).join(","));
  fs.writeFileSync(filePath, `${lines.join("\n")}\n`);
}

function writeMismatchReport(contract) {
  const mismatches = contract.routes.filter((route) => route.capacityStatus !== "VERIFIED_20");
  const lines = [
    "# PGC-R03 Capacity Mismatch Report",
    "",
    "```text",
    "PROGRAM_ID = PUBLIC_KP_GENERATION_CONFORMANCE_V1",
    "TASK_ID    = PGC-R03_PublicGeneratorCapacityContract",
    `STATUS     = ${contract.status}`,
    "```",
    "",
    "## Summary",
    "",
    "```text",
    `ROUTES                         = ${contract.summary.routeCount}`,
    `VERIFIED_20_ROUTES             = ${contract.summary.verified20RouteCount}`,
    `FAIL_CLOSED_ROUTES             = ${contract.summary.failClosedRouteCount}`,
    `BINDINGS_ACCOUNTED             = ${contract.summary.bindingEvidenceCount} / ${contract.summary.bindingCount}`,
    `CAPACITY_MISMATCH_BINDINGS     = ${contract.summary.capacityMismatchBindingCount}`,
    `SAME_SEED_REPRO_FAILURES       = ${contract.summary.sameSeedReproFailureCount}`,
    `CROSS_SEED_DIVERSITY_FAILURES  = ${contract.summary.crossSeedDiversityFailureCount}`,
    `MISSING_PROMPT_ROUTES          = ${contract.summary.missingPromptRouteCount}`,
    "```",
    "",
    "## Generator classes",
    "",
    "| Class | Count |",
    "|---|---:|",
    ...Object.entries(contract.summary.generatorClassCounts).map(([key, value]) => `| \`${key}\` | ${value} |`),
    "",
    "## Fail-closed routes",
    "",
    ...(mismatches.length === 0
      ? ["None."]
      : mismatches.map((route) => `- \`${route.routeId}\` — ${route.failureCodes.join(", ")} — source \`${route.sourceId}\`, type \`${route.questionType}\`, groups \`${safeArray(route.generationPatternGroupIds).join("|")}\``)),
    "",
    "## Distance update",
    "",
    "```text",
    "GOAL_DISTANCE_BEFORE = D1_KP_DRIVEN_UI_BINDING_CONFORMANT",
    `GOAL_DISTANCE_AFTER  = ${contract.status === "PASS" ? "D1_PUBLIC_GENERATOR_CAPACITY_VERIFIED" : "D1_GENERATOR_CAPACITY_FAIL_CLOSED"}`,
    "DISTANCE_REDUCED     = every legal public generation route is classified and linked to deterministic 20-question, replay and cross-seed evidence",
    "REMAINING_BLOCKERS   = [PGC-R04_TO_R08_PRODUCT_ACCEPTANCE]",
    "NEXT_SHORTEST_STEP   = PGC-R04_NumericGenerationFullFix",
    "```",
    "",
  ];
  fs.writeFileSync(mismatchPath, `${lines.join("\n")}\n`);
}

export async function materializePgcR03GeneratorCapacityContractV2() {
  if (!fs.existsSync(contractPath)) throw new Error("PGC_R03_V1_ROUTE_INVENTORY_MISSING");
  const prior = JSON.parse(fs.readFileSync(contractPath, "utf8"));
  const priorDocument = globalThis.document;
  if (typeof globalThis.document === "undefined") globalThis.document = { getElementById: () => null, body: null };
  const { buildWorksheetDocumentFromPlan } = await import("../../site/assets/browser/pipeline/build-worksheet-document.js");
  const routes = [];
  for (const [index, priorRoute] of prior.routes.entries()) {
    const routeDefinition = {
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
      depthMode: priorRoute.depthMode,
      contextMode: priorRoute.contextMode,
      declaredUiMaxQuestionCount: priorRoute.declaredUiMaxQuestionCount,
    };
    routes.push(await auditRoute(buildWorksheetDocumentFromPlan, routeDefinition));
    if ((index + 1) % 25 === 0 || index + 1 === prior.routes.length) console.log(`PGC_R03_V2_PROGRESS=${index + 1}/${prior.routes.length}`);
  }
  if (priorDocument === undefined) delete globalThis.document;
  else globalThis.document = priorDocument;

  const bindingEvidence = rebuildBindingEvidence(prior.bindingEvidence, routes);
  const summary = summaryFor(prior, routes, bindingEvidence);
  const status = summary.failClosedRouteCount === 0
    && summary.capacityMismatchBindingCount === 0
    && summary.bindingEvidenceCount === summary.bindingCount
    ? "PASS"
    : "FAIL_CLOSED";
  const contract = {
    ...prior,
    schemaName: "PublicGeneratorCapacityContractV2",
    schemaVersion: 2,
    status,
    evidenceProjectionPolicy: ["questionDisplayModels", "generatedQuestions", "questions", "answerKeyItems"],
    summary,
    routes,
    bindingEvidence,
    mismatches: {
      routeIds: routes.filter((route) => route.capacityStatus !== "VERIFIED_20").map((route) => route.routeId),
      bindingIds: bindingEvidence.filter((binding) => binding.capacityStatus !== "VERIFIED_20").map((binding) => binding.bindingId),
    },
  };
  fs.writeFileSync(contractPath, `${JSON.stringify(contract, null, 2)}\n`);
  writeCsv(routeCsvPath, [
    "routeId", "caseId", "sourceId", "selectionMode", "selectedKnowledgePointIds", "questionType",
    "setKind", "publicPatternGroupIds", "generationPatternGroupIds", "compatiblePatternSpecIds",
    "depthMode", "contextMode", "declaredUiMaxQuestionCount", "verifiedMaxQuestionCount", "capacityStatus",
    "generatorClass", "successfulSeedCount", "failedSeedCount", "sameSeedReplayPassed",
    "uniqueOrderedWorksheetCount", "uniqueItemSetCount", "maxMissingPromptCount", "maxDuplicatePromptCount", "failureCodes",
  ], routes);
  writeCsv(diversityCsvPath, [
    "routeId", "sourceId", "questionType", "generatorClass", "seedCount", "successfulSeedCount",
    "sameSeedReplayPassed", "uniqueOrderedWorksheetCount", "uniqueItemSetCount", "crossSeedDiversityPassed",
  ], routes.map((route) => ({ ...route, crossSeedDiversityPassed: route.uniqueItemSetCount >= 2 })));
  writeMismatchReport(contract);
  console.log(`PGC_R03_V2_SUMMARY=${JSON.stringify(summary)}`);
  return contract;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const contract = await materializePgcR03GeneratorCapacityContractV2();
  if (contract.status !== "PASS") process.exitCode = 2;
}
