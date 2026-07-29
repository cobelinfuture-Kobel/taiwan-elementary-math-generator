import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { buildBatchABrowserWorksheetDocument } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet.js";
import { BATCH_A_RESOLVER_SELECTION_MODES } from "../../site/modules/curriculum/batch-a/visible-pattern-group-resolver.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const jsonPath = path.join(root, "data/curriculum/public-generation/r04_g3a_u06_diversity_acceptance.json");
const reportPath = path.join(root, "docs/curriculum/output/PGC-R04-A02_G3A_U06_diversity_acceptance.md");
const sourceId = "g3a_u06_3a06";
const count = 20;
const seeds = Object.freeze(Array.from({ length: 10 }, (_, i) => `pgc-r04-g3a-u06-${String(i + 1).padStart(2, "0")}`));
const definitions = Object.freeze([
  ["kp_g3a_u06_division_with_remainder", "pg_g3a_u06_division_with_remainder"],
  ["kp_g3a_u06_quotative_division_packaging", "pg_g3a_u06_quotative_division_packaging"],
  ["kp_g3a_u06_partitive_division_equal_sharing", "pg_g3a_u06_partitive_division_equal_sharing"],
  ["kp_g3a_u06_parity_range_missing_digit", "pg_g3a_u06_parity_range_missing_digit"],
]);

const hash = (value, length = 24) => crypto.createHash("sha256").update(String(value)).digest("hex").slice(0, length);
const array = (value) => Array.isArray(value) ? value : [];

function prompt(question) {
  return String(question?.blankedDisplayText ?? question?.promptText ?? question?.duplicateKey ?? question?.displayText ?? JSON.stringify(question)).replace(/\s+/g, " ").trim();
}

function answer(question) {
  return String(question?.answerText ?? question?.finalAnswer?.value ?? question?.finalAnswer ?? "").replace(/\s+/g, " ").trim();
}

function run(definition, seed) {
  const [kpId, groupId] = definition;
  const result = buildBatchABrowserWorksheetDocument({
    sourceId,
    questionMode: "numeric",
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    selectedKnowledgePointIds: [kpId],
    selectedPatternGroupIds: [groupId],
    questionCount: count,
    ordering: "shuffleAcrossPatterns",
    generationSeed: seed,
    includeAnswerKey: true,
  });
  const questions = array(result?.worksheetDocument?.generatedQuestions);
  const prompts = questions.map(prompt);
  const signatures = questions.map((question) => hash(JSON.stringify({ prompt: prompt(question), answer: answer(question), patternSpecId: question.patternSpecId })));
  return {
    seed,
    ok: result?.ok === true,
    errorCodes: array(result?.errors).map((error) => error?.code ?? String(error)),
    questionCount: questions.length,
    answerKeyItemCount: array(result?.worksheetDocument?.answerKeyItems).length,
    missingPromptCount: prompts.filter((value) => !value).length,
    duplicatePromptCount: prompts.length - new Set(prompts).size,
    orderedWorksheetSignature: hash(signatures.join("|"), 32),
    itemSetSignature: hash([...signatures].sort().join("|"), 32),
  };
}

function passed(runResult) {
  return runResult.ok && runResult.questionCount === count && runResult.answerKeyItemCount === count && runResult.missingPromptCount === 0 && runResult.duplicatePromptCount === 0;
}

function audit(definition) {
  const [kpId, groupId] = definition;
  const seedRuns = seeds.map((seed) => run(definition, seed));
  const replay = run(definition, seeds[0]);
  const sameSeedReplayPassed = passed(seedRuns[0]) && passed(replay) && seedRuns[0].orderedWorksheetSignature === replay.orderedWorksheetSignature;
  const uniqueItemSetCount = new Set(seedRuns.filter(passed).map((item) => item.itemSetSignature)).size;
  const failures = [];
  if (seedRuns.some((item) => !passed(item))) failures.push("TEN_SEED_ROUTE_FAILURE");
  if (!sameSeedReplayPassed) failures.push("SAME_SEED_REPLAY_FAILURE");
  if (uniqueItemSetCount < 8) failures.push("CROSS_SEED_ITEM_SET_DIVERSITY_BELOW_8");
  return {
    routeId: `r04_g3a_u06_single_${groupId}`,
    sourceId,
    kpId,
    groupId,
    questionCount: count,
    seedCount: seeds.length,
    successfulSeedCount: seedRuns.filter(passed).length,
    sameSeedReplayPassed,
    uniqueItemSetCount,
    maximumDuplicatePromptCount: Math.max(...seedRuns.map((item) => item.duplicatePromptCount)),
    capacityStatus: seedRuns.every(passed) ? "VERIFIED_20" : "FAIL_CLOSED",
    diversityStatus: uniqueItemSetCount >= 8 ? "DIVERSE_PARAMETER_GENERATOR" : "DIVERSITY_DEFICIENT",
    failureCodes: failures,
    seedRuns,
    replay,
  };
}

