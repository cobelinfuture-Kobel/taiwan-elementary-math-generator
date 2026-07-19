import {
  G3B_U04_GLOBAL_CONTEXT_EXPANSION_VARIANTS,
  getG3BU04GlobalContextExpansionVariant,
  renderG3BU04GlobalContextExpansionQuestion
} from "./g3b-u04-global-context-expansion-pilot.js";

export const G3B_U04_GLOBAL_CONTEXT_PILOT_PATTERN_SPEC_ID =
  "ps_g3b_u04_add_divide_joint_purchase_equal_share";
export const G3B_U04_GLOBAL_CONTEXT_PILOT_KNOWLEDGE_POINT_ID =
  "kp_g3b_u04_add_then_divide";
export const G3B_U04_GLOBAL_CONTEXT_PILOT_PATTERN_GROUP_ID =
  "pg_g3b_u04_add_then_divide";
export const G3B_U04_GLOBAL_CONTEXT_PILOT_AUTHORITY_DOMAIN = "food";

export const G3B_U04_GLOBAL_CONTEXT_PILOT_RUNTIME = Object.freeze({
  task: "GCTX-P12R_G3BU04GlobalContextPilotRuntimeRendererAndPDFFullFix",
  version: "gctx-p12r-shadow-runtime-v1",
  mode: "production_equivalent_shadow_runtime",
  publicSelectorExposed: false,
  productionSelectable: false,
  runtimeResolvable: true,
  productionEquivalentGeneratorUsed: true,
  productionRendererRequired: true,
  expectedVariantCount: G3B_U04_GLOBAL_CONTEXT_EXPANSION_VARIANTS.length
});

function cloneValue(value) {
  if (Array.isArray(value)) return value.map((item) => cloneValue(item));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, cloneValue(nested)]));
  }
  return value;
}

function issue(code, path, message, details = {}) {
  return { code, severity: "error", stage: "global_context_pilot_runtime", path, message, ...details };
}

export function isG3BU04GlobalContextPilotEnabled(options = {}) {
  return options?.globalContextPilot?.enabled === true;
}

export function resolveG3BU04GlobalContextPilotVariantIds(options = {}) {
  const requested = options?.globalContextPilot?.variantIds;
  const ids = Array.isArray(requested) && requested.length > 0
    ? [...requested]
    : G3B_U04_GLOBAL_CONTEXT_EXPANSION_VARIANTS.map((variant) => variant.variantId);
  return ids;
}

export function validateG3BU04GlobalContextPilotOptions(options = {}) {
  const errors = [];
  if (!isG3BU04GlobalContextPilotEnabled(options)) return { ok: true, errors, warnings: [] };
  const ids = resolveG3BU04GlobalContextPilotVariantIds(options);
  if (ids.length === 0) {
    errors.push(issue("GCTX_P12R_VARIANT_SET_EMPTY", "globalContextPilot.variantIds", "Pilot variant set must not be empty."));
  }
  if (new Set(ids).size !== ids.length) {
    errors.push(issue("GCTX_P12R_VARIANT_DUPLICATE", "globalContextPilot.variantIds", "Pilot variant IDs must be unique."));
  }
  for (const [index, variantId] of ids.entries()) {
    if (!getG3BU04GlobalContextExpansionVariant(variantId)) {
      errors.push(issue("GCTX_P12R_VARIANT_UNREGISTERED", `globalContextPilot.variantIds[${index}]`, "Pilot variant is not registered.", { variantId }));
    }
  }
  if (options?.globalContextPilot?.publicSelectable === true) {
    errors.push(issue("GCTX_P12R_PUBLIC_SELECTION_FORBIDDEN", "globalContextPilot.publicSelectable", "P12R is an isolated production-equivalent pilot and cannot enable public selection."));
  }
  return { ok: errors.length === 0, errors, warnings: [] };
}

