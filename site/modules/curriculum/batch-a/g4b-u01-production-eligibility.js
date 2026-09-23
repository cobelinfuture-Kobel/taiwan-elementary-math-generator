import {
  G4B_U01_HORIZONTAL_PROMOTION_REGISTRY_ID,
  isS59FPromotedG4BU01PatternSpecId,
} from "../registry/g4b-u01-horizontal-promotion.js";
import {
  G4B_U01_PRODUCTION_PROMOTION_LIFECYCLE,
  G4B_U01_PRODUCTION_PROMOTION_OVERLAY_ID,
} from "../registry/g4b-u01-horizontal-production-promotion.js";
import { getVisiblePatternGroupsForKnowledgePoint } from "../registry/batch-a-selector-extension.js";
import {
  G4B_U01_CANONICAL_ROUTE_KINDS,
  classifyG4BU01CanonicalRouterPlan,
  normalizeG4BU01ResolverPlan,
} from "./g4b-u01-canonical-horizontal-router.js";

export const G4B_U01_PUBLIC_WORKSHEET_MAX_QUESTION_COUNT = 200;

export const G4B_U01_PRODUCTION_WORKSHEET_ELIGIBILITY = Object.freeze({
  task: "S59H_G4B_U01_WorksheetAnswerKeyAndHorizontalRendererIntegration",
  sourceId: "g4b_u01_4b01",
  status: "canonical_production_worksheet_eligible",
  resolverDerivedOnly: true,
  horizontalOnly: true,
  applicationModeAllowed: false,
  verticalRepresentationAllowed: false,
  representationToggleAllowed: false,
  publicHiddenModeFlagAllowed: false,
  blockingValidatorRequired: true,
  questionCountMin: 1,
  questionCountMax: G4B_U01_PUBLIC_WORKSHEET_MAX_QUESTION_COUNT,
  basePromotionRegistryId: G4B_U01_HORIZONTAL_PROMOTION_REGISTRY_ID,
  productionPromotionOverlayId: G4B_U01_PRODUCTION_PROMOTION_OVERLAY_ID,
  requiredNextGate: "S59I_G4B_U01_PublicUIAndPrintControlsQA",
});

function issue(code, path, message, details = {}) {
  return { code, severity: "error", path, message, ...details };
}

function visibleGroupIdsForKnowledgePoints(knowledgePointIds = []) {
  const ids = new Set();
  for (const knowledgePointId of knowledgePointIds) {
    for (const group of getVisiblePatternGroupsForKnowledgePoint(knowledgePointId)) {
      if (group?.sourceId === "g4b_u01_4b01" && group?.patternGroupId) ids.add(group.patternGroupId);
    }
  }
  return ids;
}

function lifecycleIsProductionEligible() {
  return G4B_U01_PRODUCTION_PROMOTION_LIFECYCLE.selectorStatus === "visible"
    && G4B_U01_PRODUCTION_PROMOTION_LIFECYCLE.runtimeStatus === "production_routed"
    && G4B_U01_PRODUCTION_PROMOTION_LIFECYCLE.validatorStatus === "blocking_validator_required"
    && G4B_U01_PRODUCTION_PROMOTION_LIFECYCLE.worksheetStatus === "production_eligible"
    && G4B_U01_PRODUCTION_PROMOTION_LIFECYCLE.productionUse === "allowed";
}

export function isG4BU01ProductionWorksheetPlan(plan = {}) {
  if (plan.sourceId !== "g4b_u01_4b01") return false;
  const normalized = normalizeG4BU01ResolverPlan(plan);
  return classifyG4BU01CanonicalRouterPlan(normalized) === G4B_U01_CANONICAL_ROUTE_KINDS.PURE_HORIZONTAL;
}