function writeReport(contract) {
  const s = contract.summary;
  const lines = [
    "# PGC-R04-A02 G3A-U06 Seed Consumption and Cross-seed Diversity Acceptance",
    "",
    "```text",
    "PROGRAM_ID = PUBLIC_KP_GENERATION_CONFORMANCE_V1",
    "TASK_ID    = PGC-R04-A02_G3A_U06_SeedConsumptionAndCrossSeedDiversityFullFix",
    `STATUS     = ${contract.status}`,
    "```",
    "",
    "```text",
    `TARGET_ROUTES                  = ${s.targetRouteCount}`,
    `VERIFIED_20_ROUTES             = ${s.verified20RouteCount}`,
    `DIVERSE_ROUTES                 = ${s.diverseRouteCount}`,
    `SAME_SEED_REPLAY_PASS_ROUTES   = ${s.sameSeedReplayPassRouteCount}`,
    `DUPLICATE_PROMPT_ROUTES        = ${s.duplicatePromptRouteCount}`,
    `RESOLVED_R04_GAP_ROUTES        = ${s.resolvedGapRouteCount}`,
    `CUMULATIVE_RESOLVED_GAP_ROUTES = ${s.cumulativeResolvedGapRouteCount}`,
    `REMAINING_R04_GAP_ROUTES       = ${s.remainingR04GapRouteCount}`,
    `REMAINING_DIVERSITY_GAPS       = ${s.remainingDiversityGapRouteCount}`,
    `REMAINING_CAPACITY_GAPS        = ${s.remainingCapacityGapRouteCount}`,
    `BLOCKING_FAILURES              = ${s.blockingFailureCount}`,
    "```",
    "",
    "The existing remainder, quotative, partitive and parity makers remain unchanged. Their sequence input is now selected by the shared G3A-U06 division router using a deterministic full-cycle seed permutation.",
    "",
    "```text",
    "GOAL_DISTANCE_BEFORE = D1_G3A_U03_NUMERIC_DIVERSITY_CONFORMANT",
    `GOAL_DISTANCE_AFTER  = ${contract.status === "PASS" ? "D1_G3A_U06_NUMERIC_DIVERSITY_CONFORMANT" : "D1_G3A_U06_NUMERIC_DIVERSITY_BLOCKED"}`,
    "DISTANCE_REDUCED     = 4 G3A-U06 numeric routes move from fixture-selector diversity debt to deterministic cross-seed diversity",
    "REMAINING_BLOCKERS   = [69_CAPACITY_ROUTES, 24_DIVERSITY_ROUTES, PGC-R05_APPLICATION_QUALITY, PGC-R06_TO_R08_PRODUCT_ACCEPTANCE]",
    "NEXT_SHORTEST_STEP   = PGC-R04-A03_NumericCapacityAndDiversityQueueReprioritization",
    "```",
    "",
  ];
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, `${lines.join("\n")}\n`);
}

export function materializePgcR04G3aU06DiversityAcceptance() {
  const routes = definitions.map(audit);
  const blocking = routes.filter((route) => route.failureCodes.length > 0);
  const summary = {
    targetRouteCount: routes.length,
    verified20RouteCount: routes.filter((route) => route.capacityStatus === "VERIFIED_20").length,
    diverseRouteCount: routes.filter((route) => route.diversityStatus === "DIVERSE_PARAMETER_GENERATOR").length,
    sameSeedReplayPassRouteCount: routes.filter((route) => route.sameSeedReplayPassed).length,
    duplicatePromptRouteCount: routes.filter((route) => route.maximumDuplicatePromptCount > 0).length,
    resolvedGapRouteCount: routes.filter((route) => route.failureCodes.length === 0).length,
    cumulativeResolvedGapRouteCount: 8 + routes.filter((route) => route.failureCodes.length === 0).length,
    remainingR04GapRouteCount: 81 - 8 - routes.filter((route) => route.failureCodes.length === 0).length,
    remainingDiversityGapRouteCount: 36 - 8 - routes.filter((route) => route.failureCodes.length === 0).length,
    remainingCapacityGapRouteCount: 69,
    blockingFailureCount: blocking.length,
  };
  const contract = {
    schemaName: "PgcR04G3aU06DiversityAcceptanceV1",
    schemaVersion: 1,
    programId: "PUBLIC_KP_GENERATION_CONFORMANCE_V1",
    taskId: "PGC-R04-A02_G3A_U06_SeedConsumptionAndCrossSeedDiversityFullFix",
    status: blocking.length === 0 ? "PASS" : "FAIL_CLOSED",
    sourceId,
    generatorAuthority: "site/modules/curriculum/batch-a/g3a-u06-division-generator.js",
    patchMarker: "PGC_R04_G3A_U06_SEEDED_VARIATION_V1",
    summary,
    blockingFailures: blocking.map((route) => ({ routeId: route.routeId, failureCodes: route.failureCodes })),
    routes,
  };
  fs.mkdirSync(path.dirname(jsonPath), { recursive: true });
  fs.writeFileSync(jsonPath, `${JSON.stringify(contract, null, 2)}\n`);
  writeReport(contract);
  console.log(`PGC_R04_G3A_U06_SUMMARY=${JSON.stringify(summary)}`);
  if (contract.status !== "PASS") process.exitCode = 2;
  return contract;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) materializePgcR04G3aU06DiversityAcceptance();
