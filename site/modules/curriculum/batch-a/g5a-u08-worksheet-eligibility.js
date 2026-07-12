import {
  G5A_U08_CANONICAL_ROUTE_KINDS,
  classifyG5AU08CanonicalRouterPlan,
  normalizeG5AU08ResolverPlan,
  validateG5AU08CanonicalPlan,
} from "./g5a-u08-canonical-router.js";
import {
  G5A_U08_WORKSHEET_LIFECYCLE,
  G5A_U08_WORKSHEET_PROMOTION_OVERLAY_ID,
} from "../registry/g5a-u08-worksheet-promotion.js";

export const G5A_U08_WORKSHEET_ELIGIBILITY = Object.freeze({
  task: "S60J_G5A_U08_WorksheetAnswerKeyAndRendererIntegration",
  sourceId: "g5a_u08_5a08",
  routeKind: G5A_U08_CANONICAL_ROUTE_KINDS.CANONICAL,
  status: "worksheet_eligible_pending_public_qa",
  promotionOverlayId: G5A_U08_WORKSHEET_PROMOTION_OVERLAY_ID,
  productionUse: G5A_U08_WORKSHEET_LIFECYCLE.productionUse,
  maxQuestionCount: 1000,
  requiredNextGate: "S60K_G5A_U08_PublicUIPrintAndQueryStateQA",
});

function issue(code, path, message) {
  return { code, severity: "error", path, message };
}

export function isG5AU08WorksheetPlan(plan = {}) {
  return plan.sourceId === G5A_U08_WORKSHEET_ELIGIBILITY.sourceId
    && classifyG5AU08CanonicalRouterPlan(plan) === G5A_U08_CANONICAL_ROUTE_KINDS.CANONICAL;
}

export function validateG5AU08WorksheetEligibility(plan = {}) {
  const normalized = normalizeG5AU08ResolverPlan(plan);
  const canonical = validateG5AU08CanonicalPlan(normalized);
  const errors = [...canonical.errors];
  if (normalized.sourceId !== G5A_U08_WORKSHEET_ELIGIBILITY.sourceId) {
    errors.push(issue("G5A_U08_WORKSHEET_SOURCE_INVALID", "sourceId", "Worksheet 來源不是 G5A-U08。"));
  }
  if (classifyG5AU08CanonicalRouterPlan(normalized) !== G5A_U08_CANONICAL_ROUTE_KINDS.CANONICAL) {
    errors.push(issue("G5A_U08_WORKSHEET_CANONICAL_ROUTE_REQUIRED", "routeKind", "Worksheet 必須使用 G5A-U08 canonical route。"));
  }
  if (G5A_U08_WORKSHEET_LIFECYCLE.worksheetStatus !== "worksheet_eligible") {
    errors.push(issue("G5A_U08_WORKSHEET_NOT_ELIGIBLE", "lifecycle", "Worksheet lifecycle 尚未開放。"));
  }
  if (G5A_U08_WORKSHEET_LIFECYCLE.productionUse !== "preview_only_pending_s60l") {
    errors.push(issue("G5A_U08_WORKSHEET_PRODUCTION_SCOPE_INVALID", "lifecycle.productionUse", "S60J 只能建立 preview/print candidate。"));
  }
  if (!Number.isInteger(normalized.questionCount) || normalized.questionCount < 1 || normalized.questionCount > 1000) {
    errors.push(issue("G5A_U08_WORKSHEET_COUNT_INVALID", "questionCount", "Worksheet 題數必須介於 1 到 1000。"));
  }
  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    warnings: Object.freeze([]),
    plan: normalized,
    lifecycle: G5A_U08_WORKSHEET_LIFECYCLE,
    promotionOverlayId: G5A_U08_WORKSHEET_PROMOTION_OVERLAY_ID,
  });
}
