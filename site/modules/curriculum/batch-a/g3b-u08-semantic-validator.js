import {
  G3B_U08_SOURCE_ID,
  getG3BU08SemanticPatternDefinition,
  listG3BU08SemanticPatternDefinitions
} from "./source-pattern-g3b-u08-semantic-extension.js";
import {
  getG3BU08SemanticContextVariant
} from "./g3b-u08-semantic-context-registry.js";
import {
  generateG3BU08HiddenSemanticBatch,
  generateG3BU08HiddenSemanticQuestion
} from "./g3b-u08-semantic-generator.js";

export const G3B_U08_SEMANTIC_VALIDATOR_VERSION = "s58e-g3b-u08-semantic-validator-v1";

export const G3B_U08_SEMANTIC_VALIDATION_STAGES = Object.freeze([
  Object.freeze({ stage: 1, name: "identity_and_schema" }),
  Object.freeze({ stage: 2, name: "lifecycle_and_scope" }),
  Object.freeze({ stage: 3, name: "representation_and_numeric_boundary" }),
  Object.freeze({ stage: 4, name: "equation_and_answer" }),
  Object.freeze({ stage: 5, name: "semantic_roles" }),
  Object.freeze({ stage: 6, name: "unit_classifier_and_language" }),
  Object.freeze({ stage: 7, name: "specialized_estimation_and_comparison" }),
  Object.freeze({ stage: 8, name: "final_public_contract" })
]);

export const G3B_U08_SEMANTIC_BLOCKING_CODES = Object.freeze([
  "G3BU08_REQUIRED_FIELD_MISSING",
  "G3BU08_SOURCE_ID_MISMATCH",
  "G3BU08_UNIT_IDENTITY_MISMATCH",
  "G3BU08_PATTERN_KIND_MISMATCH",
  "G3BU08_KP_NOT_APPROVED",
  "G3BU08_FAMILY_NOT_FROZEN",
  "G3BU08_PATTERN_GROUP_MISMATCH",
  "G3BU08_ARBITRARY_PATTERN_SPEC_INJECTION",
  "G3BU08_GENERAL_TWO_STEP_LEAKAGE",
  "G3BU08_NON_HORIZONTAL_REPRESENTATION",
  "G3BU08_VERTICAL_ALGORITHM_FORBIDDEN",
  "G3BU08_TWO_DIGIT_MULTIPLIER_FORBIDDEN",
  "G3BU08_TWO_DIGIT_DIVISOR_FORBIDDEN",
  "G3BU08_PUBLIC_REMAINDER_APPLICATION_FORBIDDEN",
  "G3BU08_DIVISION_NOT_EXACT",
  "G3BU08_NON_POSITIVE_INTEGER_DOMAIN",
  "G3BU08_DECIMAL_FRACTION_PERCENT_LEAKAGE",
  "G3BU08_NUMERIC_BOUND_EXCEEDED",
  "G3BU08_EQUATION_SHAPE_MISMATCH",
  "G3BU08_COMPUTED_ANSWER_MISMATCH",
  "G3BU08_ANSWER_MODEL_MISMATCH",
  "G3BU08_UNKNOWN_ROLE_MISMATCH",
  "G3BU08_QUANTITY_ROLE_MISMATCH",
  "G3BU08_GROUP_ROLE_CONFUSION",
  "G3BU08_COMPARISON_BASE_ROLE_CONFUSION",
  "G3BU08_PARTICIPANT_SCOPE_AMBIGUOUS",
  "G3BU08_UNIT_FLOW_MISMATCH",
  "G3BU08_MEASURE_DIMENSION_MISMATCH",
  "G3BU08_CLASSIFIER_MISMATCH",
  "G3BU08_SEGMENT_LENGTH_WORDING_UNNATURAL",
  "G3BU08_SUCCESS_EVENT_PHRASE_UNNATURAL",
  "G3BU08_SUCCESS_EVENT_CLASSIFIER_MISMATCH",
  "G3BU08_UNRESOLVED_PLACEHOLDER",
  "G3BU08_ESTIMATION_DIRECTION_INVALID",
  "G3BU08_ESTIMATION_CONCLUSION_UNSUPPORTED",
  "G3BU08_ESTIMATION_BENCHMARK_CORRECTION_INCOMPLETE",
  "G3BU08_SAME_PRICE_NOT_EXPLICIT",
  "G3BU08_COMPARISON_DIMENSION_MISMATCH",
  "G3BU08_COMPARISON_TIE_NOT_ALLOWED",
  "G3BU08_COMPARISON_NO_UNIQUE_WINNER",
  "G3BU08_FINAL_UNIT_OR_CONCLUSION_MISSING",
  "G3BU08_INTERNAL_ID_LEAKAGE",
  "G3BU08_PURE_NUMERIC_FALLBACK_FORBIDDEN",
  "G3BU08_SEMANTIC_SNAPSHOT_INCOMPLETE"
]);

