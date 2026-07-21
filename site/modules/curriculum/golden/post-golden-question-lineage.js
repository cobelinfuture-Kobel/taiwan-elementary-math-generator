import {
  getVisiblePatternGroupsForKnowledgePoint,
  listVisibleBatchAKnowledgePoints,
} from "../registry/batch-a-selector-extension.js";

export const POST_GOLDEN_QUESTION_LINEAGE_VERSION = "postg-question-lineage-v1";

function clone(value) {
  if (Array.isArray(value)) return value.map(clone);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, clone(nested)]));
  }
  return value;
}

function issue(code, details = {}) {
  return Object.freeze({ code, severity: "error", path: "questionLineage", ...details });
}

function isPostGoldenRuntime(options = {}) {
  return options.goldenRuntimeConsumer?.descriptorMode === "post_golden_unit_conformance";
}

function buildPatternLineage(sourceId) {
  const errors = [];
  const byPatternSpec = new Map();
  const knowledgePoints = listVisibleBatchAKnowledgePoints()
    .filter((row) => row.sourceId === sourceId);

  for (const knowledgePoint of knowledgePoints) {
    for (const group of getVisiblePatternGroupsForKnowledgePoint(knowledgePoint.knowledgePointId)) {
      if (group.sourceId !== sourceId) continue;
      for (const patternSpecId of group.patternSpecIds ?? []) {
        const current = byPatternSpec.get(patternSpecId);
        const next = {
          sourceId,
          knowledgePointId: knowledgePoint.knowledgePointId,
          patternGroupId: group.patternGroupId,
          patternSpecId,
        };
        if (current && (current.knowledgePointId !== next.knowledgePointId
          || current.patternGroupId !== next.patternGroupId)) {
          errors.push(issue("POSTG_PATTERN_SPEC_LINEAGE_CONFLICT", {
            sourceId,
            patternSpecId,
            current,
            next,
          }));
          continue;
        }
        byPatternSpec.set(patternSpecId, next);
      }
    }
  }

  return { byPatternSpec, knowledgePoints, errors };
}

export function attachPostGoldenQuestionLineage(result = {}, options = {}) {
  if (!isPostGoldenRuntime(options)) return result;
  if (result?.ok !== true) return result;

  const sourceId = options.sourceId ?? result.plan?.sourceId;
  const expectedSourceId = options.goldenRuntimeConsumer?.sourceId;
  const errors = [];
  if (!sourceId || sourceId !== expectedSourceId) {
    errors.push(issue("POSTG_QUESTION_LINEAGE_SOURCE_MISMATCH", {
      sourceId,
      expectedSourceId,
    }));
  }

  const lineage = buildPatternLineage(sourceId);
  errors.push(...lineage.errors);
  const questions = (result.questions ?? []).map((question, index) => {
    const patternSpecId = question.patternSpecId ?? question.metadata?.patternId;
    const binding = lineage.byPatternSpec.get(patternSpecId);
    if (!binding) {
      errors.push(issue("POSTG_QUESTION_PATTERN_UNMAPPED", {
        sourceId,
        patternSpecId,
        questionIndex: index,
      }));
      return clone(question);
    }
    const declaredSourceIds = [question.sourceId, question.metadata?.sourceId]
      .filter((value) => value !== undefined && value !== null && value !== "");
    if (declaredSourceIds.some((declaredSourceId) => declaredSourceId !== sourceId)) {
      errors.push(issue("POSTG_QUESTION_SOURCE_DRIFT", {
        sourceId,
        patternSpecId,
        questionIndex: index,
        declaredSourceIds,
      }));
    }
    return {
      ...clone(question),
      sourceId,
      knowledgePointId: binding.knowledgePointId,
      patternGroupId: binding.patternGroupId,
      resolvedPatternGroupId: binding.patternGroupId,
      metadata: {
        ...clone(question.metadata ?? {}),
        sourceId,
        knowledgePointId: binding.knowledgePointId,
        patternGroupId: binding.patternGroupId,
        patternSpecId,
        goldenContractId: options.goldenRuntimeConsumer.goldenContractId,
        goldenContractVersion: options.goldenRuntimeConsumer.goldenContractVersion,
        goldenConnectionStatus: options.goldenRuntimeConsumer.connectionStatus,
        postGoldenQuestionLineageVersion: POST_GOLDEN_QUESTION_LINEAGE_VERSION,
      },
    };
  });

  const expectedPatternSpecIds = new Set(options.patternSpecIds ?? result.plan?.patternSpecIds ?? []);
  const emittedPatternSpecIds = new Set(questions.map((question) => question.patternSpecId));
  for (const patternSpecId of emittedPatternSpecIds) {
    if (!expectedPatternSpecIds.has(patternSpecId)) {
      errors.push(issue("POSTG_QUESTION_PATTERN_OUTSIDE_RESOLVED_PLAN", { sourceId, patternSpecId }));
    }
  }

  return {
    ...result,
    ok: errors.length === 0,
    errors: [...(result.errors ?? []), ...errors],
    plan: {
      ...clone(result.plan ?? {}),
      goldenRuntimeConsumer: clone(options.goldenRuntimeConsumer),
      sourceUnitAdapter: clone(options.sourceUnitAdapter ?? null),
      postGoldenQuestionLineage: {
        version: POST_GOLDEN_QUESTION_LINEAGE_VERSION,
        sourceId,
        knowledgePointCount: lineage.knowledgePoints.length,
        mappedPatternSpecCount: lineage.byPatternSpec.size,
      },
    },
    questions,
    postGoldenQuestionLineage: {
      version: POST_GOLDEN_QUESTION_LINEAGE_VERSION,
      sourceId,
      questionCount: questions.length,
      mappedPatternSpecCount: emittedPatternSpecIds.size,
      errors: clone(errors),
    },
  };
}

export function auditPostGoldenPatternLineage(sourceId) {
  const lineage = buildPatternLineage(sourceId);
  return Object.freeze({
    ok: lineage.errors.length === 0 && lineage.knowledgePoints.length > 0 && lineage.byPatternSpec.size > 0,
    errors: Object.freeze([...lineage.errors]),
    sourceId,
    knowledgePointCount: lineage.knowledgePoints.length,
    patternSpecCount: lineage.byPatternSpec.size,
    bindings: Object.freeze([...lineage.byPatternSpec.values()].map((row) => Object.freeze({ ...row }))),
  });
}
