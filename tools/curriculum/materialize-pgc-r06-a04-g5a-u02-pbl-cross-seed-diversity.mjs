import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { buildWorksheetDocumentFromPlan } from "../../site/assets/browser/pipeline/build-worksheet-document.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const TASK_ID = "PGC-R06-A04_G5A-U02_12_PBL_CrossSeedDiversityFullFix";
const SOURCE_ID = "g5a_u02_5a02";
const ROUTE_COUNT = 12;
const QUESTION_COUNT = 20;
const DIVERSITY_GAP = "CROSS_SEED_ITEM_DIVERSITY_DEFICIENT";
const SEEDS = Object.freeze(["pgc-r06-a04-g5a-u02-01", "pgc-r06-a04-g5a-u02-02"]);

const paths = Object.freeze({
  capacity: "data/curriculum/public-generation/generator_capacity_contract.json",
  uiBinding: "data/curriculum/public-generation/ui_capability_binding_contract.json",
  registry: "site/modules/curriculum/public/public-generator-capacity-registry.js",
  repairInventory: "data/curriculum/public-generation/PGC-R06.reasoning-mixed-pbl-inventory.json",
  diagnostics: "data/curriculum/public-generation/PGC-R06-A04.g5a-u02-pbl-cross-seed-diagnostics.json",
  readback: "docs/curriculum/output/PGC-R06-A04_G5A_U02_PBL_CrossSeedDiversity.md",
});

function absolute(relativePath) {
  return path.join(repoRoot, relativePath);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(absolute(relativePath), "utf8"));
}

function writeJson(relativePath, value) {
  fs.writeFileSync(absolute(relativePath), `${JSON.stringify(value, null, 2)}\n`);
}

function unique(values = []) {
  return [...new Set(values.filter((value) => value !== null && value !== undefined && value !== ""))];
}

function countBy(values) {
  return Object.fromEntries([...values.reduce((map, value) => map.set(value, (map.get(value) ?? 0) + 1), new Map())]
    .sort(([left], [right]) => String(left).localeCompare(String(right))));
}

function hash(value) {
  return crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function routeGapCodes(route = {}) {
  return Array.isArray(route.gapCodes) ? [...route.gapCodes] : [];
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
      rowsPerPage: 20,
      showAnswerKeyPage: true,
      showQuestionNumbers: true,
    },
  };
}

function runRoute(route, generationSeed) {
  const result = buildWorksheetDocumentFromPlan(planFor(route, generationSeed));
  const document = result?.worksheetDocument;
  const prompts = document?.questions?.map((row) => row.prompt) ?? [];
  const patternSpecIdsObserved = unique(document?.questions?.map((row) => row.patternSpecId) ?? []);
  const knowledgePointIdsObserved = unique(document?.questions?.map((row) => row.knowledgePointId) ?? []);
  return {
    seed: generationSeed,
    ok: result?.ok === true,
    errorCodes: unique((result?.errors ?? []).map((error) => error?.code ?? String(error))),
    questionCount: document?.questionCount ?? 0,
    answerKeyItemCount: document?.answerKeyItems?.length ?? 0,
    uniquePromptCount: new Set(prompts).size,
    duplicatePromptCount: prompts.length - new Set(prompts).size,
    itemSetSignature: hash([...prompts].sort()),
    orderedWorksheetSignature: hash(prompts),
    patternSpecIdsObserved,
    knowledgePointIdsObserved,
  };
}

function diagnoseRoute(route) {
  const runs = SEEDS.map((seed) => runRoute(route, seed));
  const replay = runRoute(route, SEEDS[0]);
  const accepted = runs.every((run) => run.ok
      && run.questionCount === QUESTION_COUNT
      && run.answerKeyItemCount === QUESTION_COUNT
      && run.uniquePromptCount === QUESTION_COUNT
      && run.duplicatePromptCount === 0
      && run.patternSpecIdsObserved.length === 1
      && run.patternSpecIdsObserved[0] === "pbl_g5a_u02_equal_group_design")
    && replay.orderedWorksheetSignature === runs[0].orderedWorksheetSignature
    && new Set(runs.map((run) => run.itemSetSignature)).size === SEEDS.length;
  return {
    routeId: route.routeId,
    caseId: route.caseId,
    sourceId: route.sourceId,
    selectionMode: route.selectionMode,
    questionType: route.questionType,
    depthMode: route.depthMode ?? null,
    contextMode: route.contextMode ?? null,
    accepted,
    diagnosticRuns: runs,
    replay,
  };
}