export const G3B_U08_SEMANTIC_WARNING_CODES = Object.freeze([
  "G3BU08_SURFACE_WORDING_REPETITIVE",
  "G3BU08_CONTEXT_DOMAIN_REPETITIVE",
  "G3BU08_NUMBER_PATTERN_REPETITIVE"
]);

const APPROVED_KP_IDS = new Set(listG3BU08SemanticPatternDefinitions().map((spec) => spec.knowledgePointId));
const GROUP_COUNT_KP = "kp_g3b_u08_group_count_from_total";
const PER_GROUP_KP = "kp_g3b_u08_per_group_from_total";
const REVERSE_BASE_KP = "kp_g3b_u08_reverse_base_from_multiple";
const ESTIMATION_KP = "kp_g3b_u08_shopping_estimation";
const COMPARISON_KP = "kp_g3b_u08_same_price_value_comparison";

const REQUIRED_COMMON_FIELDS = Object.freeze([
  "sourceId",
  "unitCode",
  "kind",
  "patternSpecId",
  "patternGroupId",
  "knowledgePointId",
  "templateFamilyId",
  "contextVariantId",
  "promptText",
  "equationModel",
  "quantities",
  "answerModelShape",
  "finalAnswerWithUnit",
  "representation",
  "selectorStatus",
  "generatorRouting",
  "productionUse",
  "semanticSnapshot"
]);

const ANSWER_MODEL_FIELDS = Object.freeze({
  semantic_single_integer_with_unit: Object.freeze([
    "equationModel",
    "finalAnswer",
    "finalAnswerUnit",
    "finalAnswerWithUnit",
    "semanticSnapshot"
  ]),
  semantic_estimation_judgment: Object.freeze([
    "estimateEquationModel",
    "estimateValue",
    "judgment",
    "finalAnswerWithUnit",
    "semanticSnapshot"
  ]),
  semantic_same_price_comparison: Object.freeze([
    "optionAEquationModel",
    "optionATotal",
    "optionBEquationModel",
    "optionBTotal",
    "comparisonDimension",
    "winner",
    "conclusionZh",
    "semanticSnapshot"
  ])
});

function issue(code, stage, path, message) {
  return { code, severity: "error", stage, path, message };
}

function warning(code, path, message) {
  return { code, severity: "warning", path, message };
}

function hasOwn(object, key) {
  return Object.prototype.hasOwnProperty.call(object ?? {}, key);
}

function add(errors, code, stage, path, message) {
  errors.push(issue(code, stage, path, message));
}

function numericValues(question) {
  return Object.values(question.quantities ?? {}).filter((value) => typeof value === "number");
}

function expectedUnit(question, scenario) {
  if (question.knowledgePointId === ESTIMATION_KP) return "元";
  return scenario?.answerUnit ?? null;
}

function expectedOperatorSignature(spec) {
  if (!spec) return null;
  if (spec.equationShape === "a/b") return "÷";
  if (spec.equationShape === "a*b vs c*d") return "comparison";
  return "×";
}

function stageResult(stage, errors) {
  return {
    stage: stage.stage,
    name: stage.name,
    ok: errors.length === 0,
    blockingErrors: errors
  };
}

function validateStage1(question, spec) {
  const errors = [];
  for (const field of REQUIRED_COMMON_FIELDS) {
    if (!hasOwn(question, field) || question[field] === null || question[field] === "") {
      add(errors, "G3BU08_REQUIRED_FIELD_MISSING", 1, field, `Required field '${field}' is missing.`);
    }
  }
  if (question.sourceId !== G3B_U08_SOURCE_ID) {
    add(errors, "G3BU08_SOURCE_ID_MISMATCH", 1, "sourceId", "Question sourceId does not match G3B-U08.");
  }
  if (question.unitCode !== "3B-U08") {
    add(errors, "G3BU08_UNIT_IDENTITY_MISMATCH", 1, "unitCode", "Question unit identity does not match 3B-U08.");
  }
  if (question.kind !== "g3bU08SemanticApplication") {
    add(errors, "G3BU08_PATTERN_KIND_MISMATCH", 1, "kind", "Question kind is not the approved G3B-U08 semantic application kind.");
  }
  if (spec && question.templateFamilyId !== spec.templateFamilyId) {
    add(errors, "G3BU08_FAMILY_NOT_FROZEN", 1, "templateFamilyId", "Question template family does not match the frozen PatternSpec family.");
  }
  return errors;
}

