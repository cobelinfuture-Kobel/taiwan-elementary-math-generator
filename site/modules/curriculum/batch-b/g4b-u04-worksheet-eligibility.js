import {
  G4B_U04_CANONICAL_ROUTE_KINDS,
  classifyG4BU04CanonicalRouterPlan,
  normalizeG4BU04ResolverPlan,
  validateG4BU04CanonicalPlan,
} from "./g4b-u04-canonical-router.js";
import {
  G4B_U04_WORKSHEET_LIFECYCLE,
  G4B_U04_WORKSHEET_PROMOTION_OVERLAY_ID,
} from "../registry/g4b-u04-worksheet-promotion.js";

export const G4B_U04_WORKSHEET_ELIGIBILITY = Object.freeze({
  task: "S73_G4B_U04_WorksheetAnswerKeyAndRendererIntegration",
  sourceId: "g4b_u04_4b04",
  routeKind: G4B_U04_CANONICAL_ROUTE_KINDS.CANONICAL,
  status: "worksheet_eligible_pending_public_qa",
  promotionOverlayId: G4B_U04_WORKSHEET_PROMOTION_OVERLAY_ID,
  productionUse: G4B_U04_WORKSHEET_LIFECYCLE.productionUse,
  maxQuestionCount: 1000,
  requiredNextGate: "S74_G4B_U04_PublicUIPrintAndQueryStateQA",
});

function issue(code, path, message) {
  return { code, severity: "error", path, message };
}

export function isG4BU04WorksheetPlan(plan = {}) {
  return plan.sourceId === G4B_U04_WORKSHEET_ELIGIBILITY.sourceId
    && classifyG4BU04CanonicalRouterPlan(plan) === G4B_U04_CANONICAL_ROUTE_KINDS.CANONICAL;
}

export function validateG4BU04WorksheetEligibility(plan = {}) {
  const normalized = normalizeG4BU04ResolverPlan(plan);
  const canonical = validateG4BU04CanonicalPlan(normalized);
  const errors = [...canonical.errors];
  if (normalized.sourceId !== G4B_U04_WORKSHEET_ELIGIBILITY.sourceId) {
    errors.push(issue("G4B_U04_WORKSHEET_SOURCE_INVALID", "sourceId", "Worksheet 來源不是 G4B-U04。"));
  }
  if (classifyG4BU04CanonicalRouterPlan(normalized) !== G4B_U04_CANONICAL_ROUTE_KINDS.CANONICAL) {
    errors.push(issue("G4B_U04_WORKSHEET_CANONICAL_ROUTE_REQUIRED", "routeKind", "Worksheet 必須使用 G4B-U04 canonical route。"));
  }
  if (G4B_U04_WORKSHEET_LIFECYCLE.worksheetStatus !== "worksheet_eligible") {
    errors.push(issue("G4B_U04_WORKSHEET_NOT_ELIGIBLE", "lifecycle", "Worksheet lifecycle 尚未開放。"));
  }
  if (G4B_U04_WORKSHEET_LIFECYCLE.answerKeyStatus !== "answer_key_integrated") {
    errors.push(issue("G4B_U04_WORKSHEET_ANSWER_KEY_NOT_INTEGRATED", "lifecycle.answerKeyStatus", "答案頁 lifecycle 尚未接通。"));
  }
  if (G4B_U04_WORKSHEET_LIFECYCLE.rendererStatus !== "worksheet_renderer_integrated") {
    errors.push(issue("G4B_U04_WORKSHEET_RENDERER_NOT_INTEGRATED", "lifecycle.rendererStatus", "Renderer lifecycle 尚未接通。"));
  }
  if (G4B_U04_WORKSHEET_LIFECYCLE.productionUse !== "preview_only_pending_s75") {
    errors.push(issue("G4B_U04_WORKSHEET_PRODUCTION_SCOPE_INVALID", "lifecycle.productionUse", "S73 只能建立 preview/print candidate。"));
  }
  if (!Number.isInteger(normalized.questionCount) || normalized.questionCount < 1 || normalized.questionCount > 1000) {
    errors.push(issue("G4B_U04_WORKSHEET_COUNT_INVALID", "questionCount", "Worksheet 題數必須介於 1 到 1000。"));
  }
  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    warnings: Object.freeze([]),
    plan: normalized,
    lifecycle: G4B_U04_WORKSHEET_LIFECYCLE,
    promotionOverlayId: G4B_U04_WORKSHEET_PROMOTION_OVERLAY_ID,
  });
}
