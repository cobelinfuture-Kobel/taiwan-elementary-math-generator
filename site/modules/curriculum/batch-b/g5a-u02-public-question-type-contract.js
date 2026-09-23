import { getG5AU02HiddenPatternSpecs } from "./source-pattern-g5a-u02-extension.js";

export const G5A_U02_PUBLIC_QUESTION_TYPES = Object.freeze({
  MIXED: "mixed",
  CONCEPT: "concept",
  NUMERIC: "numeric",
  APPLICATION: "application",
  REASONING: "reasoning",
});

export const G5A_U02_PUBLIC_QUESTION_TYPE_OPTIONS = Object.freeze([
  Object.freeze({ value: "mixed", label: "數字、應用與推理混合" }),
  Object.freeze({ value: "concept", label: "概念與判斷" }),
  Object.freeze({ value: "numeric", label: "數字題" }),
  Object.freeze({ value: "application", label: "應用題" }),
  Object.freeze({ value: "reasoning", label: "推理題" }),
]);

const MODE_TO_PUBLIC_TYPE = Object.freeze({
  concept: G5A_U02_PUBLIC_QUESTION_TYPES.CONCEPT,
  representation: G5A_U02_PUBLIC_QUESTION_TYPES.CONCEPT,
  numeric: G5A_U02_PUBLIC_QUESTION_TYPES.NUMERIC,
  application: G5A_U02_PUBLIC_QUESTION_TYPES.APPLICATION,
  geometry_application: G5A_U02_PUBLIC_QUESTION_TYPES.APPLICATION,
  reasoning: G5A_U02_PUBLIC_QUESTION_TYPES.REASONING,
  reasoning_application: G5A_U02_PUBLIC_QUESTION_TYPES.REASONING,
});

const specs = Object.freeze(getG5AU02HiddenPatternSpecs().map((spec) => Object.freeze({
  patternSpecId: spec.patternSpecId,
  mode: spec.binding?.mode ?? spec.mode,
  publicQuestionType: MODE_TO_PUBLIC_TYPE[spec.binding?.mode ?? spec.mode] ?? null,
})));
const specById = new Map(specs.map((row) => [row.patternSpecId, row]));
const allowedTypes = new Set(Object.values(G5A_U02_PUBLIC_QUESTION_TYPES));

export const G5A_U02_PUBLIC_QUESTION_TYPE_CONTRACT = Object.freeze({
  task: "S96K_G5A_U02_QuestionTypeContract",
  sourceId: "g5a_u02_5a02",
  status: "contract_complete_pending_ui_integration",
  defaultValue: G5A_U02_PUBLIC_QUESTION_TYPES.MIXED,
  options: G5A_U02_PUBLIC_QUESTION_TYPE_OPTIONS,
  patternSpecCount: specs.length,
  mappingPolicy: Object.freeze({
    concept: Object.freeze(["concept", "representation"]),
    numeric: Object.freeze(["numeric"]),
    application: Object.freeze(["application", "geometry_application"]),
    reasoning: Object.freeze(["reasoning", "reasoning_application"]),
  }),
  genericFallback: false,
  freeFormAI: false,
});

export function normalizeG5AU02PublicQuestionType(value) {
  return allowedTypes.has(value) ? value : G5A_U02_PUBLIC_QUESTION_TYPES.MIXED;
}

export function getG5AU02PatternPublicQuestionType(patternSpecId) {
  return specById.get(patternSpecId)?.publicQuestionType ?? null;
}

export function filterG5AU02PatternSpecIdsByQuestionType(patternSpecIds = [], questionType = "mixed") {
  const normalized = normalizeG5AU02PublicQuestionType(questionType);
  const uniqueIds = [...new Set(Array.isArray(patternSpecIds) ? patternSpecIds : [])];
  if (normalized === G5A_U02_PUBLIC_QUESTION_TYPES.MIXED) return Object.freeze(uniqueIds);
  return Object.freeze(uniqueIds.filter((patternSpecId) => getG5AU02PatternPublicQuestionType(patternSpecId) === normalized));
}

export function auditG5AU02PublicQuestionTypeContract() {
  const errors = [];
  if (specs.length !== 22) errors.push("G5AU02_QUESTION_TYPE_PATTERN_COUNT_MISMATCH");
  if (specs.some((row) => !row.publicQuestionType)) errors.push("G5AU02_QUESTION_TYPE_MAPPING_MISSING");
  const ids = specs.map((row) => row.patternSpecId);
  if (new Set(ids).size !== ids.length) errors.push("G5AU02_QUESTION_TYPE_PATTERN_DUPLICATE");
  const covered = new Set(specs.map((row) => row.publicQuestionType));
  for (const type of ["concept", "numeric", "application", "reasoning"]) {
    if (!covered.has(type)) errors.push(`G5AU02_QUESTION_TYPE_CATEGORY_EMPTY:${type}`);
  }
  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    patternSpecCount: specs.length,
    mappedPatternSpecCount: specs.filter((row) => row.publicQuestionType).length,
    countsByType: Object.freeze(Object.fromEntries(
      ["concept", "numeric", "application", "reasoning"].map((type) => [
        type,
        specs.filter((row) => row.publicQuestionType === type).length,
      ]),
    )),
  });
}