function validateStage2(question, spec) {
  const errors = [];
  if (!APPROVED_KP_IDS.has(question.knowledgePointId)) {
    add(errors, "G3BU08_KP_NOT_APPROVED", 2, "knowledgePointId", "KnowledgePoint is outside the six approved G3B-U08 application KPs.");
  }
  if (!spec) {
    add(errors, "G3BU08_ARBITRARY_PATTERN_SPEC_INJECTION", 2, "patternSpecId", "Question references an unregistered or injected PatternSpec.");
  } else {
    if (question.patternGroupId !== spec.patternGroupId) {
      add(errors, "G3BU08_PATTERN_GROUP_MISMATCH", 2, "patternGroupId", "PatternGroup does not match the registered PatternSpec.");
    }
    if (question.knowledgePointId !== spec.knowledgePointId) {
      add(errors, "G3BU08_KP_NOT_APPROVED", 2, "knowledgePointId", "Question KnowledgePoint does not match the registered PatternSpec.");
    }
    if (question.selectorStatus !== "hidden" || question.productionUse !== "forbidden" || question.generatorRouting !== "hidden_only_not_canonical") {
      add(errors, "G3BU08_ARBITRARY_PATTERN_SPEC_INJECTION", 2, "productionUse", "Question escaped the approved hidden pre-promotion lifecycle.");
    }
  }
  const scopeText = [
    ...(question.scopeMarkers ?? []),
    ...(question.metadata?.patternTags ?? []),
    question.generalTwoStepMixedOperation === true ? "general_two_step_mixed_operation" : ""
  ].join(" ");
  if (/general_two_step_mixed_operation|g3b_u04_two_step_leakage/i.test(scopeText)) {
    add(errors, "G3BU08_GENERAL_TWO_STEP_LEAKAGE", 2, "scopeMarkers", "General G3B-U04-style two-step scope leaked into G3B-U08.");
  }
  return errors;
}

function validateStage3(question, spec) {
  const errors = [];
  const values = question.quantities ?? {};
  const promptAndEquation = `${question.promptText ?? ""} ${question.equationModel ?? ""}`;
  if (question.representation !== "horizontal_only" || question.semanticSnapshot?.representation !== "horizontal_only") {
    add(errors, "G3BU08_NON_HORIZONTAL_REPRESENTATION", 3, "representation", "Only horizontal representation is allowed.");
  }
  if (/直式|長除法|column_algorithm|vertical_(multiplication|division)|long_division/i.test(promptAndEquation + " " + JSON.stringify(question.metadata ?? {}))) {
    add(errors, "G3BU08_VERTICAL_ALGORITHM_FORBIDDEN", 3, "promptText", "Vertical or long-division representation is forbidden.");
  }
  if (spec?.equationShape === "a*b" && Number(values.b) > 9) {
    add(errors, "G3BU08_TWO_DIGIT_MULTIPLIER_FORBIDDEN", 3, "quantities.b", "The repeated-group count must remain one digit.");
  }
  if (["round100(a)*b", "ceil100(a)*b", "(h+d)*b", "(h-d)*b"].includes(spec?.equationShape) && Number(values.b) > 9) {
    add(errors, "G3BU08_TWO_DIGIT_MULTIPLIER_FORBIDDEN", 3, "quantities.b", "The shopping item count must remain one digit.");
  }
  if (spec?.equationShape === "a*b vs c*d" && (Number(values.a) > 9 || Number(values.c) > 9)) {
    add(errors, "G3BU08_TWO_DIGIT_MULTIPLIER_FORBIDDEN", 3, "quantities", "Each option count must remain one digit.");
  }
  if (spec?.equationShape === "a/b" && Number(values.b) > 9) {
    add(errors, "G3BU08_TWO_DIGIT_DIVISOR_FORBIDDEN", 3, "quantities.b", "The divisor must remain one digit.");
  }
  if (question.remainder !== undefined || /餘數|餘\s*\d/.test(promptAndEquation)) {
    add(errors, "G3BU08_PUBLIC_REMAINDER_APPLICATION_FORBIDDEN", 3, "remainder", "Public remainder application is outside the approved unit scope.");
  }
  if (spec?.equationShape === "a/b" && Number.isSafeInteger(values.a) && Number.isSafeInteger(values.b) && values.b !== 0 && values.a % values.b !== 0) {
    add(errors, "G3BU08_DIVISION_NOT_EXACT", 3, "quantities", "Division application must divide exactly.");
  }
  if (numericValues(question).some((value) => !Number.isSafeInteger(value) || value <= 0)) {
    add(errors, "G3BU08_NON_POSITIVE_INTEGER_DOMAIN", 3, "quantities", "All generated quantities must be positive integers.");
  }
  if (numericValues(question).some((value) => !Number.isInteger(value)) || /小數|分數|百分|%/.test(promptAndEquation)) {
    add(errors, "G3BU08_DECIMAL_FRACTION_PERCENT_LEAKAGE", 3, "quantities", "Decimals, fractions and percentages are outside the approved scope.");
  }
  if (numericValues(question).some((value) => Math.abs(value) > 999) || (question.intermediateResults ?? []).some((value) => typeof value === "number" && Math.abs(value) > 999)) {
    add(errors, "G3BU08_NUMERIC_BOUND_EXCEEDED", 3, "quantities", "A final or intermediate value exceeds 999.");
  }
  return errors;
}

