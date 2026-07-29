import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const inputPath = path.join(repoRoot, "data/curriculum/public-generation/generator_capacity_contract.json");
const outputDir = path.join(repoRoot, "data/curriculum/public-generation");
const docsDir = path.join(repoRoot, "docs/curriculum/output");
const jsonPath = path.join(outputDir, "numeric_generation_gap_inventory.json");
const csvPath = path.join(outputDir, "numeric_generation_gap_inventory.csv");
const reportPath = path.join(docsDir, "PGC-R04_numeric_generation_gap_inventory.md");

const TASK_ID = "PGC-R04_NumericGenerationFullFix";
const NUMERIC_LIKE_TYPES = Object.freeze(["numeric", "concept", "operation_estimation", "representation"]);
const EXPECTED = Object.freeze({
  candidateRouteCount: 195,
  legalRouteCount: 193,
  illegalExcludedRouteCount: 2,
  healthyLegalRouteCount: 112,
  gapRouteCount: 81,
  capacityBelow20RouteCount: 69,
  diversityDeficientRouteCount: 36,
  overlappingCapacityAndDiversityRouteCount: 24,
  affectedSourceCount: 19,
});
const SCAN_EXTENSIONS = new Set([".js", ".mjs", ".cjs", ".json", ".md", ".html", ".yml", ".yaml"]);
const EXCLUDED_PREFIXES = [
  ".git/",
  "node_modules/",
  "data/curriculum/public-generation/",
  "docs/curriculum/output/",
  "site/modules/curriculum/public/public-generator-capacity-registry.js",
];

const safeArray = (value) => Array.isArray(value) ? value : [];
const unique = (values) => [...new Set((values ?? []).filter(Boolean))];
const stableHash = (value, length = 16) => crypto.createHash("sha256").update(String(value)).digest("hex").slice(0, length);
const csvEscape = (value) => {
  const text = value == null ? "" : Array.isArray(value) ? value.join("|") : typeof value === "object" ? JSON.stringify(value) : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};

function relative(filePath) {
  return path.relative(repoRoot, filePath).split(path.sep).join("/");
}

function walk(directory, files = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    const rel = relative(absolute);
    if (EXCLUDED_PREFIXES.some((prefix) => rel === prefix.replace(/\/$/, "") || rel.startsWith(prefix))) continue;
    if (entry.isDirectory()) walk(absolute, files);
    else if (entry.isFile() && SCAN_EXTENSIONS.has(path.extname(entry.name))) files.push(absolute);
  }
  return files;
}

function classifyReference(filePath) {
  if (filePath.startsWith("tests/")) return "test";
  if (filePath.startsWith("tools/")) return "tool";
  if (filePath.startsWith("site/") || filePath.startsWith("src/") || filePath.startsWith("modules/")) return "runtime";
  if (filePath.startsWith("data/") || filePath.startsWith("docs/curriculum/mapping/")) return "authority";
  return "other";
}

function buildTokenIndex() {
  const index = new Map();
  const files = walk(repoRoot);
  for (const absolute of files) {
    const filePath = relative(absolute);
    let content;
    try {
      content = fs.readFileSync(absolute, "utf8");
    } catch {
      continue;
    }
    index.set(filePath, content);
  }
  return index;
}

function tokenReferences(index, tokens) {
  const normalized = unique(tokens.map((token) => String(token ?? "").trim()).filter(Boolean));
  const refs = [];
  for (const [filePath, content] of index.entries()) {
    const matchedTokens = normalized.filter((token) => content.includes(token));
    if (matchedTokens.length === 0) continue;
    refs.push({
      path: filePath,
      kind: classifyReference(filePath),
      matchedTokens,
    });
  }
  return refs.sort((a, b) => a.kind.localeCompare(b.kind) || a.path.localeCompare(b.path));
}

function hasGap(route, code) {
  return safeArray(route.downstreamGapCodes).includes(code);
}

