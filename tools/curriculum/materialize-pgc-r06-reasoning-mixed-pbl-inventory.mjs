import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const outputDir = path.join(repoRoot, "data/curriculum/public-generation");
const docsDir = path.join(repoRoot, "docs/curriculum/output");
const capacityPath = path.join(outputDir, "generator_capacity_contract.json");
const uiBindingPath = path.join(outputDir, "ui_capability_binding_contract.json");
const scopePath = path.join(outputDir, "public_generation_scope.json");
const inventoryPath = path.join(outputDir, "PGC-R06.reasoning-mixed-pbl-inventory.json");
const csvPath = path.join(outputDir, "reasoning_mixed_pbl_route_inventory.csv");
const readbackPath = path.join(docsDir, "PGC-R06_reasoning_mixed_pbl_inventory.md");

const PROGRAM_ID = "PUBLIC_KP_GENERATION_CONFORMANCE_V1";
const TASK_ID = "PGC-R06-A00_ReasoningMixedPBLRouteInventoryAndRepairQueueFreeze";
const HARD_CEILING = 20;
const REPAIR_QUESTION_TYPES = Object.freeze(["reasoning", "mixed", "pbl"]);
const REPAIR_QUESTION_TYPE_SET = new Set(REPAIR_QUESTION_TYPES);
const CLOSED_QUESTION_TYPES = new Set(["numeric", "application"]);

const safeArray = (value) => Array.isArray(value) ? value : [];
const unique = (values) => [...new Set(safeArray(values).filter(Boolean).map(String))];
const sorted = (values) => unique(values).sort();
const countBy = (rows, keyFn) => Object.fromEntries([...rows.reduce((map, row) => {
  const key = String(keyFn(row));
  map.set(key, (map.get(key) ?? 0) + 1);
  return map;
}, new Map()).entries()].sort(([a], [b]) => a.localeCompare(b)));

