import * as base from "./batch-a-browser-validator-g3b-u04-extension.js";
import {
  G3B_U04_CANONICAL_ROUTE_KINDS,
  classifyG3BU04CanonicalRouterPlan
} from "./g3b-u04-canonical-semantic-router.js";
import {
  G3B_U04_PRODUCTION_WORKSHEET_ELIGIBILITY,
  isG3BU04ProductionWorksheetPlan,
  validateG3BU04ProductionWorksheetEligibility
} from "./g3b-u04-production-eligibility.js";
import {
  G3B_U04_SEMANTIC_PROMOTION_REGISTRY_ID
} from "../registry/g3b-u04-semantic-promotion.js";
import {
  G3B_U04_HUMAN_SEMANTIC_QUALITY_V2,
  validateG3BU04HumanSemanticQualityV2
} from "./g3b-u04-human-semantic-readback-quality-v2.js";
import {
  G3B_U04_GLOBAL_CONTEXT_PRODUCTION_PATTERN_SPEC_ID,
  validateG3BU04GlobalContextProductionQuestion
} from "./g3b-u04-global-context-production-admission.js";

const REVIEWED_SCOPE_FALSE_POSITIVE_CODE = "G3B_U04_READBACK_SHARED_ACTIVITY_SCOPE_UNCLEAR";

export const G3B_U04_CANONICAL_VALIDATOR_INTEGRATION = Object.freeze({
  task: "S57F5_G3B_U04_CanonicalValidatorWorksheetAndRendererIntegration",
  status: "canonical_validator_integrated",
  semanticValidatorFirst: true,
  lifecycleValidationRequired: true,
  humanSemanticReadbackRequired: true,
  humanSemanticReadbackVersion: G3B_U04_HUMAN_SEMANTIC_QUALITY_V2.version,
  productionEligibilityRequired: true,
  globalContextProductionAdmissionValidatorRequired: true,
  reviewedPromptCompatibilityBoundary: REVIEWED_SCOPE_FALSE_POSITIVE_CODE,
  validatorVersion: "s57f5-g3b-u04-canonical-production-v1-gctx-p13-r1",
  requiredNextGate: "S57F6_G3B_U04_PublicSelectorAndPrintControlsQA"
});

function issue(code, path, message) {
  return { code, severity: "error", stage: "production_lifecycle", path, message };
}

function isG3BU04SemanticQuestion(question = {}) {
  return question?.sourceId === "g3b_u04_3b04"
    && question?.kind === "g3bU04SemanticWordProblem";
}