function gapFamily(route) {
  const capacity = hasGap(route, "CAPACITY_BELOW_20");
  const diversity = hasGap(route, "CROSS_SEED_ITEM_DIVERSITY_DEFICIENT");
  const zero = hasGap(route, "ZERO_SAFE_CAPACITY");
  if (zero) return "ZERO_SAFE_CAPACITY";
  if (capacity && diversity) return "CAPACITY_AND_DIVERSITY";
  if (capacity) return "CAPACITY_BELOW_20";
  if (diversity) return "CROSS_SEED_DIVERSITY";
  return "NONE";
}

function repairPriority(route) {
  const max = Number(route.verifiedMaxQuestionCount ?? 0);
  const family = gapFamily(route);
  if (family === "ZERO_SAFE_CAPACITY") return "P0_ZERO_CAPACITY";
  if (max <= 3) return "P1_CRITICAL_CAPACITY_1_TO_3";
  if (max <= 9) return "P2_LOW_CAPACITY_4_TO_9";
  if (max < 20) return "P3_LIMITED_CAPACITY_10_TO_19";
  return "P4_DIVERSITY_ONLY";
}

function implementationTokens(route) {
  const groups = safeArray(route.generationPatternGroupIds);
  const publicGroups = safeArray(route.publicPatternGroupIds);
  return unique([
    ...groups,
    ...publicGroups,
    route.sourceId,
  ]);
}

function summarizeSource(routes) {
  const sources = new Map();
  for (const route of routes) {
    const current = sources.get(route.sourceId) ?? {
      sourceId: route.sourceId,
      routeCount: 0,
      capacityBelow20RouteCount: 0,
      diversityDeficientRouteCount: 0,
      overlappingRouteCount: 0,
      minimumVerifiedQuestionCount: 20,
      maximumVerifiedQuestionCount: 0,
      questionTypes: new Set(),
      priorities: new Set(),
      routeIds: [],
    };
    current.routeCount += 1;
    current.capacityBelow20RouteCount += hasGap(route, "CAPACITY_BELOW_20") ? 1 : 0;
    current.diversityDeficientRouteCount += hasGap(route, "CROSS_SEED_ITEM_DIVERSITY_DEFICIENT") ? 1 : 0;
    current.overlappingRouteCount += hasGap(route, "CAPACITY_BELOW_20") && hasGap(route, "CROSS_SEED_ITEM_DIVERSITY_DEFICIENT") ? 1 : 0;
    current.minimumVerifiedQuestionCount = Math.min(current.minimumVerifiedQuestionCount, Number(route.verifiedMaxQuestionCount ?? 0));
    current.maximumVerifiedQuestionCount = Math.max(current.maximumVerifiedQuestionCount, Number(route.verifiedMaxQuestionCount ?? 0));
    current.questionTypes.add(route.questionType);
    current.priorities.add(route.repairPriority);
    current.routeIds.push(route.routeId);
    sources.set(route.sourceId, current);
  }
  return [...sources.values()].map((source) => ({
    ...source,
    questionTypes: [...source.questionTypes].sort(),
    priorities: [...source.priorities].sort(),
    routeIds: [...source.routeIds].sort(),
  })).sort((a, b) => b.routeCount - a.routeCount || a.sourceId.localeCompare(b.sourceId));
}

function chooseFirstRepairCandidate(sourceSummaries, routes) {
  const diversityOnlySources = sourceSummaries.filter((source) => {
    const owned = routes.filter((route) => route.sourceId === source.sourceId);
    return owned.length > 0
      && owned.every((route) => gapFamily(route) === "CROSS_SEED_DIVERSITY")
      && owned.every((route) => Number(route.verifiedMaxQuestionCount) === 20);
  });
  const selected = diversityOnlySources.sort((a, b) => b.routeCount - a.routeCount || a.sourceId.localeCompare(b.sourceId))[0] ?? null;
  if (!selected) return null;
  return {
    sourceId: selected.sourceId,
    routeCount: selected.routeCount,
    rationale: "All affected routes already satisfy verified 20-question capacity; one seed-consumption or fixture-selection FullFix can remove the largest pure diversity cluster without changing public limits.",
    nextTaskId: "PGC-R04-A01_G3A_U03_SeedConsumptionAndCrossSeedDiversityFullFix",
    routeIds: selected.routeIds,
  };
}

