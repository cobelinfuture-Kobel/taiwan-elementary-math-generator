import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const inventoryPath = path.join(root, "data/curriculum/public-generation/numeric_generation_gap_inventory.json");
const a01Path = path.join(root, "data/curriculum/public-generation/r04_g3a_u03_diversity_acceptance.json");
const a02Path = path.join(root, "data/curriculum/public-generation/r04_g3a_u06_diversity_acceptance.json");
const jsonPath = path.join(root, "data/curriculum/public-generation/r04_numeric_queue_reprioritization.json");
const reportPath = path.join(root, "docs/curriculum/output/PGC-R04-A03_numeric_queue_reprioritization.md");

const resolvedSources = Object.freeze(["g3a_u03_3a03", "g3a_u06_3a06"]);
const expected = Object.freeze({
  cumulativeResolvedGapRouteCount: 12,
  remainingGapRouteCount: 69,
  remainingCapacityGapRouteCount: 69,
  remainingDiversityGapRouteCount: 24,
  remainingCapacityAndDiversityOverlapCount: 24,
  remainingAffectedSourceCount: 17,
});
const safeArray = (value) => Array.isArray(value) ? value : [];
const unique = (values) => [...new Set((values ?? []).filter(Boolean))];

function loadJson(filePath, label) {
  if (!fs.existsSync(filePath)) throw new Error(`PGC_R04_A03_INPUT_MISSING:${label}`);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function has(route, code) {
  return safeArray(route.downstreamGapCodes).includes(code);
}

function sourceSummaries(routes) {
  const bySource = new Map();
  for (const route of routes) {
    const current = bySource.get(route.sourceId) ?? {
      sourceId: route.sourceId,
      routeCount: 0,
      capacityGapRouteCount: 0,
      diversityGapRouteCount: 0,
      overlapRouteCount: 0,
      minimumVerifiedQuestionCount: 20,
      maximumVerifiedQuestionCount: 0,
      runtimeReferencePaths: new Set(),
      toolReferencePaths: new Set(),
      testReferencePaths: new Set(),
      routeIds: [],
    };
    current.routeCount += 1;
    current.capacityGapRouteCount += has(route, "CAPACITY_BELOW_20") ? 1 : 0;
    current.diversityGapRouteCount += has(route, "CROSS_SEED_ITEM_DIVERSITY_DEFICIENT") ? 1 : 0;
    current.overlapRouteCount += has(route, "CAPACITY_BELOW_20") && has(route, "CROSS_SEED_ITEM_DIVERSITY_DEFICIENT") ? 1 : 0;
    current.minimumVerifiedQuestionCount = Math.min(current.minimumVerifiedQuestionCount, Number(route.verifiedMaxQuestionCount));
    current.maximumVerifiedQuestionCount = Math.max(current.maximumVerifiedQuestionCount, Number(route.verifiedMaxQuestionCount));
    for (const item of safeArray(route.runtimeReferencePaths)) current.runtimeReferencePaths.add(item);
    for (const item of safeArray(route.toolReferencePaths)) current.toolReferencePaths.add(item);
    for (const item of safeArray(route.testReferencePaths)) current.testReferencePaths.add(item);
    current.routeIds.push(route.routeId);
    bySource.set(route.sourceId, current);
  }
  return [...bySource.values()].map((source) => ({
    ...source,
    runtimeReferencePaths: [...source.runtimeReferencePaths].sort(),
    toolReferencePaths: [...source.toolReferencePaths].sort(),
    testReferencePaths: [...source.testReferencePaths].sort(),
    routeIds: [...source.routeIds].sort(),
    defectClass: source.diversityGapRouteCount === 0 ? "CAPACITY_ONLY" : source.capacityGapRouteCount === source.diversityGapRouteCount ? "CAPACITY_AND_DIVERSITY" : "MIXED_CAPACITY_QUALITY",
  })).sort((a, b) => b.routeCount - a.routeCount || a.sourceId.localeCompare(b.sourceId));
}

function chooseNext(sources) {
  const capacityOnly = sources.filter((source) => source.defectClass === "CAPACITY_ONLY");
  const selected = capacityOnly.sort((a, b) => b.routeCount - a.routeCount || b.minimumVerifiedQuestionCount - a.minimumVerifiedQuestionCount || a.sourceId.localeCompare(b.sourceId))[0] ?? null;
  if (!selected) return null;
  return {
    sourceId: selected.sourceId,
    defectClass: selected.defectClass,
    routeCount: selected.routeCount,
    minimumVerifiedQuestionCount: selected.minimumVerifiedQuestionCount,
    maximumVerifiedQuestionCount: selected.maximumVerifiedQuestionCount,
    runtimeReferencePaths: selected.runtimeReferencePaths,
    toolReferencePaths: selected.toolReferencePaths,
    testReferencePaths: selected.testReferencePaths,
    routeIds: selected.routeIds,
    rationale: "Largest remaining capacity-only source cluster. Repairing one shared G5A-U02 generation authority can raise 11 routes without mixing in unresolved cross-seed diversity work.",
    nextTaskId: "PGC-R04-A04_G5A_U02_NumericCapacityExpansionFullFix",
  };
}

function writeReport(contract) {
  const s = contract.summary;
  const lines = [
    "# PGC-R04-A03 Numeric Capacity and Diversity Queue Reprioritization",
    "",
    "```text",
    "PROGRAM_ID = PUBLIC_KP_GENERATION_CONFORMANCE_V1",
    "TASK_ID    = PGC-R04-A03_NumericCapacityAndDiversityQueueReprioritization",
    `STATUS     = ${contract.status}`,
    "```",
    "",
    "```text",
    `CUMULATIVE_RESOLVED_GAP_ROUTES       = ${s.cumulativeResolvedGapRouteCount}`,
    `REMAINING_GAP_ROUTES                 = ${s.remainingGapRouteCount}`,
    `REMAINING_CAPACITY_GAP_ROUTES        = ${s.remainingCapacityGapRouteCount}`,
    `REMAINING_DIVERSITY_GAP_ROUTES       = ${s.remainingDiversityGapRouteCount}`,
    `CAPACITY_AND_DIVERSITY_OVERLAP       = ${s.remainingCapacityAndDiversityOverlapCount}`,
    `REMAINING_AFFECTED_SOURCES           = ${s.remainingAffectedSourceCount}`,
    `BLOCKING_REPRIORITIZATION_GAPS       = ${s.blockingGapCount}`,
    "```",
    "",
    "After A01 and A02 there are no pure diversity-only source clusters. The queue therefore switches from seed-consumption fixes to capacity expansion while keeping capacity-plus-diversity clusters separate.",
    "",
    "## Remaining source queue",
    "",
    "| Source | Class | Routes | Capacity | Diversity | Verified range |",
    "|---|---|---:|---:|---:|---:|",
    ...contract.sourceSummaries.map((source) => `| \`${source.sourceId}\` | ${source.defectClass} | ${source.routeCount} | ${source.capacityGapRouteCount} | ${source.diversityGapRouteCount} | ${source.minimumVerifiedQuestionCount}–${source.maximumVerifiedQuestionCount} |`),
    "",
    "## Selected next source",
    "",
    "```text",
    `SOURCE_ID    = ${contract.nextRepairCandidate?.sourceId ?? "NONE"}`,
    `DEFECT_CLASS = ${contract.nextRepairCandidate?.defectClass ?? "NONE"}`,
    `ROUTE_COUNT  = ${contract.nextRepairCandidate?.routeCount ?? 0}`,
    `NEXT_TASK_ID = ${contract.nextRepairCandidate?.nextTaskId ?? "NONE"}`,
    "```",
    "",
    contract.nextRepairCandidate?.rationale ?? "No next source selected.",
    "",
    "```text",
    "GOAL_DISTANCE_BEFORE = D1_G3A_U06_NUMERIC_DIVERSITY_CONFORMANT",
    `GOAL_DISTANCE_AFTER  = ${contract.status === "PASS" ? "D1_NUMERIC_CAPACITY_QUEUE_REPRIORITIZED" : "D1_NUMERIC_REPRIORITIZATION_BLOCKED"}`,
    "DISTANCE_REDUCED     = resolved diversity-only clusters are removed and the remaining 69 routes are partitioned into capacity-only versus capacity-plus-diversity repair lanes",
    "REMAINING_BLOCKERS   = [69_CAPACITY_ROUTES, 24_DIVERSITY_ROUTES, PGC-R05_APPLICATION_QUALITY, PGC-R06_TO_R08_PRODUCT_ACCEPTANCE]",
    `NEXT_SHORTEST_STEP   = ${contract.nextRepairCandidate?.nextTaskId ?? "PGC-R04_REPAIR_SELECTION_BLOCKED"}`,
    "```",
    "",
  ];
  if (contract.blockingGaps.length > 0) lines.push("## Blocking gaps", "", ...contract.blockingGaps.map((gap) => `- \`${gap.code}\`: \`${JSON.stringify(gap)}\``), "");
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, `${lines.join("\n")}\n`);
}