function computedAnswerMatches(question, spec) {
  const v = question.quantities ?? {};
  if (!spec) return false;
  if (spec.equationShape === "a*b") return question.finalAnswer === v.a * v.b;
  if (spec.equationShape === "a/b") return v.b > 0 && v.a % v.b === 0 && question.finalAnswer === v.a / v.b;
  if (spec.equationShape === "round100(a)*b") {
    return question.estimateValue === v.h * v.b && question.finalAnswer === question.estimateValue;
  }
  if (spec.equationShape === "ceil100(a)*b") {
    return question.estimateValue === v.c && v.c === v.h * v.b && v.a * v.b <= v.c && question.finalAnswer === question.estimateValue;
  }
  if (spec.equationShape === "(h+d)*b" || spec.equationShape === "(h-d)*b") {
    return question.exactDifference === v.d * v.b && question.finalAnswer === question.exactDifference;
  }
  if (spec.equationShape === "a*b vs c*d") {
    const aTotal = v.a * v.b;
    const bTotal = v.c * v.d;
    const winner = aTotal > bTotal ? "option_a" : "option_b";
    return question.optionATotal === aTotal
      && question.optionBTotal === bTotal
      && aTotal !== bTotal
      && question.winner === winner
      && question.finalAnswer === winner;
  }
  return false;
}

function validateStage4(question, spec) {
  const errors = [];
  const signature = expectedOperatorSignature(spec);
  const equation = String(question.equationModel ?? "");
  const signatureMismatch = !spec
    || question.semanticSnapshot?.equationShape !== spec.equationShape
    || (signature === "÷" && !equation.includes("÷"))
    || (signature === "×" && !equation.includes("×"))
    || (signature === "comparison" && (equation.match(/×/g)?.length ?? 0) < 2);
  if (signatureMismatch) {
    add(errors, "G3BU08_EQUATION_SHAPE_MISMATCH", 4, "equationModel", "Equation representation does not match the PatternSpec equation shape.");
  }
  if (!computedAnswerMatches(question, spec)) {
    add(errors, "G3BU08_COMPUTED_ANSWER_MISMATCH", 4, "finalAnswer", "Computed answer does not match the bound quantities.");
  }
  const required = ANSWER_MODEL_FIELDS[spec?.answerModel?.shape] ?? [];
  if (question.answerModelShape !== spec?.answerModel?.shape || required.some((field) => !hasOwn(question, field) || question[field] === null || question[field] === "")) {
    add(errors, "G3BU08_ANSWER_MODEL_MISMATCH", 4, "answerModelShape", "Question does not satisfy the PatternSpec answer model.");
  }
  if (["more_by", "less_by"].includes(question.judgment) && (!question.exactEquationModel || !Number.isSafeInteger(question.exactDifference))) {
    add(errors, "G3BU08_ANSWER_MODEL_MISMATCH", 4, "exactDifference", "Difference judgments require exact equation and difference fields.");
  }
  return errors;
}

function roleBindingsMatch(question, spec) {
  if (!spec || !question.quantityRoleBindings) return false;
  const expectedKeys = Object.keys(spec.quantityRoles).sort();
  const actualKeys = Object.keys(question.quantityRoleBindings).sort();
  if (JSON.stringify(expectedKeys) !== JSON.stringify(actualKeys)) return false;
  return expectedKeys.every((key) => question.quantityRoleBindings[key]?.semanticRole === spec.quantityRoles[key]);
}

