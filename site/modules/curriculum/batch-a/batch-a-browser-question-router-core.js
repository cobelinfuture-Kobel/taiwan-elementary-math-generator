import { buildBatchABrowserPlan } from "./batch-a-browser-generator.js";
import { generateBatchABrowserQuestions as generateDefaultBatchABrowserQuestions } from "./g3a-u06-division-ordering-generator.js";
import { generateG3AU02OutputQualityQuestions, isG3AU02OutputQualityPlan } from "./g3a-u02-output-quality-generator.js";
import { canGenerateG4AU01Phase1Questions, generateBatchABrowserQuestions as generateG4AU01Phase1Questions } from "./g4a-u01-phase3-runtime-fix-generator.js";
import { canGenerateG4AU02NumericQuestions, generateG4AU02NumericQuestions } from "./g4a-u02-numeric-generator.js";
import { canGenerateG4AU04DivisionQuestions, generateG4AU04DivisionQuestions } from "./g4a-u04-division-generator.js";
import { canGenerateG4AU08ApplicationQuestions, generateG4AU08ApplicationQuestions } from "./g4a-u08-application-generator.js";
import { canGenerateG4AU08ExpressionQuestions, generateG4AU08ExpressionQuestions } from "./g4a-u08-expression-generator.js";
import { G4A_U08_PATTERN_SPEC_IDS } from "./source-pattern-g4a-u08-extension.js";
import { G4A_U08_SOURCE_ID, isG4AU08Phase2APatternSpecId } from "./source-pattern-g4a-u08-phase2a-extension.js";
import { getVisiblePatternGroupsForKnowledgePoint } from "../registry/batch-a-selector-extension.js";
import {
  G3B_U04_CANONICAL_ROUTE_KINDS,
  G3B_U04_PRESERVED_NUMERIC_PATTERN_SPEC_ID,
  buildG3BU04CanonicalSemanticSubplan,
  classifyG3BU04CanonicalRouterPlan,
  generateG3BU04CanonicalSemanticQuestions
} from "./g3b-u04-canonical-semantic-router.js";
import {
  G3B_U08_CANONICAL_ROUTE_KINDS,
  classifyG3BU08CanonicalRouterPlan,
  generateG3BU08CanonicalSemanticQuestions
} from "./g3b-u08-canonical-semantic-router.js";
import {
  G4B_U01_CANONICAL_ROUTE_KINDS,
  classifyG4BU01CanonicalRouterPlan,
  generateG4BU01CanonicalHorizontalQuestions,
  normalizeG4BU01ResolverPlan
} from "./g4b-u01-canonical-horizontal-router.js";

function issue(code, path, message, details = {}) {
  return { code, severity: "error", path, message, ...details };
}

function cloneValue(value) {
  if (Array.isArray(value)) return value.map((item) => cloneValue(item));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, cloneValue(nested)]));
  }
  return value;
}

function hashSeed(value) {
  let acc = 0;
  for (const char of String(value ?? "default")) acc = ((acc * 31) + char.charCodeAt(0)) >>> 0;
  return acc || 1;
}

function mix32(value) {
  let mixed = value >>> 0;
  mixed = Math.imul(mixed ^ (mixed >>> 16), 0x7feb352d);
  mixed = Math.imul(mixed ^ (mixed >>> 15), 0x846ca68b);
  return (mixed ^ (mixed >>> 16)) >>> 0;
}