export function normalizeG3BU04GlobalContextPilotPlan(plan = {}, options = {}) {
  if (!isG3BU04GlobalContextPilotEnabled(options)) return plan;
  const validation = validateG3BU04GlobalContextPilotOptions(options);
  if (!validation.ok) {
    return {
      ...cloneValue(plan),
      globalContextPilotPlanError: cloneValue(validation)
    };
  }
  const variantIds = resolveG3BU04GlobalContextPilotVariantIds(options);
  const resolverPatternIds = new Set(plan.resolverResult?.patternSpecIds ?? []);
  const resolverGroupIds = new Set(plan.resolverResult?.patternGroupIds ?? []);
  const resolverKpIds = new Set(plan.resolverResult?.knowledgePointIds ?? plan.selectedKnowledgePointIds ?? []);
  const resolverOwnsPilot = resolverPatternIds.has(G3B_U04_GLOBAL_CONTEXT_PILOT_PATTERN_SPEC_ID)
    && resolverGroupIds.has(G3B_U04_GLOBAL_CONTEXT_PILOT_PATTERN_GROUP_ID)
    && resolverKpIds.has(G3B_U04_GLOBAL_CONTEXT_PILOT_KNOWLEDGE_POINT_ID);
  if (!resolverOwnsPilot) {
    return {
      ...cloneValue(plan),
      globalContextPilotPlanError: {
        ok: false,
        errors: [issue(
          "GCTX_P12R_VISIBLE_RESOLVER_AUTHORITY_MISSING",
          "resolverResult",
          "The visible resolver did not resolve the pilot KnowledgePoint, PatternGroup, and PatternSpec."
        )],
        warnings: []
      }
    };
  }
  return {
    ...cloneValue(plan),
    questionCount: variantIds.length,
    allocation: [{
      knowledgePointId: G3B_U04_GLOBAL_CONTEXT_PILOT_KNOWLEDGE_POINT_ID,
      patternGroupId: G3B_U04_GLOBAL_CONTEXT_PILOT_PATTERN_GROUP_ID,
      patternSpecId: G3B_U04_GLOBAL_CONTEXT_PILOT_PATTERN_SPEC_ID,
      questionCount: variantIds.length
    }],
    patternSpecIds: [G3B_U04_GLOBAL_CONTEXT_PILOT_PATTERN_SPEC_ID],
    selectedKnowledgePointIds: [G3B_U04_GLOBAL_CONTEXT_PILOT_KNOWLEDGE_POINT_ID],
    selectedPatternGroupIds: [G3B_U04_GLOBAL_CONTEXT_PILOT_PATTERN_GROUP_ID],
    globalContextPilot: {
      task: G3B_U04_GLOBAL_CONTEXT_PILOT_RUNTIME.task,
      version: G3B_U04_GLOBAL_CONTEXT_PILOT_RUNTIME.version,
      enabled: true,
      variantIds,
      authorityContextDomain: G3B_U04_GLOBAL_CONTEXT_PILOT_AUTHORITY_DOMAIN,
      visibleResolverDerived: true,
      publicSelectorExposed: false,
      productionSelectable: false,
      runtimeResolvable: true
    }
  };
}

export function authorityContextDomainForG3BU04GlobalContextPilot(patternSpecId, options = {}) {
  if (isG3BU04GlobalContextPilotEnabled(options)
    && patternSpecId === G3B_U04_GLOBAL_CONTEXT_PILOT_PATTERN_SPEC_ID) {
    return G3B_U04_GLOBAL_CONTEXT_PILOT_AUTHORITY_DOMAIN;
  }
  return null;
}

export function applyG3BU04GlobalContextPilotQuestion(question = {}, options = {}, sequenceNumber = 1) {
  if (!isG3BU04GlobalContextPilotEnabled(options)
    || question.patternSpecId !== G3B_U04_GLOBAL_CONTEXT_PILOT_PATTERN_SPEC_ID) return question;

  const variantIds = resolveG3BU04GlobalContextPilotVariantIds(options);
  const variantId = variantIds[(sequenceNumber - 1) % variantIds.length];
  const candidate = renderG3BU04GlobalContextExpansionQuestion({
    variantId,
    a: question.quantities.a,
    b: question.quantities.b,
    c: question.quantities.c
  });
  if (!candidate) return question;

  const globalContextPilot = {
    task: G3B_U04_GLOBAL_CONTEXT_PILOT_RUNTIME.task,
    version: G3B_U04_GLOBAL_CONTEXT_PILOT_RUNTIME.version,
    mode: G3B_U04_GLOBAL_CONTEXT_PILOT_RUNTIME.mode,
    contextFamilyId: candidate.contextFamilyId,
    semanticVariantId: candidate.semanticVariantId,
    languageVariantId: candidate.languageVariantId,
    globalContextDomainId: candidate.contextDomainId,
    semanticFingerprint: candidate.semanticFingerprint,
    authorityContextDomain: question.contextDomain,
    visibleResolverDerived: true,
    canonicalGeneratorUsed: true,
    productionRendererRequired: true,
    publicSelectorExposed: false,
    productionSelectable: false,
    runtimeResolvable: true,
    humanReviewReady: false
  };

  return {
    ...question,
    promptText: candidate.promptText,
    blankedDisplayText: candidate.promptText,
    displayText: `${candidate.promptText} 答案：${question.answerText}`,
    globalContextPilot,
    semanticSnapshot: {
      ...cloneValue(question.semanticSnapshot ?? {}),
      globalContextPilot: cloneValue(globalContextPilot)
    },
    metadata: {
      ...cloneValue(question.metadata ?? {}),
      globalContextPilot: cloneValue(globalContextPilot),
      patternTags: [...new Set([...(question.metadata?.patternTags ?? []), "gctx_p12r_shadow_runtime"])],
      difficultyTags: [...new Set([...(question.metadata?.difficultyTags ?? []), "production_equivalent_pilot_output"]) ]
    }
  };
}