function reverseBaseTarget(scenario, familyId) {
  if (!scenario) return null;
  if (familyId === "tpl_g3b_u08_reverse_base_price_multiple") return scenario.bindings.item2;
  if (familyId === "tpl_g3b_u08_reverse_base_quantity_multiple") return scenario.bindings.person2;
  if (familyId === "tpl_g3b_u08_reverse_base_length_multiple") return scenario.bindings.item2;
  if (familyId === "tpl_g3b_u08_reverse_base_capacity_multiple") return scenario.bindings.container2;
  return null;
}

function validateStage5(question, spec, scenario) {
  const errors = [];
  if (spec && (question.unknownRole !== spec.unknownRole || question.semanticSnapshot?.unknownRole !== spec.unknownRole)) {
    add(errors, "G3BU08_UNKNOWN_ROLE_MISMATCH", 5, "unknownRole", "Unknown quantity role does not match the PatternSpec.");
  }
  if (!roleBindingsMatch(question, spec)) {
    add(errors, "G3BU08_QUANTITY_ROLE_MISMATCH", 5, "quantityRoleBindings", "Quantity-role bindings do not match the PatternSpec.");
  }
  const prompt = String(question.promptText ?? "");
  if (question.knowledgePointId === GROUP_COUNT_KP && /平均.*每|每人.*多少|每(?:瓶|杯|碗|段).*多少/.test(prompt)) {
    add(errors, "G3BU08_GROUP_ROLE_CONFUSION", 5, "promptText", "Group-count question was phrased as a per-group quantity question.");
  }
  if (question.knowledgePointId === PER_GROUP_KP && /可以(?:做|剪|裝).*幾|成功了幾/.test(prompt)) {
    add(errors, "G3BU08_GROUP_ROLE_CONFUSION", 5, "promptText", "Per-group quantity question was phrased as a group-count question.");
  }
  if (question.knowledgePointId === REVERSE_BASE_KP) {
    const target = reverseBaseTarget(scenario, question.templateFamilyId);
    const questionClause = prompt.split(/[，。]/).at(-1) ?? prompt;
    if (!target || !questionClause.includes(target) || !/的\d倍/.test(prompt)) {
      add(errors, "G3BU08_COMPARISON_BASE_ROLE_CONFUSION", 5, "promptText", "Multiplicative comparison does not clearly ask for the base quantity.");
    }
  }
  if (/和另外\d+人共\d+人|另外的人共|包含誰不清楚|不含小安/.test(prompt)) {
    add(errors, "G3BU08_PARTICIPANT_SCOPE_AMBIGUOUS", 5, "promptText", "Participant scope is ambiguous.");
  }
  return errors;
}

function classifierExpectedInQuestion(question, scenario) {
  if (!scenario) return null;
  if (question.templateFamilyId === "tpl_g3b_u08_group_count_score_events") return scenario.bindings.eventUnit;
  if (question.templateFamilyId === "tpl_g3b_u08_group_count_craft_products") return scenario.bindings.productUnit;
  if (question.templateFamilyId === "tpl_g3b_u08_group_count_equal_segments") return "段";
  if (question.templateFamilyId === "tpl_g3b_u08_group_count_packaging") return scenario.bindings.packageUnit;
  return scenario.answerUnit;
}

function validateStage6(question, spec, scenario) {
  const errors = [];
  const prompt = String(question.promptText ?? "");
  const unit = expectedUnit(question, scenario);
  if (!unit || question.finalAnswerUnit !== unit) {
    add(errors, "G3BU08_UNIT_FLOW_MISMATCH", 6, "finalAnswerUnit", "Final answer unit does not match the scenario unit flow.");
  }
  if (question.knowledgePointId === COMPARISON_KP && question.comparisonDimension !== scenario?.comparisonDimension) {
    add(errors, "G3BU08_MEASURE_DIMENSION_MISMATCH", 6, "comparisonDimension", "Comparison measure dimension does not match the registered context.");
  }
  const expectedClassifier = classifierExpectedInQuestion(question, scenario);
  if (expectedClassifier && !String(question.finalAnswerWithUnit ?? "").includes(expectedClassifier) && question.knowledgePointId !== COMPARISON_KP) {
    add(errors, "G3BU08_CLASSIFIER_MISMATCH", 6, "finalAnswerWithUnit", "Answer text does not carry the expected classifier or measurement unit.");
  }
  if (/每段剪成/.test(prompt)) {
    add(errors, "G3BU08_SEGMENT_LENGTH_WORDING_UNNATURAL", 6, "promptText", "Use '每段長…' rather than '每段剪成…'.");
  }
  if (["tpl_g3b_u08_total_score_per_success", "tpl_g3b_u08_group_count_score_events"].includes(question.templateFamilyId)) {
    const action = scenario?.bindings?.successAction;
    if (!action || !prompt.includes(action) || /成功一(?:球|題|關)/.test(prompt)) {
      add(errors, "G3BU08_SUCCESS_EVENT_PHRASE_UNNATURAL", 6, "promptText", "Score event phrase is not a natural registered action.");
    }
  }
  if (question.templateFamilyId === "tpl_g3b_u08_group_count_score_events") {
    const eventUnit = scenario?.bindings?.eventUnit;
    if (!eventUnit || question.finalAnswerUnit !== eventUnit || !prompt.includes(`幾${eventUnit}`)) {
      add(errors, "G3BU08_SUCCESS_EVENT_CLASSIFIER_MISMATCH", 6, "promptText", "Score-event action and answer classifier do not match.");
    }
  }
  if (/\{[^}]+\}/.test(prompt)) {
    add(errors, "G3BU08_UNRESOLVED_PLACEHOLDER", 6, "promptText", "Prompt contains an unresolved placeholder.");
  }
  return errors;
}

