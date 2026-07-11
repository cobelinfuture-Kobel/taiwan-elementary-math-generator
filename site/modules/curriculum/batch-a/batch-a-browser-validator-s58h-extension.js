import * as base from "./batch-a-browser-validator-s57f5-extension.js";
import {
  G3B_U08_CANONICAL_ROUTE_KINDS,
  classifyG3BU08CanonicalRouterPlan
} from "./g3b-u08-canonical-semantic-router.js";
import {
  G3B_U08_PRODUCTION_WORKSHEET_ELIGIBILITY,
  isG3BU08ProductionWorksheetPlan,
  validateG3BU08ProductionWorksheetEligibility
} from "./g3b-u08-production-eligibility.js";
import {
  G3B_U08_PRODUCTION_PROMOTION_OVERLAY_ID
} from "../registry/g3b-u08-semantic-production-promotion.js";
import {
  G3B_U08_SEMANTIC_PROMOTION_REGISTRY_ID
} from "../registry/g3b-u08-semantic-promotion.js";
import {
  validateG3BU08SemanticQuestion
} from "./g3b-u08-semantic-validator.js";

export const G3B_U08_CANONICAL_VALIDATOR_INTEGRATION = Object.freeze({
  task: "S58H_G3B_U08_CanonicalValidatorWorksheetAndRendererIntegration",
  status: "canonical_production_validator_integrated",
  semanticValidatorFirst: true,
  semanticValidatorStageCount: 8,
  lifecycleValidationRequired: true,
  productionEligibilityRequired: true,
  validatorVersion: "s58h-g3b-u08-canonical-production-v1",
  requiredNextGate: "S58I_G3B_U08_PublicSelectorAndPrintControlsQA"
});

function cloneValue(value) {
  if (Array.isArray(value)) return value.map((item) => cloneValue(item));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, cloneValue(nested)]));
  }
  return value;
}

function issue(code, path, message) {
  return { code, severity: "error", stage: "production_lifecycle", path, message };
}

function isG3BU08SemanticQuestion(question = {}) {
  return question?.sourceId === "g3b_u08_3b08"
    && question?.kind === "g3bU08SemanticApplication";
}

function runtimeValidationClone(question = {}) {
  const runtime = cloneValue(question);
  runtime.phase = "S58G";
  runtime.selectorStatus = "visible";
  runtime.visibilityStatus = "visible";
  runtime.productionUse = "canonical_runtime_only";
  runtime.generatorRouting = "canonical_resolver_allocation";
  runtime.canonicalRoute = {
    ...(runtime.canonicalRoute ?? {}),
    kind: G3B_U08_CANONICAL_ROUTE_KINDS.PURE_SEMANTIC,
    publicHiddenModeFlagUsed: false
  };
  runtime.semanticSnapshot = {
    ...(runtime.semanticSnapshot ?? {}),
    runtimeStatus: "canonical_routed_pre_worksheet",
    resolverDerived: true
  };
  return runtime;
}

function validateCanonicalLifecycle(question = {}) {
  const errors = [];
  if (question.phase !== "S58H") {
    errors.push(issue("G3B_U08_CANONICAL_QUESTION_PHASE_INVALID", "phase", "Canonical worksheet questions must be promoted by S58H."));
  }
  if (question.selectorStatus !== "visible" || question.visibilityStatus !== "visible") {
    errors.push(issue("G3B_U08_CANONICAL_QUESTION_VISIBILITY_INVALID", "selectorStatus", "Canonical production questions must be visible through the selector lifecycle."));
  }
  if (question.productionUse !== "allowed") {
    errors.push(issue("G3B_U08_CANONICAL_QUESTION_PRODUCTION_USE_INVALID", "productionUse", "Canonical worksheet questions must have productionUse=allowed."));
  }
  if (question.promotionRegistryId !== G3B_U08_PRODUCTION_PROMOTION_OVERLAY_ID
    || question.semanticSnapshot?.productionPromotionOverlayId !== G3B_U08_PRODUCTION_PROMOTION_OVERLAY_ID
    || question.semanticSnapshot?.basePromotionRegistryId !== G3B_U08_SEMANTIC_PROMOTION_REGISTRY_ID) {
    errors.push(issue("G3B_U08_CANONICAL_QUESTION_PROMOTION_INVALID", "promotionRegistryId", "Canonical question promotion metadata does not match the S58H production overlay."));
  }
  if (question.generatorRouting !== "canonical_resolver_allocation" || question.semanticSnapshot?.resolverDerived !== true) {
    errors.push(issue("G3B_U08_CANONICAL_QUESTION_RESOLVER_PROVENANCE_INVALID", "generatorRouting", "Canonical questions must retain resolver-derived generator provenance."));
  }
  if (question.canonicalRoute?.kind !== G3B_U08_CANONICAL_ROUTE_KINDS.PURE_SEMANTIC
    || question.canonicalRoute?.publicHiddenModeFlagUsed !== false) {
    errors.push(issue("G3B_U08_CANONICAL_QUESTION_ROUTE_INVALID", "canonicalRoute", "Canonical route metadata is missing, invalid, or uses a hidden public flag."));
  }
  if (!question.resolvedPatternGroupId
    || question.semanticSnapshot?.resolvedPatternGroupId !== question.resolvedPatternGroupId) {
    errors.push(issue("G3B_U08_CANONICAL_QUESTION_GROUP_INVALID", "resolvedPatternGroupId", "Canonical question must preserve its visible resolved PatternGroup."));
  }
  if (question.representation !== "horizontal_only" || question.semanticSnapshot?.representation !== "horizontal_only") {
    errors.push(issue("G3B_U08_CANONICAL_QUESTION_REPRESENTATION_INVALID", "representation", "Canonical G3B-U08 worksheets are horizontal-only."));
  }
  if (question.semanticSnapshot?.runtimeStatus !== "production_worksheet") {
    errors.push(issue("G3B_U08_CANONICAL_QUESTION_RUNTIME_STATUS_INVALID", "semanticSnapshot.runtimeStatus", "Canonical question runtime status must be production_worksheet."));
  }
  const answerUnit = String(question.finalAnswerUnit ?? "");
  const answerText = String(question.finalAnswerWithUnit ?? question.answerText ?? "");
  if (!answerText || (answerUnit && !answerText.includes(answerUnit))) {
    errors.push(issue("G3B_U08_CANONICAL_QUESTION_ANSWER_UNIT_INVALID", "finalAnswerWithUnit", "Canonical answer text must preserve its final unit or comparison conclusion."));
  }
  return errors;
}

