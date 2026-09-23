import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  resolvePublicUiCapabilityBinding,
} from "../../site/modules/curriculum/public/public-ui-capability-binding.js";
import {
  listVisibleBatchAKnowledgePoints,
} from "../../site/modules/curriculum/registry/batch-a-selector-p03f13-extension.js";
import {
  CURRENT_FULL_PRODUCT_PUBLIC_SOURCE_UNITS,
} from "../../site/modules/curriculum/batch-a/source-units.js";
import {
  buildPgcR02UiCapabilityBindingContract,
} from "./materialize-pgc-r02-ui-capability-binding.mjs";

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

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const unique = (values) => [...new Set((values ?? []).filter(Boolean))];
const safeArray = (value) => Array.isArray(value) ? value : [];
const stableHash = (value, length = 16) => crypto.createHash("sha256").update(String(value)).digest("hex").slice(0, length);
const csvEscape = (value) => {
  const text = value == null ? "" : Array.isArray(value) ? value.join("|") : typeof value === "object" ? JSON.stringify(value) : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};

function kpsBySource() {
  const grouped = new Map();
  for (const kp of listVisibleBatchAKnowledgePoints()) {
    const rows = grouped.get(kp.sourceId) ?? [];
    rows.push(kp);
    grouped.set(kp.sourceId, rows);
  }
  return grouped;
}

function baseCases() {
  const grouped = kpsBySource();
  const cases = [];
  for (const source of CURRENT_FULL_PRODUCT_PUBLIC_SOURCE_UNITS) {
    const kps = grouped.get(source.sourceId) ?? [];
    cases.push({
      caseId: `${source.sourceId}::sourceUnit`,
      sourceId: source.sourceId,
      selectionMode: "sourceUnit",
      selectedKnowledgePointIds: [],
    });
    for (const kp of kps) {
      cases.push({
        caseId: `${source.sourceId}::single::${kp.knowledgePointId}`,
        sourceId: source.sourceId,
        selectionMode: "singleKnowledgePoint",
        selectedKnowledgePointIds: [kp.knowledgePointId],
      });
    }
    if (kps.length >= 2) {
      cases.push({
        caseId: `${source.sourceId}::mixedSameUnit`,
        sourceId: source.sourceId,
        selectionMode: "mixedKnowledgePointsSameUnit",
        selectedKnowledgePointIds: kps.map((kp) => kp.knowledgePointId),
      });
    }
  }
  return cases;
}

function controlValues(options) {
  const values = safeArray(options).map((option) => option?.value).filter(Boolean);
  return values.length > 0 ? values : [null];
}

function generationGroupId(group) {
  return group?.basePatternGroupId ?? group?.patternGroupId ?? null;
}

function groupKnowledgePointIds(group) {
  return unique([
    group?.primaryKnowledgePointId,
    ...safeArray(group?.knowledgePointIds),
  ]);
}

function compatibleGroupSets(input, resolved) {
  if (input.selectionMode === "sourceUnit" || resolved.questionType === "pbl") {
    return [{ setKind: "source-unit", publicPatternGroupIds: [], generationPatternGroupIds: [] }];
  }
  const groups = safeArray(resolved.compatiblePatternGroups);
  if (groups.length === 0) return [];
  if (input.selectionMode === "singleKnowledgePoint") {
    return groups.map((group) => ({
      setKind: "single-form",
      publicPatternGroupIds: [group.patternGroupId],
      generationPatternGroupIds: [generationGroupId(group)].filter(Boolean),
    }));
  }

  const selectedKps = new Set(input.selectedKnowledgePointIds);
  const groupsByKp = new Map();
  for (const group of groups) {
    const linkedKps = groupKnowledgePointIds(group).filter((kpId) => selectedKps.has(kpId));
    for (const kpId of linkedKps) {
      const rows = groupsByKp.get(kpId) ?? [];
      rows.push(group);
      groupsByKp.set(kpId, rows);
    }
  }
  const defaultGroups = [];
  for (const kpId of input.selectedKnowledgePointIds) {
    const group = groupsByKp.get(kpId)?.[0];
    if (group) defaultGroups.push(group);
  }
  const sets = [];
  if (defaultGroups.length > 0) {
    sets.push({
      setKind: "mixed-default",
      publicPatternGroupIds: unique(defaultGroups.map((group) => group.patternGroupId)),
      generationPatternGroupIds: unique(defaultGroups.map(generationGroupId)),
    });
  }
  const allPublic = unique(groups.map((group) => group.patternGroupId));
  const allGeneration = unique(groups.map(generationGroupId));
  if (allGeneration.length > 0 && JSON.stringify(allGeneration) !== JSON.stringify(sets[0]?.generationPatternGroupIds ?? [])) {
    sets.push({ setKind: "mixed-all", publicPatternGroupIds: allPublic, generationPatternGroupIds: allGeneration });
  }
  return sets;
}

