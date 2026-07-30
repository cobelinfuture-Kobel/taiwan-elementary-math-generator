import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const TASK_ID = "PGC-R06-A03_CapacityPublicBindingRuntimeConsumerAndRepairQueueReconciliation";
const SOURCE_ID = "g5a_u02_5a02";
const LIVE_ROUTE_COUNT = 98;
const PUBLIC_INPUT_MAX = 240;
const VERIFIED_ROUTE_MAX = 20;
const CAPACITY_GAP = "CAPACITY_BELOW_20";
const DIVERSITY_GAP = "CROSS_SEED_ITEM_DIVERSITY_DEFICIENT";

const paths = Object.freeze({
  diagnostics: "data/curriculum/public-generation/PGC-R06-A02.g5a-u02-live-diagnostics.json",
  capacity: "data/curriculum/public-generation/generator_capacity_contract.json",
  uiBinding: "data/curriculum/public-generation/ui_capability_binding_contract.json",
  registry: "site/modules/curriculum/public/public-generator-capacity-registry.js",
  runtimeConsumer: "site/modules/curriculum/public/public-ui-capability-binding.js",
  repairInventory: "data/curriculum/public-generation/PGC-R06.reasoning-mixed-pbl-inventory.json",
  readback: "docs/curriculum/output/PGC-R06-A03_CapacityPublicRuntimeRepairReconciliation.md",
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
  return Object.fromEntries([...values.reduce((map, value) => map.set(value, (map.get(value) ?? 0) + 1), new Map())].sort(([a], [b]) => String(a).localeCompare(String(b))));
}

function routeGapCodes(route = {}) {
  return Array.isArray(route.gapCodes) ? [...route.gapCodes] : [];
}

function diagnosticDiversity(route) {
  const runs = Array.isArray(route.diagnosticRuns) ? route.diagnosticRuns : [];
  return {
    itemSetCount: new Set(runs.map((run) => run.itemSetSignature).filter(Boolean)).size,
    worksheetCount: new Set(runs.map((run) => run.worksheetSignature).filter(Boolean)).size,
  };
}

function assertLiveGate(diagnostics) {
  const summary = diagnostics?.summary ?? {};
  if (summary.targetRouteCount !== LIVE_ROUTE_COUNT
    || summary.live20PassRouteCount !== LIVE_ROUTE_COUNT
    || summary.live20FailRouteCount !== 0
    || diagnostics.routes?.length !== LIVE_ROUTE_COUNT
    || diagnostics.routes.some((route) => route.sourceId !== SOURCE_ID)
    || diagnostics.routes.some((route) => route.diagnosticRuns?.some((run) => run.uniquePromptCount !== VERIFIED_ROUTE_MAX || run.answerKeyItemCount !== VERIFIED_ROUTE_MAX))) {
    throw new Error(`PGC_R06_A03_LIVE_GATE_NOT_ADMISSIBLE:${JSON.stringify(summary)}`);
  }
}

function reconciledGapCodes(existing, crossSeedDistinct) {
  return unique(existing.filter((code) => code !== CAPACITY_GAP && (code !== DIVERSITY_GAP || !crossSeedDistinct)));
}

function capacityEvidence(diagnosticRoute) {
  return {
    authority: paths.diagnostics,
    taskId: TASK_ID,
    questionCount: VERIFIED_ROUTE_MAX,
    seedCount: diagnosticRoute.diagnosticRuns.length,
    runs: diagnosticRoute.diagnosticRuns.map((run) => ({
      seed: run.seed,
      ok: run.ok,
      thrownError: run.thrownError,
      errorCodes: run.errorCodes,
      questionCount: run.questionCount,
      answerKeyItemCount: run.answerKeyItemCount,
      emptyPromptCount: run.emptyPromptCount,
      duplicatePromptCount: run.duplicatePromptCount,
      uniquePromptCount: run.uniquePromptCount,
      worksheetSignature: run.worksheetSignature,
      itemSetSignature: run.itemSetSignature,
      patternSpecIdsObserved: run.patternSpecIdsObserved,
      knowledgePointIdsObserved: run.knowledgePointIdsObserved,
    })),
  };
}

function reconcileCapacityContract(capacity, diagnosticsByRoute) {
  let matched = 0;
  for (const route of capacity.routes) {
    const diagnostic = diagnosticsByRoute.get(route.routeId);
    if (!diagnostic) continue;
    matched += 1;
    const diversity = diagnosticDiversity(diagnostic);
    const crossSeedDistinct = diversity.itemSetCount >= 2;
    route.priorFailureCodes = unique([...(route.priorFailureCodes ?? []), ...routeGapCodes(route)]);
    route.verifiedMaxQuestionCount = VERIFIED_ROUTE_MAX;
    route.capacityStatus = "VERIFIED_20";
    route.uniqueItemSetCount = diversity.itemSetCount;
    route.uniqueOrderedWorksheetCount = diversity.worksheetCount;
    route.gapCodes = reconciledGapCodes(routeGapCodes(route), crossSeedDistinct);
    route.qualityStatus = crossSeedDistinct ? "DIVERSE_PARAMETER_GENERATOR" : (route.qualityStatus ?? "FIXTURE_SELECTOR");
    route.selectedCapacityEvidence = capacityEvidence(diagnostic);
    route.reconciliationCodes = unique([...(route.reconciliationCodes ?? []), "PGC_R06_A03_LIVE_20_RECONCILED"]);
    route.lastReconciliation = {
      taskId: TASK_ID,
      live20Pass: true,
      crossSeedDistinct,
      evidenceAuthority: paths.diagnostics,
    };
  }
  if (matched !== LIVE_ROUTE_COUNT) throw new Error(`PGC_R06_A03_CAPACITY_ROUTE_MATCH_MISMATCH:${matched}`);

  const legal = capacity.routes.filter((route) => route.legalRoute === true);
  const capacityGaps = legal.filter((route) => routeGapCodes(route).includes(CAPACITY_GAP)).length;
  const diversityGaps = legal.filter((route) => routeGapCodes(route).includes(DIVERSITY_GAP)).length;
  capacity.summary = {
    ...capacity.summary,
    routeCount: capacity.routes.length,
    legalRouteCount: legal.length,
    illegalRouteCount: capacity.routes.length - legal.length,
    verified20RouteCount: legal.filter((route) => route.verifiedMaxQuestionCount >= VERIFIED_ROUTE_MAX).length,
    verifiedLimitedRouteCount: legal.filter((route) => route.verifiedMaxQuestionCount > 0 && route.verifiedMaxQuestionCount < VERIFIED_ROUTE_MAX).length,
    zeroCapacityRouteCount: legal.filter((route) => !Number.isFinite(route.verifiedMaxQuestionCount) || route.verifiedMaxQuestionCount <= 0).length,
    diversityGapRouteCount: diversityGaps,
    hardBlockerCount: Array.isArray(capacity.hardBlockers) ? capacity.hardBlockers.length : 0,
  };
  capacity.downstreamGaps = [
    { code: CAPACITY_GAP, count: capacityGaps },
    { code: DIVERSITY_GAP, count: diversityGaps },
  ].filter((entry) => entry.count > 0);
  capacity.status = capacity.downstreamGaps.length > 0 ? "PASS_WITH_DOWNSTREAM_GAPS" : "PASS";
  capacity.lastReconciliation = {
    programId: capacity.programId,
    taskId: TASK_ID,
    sourceId: SOURCE_ID,
    evidenceAuthority: paths.diagnostics,
    live20RouteCount: LIVE_ROUTE_COUNT,
    crossSeedDiverseRouteCount: [...diagnosticsByRoute.values()].filter((route) => diagnosticDiversity(route).itemSetCount >= 2).length,
    remainingCrossSeedFixtureRouteCount: [...diagnosticsByRoute.values()].filter((route) => diagnosticDiversity(route).itemSetCount < 2).length,
    status: "PASS_R06_A03_CAPACITY_RECONCILED",
  };
  return capacity;
}

function reconcileUiBinding(uiBinding, capacity, targetRouteIds) {
  const targetRoutes = capacity.routes.filter((route) => targetRouteIds.has(route.routeId));
  const routesByBinding = new Map();
  for (const route of targetRoutes) {
    for (const bindingId of route.bindingIds ?? []) {
      if (!routesByBinding.has(bindingId)) routesByBinding.set(bindingId, []);
      routesByBinding.get(bindingId).push(route);
    }
  }

  let matchedBindingCount = 0;
  for (const binding of uiBinding.bindings) {
    const routes = routesByBinding.get(binding.bindingId);
    if (!routes) continue;
    matchedBindingCount += 1;
    binding.questionCountMin = 1;
    binding.questionCountDefault = 20;
    binding.questionCountMax = PUBLIC_INPUT_MAX;
    binding.verifiedCapacityQuestionCountMax = Math.min(...routes.map((route) => route.verifiedMaxQuestionCount));
    binding.capacityStatus = "VERIFIED_20";
    binding.blocked = false;
    binding.blockedReasons = (binding.blockedReasons ?? []).filter((reason) => reason !== "PUBLIC_CAPACITY_ROUTE_UNAVAILABLE");
    binding.capacityRouteIds = unique([...(binding.capacityRouteIds ?? []), ...routes.map((route) => route.routeId)]);
    binding.capacityQualityStatuses = unique(routes.map((route) => route.qualityStatus));
    binding.lastCapacityReconciliation = {
      taskId: TASK_ID,
      sourceId: SOURCE_ID,
      publicInputMax: PUBLIC_INPUT_MAX,
      verifiedRouteMax: VERIFIED_ROUTE_MAX,
    };
  }
  if (matchedBindingCount === 0) throw new Error("PGC_R06_A03_UI_BINDING_MATCH_MISSING");

  uiBinding.safeQuestionCount = {
    min: 1,
    default: 20,
    max: PUBLIC_INPUT_MAX,
    evidence: "PUBLIC_GLOBAL_QUESTION_COUNT_MAX_240",
  };
  const verifiedValues = uiBinding.bindings.map((binding) => Number(binding.verifiedCapacityQuestionCountMax ?? Math.min(binding.questionCountMax ?? 0, VERIFIED_ROUTE_MAX))).filter((value) => value > 0);
  uiBinding.summary = {
    ...uiBinding.summary,
    verified20BindingCount: verifiedValues.filter((value) => value >= VERIFIED_ROUTE_MAX).length,
    limitedCapacityBindingCount: verifiedValues.filter((value) => value < VERIFIED_ROUTE_MAX).length,
    minimumVerifiedQuestionCount: Math.min(...verifiedValues),
    maximumVerifiedQuestionCount: Math.max(...verifiedValues),
    maximumPublicInputQuestionCount: PUBLIC_INPUT_MAX,
    reconciledG5AU02BindingCount: matchedBindingCount,
  };
  uiBinding.lastReconciliation = {
    taskId: TASK_ID,
    sourceId: SOURCE_ID,
    liveRouteCount: LIVE_ROUTE_COUNT,
    matchedBindingCount,
    capacityAuthority: paths.capacity,
    status: "PASS_R06_A03_PUBLIC_BINDING_RECONCILED",
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
    liveRouteCount: LIVE_ROUTE_COUNT,
    verifiedRouteMax: VERIFIED_ROUTE_MAX,
    evidenceAuthority: paths.diagnostics,
    status: "PASS_R06_A03_RUNTIME_REGISTRY_RECONCILED",
  };
  fs.writeFileSync(absolute(paths.registry), `export const PUBLIC_GENERATOR_CAPACITY_REGISTRY_STATUS = "MATERIALIZED_PGC_R06_A03";\nexport const PUBLIC_GENERATOR_CAPACITY_RECONCILIATION = Object.freeze(${JSON.stringify(metadata)});\nexport const PUBLIC_GENERATOR_CAPACITY_ROWS = Object.freeze(${JSON.stringify(rows)});\n`);
  return rows;
}

function reconcileRuntimeConsumer() {
  const filePath = absolute(paths.runtimeConsumer);
  let source = fs.readFileSync(filePath, "utf8");
  const marker = "PGC-R06 A03 runtime capacity consumer reconciliation";
  if (source.includes(marker)) return;
  const importAnchor = `} from "./public-ui-capability-binding-base.js";`;
  const importReplacement = `${importAnchor}\nimport {\n  PUBLIC_GENERATOR_CAPACITY_RECONCILIATION,\n  PUBLIC_GENERATOR_CAPACITY_REGISTRY_STATUS,\n} from "./public-generator-capacity-registry.js";`;
  if (!source.includes(importAnchor)) throw new Error("PGC_R06_A03_RUNTIME_IMPORT_ANCHOR_MISSING");
  source = source.replace(importAnchor, importReplacement);
  const exportAnchor = `export { PUBLIC_UI_SAFE_QUESTION_COUNT, PUBLIC_UI_SURFACES };`;
  const exportReplacement = `${exportAnchor}\n\nexport const PUBLIC_UI_RUNTIME_CAPACITY_RECONCILIATION = Object.freeze({\n  ...PUBLIC_GENERATOR_CAPACITY_RECONCILIATION,\n  registryStatus: PUBLIC_GENERATOR_CAPACITY_REGISTRY_STATUS,\n});`;
  if (!source.includes(exportAnchor)) throw new Error("PGC_R06_A03_RUNTIME_EXPORT_ANCHOR_MISSING");
  source = source.replace(exportAnchor, exportReplacement);
  source = source.replaceAll(
    `questionCount: PUBLIC_UI_SAFE_QUESTION_COUNT,`,
    `questionCount: PUBLIC_UI_SAFE_QUESTION_COUNT,\n    capacityReconciliation: PUBLIC_UI_RUNTIME_CAPACITY_RECONCILIATION,`,
  );
  fs.writeFileSync(filePath, `${source.trimEnd()}\n\n// ${marker}\n`);
}

function reconcileRepairInventory(inventory, diagnosticsByRoute) {
  let matched = 0;
  for (const route of inventory.routes) {
    const diagnostic = diagnosticsByRoute.get(route.routeId);
    if (!diagnostic) continue;
    matched += 1;
    const diversity = diagnosticDiversity(diagnostic);
    const crossSeedDistinct = diversity.itemSetCount >= 2;
    route.verifiedMaxQuestionCount = VERIFIED_ROUTE_MAX;
    route.capacityStatus = "VERIFIED_20";
    route.uniqueItemSetCount = diversity.itemSetCount;
    route.uniqueOrderedWorksheetCount = diversity.worksheetCount;
    route.qualityStatus = crossSeedDistinct ? "DIVERSE_PARAMETER_GENERATOR" : (route.qualityStatus ?? "FIXTURE_SELECTOR");
    route.gapCodes = reconciledGapCodes(routeGapCodes(route), crossSeedDistinct);
    route.reconciliationStatus = crossSeedDistinct ? "RECONCILED_AND_REMOVED_FROM_QUEUE" : "CAPACITY_RECONCILED_DIVERSITY_REMAINS";
  }
  if (matched !== LIVE_ROUTE_COUNT) throw new Error(`PGC_R06_A03_REPAIR_ROUTE_MATCH_MISMATCH:${matched}`);

  inventory.repairQueue = inventory.routes.filter((route) => route.legalRoute === true && route.publiclyExposed === true && routeGapCodes(route).length > 0);
  const legal = inventory.routes.filter((route) => route.legalRoute === true);
  inventory.summary = {
    ...inventory.summary,
    conformantRouteCount: legal.filter((route) => routeGapCodes(route).length === 0).length,
    repairQueueCount: inventory.repairQueue.length,
    zeroCapacityRouteCount: legal.filter((route) => !Number.isFinite(route.verifiedMaxQuestionCount) || route.verifiedMaxQuestionCount <= 0).length,
    limitedCapacityRouteCount: legal.filter((route) => route.verifiedMaxQuestionCount > 0 && route.verifiedMaxQuestionCount < VERIFIED_ROUTE_MAX).length,
    diversityGapRouteCount: legal.filter((route) => routeGapCodes(route).includes(DIVERSITY_GAP)).length,
    repairQueueCountBySource: countBy(inventory.repairQueue.map((route) => route.sourceId)),
    repairQueueCountByGapCode: countBy(inventory.repairQueue.flatMap((route) => routeGapCodes(route))),
  };
  const remainingG5A = inventory.repairQueue.filter((route) => route.sourceId === SOURCE_ID);
  if (remainingG5A.length !== 12 || remainingG5A.some((route) => route.questionType !== "pbl" || !routeGapCodes(route).includes(DIVERSITY_GAP))) {
    throw new Error(`PGC_R06_A03_REMAINING_G5A_QUEUE_MISMATCH:${remainingG5A.length}`);
  }
  inventory.taskId = TASK_ID;
  inventory.status = "PASS_R06_A03_G5A_U02_RECONCILED";
  inventory.sourceAuthority = {
    ...inventory.sourceAuthority,
    capacityLastReconciliation: {
      programId: inventory.programId,
      taskId: TASK_ID,
      evidenceAuthority: paths.diagnostics,
      sourceId: SOURCE_ID,
      live20RouteCount: LIVE_ROUTE_COUNT,
      removedFromRepairQueueCount: 86,
      remainingPblDiversityRouteCount: 12,
      status: "PASS_R06_A03_REPAIR_QUEUE_RECONCILED",
    },
  };
  inventory.reconciliation = {
    taskId: TASK_ID,
    capacityContract: paths.capacity,
    publicBindingContract: paths.uiBinding,
    runtimeRegistry: paths.registry,
    runtimeConsumer: paths.runtimeConsumer,
    diagnostics: paths.diagnostics,
  };
  return inventory;
}

function writeReadback({ capacity, uiBinding, inventory, registryRows, matchedBindingCount, diagnostics }) {
  const g5aQueue = inventory.repairQueue.filter((route) => route.sourceId === SOURCE_ID);
  const lines = [
    "# PGC-R06 A03 Capacity / Public Binding / Runtime / Repair Queue Reconciliation",
    "",
    "```text",
    `TASK_ID = ${TASK_ID}`,
    `SOURCE_ID = ${SOURCE_ID}`,
    `LIVE_GATE = ${diagnostics.summary.live20PassRouteCount}/${diagnostics.summary.targetRouteCount}`,
    `CAPACITY_ROUTE_COUNT = ${LIVE_ROUTE_COUNT}`,
    `PUBLIC_BINDING_COUNT = ${matchedBindingCount}`,
    `RUNTIME_REGISTRY_ROW_COUNT = ${registryRows.length}`,
    `G5A_U02_REPAIR_QUEUE_BEFORE = 98`,
    `G5A_U02_REPAIR_QUEUE_AFTER = ${g5aQueue.length}`,
    `G5A_U02_REMOVED_FROM_QUEUE = ${LIVE_ROUTE_COUNT - g5aQueue.length}`,
    `G5A_U02_REMAINING_PBL_DIVERSITY = ${g5aQueue.length}`,
    `PUBLIC_INPUT_MAX = ${PUBLIC_INPUT_MAX}`,
    `VERIFIED_ROUTE_MAX = ${VERIFIED_ROUTE_MAX}`,
    "STATUS = PASS_R06_A03_RECONCILED",
    "```",
    "",
    `Capacity status: ${capacity.status}`,
    `Public binding status: ${uiBinding.status}`,
    `Repair queue total: ${inventory.summary.repairQueueCount}`,
  ];
  fs.writeFileSync(absolute(paths.readback), `${lines.join("\n")}\n`);
}

const diagnostics = readJson(paths.diagnostics);
assertLiveGate(diagnostics);
const diagnosticsByRoute = new Map(diagnostics.routes.map((route) => [route.routeId, route]));
const targetRouteIds = new Set(diagnosticsByRoute.keys());

const capacity = reconcileCapacityContract(readJson(paths.capacity), diagnosticsByRoute);
const { uiBinding, matchedBindingCount } = reconcileUiBinding(readJson(paths.uiBinding), capacity, targetRouteIds);
capacity.summary.currentVerified20BindingCount = uiBinding.summary.verified20BindingCount;
capacity.summary.currentLimitedBindingCount = uiBinding.summary.limitedCapacityBindingCount;
capacity.summary.currentUnverifiedCapacityExposureCount = 0;
const registryRows = materializeRegistry(capacity);
reconcileRuntimeConsumer();
const inventory = reconcileRepairInventory(readJson(paths.repairInventory), diagnosticsByRoute);

writeJson(paths.capacity, capacity);
writeJson(paths.uiBinding, uiBinding);
writeJson(paths.repairInventory, inventory);
writeReadback({ capacity, uiBinding, inventory, registryRows, matchedBindingCount, diagnostics });

console.log(`PGC_R06_A03_RECONCILIATION=${JSON.stringify({
  status: "PASS_R06_A03_RECONCILED",
  liveRouteCount: LIVE_ROUTE_COUNT,
  matchedBindingCount,
  registryRowCount: registryRows.length,
  removedFromG5ARepairQueue: 86,
  remainingG5APblDiversityRoutes: 12,
  secondGeneratorAdded: false,
  secondValidatorAdded: false,
})}`);
