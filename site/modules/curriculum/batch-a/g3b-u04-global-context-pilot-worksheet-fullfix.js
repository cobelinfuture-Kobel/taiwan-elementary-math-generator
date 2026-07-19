import {
  buildG3BU04GlobalContextPilotWorksheet as buildCoreWorksheet,
  createG3BU04GlobalContextPilotOptions as createCoreOptions,
  G3B_U04_GLOBAL_CONTEXT_PILOT_WORKSHEET as CORE_WORKSHEET
} from "./g3b-u04-global-context-pilot-worksheet.js";

export const G3B_U04_GLOBAL_CONTEXT_PILOT_RESOLVER_FAMILY_COUNT = 5;
export const G3B_U04_GLOBAL_CONTEXT_PILOT_VARIANT_COUNT = 5;
export const G3B_U04_GLOBAL_CONTEXT_PILOT_WORKSHEET_QUESTION_COUNT =
  G3B_U04_GLOBAL_CONTEXT_PILOT_RESOLVER_FAMILY_COUNT
  * G3B_U04_GLOBAL_CONTEXT_PILOT_VARIANT_COUNT;

export const G3B_U04_GLOBAL_CONTEXT_PILOT_WORKSHEET = Object.freeze({
  ...CORE_WORKSHEET,
  version: "gctx-p12r-production-equivalent-worksheet-fullfix-v2",
  resolverFamilyCount: G3B_U04_GLOBAL_CONTEXT_PILOT_RESOLVER_FAMILY_COUNT,
  variantCount: G3B_U04_GLOBAL_CONTEXT_PILOT_VARIANT_COUNT,
  worksheetQuestionCount: G3B_U04_GLOBAL_CONTEXT_PILOT_WORKSHEET_QUESTION_COUNT,
  allocationRule: "five_questions_per_visible_patternspec_family"
});

export function createG3BU04GlobalContextPilotOptions(overrides = {}) {
  const options = createCoreOptions({
    ...overrides,
    questionCount: G3B_U04_GLOBAL_CONTEXT_PILOT_WORKSHEET_QUESTION_COUNT
  });
  return {
    ...options,
    questionCount: G3B_U04_GLOBAL_CONTEXT_PILOT_WORKSHEET_QUESTION_COUNT,
    globalContextPilot: {
      ...options.globalContextPilot,
      resolverFamilyCount: G3B_U04_GLOBAL_CONTEXT_PILOT_RESOLVER_FAMILY_COUNT,
      expectedTargetQuestionCount: G3B_U04_GLOBAL_CONTEXT_PILOT_VARIANT_COUNT
    }
  };
}

export function buildG3BU04GlobalContextPilotWorksheet(overrides = {}) {
  const result = buildCoreWorksheet({
    ...overrides,
    questionCount: G3B_U04_GLOBAL_CONTEXT_PILOT_WORKSHEET_QUESTION_COUNT
  });
  if (!result.ok) return result;

  const resolverPatternSpecIds = result.baselineWorksheetDocument?.batchA?.resolverResult?.patternSpecIds
    ?? result.baselineWorksheetDocument?.provenance?.patternSpecIds
    ?? [];
  const targetCount = result.targetQuestionIndexes.length;
  const errors = [];
  if (targetCount !== G3B_U04_GLOBAL_CONTEXT_PILOT_VARIANT_COUNT) {
    errors.push({
      code: "GCTX_P12R_FULLFIX_TARGET_COUNT_INVALID",
      severity: "error",
      stage: "global_context_pilot_runtime",
      path: "targetQuestionIndexes",
      message: "The production-equivalent resolver must allocate exactly five target questions.",
      expected: G3B_U04_GLOBAL_CONTEXT_PILOT_VARIANT_COUNT,
      actual: targetCount
    });
  }
  if (result.options.questionCount !== G3B_U04_GLOBAL_CONTEXT_PILOT_WORKSHEET_QUESTION_COUNT) {
    errors.push({
      code: "GCTX_P12R_FULLFIX_WORKSHEET_COUNT_INVALID",
      severity: "error",
      stage: "global_context_pilot_runtime",
      path: "options.questionCount",
      message: "The fullfix worksheet count must preserve five questions per visible PatternSpec family.",
      expected: G3B_U04_GLOBAL_CONTEXT_PILOT_WORKSHEET_QUESTION_COUNT,
      actual: result.options.questionCount
    });
  }
  if (errors.length > 0) {
    return {
      ...result,
      ok: false,
      pilotWorksheetDocument: null,
      errors: [...result.errors, ...errors]
    };
  }
  return {
    ...result,
    options: createG3BU04GlobalContextPilotOptions(overrides),
    resolverFamilyCount: G3B_U04_GLOBAL_CONTEXT_PILOT_RESOLVER_FAMILY_COUNT,
    resolverPatternSpecIds,
    expectedTargetQuestionCount: G3B_U04_GLOBAL_CONTEXT_PILOT_VARIANT_COUNT,
    worksheetIntegration: G3B_U04_GLOBAL_CONTEXT_PILOT_WORKSHEET
  };
}
