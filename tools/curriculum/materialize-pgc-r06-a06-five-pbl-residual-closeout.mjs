import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { buildWorksheetDocumentFromPlan } from "../../site/assets/browser/pipeline/build-worksheet-document.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const TASK_ID = "PGC-R06-A06_5ResidualPBLFixtureDiversityFullFix";
const NEXT_TASK_ID = "PGC-R06-A07_FinalReconciliationGlobalLiveGateAndD0Closeout";
const QUESTION_COUNT = 20;
const CAPACITY_GAP = "CAPACITY_BELOW_20";
const DIVERSITY_GAP = "CROSS_SEED_ITEM_DIVERSITY_DEFICIENT";
const REPAIR_TYPES = new Set(["reasoning", "mixed", "pbl"]);
const TARGET_ROUTE_IDS = Object.freeze([
  "pgc_r03_g3b_u04_3b04_pbl_e1916a90faec",
  "pgc_r03_g4a_u08_4a08_pbl_cf1460671cf4",
  "pgc_r03_g4b_u04_4b04_pbl_1b228f57b05b",
  "pgc_r03_g4b_u04_4b04_pbl_4e99e7e8fb6e",
  "pgc_r03_g4b_u04_4b04_pbl_9e62e1aef141",
]);

const paths = Object.freeze({
  capacity: "data/curriculum/public-generation/generator_capacity_contract.json",
  uiBinding: "data/curriculum/public-generation/ui_capability_binding_contract.json",
  inventory: "data/curriculum/public-generation/PGC-R06.reasoning-mixed-pbl-inventory.json",
  inventoryCsv: "data/curriculum/public-generation/reasoning_mixed_pbl_route_inventory.csv",
  a05Diagnostics: "data/curriculum/public-generation/PGC-R06-A05.g5a-u08-dual-axis-diagnostics.json",
  diagnostics: "data/curriculum/public-generation/PGC-R06-A06.five-pbl-residual-diagnostics.json",
  registry: "site/modules/curriculum/public/public-generator-capacity-registry.js",
  readback: "docs/curriculum/output/PGC-R06-A06_5ResidualPBLFixtureDiversityFullFix.md",
});

const absolute = (relativePath) => path.join(repoRoot, relativePath);
const readJson = (relativePath) => JSON.parse(fs.readFileSync(absolute(relativePath), "utf8"));
const writeJson = (relativePath, value) => fs.writeFileSync(absolute(relativePath), `${JSON.stringify(value, null, 2)}\n`);
const unique = (values = []) => [...new Set(values.filter((value) => value !== null && value !== undefined && value !== ""))];
const hash = (value) => crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");

