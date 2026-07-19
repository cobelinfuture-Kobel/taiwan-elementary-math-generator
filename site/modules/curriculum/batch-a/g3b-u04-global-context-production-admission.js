import {
  G3B_U04_CANONICAL_ROUTE_KINDS
} from "./g3b-u04-canonical-semantic-router.js";
import {
  G3B_U04_GLOBAL_CONTEXT_EXPANSION_VARIANTS,
  renderG3BU04GlobalContextExpansionQuestion
} from "./g3b-u04-global-context-expansion-pilot.js";
import {
  G3B_U04_GLOBAL_CONTEXT_PRODUCTION_REGISTRY_ID,
  G3B_U04_GLOBAL_CONTEXT_REVIEW_ARTIFACT_SHA256,
  G3B_U04_GLOBAL_CONTEXT_REVIEW_DECISION_ID,
  auditG3BU04GlobalContextProductionRegistry
} from "./g3b-u04-global-context-production-registry.js";

export const G3B_U04_GLOBAL_CONTEXT_PRODUCTION_SOURCE_ID = "g3b_u04_3b04";
export const G3B_U04_GLOBAL_CONTEXT_PRODUCTION_KNOWLEDGE_POINT_ID = "kp_g3b_u04_add_then_divide";
export const G3B_U04_GLOBAL_CONTEXT_PRODUCTION_PATTERN_GROUP_ID = "pg_g3b_u04_add_then_divide";
export const G3B_U04_GLOBAL_CONTEXT_PRODUCTION_PATTERN_SPEC_ID = "ps_g3b_u04_add_divide_joint_purchase_equal_share";

export const G3B_U04_GLOBAL_CONTEXT_PRODUCTION_ADMISSION = Object.freeze({
  task: "GCTX-P13_G3BU04GlobalContextPilotHumanReviewAndProductionAdmission",
  status: "production_admitted_public_route_active",
  registryId: G3B_U04_GLOBAL_CONTEXT_PRODUCTION_REGISTRY_ID,
  sourceId: G3B_U04_GLOBAL_CONTEXT_PRODUCTION_SOURCE_ID,
  knowledgePointId: G3B_U04_GLOBAL_CONTEXT_PRODUCTION_KNOWLEDGE_POINT_ID,
  patternGroupId: G3B_U04_GLOBAL_CONTEXT_PRODUCTION_PATTERN_GROUP_ID,
  patternSpecId: G3B_U04_GLOBAL_CONTEXT_PRODUCTION_PATTERN_SPEC_ID,
  productionSelectable: true,
  publicQuerySelectable: true,
  productionAdmitted: true,
  publicHiddenModeFlagUsed: false,
  blockingValidatorRequired: true,
  reviewDecisionId: G3B_U04_GLOBAL_CONTEXT_REVIEW_DECISION_ID,
  reviewArtifactSha256: G3B_U04_GLOBAL_CONTEXT_REVIEW_ARTIFACT_SHA256
});

function cloneValue(value) {
  if (Array.isArray(value)) return value.map((item) => cloneValue(item));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, cloneValue(nested)]));
  }
  return value;
}

function issue(code, path, message, details = {}) {
  return { code, severity: "error", stage: "gctx_p13_production_admission", path, message, ...details };
}

function hashSeed(value) {
  let acc = 2166136261;
  for (const char of String(value ?? "gctx-p13-production")) {
    acc ^= char.charCodeAt(0);
    acc = Math.imul(acc, 16777619);
  }
  return acc >>> 0 || 1;
}

function isEligibleRouteKind(routeKind) {
  return routeKind === G3B_U04_CANONICAL_ROUTE_KINDS.PURE_SEMANTIC
    || routeKind === G3B_U04_CANONICAL_ROUTE_KINDS.NUMERIC_SEMANTIC_HYBRID;
}

function variantForOccurrence(generationSeed, occurrenceIndex) {
  const start = hashSeed(`${generationSeed}:${G3B_U04_GLOBAL_CONTEXT_PRODUCTION_REGISTRY_ID}`)
    % G3B_U04_GLOBAL_CONTEXT_EXPANSION_VARIANTS.length;
  return G3B_U04_GLOBAL_CONTEXT_EXPANSION_VARIANTS[
    (start + occurrenceIndex) % G3B_U04_GLOBAL_CONTEXT_EXPANSION_VARIANTS.length
  ];
}