function buildRouteInventory() {
  const routes = [];
  const routeBySignature = new Map();
  const bindingRouteRefs = new Map();
  for (const input of baseCases()) {
    const base = resolvePublicUiCapabilityBinding({ ...input, surfaceId: "CLASSIC" });
    if (base.blocked) continue;
    for (const option of base.availableQuestionTypeOptions) {
      const resolved = resolvePublicUiCapabilityBinding({
        ...input,
        surfaceId: "CLASSIC",
        requestedQuestionType: option.value,
      });
      if (resolved.blocked) continue;
      const groupSets = compatibleGroupSets(input, resolved);
      for (const groupSet of groupSets) {
        for (const depthMode of controlValues(resolved.depthOptions)) {
          for (const contextMode of controlValues(resolved.contextOptions)) {
            const signaturePayload = {
              sourceId: input.sourceId,
              selectionMode: input.selectionMode,
              selectedKnowledgePointIds: input.selectedKnowledgePointIds,
              questionType: option.value,
              generationPatternGroupIds: groupSet.generationPatternGroupIds,
              depthMode,
              contextMode,
            };
            const signature = JSON.stringify(signaturePayload);
            let route = routeBySignature.get(signature);
            if (!route) {
              const routeId = `pgc_r03_${input.sourceId}_${option.value}_${stableHash(signature, 12)}`;
              route = {
                routeId,
                caseId: input.caseId,
                sourceId: input.sourceId,
                selectionMode: input.selectionMode,
                selectedKnowledgePointIds: [...input.selectedKnowledgePointIds],
                questionType: option.value,
                questionTypeLabel: option.label,
                setKind: groupSet.setKind,
                publicPatternGroupIds: [...groupSet.publicPatternGroupIds],
                generationPatternGroupIds: [...groupSet.generationPatternGroupIds],
                compatiblePatternSpecIds: unique(resolved.compatiblePatternGroups
                  .filter((group) => groupSet.publicPatternGroupIds.length === 0 || groupSet.publicPatternGroupIds.includes(group.patternGroupId))
                  .flatMap((group) => group.patternSpecIds)),
                depthMode,
                contextMode,
                declaredUiMaxQuestionCount: resolved.questionCount.max,
                linkedBindingIds: [],
              };
              routes.push(route);
              routeBySignature.set(signature, route);
            }
            const routeRefs = bindingRouteRefs.get(`${input.caseId}::${option.value}`) ?? [];
            routeRefs.push(route.routeId);
            bindingRouteRefs.set(`${input.caseId}::${option.value}`, unique(routeRefs));
          }
        }
      }
    }
  }
  return { routes, bindingRouteRefs };
}

function promptText(question) {
  return String(
    question?.blankedDisplayText
      ?? question?.promptText
      ?? question?.prompt
      ?? question?.displayText
      ?? question?.questionText
      ?? "",
  ).replace(/\s+/g, " ").trim();
}

function answerText(question) {
  return String(question?.answerText ?? question?.answer ?? question?.correctAnswer ?? "").replace(/\s+/g, " ").trim();
}

function itemSignature(question) {
  return stableHash(JSON.stringify({
    prompt: promptText(question),
    answer: answerText(question),
    patternSpecId: question?.patternSpecId ?? question?.metadata?.patternId ?? null,
  }), 24);
}

function generatedQuestions(result) {
  const document = result?.worksheetDocument;
  return safeArray(document?.generatedQuestions).length > 0
    ? document.generatedQuestions
    : safeArray(document?.questions);
}

function errorCodes(result) {
  return unique(safeArray(result?.errors ?? result?.validation?.errors).map((error) => error?.code ?? String(error)));
}

function planForRoute(route, seed, questionCount = DEFAULT_QUESTION_COUNT) {
  const plan = {
    sourceId: route.sourceId,
    questionCount,
    ordering: "shuffleAcrossPatterns",
    includeAnswerKey: true,
    generationSeed: seed,
    selectionMode: route.selectionMode,
    selectedKnowledgePointIds: [...route.selectedKnowledgePointIds],
    selectedPatternGroupIds: [...route.generationPatternGroupIds],
    printLayout: { columns: 2, rowsPerPage: 10, showAnswerKeyPage: true },
    questionMode: route.questionType,
  };
  if (route.depthMode) plan.depthMode = route.depthMode;
  if (route.contextMode) plan.contextMode = route.contextMode;
  return plan;
}

