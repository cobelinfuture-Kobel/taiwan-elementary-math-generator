import {
  G3B_U04_GLOBAL_CONTEXT_EXPANSION_VARIANTS
} from "./g3b-u04-global-context-expansion-pilot.js";

export const G3B_U04_GLOBAL_CONTEXT_PRODUCTION_REGISTRY_ID =
  "gctx_p13_g3b_u04_global_context_production";

export const G3B_U04_GLOBAL_CONTEXT_REVIEW_DECISION_ID =
  "gctx_p13_review_20260719_all_five_approved";

export const G3B_U04_GLOBAL_CONTEXT_REVIEW_ARTIFACT_SHA256 =
  "777ac95e2bd138895dda1822de58d0c9f52571513e63ff74d14687de6875e0f0";

export const G3B_U04_GLOBAL_CONTEXT_REVIEW_DECISION = Object.freeze({
  decisionId: G3B_U04_GLOBAL_CONTEXT_REVIEW_DECISION_ID,
  task: "GCTX-P13_G3BU04GlobalContextPilotHumanReviewAndProductionAdmission",
  decidedAt: "2026-07-19T13:21:58+08:00",
  decision: "approve_all",
  semanticReviewApproved: true,
  mathematicalReviewApproved: true,
  operatorStatement: "五題全部核准，進入 P13。",
  reviewArtifactSha256: G3B_U04_GLOBAL_CONTEXT_REVIEW_ARTIFACT_SHA256,
  reviewPageUrl: "https://cobelinfuture-kobel.github.io/taiwan-elementary-math-generator/review/g3b-u04/",
  reviewPdfUrl: "https://cobelinfuture-kobel.github.io/taiwan-elementary-math-generator/review/g3b-u04/GCTX_P12R_G3BU04_AFTER.pdf",
  approvedVariantIds: Object.freeze(
    G3B_U04_GLOBAL_CONTEXT_EXPANSION_VARIANTS.map((variant) => variant.variantId)
  )
});

export const G3B_U04_GLOBAL_CONTEXT_PRODUCTION_LIFECYCLE = Object.freeze({
  registryId: G3B_U04_GLOBAL_CONTEXT_PRODUCTION_REGISTRY_ID,
  status: "production_admission_approved",
  sourceId: "g3b_u04_3b04",
  knowledgePointId: "kp_g3b_u04_add_then_divide",
  patternGroupId: "pg_g3b_u04_add_then_divide",
  patternSpecId: "ps_g3b_u04_add_divide_joint_purchase_equal_share",
  selectorStatus: "visible_via_existing_pattern_spec",
  runtimeStatus: "production_routed",
  validatorStatus: "blocking_validator_required",
  worksheetStatus: "production_eligible",
  productionUse: "allowed",
  productionSelectable: true,
  publicQuerySelectable: true,
  productionAdmitted: true,
  publicHiddenModeFlagAllowed: false,
  approvedVariantCount: G3B_U04_GLOBAL_CONTEXT_EXPANSION_VARIANTS.length,
  reviewDecisionId: G3B_U04_GLOBAL_CONTEXT_REVIEW_DECISION_ID,
  reviewArtifactSha256: G3B_U04_GLOBAL_CONTEXT_REVIEW_ARTIFACT_SHA256
});

function sameMembers(left, right) {
  return left.length === right.length
    && JSON.stringify([...left].sort()) === JSON.stringify([...right].sort());
}

export function auditG3BU04GlobalContextProductionRegistry() {
  const errors = [];
  const variantIds = G3B_U04_GLOBAL_CONTEXT_EXPANSION_VARIANTS.map((variant) => variant.variantId);
  const approvedVariantIds = [...G3B_U04_GLOBAL_CONTEXT_REVIEW_DECISION.approvedVariantIds];

  if (variantIds.length !== 5) errors.push("GCTX_P13_VARIANT_COUNT_MISMATCH");
  if (new Set(variantIds).size !== variantIds.length) errors.push("GCTX_P13_DUPLICATE_VARIANT_ID");
  if (!sameMembers(variantIds, approvedVariantIds)) errors.push("GCTX_P13_REVIEW_VARIANT_SET_DRIFT");
  if (G3B_U04_GLOBAL_CONTEXT_REVIEW_DECISION.semanticReviewApproved !== true) {
    errors.push("GCTX_P13_SEMANTIC_REVIEW_NOT_APPROVED");
  }
  if (G3B_U04_GLOBAL_CONTEXT_REVIEW_DECISION.mathematicalReviewApproved !== true) {
    errors.push("GCTX_P13_MATHEMATICAL_REVIEW_NOT_APPROVED");
  }
  if (G3B_U04_GLOBAL_CONTEXT_REVIEW_DECISION.reviewArtifactSha256
    !== G3B_U04_GLOBAL_CONTEXT_REVIEW_ARTIFACT_SHA256) {
    errors.push("GCTX_P13_REVIEW_ARTIFACT_HASH_DRIFT");
  }
  if (G3B_U04_GLOBAL_CONTEXT_PRODUCTION_LIFECYCLE.productionUse !== "allowed"
    || G3B_U04_GLOBAL_CONTEXT_PRODUCTION_LIFECYCLE.productionSelectable !== true
    || G3B_U04_GLOBAL_CONTEXT_PRODUCTION_LIFECYCLE.publicQuerySelectable !== true
    || G3B_U04_GLOBAL_CONTEXT_PRODUCTION_LIFECYCLE.productionAdmitted !== true) {
    errors.push("GCTX_P13_PRODUCTION_LIFECYCLE_NOT_ACTIVE");
  }
  if (G3B_U04_GLOBAL_CONTEXT_PRODUCTION_LIFECYCLE.publicHiddenModeFlagAllowed !== false) {
    errors.push("GCTX_P13_HIDDEN_PUBLIC_FLAG_ALLOWED");
  }

  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    counts: Object.freeze({ approvedVariants: approvedVariantIds.length })
  });
}