function frozenCounts(candidateRoutes, legalRoutes, illegalRoutes, healthyRoutes, gapRoutes) {
  return {
    candidateRouteCount: candidateRoutes.length,
    legalRouteCount: legalRoutes.length,
    illegalExcludedRouteCount: illegalRoutes.length,
    healthyLegalRouteCount: healthyRoutes.length,
    gapRouteCount: gapRoutes.length,
    capacityBelow20RouteCount: gapRoutes.filter((route) => hasGap(route, "CAPACITY_BELOW_20")).length,
    diversityDeficientRouteCount: gapRoutes.filter((route) => hasGap(route, "CROSS_SEED_ITEM_DIVERSITY_DEFICIENT")).length,
    overlappingCapacityAndDiversityRouteCount: gapRoutes.filter((route) => hasGap(route, "CAPACITY_BELOW_20") && hasGap(route, "CROSS_SEED_ITEM_DIVERSITY_DEFICIENT")).length,
    affectedSourceCount: new Set(gapRoutes.map((route) => route.sourceId)).size,
  };
}

function countMismatches(actual) {
  return Object.entries(EXPECTED)
    .filter(([key, value]) => actual[key] !== value)
    .map(([key, value]) => ({ key, expected: value, actual: actual[key] }));
}

function writeCsv(routes) {
  const columns = [
    "inventoryRouteId", "routeId", "sourceId", "questionType", "selectionMode", "setKind",
    "selectedKnowledgePointIds", "publicPatternGroupIds", "generationPatternGroupIds",
    "verifiedMaxQuestionCount", "capacityStatus", "qualityStatus", "uniqueItemSetCount",
    "gapFamily", "repairPriority", "implementationReferenceCount", "runtimeReferencePaths",
    "toolReferencePaths", "testReferencePaths", "authorityReferencePaths",
  ];
  const lines = [columns.join(",")];
  for (const route of routes) lines.push(columns.map((column) => csvEscape(route[column])).join(","));
  fs.writeFileSync(csvPath, `${lines.join("\n")}\n`);
}

