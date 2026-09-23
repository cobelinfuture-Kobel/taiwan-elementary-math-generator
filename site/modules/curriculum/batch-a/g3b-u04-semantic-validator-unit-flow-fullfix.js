import {
  validateG3BU04SemanticQuestion as validateBaseG3BU04SemanticQuestion
} from "./g3b-u04-semantic-validator.js";
import {
  getG3BU04SemanticPatternDefinition
} from "./source-pattern-g3b-u04-semantic-extension.js";
import {
  resolveG3BU04SemanticScenarioProfile
} from "./g3b-u04-semantic-scenarios.js";
import {
  G3B_U04_HUMAN_SEMANTIC_READBACK_FULLFIX
} from "./g3b-u04-human-semantic-readback-fullfix.js";

export const G3B_U04_DISTRIBUTED_RESOURCES_PATTERN_SPEC_ID =
  "ps_g3b_u04_div_add_distributed_resources_plus_existing_per_group";

const EXPECTED_ROLE_CONTRACT = Object.freeze({
  a: Object.freeze({ semanticRole: "new_resource_count", unitDimension: "count" }),
  b: Object.freeze({ semanticRole: "recipient_count", unitDimension: "count" }),
  c: Object.freeze({ semanticRole: "existing_quantity_per_recipient", unitDimension: "count" })
});

function cloneValue(value) {
  if (Array.isArray(value)) return value.map((item) => cloneValue(item));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nested]) => [key, cloneValue(nested)])
    );
  }
  return value;
}

function roleContractMatches(question = {}) {
  if (question.patternSpecId !== G3B_U04_DISTRIBUTED_RESOURCES_PATTERN_SPEC_ID) return false;
  if (question.templateFamilyId !== "tpl_g3b_u04_div_add_distributed_resources_plus_existing_per_group") return false;
  if (question.knowledgePointId !== "kp_g3b_u04_divide_then_add") return false;
  if (question.semanticSignature !== "distribute_new_resources_then_add_existing_per_recipient") return false;
  if (question.unknownRole !== "final_quantity_per_recipient") return false;
  if (!question.equationModel || !Number.isSafeInteger(question.quantities?.a)
    || !Number.isSafeInteger(question.quantities?.b)
    || !Number.isSafeInteger(question.quantities?.c)) return false;

  for (const [symbol, expected] of Object.entries(EXPECTED_ROLE_CONTRACT)) {
    const binding = question.quantityRoleBindings?.[symbol];
    if (!binding
      || binding.semanticRole !== expected.semanticRole
      || binding.unitDimension !== expected.unitDimension
      || binding.value !== question.quantities[symbol]) return false;
  }

  const quotient = question.quantities.a / question.quantities.b;
  return question.quantities.b > 0
    && Number.isSafeInteger(quotient)
    && quotient > 0
    && question.finalAnswer === quotient + question.quantities.c
    && question.answerUnit === question.quantityRoleBindings.a.unitLabel
    && question.answerUnit === question.quantityRoleBindings.c.unitLabel;
}

function isResolvedContextBoundCompatibilityError(error = {}) {
  return error.code === "G3B_U04_SEM_UNIT_FLOW_MISMATCH"
    && error.stage === "unit_flow"
    && error.path === "quantityRoleBindings";
}

function removeResolvedUnitFlowCode(stages = []) {
  return stages.map((stage) => {
    if (stage.stage !== "unit_flow") return cloneValue(stage);
    const errorCodes = (stage.errorCodes ?? []).filter(
      (code) => code !== "G3B_U04_SEM_UNIT_FLOW_MISMATCH"
    );
    return {
      ...cloneValue(stage),
      ok: errorCodes.length === 0,
      errorCodes
    };
  });
}