function selectedEvidence(diagnostic) {
  return {
    passed: true,
    questionCount: QUESTION_COUNT,
    evidenceAuthority: "PGC-R06-A04_G5A-U02_PBL_TWO_SEED_LIVE_RUNTIME",
    evidenceSource: paths.diagnostics,
    taskId: TASK_ID,
    seedCount: diagnostic.diagnosticRuns.length,
    runs: diagnostic.diagnosticRuns.map((run) => ({
      seed: run.seed,
      ok: run.ok,
      thrownError: null,
      errorCodes: run.errorCodes,
      evidenceProjection: "questionDisplayModels",
      questionCount: run.questionCount,
      answerKeyItemCount: run.answerKeyItemCount,
      missingPromptCount: 0,
      duplicateItemCount: 0,
      duplicatePromptCount: run.duplicatePromptCount,
      uniquePromptCount: run.uniquePromptCount,
      orderedWorksheetSignature: run.orderedWorksheetSignature,
      itemSetSignature: run.itemSetSignature,
      patternSpecIdsObserved: run.patternSpecIdsObserved,
      knowledgePointIdsObserved: run.knowledgePointIdsObserved,
      requestedRouteId: diagnostic.routeId,
    })),
    replay: {
      ...diagnostic.replay,
      requestedRouteId: diagnostic.routeId,
    },
  };
}

function recalculateCapacitySummary(capacity) {
  const legal = capacity.routes.filter((route) => route.legalRoute === true);
  const capacityGapCount = legal.filter((route) => routeGapCodes(route).includes("CAPACITY_BELOW_20")).length;
  const diversityGapCount = legal.filter((route) => routeGapCodes(route).includes(DIVERSITY_GAP)).length;
  capacity.summary = {
    ...capacity.summary,
    routeCount: capacity.routes.length,
    legalRouteCount: legal.length,
    illegalRouteCount: capacity.routes.length - legal.length,
    verified20RouteCount: legal.filter((route) => route.verifiedMaxQuestionCount >= QUESTION_COUNT).length,
    verifiedLimitedRouteCount: legal.filter((route) => route.verifiedMaxQuestionCount > 0 && route.verifiedMaxQuestionCount < QUESTION_COUNT).length,
    zeroCapacityRouteCount: legal.filter((route) => !Number.isFinite(route.verifiedMaxQuestionCount) || route.verifiedMaxQuestionCount <= 0).length,
    diversityGapRouteCount: diversityGapCount,
  };
  capacity.downstreamGaps = [
    { code: "CAPACITY_BELOW_20", count: capacityGapCount },
    { code: DIVERSITY_GAP, count: diversityGapCount },
  ].filter((entry) => entry.count > 0);
  capacity.status = capacity.downstreamGaps.length ? "PASS_WITH_DOWNSTREAM_GAPS" : "PASS";
}

function reconcileCapacity(capacity, diagnosticsByRoute) {
  let matched = 0;
  for (const route of capacity.routes) {
    const diagnostic = diagnosticsByRoute.get(route.routeId);
    if (!diagnostic) continue;
    matched += 1;
    route.verifiedMaxQuestionCount = QUESTION_COUNT;
    route.capacityStatus = "VERIFIED_20";
    route.qualityStatus = "DIVERSE_PARAMETER_GENERATOR";
    route.uniqueItemSetCount = 2;
    route.uniqueOrderedWorksheetCount = 2;
    route.gapCodes = routeGapCodes(route).filter((code) => code !== DIVERSITY_GAP);
    route.selectedCapacityEvidence = selectedEvidence(diagnostic);
    route.reconciliationCodes = unique([...(route.reconciliationCodes ?? []), "PGC_R06_A04_PBL_CROSS_SEED_DIVERSITY_RECONCILED"]);
    route.lastReconciliation = {
      taskId: TASK_ID,
      live20Pass: true,
      crossSeedDistinct: true,
      evidenceAuthority: paths.diagnostics,
    };
  }
  if (matched !== ROUTE_COUNT) throw new Error(`PGC_R06_A04_CAPACITY_ROUTE_MATCH_MISMATCH:${matched}`);
  recalculateCapacitySummary(capacity);
  capacity.lastR06A04Reconciliation = {
    programId: capacity.programId,
    taskId: TASK_ID,
    sourceId: SOURCE_ID,
    routeCount: ROUTE_COUNT,
    removedDiversityGapCount: ROUTE_COUNT,
    status: "PASS_R06_A04_CAPACITY_RECONCILED",
  };
  return capacity;
}