function summarizeRun(route, seed, result, thrownError = null) {
  const questions = generatedQuestions(result);
  const itemSignatures = questions.map(itemSignature);
  const promptSignatures = questions.map((question) => stableHash(promptText(question), 24));
  const answerKeyItems = safeArray(result?.worksheetDocument?.answerKeyItems);
  const errors = errorCodes(result);
  return {
    seed,
    ok: thrownError == null && result?.ok === true,
    thrownError: thrownError ? String(thrownError?.stack ?? thrownError) : null,
    errorCodes: errors,
    questionCount: questions.length,
    answerKeyItemCount: answerKeyItems.length,
    duplicateItemCount: itemSignatures.length - new Set(itemSignatures).size,
    duplicatePromptCount: promptSignatures.length - new Set(promptSignatures).size,
    orderedWorksheetSignature: stableHash(itemSignatures.join("|"), 32),
    itemSetSignature: stableHash([...itemSignatures].sort().join("|"), 32),
    patternSpecIdsObserved: unique(questions.map((question) => question?.patternSpecId ?? question?.metadata?.patternId)),
    knowledgePointIdsObserved: unique(questions.flatMap((question) => [
      question?.knowledgePointId,
      question?.metadata?.knowledgePointId,
      ...safeArray(question?.knowledgePointIds),
      ...safeArray(question?.metadata?.knowledgePointIds),
    ])),
    requestedRouteId: route.routeId,
  };
}

async function runOne(buildWorksheetDocumentFromPlan, route, seed, questionCount = DEFAULT_QUESTION_COUNT) {
  try {
    const result = buildWorksheetDocumentFromPlan(planForRoute(route, seed, questionCount));
    return summarizeRun(route, seed, result, null);
  } catch (error) {
    return summarizeRun(route, seed, null, error);
  }
}

function routeClassification(runs, reproducibilityPassed) {
  const failedRuns = runs.filter((run) => !run.ok || run.questionCount !== DEFAULT_QUESTION_COUNT || run.duplicatePromptCount > 0);
  if (failedRuns.length > 0) {
    const retryLike = failedRuns.some((run) => /retry|exhaust|attempt/i.test(`${run.thrownError ?? ""}|${run.errorCodes.join("|")}`));
    return retryLike ? "RETRY_EXHAUSTION_RISK" : "CAPACITY_DEFICIENT";
  }
  if (!reproducibilityPassed) return "CAPACITY_DEFICIENT";
  const itemSetDiversity = new Set(runs.map((run) => run.itemSetSignature)).size;
  if (itemSetDiversity >= Math.max(8, SEED_COUNT - 2)) return "TRUE_PARAMETER_GENERATOR";
  if (itemSetDiversity >= 2) return "BOUNDED_PARAMETER_GENERATOR";
  return "FIXTURE_SELECTOR";
}