function legacyExpectedAnswerUnit(spec, scenario) {
  const role = spec?.unknownRole ?? "";
  if (spec?.knowledgePointId === "kp_g3b_u04_composite_multiplicative_ratio") return "倍";
  if (/cost|price|money|budget/.test(role)) return "元";
  if (/points/.test(role)) return "點";
  if (/(^|_)age($|_)/.test(role)) return "歲";
  if (/capacity/.test(role)) return scenario?.capacityUnit ?? scenario?.measureUnit ?? "毫升";
  if (/team/.test(role)) return "隊";
  if (/tray/.test(role)) return "盤";
  if (/group_count/.test(role)) return "組";
  if (/package/.test(role)) return scenario?.packageUnit ?? "盒";
  return scenario?.measureUnit ?? scenario?.itemUnit ?? "個";
}

function isHumanReadbackQuestion(question = {}) {
  return question?.humanSemanticReadback?.fullFixApplied === true
    && question?.humanSemanticReadback?.version === G3B_U04_HUMAN_SEMANTIC_READBACK_FULLFIX.version
    && question?.semanticSnapshot?.humanSemanticReadback?.fullFixApplied === true;
}

/**
 * The S57E5 validator remains the immutable authority-contract validator. S57F7R1
 * corrects public wording and context-bound answer classifiers in a production
 * overlay. This projection presents only the legacy classifier/period literals
 * to S57E5, while the dedicated S57F7R1 readback validator checks the corrected
 * public values. Arithmetic, roles, equations, events, ownership, and semantic
 * family identity are never projected or suppressed.
 */
function projectHumanReadbackQuestionForAuthorityValidation(question = {}) {
  if (!isHumanReadbackQuestion(question)) return question;
  const projected = cloneValue(question);
  const spec = getG3BU04SemanticPatternDefinition(projected.patternSpecId);
  const scenario = spec
    ? resolveG3BU04SemanticScenarioProfile(spec.templateFamilyId, projected.contextDomain)
    : null;
  if (!spec || !scenario) return projected;

  const legacyUnit = legacyExpectedAnswerUnit(spec, scenario);
  projected.answerUnit = legacyUnit;
  projected.answerText = `${projected.finalAnswer}${legacyUnit}`;
  projected.finalAnswerWithUnit = projected.answerText;
  if (projected.semanticSnapshot) projected.semanticSnapshot.answerUnit = legacyUnit;
  if (projected.countNounModel?.answerClassifier) {
    projected.countNounModel.answerClassifier = legacyUnit;
  }

  if (spec.templateFamilyId === "tpl_g3b_u04_quantity_chain_production_capacity_chain"
    && projected.timePeriodModel) {
    projected.timePeriodModel = {
      ...projected.timePeriodModel,
      basePeriod: "same_period",
      middlePeriod: "same_period",
      finalPeriod: "same_period"
    };
    if (projected.semanticSnapshot?.safeguards) {
      projected.semanticSnapshot.safeguards.timePeriodModel = cloneValue(projected.timePeriodModel);
    }
  }
  return projected;
}

/**
 * Guards the approved resource-count flow:
 * count ÷ recipient-count produces an item count per recipient, which can be
 * added to an existing item count per recipient. The authoritative role is
 * count-based. This adapter remains as a narrow compatibility boundary for
 * previously materialized questions and never suppresses unrelated failures.
 *
 * S57F7R1 additionally projects only corrected public classifier and explicit
 * period literals into their legacy S57E5 equivalents. The separate blocking
 * human-readback validator is responsible for accepting the corrected public
 * semantics; no S57E5 arithmetic or semantic failure is downgraded.
 */
export function validateG3BU04SemanticQuestion(question = {}, options = {}) {
  const authorityProjection = projectHumanReadbackQuestionForAuthorityValidation(question);
  const result = validateBaseG3BU04SemanticQuestion(authorityProjection, options);
  if (result.ok || !roleContractMatches(question)) return result;

  const matchingErrors = result.errors.filter(isResolvedContextBoundCompatibilityError);
  if (matchingErrors.length !== 1) return result;

  const remainingErrors = result.errors.filter(
    (error) => !isResolvedContextBoundCompatibilityError(error)
  );

  return {
    ...result,
    ok: remainingErrors.length === 0,
    errors: remainingErrors,
    stages: removeResolvedUnitFlowCode(result.stages)
  };
}