export function validateG3BU04GlobalContextPilotRuntimeQuestion(question = {}) {
  if (!question?.globalContextPilot) return { ok: true, errors: [], warnings: [] };
  const errors = [];
  const pilot = question.globalContextPilot;
  const variant = getG3BU04GlobalContextExpansionVariant(pilot.semanticVariantId);
  if (question.patternSpecId !== G3B_U04_GLOBAL_CONTEXT_PILOT_PATTERN_SPEC_ID) {
    errors.push(issue("GCTX_P12R_PATTERN_SPEC_MISMATCH", "patternSpecId", "Pilot question escaped its fixed PatternSpec."));
  }
  if (!variant) {
    errors.push(issue("GCTX_P12R_VARIANT_UNREGISTERED", "globalContextPilot.semanticVariantId", "Runtime question references an unregistered pilot variant."));
  }
  if (pilot.version !== G3B_U04_GLOBAL_CONTEXT_PILOT_RUNTIME.version
    || pilot.mode !== G3B_U04_GLOBAL_CONTEXT_PILOT_RUNTIME.mode
    || pilot.visibleResolverDerived !== true
    || pilot.canonicalGeneratorUsed !== true
    || pilot.productionRendererRequired !== true
    || pilot.publicSelectorExposed !== false
    || pilot.productionSelectable !== false
    || pilot.runtimeResolvable !== true) {
    errors.push(issue("GCTX_P12R_RUNTIME_PROVENANCE_INVALID", "globalContextPilot", "Pilot runtime provenance or isolation boundary is invalid."));
  }
  if (question.contextDomain !== G3B_U04_GLOBAL_CONTEXT_PILOT_AUTHORITY_DOMAIN
    || pilot.authorityContextDomain !== G3B_U04_GLOBAL_CONTEXT_PILOT_AUTHORITY_DOMAIN) {
    errors.push(issue("GCTX_P12R_AUTHORITY_DOMAIN_INVALID", "contextDomain", "Pilot must preserve its registered authority context for base semantic validation."));
  }
  if (variant) {
    const expected = renderG3BU04GlobalContextExpansionQuestion({
      variantId: variant.variantId,
      a: question.quantities.a,
      b: question.quantities.b,
      c: question.quantities.c
    });
    if (question.promptText !== expected.promptText
      || question.blankedDisplayText !== expected.promptText
      || pilot.globalContextDomainId !== expected.contextDomainId
      || pilot.semanticFingerprint !== expected.semanticFingerprint) {
      errors.push(issue("GCTX_P12R_RENDERED_CONTEXT_MISMATCH", "promptText", "Runtime prompt does not match the selected global-context binding."));
    }
  }
  const expectedAnswer = (question.quantities.a + question.quantities.b) / question.quantities.c;
  if (!Number.isInteger(expectedAnswer)
    || question.finalAnswer !== expectedAnswer
    || question.answerText !== `${expectedAnswer}元`
    || question.equationModel !== `(${question.quantities.a} + ${question.quantities.b}) ÷ ${question.quantities.c}`) {
    errors.push(issue("GCTX_P12R_MATHEMATICAL_WITNESS_MISMATCH", "finalAnswer", "Pilot question does not preserve the canonical mathematical witness."));
  }
  return { ok: errors.length === 0, errors, warnings: [] };
}