function validateCanonicalLifecycle(question = {}) {
  const errors = [];
  const allowedRouteKinds = new Set([
    G3B_U04_CANONICAL_ROUTE_KINDS.PURE_SEMANTIC,
    G3B_U04_CANONICAL_ROUTE_KINDS.NUMERIC_SEMANTIC_HYBRID
  ]);

  if (question.selectorStatus !== "visible" || question.visibilityStatus !== "visible") {
    errors.push(issue(
      "G3B_U04_CANONICAL_QUESTION_VISIBILITY_INVALID",
      "selectorStatus",
      "Canonical production semantic questions must be visible through the selector lifecycle."
    ));
  }
  if (question.productionUse !== "allowed") {
    errors.push(issue(
      "G3B_U04_CANONICAL_QUESTION_PRODUCTION_USE_INVALID",
      "productionUse",
      "Canonical production semantic questions must have productionUse=allowed."
    ));
  }
  if (question.promotionRegistryId !== G3B_U04_SEMANTIC_PROMOTION_REGISTRY_ID
    || question.semanticSnapshot?.promotionRegistryId !== G3B_U04_SEMANTIC_PROMOTION_REGISTRY_ID) {
    errors.push(issue(
      "G3B_U04_CANONICAL_QUESTION_PROMOTION_INVALID",
      "promotionRegistryId",
      "Canonical semantic question promotion metadata does not match the S57F registry."
    ));
  }
  if (question.generatorRouting !== "canonical_resolver_allocation"
    || question.semanticSnapshot?.resolverDerived !== true) {
    errors.push(issue(
      "G3B_U04_CANONICAL_QUESTION_RESOLVER_PROVENANCE_INVALID",
      "generatorRouting",
      "Canonical semantic questions must retain resolver-derived generator provenance."
    ));
  }
  if (!allowedRouteKinds.has(question.canonicalRoute?.kind)
    || question.canonicalRoute?.publicHiddenModeFlagUsed !== false) {
    errors.push(issue(
      "G3B_U04_CANONICAL_QUESTION_ROUTE_INVALID",
      "canonicalRoute",
      "Canonical semantic question route metadata is missing, invalid, or uses a hidden public flag."
    ));
  }
  if (typeof question.resolvedPatternGroupId !== "string"
    || question.resolvedPatternGroupId.length === 0
    || question.semanticSnapshot?.resolvedPatternGroupId !== question.resolvedPatternGroupId) {
    errors.push(issue(
      "G3B_U04_CANONICAL_QUESTION_GROUP_INVALID",
      "resolvedPatternGroupId",
      "Canonical semantic question must preserve its visible resolved PatternGroup."
    ));
  }
  if (!question.answerText || !question.answerUnit || !String(question.answerText).endsWith(question.answerUnit)) {
    errors.push(issue(
      "G3B_U04_CANONICAL_QUESTION_ANSWER_UNIT_INVALID",
      "answerText",
      "Canonical semantic question answer text must preserve the answer unit."
    ));
  }

  return errors;
}

function shouldValidateGlobalContextProduction(question = {}, options = {}) {
  if (question.patternSpecId !== G3B_U04_GLOBAL_CONTEXT_PRODUCTION_PATTERN_SPEC_ID) return false;
  return Boolean(
    question.globalContextProduction
    || options.plan?.globalContextProductionAdmission?.productionAdmitted === true
  );
}

function reconcileReviewedPromptReadback(readbackResult, globalContextResult, shouldValidate) {
  if (!shouldValidate || globalContextResult.ok !== true) {
    return {
      result: readbackResult,
      compatibilityStage: {
        stage: "gctx_p13_reviewed_prompt_compatibility",
        ok: true,
        applied: false,
        resolvedErrorCodes: [],
        remainingErrorCodes: (readbackResult.errors ?? []).map((entry) => entry.code)
      }
    };
  }

  const scopeErrors = (readbackResult.errors ?? []).filter(
    (entry) => entry.code === REVIEWED_SCOPE_FALSE_POSITIVE_CODE
  );
  const remainingErrors = (readbackResult.errors ?? []).filter(
    (entry) => entry.code !== REVIEWED_SCOPE_FALSE_POSITIVE_CODE
  );
  const applied = scopeErrors.length > 0;
  const result = {
    ...readbackResult,
    ok: remainingErrors.length === 0,
    errors: remainingErrors,
    compatibilityResolution: applied ? {
      task: "GCTX-P13_G3BU04GlobalContextPilotHumanReviewAndProductionAdmission",
      type: "exact_review_bound_false_positive_resolution",
      resolvedErrorCode: REVIEWED_SCOPE_FALSE_POSITIVE_CODE,
      basis: "P13 exact prompt binding, review artifact hash, production lifecycle and independent mathematical witness all passed."
    } : null
  };
  return {
    result,
    compatibilityStage: {
      stage: "gctx_p13_reviewed_prompt_compatibility",
      ok: result.ok,
      applied,
      resolvedErrorCodes: scopeErrors.map((entry) => entry.code),
      remainingErrorCodes: remainingErrors.map((entry) => entry.code)
    }
  };
}

