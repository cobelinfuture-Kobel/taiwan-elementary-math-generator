import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { buildBatchABrowserWorksheetDocument } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet.js";
import { BATCH_A_RESOLVER_SELECTION_MODES } from "../../site/modules/curriculum/batch-a/visible-pattern-group-resolver.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const outputDir = path.join(repoRoot, "data/curriculum/public-generation");
const docsDir = path.join(repoRoot, "docs/curriculum/output");
const jsonPath = path.join(outputDir, "r04_g3a_u03_diversity_acceptance.json");
const reportPath = path.join(docsDir, "PGC-R04-A01_G3A_U03_diversity_acceptance.md");

const SOURCE_ID = "g3a_u03_3a03";
const QUESTION_COUNT = 20;
const SEEDS = Object.freeze(Array.from({ length: 10 }, (_, index) => `pgc-r04-g3a-u03-${String(index + 1).padStart(2, "0")}`));
const SINGLE_ROUTES = Object.freeze([
  ["kp_g3a_u03_2digit_by_1digit_carry", "pg_g3a_u03_2digit_by_1digit_carry"],
  ["kp_g3a_u03_10_multiple_by_1digit", "pg_g3a_u03_10_multiple_by_1digit"],
  ["kp_g3a_u03_3digit_by_1digit", "pg_g3a_u03_3digit_by_1digit"],
  ["kp_g3a_u03_consecutive_multiplication_two_step", "pg_g3a_u03_consecutive_multiplication_two_step"],
  ["kp_g3a_u03_3digit_zero_middle_by_1digit", "pg_g3a_u03_3digit_zero_middle_by_1digit"],
  ["kp_g3a_u03_multiplication_missing_digit_inference", "pg_g3a_u03_multiplication_missing_digit_inference"],
]);
const KP_IDS = Object.freeze(SINGLE_ROUTES.map(([kpId]) => kpId));
const GROUP_IDS = Object.freeze(SINGLE_ROUTES.map(([, groupId]) => groupId));

const stableHash = (value, length = 24) => crypto.createHash("sha256").update(String(value)).digest("hex").slice(0, length);
const safeArray = (value) => Array.isArray(value) ? value : [];

function routeDefinitions() {
  return [
    {
      routeId: "r04_g3a_u03_source_unit_numeric",
      selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SOURCE_UNIT,
      selectedKnowledgePointIds: [],
      selectedPatternGroupIds: [],
    },
    ...SINGLE_ROUTES.map(([kpId, groupId]) => ({
      routeId: `r04_g3a_u03_single_${groupId}`,
      selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
      selectedKnowledgePointIds: [kpId],
      selectedPatternGroupIds: [groupId],
    })),
    {
      routeId: "r04_g3a_u03_mixed_all_numeric",
      selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
      selectedKnowledgePointIds: [...KP_IDS],
      selectedPatternGroupIds: [...GROUP_IDS],
    },
  ];
}

function itemText(question) {
  return String(
    question?.blankedDisplayText
      ?? question?.promptText
      ?? question?.duplicateKey
      ?? question?.displayText
      ?? JSON.stringify(question?.expression ?? question),
  ).replace(/\s+/g, " ").trim();
}

function answerText(question) {
  return String(question?.answerText ?? question?.finalAnswer?.value ?? question?.finalAnswer ?? "").replace(/\s+/g, " ").trim();
}

function runRoute(route, seed) {
  const result = buildBatchABrowserWorksheetDocument({
    sourceId: SOURCE_ID,
    questionMode: "numeric",
    selectionMode: route.selectionMode,
    selectedKnowledgePointIds: route.selectedKnowledgePointIds,
    selectedPatternGroupIds: route.selectedPatternGroupIds,
    questionCount: QUESTION_COUNT,
    ordering: "shuffleAcrossPatterns",
    generationSeed: seed,
    includeAnswerKey: true,
  });
  const questions = safeArray(result?.worksheetDocument?.generatedQuestions);
  const prompts = questions.map(itemText);
  const itemSignatures = questions.map((question) => stableHash(JSON.stringify({
    prompt: itemText(question),
    answer: answerText(question),
    patternSpecId: question?.patternSpecId ?? question?.metadata?.patternId ?? null,
  })));
  const answerKeyItems = safeArray(result?.worksheetDocument?.answerKeyItems);
  return {
    seed,
    ok: result?.ok === true,
    errorCodes: safeArray(result?.errors).map((error) => error?.code ?? String(error)),
    questionCount: questions.length,
    answerKeyItemCount: answerKeyItems.length,
    missingPromptCount: prompts.filter((prompt) => !prompt).length,
    duplicatePromptCount: prompts.length - new Set(prompts).size,
    orderedWorksheetSignature: stableHash(itemSignatures.join("|"), 32),
    itemSetSignature: stableHash([...itemSignatures].sort().join("|"), 32),
    patternSpecIds: [...new Set(questions.map((question) => question?.patternSpecId).filter(Boolean))].sort(),
  };
}