function productionBinding(rendered, authorityContextDomain) {
  return {
    task: G3B_U04_GLOBAL_CONTEXT_PRODUCTION_ADMISSION.task,
    registryId: G3B_U04_GLOBAL_CONTEXT_PRODUCTION_REGISTRY_ID,
    reviewDecisionId: G3B_U04_GLOBAL_CONTEXT_REVIEW_DECISION_ID,
    reviewArtifactSha256: G3B_U04_GLOBAL_CONTEXT_REVIEW_ARTIFACT_SHA256,
    contextFamilyId: rendered.contextFamilyId,
    semanticVariantId: rendered.semanticVariantId,
    languageVariantId: rendered.languageVariantId,
    globalContextDomainId: rendered.contextDomainId,
    validatorAuthorityContextDomain: authorityContextDomain,
    semanticFingerprint: rendered.semanticFingerprint,
    runtimeResolvable: true,
    productionSelectable: true,
    publicQuerySelectable: true,
    productionAdmitted: true,
    productionUse: "allowed"
  };
}

function projectQuestion(baseQuestion, variant, occurrenceIndex) {
  const { a, b, c } = baseQuestion.quantities ?? {};
  const rendered = renderG3BU04GlobalContextExpansionQuestion({
    variantId: variant.variantId,
    a,
    b,
    c
  });
  if (!rendered) return null;

  const binding = productionBinding(rendered, baseQuestion.contextDomain);
  return {
    ...cloneValue(baseQuestion),
    phase: "GCTX-P13",
    promptText: rendered.promptText,
    blankedDisplayText: rendered.promptText,
    displayText: `${rendered.promptText} 答案：${baseQuestion.answerText}`,
    globalContextRouting: "approved_production_projection",
    globalContextProduction: cloneValue(binding),
    selectorStatus: "visible",
    visibilityStatus: "visible",
    productionUse: "allowed",
    semanticSnapshot: {
      ...cloneValue(baseQuestion.semanticSnapshot ?? {}),
      globalContextProduction: cloneValue(binding),
      globalContextProductionOccurrence: occurrenceIndex + 1,
      runtimeStatus: "production_routed",
      productionSelectable: true,
      publicQuerySelectable: true,
      productionAdmitted: true
    },
    metadata: {
      ...cloneValue(baseQuestion.metadata ?? {}),
      globalContextProduction: cloneValue(binding),
      patternTags: [...new Set([
        ...(baseQuestion.metadata?.patternTags ?? []),
        "gctx_p13_production_admitted",
        rendered.semanticVariantId
      ])],
      difficultyTags: [...new Set([
        ...(baseQuestion.metadata?.difficultyTags ?? []),
        "gctx_global_context_human_approved"
      ])]
    },
    canonicalRoute: {
      ...cloneValue(baseQuestion.canonicalRoute ?? {}),
      globalContextProductionAdmission: true,
      publicQuerySelectable: true,
      publicHiddenModeFlagUsed: false
    }
  };
}

function validateStandaloneMathematicalWitness(question, errors) {
  const { a, b, c } = question.quantities ?? {};
  const expectedAnswer = Number.isInteger(a) && Number.isInteger(b) && Number.isInteger(c) && c > 0
    ? (a + b) / c
    : Number.NaN;
  if (![a, b, c].every((value) => Number.isInteger(value) && value > 0)
    || !Number.isInteger(expectedAnswer)
    || expectedAnswer <= 0
    || question.equationModel !== `(${a} + ${b}) ÷ ${c}`
    || question.finalAnswer !== expectedAnswer
    || question.answerText !== `${expectedAnswer}元`
    || question.answerUnit !== "元") {
    errors.push(issue(
      "GCTX_P13_MATHEMATICAL_WITNESS_INVALID",
      "mathematicalWitness",
      "Production question does not independently reconstruct to the approved (a+b)/c integer answer."
    ));
  }
}