async function auditRoute(buildWorksheetDocumentFromPlan, route) {
  const seedRuns = [];
  for (const seed of SEEDS) seedRuns.push(await runOne(buildWorksheetDocumentFromPlan, route, seed));
  const replay = await runOne(buildWorksheetDocumentFromPlan, route, SEEDS[0]);
  const reproducibilityPassed = seedRuns[0].ok === replay.ok
    && seedRuns[0].orderedWorksheetSignature === replay.orderedWorksheetSignature
    && seedRuns[0].questionCount === replay.questionCount;
  const successfulRuns = seedRuns.filter((run) => run.ok);
  const uniqueOrderedWorksheetCount = new Set(successfulRuns.map((run) => run.orderedWorksheetSignature)).size;
  const uniqueItemSetCount = new Set(successfulRuns.map((run) => run.itemSetSignature)).size;
  const classification = routeClassification(seedRuns, reproducibilityPassed);
  const failureCodes = [];
  if (!reproducibilityPassed) failureCodes.push("SAME_SEED_NOT_REPRODUCIBLE");
  if (seedRuns.some((run) => !run.ok)) failureCodes.push("TEN_SEED_GENERATION_FAILURE");
  if (seedRuns.some((run) => run.questionCount !== DEFAULT_QUESTION_COUNT)) failureCodes.push("QUESTION_COUNT_MISMATCH");
  if (seedRuns.some((run) => run.duplicatePromptCount > 0)) failureCodes.push("DUPLICATE_PROMPT_IN_WORKSHEET");
  if (seedRuns.some((run) => run.answerKeyItemCount !== DEFAULT_QUESTION_COUNT)) failureCodes.push("ANSWER_KEY_COUNT_MISMATCH");
  if (uniqueItemSetCount < 2) failureCodes.push("CROSS_SEED_ITEM_DIVERSITY_DEFICIENT");
  if (!GENERATOR_CLASSES.includes(classification)) failureCodes.push("GENERATOR_CLASSIFICATION_INVALID");
  return {
    ...clone(route),
    defaultQuestionCount: DEFAULT_QUESTION_COUNT,
    seedCount: SEED_COUNT,
    sameSeedReplayPassed: reproducibilityPassed,
    successfulSeedCount: successfulRuns.length,
    failedSeedCount: SEED_COUNT - successfulRuns.length,
    minQuestionCountObserved: Math.min(...seedRuns.map((run) => run.questionCount)),
    maxQuestionCountObserved: Math.max(...seedRuns.map((run) => run.questionCount)),
    maxDuplicatePromptCount: Math.max(...seedRuns.map((run) => run.duplicatePromptCount)),
    maxDuplicateItemCount: Math.max(...seedRuns.map((run) => run.duplicateItemCount)),
    uniqueOrderedWorksheetCount,
    uniqueItemSetCount,
    generatorClass: classification,
    verifiedMaxQuestionCount: failureCodes.length === 0 ? DEFAULT_QUESTION_COUNT : 0,
    capacityStatus: failureCodes.length === 0 ? "VERIFIED_20" : "FAIL_CLOSED",
    failureCodes,
    seedRuns,
    replay,
  };
}

function attachBindingEvidence(r02Contract, bindingRouteRefs, routeResults) {
  const routeById = new Map(routeResults.map((route) => [route.routeId, route]));
  return r02Contract.bindings.map((binding) => {
    const routeIds = unique(bindingRouteRefs.get(`${binding.caseId}::${binding.questionType}`) ?? []);
    const evidence = routeIds.map((routeId) => routeById.get(routeId)).filter(Boolean);
    const verifiedMax = evidence.length > 0 ? Math.min(...evidence.map((route) => route.verifiedMaxQuestionCount)) : 0;
    return {
      bindingId: binding.bindingId,
      caseId: binding.caseId,
      sourceId: binding.sourceId,
      surfaceId: binding.surfaceId,
      questionType: binding.questionType,
      routeIds,
      routeCount: routeIds.length,
      declaredUiMaxQuestionCount: binding.questionCountMax,
      verifiedMaxQuestionCount: verifiedMax,
      capacityStatus: evidence.length > 0 && evidence.every((route) => route.capacityStatus === "VERIFIED_20") ? "VERIFIED_20" : "FAIL_CLOSED",
    };
  });
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
      : mismatches.map((route) => `- \`${route.routeId}\` — ${route.failureCodes.join(", ")} — source \`${route.sourceId}\`, type \`${route.questionType}\`, groups \`${route.generationPatternGroupIds.join("|")}\``)),
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

