import {
  buildBatchABrowserPlan as baseBuildPlan,
  generateBatchABrowserQuestions as baseGenerate,
} from "./batch-a-browser-generator-p09-a02.js";
import {
  getP09A03BSourceRouteAlias,
  isP09A03BSourceRouteAlias,
} from "../registry/public-curriculum-source-route-aliases-p09-a03b.js";
import {
  getVisibleBatchAKnowledgePoint,
  getVisiblePatternGroupsForKnowledgePoint,
  listVisibleBatchAKnowledgePoints,
} from "../registry/batch-a-selector-p09-a03b-extension.js";

export const P09_A03B_G3A_U08_SOURCE_ID = "g3a_u08_3a08";
export const P09_A03B_MAX_QUESTION_COUNT = 120;

const unique = (values = []) => [...new Set((Array.isArray(values) ? values : []).filter(Boolean))];
const issue = (code, path = "plan") => Object.freeze({ code, severity: "error", path, message: code });

function selectedIds(options, fallbackIds = []) {
  const requested = unique(options.selectedKnowledgePointIds ?? options.knowledgePointIds ?? []);
  return requested.length ? requested : [...fallbackIds];
}

function g3aU08KnowledgePointIds() {
  return listVisibleBatchAKnowledgePoints()
    .filter((row) => row.sourceId === P09_A03B_G3A_U08_SOURCE_ID)
    .map((row) => row.knowledgePointId);
}

function patternGroupsFor(ids) {
  return unique(ids.flatMap((id) => getVisiblePatternGroupsForKnowledgePoint(id).map((group) => group.patternGroupId)));
}

function patternSpecsFor(ids) {
  return unique(ids.flatMap((id) => getVisiblePatternGroupsForKnowledgePoint(id).flatMap((group) => group.patternSpecIds ?? [])));
}

function allocate(ids, questionCount) {
  if (!ids.length) return [];
  const base = Math.floor(questionCount / ids.length);
  let remainder = questionCount % ids.length;
  return ids.map((knowledgePointId) => {
    const count = base + (remainder > 0 ? 1 : 0);
    if (remainder > 0) remainder -= 1;
    return Object.freeze({ knowledgePointId, questionCount: count });
  }).filter((row) => row.questionCount > 0);
}

function preferredQuestionMode(knowledgePointId) {
  const row = getVisibleBatchAKnowledgePoint(knowledgePointId);
  const modes = unique(row?.questionModes ?? [row?.questionMode, row?.mode]);
  if (modes.includes("numeric")) return "numeric";
  if (modes.includes("application")) return "application";
  return modes[0] ?? "numeric";
}

function sourceUnitMeta(sourceId) {
  if (sourceId === P09_A03B_G3A_U08_SOURCE_ID) {
    return Object.freeze({ sourceId, grade: 3, semester: "upper", unitCode: "3A-U08", title: "分數", domain: "fraction_representation_and_part_whole" });
  }
  const alias = getP09A03BSourceRouteAlias(sourceId);
  return alias ? Object.freeze({
    sourceId: alias.sourceId,
    grade: alias.grade,
    semester: alias.semester,
    unitCode: alias.unitCode,
    title: alias.title,
    domain: alias.domain,
    semanticOwnerSourceId: alias.semanticOwnerSourceId,
  }) : null;
}

function buildIntegratedPlan(options = {}) {
  const alias = getP09A03BSourceRouteAlias(options.sourceId);
  const isG3A = options.sourceId === P09_A03B_G3A_U08_SOURCE_ID;
  const selectionMode = options.selectionMode ?? "sourceUnit";
  if (alias && !["sourceUnit", "singleKnowledgePoint"].includes(selectionMode)) {
    return Object.freeze({
      sourceId: options.sourceId,
      selectionMode,
      selectedKnowledgePointIds: Object.freeze(selectedIds(options)),
      questionCount: Number(options.questionCount ?? 20),
      questionMode: options.questionMode ?? "mixed",
      errors: Object.freeze([issue("P09_A03B_ALIAS_MIXED_NOT_ADMITTED")]),
      blocked: true,
    });
  }
  const fullIds = isG3A ? g3aU08KnowledgePointIds() : alias?.knowledgePointIds ?? [];
  const ids = selectionMode === "singleKnowledgePoint"
    ? selectedIds(options).slice(0, 1)
    : selectedIds(options, fullIds).filter((id) => fullIds.includes(id));
  const count = Number(options.questionCount ?? 20);
  const groups = patternGroupsFor(ids);
  return Object.freeze({
    ...options,
    sourceId: options.sourceId,
    sourceUnit: sourceUnitMeta(options.sourceId),
    semanticOwnerSourceId: alias?.semanticOwnerSourceId ?? null,
    selectionMode,
    selectedKnowledgePointIds: Object.freeze(ids),
    knowledgePointIds: Object.freeze(ids),
    requestedKnowledgePointIds: Object.freeze(ids),
    selectedPatternGroupIds: Object.freeze(groups),
    requestedPatternGroupIds: Object.freeze(groups),
    patternSpecIds: Object.freeze(patternSpecsFor(ids)),
    questionMode: selectionMode === "singleKnowledgePoint" ? preferredQuestionMode(ids[0]) : (isG3A ? "mixed" : (alias?.sourceId === "g6b_u02_6b02" ? "numeric" : "mixed")),
    requestedQuestionType: options.requestedQuestionType ?? options.questionMode ?? null,
    questionCount: count,
    questionCountMax: P09_A03B_MAX_QUESTION_COUNT,
    ordering: options.ordering === "shuffleAcrossPatterns" ? "shuffleAcrossPatterns" : "groupedByPattern",
    generationSeed: String(options.generationSeed ?? "p09-a03b-public-curriculum-unit"),
    publicControls: Object.freeze({
      sourceId: options.sourceId,
      productWave: "P09",
      productAdmissionTask: "P09_UI_A03B_PublicCurriculumUnitCompletenessImplementation",
      semanticOwnerSourceId: alias?.semanticOwnerSourceId ?? null,
    }),
    genericFallback: false,
    genericFallbackAllowed: false,
    freeFormAI: false,
    crossUnitMixedMode: "NOT_ADMITTED",
    sharedRuntimeScope: "SHARED_RUNTIME_BOUNDED",
    blocked: false,
    errors: Object.freeze([]),
  });
}