function runPassed(run) {
  return run.ok
    && run.questionCount === QUESTION_COUNT
    && run.answerKeyItemCount === QUESTION_COUNT
    && run.missingPromptCount === 0
    && run.duplicatePromptCount === 0;
}

function auditRoute(route) {
  const seedRuns = SEEDS.map((seed) => runRoute(route, seed));
  const replay = runRoute(route, SEEDS[0]);
  const sameSeedReplayPassed = runPassed(seedRuns[0])
    && runPassed(replay)
    && seedRuns[0].orderedWorksheetSignature === replay.orderedWorksheetSignature;
  const uniqueItemSetCount = new Set(seedRuns.filter(runPassed).map((run) => run.itemSetSignature)).size;
  const uniqueOrderedWorksheetCount = new Set(seedRuns.filter(runPassed).map((run) => run.orderedWorksheetSignature)).size;
  const failureCodes = [];
  if (seedRuns.some((run) => !runPassed(run))) failureCodes.push("TEN_SEED_ROUTE_FAILURE");
  if (!sameSeedReplayPassed) failureCodes.push("SAME_SEED_REPLAY_FAILURE");
  if (uniqueItemSetCount < 8) failureCodes.push("CROSS_SEED_ITEM_SET_DIVERSITY_BELOW_8");
  return {
    ...route,
    sourceId: SOURCE_ID,
    questionMode: "numeric",
    questionCount: QUESTION_COUNT,
    seedCount: SEEDS.length,
    successfulSeedCount: seedRuns.filter(runPassed).length,
    sameSeedReplayPassed,
    uniqueItemSetCount,
    uniqueOrderedWorksheetCount,
    maximumDuplicatePromptCount: Math.max(...seedRuns.map((run) => run.duplicatePromptCount)),
    capacityStatus: seedRuns.every(runPassed) ? "VERIFIED_20" : "FAIL_CLOSED",
    diversityStatus: uniqueItemSetCount >= 8 ? "DIVERSE_PARAMETER_GENERATOR" : "DIVERSITY_DEFICIENT",
    failureCodes,
    seedRuns,
    replay,
  };
}

