import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  BATCH_A_SELECTION_MODES,
  createConfigState,
  setBatchAContextMode,
  setBatchADepthMode,
  setBatchAGenerationSeed,
  setBatchAIncludeAnswerKey,
  setBatchALayoutMode,
  setBatchAOrdering,
  setBatchAPrintLayout,
  setBatchAQuestionCount,
  setBatchAQuestionMode,
  setBatchASelectorSelection,
  setBatchASourceId,
} from "../../site/assets/browser/state/config-state.js";
import {
  buildWorksheetDocumentFromState,
} from "../../site/assets/browser/pipeline/build-worksheet-document.js";
import {
  getVisiblePatternGroupsForKnowledgePoint,
  listVisibleBatchAKnowledgePoints,
} from "../../site/modules/curriculum/registry/batch-a-selector-extension.js";

const toolDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(toolDirectory, "../..");
const contractPath = path.join(
  repositoryRoot,
  "data/curriculum/contracts/GLM_S00_PublicCompletedUnit18LayoutContract.json",
);
const s01BaselinePath = path.join(
  repositoryRoot,
  "docs/curriculum/output/GLM_S01_CURRENT_15_UNIT_LAYOUT_BEHAVIOR_BASELINE.json",
);
const outputDirectory = path.join(
  repositoryRoot,
  "docs/curriculum/output/glm-s02-unit-renderer-worst-case-audit",
);
const outputPath = path.join(outputDirectory, "current.json");

const contract = JSON.parse(readFileSync(contractPath, "utf8"));
const s01Baseline = JSON.parse(readFileSync(s01BaselinePath, "utf8"));
const visibleKnowledgePoints = listVisibleBatchAKnowledgePoints();

const SOURCE_SEEDS = Object.freeze(["source-a", "source-b", "source-c"]);
const GROUP_SEEDS = Object.freeze(["group-a", "group-b", "group-c"]);
const MIXED_SEEDS = Object.freeze(["mixed-a", "mixed-b", "mixed-c"]);

