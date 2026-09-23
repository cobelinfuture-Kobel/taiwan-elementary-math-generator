import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { buildWorksheetDocumentFromPlan } from "../../site/assets/browser/pipeline/build-worksheet-document.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const TASK_ID = "PGC-R06-A05_G5A-U08_30ResidualDualAxisFullFix";
const SOURCE_ID = "g5a_u08_5a08";
const ROUTE_COUNT = 30;
const PBL_ROUTE_COUNT = 9;
const MIXED_ROUTE_COUNT = 21;
const QUESTION_COUNT = 20;
const CAPACITY_GAP = "CAPACITY_BELOW_20";
const DIVERSITY_GAP = "CROSS_SEED_ITEM_DIVERSITY_DEFICIENT";

const paths = Object.freeze({
  capacity: "data/curriculum/public-generation/generator_capacity_contract.json",
  uiBinding: "data/curriculum/public-generation/ui_capability_binding_contract.json",
  registry: "site/modules/curriculum/public/public-generator-capacity-registry.js",
  repairInventory: "data/curriculum/public-generation/PGC-R06.reasoning-mixed-pbl-inventory.json",
  diagnostics: "data/curriculum/public-generation/PGC-R06-A05.g5a-u08-dual-axis-diagnostics.json",
  readback: "docs/curriculum/output/PGC-R06-A05_G5A_U08_30ResidualDualAxisFullFix.md",
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

function isTargetRoute(route) {
  const gaps = routeGapCodes(route);
  return route.sourceId === SOURCE_ID
    && route.legalRoute === true
    && (gaps.includes(CAPACITY_GAP) || gaps.includes(DIVERSITY_GAP));
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
    questionMode: route.questionType,
    depthMode: route.depthMode ?? "mixed",
    contextMode: route.contextMode ?? "mixed",
    printLayout: {
      paperSize: "A4",
      columns: route.questionType === "pbl" ? 1 : 2,
      rowsPerPage: route.questionType === "pbl" ? 1 : 10,
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
    errorCodes: unique((result?.errors ?? []).map((error) => error?.code ?? String(error))),
    questionCount: document?.questionCount ?? questions.length,
    answerKeyItemCount: document?.answerKeyItems?.length ?? 0,
    uniquePromptCount: new Set(prompts).size,
    duplicatePromptCount: prompts.length - new Set(prompts).size,
    itemSetSignature: hash([...prompts].sort()),
    orderedWorksheetSignature: hash(prompts),
    patternSpecIdsObserved: unique(questions.map((row) => row.patternSpecId)),
    knowledgePointIdsObserved: unique(questions.map((row) => row.knowledgePointId)),
  };
}

function diagnoseRoute(route) {
  const seeds = [`pgc-r06-a05:${route.routeId}:A`, `pgc-r06-a05:${route.routeId}:B`];
  const runs = seeds.map((seed) => runRoute(route, seed));
  const replay = runRoute(route, seeds[0]);
  const accepted = runs.every((run) => run.ok
      && run.questionCount === QUESTION_COUNT
      && run.answerKeyItemCount === QUESTION_COUNT
      && run.uniquePromptCount === QUESTION_COUNT
      && run.duplicatePromptCount === 0)
    && replay.orderedWorksheetSignature === runs[0].orderedWorksheetSignature
    && new Set(runs.map((run) => run.itemSetSignature)).size === seeds.length;
  return {
    routeId: route.routeId,
    caseId: route.caseId,
    sourceId: route.sourceId,
    selectionMode: route.selectionMode,
    questionType: route.questionType,
    depthMode: route.depthMode ?? null,
    contextMode: route.contextMode ?? null,
    originalGapCodes: routeGapCodes(route),
    accepted,
    route: structuredClone(route),
    diagnosticRuns: runs,
    replay,
  };
}

function selectedEvidence(diagnostic) {
  return {
    passed: true,
    questionCount: QUESTION_COUNT,
    evidenceAuthority: "PGC-R06-A05_G5A-U08_TWO_SEED_LIVE_RUNTIME",
    evidenceSource: paths.diagnostics,
    taskId: TASK_ID,
    seedCount: diagnostic.diagnosticRuns.length,
    runs: diagnostic.diagnosticRuns.map((run) => ({
      ...run,
      thrownError: null,
      evidenceProjection: "worksheetDocument.questions",
      missingPromptCount: 0,
      duplicateItemCount: 0,
      requestedRouteId: diagnostic.routeId,
    })),
    replay: { ...diagnostic.replay, requestedRouteId: diagnostic.routeId },
  };
}

function recalculateCapacitySummary(capacity) {
  const legal = capacity.routes.filter((route) => route.legalRoute === true);
  const capacityGapCount = legal.filter((route) => routeGapCodes(route).includes(CAPACITY_GAP)).length;
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
    { code: CAPACITY_GAP, count: capacityGapCount },
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
    route.gapCodes = routeGapCodes(route).filter((code) => ![CAPACITY_GAP, DIVERSITY_GAP].includes(code));
    route.selectedCapacityEvidence = selectedEvidence(diagnostic);
    route.reconciliationCodes = unique([
      ...(route.reconciliationCodes ?? []),
      diagnostic.questionType === "pbl"
        ? "PGC_R06_A05_PBL_CROSS_SEED_DIVERSITY_RECONCILED"
        : "PGC_R06_A05_MIXED_UNIQUE_20_CAPACITY_RECONCILED",
    ]);
    route.lastReconciliation = {
      taskId: TASK_ID,
      live20Pass: true,
      crossSeedDistinct: true,
      evidenceAuthority: paths.diagnostics,
    };
  }
  if (matched !== ROUTE_COUNT) throw new Error(`PGC_R06_A05_CAPACITY_ROUTE_MATCH_MISMATCH:${matched}`);
  recalculateCapacitySummary(capacity);
  capacity.lastR06A05Reconciliation = {
    programId: capacity.programId,
    taskId: TASK_ID,
    sourceId: SOURCE_ID,
    routeCount: ROUTE_COUNT,
    pblDiversityRouteCount: PBL_ROUTE_COUNT,
    mixedCapacityRouteCount: MIXED_ROUTE_COUNT,
    status: "PASS_R06_A05_CAPACITY_RECONCILED",
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
    binding.verifiedCapacityQuestionCountMax = QUESTION_COUNT;
    binding.capacityQualityStatuses = ["DIVERSE_PARAMETER_GENERATOR"];
    binding.capacityRouteIds = unique([...(binding.capacityRouteIds ?? []), ...routes.map((route) => route.routeId)]);
    binding.lastCapacityReconciliation = {
      taskId: TASK_ID,
      sourceId: SOURCE_ID,
      verifiedRouteMax: QUESTION_COUNT,
      crossSeedDiverse: true,
    };
  }
  if (matchedBindingCount === 0) throw new Error("PGC_R06_A05_UI_BINDING_MATCH_MISSING");
  uiBinding.lastR06A05Reconciliation = {
    taskId: TASK_ID,
    sourceId: SOURCE_ID,
    routeCount: ROUTE_COUNT,
    matchedBindingCount,
    status: "PASS_R06_A05_PUBLIC_BINDING_RECONCILED",
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
    status: "PASS_R06_A05_RUNTIME_REGISTRY_RECONCILED",
  };
  fs.writeFileSync(absolute(paths.registry), `export const PUBLIC_GENERATOR_CAPACITY_REGISTRY_STATUS = "MATERIALIZED_PGC_R03_V3";\nexport const PUBLIC_GENERATOR_CAPACITY_RECONCILIATION = Object.freeze(${JSON.stringify(metadata)});\nexport const PUBLIC_GENERATOR_CAPACITY_ROWS = Object.freeze(${JSON.stringify(rows)});\n`);
  return rows.length;
}

function reconcileInventory(inventory, diagnosticsByRoute) {
  const before = inventory.repairQueue?.length ?? 0;
  if (before !== 35) throw new Error(`PGC_R06_A05_REPAIR_QUEUE_BASELINE_MISMATCH:${before}`);
  let matched = 0;
  for (const route of inventory.routes) {
    if (!diagnosticsByRoute.has(route.routeId)) continue;
    matched += 1;
    route.verifiedMaxQuestionCount = QUESTION_COUNT;
    route.capacityStatus = "VERIFIED_20";
    route.qualityStatus = "DIVERSE_PARAMETER_GENERATOR";
    route.uniqueItemSetCount = 2;
    route.uniqueOrderedWorksheetCount = 2;
    route.gapCodes = routeGapCodes(route).filter((code) => ![CAPACITY_GAP, DIVERSITY_GAP].includes(code));
    route.reconciliationStatus = "RECONCILED_AND_REMOVED_FROM_QUEUE";
  }
  if (matched !== ROUTE_COUNT) throw new Error(`PGC_R06_A05_INVENTORY_ROUTE_MATCH_MISMATCH:${matched}`);
  inventory.repairQueue = inventory.routes.filter((route) => route.legalRoute === true
    && route.publiclyExposed === true
    && routeGapCodes(route).length > 0);
  if (inventory.repairQueue.length !== 5) throw new Error(`PGC_R06_A05_REPAIR_QUEUE_AFTER_MISMATCH:${inventory.repairQueue.length}`);
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
  inventory.lastR06A05Reconciliation = {
    taskId: TASK_ID,
    sourceId: SOURCE_ID,
    repairQueueBefore: before,
    removedFromRepairQueueCount: ROUTE_COUNT,
    repairQueueAfter: inventory.repairQueue.length,
    pblDiversityRouteCount: PBL_ROUTE_COUNT,
    mixedCapacityRouteCount: MIXED_ROUTE_COUNT,
    status: "PASS_R06_A05_G5A_U08_DUAL_AXIS_RECONCILED",
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
const targetRoutes = capacity.routes.filter(isTargetRoute);
if (targetRoutes.length !== ROUTE_COUNT) throw new Error(`PGC_R06_A05_TARGET_ROUTE_COUNT_MISMATCH:${targetRoutes.length}`);
if (targetRoutes.filter((route) => route.questionType === "pbl").length !== PBL_ROUTE_COUNT) throw new Error("PGC_R06_A05_PBL_ROUTE_COUNT_MISMATCH");
if (targetRoutes.filter((route) => route.questionType === "mixed").length !== MIXED_ROUTE_COUNT) throw new Error("PGC_R06_A05_MIXED_ROUTE_COUNT_MISMATCH");

const diagnostics = {
  schemaName: "PGCR06A05G5AU08DualAxisDiagnosticsV1",
  schemaVersion: 1,
  programId: capacity.programId,
  taskId: TASK_ID,
  sourceId: SOURCE_ID,
  routes: targetRoutes.map(diagnoseRoute),
};
diagnostics.summary = {
  targetRouteCount: diagnostics.routes.length,
  pblRouteCount: diagnostics.routes.filter((route) => route.questionType === "pbl").length,
  mixedRouteCount: diagnostics.routes.filter((route) => route.questionType === "mixed").length,
  acceptedRouteCount: diagnostics.routes.filter((route) => route.accepted).length,
  failedRouteCount: diagnostics.routes.filter((route) => !route.accepted).length,
};
if (diagnostics.summary.acceptedRouteCount !== ROUTE_COUNT || diagnostics.summary.failedRouteCount !== 0) {
  throw new Error(`PGC_R06_A05_LIVE_GATE_FAILED:${JSON.stringify(diagnostics.summary)}`);
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
  "# PGC-R06 A05 G5A-U08 30-Route Dual-Axis FullFix",
  "",
  "```text",
  `TASK_ID = ${TASK_ID}`,
  `SOURCE_ID = ${SOURCE_ID}`,
  `LIVE_GATE = ${diagnostics.summary.acceptedRouteCount}/${diagnostics.summary.targetRouteCount}`,
  `PBL_DIVERSITY_ROUTES = ${diagnostics.summary.pblRouteCount}`,
  `MIXED_CAPACITY_ROUTES = ${diagnostics.summary.mixedRouteCount}`,
  `QUESTION_COUNT_PER_ROUTE = ${QUESTION_COUNT}`,
  `PUBLIC_BINDING_COUNT = ${matchedBindingCount}`,
  `RUNTIME_REGISTRY_ROW_COUNT = ${registryRowCount}`,
  "REPAIR_QUEUE_BEFORE = 35",
  `REPAIR_QUEUE_AFTER = ${inventory.repairQueue.length}`,
  `REMOVED_FROM_QUEUE = ${ROUTE_COUNT}`,
  "STATUS = PASS_R06_A05_G5A_U08_30_RESIDUAL_DUAL_AXIS_RECONCILED",
  "```",
  "",
  "No new KnowledgePoint, PatternGroup, PatternSpec, context family, generator, validator, renderer, or UI control was added.",
];
fs.writeFileSync(absolute(paths.readback), `${readback.join("\n")}\n`);

console.log(`PGC_R06_A05_RECONCILIATION=${JSON.stringify({
  status: "PASS_R06_A05_G5A_U08_30_RESIDUAL_DUAL_AXIS_RECONCILED",
  routeCount: ROUTE_COUNT,
  pblRouteCount: PBL_ROUTE_COUNT,
  mixedRouteCount: MIXED_ROUTE_COUNT,
  matchedBindingCount,
  registryRowCount,
  repairQueueBefore: 35,
  repairQueueAfter: inventory.repairQueue.length,
  secondGeneratorAdded: false,
  secondValidatorAdded: false,
})}`);
