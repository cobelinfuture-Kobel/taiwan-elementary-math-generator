import {
  G3B_U04_SEMANTIC_PROMOTION_LIFECYCLE,
  G3B_U04_SEMANTIC_PROMOTION_REGISTRY_ID,
  isS57FPromotedG3BU04SemanticPatternSpecId
} from "../registry/g3b-u04-semantic-promotion.js";
import { getVisiblePatternGroupsForKnowledgePoint } from "../registry/batch-a-selector-extension.js";
import {
  G3B_U04_CANONICAL_ROUTE_KINDS,
  G3B_U04_PRESERVED_NUMERIC_PATTERN_SPEC_ID,
  classifyG3BU04CanonicalRouterPlan
} from "./g3b-u04-canonical-semantic-router.js";
import { G3B_U04_SOURCE_ID } from "./source-pattern-g3b-u04-semantic-extension.js";

export const G3B_U04_PUBLIC_WORKSHEET_MAX_QUESTION_COUNT = 200;

export const G3B_U04_PRODUCTION_WORKSHEET_ELIGIBILITY = Object.freeze({
  task: "S57F5_G3B_U04_CanonicalValidatorWorksheetAndRendererIntegration",
  sourceId: G3B_U04_SOURCE_ID,
  status: "canonical_production_worksheet_eligible",
  resolverDerivedOnly: true,
  publicHiddenModeFlagAllowed: false,
  blockingSemanticValidatorRequired: true,
  questionCountMin: 1,
  questionCountMax: G3B_U04_PUBLIC_WORKSHEET_MAX_QUESTION_COUNT,
  promotionRegistryId: G3B_U04_SEMANTIC_PROMOTION_REGISTRY_ID,
  requiredNextGate: "S57F6_G3B_U04_PublicSelectorAndPrintControlsQA"
});

function issue(code, path, message, details = {}) {
  return { code, severity: "error", path, message, ...details };
}

function visibleGroupIdsForKnowledgePoints(knowledgePointIds = []) {
  const ids = new Set();
  for (const knowledgePointId of knowledgePointIds) {
    for (const group of getVisiblePatternGroupsForKnowledgePoint(knowledgePointId)) {
      if (group?.patternGroupId) ids.add(group.patternGroupId);
    }
  }
  return ids;
}

function lifecycleIsProductionEligible() {
  return G3B_U04_SEMANTIC_PROMOTION_LIFECYCLE.selectorStatus === "visible"
    && G3B_U04_SEMANTIC_PROMOTION_LIFECYCLE.runtimeStatus === "production_routed"
    && G3B_U04_SEMANTIC_PROMOTION_LIFECYCLE.validatorStatus === "blocking_validator_required"
    && G3B_U04_SEMANTIC_PROMOTION_LIFECYCLE.worksheetStatus === "production_eligible"
    && G3B_U04_SEMANTIC_PROMOTION_LIFECYCLE.productionUse === "allowed";
}

export function isG3BU04ProductionWorksheetPlan(plan = {}) {
  if (plan.sourceId !== G3B_U04_SOURCE_ID) return false;
  const routeKind = classifyG3BU04CanonicalRouterPlan(plan);
  return routeKind === G3B_U04_CANONICAL_ROUTE_KINDS.PURE_SEMANTIC
    || routeKind === G3B_U04_CANONICAL_ROUTE_KINDS.NUMERIC_SEMANTIC_HYBRID;
}