function semanticResultForProductionQuestion(question = {}) {
  const result = validateG3BU08SemanticQuestion(runtimeValidationClone(question));
  return {
    ok: result.valid === true,
    errors: result.blockingErrors ?? [],
    warnings: result.warnings ?? [],
    stages: (result.stageResults ?? []).map((stage) => ({
      stage: stage.name,
      stageNumber: stage.stage,
      ok: stage.ok,
      errorCodes: (stage.blockingErrors ?? []).map((entry) => entry.code),
      warningCodes: []
    })),
    validatorVersion: result.validatorVersion
  };
}

export function validateBatchABrowserPlan(plan = {}) {
  if (isG3BU08ProductionWorksheetPlan(plan)) {
    return validateG3BU08ProductionWorksheetEligibility(plan);
  }
  return base.validateBatchABrowserPlan(plan);
}

export function validateBatchABrowserQuestion(question = {}, options = {}) {
  if (!isG3BU08SemanticQuestion(question)) return base.validateBatchABrowserQuestion(question, options);
  const semanticResult = semanticResultForProductionQuestion(question);
  const lifecycleErrors = validateCanonicalLifecycle(question);
  const lifecycleStage = {
    stage: "production_lifecycle",
    ok: lifecycleErrors.length === 0,
    errorCodes: lifecycleErrors.map((entry) => entry.code),
    warningCodes: []
  };
  return {
    ok: semanticResult.ok && lifecycleErrors.length === 0,
    errors: [...semanticResult.errors, ...lifecycleErrors],
    warnings: [...semanticResult.warnings],
    stages: [...semanticResult.stages, lifecycleStage],
    validatorVersion: G3B_U08_CANONICAL_VALIDATOR_INTEGRATION.validatorVersion
  };
}

export function validateBatchABrowserQuestions(questions = [], options = {}) {
  const errors = [];
  const warnings = [];
  const stages = [];
  for (const [index, question] of questions.entries()) {
    const result = validateBatchABrowserQuestion(question, { ...options, worksheetQuestions: questions });
    errors.push(...(result.errors ?? []).map((entry) => ({
      ...entry,
      path: `questions[${index}].${entry.path ?? "validation"}`
    })));
    warnings.push(...(result.warnings ?? []).map((entry) => ({
      ...entry,
      path: `questions[${index}].${entry.path ?? "validation"}`
    })));
    stages.push({ questionIndex: index, stages: result.stages ?? [] });
  }
  return {
    ok: errors.length === 0,
    errors,
    warnings,
    infos: [],
    stages,
    validatorVersion: G3B_U08_CANONICAL_VALIDATOR_INTEGRATION.validatorVersion,
    eligibilityVersion: G3B_U08_PRODUCTION_WORKSHEET_ELIGIBILITY.status,
    validatedAt: null
  };
}

export function classifyBatchAPlanForCanonicalValidation(plan = {}) {
  if (plan.sourceId === "g3b_u08_3b08") return classifyG3BU08CanonicalRouterPlan(plan);
  return base.classifyBatchAPlanForCanonicalValidation(plan);
}