export function materializePgcR04NumericQueueReprioritization() {
  const inventory = loadJson(inventoryPath, "inventory");
  const a01 = loadJson(a01Path, "a01");
  const a02 = loadJson(a02Path, "a02");
  const remainingRoutes = safeArray(inventory.gapRoutes).filter((route) => !resolvedSources.includes(route.sourceId));
  const summaries = sourceSummaries(remainingRoutes);
  const nextRepairCandidate = chooseNext(summaries);
  const summary = {
    cumulativeResolvedGapRouteCount: Number(a01.summary.resolvedGapRouteCount) + Number(a02.summary.resolvedGapRouteCount),
    remainingGapRouteCount: remainingRoutes.length,
    remainingCapacityGapRouteCount: remainingRoutes.filter((route) => has(route, "CAPACITY_BELOW_20")).length,
    remainingDiversityGapRouteCount: remainingRoutes.filter((route) => has(route, "CROSS_SEED_ITEM_DIVERSITY_DEFICIENT")).length,
    remainingCapacityAndDiversityOverlapCount: remainingRoutes.filter((route) => has(route, "CAPACITY_BELOW_20") && has(route, "CROSS_SEED_ITEM_DIVERSITY_DEFICIENT")).length,
    remainingAffectedSourceCount: new Set(remainingRoutes.map((route) => route.sourceId)).size,
  };
  const blockingGaps = [
    ...Object.entries(expected).filter(([key, value]) => summary[key] !== value).map(([key, value]) => ({ code: "REPRIORITIZATION_COUNT_DRIFT", key, expected: value, actual: summary[key] })),
    ...(nextRepairCandidate?.sourceId === "g5a_u02_5a02" ? [] : [{ code: "NEXT_REPAIR_CANDIDATE_DRIFT", actual: nextRepairCandidate?.sourceId ?? null }]),
    ...(nextRepairCandidate && unique(nextRepairCandidate.runtimeReferencePaths).length > 0 ? [] : [{ code: "NEXT_REPAIR_RUNTIME_REFERENCE_MISSING", sourceId: nextRepairCandidate?.sourceId ?? null }]),
  ];
  summary.blockingGapCount = blockingGaps.length;
  const contract = {
    schemaName: "PgcR04NumericQueueReprioritizationV1",
    schemaVersion: 1,
    programId: "PUBLIC_KP_GENERATION_CONFORMANCE_V1",
    taskId: "PGC-R04-A03_NumericCapacityAndDiversityQueueReprioritization",
    status: blockingGaps.length === 0 ? "PASS" : "FAIL_CLOSED",
    resolvedSources: [...resolvedSources],
    frozenExpectedCounts: expected,
    summary,
    blockingGaps,
    nextRepairCandidate,
    sourceSummaries: summaries,
    remainingRoutes: remainingRoutes.map((route) => ({
      routeId: route.routeId,
      sourceId: route.sourceId,
      questionType: route.questionType,
      verifiedMaxQuestionCount: route.verifiedMaxQuestionCount,
      gapFamily: route.gapFamily,
      repairPriority: route.repairPriority,
    })),
  };
  fs.mkdirSync(path.dirname(jsonPath), { recursive: true });
  fs.writeFileSync(jsonPath, `${JSON.stringify(contract, null, 2)}\n`);
  writeReport(contract);
  console.log(`PGC_R04_A03_SUMMARY=${JSON.stringify(summary)}`);
  if (contract.status !== "PASS") process.exitCode = 2;
  return contract;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) materializePgcR04NumericQueueReprioritization();