export async function buildPgcR03GeneratorCapacityContract() {
  const priorDocument = globalThis.document;
  if (typeof globalThis.document === "undefined") {
    globalThis.document = { getElementById: () => null, body: null };
  }
  const { buildWorksheetDocumentFromPlan } = await import("../../site/assets/browser/pipeline/build-worksheet-document.js");
  const r02Contract = buildPgcR02UiCapabilityBindingContract();
  const inventory = buildRouteInventory();
  const routeResults = [];
  for (const [index, route] of inventory.routes.entries()) {
    const result = await auditRoute(buildWorksheetDocumentFromPlan, route);
    routeResults.push(result);
    if ((index + 1) % 25 === 0 || index + 1 === inventory.routes.length) {
      console.log(`PGC_R03_PROGRESS=${index + 1}/${inventory.routes.length}`);
    }
  }
  if (priorDocument === undefined) delete globalThis.document;
  else globalThis.document = priorDocument;

  const bindingEvidence = attachBindingEvidence(r02Contract, inventory.bindingRouteRefs, routeResults);
  const generatorClassCounts = Object.fromEntries(GENERATOR_CLASSES.map((classification) => [classification, routeResults.filter((route) => route.generatorClass === classification).length]));
  const capacityMismatchBindings = bindingEvidence.filter((binding) => binding.capacityStatus !== "VERIFIED_20");
  const summary = {
    publicSourceCount: CURRENT_FULL_PRODUCT_PUBLIC_SOURCE_UNITS.length,
    visibleKnowledgePointCount: listVisibleBatchAKnowledgePoints().length,
    publicSurfaceCount: r02Contract.summary.publicSurfaceCount,
    bindingCount: r02Contract.bindings.length,
    bindingEvidenceCount: bindingEvidence.filter((binding) => binding.routeCount > 0).length,
    routeCount: routeResults.length,
    verified20RouteCount: routeResults.filter((route) => route.capacityStatus === "VERIFIED_20").length,
    failClosedRouteCount: routeResults.filter((route) => route.capacityStatus !== "VERIFIED_20").length,
    capacityMismatchBindingCount: capacityMismatchBindings.length,
    sameSeedReproFailureCount: routeResults.filter((route) => !route.sameSeedReplayPassed).length,
    crossSeedDiversityFailureCount: routeResults.filter((route) => route.uniqueItemSetCount < 2).length,
    duplicatePromptRouteCount: routeResults.filter((route) => route.maxDuplicatePromptCount > 0).length,
    tenSeedFailureRouteCount: routeResults.filter((route) => route.failedSeedCount > 0).length,
    generatorClassCounts,
  };
  const blocking = summary.failClosedRouteCount > 0
    || summary.capacityMismatchBindingCount > 0
    || summary.bindingEvidenceCount !== summary.bindingCount;
  return {
    schemaName: "PublicGeneratorCapacityContractV1",
    schemaVersion: 1,
    programId: "PUBLIC_KP_GENERATION_CONFORMANCE_V1",
    taskId: "PGC-R03_PublicGeneratorCapacityContract",
    status: blocking ? "FAIL_CLOSED" : "PASS",
    defaultQuestionCount: DEFAULT_QUESTION_COUNT,
    seedCount: SEED_COUNT,
    seeds: [...SEEDS],
    routeAuthority: "PGC-R02_UI_CAPABILITY_BINDING_DEDUPED_ACROSS_SURFACES",
    generationConsumer: "site/assets/browser/pipeline/build-worksheet-document.js",
    policy: {
      sameSeedReproducible: true,
      differentSeedsRequireDifferentItemSets: true,
      duplicatePromptsWithinWorksheetAllowed: false,
      tenConsecutiveSeedsMustPass: true,
      fixedFixtureDuplicationAllowed: false,
      insufficientCapacityFailsClosed: true,
    },
    summary,
    routes: routeResults,
    bindingEvidence,
    mismatches: {
      routeIds: routeResults.filter((route) => route.capacityStatus !== "VERIFIED_20").map((route) => route.routeId),
      bindingIds: capacityMismatchBindings.map((binding) => binding.bindingId),
    },
  };
}

export async function materializePgcR03GeneratorCapacityContract() {
  const contract = await buildPgcR03GeneratorCapacityContract();
  fs.mkdirSync(outputDir, { recursive: true });
  fs.mkdirSync(docsDir, { recursive: true });
  fs.writeFileSync(contractPath, `${JSON.stringify(contract, null, 2)}\n`);
  writeCsv(routeCsvPath, [
    "routeId", "caseId", "sourceId", "selectionMode", "selectedKnowledgePointIds", "questionType",
    "setKind", "publicPatternGroupIds", "generationPatternGroupIds", "compatiblePatternSpecIds",
    "depthMode", "contextMode", "declaredUiMaxQuestionCount", "verifiedMaxQuestionCount", "capacityStatus",
    "generatorClass", "successfulSeedCount", "failedSeedCount", "sameSeedReplayPassed",
    "uniqueOrderedWorksheetCount", "uniqueItemSetCount", "maxDuplicatePromptCount", "failureCodes",
  ], contract.routes);
  writeCsv(diversityCsvPath, [
    "routeId", "sourceId", "questionType", "generatorClass", "seedCount", "successfulSeedCount",
    "sameSeedReplayPassed", "uniqueOrderedWorksheetCount", "uniqueItemSetCount", "crossSeedDiversityPassed",
  ], contract.routes.map((route) => ({
    ...route,
    crossSeedDiversityPassed: route.uniqueItemSetCount >= 2,
  })));
  writeMismatchReport(contract);
  return contract;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const contract = await materializePgcR03GeneratorCapacityContract();
  console.log(`PGC_R03_SUMMARY=${JSON.stringify(contract.summary)}`);
  if (contract.status !== "PASS") process.exitCode = 2;
}
