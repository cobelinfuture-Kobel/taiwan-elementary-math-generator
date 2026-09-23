import {
  G3B_U08_SEMANTIC_PROMOTION_REGISTRY_ID,
  isS58FPromotedG3BU08SemanticPatternSpecId
} from "../registry/g3b-u08-semantic-promotion.js";
import {
  G3B_U08_PRODUCTION_PROMOTION_LIFECYCLE,
  G3B_U08_PRODUCTION_PROMOTION_OVERLAY_ID
} from "../registry/g3b-u08-semantic-production-promotion.js";
import { getVisiblePatternGroupsForKnowledgePoint } from "../registry/batch-a-selector-extension.js";
import {
  G3B_U08_CANONICAL_ROUTE_KINDS,
  classifyG3BU08CanonicalRouterPlan
} from "./g3b-u08-canonical-semantic-router.js";
import { G3B_U08_SOURCE_ID } from "./source-pattern-g3b-u08-semantic-extension.js";

export const G3B_U08_PUBLIC_WORKSHEET_MAX_QUESTION_COUNT = 200;

export const G3B_U08_PRODUCTION_WORKSHEET_ELIGIBILITY = Object.freeze({
  task: "S58H_G3B_U08_CanonicalValidatorWorksheetAndRendererIntegration",
  sourceId: G3B_U08_SOURCE_ID,
  status: "canonical_production_worksheet_eligible",
  resolverDerivedOnly: true,
  applicationOnly: true,
  horizontalOnly: true,
  publicNumericModeAllowed: false,
  representationToggleAllowed: false,
  publicHiddenModeFlagAllowed: false,
  blockingSemanticValidatorRequired: true,
  questionCountMin: 1,
  questionCountMax: G3B_U08_PUBLIC_WORKSHEET_MAX_QUESTION_COUNT,
  basePromotionRegistryId: G3B_U08_SEMANTIC_PROMOTION_REGISTRY_ID,
  productionPromotionOverlayId: G3B_U08_PRODUCTION_PROMOTION_OVERLAY_ID,
  requiredNextGate: "S58I_G3B_U08_PublicSelectorAndPrintControlsQA"
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
  return G3B_U08_PRODUCTION_PROMOTION_LIFECYCLE.selectorStatus === "visible"
    && G3B_U08_PRODUCTION_PROMOTION_LIFECYCLE.runtimeStatus === "production_routed"
    && G3B_U08_PRODUCTION_PROMOTION_LIFECYCLE.validatorStatus === "blocking_validator_required"
    && G3B_U08_PRODUCTION_PROMOTION_LIFECYCLE.worksheetStatus === "production_eligible"
    && G3B_U08_PRODUCTION_PROMOTION_LIFECYCLE.productionUse === "allowed";
}

export function isG3BU08ProductionWorksheetPlan(plan = {}) {
  return plan.sourceId === G3B_U08_SOURCE_ID
    && classifyG3BU08CanonicalRouterPlan(plan) === G3B_U08_CANONICAL_ROUTE_KINDS.PURE_SEMANTIC;
}

export function validateG3BU08ProductionWorksheetEligibility(plan = {}) {
  const errors = [];
  const routeKind = classifyG3BU08CanonicalRouterPlan(plan);

  if (plan.sourceId !== G3B_U08_SOURCE_ID) {
    errors.push(issue("G3B_U08_PRODUCTION_SOURCE_INVALID", "sourceId", "Production worksheet eligibility is scoped only to G3B-U08."));
  }
  if (routeKind !== G3B_U08_CANONICAL_ROUTE_KINDS.PURE_SEMANTIC) {
    errors.push(issue("G3B_U08_PRODUCTION_ROUTE_INVALID", "routeKind", "G3B-U08 production worksheets require the pure semantic canonical route.", { actual: routeKind }));
  }
  if (plan.resolverResult?.ok !== true || plan.resolverResult?.provenance?.resolver !== "visiblePatternGroupResolver") {
    errors.push(issue("G3B_U08_PRODUCTION_RESOLVER_REQUIRED", "resolverResult", "Production worksheet plans must be derived by the visible PatternGroup resolver."));
  }
  if (plan.hiddenSemanticMode !== undefined || plan.g3bU08Semantic === true || plan.representationMode !== undefined) {
    errors.push(issue("G3B_U08_PRODUCTION_HIDDEN_OR_REPRESENTATION_MODE_FORBIDDEN", "selectionMode", "Hidden semantic and representation-mode flags are forbidden for this application-only unit."));
  }
  if (!Number.isInteger(plan.questionCount) || plan.questionCount < 1 || plan.questionCount > G3B_U08_PUBLIC_WORKSHEET_MAX_QUESTION_COUNT) {
    errors.push(issue("G3B_U08_PRODUCTION_QUESTION_COUNT_INVALID", "questionCount", `Public worksheet questionCount must be an integer from 1 to ${G3B_U08_PUBLIC_WORKSHEET_MAX_QUESTION_COUNT}.`));
  }
  if (!lifecycleIsProductionEligible()) {
    errors.push(issue("G3B_U08_PRODUCTION_LIFECYCLE_INVALID", "promotionLifecycle", "The S58H production worksheet promotion overlay is not eligible."));
  }

  const allocation = Array.isArray(plan.allocation) ? plan.allocation : [];
  const selectedGroupIds = new Set(Array.isArray(plan.selectedPatternGroupIds) ? plan.selectedPatternGroupIds : []);
  const resolverGroupIds = new Set(Array.isArray(plan.resolverResult?.patternGroupIds) ? plan.resolverResult.patternGroupIds : []);
  const resolverPatternSpecIds = new Set(Array.isArray(plan.resolverResult?.patternSpecIds) ? plan.resolverResult.patternSpecIds : []);
  const visibleGroupIds = visibleGroupIdsForKnowledgePoints(plan.selectedKnowledgePointIds ?? []);
  let allocatedCount = 0;

  if (allocation.length === 0) {
    errors.push(issue("G3B_U08_PRODUCTION_ALLOCATION_EMPTY", "allocation", "Production worksheet allocation must not be empty."));
  }

  for (const [index, entry] of allocation.entries()) {
    const path = `allocation[${index}]`;
    if (!Number.isInteger(entry?.questionCount) || entry.questionCount <= 0) {
      errors.push(issue("G3B_U08_PRODUCTION_ALLOCATION_COUNT_INVALID", `${path}.questionCount`, "Allocation questionCount must be a positive integer."));
      continue;
    }
    allocatedCount += entry.questionCount;
    if (!isS58FPromotedG3BU08SemanticPatternSpecId(entry.patternSpecId)) {
      errors.push(issue("G3B_U08_PRODUCTION_PATTERN_NOT_ELIGIBLE", `${path}.patternSpecId`, "Allocation contains an unpromoted or unsupported G3B-U08 PatternSpec."));
    }
    if (!selectedGroupIds.has(entry.patternGroupId) || !resolverGroupIds.has(entry.patternGroupId) || !visibleGroupIds.has(entry.patternGroupId)) {
      errors.push(issue("G3B_U08_PRODUCTION_GROUP_NOT_VISIBLE", `${path}.patternGroupId`, "Allocation PatternGroup must be selected, resolver-derived, and visible."));
    }
    if (!resolverPatternSpecIds.has(entry.patternSpecId)) {
      errors.push(issue("G3B_U08_PRODUCTION_PATTERN_NOT_RESOLVED", `${path}.patternSpecId`, "Allocation PatternSpec was not derived by the visible resolver."));
    }
  }

  if (allocatedCount !== plan.questionCount) {
    errors.push(issue("G3B_U08_PRODUCTION_ALLOCATION_MISMATCH", "allocation", "Production worksheet allocation does not equal the requested question count.", { expected: plan.questionCount, actual: allocatedCount }));
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings: [],
    routeKind,
    basePromotionRegistryId: G3B_U08_SEMANTIC_PROMOTION_REGISTRY_ID,
    promotionRegistryId: G3B_U08_PRODUCTION_PROMOTION_OVERLAY_ID,
    eligibilityVersion: "s58h-g3b-u08-production-worksheet-v1"
  };
}