function reconcileUiBinding(uiBinding, capacity, routeIds) {
  const targetRoutes = capacity.routes.filter((route) => routeIds.has(route.routeId));
  const routesByKey = new Map();
  for (const route of targetRoutes) {
    const key = `${route.caseId}::${route.questionType}`;
    if (!routesByKey.has(key)) routesByKey.set(key, []);
    routesByKey.get(key).push(route);
  }
  let matchedBindingCount = 0;
  for (const binding of uiBinding.bindings) {
    const routes = routesByKey.get(`${binding.caseId}::${binding.questionType}`);
    if (!routes) continue;
    matchedBindingCount += 1;
    binding.capacityQualityStatuses = ["DIVERSE_PARAMETER_GENERATOR"];
    binding.capacityRouteIds = unique([...(binding.capacityRouteIds ?? []), ...routes.map((route) => route.routeId)]);
    binding.lastCapacityReconciliation = {
      taskId: TASK_ID,
      sourceId: SOURCE_ID,
      verifiedRouteMax: QUESTION_COUNT,
      crossSeedDiverse: true,
    };
  }
  if (matchedBindingCount === 0) throw new Error("PGC_R06_A04_UI_BINDING_MATCH_MISSING");
  uiBinding.lastR06A04Reconciliation = {
    taskId: TASK_ID,
    sourceId: SOURCE_ID,
    routeCount: ROUTE_COUNT,
    matchedBindingCount,
    status: "PASS_R06_A04_PUBLIC_BINDING_RECONCILED",
  };
  return { uiBinding, matchedBindingCount };
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
    sourceId: SOURCE_ID,
    routeCount: ROUTE_COUNT,
    verifiedRouteMax: QUESTION_COUNT,
    evidenceAuthority: paths.diagnostics,
    status: "PASS_R06_A04_RUNTIME_REGISTRY_RECONCILED",
  };
  fs.writeFileSync(absolute(paths.registry), `export const PUBLIC_GENERATOR_CAPACITY_REGISTRY_STATUS = "MATERIALIZED_PGC_R03_V3";\nexport const PUBLIC_GENERATOR_CAPACITY_RECONCILIATION = Object.freeze(${JSON.stringify(metadata)});\nexport const PUBLIC_GENERATOR_CAPACITY_ROWS = Object.freeze(${JSON.stringify(rows)});\n`);
  return rows.length;
}

function reconcileInventory(inventory, diagnosticsByRoute) {
  const before = inventory.repairQueue?.length ?? inventory.routes.filter((route) => route.legalRoute === true && route.publiclyExposed === true && routeGapCodes(route).length > 0).length;
  if (before !== 47) throw new Error(`PGC_R06_A04_REPAIR_QUEUE_BASELINE_MISMATCH:${before}`);
  let matched = 0;
  for (const route of inventory.routes) {
    if (!diagnosticsByRoute.has(route.routeId)) continue;
    matched += 1;
    route.verifiedMaxQuestionCount = QUESTION_COUNT;
    route.capacityStatus = "VERIFIED_20";
    route.qualityStatus = "DIVERSE_PARAMETER_GENERATOR";
    route.uniqueItemSetCount = 2;
    route.uniqueOrderedWorksheetCount = 2;
    route.gapCodes = routeGapCodes(route).filter((code) => code !== DIVERSITY_GAP);
    route.reconciliationStatus = "RECONCILED_AND_REMOVED_FROM_QUEUE";
  }
  if (matched !== ROUTE_COUNT) throw new Error(`PGC_R06_A04_INVENTORY_ROUTE_MATCH_MISMATCH:${matched}`);
  inventory.repairQueue = inventory.routes.filter((route) => route.legalRoute === true && route.publiclyExposed === true && routeGapCodes(route).length > 0);
  if (inventory.repairQueue.length !== 35) throw new Error(`PGC_R06_A04_REPAIR_QUEUE_AFTER_MISMATCH:${inventory.repairQueue.length}`);
  const legal = inventory.routes.filter((route) => route.legalRoute === true);
  inventory.summary = {
    ...inventory.summary,
    conformantRouteCount: legal.filter((route) => routeGapCodes(route).length === 0).length,
    repairQueueCount: inventory.repairQueue.length,
    zeroCapacityRouteCount: legal.filter((route) => !Number.isFinite(route.verifiedMaxQuestionCount) || route.verifiedMaxQuestionCount <= 0).length,
    limitedCapacityRouteCount: legal.filter((route) => route.verifiedMaxQuestionCount > 0 && route.verifiedMaxQuestionCount < QUESTION_COUNT).length,
    diversityGapRouteCount: legal.filter((route) => routeGapCodes(route).includes(DIVERSITY_GAP)).length,
    repairQueueCountBySource: countBy(inventory.repairQueue.map((route) => route.sourceId)),
    repairQueueCountByGapCode: countBy(inventory.repairQueue.flatMap((route) => routeGapCodes(route))),
  };
  inventory.lastR06A04Reconciliation = {
    taskId: TASK_ID,
    sourceId: SOURCE_ID,
    repairQueueBefore: before,
    removedFromRepairQueueCount: ROUTE_COUNT,
    repairQueueAfter: inventory.repairQueue.length,
    status: "PASS_R06_A04_G5A_U02_PBL_DIVERSITY_RECONCILED",
  };
  inventory.reconciliation = {
    ...(inventory.reconciliation ?? {}),
    taskId: TASK_ID,
    capacityContract: paths.capacity,
    publicBindingContract: paths.uiBinding,
    runtimeRegistry: paths.registry,
    diagnostics: paths.diagnostics,
  };
  return inventory;
}