function clone(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function textLength(value) {
  return [...String(value ?? "")].length;
}

function issueCodes(result) {
  const issues = [
    ...(result?.errors ?? []),
    ...(result?.validation?.errors ?? []),
    ...(result?.warnings ?? []),
    ...(result?.validation?.warnings ?? []),
  ];
  return unique(issues.map((issue) => issue?.code));
}

function flattenQuestionDisplayModels(document) {
  if (Array.isArray(document?.questionDisplayModels) && document.questionDisplayModels.length > 0) {
    return document.questionDisplayModels;
  }
  return (document?.questionPages ?? []).flatMap((page) => (
    (page?.cells ?? [])
      .filter((cell) => cell?.cellType === "question")
      .map((cell) => cell.displayModel ?? cell.questionDisplayModel ?? cell)
  ));
}

function flattenAnswerKeyItems(document) {
  if (Array.isArray(document?.answerKeyItems) && document.answerKeyItems.length > 0) {
    return document.answerKeyItems;
  }
  return (document?.answerKeyPages ?? []).flatMap((page) => (
    (page?.cells ?? [])
      .filter((cell) => cell?.cellType === "answer")
      .map((cell) => cell.answerKeyItem ?? cell.answerItem ?? cell)
  ));
}

function profileSnapshot(document) {
  const profile = document?.rendererProfile ?? null;
  if (!profile) return null;
  return {
    profileId: profile.profileId ?? null,
    questionSheet: clone(profile.questionSheet ?? null),
    answerKey: clone(profile.answerKey ?? null),
  };
}

function questionRecords(document, route) {
  const generated = Array.isArray(document?.generatedQuestions) ? document.generatedQuestions : [];
  const displays = flattenQuestionDisplayModels(document);
  const answers = flattenAnswerKeyItems(document);
  const count = Math.max(generated.length, displays.length, answers.length);
  const records = [];

  for (let index = 0; index < count; index += 1) {
    const question = generated[index] ?? {};
    const display = displays[index] ?? {};
    const answer = answers[index] ?? {};
    const promptText = display.blankedDisplayText
      ?? display.displayText
      ?? display.promptText
      ?? question.promptText
      ?? answer.promptText
      ?? "";
    const responsePrompt = display.responsePrompt ?? "";
    const answerText = answer.answerText ?? question.answerText ?? "";
    const renderKind = display.renderKind ?? answer.renderKind ?? question.renderKind ?? null;
    const answerModelShape = display.answerModelShape
      ?? answer.answerModelShape
      ?? question.answerModelShape
      ?? null;
    const mode = display.mode ?? question.mode ?? null;
    const applicationText = display.applicationText === true || question.applicationText === true;
    const promptLength = textLength(promptText);
    const responsePromptLength = textLength(responsePrompt);
    const answerLength = textLength(answerText);
    const burdenScore = promptLength + responsePromptLength + answerLength;

    records.push({
      sourceId: route.sourceId,
      routeId: route.routeId,
      routeKind: route.routeKind,
      seed: route.seed,
      sequence: index,
      questionId: question.id ?? question.questionId ?? display.questionId ?? answer.questionId ?? null,
      knowledgePointId: question.knowledgePointId ?? display.knowledgePointId ?? answer.knowledgePointId ?? route.knowledgePointId ?? null,
      patternGroupId: question.resolvedPatternGroupId
        ?? question.patternGroupId
        ?? display.patternGroupId
        ?? answer.patternGroupId
        ?? route.patternGroupId
        ?? null,
      patternSpecId: question.patternSpecId ?? display.patternId ?? answer.patternId ?? null,
      renderKind,
      answerModelShape,
      mode,
      applicationText,
      promptText,
      responsePrompt,
      answerText,
      promptLength,
      responsePromptLength,
      answerLength,
      burdenScore,
      shapeKey: [
        renderKind ?? "unknown",
        answerModelShape ?? "unknown",
        mode ?? "unknown",
        applicationText ? "application" : "non_application",
      ].join("|"),
    });
  }
  return records;
}

function buildState(route) {
  const state = createConfigState();
  setBatchASourceId(state, route.sourceId);
  setBatchAQuestionCount(state, route.questionCount);
  setBatchAOrdering(state, "groupedByPattern");
  setBatchAIncludeAnswerKey(state, true);
  setBatchAGenerationSeed(state, `glm-s02:${route.sourceId}:${route.routeId}:${route.seed}`);
  setBatchAPrintLayout(state, { columns: 1, rowsPerPage: 1 });
  setBatchASelectorSelection(state, {
    selectionMode: route.selectionMode,
    selectedKnowledgePointIds: route.selectedKnowledgePointIds,
    selectedPatternGroupIds: route.selectedPatternGroupIds,
  });
  setBatchAQuestionMode(state, "mixed");
  setBatchADepthMode(state, "mixed");
  setBatchAContextMode(state, "mixed");
  setBatchALayoutMode(state, "custom_with_caps");
  return state;
}

function auditRoute(route) {
  let result;
  let exception = null;
  try {
    result = buildWorksheetDocumentFromState(buildState(route));
  } catch (error) {
    exception = {
      name: error?.name ?? "Error",
      message: String(error?.message ?? error),
    };
    result = { ok: false, errors: [{ code: "GLM_S02_HARNESS_EXCEPTION" }] };
  }

  const document = result?.worksheetDocument ?? null;
  const questions = document ? questionRecords(document, route) : [];
  const requestedQuestionCount = route.questionCount;
  const generatedQuestionCount = document?.summary?.questionCount
    ?? document?.generatedQuestions?.length
    ?? flattenQuestionDisplayModels(document).length
    ?? 0;

  return {
    routeId: route.routeId,
    routeKind: route.routeKind,
    sourceId: route.sourceId,
    selectionMode: route.selectionMode,
    seed: route.seed,
    knowledgePointId: route.knowledgePointId ?? null,
    patternGroupId: route.patternGroupId ?? null,
    selectedKnowledgePointIds: clone(route.selectedKnowledgePointIds),
    selectedPatternGroupIds: clone(route.selectedPatternGroupIds),
    requestedQuestionCount,
    generatedQuestionCount,
    exactQuestionCount: generatedQuestionCount === requestedQuestionCount,
    generationOk: Boolean(result?.ok && document),
    issueCodes: issueCodes(result),
    exception,
    rendererProfile: profileSnapshot(document),
    printOptions: clone(document?.printOptions ?? null),
    layoutResolution: clone(document?.layoutResolution ?? null),
    questionPageCount: document?.summary?.questionPageCount
      ?? document?.questionPages?.length
      ?? 0,
    answerPageCount: document?.summary?.answerKeyPageCount
      ?? document?.answerKeyPages?.length
      ?? 0,
    questions,
  };
}

function unitKnowledgePoints(sourceId) {
  return visibleKnowledgePoints.filter((row) => row.sourceId === sourceId);
}

function unitPatternGroups(knowledgePoints) {
  const rows = [];
  for (const knowledgePoint of knowledgePoints) {
    for (const group of getVisiblePatternGroupsForKnowledgePoint(knowledgePoint.knowledgePointId)) {
      rows.push({
        ...clone(group),
        knowledgePointId: group.knowledgePointId ?? knowledgePoint.knowledgePointId,
      });
    }
  }
  return [...new Map(rows.map((row) => [row.patternGroupId, row])).values()];
}

function buildRoutes(unit) {
  const knowledgePoints = unitKnowledgePoints(unit.sourceId);
  const patternGroups = unitPatternGroups(knowledgePoints);
  const routes = [];

  for (const seed of SOURCE_SEEDS) {
    routes.push({
      routeId: `sourceUnit:${seed}`,
      routeKind: "sourceUnit",
      sourceId: unit.sourceId,
      selectionMode: BATCH_A_SELECTION_MODES.SOURCE_UNIT,
      selectedKnowledgePointIds: [],
      selectedPatternGroupIds: [],
      questionCount: 40,
      seed,
    });
  }

  for (const group of patternGroups) {
    for (const seed of GROUP_SEEDS) {
      routes.push({
        routeId: `patternGroup:${group.patternGroupId}:${seed}`,
        routeKind: "singlePatternGroup",
        sourceId: unit.sourceId,
        selectionMode: BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
        selectedKnowledgePointIds: [group.knowledgePointId],
        selectedPatternGroupIds: [group.patternGroupId],
        knowledgePointId: group.knowledgePointId,
        patternGroupId: group.patternGroupId,
        questionCount: 1,
        seed,
      });
    }
  }

  if (knowledgePoints.length >= 2 && patternGroups.length > 0) {
    for (const seed of MIXED_SEEDS) {
      routes.push({
        routeId: `mixedAll:${seed}`,
        routeKind: "mixedAll",
        sourceId: unit.sourceId,
        selectionMode: BATCH_A_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
        selectedKnowledgePointIds: knowledgePoints.map((row) => row.knowledgePointId),
        selectedPatternGroupIds: patternGroups.map((row) => row.patternGroupId),
        questionCount: Math.min(80, Math.max(20, patternGroups.length * 2)),
        seed,
      });
    }
  }

  return { knowledgePoints, patternGroups, routes };
}

function topBy(records, selector, limit = 10) {
  return [...records]
    .sort((left, right) => selector(right) - selector(left)
      || right.burdenScore - left.burdenScore
      || left.routeId.localeCompare(right.routeId))
    .slice(0, limit)
    .map(clone);
}

function worstByShape(records) {
  const byShape = new Map();
  for (const record of records) {
    const current = byShape.get(record.shapeKey);
    if (!current || record.burdenScore > current.burdenScore) {
      byShape.set(record.shapeKey, record);
    }
  }
  return [...byShape.values()]
    .sort((left, right) => right.burdenScore - left.burdenScore)
    .map(clone);
}

function profileKey(profile) {
  if (!profile) return "missing";
  return JSON.stringify(profile);
}

function routeSummary(route) {
  return {
    routeId: route.routeId,
    routeKind: route.routeKind,
    seed: route.seed,
    knowledgePointId: route.knowledgePointId,
    patternGroupId: route.patternGroupId,
    requestedQuestionCount: route.requestedQuestionCount,
    generatedQuestionCount: route.generatedQuestionCount,
    exactQuestionCount: route.exactQuestionCount,
    generationOk: route.generationOk,
    issueCodes: route.issueCodes,
    exception: route.exception,
    rendererProfile: route.rendererProfile,
    printOptions: route.printOptions,
    layoutResolution: route.layoutResolution,
    questionPageCount: route.questionPageCount,
    answerPageCount: route.answerPageCount,
  };
}

function diagnoseUnit(unit, routes, records, s01Gap) {
  const diagnoses = [];
  const sourceRoutes = routes.filter((route) => route.routeKind === "sourceUnit");
  const canonicalRoutes = routes.filter((route) => route.routeKind !== "sourceUnit");
  const sourceSuccess = sourceRoutes.filter((route) => route.generationOk);
  const canonicalSuccess = canonicalRoutes.filter((route) => route.generationOk);
  const profiles = unique(routes.map((route) => profileKey(route.rendererProfile)));

  if (s01Gap?.classificationCounts?.SILENTLY_CAPPED) diagnoses.push("renderer_or_profile_row_cap_confirmed_by_s01");
  if (sourceSuccess.length === 0 && canonicalSuccess.length > 0) diagnoses.push("source_unit_route_gap_with_canonical_route_available");
  if (sourceSuccess.some((route) => !route.exactQuestionCount)) diagnoses.push("source_unit_question_count_not_honored");
  if (routes.some((route) => route.generationOk && !route.rendererProfile)) diagnoses.push("renderer_profile_readback_missing");
  if (routes.some((route) => route.generationOk && !route.printOptions)) diagnoses.push("print_layout_readback_missing");
  if (routes.some((route) => route.issueCodes.includes("batch_a_g4a_u01_first_difference_missing"))) {
    diagnoses.push("generation_validation_defect_separate_from_layout_cap");
  }
  if (records.length === 0) diagnoses.push("no_question_shape_sample_available");
  if (profiles.length > 1) diagnoses.push("multiple_renderer_profiles_require_shape_specific_s03_matrix");
  if (unit.sourceId === "g5a_u02_5a02" && sourceSuccess.some((route) => !route.exactQuestionCount)) {
    diagnoses.push("static_source_candidate_ignores_requested_count_and_layout");
  }
  return unique(diagnoses);
}

const unitSummaries = [];
const allRouteSummaries = [];
let totalQuestionSamples = 0;

for (const unit of contract.publicUnits) {
  const { knowledgePoints, patternGroups, routes: routeInputs } = buildRoutes(unit);
  const auditedRoutes = routeInputs.map(auditRoute);
  const records = auditedRoutes.flatMap((route) => route.questions);
  const s01Gap = s01Baseline.gapUnits.find((entry) => entry.sourceId === unit.sourceId) ?? null;
  const profileSnapshots = [...new Map(
    auditedRoutes
      .filter((route) => route.rendererProfile)
      .map((route) => [profileKey(route.rendererProfile), route.rendererProfile]),
  ).values()];
  const shapeKeys = unique(records.map((record) => record.shapeKey));
  const patternSpecIds = unique(patternGroups.flatMap((group) => group.patternSpecIds ?? []));
  const failedRoutes = auditedRoutes.filter((route) => !route.generationOk);
  const exactRouteCount = auditedRoutes.filter((route) => route.generationOk && route.exactQuestionCount).length;

  totalQuestionSamples += records.length;
  allRouteSummaries.push(...auditedRoutes.map(routeSummary));
  unitSummaries.push({
    sourceId: unit.sourceId,
    unitCode: unit.unitCode,
    title: unit.title,
    visibleKnowledgePointCount: knowledgePoints.length,
    visiblePatternGroupCount: patternGroups.length,
    visiblePatternSpecCount: patternSpecIds.length,
    attemptedRouteCount: auditedRoutes.length,
    successfulRouteCount: auditedRoutes.filter((route) => route.generationOk).length,
    failedRouteCount: failedRoutes.length,
    exactQuestionCountRouteCount: exactRouteCount,
    questionSampleCount: records.length,
    rendererProfiles: profileSnapshots,
    shapeFamilyCount: shapeKeys.length,
    shapeKeys,
    maxTextMetrics: {
      promptLength: Math.max(0, ...records.map((record) => record.promptLength)),
      responsePromptLength: Math.max(0, ...records.map((record) => record.responsePromptLength)),
      answerLength: Math.max(0, ...records.map((record) => record.answerLength)),
      burdenScore: Math.max(0, ...records.map((record) => record.burdenScore)),
    },
    worstCases: {
      byShape: worstByShape(records),
      longestPrompts: topBy(records, (record) => record.promptLength, 5),
      longestResponsePrompts: topBy(records, (record) => record.responsePromptLength, 5),
      longestAnswers: topBy(records, (record) => record.answerLength, 5),
      highestBurden: topBy(records, (record) => record.burdenScore, 10),
    },
    sourceUnitRoutes: auditedRoutes
      .filter((route) => route.routeKind === "sourceUnit")
      .map(routeSummary),
    failedRoutes: failedRoutes.map(routeSummary),
    s01Gap: clone(s01Gap),
    diagnoses: diagnoseUnit(unit, auditedRoutes, records, s01Gap),
  });
}

const unitsWithoutSamples = unitSummaries.filter((unit) => unit.questionSampleCount === 0);
const manifest = {
  schemaVersion: "glm-s02-unit-renderer-worst-case-audit-v1",
  task: "GLM-S02_UnitRendererProfileAndWorstCaseQuestionAudit",
  status: "AUDIT_CAPTURED",
  publicUnitCount: contract.scope.publicUnitCount,
  auditedUnitCount: unitSummaries.length,
  sourceUnitRouteSeedCount: SOURCE_SEEDS.length,
  patternGroupRouteSeedCount: GROUP_SEEDS.length,
  mixedRouteSeedCount: MIXED_SEEDS.length,
  attemptedRouteCount: allRouteSummaries.length,
  successfulRouteCount: allRouteSummaries.filter((route) => route.generationOk).length,
  failedRouteCount: allRouteSummaries.filter((route) => !route.generationOk).length,
  totalQuestionSamples,
  unitsWithoutSamples: unitsWithoutSamples.map((unit) => unit.sourceId),
  s01ClassificationCounts: clone(s01Baseline.classificationCounts),
  unitSummaries,
  routeSummaries: allRouteSummaries,
  nextTask: "GLM-S03_270ScenarioHTMLPDFBaseline",
};

if (manifest.auditedUnitCount !== contract.scope.publicUnitCount) {
  throw new Error(`GLM_S02_UNIT_COUNT_MISMATCH:${manifest.auditedUnitCount}`);
}

mkdirSync(outputDirectory, { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(JSON.stringify({
  status: manifest.status,
  auditedUnitCount: manifest.auditedUnitCount,
  attemptedRouteCount: manifest.attemptedRouteCount,
  successfulRouteCount: manifest.successfulRouteCount,
  failedRouteCount: manifest.failedRouteCount,
  totalQuestionSamples: manifest.totalQuestionSamples,
  unitsWithoutSamples: manifest.unitsWithoutSamples,
  outputPath: path.relative(repositoryRoot, outputPath),
}, null, 2));