export function validateG4BU01ProductionWorksheetEligibility(plan = {}) {
  const normalized = normalizeG4BU01ResolverPlan(plan);
  const errors = [];
  const routeKind = classifyG4BU01CanonicalRouterPlan(normalized);
  if (normalized.sourceId !== "g4b_u01_4b01") {
    errors.push(issue("G4B_U01_PRODUCTION_SOURCE_INVALID", "sourceId", "Production worksheet eligibility is scoped only to G4B-U01."));
  }
  if (routeKind !== G4B_U01_CANONICAL_ROUTE_KINDS.PURE_HORIZONTAL) {
    errors.push(issue("G4B_U01_PRODUCTION_ROUTE_INVALID", "routeKind", "G4B-U01 production worksheets require the pure horizontal canonical route.", { actual: routeKind }));
  }
  if (normalized.resolverResult?.ok !== true || normalized.resolverResult?.provenance?.resolver !== "visiblePatternGroupResolver") {
    errors.push(issue("G4B_U01_PRODUCTION_RESOLVER_REQUIRED", "resolverResult", "Production worksheet plans must be derived by the visible PatternGroup resolver."));
  }
  if (normalized.hiddenMode !== undefined || normalized.g4bU01Mode !== undefined || normalized.representationMode !== undefined) {
    errors.push(issue("G4B_U01_PRODUCTION_MODE_FLAG_FORBIDDEN", "selectionMode", "Hidden and representation-mode flags are forbidden for this horizontal-only unit."));
  }
  if (!Number.isInteger(normalized.questionCount) || normalized.questionCount < 1 || normalized.questionCount > G4B_U01_PUBLIC_WORKSHEET_MAX_QUESTION_COUNT) {
    errors.push(issue("G4B_U01_PRODUCTION_QUESTION_COUNT_INVALID", "questionCount", `Public worksheet questionCount must be an integer from 1 to ${G4B_U01_PUBLIC_WORKSHEET_MAX_QUESTION_COUNT}.`));
  }
  if (!lifecycleIsProductionEligible()) {
    errors.push(issue("G4B_U01_PRODUCTION_LIFECYCLE_INVALID", "promotionLifecycle", "The S59H worksheet promotion overlay is not eligible."));
  }

  const allocation = Array.isArray(normalized.allocation) ? normalized.allocation : [];
  const selectedGroupIds = new Set(normalized.selectedPatternGroupIds ?? []);
  const resolverGroupIds = new Set(normalized.resolverResult?.patternGroupIds ?? []);
  const resolverPatternSpecIds = new Set(normalized.resolverResult?.patternSpecIds ?? []);
  const visibleGroupIds = visibleGroupIdsForKnowledgePoints(normalized.selectedKnowledgePointIds ?? []);
  let allocatedCount = 0;
  if (allocation.length === 0) {
    errors.push(issue("G4B_U01_PRODUCTION_ALLOCATION_EMPTY", "allocation", "Production worksheet allocation must not be empty."));
  }
  for (const [index, entry] of allocation.entries()) {
    const path = `allocation[${index}]`;
    if (!Number.isInteger(entry?.questionCount) || entry.questionCount <= 0) {
      errors.push(issue("G4B_U01_PRODUCTION_ALLOCATION_COUNT_INVALID", `${path}.questionCount`, "Allocation questionCount must be a positive integer."));
      continue;
    }
    allocatedCount += entry.questionCount;
    if (!isS59FPromotedG4BU01PatternSpecId(entry.patternSpecId)) {
      errors.push(issue("G4B_U01_PRODUCTION_PATTERN_NOT_ELIGIBLE", `${path}.patternSpecId`, "Allocation contains an unpromoted G4B-U01 PatternSpec."));
    }
    if (!selectedGroupIds.has(entry.patternGroupId) || !resolverGroupIds.has(entry.patternGroupId) || !visibleGroupIds.has(entry.patternGroupId)) {
      errors.push(issue("G4B_U01_PRODUCTION_GROUP_NOT_VISIBLE", `${path}.patternGroupId`, "Allocation PatternGroup must be selected, resolver-derived and visible."));
    }
    if (!resolverPatternSpecIds.has(entry.patternSpecId)) {
      errors.push(issue("G4B_U01_PRODUCTION_PATTERN_NOT_RESOLVED", `${path}.patternSpecId`, "Allocation PatternSpec was not derived by the visible resolver."));
    }
  }
  if (allocatedCount !== normalized.questionCount) {
    errors.push(issue("G4B_U01_PRODUCTION_ALLOCATION_MISMATCH", "allocation", "Production worksheet allocation does not equal the requested question count.", { expected: normalized.questionCount, actual: allocatedCount }));
  }
  return {
    ok: errors.length === 0,
    errors,
    warnings: [],
    plan: normalized,
    routeKind,
    basePromotionRegistryId: G4B_U01_HORIZONTAL_PROMOTION_REGISTRY_ID,
    promotionRegistryId: G4B_U01_PRODUCTION_PROMOTION_OVERLAY_ID,
    eligibilityVersion: "s59h-g4b-u01-production-worksheet-v1",
  };
}