export function validateG3BU04ProductionWorksheetEligibility(plan = {}) {
  const errors = [];
  const routeKind = classifyG3BU04CanonicalRouterPlan(plan);
  const allowedRouteKinds = new Set([
    G3B_U04_CANONICAL_ROUTE_KINDS.PURE_SEMANTIC,
    G3B_U04_CANONICAL_ROUTE_KINDS.NUMERIC_SEMANTIC_HYBRID
  ]);

  if (plan.sourceId !== G3B_U04_SOURCE_ID) {
    errors.push(issue(
      "G3B_U04_PRODUCTION_SOURCE_INVALID",
      "sourceId",
      "Production semantic worksheet eligibility is scoped only to G3B-U04."
    ));
  }
  if (!allowedRouteKinds.has(routeKind)) {
    errors.push(issue(
      "G3B_U04_PRODUCTION_ROUTE_INVALID",
      "routeKind",
      "Production semantic worksheet eligibility requires a pure-semantic or numeric-plus-semantic canonical route.",
      { actual: routeKind }
    ));
  }
  if (plan.resolverResult?.ok !== true
    || plan.resolverResult?.provenance?.resolver !== "visiblePatternGroupResolver") {
    errors.push(issue(
      "G3B_U04_PRODUCTION_RESOLVER_REQUIRED",
      "resolverResult",
      "Production semantic worksheet plans must be derived by the visible PatternGroup resolver."
    ));
  }
  if (plan.hiddenSemanticMode !== undefined || plan.g3bU04Semantic === true) {
    errors.push(issue(
      "G3B_U04_PRODUCTION_HIDDEN_MODE_FORBIDDEN",
      "hiddenSemanticMode",
      "Hidden semantic flags are forbidden in the public production worksheet path."
    ));
  }
  if (!Number.isInteger(plan.questionCount)
    || plan.questionCount < 1
    || plan.questionCount > G3B_U04_PUBLIC_WORKSHEET_MAX_QUESTION_COUNT) {
    errors.push(issue(
      "G3B_U04_PRODUCTION_QUESTION_COUNT_INVALID",
      "questionCount",
      `Public worksheet questionCount must be an integer from 1 to ${G3B_U04_PUBLIC_WORKSHEET_MAX_QUESTION_COUNT}.`
    ));
  }
  if (!lifecycleIsProductionEligible()) {
    errors.push(issue(
      "G3B_U04_PRODUCTION_LIFECYCLE_INVALID",
      "promotionLifecycle",
      "The G3B-U04 semantic promotion lifecycle is not production-worksheet eligible."
    ));
  }

  const allocation = Array.isArray(plan.allocation) ? plan.allocation : [];
  const selectedGroupIds = new Set(Array.isArray(plan.selectedPatternGroupIds) ? plan.selectedPatternGroupIds : []);
  const resolverGroupIds = new Set(Array.isArray(plan.resolverResult?.patternGroupIds) ? plan.resolverResult.patternGroupIds : []);
  const resolverPatternSpecIds = new Set(Array.isArray(plan.resolverResult?.patternSpecIds) ? plan.resolverResult.patternSpecIds : []);
  const visibleGroupIds = visibleGroupIdsForKnowledgePoints(plan.selectedKnowledgePointIds ?? []);
  let allocatedCount = 0;
  let semanticCount = 0;
  let numericCount = 0;

  if (allocation.length === 0) {
    errors.push(issue(
      "G3B_U04_PRODUCTION_ALLOCATION_EMPTY",
      "allocation",
      "Production semantic worksheet allocation must not be empty."
    ));
  }

  for (const [index, entry] of allocation.entries()) {
    const path = `allocation[${index}]`;
    if (!Number.isInteger(entry?.questionCount) || entry.questionCount <= 0) {
      errors.push(issue(
        "G3B_U04_PRODUCTION_ALLOCATION_COUNT_INVALID",
        `${path}.questionCount`,
        "Allocation questionCount must be a positive integer."
      ));
      continue;
    }
    allocatedCount += entry.questionCount;

    const isSemantic = isS57FPromotedG3BU04SemanticPatternSpecId(entry.patternSpecId);
    const isNumeric = entry.patternSpecId === G3B_U04_PRESERVED_NUMERIC_PATTERN_SPEC_ID;
    if (isSemantic) semanticCount += entry.questionCount;
    if (isNumeric) numericCount += entry.questionCount;
    if (!isSemantic && !isNumeric) {
      errors.push(issue(
        "G3B_U04_PRODUCTION_PATTERN_NOT_ELIGIBLE",
        `${path}.patternSpecId`,
        "Allocation contains an unpromoted or unsupported G3B-U04 PatternSpec."
      ));
    }
    if (!selectedGroupIds.has(entry.patternGroupId)
      || !resolverGroupIds.has(entry.patternGroupId)
      || !visibleGroupIds.has(entry.patternGroupId)) {
      errors.push(issue(
        "G3B_U04_PRODUCTION_GROUP_NOT_VISIBLE",
        `${path}.patternGroupId`,
        "Allocation PatternGroup must be selected, resolver-derived, and visible for the selected KnowledgePoint."
      ));
    }
    if (!resolverPatternSpecIds.has(entry.patternSpecId)) {
      errors.push(issue(
        "G3B_U04_PRODUCTION_PATTERN_NOT_RESOLVED",
        `${path}.patternSpecId`,
        "Allocation PatternSpec was not derived by the visible resolver."
      ));
    }
  }

  if (allocatedCount !== plan.questionCount) {
    errors.push(issue(
      "G3B_U04_PRODUCTION_ALLOCATION_MISMATCH",
      "allocation",
      "Production worksheet allocation does not equal the requested question count.",
      { expected: plan.questionCount, actual: allocatedCount }
    ));
  }
  if (semanticCount <= 0) {
    errors.push(issue(
      "G3B_U04_PRODUCTION_SEMANTIC_PARTITION_MISSING",
      "allocation",
      "Production semantic worksheet routes must contain at least one promoted semantic question."
    ));
  }
  if (routeKind === G3B_U04_CANONICAL_ROUTE_KINDS.PURE_SEMANTIC && numericCount > 0) {
    errors.push(issue(
      "G3B_U04_PRODUCTION_NUMERIC_PARTITION_UNEXPECTED",
      "allocation",
      "Pure semantic worksheet routes cannot contain the preserved numeric PatternSpec."
    ));
  }
  if (routeKind === G3B_U04_CANONICAL_ROUTE_KINDS.NUMERIC_SEMANTIC_HYBRID && numericCount <= 0) {
    errors.push(issue(
      "G3B_U04_PRODUCTION_NUMERIC_PARTITION_MISSING",
      "allocation",
      "Numeric-plus-semantic worksheet routes require the preserved numeric PatternSpec."
    ));
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings: [],
    routeKind,
    promotionRegistryId: G3B_U04_SEMANTIC_PROMOTION_REGISTRY_ID,
    eligibilityVersion: "s57f5-g3b-u04-production-worksheet-v1"
  };
}