export function validateBatchABrowserPlan(plan = {}) {
  if (isG3BU04ProductionWorksheetPlan(plan)) {
    return validateG3BU04ProductionWorksheetEligibility(plan);
  }
  return base.validateBatchABrowserPlan(plan);
}

export function validateBatchABrowserQuestion(question = {}, options = {}) {
  const semanticResult = base.validateBatchABrowserQuestion(question, options);
  if (!isG3BU04SemanticQuestion(question)) return semanticResult;

  const lifecycleErrors = validateCanonicalLifecycle(question);
  const shouldValidateP13 = shouldValidateGlobalContextProduction(question, options);
  const rawReadbackResult = validateG3BU04HumanSemanticQualityV2(question);
  const globalContextResult = shouldValidateP13
    ? validateG3BU04GlobalContextProductionQuestion(question)
    : { ok: true, errors: [], warnings: [] };
  const reconciled = reconcileReviewedPromptReadback(
    rawReadbackResult,
    globalContextResult,
    shouldValidateP13
  );
  const readbackResult = reconciled.result;
  const lifecycleStage = {
    stage: "production_lifecycle",
    ok: lifecycleErrors.length === 0,
    errorCodes: lifecycleErrors.map((entry) => entry.code),
    warningCodes: []
  };
  const humanReadbackStage = {
    stage: "human_semantic_readback",
    ok: readbackResult.ok,
    errorCodes: (readbackResult.errors ?? []).map((entry) => entry.code),
    warningCodes: (readbackResult.warnings ?? []).map((entry) => entry.code),
    validatorVersion: readbackResult.validatorVersion
  };
  const globalContextStage = {
    stage: "gctx_p13_production_admission",
    ok: globalContextResult.ok,
    errorCodes: (globalContextResult.errors ?? []).map((entry) => entry.code),
    warningCodes: (globalContextResult.warnings ?? []).map((entry) => entry.code)
  };
  return {
    ...semanticResult,
    ok: semanticResult.ok === true
      && lifecycleErrors.length === 0
      && readbackResult.ok === true
      && globalContextResult.ok === true,
    errors: [
      ...(semanticResult.errors ?? []),
      ...lifecycleErrors,
      ...(readbackResult.errors ?? []),
      ...(globalContextResult.errors ?? [])
    ],
    warnings: [
      ...(semanticResult.warnings ?? []),
      ...(readbackResult.warnings ?? []),
      ...(globalContextResult.warnings ?? [])
    ],
    stages: [
      ...(semanticResult.stages ?? []),
      lifecycleStage,
      humanReadbackStage,
      reconciled.compatibilityStage,
      globalContextStage
    ]
  };
}

export function validateBatchABrowserQuestions(questions = [], options = {}) {
  const errors = [];
  const warnings = [];
  const stages = [];
  for (const [index, question] of questions.entries()) {
    const result = validateBatchABrowserQuestion(question, {
      ...options,
      worksheetQuestions: questions
    });
    errors.push(...(result.errors ?? []).map((error) => ({
      ...error,
      path: `questions[${index}].${error.path}`
    })));
    warnings.push(...(result.warnings ?? []).map((warning) => ({
      ...warning,
      path: `questions[${index}].${warning.path}`
    })));
    if (Array.isArray(result.stages)) stages.push({ questionIndex: index, stages: result.stages });
  }
  return {
    ok: errors.length === 0,
    errors,
    warnings,
    infos: [],
    stages,
    validatorVersion: G3B_U04_CANONICAL_VALIDATOR_INTEGRATION.validatorVersion,
    humanSemanticReadbackVersion: G3B_U04_HUMAN_SEMANTIC_QUALITY_V2.version,
    eligibilityVersion: G3B_U04_PRODUCTION_WORKSHEET_ELIGIBILITY.status,
    validatedAt: null
  };
}

export function classifyBatchAPlanForCanonicalValidation(plan = {}) {
  return classifyG3BU04CanonicalRouterPlan(plan);
}