function writeReport(inventory) {
  const c = inventory.summary;
  const lines = [
    "# PGC-R04 Numeric Generation Gap Inventory",
    "",
    "```text",
    "PROGRAM_ID = PUBLIC_KP_GENERATION_CONFORMANCE_V1",
    `TASK_ID    = ${TASK_ID}`,
    `STATUS     = ${inventory.status}`,
    "```",
    "",
    "## Frozen scope",
    "",
    "```text",
    `NUMERIC_LIKE_TYPES                    = ${NUMERIC_LIKE_TYPES.join("|")}`,
    `CANDIDATE_ROUTES                      = ${c.candidateRouteCount}`,
    `LEGAL_ROUTES                          = ${c.legalRouteCount}`,
    `ILLEGAL_ROUTES_EXCLUDED               = ${c.illegalExcludedRouteCount}`,
    `HEALTHY_LEGAL_ROUTES                  = ${c.healthyLegalRouteCount}`,
    `R04_GAP_ROUTES                        = ${c.gapRouteCount}`,
    `CAPACITY_BELOW_20_ROUTES              = ${c.capacityBelow20RouteCount}`,
    `DIVERSITY_DEFICIENT_ROUTES            = ${c.diversityDeficientRouteCount}`,
    `CAPACITY_AND_DIVERSITY_OVERLAP         = ${c.overlappingCapacityAndDiversityRouteCount}`,
    `AFFECTED_SOURCES                      = ${c.affectedSourceCount}`,
    `IMPLEMENTATION_REFERENCE_COVERAGE     = ${c.mappedGapRouteCount}/${c.gapRouteCount}`,
    `BLOCKING_INVENTORY_GAPS               = ${c.blockingInventoryGapCount}`,
    "```",
    "",
    "R04 owns numeric, concept, operation-estimation and representation quality gaps only. Application, reasoning, PBL and mixed routes remain outside this milestone.",
    "",
    "## Source queue",
    "",
    "| Source | Gap routes | Capacity <20 | Diversity | Min–max verified |",
    "|---|---:|---:|---:|---:|",
    ...inventory.sourceSummaries.map((source) => `| \`${source.sourceId}\` | ${source.routeCount} | ${source.capacityBelow20RouteCount} | ${source.diversityDeficientRouteCount} | ${source.minimumVerifiedQuestionCount}–${source.maximumVerifiedQuestionCount} |`),
    "",
    "## First shortest repair",
    "",
    "```text",
    `SOURCE_ID        = ${inventory.firstRepairCandidate?.sourceId ?? "NONE"}`,
    `ROUTE_COUNT      = ${inventory.firstRepairCandidate?.routeCount ?? 0}`,
    `NEXT_TASK_ID     = ${inventory.firstRepairCandidate?.nextTaskId ?? "NONE"}`,
    "```",
    "",
    inventory.firstRepairCandidate?.rationale ?? "No candidate selected.",
    "",
    "## Distance update",
    "",
    "```text",
    "GOAL_DISTANCE_BEFORE = D1_CAPACITY_AWARE_PUBLIC_ROUTES_CONFORMANT",
    `GOAL_DISTANCE_AFTER  = ${inventory.status === "PASS" ? "D1_NUMERIC_GAP_QUEUE_FROZEN" : "D1_NUMERIC_GAP_INVENTORY_BLOCKED"}`,
    "DISTANCE_REDUCED     = all numeric-like downstream quality gaps are frozen, source-grouped and mapped to implementation references",
    "REMAINING_BLOCKERS   = [69_CAPACITY_ROUTES, 36_DIVERSITY_ROUTES, PGC-R05_APPLICATION_QUALITY, PGC-R06_TO_R08_PRODUCT_ACCEPTANCE]",
    `NEXT_SHORTEST_STEP   = ${inventory.firstRepairCandidate?.nextTaskId ?? "PGC-R04_NUMERIC_INVENTORY_REPAIR_SELECTION"}`,
    "```",
    "",
  ];
  if (inventory.blockingGaps.length > 0) {
    lines.push("## Blocking inventory gaps", "", ...inventory.blockingGaps.map((gap) => `- \`${gap.code}\`: \`${JSON.stringify(gap)}\``), "");
  }
  fs.writeFileSync(reportPath, `${lines.join("\n")}\n`);
}