export function requestsP09A03B(options = {}) {
  if (isP09A03BSourceRouteAlias(options.sourceId)) return true;
  return options.sourceId === P09_A03B_G3A_U08_SOURCE_ID
    && ["sourceUnit", "mixedKnowledgePointsSameUnit"].includes(options.selectionMode ?? "sourceUnit");
}

export function buildBatchABrowserPlan(options = {}) {
  if (!requestsP09A03B(options)) return baseBuildPlan(options);
  return buildIntegratedPlan(options);
}

function projectAliasQuestion(question, alias) {
  if (!alias) return question;
  const metadata = {
    ...(question.metadata ?? {}),
    sourceId: alias.sourceId,
    curriculumNodeIds: [alias.sourceId],
    requestedCurriculumSourceId: alias.sourceId,
    semanticOwnerSourceId: alias.semanticOwnerSourceId,
    sourceRouteAlias: true,
    sourceAuthorityPolicy: alias.sourceAuthorityPolicy,
  };
  return Object.freeze({
    ...question,
    id: `${alias.sourceId}-${question.id}`,
    sourceId: alias.sourceId,
    metadata: Object.freeze(metadata),
  });
}

function generateIntegrated(options, plan) {
  if (plan.blocked) {
    return Object.freeze({ ok: false, errors: plan.errors, warnings: Object.freeze([]), questions: Object.freeze([]), allocation: Object.freeze([]), plan });
  }
  if (!Number.isInteger(plan.questionCount) || plan.questionCount < 1 || plan.questionCount > P09_A03B_MAX_QUESTION_COUNT) {
    return Object.freeze({ ok: false, errors: Object.freeze([issue("P09_A03B_QUESTION_COUNT_INVALID", "questionCount")]), warnings: Object.freeze([]), questions: Object.freeze([]), allocation: Object.freeze([]), plan });
  }
  if (!plan.selectedKnowledgePointIds.length) {
    return Object.freeze({ ok: false, errors: Object.freeze([issue("P09_A03B_KP_SELECTION_EMPTY", "selectedKnowledgePointIds")]), warnings: Object.freeze([]), questions: Object.freeze([]), allocation: Object.freeze([]), plan });
  }
  const alias = getP09A03BSourceRouteAlias(plan.sourceId);
  const ownerSourceId = alias?.semanticOwnerSourceId ?? plan.sourceId;
  const allocations = allocate(plan.selectedKnowledgePointIds, plan.questionCount);
  const questions = [];
  const errors = [];
  for (const entry of allocations) {
    const mode = preferredQuestionMode(entry.knowledgePointId);
    const generation = baseGenerate({
      ...options,
      sourceId: ownerSourceId,
      selectionMode: "singleKnowledgePoint",
      selectedKnowledgePointIds: [entry.knowledgePointId],
      knowledgePointIds: [entry.knowledgePointId],
      selectedPatternGroupIds: [],
      patternSpecIds: undefined,
      questionMode: mode,
      requestedQuestionType: mode,
      questionCount: entry.questionCount,
      ordering: "groupedByPattern",
      generationSeed: `${plan.generationSeed}:${entry.knowledgePointId}:${mode}`,
    });
    if (!generation?.ok) {
      errors.push(...(generation?.errors ?? [issue("P09_A03B_OWNER_GENERATION_FAILED")]).map((error) => ({
        ...error,
        path: `${entry.knowledgePointId}.${error.path ?? "generation"}`,
      })));
      continue;
    }
    questions.push(...generation.questions.map((question) => projectAliasQuestion(question, alias)));
  }
  if (questions.length !== plan.questionCount) errors.push(issue("P09_A03B_OUTPUT_COUNT_MISMATCH", "questions"));
  const promptKeys = questions.map((question) => String(question.blankedDisplayText ?? question.promptText ?? question.prompt ?? "").trim());
  if (new Set(promptKeys).size !== promptKeys.length) errors.push(issue("P09_A03B_DUPLICATE_PROMPT", "questions"));
  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    warnings: Object.freeze([]),
    questions: Object.freeze(questions),
    allocation: Object.freeze(allocations),
    knowledgePointAllocation: Object.freeze(allocations),
    plan,
    p09A03BIntegrated: true,
  });
}

export function generateBatchABrowserQuestions(options = {}) {
  if (!requestsP09A03B(options)) return baseGenerate(options);
  const plan = buildIntegratedPlan(options);
  if (isP09A03BSourceRouteAlias(options.sourceId) && plan.selectionMode === "singleKnowledgePoint") {
    return generateIntegrated(options, plan);
  }
  return generateIntegrated(options, plan);
}