function readJson(filePath, errorCode) {
  if (!fs.existsSync(filePath)) throw new Error(errorCode);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function csv(value) {
  const text = value == null ? "" : Array.isArray(value) ? value.join("|") : typeof value === "object" ? JSON.stringify(value) : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function writeCsv(columns, rows) {
  const lines = [columns.join(",")];
  for (const row of rows) lines.push(columns.map((column) => csv(row[column])).join(","));
  fs.writeFileSync(csvPath, `${lines.join("\n")}\n`);
}

function routeGapCodes(route) {
  const codes = new Set(safeArray(route.downstreamGapCodes));
  if (route.legalRoute === true && Number(route.verifiedMaxQuestionCount) === 0) codes.add("ZERO_SAFE_CAPACITY");
  if (route.legalRoute === true && Number(route.verifiedMaxQuestionCount) > 0 && Number(route.verifiedMaxQuestionCount) < HARD_CEILING) codes.add("CAPACITY_BELOW_20");
  return [...codes].sort();
}

function blockerRank(route) {
  if (route.legalRoute !== true) return 90;
  if (route.gapCodes.includes("ZERO_SAFE_CAPACITY")) return 0;
  if (route.gapCodes.includes("CAPACITY_BELOW_20")) return 10;
  if (route.gapCodes.includes("CROSS_SEED_ITEM_DIVERSITY_DEFICIENT")) return 20;
  if (route.gapCodes.length > 0) return 30;
  return 80;
}

function nextShortestStep(queue) {
  const first = queue[0] ?? null;
  if (!first) return "PGC-R06-A01_LiveReasoningMixedPBLRuntimeConformanceDiagnostics";
  if (first.gapCodes.includes("ZERO_SAFE_CAPACITY")) return "PGC-R06-A01_ZeroCapacityReasoningMixedPBLRouteFullFix";
  if (first.gapCodes.includes("CAPACITY_BELOW_20")) return "PGC-R06-A01_BoundedCapacityReasoningMixedPBLRouteFullFix";
  if (first.gapCodes.includes("CROSS_SEED_ITEM_DIVERSITY_DEFICIENT")) return "PGC-R06-A01_ReasoningMixedPBLDiversityFullFix";
  return "PGC-R06-A01_LiveReasoningMixedPBLRuntimeConformanceDiagnostics";
}

function markdown(inventory) {
  const s = inventory.summary;
  const lines = [
    "# PGC-R06 Reasoning / Mixed / PBL Route Inventory",
    "",
    "```text",
    `PROGRAM_ID = ${inventory.programId}`,
    `TASK_ID    = ${inventory.taskId}`,
    `STATUS     = ${inventory.status}`,
    "```",
    "",
    "## Frozen scope",
    "",
    "```text",
    `REPAIR_QUESTION_TYPES       = ${inventory.scope.repairQuestionTypes.join(", ")}`,
    `R06_ROUTE_COUNT             = ${s.r06RouteCount}`,
    `LEGAL_R06_ROUTE_COUNT       = ${s.legalR06RouteCount}`,
    `PUBLICLY_EXPOSED_R06_ROUTES = ${s.publiclyExposedR06RouteCount}`,
    `REPAIR_QUEUE_COUNT          = ${s.repairQueueCount}`,
    `CONFORMANT_ROUTE_COUNT      = ${s.conformantRouteCount}`,
    `R04_R05_MIXED_OVERLAP       = ${s.closedNumericApplicationMixedSelectionOverlapCount}`,
    `SLICE014_STARTED            = ${inventory.scope.slice014Started}`,
    "```",
    "",
    "Numeric/application routes using same-unit mixed-KP selection are read-only overlap. R06 must not reopen R04/R05 capacity or diversity decisions.",
    "",
    "## Route counts by question type",
    "",
    ...Object.entries(s.routeCountByQuestionType).map(([key, value]) => `- \`${key}\`: ${value}`),
    "",
    "## Repair queue by source",
    "",
    ...(Object.keys(s.repairQueueCountBySource).length > 0
      ? Object.entries(s.repairQueueCountBySource).map(([key, value]) => `- \`${key}\`: ${value}`)
      : ["- none"]),
    "",
    "## First queue entries",
    "",
    ...(inventory.repairQueue.slice(0, 20).map((row, index) => `${index + 1}. \`${row.routeId}\` — ${row.sourceId} / ${row.questionType} / ${row.gapCodes.join(", ")}`)),
    ...(inventory.repairQueue.length === 0 ? ["- none"] : []),
    "",
    "## Distance update",
    "",
    "```text",
    "GOAL_DISTANCE_BEFORE = D1_R05_APPLICATION_D0_R06_SCOPE_UNMATERIALIZED",
    "GOAL_DISTANCE_AFTER  = D1_R06_REASONING_MIXED_PBL_SCOPE_AND_QUEUE_FROZEN",
    "DISTANCE_REDUCED     = public reasoning/mixed/PBL routes are separated from R04/R05 read-only overlap and ordered into one deterministic repair queue",
    `REMAINING_BLOCKERS   = [${inventory.repairQueue.length > 0 ? "R06_ROUTE_RUNTIME_GAPS" : "R06_LIVE_RUNTIME_EVIDENCE"}]`,
    `NEXT_SHORTEST_STEP   = ${inventory.nextShortestStep}`,
    "```",
    "",
  ];
  return `${lines.join("\n")}\n`;
}

export function materializePgcR06ReasoningMixedPblInventory() {
  const capacity = readJson(capacityPath, "PGC_R06_CAPACITY_CONTRACT_MISSING");
  const ui = readJson(uiBindingPath, "PGC_R06_UI_BINDING_CONTRACT_MISSING");
  const publicScope = readJson(scopePath, "PGC_R06_PUBLIC_SCOPE_MISSING");
  if (capacity.schemaName !== "PublicGeneratorCapacityContractV3") throw new Error(`PGC_R06_CAPACITY_SCHEMA_INVALID:${capacity.schemaName}`);
  if (publicScope.scopePolicy?.slice014Started !== false) throw new Error("PGC_R06_SLICE014_FREEZE_VIOLATED");

  const bindingIdsByRouteId = new Map();
  for (const binding of safeArray(ui.bindings)) {
    for (const routeId of safeArray(binding.routeIds)) {
      const rows = bindingIdsByRouteId.get(routeId) ?? [];
      rows.push(binding.bindingId);
      bindingIdsByRouteId.set(routeId, rows);
    }
  }
  for (const binding of safeArray(capacity.historicalBindingEvidence)) {
    for (const routeId of safeArray(binding.routeIds)) {
      const rows = bindingIdsByRouteId.get(routeId) ?? [];
      rows.push(binding.bindingId);
      bindingIdsByRouteId.set(routeId, rows);
    }
  }

  const routeIds = new Set();
  const allRoutes = safeArray(capacity.routes).map((route) => {
    if (!route.routeId || routeIds.has(route.routeId)) throw new Error(`PGC_R06_ROUTE_ID_DUPLICATE_OR_MISSING:${route.routeId}`);
    routeIds.add(route.routeId);
    const gapCodes = routeGapCodes(route);
    const bindingIds = sorted(bindingIdsByRouteId.get(route.routeId) ?? []);
    return Object.freeze({
      routeId: route.routeId,
      caseId: route.caseId,
      sourceId: route.sourceId,
      selectionMode: route.selectionMode,
      selectedKnowledgePointIds: sorted(route.selectedKnowledgePointIds),
      questionType: route.questionType,
      publicPatternGroupIds: sorted(route.publicPatternGroupIds),
      generationPatternGroupIds: sorted(route.generationPatternGroupIds),
      compatiblePatternSpecIds: sorted(route.compatiblePatternSpecIds),
      depthMode: route.depthMode ?? null,
      contextMode: route.contextMode ?? null,
      legalRoute: route.legalRoute === true,
      legalRouteStatus: route.legalRouteStatus,
      verifiedMaxQuestionCount: Number(route.verifiedMaxQuestionCount) || 0,
      capacityStatus: route.capacityStatus,
      qualityStatus: route.qualityStatus,
      uniqueItemSetCount: Number(route.uniqueItemSetCount) || 0,
      uniqueOrderedWorksheetCount: Number(route.uniqueOrderedWorksheetCount) || 0,
      gapCodes,
      bindingIds,
      publiclyExposed: bindingIds.length > 0,
    });
  });

  const r06Routes = allRoutes.filter((route) => REPAIR_QUESTION_TYPE_SET.has(route.questionType));
  const closedOverlapRoutes = allRoutes.filter((route) => route.selectionMode === "mixedKnowledgePointsSameUnit" && CLOSED_QUESTION_TYPES.has(route.questionType));
  const repairQueue = r06Routes
    .filter((route) => route.legalRoute && route.gapCodes.length > 0)
    .sort((a, b) => blockerRank(a) - blockerRank(b)
      || a.sourceId.localeCompare(b.sourceId)
      || a.questionType.localeCompare(b.questionType)
      || a.routeId.localeCompare(b.routeId));
  const conformantRoutes = r06Routes.filter((route) => route.legalRoute && route.gapCodes.length === 0 && route.verifiedMaxQuestionCount === HARD_CEILING);
  const illegalRoutes = r06Routes.filter((route) => !route.legalRoute);

  if (r06Routes.length === 0) throw new Error("PGC_R06_SCOPE_ROUTE_SET_EMPTY");
  if (r06Routes.some((route) => !REPAIR_QUESTION_TYPE_SET.has(route.questionType))) throw new Error("PGC_R06_SCOPE_QUESTION_TYPE_LEAKAGE");
  if (closedOverlapRoutes.some((route) => REPAIR_QUESTION_TYPE_SET.has(route.questionType))) throw new Error("PGC_R06_CLOSED_OVERLAP_CLASSIFICATION_INVALID");

  const summary = Object.freeze({
    capacityContractRouteCount: allRoutes.length,
    r06RouteCount: r06Routes.length,
    legalR06RouteCount: r06Routes.filter((route) => route.legalRoute).length,
    illegalR06RouteCount: illegalRoutes.length,
    publiclyExposedR06RouteCount: r06Routes.filter((route) => route.publiclyExposed).length,
    conformantRouteCount: conformantRoutes.length,
    repairQueueCount: repairQueue.length,
    zeroCapacityRouteCount: r06Routes.filter((route) => route.gapCodes.includes("ZERO_SAFE_CAPACITY")).length,
    limitedCapacityRouteCount: r06Routes.filter((route) => route.gapCodes.includes("CAPACITY_BELOW_20")).length,
    diversityGapRouteCount: r06Routes.filter((route) => route.gapCodes.includes("CROSS_SEED_ITEM_DIVERSITY_DEFICIENT")).length,
    closedNumericApplicationMixedSelectionOverlapCount: closedOverlapRoutes.length,
    routeCountByQuestionType: Object.freeze(countBy(r06Routes, (route) => route.questionType)),
    routeCountBySelectionMode: Object.freeze(countBy(r06Routes, (route) => route.selectionMode)),
    repairQueueCountBySource: Object.freeze(countBy(repairQueue, (route) => route.sourceId)),
    repairQueueCountByGapCode: Object.freeze(countBy(repairQueue.flatMap((route) => route.gapCodes.map((gapCode) => ({ gapCode }))), (row) => row.gapCode)),
  });

  const inventory = Object.freeze({
    schemaName: "PublicReasoningMixedPblRouteInventoryV1",
    schemaVersion: 1,
    programId: PROGRAM_ID,
    taskId: TASK_ID,
    status: "PASS_R06_A00_SCOPE_AND_REPAIR_QUEUE_FROZEN",
    sourceAuthority: Object.freeze({
      capacityContract: path.relative(repoRoot, capacityPath).replaceAll(path.sep, "/"),
      uiBindingContract: path.relative(repoRoot, uiBindingPath).replaceAll(path.sep, "/"),
      publicGenerationScope: path.relative(repoRoot, scopePath).replaceAll(path.sep, "/"),
      capacityLastReconciliation: capacity.lastReconciliation ?? null,
    }),
    scope: Object.freeze({
      repairQuestionTypes: REPAIR_QUESTION_TYPES,
      closedQuestionTypesReadOnly: Object.freeze(["numeric", "application"]),
      sameUnitMixedSelectionOverlapIsReadOnly: true,
      crossUnitMixedSelectionAllowed: false,
      newKnowledgePointsAllowed: false,
      newPatternGroupsAllowed: false,
      newPatternSpecsAllowed: false,
      secondGeneratorAllowed: false,
      secondValidatorAllowed: false,
      slice014Started: false,
    }),
    summary,
    routes: Object.freeze(r06Routes),
    repairQueue: Object.freeze(repairQueue),
    conformantRouteIds: Object.freeze(conformantRoutes.map((route) => route.routeId).sort()),
    illegalRouteIds: Object.freeze(illegalRoutes.map((route) => route.routeId).sort()),
    closedScopeOverlapRoutes: Object.freeze(closedOverlapRoutes),
    nextShortestStep: nextShortestStep(repairQueue),
    boundary: Object.freeze({
      generatorModified: false,
      validatorModified: false,
      rendererModified: false,
      uiModified: false,
      capacityContractModified: false,
      r04NumericReopened: false,
      r05ApplicationReopened: false,
      slice014Started: false,
    }),
  });

  fs.mkdirSync(outputDir, { recursive: true });
  fs.mkdirSync(docsDir, { recursive: true });
  fs.writeFileSync(inventoryPath, `${JSON.stringify(inventory, null, 2)}\n`);
  const columns = [
    "queuePosition", "routeId", "sourceId", "selectionMode", "selectedKnowledgePointIds", "questionType",
    "depthMode", "contextMode", "legalRouteStatus", "verifiedMaxQuestionCount", "capacityStatus", "qualityStatus",
    "gapCodes", "publiclyExposed", "bindingIds",
  ];
  writeCsv(columns, r06Routes.map((route) => ({
    ...route,
    queuePosition: repairQueue.findIndex((candidate) => candidate.routeId === route.routeId) + 1 || "",
  })));
  fs.writeFileSync(readbackPath, markdown(inventory));

  const result = Object.freeze({
    status: inventory.status,
    routeCount: summary.r06RouteCount,
    repairQueueCount: summary.repairQueueCount,
    nextShortestStep: inventory.nextShortestStep,
    artifacts: Object.freeze([
      path.relative(repoRoot, inventoryPath).replaceAll(path.sep, "/"),
      path.relative(repoRoot, csvPath).replaceAll(path.sep, "/"),
      path.relative(repoRoot, readbackPath).replaceAll(path.sep, "/"),
    ]),
  });
  console.log(`PGC_R06_A00_INVENTORY=${JSON.stringify(result)}`);
  return inventory;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) materializePgcR06ReasoningMixedPblInventory();