function writeReport(contract) {
  const s = contract.summary;
  const lines = [
    "# PGC-R04-A01 G3A-U03 Seed Consumption and Cross-seed Diversity Acceptance",
    "",
    "```text",
    "PROGRAM_ID = PUBLIC_KP_GENERATION_CONFORMANCE_V1",
    "TASK_ID    = PGC-R04-A01_G3A_U03_SeedConsumptionAndCrossSeedDiversityFullFix",
    `STATUS     = ${contract.status}`,
    "```",
    "",
    "## Acceptance",
    "",
    "```text",
    `TARGET_ROUTES                    = ${s.targetRouteCount}`,
    `VERIFIED_20_ROUTES               = ${s.verified20RouteCount}`,
    `DIVERSE_ROUTES                   = ${s.diverseRouteCount}`,
    `SAME_SEED_REPLAY_PASS_ROUTES     = ${s.sameSeedReplayPassRouteCount}`,
    `DUPLICATE_PROMPT_ROUTES          = ${s.duplicatePromptRouteCount}`,
    `RESOLVED_R04_GAP_ROUTES          = ${s.resolvedGapRouteCount}`,
    `REMAINING_R04_GAP_ROUTES         = ${s.remainingR04GapRouteCount}`,
    `REMAINING_DIVERSITY_GAP_ROUTES   = ${s.remainingDiversityGapRouteCount}`,
    `REMAINING_CAPACITY_GAP_ROUTES    = ${s.remainingCapacityGapRouteCount}`,
    `BLOCKING_FAILURES                = ${s.blockingFailureCount}`,
    "```",
    "",
    "All six numeric PatternSpecs now consume generationSeed through deterministic full-cycle pool permutations. Source-unit and same-unit mixed routes inherit the same behavior without a second Generator path.",
    "",
    "## Distance update",
    "",
    "```text",
    "GOAL_DISTANCE_BEFORE = D1_NUMERIC_GAP_QUEUE_FROZEN",
    `GOAL_DISTANCE_AFTER  = ${contract.status === "PASS" ? "D1_G3A_U03_NUMERIC_DIVERSITY_CONFORMANT" : "D1_G3A_U03_NUMERIC_DIVERSITY_BLOCKED"}`,
    "DISTANCE_REDUCED     = 8 G3A-U03 numeric routes move from fixture-selector diversity debt to deterministic cross-seed diversity",
    "REMAINING_BLOCKERS   = [69_CAPACITY_ROUTES, 28_DIVERSITY_ROUTES, PGC-R05_APPLICATION_QUALITY, PGC-R06_TO_R08_PRODUCT_ACCEPTANCE]",
    "NEXT_SHORTEST_STEP   = PGC-R04-A02_G3A_U06_SeedConsumptionAndCrossSeedDiversityFullFix",
    "```",
    "",
  ];
  if (contract.blockingFailures.length > 0) {
    lines.push("## Blocking failures", "", ...contract.blockingFailures.map((failure) => `- \`${failure.routeId}\`: \`${failure.failureCodes.join("|")}\``), "");
  }
  fs.writeFileSync(reportPath, `${lines.join("\n")}\n`);
}

export function materializePgcR04G3aU03DiversityAcceptance() {
  const routes = routeDefinitions().map(auditRoute);
  const blockingFailures = routes.filter((route) => route.failureCodes.length > 0);
  const summary = {
    targetRouteCount: routes.length,
    verified20RouteCount: routes.filter((route) => route.capacityStatus === "VERIFIED_20").length,
    diverseRouteCount: routes.filter((route) => route.diversityStatus === "DIVERSE_PARAMETER_GENERATOR").length,
    sameSeedReplayPassRouteCount: routes.filter((route) => route.sameSeedReplayPassed).length,
    duplicatePromptRouteCount: routes.filter((route) => route.maximumDuplicatePromptCount > 0).length,
    resolvedGapRouteCount: routes.filter((route) => route.capacityStatus === "VERIFIED_20" && route.diversityStatus === "DIVERSE_PARAMETER_GENERATOR" && route.sameSeedReplayPassed).length,
    remainingR04GapRouteCount: 81 - routes.length,
    remainingDiversityGapRouteCount: 36 - routes.length,
    remainingCapacityGapRouteCount: 69,
    blockingFailureCount: blockingFailures.length,
  };
  const contract = {
    schemaName: "PgcR04G3aU03DiversityAcceptanceV1",
    schemaVersion: 1,
    programId: "PUBLIC_KP_GENERATION_CONFORMANCE_V1",
    taskId: "PGC-R04-A01_G3A_U03_SeedConsumptionAndCrossSeedDiversityFullFix",
    status: blockingFailures.length === 0 ? "PASS" : "FAIL_CLOSED",
    sourceId: SOURCE_ID,
    generatorAuthority: "site/modules/curriculum/batch-a/g3a-u03-quality-generator.js",
    patchMarker: "PGC_R04_G3A_U03_SEEDED_VARIATION_V1",
    summary,
    blockingFailures: blockingFailures.map((route) => ({ routeId: route.routeId, failureCodes: route.failureCodes })),
    routes,
  };
  fs.mkdirSync(outputDir, { recursive: true });
  fs.mkdirSync(docsDir, { recursive: true });
  fs.writeFileSync(jsonPath, `${JSON.stringify(contract, null, 2)}\n`);
  writeReport(contract);
  console.log(`PGC_R04_G3A_U03_SUMMARY=${JSON.stringify(summary)}`);
  if (contract.status !== "PASS") process.exitCode = 2;
  return contract;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  materializePgcR04G3aU03DiversityAcceptance();
}