function estimationDirectionValid(question, spec) {
  const v = question.quantities ?? {};
  if (spec?.equationShape === "round100(a)*b") return Math.round(v.a / 100) * 100 === v.h && question.estimateValue === v.h * v.b;
  if (spec?.equationShape === "ceil100(a)*b") return v.h % 100 === 0 && v.a < v.h && question.estimateValue === v.h * v.b && v.c === question.estimateValue;
  if (spec?.equationShape === "(h+d)*b") return v.unitPrice === v.h + v.d;
  if (spec?.equationShape === "(h-d)*b") return v.unitPrice === v.h - v.d;
  return true;
}

function estimationConclusionSupported(question, spec) {
  const v = question.quantities ?? {};
  if (spec?.equationShape === "round100(a)*b") return question.judgment === "approximately" && /大約/.test(question.finalAnswerWithUnit ?? "");
  if (spec?.equationShape === "ceil100(a)*b") return question.judgment === "enough" && v.a * v.b <= v.c && /夠/.test(question.finalAnswerWithUnit ?? "");
  if (spec?.equationShape === "(h+d)*b") return question.judgment === "more_by" && /多/.test(question.finalAnswerWithUnit ?? "");
  if (spec?.equationShape === "(h-d)*b") return question.judgment === "less_by" && /少/.test(question.finalAnswerWithUnit ?? "");
  return true;
}

function benchmarkCorrectionComplete(question, spec) {
  const v = question.quantities ?? {};
  if (["(h+d)*b", "(h-d)*b"].includes(spec?.equationShape)) {
    return question.exactDifference === v.d * v.b && Boolean(question.exactEquationModel);
  }
  if (spec?.equationShape === "ceil100(a)*b") return question.exactDifference === v.c - v.a * v.b && Boolean(question.exactEquationModel);
  if (spec?.equationShape === "round100(a)*b") return Boolean(question.exactEquationModel) && Number.isSafeInteger(question.exactDifference);
  return true;
}

function validateStage7(question, spec, scenario) {
  const errors = [];
  if (question.knowledgePointId === ESTIMATION_KP) {
    if (!estimationDirectionValid(question, spec)) {
      add(errors, "G3BU08_ESTIMATION_DIRECTION_INVALID", 7, "quantities", "Estimation direction or hundred benchmark is invalid.");
    }
    if (!estimationConclusionSupported(question, spec)) {
      add(errors, "G3BU08_ESTIMATION_CONCLUSION_UNSUPPORTED", 7, "judgment", "Estimation values do not support the stated conclusion.");
    }
    if (!benchmarkCorrectionComplete(question, spec)) {
      add(errors, "G3BU08_ESTIMATION_BENCHMARK_CORRECTION_INCOMPLETE", 7, "exactDifference", "Benchmark correction is incomplete or arithmetically inconsistent.");
    }
  }
  if (question.knowledgePointId === COMPARISON_KP) {
    if (!/價格相同/.test(question.promptText ?? "")) {
      add(errors, "G3BU08_SAME_PRICE_NOT_EXPLICIT", 7, "promptText", "Same total price must be explicit in the prompt.");
    }
    if (!scenario?.comparisonDimension || question.comparisonDimension !== scenario.comparisonDimension) {
      add(errors, "G3BU08_COMPARISON_DIMENSION_MISMATCH", 7, "comparisonDimension", "The two options do not use the registered comparison dimension.");
    }
    if (question.optionATotal === question.optionBTotal) {
      add(errors, "G3BU08_COMPARISON_TIE_NOT_ALLOWED", 7, "optionTotals", "Same-price comparison may not result in a tie.");
    }
    const expectedWinner = question.optionATotal > question.optionBTotal ? "option_a" : "option_b";
    if (!["option_a", "option_b"].includes(question.winner) || question.winner !== expectedWinner) {
      add(errors, "G3BU08_COMPARISON_NO_UNIQUE_WINNER", 7, "winner", "Comparison must identify exactly one mathematically correct winner.");
    }
  }
  return errors;
}

