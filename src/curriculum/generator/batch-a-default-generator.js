import {
  generateBatchAQuestionFromPatternSpec,
  getBatchAExecutablePatternSpecIds
} from "./batch-a-generator.js";
import {
  BATCH_A_SEMANTIC_GENERATOR_STATUSES,
  generateBatchASemanticQuestionFromPatternSpec,
  getBatchASemanticSamplerPlan
} from "./batch-a-semantic-generator.js";

export const BATCH_A_DEFAULT_GENERATOR_ROUTES = Object.freeze({
  SEMANTIC: "semantic",
  BASE: "base"
});

function createIssue(code, path, message) {
  return { code, severity: "error", path, message };
}

export function resolveBatchADefaultGeneratorRoute(patternSpecId, options = {}) {
  const semanticPlan = getBatchASemanticSamplerPlan(patternSpecId, options);
  if (semanticPlan.ok && semanticPlan.status === BATCH_A_SEMANTIC_GENERATOR_STATUSES.SEMANTIC_EXECUTABLE) {
    return {
      route: BATCH_A_DEFAULT_GENERATOR_ROUTES.SEMANTIC,
      semanticPlan,
      errors: [],
      warnings: []
    };
  }

  return {
    route: BATCH_A_DEFAULT_GENERATOR_ROUTES.BASE,
    semanticPlan,
    errors: [],
    warnings: []
  };
}

export function generateBatchADefaultQuestionFromPatternSpec(patternSpecId, options = {}) {
  const route = resolveBatchADefaultGeneratorRoute(patternSpecId, options);
  const result = route.route === BATCH_A_DEFAULT_GENERATOR_ROUTES.SEMANTIC
    ? generateBatchASemanticQuestionFromPatternSpec(patternSpecId, options)
    : generateBatchAQuestionFromPatternSpec(patternSpecId, options);

  return {
    ...result,
    route: route.route,
    routeWarnings: route.warnings
  };
}

export function generateBatchADefaultQuestionsFromPatternSpec(patternSpecId, count, options = {}) {
  if (!Number.isInteger(count) || count < 1) {
    return {
      ok: false,
      questions: [],
      route: null,
      errors: [createIssue("question_count_invalid", "count", "Question count must be a positive integer.")],
      warnings: []
    };
  }

  const questions = [];
  const errors = [];
  const warnings = [];
  let routeName = null;

  for (let index = 0; index < count; index += 1) {
    const result = generateBatchADefaultQuestionFromPatternSpec(patternSpecId, {
      ...options,
      seed: `${options.seed ?? "batch-a-default"}:${patternSpecId}:${index + 1}`
    });
    routeName = result.route;
    if (!result.ok || !result.question) {
      errors.push(...(result.errors ?? []));
      warnings.push(...(result.warnings ?? []));
      break;
    }
    questions.push(result.question);
    warnings.push(...(result.warnings ?? []));
  }

  return {
    ok: errors.length === 0,
    questions,
    route: routeName,
    errors,
    warnings
  };
}

export function generateBatchADefaultQuestionSet(args = {}) {
  const patternSpecIds = args.patternSpecIds ?? getBatchAExecutablePatternSpecIds();
  const countPerPattern = args.countPerPattern ?? 1;
  const questions = [];
  const errors = [];
  const warnings = [];
  const routeCounts = {
    [BATCH_A_DEFAULT_GENERATOR_ROUTES.SEMANTIC]: 0,
    [BATCH_A_DEFAULT_GENERATOR_ROUTES.BASE]: 0
  };

  for (const patternSpecId of patternSpecIds) {
    const result = generateBatchADefaultQuestionsFromPatternSpec(patternSpecId, countPerPattern, args);
    if (result.route) {
      routeCounts[result.route] += 1;
    }
    if (!result.ok) {
      errors.push(...(result.errors ?? []));
      warnings.push(...(result.warnings ?? []));
      continue;
    }
    questions.push(...result.questions);
    warnings.push(...(result.warnings ?? []));
  }

  return {
    ok: errors.length === 0,
    questions,
    routeCounts,
    errors,
    warnings
  };
}
