export * from "./batch-a-browser-validator-s58h-extension.js";

import * as base from "./batch-a-browser-validator-s58h-extension.js";
import {
  G4B_U01_CANONICAL_ROUTE_KINDS,
  classifyG4BU01CanonicalRouterPlan,
  validateG4BU01CanonicalQuestion,
} from "./g4b-u01-canonical-horizontal-router.js";
import {
  G4B_U01_PRODUCTION_WORKSHEET_ELIGIBILITY,
  isG4BU01ProductionWorksheetPlan,
  validateG4BU01ProductionWorksheetEligibility,
} from "./g4b-u01-production-eligibility.js";
import {
  G4B_U01_HORIZONTAL_PROMOTION_REGISTRY_ID,
} from "../registry/g4b-u01-horizontal-promotion.js";
import {
  G4B_U01_PRODUCTION_PROMOTION_OVERLAY_ID,
} from "../registry/g4b-u01-horizontal-production-promotion.js";

export const G4B_U01_CANONICAL_VALIDATOR_INTEGRATION = Object.freeze({
  task: "S59H_G4B_U01_WorksheetAnswerKeyAndHorizontalRendererIntegration",
  status: "canonical_production_validator_integrated",
  arithmeticValidatorFirst: true,
  blockingCodeCount: 24,
  lifecycleValidationRequired: true,
  productionEligibilityRequired: true,
  validatorVersion: "s59h-g4b-u01-canonical-production-v1",
  requiredNextGate: "S59I_G4B_U01_PublicUIAndPrintControlsQA",
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

function isG4BU01HorizontalQuestion(question = {}) {
  return question?.sourceId === "g4b_u01_4b01"
    && question?.kind === "g4bU01HorizontalCalculation";
}

function runtimeValidationClone(question = {}) {
  const runtime = cloneValue(question);
  runtime.phase = "S59G";
  runtime.selectorStatus = "visible";
  runtime.visibilityStatus = "visible";
  runtime.productionUse = "canonical_runtime_only";
  runtime.generatorRouting = "canonical_resolver_allocation";
  runtime.promotionRegistryId = G4B_U01_HORIZONTAL_PROMOTION_REGISTRY_ID;
  runtime.canonicalRoute = {
    ...(runtime.canonicalRoute ?? {}),
    kind: G4B_U01_CANONICAL_ROUTE_KINDS.PURE_HORIZONTAL,
    publicHiddenModeFlagUsed: false,
    applicationModeUsed: false,
    verticalRepresentationUsed: false,
  };
  return runtime;
}

function validateProductionLifecycle(question = {}) {
  const errors = [];
  if (question.phase !== "S59H") {
    errors.push(issue("G4B_U01_CANONICAL_QUESTION_PHASE_INVALID", "phase", "Canonical worksheet questions must be promoted by S59H."));
  }
  if (question.selectorStatus !== "visible" || question.visibilityStatus !== "visible") {
    errors.push(issue("G4B_U01_CANONICAL_QUESTION_VISIBILITY_INVALID", "selectorStatus", "Production worksheet questions must remain visible."));
  }
  if (question.productionUse !== "allowed") {
    errors.push(issue("G4B_U01_CANONICAL_QUESTION_PRODUCTION_USE_INVALID", "productionUse", "Production worksheet questions must have productionUse=allowed."));
  }
  if (
    question.promotionRegistryId !== G4B_U01_PRODUCTION_PROMOTION_OVERLAY_ID
    || question.basePromotionRegistryId !== G4B_U01_HORIZONTAL_PROMOTION_REGISTRY_ID
  ) {
    errors.push(issue("G4B_U01_CANONICAL_QUESTION_PROMOTION_INVALID", "promotionRegistryId", "Production promotion metadata does not match the S59H overlay."));
  }
  if (question.generatorRouting !== "canonical_resolver_allocation" || !question.resolvedPatternGroupId) {
    errors.push(issue("G4B_U01_CANONICAL_QUESTION_RESOLVER_PROVENANCE_INVALID", "generatorRouting", "Production questions must retain resolver-derived group provenance."));
  }
  if (
    question.canonicalRoute?.kind !== G4B_U01_CANONICAL_ROUTE_KINDS.PURE_HORIZONTAL
    || question.canonicalRoute?.publicHiddenModeFlagUsed !== false
    || question.canonicalRoute?.applicationModeUsed !== false
    || question.canonicalRoute?.verticalRepresentationUsed !== false
  ) {
    errors.push(issue("G4B_U01_CANONICAL_QUESTION_ROUTE_INVALID", "canonicalRoute", "Production canonical route metadata is invalid."));
  }
  if (question.representation !== "horizontal_only" || question.applicationText !== false) {
    errors.push(issue("G4B_U01_CANONICAL_QUESTION_REPRESENTATION_INVALID", "representation", "Production G4B-U01 questions must remain horizontal-only and application-free."));
  }
  if (question.productionWorksheetStatus !== "production_worksheet") {
    errors.push(issue("G4B_U01_CANONICAL_QUESTION_RUNTIME_STATUS_INVALID", "productionWorksheetStatus", "Production worksheet status is invalid."));
  }
  if (typeof question.blankedDisplayText !== "string" || typeof question.answerText !== "string" || question.answerText.length === 0) {
    errors.push(issue("G4B_U01_CANONICAL_QUESTION_ANSWER_INVALID", "answerText", "Production question and answer text are required."));
  }
  return errors;
}

export function validateBatchABrowserPlan(plan = {}) {
  if (isG4BU01ProductionWorksheetPlan(plan)) return validateG4BU01ProductionWorksheetEligibility(plan);
  return base.validateBatchABrowserPlan(plan);
}

export function validateBatchABrowserQuestion(question = {}, options = {}) {
  if (!isG4BU01HorizontalQuestion(question) || question.phase !== "S59H") {
    return base.validateBatchABrowserQuestion(question, options);
  }
  const arithmeticResult = validateG4BU01CanonicalQuestion(runtimeValidationClone(question));
  const lifecycleErrors = validateProductionLifecycle(question);
  const lifecycleStage = {
    stage: "production_lifecycle",
    ok: lifecycleErrors.length === 0,
    errorCodes: lifecycleErrors.map((entry) => entry.code),
    warningCodes: [],
  };
  return {
    ok: arithmeticResult.ok && lifecycleErrors.length === 0,
    errors: [...(arithmeticResult.errors ?? []), ...lifecycleErrors],
    warnings: [...(arithmeticResult.warnings ?? [])],
    stages: [
      { stage: "s59e_arithmetic_contract", ok: arithmeticResult.ok, errorCodes: arithmeticResult.blockingCodes ?? [], warningCodes: (arithmeticResult.warnings ?? []).map((entry) => entry.code) },
      lifecycleStage,
    ],
    validatorVersion: G4B_U01_CANONICAL_VALIDATOR_INTEGRATION.validatorVersion,
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
      path: `questions[${index}].${entry.path ?? "validation"}`,
    })));
    warnings.push(...(result.warnings ?? []).map((entry) => ({
      ...entry,
      path: `questions[${index}].${entry.path ?? "validation"}`,
    })));
    stages.push({ questionIndex: index, stages: result.stages ?? [] });
  }
  const isG4BU01Batch = questions.length > 0 && questions.every(isG4BU01HorizontalQuestion);
  return {
    ok: errors.length === 0,
    errors,
    warnings,
    infos: [],
    stages,
    validatorVersion: isG4BU01Batch
      ? G4B_U01_CANONICAL_VALIDATOR_INTEGRATION.validatorVersion
      : base.validateBatchABrowserQuestions([], options).validatorVersion,
    eligibilityVersion: isG4BU01Batch
      ? G4B_U01_PRODUCTION_WORKSHEET_ELIGIBILITY.status
      : null,
    validatedAt: null,
  };
}

export function classifyBatchAPlanForCanonicalValidation(plan = {}) {
  if (plan.sourceId === "g4b_u01_4b01") return classifyG4BU01CanonicalRouterPlan(plan);
  return base.classifyBatchAPlanForCanonicalValidation(plan);
}