function snapshotComplete(question, spec, scenario) {
  const snapshot = question.semanticSnapshot;
  if (!snapshot || !spec || !scenario) return false;
  const required = [
    "sourceId",
    "knowledgePointId",
    "patternGroupId",
    "patternSpecId",
    "templateFamilyId",
    "semanticSignature",
    "equationShape",
    "unknownRole",
    "quantityRoleBindings",
    "eventSequence",
    "contextVariantId",
    "contextDomain",
    "answerModelShape",
    "representation"
  ];
  return required.every((field) => hasOwn(snapshot, field) && snapshot[field] !== null && snapshot[field] !== "")
    && snapshot.patternSpecId === spec.patternSpecId
    && snapshot.contextVariantId === scenario.contextVariantId;
}

function validateStage8(question, spec, scenario) {
  const errors = [];
  const answer = String(question.finalAnswerWithUnit ?? "");
  if (!answer || (question.knowledgePointId !== COMPARISON_KP && question.finalAnswerUnit && !answer.includes(question.finalAnswerUnit)) || (question.knowledgePointId === COMPARISON_KP && !question.conclusionZh)) {
    add(errors, "G3BU08_FINAL_UNIT_OR_CONCLUSION_MISSING", 8, "finalAnswerWithUnit", "Final answer is missing its unit or comparison conclusion.");
  }
  const publicText = `${question.promptText ?? ""} ${question.blankedDisplayText ?? ""} ${question.answerText ?? ""}`;
  if (/\b(?:kp|pg|ps|tpl|ctx)_g3b_u08_[a-z0-9_]+\b/i.test(publicText)) {
    add(errors, "G3BU08_INTERNAL_ID_LEAKAGE", 8, "promptText", "Internal curriculum IDs leaked into public-facing text.");
  }
  const normalizedPrompt = String(question.promptText ?? "").replace(/\s+/g, "").replace(/[？?。]/g, "");
  const normalizedEquation = String(question.equationModel ?? "").replace(/\s+/g, "").replace(/[？?。]/g, "");
  if (question.fallback === true || question.metadata?.fallback === true || normalizedPrompt === normalizedEquation || !/[\u4e00-\u9fff]/.test(normalizedPrompt)) {
    add(errors, "G3BU08_PURE_NUMERIC_FALLBACK_FORBIDDEN", 8, "promptText", "Semantic generation may not fall back to a pure numeric exercise.");
  }
  if (!snapshotComplete(question, spec, scenario)) {
    add(errors, "G3BU08_SEMANTIC_SNAPSHOT_INCOMPLETE", 8, "semanticSnapshot", "Semantic snapshot is incomplete or inconsistent.");
  }
  return errors;
}

function validatedAnswerFor(question) {
  if (question.answerModelShape === "semantic_same_price_comparison") {
    return {
      answerModelShape: question.answerModelShape,
      winner: question.winner,
      conclusionZh: question.conclusionZh,
      optionATotal: question.optionATotal,
      optionBTotal: question.optionBTotal
    };
  }
  if (question.answerModelShape === "semantic_estimation_judgment") {
    return {
      answerModelShape: question.answerModelShape,
      judgment: question.judgment,
      estimateValue: question.estimateValue,
      exactDifference: question.exactDifference,
      finalAnswerWithUnit: question.finalAnswerWithUnit
    };
  }
  return {
    answerModelShape: question.answerModelShape,
    finalAnswer: question.finalAnswer,
    finalAnswerUnit: question.finalAnswerUnit,
    finalAnswerWithUnit: question.finalAnswerWithUnit
  };
}