const capacity = readJson(paths.capacity);
const targetRoutes = capacity.routes.filter((route) => route.sourceId === SOURCE_ID
  && route.questionType === "pbl"
  && route.legalRoute === true
  && routeGapCodes(route).includes(DIVERSITY_GAP));
if (targetRoutes.length !== ROUTE_COUNT) throw new Error(`PGC_R06_A04_TARGET_ROUTE_COUNT_MISMATCH:${targetRoutes.length}`);

const diagnostics = {
  schemaName: "PGCR06A04G5AU02PblCrossSeedDiagnosticsV1",
  schemaVersion: 1,
  programId: capacity.programId,
  taskId: TASK_ID,
  sourceId: SOURCE_ID,
  seeds: [...SEEDS],
  routes: targetRoutes.map(diagnoseRoute),
};
diagnostics.summary = {
  targetRouteCount: diagnostics.routes.length,
  acceptedRouteCount: diagnostics.routes.filter((route) => route.accepted).length,
  failedRouteCount: diagnostics.routes.filter((route) => !route.accepted).length,
};
if (diagnostics.summary.acceptedRouteCount !== ROUTE_COUNT || diagnostics.summary.failedRouteCount !== 0) {
  throw new Error(`PGC_R06_A04_LIVE_GATE_FAILED:${JSON.stringify(diagnostics.summary)}`);
}
writeJson(paths.diagnostics, diagnostics);

const diagnosticsByRoute = new Map(diagnostics.routes.map((route) => [route.routeId, route]));
const routeIds = new Set(diagnosticsByRoute.keys());
const reconciledCapacity = reconcileCapacity(capacity, diagnosticsByRoute);
const { uiBinding, matchedBindingCount } = reconcileUiBinding(readJson(paths.uiBinding), reconciledCapacity, routeIds);
const registryRowCount = materializeRegistry(reconciledCapacity);
const inventory = reconcileInventory(readJson(paths.repairInventory), diagnosticsByRoute);

writeJson(paths.capacity, reconciledCapacity);
writeJson(paths.uiBinding, uiBinding);
writeJson(paths.repairInventory, inventory);

const readback = [
  "# PGC-R06 A04 G5A-U02 PBL Cross-Seed Diversity FullFix",
  "",
  "```text",
  `TASK_ID = ${TASK_ID}`,
  `SOURCE_ID = ${SOURCE_ID}`,
  `LIVE_GATE = ${diagnostics.summary.acceptedRouteCount}/${diagnostics.summary.targetRouteCount}`,
  `QUESTION_COUNT_PER_ROUTE = ${QUESTION_COUNT}`,
  `PUBLIC_BINDING_COUNT = ${matchedBindingCount}`,
  `RUNTIME_REGISTRY_ROW_COUNT = ${registryRowCount}`,
  "REPAIR_QUEUE_BEFORE = 47",
  `REPAIR_QUEUE_AFTER = ${inventory.repairQueue.length}`,
  `REMOVED_FROM_QUEUE = ${ROUTE_COUNT}`,
  "STATUS = PASS_R06_A04_G5A_U02_PBL_CROSS_SEED_DIVERSITY_RECONCILED",
  "```",
  "",
  "No new KnowledgePoint, PatternGroup, PatternSpec, context family, generator, or validator was added.",
];
fs.writeFileSync(absolute(paths.readback), `${readback.join("\n")}\n`);

console.log(`PGC_R06_A04_RECONCILIATION=${JSON.stringify({
  status: "PASS_R06_A04_G5A_U02_PBL_CROSS_SEED_DIVERSITY_RECONCILED",
  routeCount: ROUTE_COUNT,
  matchedBindingCount,
  registryRowCount,
  repairQueueBefore: 47,
  repairQueueAfter: inventory.repairQueue.length,
  secondGeneratorAdded: false,
  secondValidatorAdded: false,
})}`);