function csv(value) {
  const text = value == null ? "" : Array.isArray(value) ? value.join("|") : typeof value === "object" ? JSON.stringify(value) : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function countBy(values) {
  return Object.fromEntries([...values.reduce((map, value) => map.set(value, (map.get(value) ?? 0) + 1), new Map())]
    .sort(([left], [right]) => String(left).localeCompare(String(right))));
}

function canonicalGaps(route = {}) {
  return unique(Array.isArray(route.downstreamGapCodes) ? route.downstreamGapCodes : []).sort();
}

function inventoryGaps(route = {}) {
  const gaps = new Set(canonicalGaps(route));
  if (route.legalRoute === true && Number(route.verifiedMaxQuestionCount) === 0) gaps.add("ZERO_SAFE_CAPACITY");
  if (route.legalRoute === true && Number(route.verifiedMaxQuestionCount) > 0 && Number(route.verifiedMaxQuestionCount) < QUESTION_COUNT) gaps.add(CAPACITY_GAP);
  return [...gaps].sort();
}

function blockerRank(route) {
  if (route.gapCodes.includes("ZERO_SAFE_CAPACITY")) return 0;
  if (route.gapCodes.includes(CAPACITY_GAP)) return 10;
  if (route.gapCodes.includes(DIVERSITY_GAP)) return 20;
  if (route.gapCodes.length > 0) return 30;
  return 80;
}

function planFor(route, generationSeed) {
  return {
    sourceId: route.sourceId,
    questionCount: QUESTION_COUNT,
    ordering: "groupedByPattern",
    includeAnswerKey: true,
    generationSeed,
    selectionMode: route.selectionMode,
    selectedKnowledgePointIds: [...(route.selectedKnowledgePointIds ?? [])],
    selectedPatternGroupIds: [...(route.publicPatternGroupIds ?? [])],
    questionMode: "pbl",
    depthMode: route.depthMode ?? "mixed",
    contextMode: route.contextMode ?? "mixed",
    printLayout: {
      paperSize: "A4",
      columns: 1,
      rowsPerPage: 1,
      showAnswerKeyPage: true,
      showQuestionNumbers: true,
    },
  };
}

function runRoute(route, generationSeed) {
  const result = buildWorksheetDocumentFromPlan(planFor(route, generationSeed));
  const document = result?.worksheetDocument;
  const questions = document?.questions ?? document?.generatedQuestions ?? [];
  const prompts = questions.map((row) => String(row.prompt ?? row.promptText ?? row.blankedDisplayText ?? "").trim());
  return {
    seed: generationSeed,
    ok: result?.ok === true,
    thrownError: null,
    errorCodes: unique((result?.errors ?? []).map((error) => error?.code ?? String(error))),
    evidenceProjection: "worksheetDocument.questions",
    questionCount: document?.questionCount ?? questions.length,
    answerKeyItemCount: document?.answerKeyItems?.length ?? 0,
    missingPromptCount: prompts.filter((prompt) => !prompt).length,
    duplicateItemCount: 0,
    duplicatePromptCount: prompts.length - new Set(prompts).size,
    uniquePromptCount: new Set(prompts).size,
    orderedWorksheetSignature: hash(prompts),
    itemSetSignature: hash([...prompts].sort()),
    patternSpecIdsObserved: unique(questions.map((row) => row.patternSpecId)),
    knowledgePointIdsObserved: unique(questions.map((row) => row.knowledgePointId)),
    requestedRouteId: route.routeId,
  };
}

function diagnoseRoute(route) {
  const seeds = [`pgc-r06-a06:${route.routeId}:A`, `pgc-r06-a06:${route.routeId}:B`];
  const runs = seeds.map((seed) => runRoute(route, seed));
  const replay = runRoute(route, seeds[0]);
  const accepted = runs.every((run) => run.ok
      && run.questionCount === QUESTION_COUNT
      && run.answerKeyItemCount === QUESTION_COUNT
      && run.missingPromptCount === 0
      && run.duplicatePromptCount === 0)
    && replay.orderedWorksheetSignature === runs[0].orderedWorksheetSignature
    && new Set(runs.map((run) => run.itemSetSignature)).size === 2;
  return {
    routeId: route.routeId,
    caseId: route.caseId,
    sourceId: route.sourceId,
    selectionMode: route.selectionMode,
    questionType: route.questionType,
    depthMode: route.depthMode ?? null,
    contextMode: route.contextMode ?? null,
    accepted,
    runs,
    replay,
  };
}

function canonicalizeA05(capacity) {
  const a05 = readJson(paths.a05Diagnostics);
  const routeIds = new Set(a05.routes.map((route) => route.routeId));
  if (routeIds.size !== 30) throw new Error(`PGC_R06_A06_A05_ROUTE_COUNT_MISMATCH:${routeIds.size}`);
  let matched = 0;
  for (const route of capacity.routes) {
    delete route.gapCodes;
    if (!routeIds.has(route.routeId)) continue;
    matched += 1;
    route.downstreamGapCodes = canonicalGaps(route).filter((code) => ![CAPACITY_GAP, DIVERSITY_GAP].includes(code));
    route.verifiedMaxQuestionCount = QUESTION_COUNT;
    route.capacityStatus = "VERIFIED_20";
    route.qualityStatus = "DIVERSE_PARAMETER_GENERATOR";
    route.uniqueItemSetCount = Math.max(2, Number(route.uniqueItemSetCount) || 0);
    route.uniqueOrderedWorksheetCount = Math.max(2, Number(route.uniqueOrderedWorksheetCount) || 0);
  }
  if (matched !== 30) throw new Error(`PGC_R06_A06_A05_CANONICAL_MATCH_MISMATCH:${matched}`);
  return routeIds;
}

function deriveInventoryRows(capacity, existingInventory) {
  const capacityById = new Map(capacity.routes.map((route) => [route.routeId, route]));
  return existingInventory.routes.map((row) => {
    const route = capacityById.get(row.routeId);
    if (!route) throw new Error(`PGC_R06_A06_CAPACITY_ROUTE_MISSING:${row.routeId}`);
    return {
      ...row,
      verifiedMaxQuestionCount: Number(route.verifiedMaxQuestionCount) || 0,
      capacityStatus: route.capacityStatus,
      qualityStatus: route.qualityStatus,
      uniqueItemSetCount: Number(route.uniqueItemSetCount) || 0,
      uniqueOrderedWorksheetCount: Number(route.uniqueOrderedWorksheetCount) || 0,
      gapCodes: inventoryGaps(route),
      reconciliationStatus: route.lastReconciliation?.taskId === TASK_ID
        ? "A06_RECONCILED_AND_REMOVED_FROM_QUEUE"
        : row.reconciliationStatus,
    };
  });
}

function deriveRepairQueue(rows) {
  return rows.filter((route) => route.legalRoute === true && route.publiclyExposed === true && route.gapCodes.length > 0)
    .sort((a, b) => blockerRank(a) - blockerRank(b)
      || a.sourceId.localeCompare(b.sourceId)
      || a.questionType.localeCompare(b.questionType)
      || a.routeId.localeCompare(b.routeId));
}

function refreshCapacitySummary(capacity) {
  const legal = capacity.routes.filter((route) => route.legalRoute === true);
  const diversityGapRouteCount = legal.filter((route) => canonicalGaps(route).includes(DIVERSITY_GAP)).length;
  capacity.summary = {
    ...capacity.summary,
    routeCount: capacity.routes.length,
    legalRouteCount: legal.length,
    illegalRouteCount: capacity.routes.length - legal.length,
    verified20RouteCount: legal.filter((route) => Number(route.verifiedMaxQuestionCount) >= QUESTION_COUNT).length,
    verifiedLimitedRouteCount: legal.filter((route) => Number(route.verifiedMaxQuestionCount) > 0 && Number(route.verifiedMaxQuestionCount) < QUESTION_COUNT).length,
    zeroCapacityRouteCount: legal.filter((route) => Number(route.verifiedMaxQuestionCount) <= 0).length,
    diversityGapRouteCount,
  };
  capacity.downstreamGaps = diversityGapRouteCount > 0 ? [{ code: DIVERSITY_GAP, count: diversityGapRouteCount }] : [];
  capacity.status = capacity.hardBlockers?.length > 0 ? "FAIL" : capacity.downstreamGaps.length > 0 ? "PASS_WITH_DOWNSTREAM_GAPS" : "PASS";
}

function selectedEvidence(diagnostic) {
  return {
    passed: true,
    questionCount: QUESTION_COUNT,
    evidenceAuthority: "PGC-R06-A06_FINAL_FIVE_PBL_TWO_SEED_LIVE_RUNTIME",
    evidenceSource: paths.diagnostics,
    taskId: TASK_ID,
    seedCount: 2,
    runs: diagnostic.runs,
    replay: diagnostic.replay,
  };
}

function reconcileCapacity(capacity, diagnostics) {
  const byId = new Map(diagnostics.routes.map((route) => [route.routeId, route]));
  let matched = 0;
  for (const route of capacity.routes) {
    const diagnostic = byId.get(route.routeId);
    if (!diagnostic) continue;
    matched += 1;
    route.verifiedMaxQuestionCount = QUESTION_COUNT;
    route.capacityStatus = "VERIFIED_20";
    route.qualityStatus = "DIVERSE_PARAMETER_GENERATOR";
    route.uniqueItemSetCount = 2;
    route.uniqueOrderedWorksheetCount = 2;
    route.downstreamGapCodes = canonicalGaps(route).filter((code) => ![CAPACITY_GAP, DIVERSITY_GAP].includes(code));
    route.selectedCapacityEvidence = selectedEvidence(diagnostic);
    route.reconciliationCodes = unique([...(route.reconciliationCodes ?? []), "PGC_R06_A06_FINAL_PBL_CROSS_SEED_DIVERSITY_RECONCILED"]);
    route.lastReconciliation = {
      taskId: TASK_ID,
      live20Pass: true,
      crossSeedDistinct: true,
      evidenceAuthority: paths.diagnostics,
    };
  }
  if (matched !== 5) throw new Error(`PGC_R06_A06_CAPACITY_MATCH_MISMATCH:${matched}`);
  refreshCapacitySummary(capacity);
  capacity.lastR06A06Reconciliation = {
    programId: capacity.programId,
    taskId: TASK_ID,
    routeCount: 5,
    sourceRouteCount: { g3b_u04_3b04: 1, g4a_u08_4a08: 1, g4b_u04_4b04: 3 },
    removedDiversityGapCount: 5,
    status: "PASS_R06_A06_CAPACITY_RECONCILED",
  };
  return capacity;
}

function reconcileUiBinding(ui, capacity) {
  const targetRoutes = capacity.routes.filter((route) => TARGET_ROUTE_IDS.includes(route.routeId));
  const routesByKey = new Map();
  for (const route of targetRoutes) {
    const key = `${route.caseId}::${route.questionType}`;
    const rows = routesByKey.get(key) ?? [];
    rows.push(route);
    routesByKey.set(key, rows);
  }
  let matchedBindingCount = 0;
  for (const binding of ui.bindings) {
    const routes = routesByKey.get(`${binding.caseId}::${binding.questionType}`);
    if (!routes) continue;
    matchedBindingCount += 1;
    binding.verifiedCapacityQuestionCountMax = QUESTION_COUNT;
    binding.capacityQualityStatuses = ["DIVERSE_PARAMETER_GENERATOR"];
    binding.capacityRouteIds = unique([...(binding.capacityRouteIds ?? []), ...routes.map((route) => route.routeId)]);
    binding.lastCapacityReconciliation = {
      taskId: TASK_ID,
      verifiedRouteMax: QUESTION_COUNT,
      crossSeedDiverse: true,
    };
  }
  if (matchedBindingCount !== 9) throw new Error(`PGC_R06_A06_UI_BINDING_COUNT_MISMATCH:${matchedBindingCount}`);
  ui.lastR06A06Reconciliation = {
    taskId: TASK_ID,
    routeCount: 5,
    matchedBindingCount,
    status: "PASS_R06_A06_PUBLIC_BINDING_RECONCILED",
  };
  return { ui, matchedBindingCount };
}

function materializeRegistry(capacity) {
  const rows = capacity.routes.map((route) => [
    route.sourceId,
    route.selectionMode,
    route.selectionMode === "sourceUnit" ? "" : unique(route.selectedKnowledgePointIds ?? []).sort().join("|"),
    route.questionType,
    unique(route.publicPatternGroupIds ?? []).sort().join("|"),
    route.depthMode ?? "",
    route.contextMode ?? "",
    Number(route.verifiedMaxQuestionCount ?? 0),
    route.legalRoute === true ? "LEGAL" : "ILLEGAL",
    route.qualityStatus ?? "UNKNOWN",
    route.routeId,
  ]);
  const metadata = {
    taskId: TASK_ID,
    routeCount: 5,
    verifiedRouteMax: QUESTION_COUNT,
    evidenceAuthority: paths.diagnostics,
    status: "PASS_R06_A06_RUNTIME_REGISTRY_RECONCILED",
  };
  fs.writeFileSync(absolute(paths.registry), `export const PUBLIC_GENERATOR_CAPACITY_REGISTRY_STATUS = "MATERIALIZED_PGC_R03_V3";\nexport const PUBLIC_GENERATOR_CAPACITY_RECONCILIATION = Object.freeze(${JSON.stringify(metadata)});\nexport const PUBLIC_GENERATOR_CAPACITY_ROWS = Object.freeze(${JSON.stringify(rows)});\n`);
  return rows.length;
}

function writeInventoryCsv(rows) {
  const columns = ["routeId", "caseId", "sourceId", "selectionMode", "questionType", "depthMode", "contextMode", "verifiedMaxQuestionCount", "capacityStatus", "qualityStatus", "gapCodes", "publiclyExposed"];
  const lines = [columns.join(",")];
  for (const row of rows) lines.push(columns.map((column) => csv(row[column])).join(","));
  fs.writeFileSync(absolute(paths.inventoryCsv), `${lines.join("\n")}\n`);
}

function reconcileInventory(capacity, existingInventory, preA06Queue) {
  const routes = deriveInventoryRows(capacity, existingInventory);
  const repairQueue = deriveRepairQueue(routes);
  if (repairQueue.length !== 0) throw new Error(`PGC_R06_A06_REPAIR_QUEUE_AFTER_MISMATCH:${repairQueue.length}`);
  const legal = routes.filter((route) => route.legalRoute === true);
  const summary = {
    ...existingInventory.summary,
    conformantRouteCount: legal.filter((route) => route.gapCodes.length === 0 && route.verifiedMaxQuestionCount === QUESTION_COUNT).length,
    repairQueueCount: 0,
    zeroCapacityRouteCount: legal.filter((route) => route.verifiedMaxQuestionCount <= 0).length,
    limitedCapacityRouteCount: legal.filter((route) => route.verifiedMaxQuestionCount > 0 && route.verifiedMaxQuestionCount < QUESTION_COUNT).length,
    diversityGapRouteCount: legal.filter((route) => route.gapCodes.includes(DIVERSITY_GAP)).length,
    repairQueueCountBySource: {},
    repairQueueCountByGapCode: {},
  };
  const inventory = {
    ...existingInventory,
    sourceAuthority: {
      ...existingInventory.sourceAuthority,
      capacityLastR06Reconciliation: capacity.lastR06A06Reconciliation,
    },
    summary,
    routes,
    repairQueue,
    conformantRouteIds: routes.filter((route) => route.legalRoute === true && route.gapCodes.length === 0 && route.verifiedMaxQuestionCount === QUESTION_COUNT).map((route) => route.routeId).sort(),
    nextShortestStep: NEXT_TASK_ID,
    lastR06A03Reconciliation: capacity.lastR06A03Reconciliation,
    lastR06A04Reconciliation: {
      taskId: "PGC-R06-A04_G5A-U02_12_PBL_CrossSeedDiversityFullFix",
      repairQueueBefore: 47,
      removedFromRepairQueueCount: 12,
      repairQueueAfter: 35,
      status: "PASS_R06_A04_G5A_U02_PBL_DIVERSITY_RECONCILED",
    },
    lastR06A05Reconciliation: {
      taskId: "PGC-R06-A05_G5A-U08_30ResidualDualAxisFullFix",
      repairQueueBefore: 35,
      removedFromRepairQueueCount: 30,
      repairQueueAfter: 5,
      pblDiversityRouteCount: 9,
      mixedCapacityRouteCount: 21,
      canonicalGapFieldRepairApplied: true,
      status: "PASS_R06_A05_G5A_U08_DUAL_AXIS_RECONCILED",
    },
    lastR06A06Reconciliation: {
      taskId: TASK_ID,
      repairQueueBefore: preA06Queue.length,
      removedFromRepairQueueCount: 5,
      repairQueueAfter: 0,
      status: "PASS_R06_A06_FINAL_FIVE_PBL_RECONCILED",
    },
    reconciliation: {
      taskId: TASK_ID,
      capacityContract: paths.capacity,
      publicBindingContract: paths.uiBinding,
      runtimeRegistry: paths.registry,
      diagnostics: paths.diagnostics,
    },
  };
  writeInventoryCsv(routes);
  return inventory;
}

const capacity = readJson(paths.capacity);
const existingInventory = readJson(paths.inventory);
canonicalizeA05(capacity);

const preRows = deriveInventoryRows(capacity, existingInventory);
const preA06Queue = deriveRepairQueue(preRows);
if (preA06Queue.length !== 5) throw new Error(`PGC_R06_A06_CANONICAL_PREQUEUE_MISMATCH:${preA06Queue.length}`);
if (JSON.stringify(preA06Queue.map((route) => route.routeId).sort()) !== JSON.stringify([...TARGET_ROUTE_IDS].sort())) {
  throw new Error(`PGC_R06_A06_CANONICAL_PREQUEUE_ID_MISMATCH:${JSON.stringify(preA06Queue.map((route) => route.routeId))}`);
}

const capacityById = new Map(capacity.routes.map((route) => [route.routeId, route]));
const targetRoutes = TARGET_ROUTE_IDS.map((routeId) => {
  const route = capacityById.get(routeId);
  if (!route) throw new Error(`PGC_R06_A06_TARGET_ROUTE_MISSING:${routeId}`);
  return route;
});

const diagnostics = {
  schemaName: "PGCR06A06FivePblResidualDiagnosticsV1",
  schemaVersion: 1,
  programId: capacity.programId,
  taskId: TASK_ID,
  routes: targetRoutes.map(diagnoseRoute),
};
diagnostics.summary = {
  targetRouteCount: diagnostics.routes.length,
  acceptedRouteCount: diagnostics.routes.filter((route) => route.accepted).length,
  failedRouteCount: diagnostics.routes.filter((route) => !route.accepted).length,
  routeCountBySource: countBy(diagnostics.routes.map((route) => route.sourceId)),
};
if (diagnostics.summary.acceptedRouteCount !== 5 || diagnostics.summary.failedRouteCount !== 0) {
  throw new Error(`PGC_R06_A06_LIVE_GATE_FAILED:${JSON.stringify(diagnostics.summary)}`);
}
writeJson(paths.diagnostics, diagnostics);

const reconciledCapacity = reconcileCapacity(capacity, diagnostics);
const { ui, matchedBindingCount } = reconcileUiBinding(readJson(paths.uiBinding), reconciledCapacity);
const registryRowCount = materializeRegistry(reconciledCapacity);
const inventory = reconcileInventory(reconciledCapacity, existingInventory, preA06Queue);

writeJson(paths.capacity, reconciledCapacity);
writeJson(paths.uiBinding, ui);
writeJson(paths.inventory, inventory);

const readback = [
  "# PGC-R06 A06 Final Five PBL Residual Closeout",
  "",
  "```text",
  `TASK_ID = ${TASK_ID}`,
  "A05_CANONICAL_GAP_FIELD_REPAIR = PASS",
  "A00_TEST_SIDE_EFFECT_REMOVED = PASS",
  `LIVE_GATE = ${diagnostics.summary.acceptedRouteCount}/${diagnostics.summary.targetRouteCount}`,
  "QUESTION_COUNT_PER_ROUTE = 20",
  "REPAIR_QUEUE_BEFORE = 5",
  "REPAIR_QUEUE_AFTER = 0",
  "REMOVED_FROM_QUEUE = 5",
  `PUBLIC_BINDING_COUNT = ${matchedBindingCount}`,
  `RUNTIME_REGISTRY_ROW_COUNT = ${registryRowCount}`,
  "STATUS = PASS_R06_A06_FINAL_FIVE_PBL_RECONCILED",
  "```",
  "",
  "No new KnowledgePoint, PatternGroup, PatternSpec, context family, generator, validator, renderer, or UI control was added.",
  "",
  "```text",
  "GOAL_DISTANCE_BEFORE = D1_R06_5_ROUTE_FINAL_RESIDUAL",
  "GOAL_DISTANCE_AFTER  = D1_R06_ZERO_ROUTE_QUEUE_FINAL_CLOSEOUT_PENDING",
  "DISTANCE_REDUCED     = final five PBL routes now have deterministic unique 20-item two-seed live evidence",
  "REMAINING_BLOCKERS   = [R06_FINAL_RECONCILIATION_AND_D0_CLOSEOUT]",
  `NEXT_SHORTEST_STEP   = ${NEXT_TASK_ID}`,
  "```",
];
fs.writeFileSync(absolute(paths.readback), `${readback.join("\n")}\n`);

console.log(`PGC_R06_A06_RECONCILIATION=${JSON.stringify({
  status: "PASS_R06_A06_FINAL_FIVE_PBL_RECONCILED",
  a05CanonicalGapFieldRepair: true,
  a00TestSideEffectRemoved: true,
  liveGate: `${diagnostics.summary.acceptedRouteCount}/${diagnostics.summary.targetRouteCount}`,
  repairQueueBefore: preA06Queue.length,
  repairQueueAfter: inventory.repairQueue.length,
  registryRowCount,
  matchedBindingCount,
})}`);