export function validateG3BU08SemanticQuestion(question = {}) {
  const spec = getG3BU08SemanticPatternDefinition(question.patternSpecId ?? question.metadata?.patternId);
  const scenario = getG3BU08SemanticContextVariant(question.contextVariantId);
  const validators = [
    () => validateStage1(question, spec),
    () => validateStage2(question, spec),
    () => validateStage3(question, spec),
    () => validateStage4(question, spec),
    () => validateStage5(question, spec, scenario),
    () => validateStage6(question, spec, scenario),
    () => validateStage7(question, spec, scenario),
    () => validateStage8(question, spec, scenario)
  ];
  const stageResults = G3B_U08_SEMANTIC_VALIDATION_STAGES.map((stage, index) => stageResult(stage, validators[index]()));
  const blockingErrors = stageResults.flatMap((stage) => stage.blockingErrors);
  return {
    valid: blockingErrors.length === 0,
    blockingErrors,
    warnings: [],
    stageResults,
    validatedAnswer: blockingErrors.length === 0 ? validatedAnswerFor(question) : null,
    validatorVersion: G3B_U08_SEMANTIC_VALIDATOR_VERSION,
    fallbackQuestionAllowed: false
  };
}

function repetitionWarnings(questions) {
  const warnings = [];
  if (questions.length < 4) return warnings;
  const promptCounts = new Map();
  const domainCounts = new Map();
  const equationCounts = new Map();
  for (const question of questions) {
    const normalized = String(question.promptText ?? "").replace(/\d+/g, "#");
    promptCounts.set(normalized, (promptCounts.get(normalized) ?? 0) + 1);
    domainCounts.set(question.contextDomain, (domainCounts.get(question.contextDomain) ?? 0) + 1);
    equationCounts.set(question.equationModel, (equationCounts.get(question.equationModel) ?? 0) + 1);
  }
  if ([...promptCounts.values()].some((count) => count > Math.ceil(questions.length * 0.5))) {
    warnings.push(warning("G3BU08_SURFACE_WORDING_REPETITIVE", "questions", "More than half of the batch shares one normalized surface form."));
  }
  if ([...domainCounts.values()].some((count) => count > Math.ceil(questions.length * 0.8))) {
    warnings.push(warning("G3BU08_CONTEXT_DOMAIN_REPETITIVE", "questions", "More than eighty percent of the batch uses one context domain."));
  }
  if ([...equationCounts.values()].some((count) => count > Math.ceil(questions.length * 0.3))) {
    warnings.push(warning("G3BU08_NUMBER_PATTERN_REPETITIVE", "questions", "The same equation is repeated too frequently."));
  }
  return warnings;
}

export function validateG3BU08SemanticBatch(questions = []) {
  const questionResults = questions.map((question, index) => ({
    index,
    questionId: question.id ?? null,
    result: validateG3BU08SemanticQuestion(question)
  }));
  const blockingErrors = questionResults.flatMap(({ index, result }) => result.blockingErrors.map((entry) => ({ ...entry, questionIndex: index })));
  const warnings = blockingErrors.length === 0 ? repetitionWarnings(questions) : [];
  return {
    valid: blockingErrors.length === 0,
    blockingErrors,
    warnings,
    questionResults,
    validatorVersion: G3B_U08_SEMANTIC_VALIDATOR_VERSION,
    fallbackQuestionAllowed: false
  };
}

function acceptedQuestion(question, validation) {
  return {
    ...question,
    phase: "S58E",
    validatorVersion: validation.validatorVersion,
    validationStatus: "accepted",
    semanticSnapshot: {
      ...question.semanticSnapshot,
      validationCodes: [],
      validatorVersion: validation.validatorVersion
    }
  };
}

export function generateG3BU08ValidatedSemanticQuestion(options = {}) {
  const generated = generateG3BU08HiddenSemanticQuestion(options);
  if (!generated.ok) return { ...generated, validation: null };
  const validation = validateG3BU08SemanticQuestion(generated.question);
  if (!validation.valid) {
    return {
      ok: false,
      question: null,
      errors: validation.blockingErrors,
      warnings: [],
      validation
    };
  }
  return {
    ok: true,
    question: acceptedQuestion(generated.question, validation),
    errors: [],
    warnings: validation.warnings,
    validation
  };
}

export function generateG3BU08ValidatedSemanticBatch(options = {}) {
  const generated = generateG3BU08HiddenSemanticBatch(options);
  if (!generated.ok) return { ...generated, validation: null };
  const validation = validateG3BU08SemanticBatch(generated.questions);
  if (!validation.valid) {
    return {
      ok: false,
      questions: [],
      errors: validation.blockingErrors,
      warnings: [],
      validation
    };
  }
  return {
    ...generated,
    questions: generated.questions.map((question) => acceptedQuestion(question, validateG3BU08SemanticQuestion(question))),
    warnings: validation.warnings,
    validation
  };
}