function shuffleQuestions(questions, seed) {
  const shuffled = [...questions];
  let seedValue = hashSeed(seed);
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    seedValue = mix32(seedValue + index);
    const swapIndex = seedValue % (index + 1);
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function isG4AU08NumericPatternSpecId(patternSpecId) {
  return G4A_U08_PATTERN_SPEC_IDS.includes(patternSpecId);
}

function isG3BU04NumericPatternSpecId(patternSpecId) {
  return patternSpecId === G3B_U04_PRESERVED_NUMERIC_PATTERN_SPEC_ID;
}

function groupIdsForKps(kpIds = []) {
  const pairs = [];
  for (const knowledgePointId of kpIds) {
    for (const group of getVisiblePatternGroupsForKnowledgePoint(knowledgePointId)) pairs.push({ knowledgePointId, patternGroupId: group.patternGroupId });
  }
  return pairs;
}

function filterOptionsForPatternKind(options, plan, predicate, questionCount) {
  const allocation = (plan.allocation ?? []).filter((entry) => predicate(entry.patternSpecId));
  const groupIdSet = new Set(allocation.map((entry) => entry.patternGroupId));
  const kpIds = groupIdsForKps(plan.selectedKnowledgePointIds ?? options.selectedKnowledgePointIds ?? [])
    .filter((pair) => groupIdSet.has(pair.patternGroupId))
    .map((pair) => pair.knowledgePointId);
  return {
    ...options,
    questionCount,
    selectedKnowledgePointIds: [...new Set(kpIds)],
    selectedPatternGroupIds: [...groupIdSet]
  };
}

function isG4AU08HybridPlan(plan = {}) {
  if (plan.sourceId !== G4A_U08_SOURCE_ID || !Array.isArray(plan.allocation)) return false;
  const hasApplication = plan.allocation.some((entry) => isG4AU08Phase2APatternSpecId(entry.patternSpecId));
  const hasNumeric = plan.allocation.some((entry) => isG4AU08NumericPatternSpecId(entry.patternSpecId));
  return hasApplication && hasNumeric;
}

function generateG4AU08HybridQuestions(options, plan) {
  const numericCount = plan.allocation.filter((entry) => isG4AU08NumericPatternSpecId(entry.patternSpecId)).reduce((sum, entry) => sum + entry.questionCount, 0);
  const applicationCount = plan.allocation.filter((entry) => isG4AU08Phase2APatternSpecId(entry.patternSpecId)).reduce((sum, entry) => sum + entry.questionCount, 0);
  const numeric = generateG4AU08ExpressionQuestions(filterOptionsForPatternKind(options, plan, isG4AU08NumericPatternSpecId, numericCount));
  const application = generateG4AU08ApplicationQuestions(filterOptionsForPatternKind(options, plan, isG4AU08Phase2APatternSpecId, applicationCount));
  const errors = [...(numeric.errors ?? []), ...(application.errors ?? [])];
  const warnings = [...(numeric.warnings ?? []), ...(application.warnings ?? [])];
  const questions = [...(numeric.questions ?? []), ...(application.questions ?? [])].map((question, index) => ({ ...question, id: `${question.patternSpecId}-${index + 1}` }));
  const orderedQuestions = plan.ordering === "shuffleAcrossPatterns"
    ? shuffleQuestions(questions, `${plan.generationSeed}:g4a-u08-hybrid:${plan.questionCount}`)
    : questions;
  return {
    ok: numeric.ok === true && application.ok === true && errors.length === 0,
    plan,
    questions: orderedQuestions,
    allocation: [...(numeric.allocation ?? []), ...(application.allocation ?? [])],
    errors,
    warnings
  };
}

function invalidG3BU08CanonicalResult(plan) {
  const resolverErrors = Array.isArray(plan.resolverResult?.errors) ? plan.resolverResult.errors : [];
  const errors = resolverErrors.length > 0
    ? resolverErrors.map((entry) => issue(
      entry.code ?? "G3B_U08_CANONICAL_SCOPE_INVALID",
      "resolverResult",
      `G3B-U08 canonical selection was rejected by the visible resolver: ${entry.code ?? "unknown"}.`
    ))
    : [issue(
      "G3B_U08_CANONICAL_SCOPE_INVALID",
      "allocation",
      "G3B-U08 canonical selection contains an invalid or unpromoted semantic scope."
    )];
  return {
    ok: false,
    plan,
    questions: [],
    allocation: cloneValue(plan.allocation ?? []),
    errors,
    warnings: cloneValue(plan.resolverResult?.warnings ?? [])
  };
}

function invalidG3BU04CanonicalResult(plan) {
  const resolverErrors = Array.isArray(plan.resolverResult?.errors) ? plan.resolverResult.errors : [];
  const errors = resolverErrors.length > 0
    ? resolverErrors.map((entry) => issue(
      entry.code ?? "G3B_U04_CANONICAL_SCOPE_INVALID",
      "resolverResult",
      `G3B-U04 canonical selection was rejected by the visible resolver: ${entry.code ?? "unknown"}.`
    ))
    : [issue(
      "G3B_U04_CANONICAL_SCOPE_INVALID",
      "allocation",
      "G3B-U04 canonical selection contains an invalid or unpromoted semantic scope."
    )];
  return {
    ok: false,
    plan,
    questions: [],
    allocation: cloneValue(plan.allocation ?? []),
    errors,
    warnings: cloneValue(plan.resolverResult?.warnings ?? [])
  };
}

function invalidG4BU01CanonicalResult(plan) {
  const resolverErrors = Array.isArray(plan.resolverResult?.errors) ? plan.resolverResult.errors : [];
  const errors = resolverErrors.length > 0
    ? resolverErrors.map((entry) => issue(
      entry.code ?? "G4B_U01_CANONICAL_SCOPE_INVALID",
      "resolverResult",
      `G4B-U01 canonical selection was rejected by the visible resolver: ${entry.code ?? "unknown"}.`
    ))
    : [issue(
      "G4B_U01_CANONICAL_SCOPE_INVALID",
      "allocation",
      "G4B-U01 canonical selection contains an invalid or unpromoted horizontal scope."
    )];
  return {
    ok: false,
    plan,
    questions: [],
    allocation: cloneValue(plan.allocation ?? []),
    errors,
    warnings: cloneValue(plan.resolverResult?.warnings ?? [])
  };
}

function questionsInAllocationOrder(plan, questionSets) {
  const buckets = new Map();
  for (const question of questionSets.flat()) {
    const bucket = buckets.get(question.patternSpecId) ?? [];
    bucket.push(question);
    buckets.set(question.patternSpecId, bucket);
  }
  const output = [];
  for (const entry of plan.allocation ?? []) {
    const bucket = buckets.get(entry.patternSpecId) ?? [];
    output.push(...bucket.splice(0, entry.questionCount));
  }
  for (const bucket of buckets.values()) output.push(...bucket);
  return output;
}

function attachG3BU04HybridRouteMetadata(question, plan, index) {
  const semantic = question.kind === "g3bU04SemanticWordProblem";
  return {
    ...question,
    id: `${question.patternSpecId}-${index + 1}`,
    canonicalRoute: {
      ...(question.canonicalRoute ?? {}),
      kind: G3B_U04_CANONICAL_ROUTE_KINDS.NUMERIC_SEMANTIC_HYBRID,
      runtimeKind: semantic ? "semantic" : "numeric",
      resolver: plan.resolverResult?.provenance?.resolver ?? null,
      allocationStrategy: plan.resolverResult?.provenance?.allocationStrategy ?? null,
      publicHiddenModeFlagUsed: false
    }
  };
}

function generateG3BU04HybridQuestions(options, plan) {
  const numericCount = plan.allocation
    .filter((entry) => isG3BU04NumericPatternSpecId(entry.patternSpecId))
    .reduce((sum, entry) => sum + entry.questionCount, 0);
  const semanticPlan = {
    ...buildG3BU04CanonicalSemanticSubplan(plan),
    ordering: "groupedByPattern"
  };
  const semantic = generateG3BU04CanonicalSemanticQuestions(semanticPlan);
  const numeric = generateDefaultBatchABrowserQuestions(
    filterOptionsForPatternKind(options, plan, isG3BU04NumericPatternSpecId, numericCount)
  );
  const errors = [...(numeric.errors ?? []), ...(semantic.errors ?? [])];
  const warnings = [...(numeric.warnings ?? []), ...(semantic.warnings ?? [])];

  if (numeric.ok !== true || semantic.ok !== true || errors.length > 0) {
    return {
      ok: false,
      plan,
      questions: [],
      allocation: cloneValue(plan.allocation ?? []),
      errors,
      warnings
    };
  }

  const groupedQuestions = questionsInAllocationOrder(plan, [numeric.questions ?? [], semantic.questions ?? []])
    .map((question, index) => attachG3BU04HybridRouteMetadata(question, plan, index));
  const orderedQuestions = plan.ordering === "shuffleAcrossPatterns"
    ? shuffleQuestions(groupedQuestions, `${plan.generationSeed}:g3b-u04-hybrid:${plan.questionCount}`)
    : groupedQuestions;
  if (orderedQuestions.length !== plan.questionCount) {
    return {
      ok: false,
      plan,
      questions: [],
      allocation: cloneValue(plan.allocation ?? []),
      errors: [issue(
        "G3B_U04_CANONICAL_OUTPUT_COUNT_MISMATCH",
        "questions",
        "G3B-U04 hybrid output count does not match the resolver allocation.",
        { expected: plan.questionCount, actual: orderedQuestions.length }
      )],
      warnings
    };
  }

  return {
    ok: true,
    plan: { ...plan, routeKind: G3B_U04_CANONICAL_ROUTE_KINDS.NUMERIC_SEMANTIC_HYBRID },
    questions: orderedQuestions,
    allocation: cloneValue(plan.allocation),
    errors: [],
    warnings
  };
}

export function generateBatchABrowserQuestions(options = {}) {
  const plan = buildBatchABrowserPlan(options);
  const g4bU01Plan = normalizeG4BU01ResolverPlan(plan);
  const g4bU01RouteKind = classifyG4BU01CanonicalRouterPlan(g4bU01Plan);
  if (g4bU01RouteKind === G4B_U01_CANONICAL_ROUTE_KINDS.INVALID_HORIZONTAL_SCOPE) {
    return invalidG4BU01CanonicalResult(g4bU01Plan);
  }
  if (g4bU01RouteKind === G4B_U01_CANONICAL_ROUTE_KINDS.PURE_HORIZONTAL) {
    return generateG4BU01CanonicalHorizontalQuestions(g4bU01Plan);
  }
  const g3bU08RouteKind = classifyG3BU08CanonicalRouterPlan(plan);
  if (g3bU08RouteKind === G3B_U08_CANONICAL_ROUTE_KINDS.INVALID_SEMANTIC_SCOPE) {
    return invalidG3BU08CanonicalResult(plan);
  }
  if (g3bU08RouteKind === G3B_U08_CANONICAL_ROUTE_KINDS.PURE_SEMANTIC) {
    return generateG3BU08CanonicalSemanticQuestions(plan);
  }
  const g3bU04RouteKind = classifyG3BU04CanonicalRouterPlan(plan);
  if (g3bU04RouteKind === G3B_U04_CANONICAL_ROUTE_KINDS.INVALID_SEMANTIC_SCOPE) {
    return invalidG3BU04CanonicalResult(plan);
  }
  if (g3bU04RouteKind === G3B_U04_CANONICAL_ROUTE_KINDS.PURE_SEMANTIC) {
    return generateG3BU04CanonicalSemanticQuestions({
      ...buildG3BU04CanonicalSemanticSubplan(plan),
      routeKind: G3B_U04_CANONICAL_ROUTE_KINDS.PURE_SEMANTIC
    });
  }
  if (g3bU04RouteKind === G3B_U04_CANONICAL_ROUTE_KINDS.NUMERIC_SEMANTIC_HYBRID) {
    return generateG3BU04HybridQuestions(options, plan);
  }
  if (isG3AU02OutputQualityPlan(plan)) return generateG3AU02OutputQualityQuestions(options);
  if (canGenerateG4AU01Phase1Questions(plan)) return generateG4AU01Phase1Questions(options);
  if (canGenerateG4AU02NumericQuestions(options)) return generateG4AU02NumericQuestions(options);
  if (canGenerateG4AU04DivisionQuestions(options)) return generateG4AU04DivisionQuestions(options);
  if (isG4AU08HybridPlan(plan)) return generateG4AU08HybridQuestions(options, plan);
  if (canGenerateG4AU08ApplicationQuestions(plan)) return generateG4AU08ApplicationQuestions(options);
  if (canGenerateG4AU08ExpressionQuestions(options)) return generateG4AU08ExpressionQuestions(options);
  return generateDefaultBatchABrowserQuestions(options);
}
