import {
  G4A_U08_CANONICAL_ROUTE_KINDS,
  classifyG4AU08CanonicalRouterPlan,
  normalizeG4AU08ResolverPlan,
  validateG4AU08CanonicalPlan,
} from "./g4a-u08-canonical-router.js";
import {
  G4A_U08_WORKSHEET_LIFECYCLE,
  G4A_U08_WORKSHEET_PROMOTION_OVERLAY_ID,
} from "../registry/g4a-u08-worksheet-promotion.js";

export const G4A_U08_WORKSHEET_ELIGIBILITY = Object.freeze({
  task: "S76J_G4A_U08_ResolverSelectorAndWorksheetIntegration",
  sourceId: "g4a_u08_4a08",
  routeKind: G4A_U08_CANONICAL_ROUTE_KINDS.CANONICAL,
  status: "worksheet_eligible_pending_stress_qa",
  promotionOverlayId: G4A_U08_WORKSHEET_PROMOTION_OVERLAY_ID,
  productionUse: G4A_U08_WORKSHEET_LIFECYCLE.productionUse,
  maxQuestionCount: 1000,
  requiredNextGate: "S76K_G4A_U08_FullSourceStressAndSemanticQA",
});

function issue(code, path, message) {
  return { code, severity: "error", path, message };
}

export function isG4AU08WorksheetPlan(plan = {}) {
  return plan.sourceId === G4A_U08_WORKSHEET_ELIGIBILITY.sourceId
    && classifyG4AU08CanonicalRouterPlan(plan) === G4A_U08_CANONICAL_ROUTE_KINDS.CANONICAL;
}

export function validateG4AU08WorksheetEligibility(plan = {}) {
  const normalized = normalizeG4AU08ResolverPlan(plan);
  const canonical = validateG4AU08CanonicalPlan(normalized);
  const errors = [...canonical.errors];
  if (normalized.sourceId !== G4A_U08_WORKSHEET_ELIGIBILITY.sourceId) {
    errors.push(issue("G4A_U08_WORKSHEET_SOURCE_INVALID", "sourceId", "Worksheet 來源不是 G4A-U08。"));
  }
  if (classifyG4AU08CanonicalRouterPlan(normalized) !== G4A_U08_CANONICAL_ROUTE_KINDS.CANONICAL) {
    errors.push(issue("G4A_U08_WORKSHEET_CANONICAL_ROUTE_REQUIRED", "routeKind", "Worksheet 必須使用 G4A-U08 canonical route。"));
  }
  if (G4A_U08_WORKSHEET_LIFECYCLE.worksheetStatus !== "worksheet_eligible") {
    errors.push(issue("G4A_U08_WORKSHEET_NOT_ELIGIBLE", "lifecycle", "Worksheet lifecycle 尚未開放。"));
  }
  if (G4A_U08_WORKSHEET_LIFECYCLE.rendererStatus !== "existing_generic_renderer_only") {
    errors.push(issue("G4A_U08_WORKSHEET_RENDERER_SCOPE_INVALID", "lifecycle.rendererStatus", "S76J 不得變更 renderer 視覺行為。"));
  }
  if (G4A_U08_WORKSHEET_LIFECYCLE.productionUse !== "preview_only_pending_s76k") {
    errors.push(issue("G4A_U08_WORKSHEET_PRODUCTION_SCOPE_INVALID", "lifecycle.productionUse", "S76J 只能建立 preview/print candidate。"));
  }
  if (!Number.isInteger(normalized.questionCount) || normalized.questionCount < 1 || normalized.questionCount > 1000) {
    errors.push(issue("G4A_U08_WORKSHEET_COUNT_INVALID", "questionCount", "Worksheet 題數必須介於 1 到 1000。"));
  }
  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    warnings: Object.freeze([]),
    plan: normalized,
    lifecycle: G4A_U08_WORKSHEET_LIFECYCLE,
    promotionOverlayId: G4A_U08_WORKSHEET_PROMOTION_OVERLAY_ID,
  });
}