export function materializePgcR04NumericGapInventory() {
  if (!fs.existsSync(inputPath)) throw new Error("PGC_R03_V3_CONTRACT_MISSING");
  const r03 = JSON.parse(fs.readFileSync(inputPath, "utf8"));
  if (r03.schemaName !== "PublicGeneratorCapacityContractV3") throw new Error(`PGC_R03_V3_REQUIRED:${r03.schemaName ?? "unknown"}`);

  const candidateRoutes = safeArray(r03.routes).filter((route) => NUMERIC_LIKE_TYPES.includes(route.questionType));
  const legalRoutes = candidateRoutes.filter((route) => route.legalRoute === true);
  const illegalRoutes = candidateRoutes.filter((route) => route.legalRoute !== true);
  const gapRoutesRaw = legalRoutes.filter((route) => gapFamily(route) !== "NONE");
  const healthyRoutes = legalRoutes.filter((route) => gapFamily(route) === "NONE");
  const index = buildTokenIndex();

  const gapRoutes = gapRoutesRaw.map((route) => {
    const tokens = implementationTokens(route);
    const refs = tokenReferences(index, tokens);
    const byKind = (kind) => refs.filter((ref) => ref.kind === kind).map((ref) => ref.path);
    return {
      inventoryRouteId: `pgc_r04_${stableHash(route.routeId, 16)}`,
      routeId: route.routeId,
      sourceId: route.sourceId,
      questionType: route.questionType,
      selectionMode: route.selectionMode,
      setKind: route.setKind,
      selectedKnowledgePointIds: safeArray(route.selectedKnowledgePointIds),
      publicPatternGroupIds: safeArray(route.publicPatternGroupIds),
      generationPatternGroupIds: safeArray(route.generationPatternGroupIds),
      verifiedMaxQuestionCount: Number(route.verifiedMaxQuestionCount ?? 0),
      capacityStatus: route.capacityStatus,
      qualityStatus: route.qualityStatus,
      uniqueItemSetCount: Number(route.uniqueItemSetCount ?? 0),
      downstreamGapCodes: safeArray(route.downstreamGapCodes),
      gapFamily: gapFamily(route),
      repairPriority: repairPriority(route),
      implementationTokens: tokens,
      implementationReferences: refs,
      implementationReferenceCount: refs.length,
      runtimeReferencePaths: byKind("runtime"),
      toolReferencePaths: byKind("tool"),
      testReferencePaths: byKind("test"),
      authorityReferencePaths: byKind("authority"),
    };
  });

  const counts = frozenCounts(candidateRoutes, legalRoutes, illegalRoutes, healthyRoutes, gapRoutes);
  const countDrift = countMismatches(counts);
  const unmappedRoutes = gapRoutes.filter((route) => route.implementationReferenceCount === 0);
  const sourceSummaries = summarizeSource(gapRoutes);
  const firstRepairCandidate = chooseFirstRepairCandidate(sourceSummaries, gapRoutes);
  const blockingGaps = [
    ...countDrift.map((gap) => ({ code: "FROZEN_COUNT_DRIFT", ...gap })),
    ...unmappedRoutes.map((route) => ({ code: "IMPLEMENTATION_REFERENCE_MISSING", routeId: route.routeId, sourceId: route.sourceId })),
    ...(firstRepairCandidate?.sourceId === "g3a_u03_3a03" ? [] : [{ code: "FIRST_REPAIR_CANDIDATE_DRIFT", actual: firstRepairCandidate?.sourceId ?? null }]),
  ];
  const summary = {
    ...counts,
    mappedGapRouteCount: gapRoutes.length - unmappedRoutes.length,
    unmappedGapRouteCount: unmappedRoutes.length,
    blockingInventoryGapCount: blockingGaps.length,
  };
  const inventory = {
    schemaName: "PublicNumericGenerationGapInventoryV1",
    schemaVersion: 1,
    programId: "PUBLIC_KP_GENERATION_CONFORMANCE_V1",
    taskId: TASK_ID,
    milestoneId: "PGC-R04-A00_NumericGapInventoryAndImplementationReferenceFreeze",
    status: blockingGaps.length === 0 ? "PASS" : "FAIL_CLOSED",
    sourceAuthority: "data/curriculum/public-generation/generator_capacity_contract.json",
    sourceContractTaskId: r03.taskId,
    numericLikeQuestionTypes: [...NUMERIC_LIKE_TYPES],
    excludedQuestionTypes: ["application", "reasoning", "pbl", "mixed"],
    frozenExpectedCounts: EXPECTED,
    summary,
    blockingGaps,
    firstRepairCandidate,
    sourceSummaries,
    illegalExcludedRoutes: illegalRoutes.map((route) => ({
      routeId: route.routeId,
      sourceId: route.sourceId,
      questionType: route.questionType,
      reconciliationCodes: safeArray(route.reconciliationCodes),
      capacityStatus: route.capacityStatus,
    })),
    gapRoutes,
  };

  fs.mkdirSync(outputDir, { recursive: true });
  fs.mkdirSync(docsDir, { recursive: true });
  fs.writeFileSync(jsonPath, `${JSON.stringify(inventory, null, 2)}\n`);
  writeCsv(gapRoutes);
  writeReport(inventory);
  console.log(`PGC_R04_INVENTORY_SUMMARY=${JSON.stringify(summary)}`);
  if (inventory.status !== "PASS") process.exitCode = 2;
  return inventory;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  materializePgcR04NumericGapInventory();
}