export function validateG3BU04GlobalContextProductionQuestion(question = {}, baseQuestion = null) {
  const errors = [];
  const binding = question.globalContextProduction ?? {};
  const rendered = renderG3BU04GlobalContextExpansionQuestion({
    variantId: binding.semanticVariantId,
    a: question.quantities?.a,
    b: question.quantities?.b,
    c: question.quantities?.c
  });

  if (question.patternSpecId !== G3B_U04_GLOBAL_CONTEXT_PRODUCTION_PATTERN_SPEC_ID) {
    errors.push(issue("GCTX_P13_PATTERN_SPEC_MISMATCH", "patternSpecId", "Production projection changed the approved PatternSpec."));
  }
  if (question.knowledgePointId !== G3B_U04_GLOBAL_CONTEXT_PRODUCTION_KNOWLEDGE_POINT_ID) {
    errors.push(issue("GCTX_P13_KNOWLEDGE_POINT_MISMATCH", "knowledgePointId", "Production projection changed the approved KnowledgePoint."));
  }
  if (!rendered || question.promptText !== rendered.promptText || question.blankedDisplayText !== rendered.promptText) {
    errors.push(issue("GCTX_P13_PROMPT_BINDING_MISMATCH", "promptText", "Visible prompt does not match the approved production language variant."));
  }

  const hasBaseQuestion = Boolean(baseQuestion?.patternSpecId);
  if (hasBaseQuestion) {
    if (question.equationModel !== baseQuestion.equationModel
      || question.finalAnswer !== baseQuestion.finalAnswer
      || question.answerText !== baseQuestion.answerText
      || JSON.stringify(question.quantities) !== JSON.stringify(baseQuestion.quantities)) {
      errors.push(issue("GCTX_P13_MATHEMATICAL_WITNESS_DRIFT", "mathematicalWitness", "Production projection changed quantities, equation, answer, or unit-bearing answer text."));
    }
    if (question.contextDomain !== baseQuestion.contextDomain
      || question.scenarioId !== baseQuestion.scenarioId
      || question.ownershipModel !== baseQuestion.ownershipModel
      || JSON.stringify(question.quantityRoleBindings) !== JSON.stringify(baseQuestion.quantityRoleBindings)) {
      errors.push(issue("GCTX_P13_VALIDATOR_AUTHORITY_DRIFT", "contextAuthority", "Production projection changed canonical validator authority fields."));
    }
  } else {
    validateStandaloneMathematicalWitness(question, errors);
    if (binding.validatorAuthorityContextDomain !== question.contextDomain) {
      errors.push(issue("GCTX_P13_VALIDATOR_AUTHORITY_MISSING", "contextDomain", "Production question does not retain its canonical validator authority domain."));
    }
  }

  if (binding.registryId !== G3B_U04_GLOBAL_CONTEXT_PRODUCTION_REGISTRY_ID
    || binding.reviewDecisionId !== G3B_U04_GLOBAL_CONTEXT_REVIEW_DECISION_ID
    || binding.reviewArtifactSha256 !== G3B_U04_GLOBAL_CONTEXT_REVIEW_ARTIFACT_SHA256) {
    errors.push(issue("GCTX_P13_REVIEW_EVIDENCE_MISSING", "globalContextProduction", "Production projection is not bound to the approved Human Review evidence."));
  }
  if (binding.runtimeResolvable !== true
    || binding.productionSelectable !== true
    || binding.publicQuerySelectable !== true
    || binding.productionAdmitted !== true
    || binding.productionUse !== "allowed") {
    errors.push(issue("GCTX_P13_PRODUCTION_LIFECYCLE_INVALID", "globalContextProduction", "Approved context is not fully admitted to production lifecycle."));
  }
  if (question.selectorStatus !== "visible"
    || question.visibilityStatus !== "visible"
    || question.productionUse !== "allowed") {
    errors.push(issue("GCTX_P13_QUESTION_VISIBILITY_INVALID", "selectorStatus", "Production question is not visible and production-allowed."));
  }
  if (question.generatorRouting !== "canonical_resolver_allocation"
    || question.canonicalRoute?.resolver !== "visiblePatternGroupResolver"
    || question.canonicalRoute?.globalContextProductionAdmission !== true
    || question.canonicalRoute?.publicHiddenModeFlagUsed !== false) {
    errors.push(issue("GCTX_P13_CANONICAL_ROUTE_INVALID", "canonicalRoute", "Production context did not preserve the canonical visible resolver route."));
  }
  if (/三明治費用|果汁費用|筆記本費用|彩色筆費用|門票費用|帳篷租金/.test(question.promptText ?? "")) {
    errors.push(issue("GCTX_P13_LEGACY_PROMPT_LEAKAGE", "promptText", "Learner-visible output still contains a legacy prompt."));
  }

  return { ok: errors.length === 0, errors, warnings: [] };
}

export function applyG3BU04GlobalContextProductionAdmission(result = {}, plan = {}) {
  if (result?.ok !== true || !Array.isArray(result.questions)) return result;
  const effectivePlan = result.plan ?? plan;
  if (effectivePlan.sourceId !== G3B_U04_GLOBAL_CONTEXT_PRODUCTION_SOURCE_ID
    || !isEligibleRouteKind(effectivePlan.routeKind)) {
    return result;
  }

  const targetCount = result.questions.filter(
    (question) => question.patternSpecId === G3B_U04_GLOBAL_CONTEXT_PRODUCTION_PATTERN_SPEC_ID
  ).length;
  if (targetCount === 0) return result;

  const registryAudit = auditG3BU04GlobalContextProductionRegistry();
  if (!registryAudit.ok) {
    return {
      ...result,
      ok: false,
      questions: [],
      errors: [
        ...(result.errors ?? []),
        ...registryAudit.errors.map((code) => issue(code, "productionRegistry", "Global context production registry audit failed."))
      ]
    };
  }

  let occurrenceIndex = 0;
  const errors = [];
  const variantIds = new Set();
  const questions = result.questions.map((baseQuestion, questionIndex) => {
    if (baseQuestion.patternSpecId !== G3B_U04_GLOBAL_CONTEXT_PRODUCTION_PATTERN_SPEC_ID) {
      return cloneValue(baseQuestion);
    }
    const variant = variantForOccurrence(effectivePlan.generationSeed, occurrenceIndex);
    const projected = projectQuestion(baseQuestion, variant, occurrenceIndex);
    occurrenceIndex += 1;
    if (!projected) {
      errors.push(issue("GCTX_P13_PROJECTION_FAILED", `questions[${questionIndex}]`, "Approved production context projection failed."));
      return null;
    }
    const validation = validateG3BU04GlobalContextProductionQuestion(projected, baseQuestion);
    errors.push(...validation.errors.map((entry) => ({
      ...entry,
      path: `questions[${questionIndex}].${entry.path}`
    })));
    variantIds.add(projected.globalContextProduction.semanticVariantId);
    return projected;
  });

  if (targetCount >= G3B_U04_GLOBAL_CONTEXT_EXPANSION_VARIANTS.length
    && variantIds.size !== G3B_U04_GLOBAL_CONTEXT_EXPANSION_VARIANTS.length) {
    errors.push(issue(
      "GCTX_P13_VARIANT_COVERAGE_INCOMPLETE",
      "questions",
      "A five-question target allocation must expose all five approved global contexts.",
      { expected: G3B_U04_GLOBAL_CONTEXT_EXPANSION_VARIANTS.length, actual: variantIds.size }
    ));
  }

  const ok = errors.length === 0;
  return {
    ...result,
    ok,
    plan: {
      ...cloneValue(effectivePlan),
      globalContextProductionAdmission: cloneValue(G3B_U04_GLOBAL_CONTEXT_PRODUCTION_ADMISSION)
    },
    questions: ok ? questions : [],
    errors: [...(result.errors ?? []), ...errors],
    productionAdmission: {
      ...cloneValue(G3B_U04_GLOBAL_CONTEXT_PRODUCTION_ADMISSION),
      projectedQuestionCount: targetCount,
      uniqueVariantCount: variantIds.size,
      projectedVariantIds: [...variantIds]
    }
  };
}
