import {
  G3B_U04_SOURCE_ID,
  getG3BU04SemanticPatternDefinition
} from "./source-pattern-g3b-u04-semantic-extension.js";
import {
  resolveG3BU04SemanticScenarioProfile
} from "./g3b-u04-semantic-scenarios.js";

export const G3B_U04_SEMANTIC_VALIDATION_STAGES = Object.freeze([
  "structure",
  "role_binding",
  "arithmetic",
  "unit_flow",
  "event_semantics",
  "realism",
  "language_readback",
  "answer_reconstruction"
]);

export const G3B_U04_SEMANTIC_BLOCKING_ERROR_CODES = Object.freeze([
  "G3B_U04_SEM_TEMPLATE_UNREGISTERED",
  "G3B_U04_SEM_KP_UNREGISTERED",
  "G3B_U04_SEM_EQUATION_SHAPE_MISMATCH",
  "G3B_U04_SEM_UNKNOWN_ROLE_MISMATCH",
  "G3B_U04_SEM_QUANTITY_ROLE_MISSING",
  "G3B_U04_SEM_ACTOR_OWNERSHIP_MISMATCH",
  "G3B_U04_SEM_EVENT_ORDER_MISMATCH",
  "G3B_U04_SEM_UNIT_FLOW_MISMATCH",
  "G3B_U04_SEM_ANSWER_UNIT_MISMATCH",
  "G3B_U04_SEM_COUNT_NOUN_MISMATCH",
  "G3B_U04_SEM_DIVISION_NOT_EXACT",
  "G3B_U04_SEM_NON_POSITIVE_OR_NEGATIVE_RESULT",
  "G3B_U04_SEM_RANGE_EXCEEDED",
  "G3B_U04_SEM_PROMOTION_INCONSISTENT",
  "G3B_U04_SEM_CONSERVATION_MISMATCH",
  "G3B_U04_SEM_COMPARISON_DIRECTION_MISMATCH",
  "G3B_U04_SEM_TIME_PERIOD_MISMATCH",
  "G3B_U04_SEM_AGE_IMPLAUSIBLE",
  "G3B_U04_SEM_PACKAGE_QUANTITY_IMPLAUSIBLE",
  "G3B_U04_SEM_CONTEXT_OBJECT_INCOMPATIBLE",
  "G3B_U04_SEM_AMBIGUOUS_REFERENT",
  "G3B_U04_SEM_MULTIPLE_QUESTIONS_OR_UNKNOWNS",
  "G3B_U04_SEM_ANSWER_RECONSTRUCTION_FAILED",
  "G3B_U04_SEM_DUPLICATE_SIGNATURE",
  "G3B_U04_SEM_SOURCE_LABEL_MISMATCH_UNRESOLVED"
]);

export const G3B_U04_SEMANTIC_WARNING_CODES = Object.freeze([
  "G3B_U04_STYLE_REPETITIVE_WORDING",
  "G3B_U04_STYLE_CONTEXT_IMBALANCE",
  "G3B_U04_STYLE_LONG_SENTENCE"
]);

export const G3B_U04_SEMANTIC_RUNTIME_ERROR_CODES = Object.freeze([
  "G3B_U04_SEM_PATTERN_SPEC_UNREGISTERED",
  "G3B_U04_SEM_GENERATION_EXHAUSTED",
  "G3B_U04_SEM_SCENARIO_PROFILE_UNREGISTERED",
  "G3B_U04_SEM_PROMPT_PLACEHOLDER_UNRESOLVED",
  "G3B_U04_SEM_SNAPSHOT_INCOMPLETE"
]);

const APPROVED_KP_IDS = new Set([
  "kp_g3b_u04_add_then_divide",
  "kp_g3b_u04_multiply_then_divide_average_unit_price",
  "kp_g3b_u04_subtract_then_divide",
  "kp_g3b_u04_divide_then_add",
  "kp_g3b_u04_total_minus_shared_amount",
  "kp_g3b_u04_group_total_minus_remaining",
  "kp_g3b_u04_consecutive_multiplication",
  "kp_g3b_u04_composite_multiplicative_ratio",
  "kp_g3b_u04_multiplicative_quantity_chain"
]);

const PACKAGE_ROLE_TOKENS = Object.freeze([
  "items_per_package",
  "items_per_pack",
  "items_per_tray",
  "members_per_team",
  "participants_per_group",
  "groups_per_container",
  "rows_per_box",
  "units_per_group"
]);

function cloneValue(value) {
  if (Array.isArray(value)) return value.map((item) => cloneValue(item));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, cloneValue(nested)]));
  }
  return value;
}

function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function expectedEquationModel(shape, q) {
  if (shape === "(a+b)/c") return `(${q.a} + ${q.b}) ÷ ${q.c}`;
  if (shape === "(p*q)/r") return `(${q.p} × ${q.q}) ÷ ${q.r}`;
  if (shape === "(p*q)/(q+g)") return `(${q.p} × ${q.q}) ÷ (${q.q} + ${q.g})`;
  if (shape === "(a-b)/c") return `(${q.a} - ${q.b}) ÷ ${q.c}`;
  if (shape === "a/b+c") return `${q.a} ÷ ${q.b} + ${q.c}`;
  if (shape === "a-(b/c)") return `${q.a} - (${q.b} ÷ ${q.c})`;
  if (shape === "(a/b)-c") return `(${q.a} ÷ ${q.b}) - ${q.c}`;
  if (shape === "a*b*c") return `${q.a} × ${q.b} × ${q.c}`;
  if (shape === "m*n") return `${q.m} × ${q.n}`;
  if (shape === "a*m*n") return `${q.a} × ${q.m} × ${q.n}`;
  return null;
}

function reconstruct(shape, q = {}) {
  const positiveInt = (value) => Number.isSafeInteger(value) && value > 0;
  const requiredSymbols = {
    "(a+b)/c": ["a", "b", "c"],
    "(p*q)/r": ["p", "q", "r"],
    "(p*q)/(q+g)": ["p", "q", "g"],
    "(a-b)/c": ["a", "b", "c"],
    "a/b+c": ["a", "b", "c"],
    "a-(b/c)": ["a", "b", "c"],
    "(a/b)-c": ["a", "b", "c"],
    "a*b*c": ["a", "b", "c"],
    "m*n": ["m", "n"],
    "a*m*n": ["a", "m", "n"]
  }[shape] ?? [];
  if (requiredSymbols.some((symbol) => !positiveInt(q[symbol]))) {
    return { ok: false, requiredSymbols, exact: false, finalAnswer: null, intermediateResults: [], equationModel: expectedEquationModel(shape, q) };
  }
  let exact = true;
  let intermediateResults = [];
  let finalAnswer = null;
  if (shape === "(a+b)/c") {
    const total = q.a + q.b;
    exact = total % q.c === 0;
    finalAnswer = total / q.c;
    intermediateResults = [total, finalAnswer];
  } else if (shape === "(p*q)/r") {
    const total = q.p * q.q;
    exact = total % q.r === 0;
    finalAnswer = total / q.r;
    intermediateResults = [total, finalAnswer];
  } else if (shape === "(p*q)/(q+g)") {
    const total = q.p * q.q;
    const received = q.q + q.g;
    exact = total % received === 0;
    finalAnswer = total / received;
    intermediateResults = [total, received, finalAnswer];
  } else if (shape === "(a-b)/c") {
    const remaining = q.a - q.b;
    exact = remaining % q.c === 0;
    finalAnswer = remaining / q.c;
    intermediateResults = [remaining, finalAnswer];
  } else if (shape === "a/b+c") {
    exact = q.a % q.b === 0;
    const quotient = q.a / q.b;
    finalAnswer = quotient + q.c;
    intermediateResults = [quotient, finalAnswer];
  } else if (shape === "a-(b/c)") {
    exact = q.b % q.c === 0;
    const share = q.b / q.c;
    finalAnswer = q.a - share;
    intermediateResults = [share, finalAnswer];
  } else if (shape === "(a/b)-c") {
    exact = q.a % q.b === 0;
    const groups = q.a / q.b;
    finalAnswer = groups - q.c;
    intermediateResults = [groups, finalAnswer];
  } else if (shape === "a*b*c") {
    const first = q.a * q.b;
    finalAnswer = first * q.c;
    intermediateResults = [first, finalAnswer];
  } else if (shape === "m*n") {
    finalAnswer = q.m * q.n;
    intermediateResults = [q.m, finalAnswer];
  } else if (shape === "a*m*n") {
    const middle = q.a * q.m;
    finalAnswer = middle * q.n;
    intermediateResults = [middle, finalAnswer];
  }
  return {
    ok: Number.isFinite(finalAnswer),
    requiredSymbols,
    exact,
    finalAnswer,
    intermediateResults,
    equationModel: expectedEquationModel(shape, q)
  };
}

function expectedEventActions(shape) {
  if (shape === "(a+b)/c") return ["combine", "equal_share"];
  if (shape === "(p*q)/r") return ["calculate_total_cost", "average_over_received_units"];
  if (shape === "(p*q)/(q+g)") return ["calculate_total_cost", "calculate_received_units", "average_over_received_units"];
  if (shape === "(a-b)/c") return ["subtract", "equal_share_or_group"];
  if (shape === "a/b+c") return ["divide", "add_existing"];
  if (shape === "a-(b/c)") return ["calculate_personal_share", "subtract_personal_share"];
  if (shape === "(a/b)-c") return ["form_groups", "subtract_remaining_groups"];
  if (shape === "a*b*c") return ["multiply_first_two_levels", "multiply_outer_level"];
  if (shape === "m*n") return ["bind_middle_to_base_multiplier", "bind_final_to_middle_multiplier", "compose_multipliers"];
  if (shape === "a*m*n") return ["scale_base_to_middle", "scale_middle_to_final"];
  return [];
}

function expectedAnswerUnit(spec, scenario) {
  const role = spec?.unknownRole ?? "";
  if (spec?.knowledgePointId === "kp_g3b_u04_composite_multiplicative_ratio") return "倍";
  if (/cost|price|money|budget/.test(role)) return "元";
  if (/points/.test(role)) return "點";
  if (/age/.test(role)) return "歲";
  if (/capacity/.test(role)) return scenario?.capacityUnit ?? scenario?.measureUnit ?? "毫升";
  if (/team/.test(role)) return "隊";
  if (/tray/.test(role)) return "盤";
  if (/group_count/.test(role)) return "組";
  if (/package/.test(role)) return scenario?.packageUnit ?? "盒";
  return scenario?.measureUnit ?? scenario?.itemUnit ?? "個";
}

function isCountNounSensitive(unknownRole = "") {
  return /package|team|tray|group_count|total_item_count|total_unit_count|quantity|share/.test(unknownRole);
}

function expectedRoleDimensions(spec, scenario) {
  if (!spec || !scenario) return {};
  return Object.fromEntries(Object.entries(spec.quantityRoles).map(([symbol, semanticRole]) => [
    symbol,
    scenario.quantityBounds[symbol]?.unitDimension ?? null
  ]));
}

function operationDimensionsCompatible(shape, dimensions) {
  if (["(a+b)/c", "(a-b)/c"].includes(shape)) return dimensions.a === dimensions.b && dimensions.c === "count";
  if (shape === "(p*q)/r") return dimensions.p === "currency" && dimensions.q === "count" && dimensions.r === "count";
  if (shape === "(p*q)/(q+g)") return dimensions.p === "currency" && dimensions.q === "count" && dimensions.g === "count";
  if (shape === "a/b+c") return dimensions.b === "count" && dimensions.a === dimensions.c;
  if (shape === "a-(b/c)") return dimensions.b === dimensions.a && dimensions.c === "count";
  if (shape === "(a/b)-c") return dimensions.a === "count" && dimensions.b === "count" && dimensions.c === "count";
  if (shape === "a*b*c") {
    const values = [dimensions.a, dimensions.b, dimensions.c];
    return values.every(Boolean) && values.filter((dimension) => dimension !== "count" && dimension !== "currency").length === 0;
  }
  if (shape === "m*n") return dimensions.m === "dimensionless_times" && dimensions.n === "dimensionless_times";
  if (shape === "a*m*n") return dimensions.m === "dimensionless_times" && dimensions.n === "dimensionless_times" && Boolean(dimensions.a);
  return false;
}

function conservationHolds(spec, q, reconstructed) {
  const family = spec.templateFamilyId;
  if (/sub_div_/.test(family)) return q.a === q.b + q.c * reconstructed.finalAnswer;
  if (/total_minus_share_/.test(family)) return q.a === q.b / q.c + reconstructed.finalAnswer;
  if (/group_minus_remaining_/.test(family)) return q.a / q.b === q.c + reconstructed.finalAnswer;
  if (/div_add_/.test(family)) return reconstructed.finalAnswer === q.a / q.b + q.c;
  return true;
}

function isPromotionFamily(templateFamilyId = "") {
  return /buy_get_free|bonus_units|promotion_total/.test(templateFamilyId);
}

function promotionHolds(spec, q) {
  if (!isPromotionFamily(spec.templateFamilyId)) return true;
  if (spec.templateFamilyId.includes("buy_get_free")) return q.r > q.q && q.r <= 20 && q.q >= 1;
  if (spec.templateFamilyId.includes("bonus_units")) return q.g >= 1 && q.q >= 1 && q.q + q.g <= 20;
  if (spec.templateFamilyId.includes("promotion_total")) return q.b >= 1 && q.c >= 2;
  return true;
}

function packageQuantitiesPlausible(spec, q) {
  for (const [symbol, semanticRole] of Object.entries(spec.quantityRoles)) {
    if (!PACKAGE_ROLE_TOKENS.some((token) => semanticRole.includes(token))) continue;
    const value = q[symbol];
    if (!Number.isSafeInteger(value) || value < 2 || value > 50) return false;
  }
  return true;
}

function normalizedPrompt(text) {
  return String(text ?? "").replace(/[\s，。！？、；：,.!?;:]/g, "").replace(/\d+/g, "#");
}

function countQuestionMarks(text) {
  return (String(text ?? "").match(/[？?]/g) ?? []).length;
}

function ambiguousLanguage(text, audit = {}) {
  if (audit.ambiguousReferent === true) return true;
  return /某個|那個人|他們其中|其中一個人|這些人之一|前者|後者/.test(String(text ?? ""));
}

function duplicateFamilyClaim(question) {
  if (question.duplicateSignatureOf) return true;
  const claim = question.semanticFamilyClaim;
  return Boolean(claim?.claimedNew === true && claim?.duplicatesTemplateFamilyId);
}

function sourceLabelMismatch(question) {
  if (question.sourceFieldId !== "p1_r2_r") return false;
  return question.knowledgePointId !== "kp_g3b_u04_multiply_then_divide_average_unit_price"
    || question.sourceLabelResolution !== "multiplication_then_division_override_applied";
}

export function validateG3BU04SemanticQuestion(question = {}, options = {}) {
  const errors = [];
  const warnings = [];
  const stageResults = [];
  let activeStage = null;

  function addError(code, path, message) {
    const key = `${code}:${path}`;
    if (errors.some((entry) => `${entry.code}:${entry.path}` === key)) return;
    errors.push({ code, severity: "error", stage: activeStage, path, message });
  }

  function addWarning(code, path, message) {
    const key = `${code}:${path}`;
    if (warnings.some((entry) => `${entry.code}:${entry.path}` === key)) return;
    warnings.push({ code, severity: "warning", stage: activeStage, path, message });
  }

  function runStage(stage, callback) {
    activeStage = stage;
    const errorStart = errors.length;
    const warningStart = warnings.length;
    callback();
    stageResults.push({
      stage,
      ok: errors.length === errorStart,
      errorCodes: errors.slice(errorStart).map((entry) => entry.code),
      warningCodes: warnings.slice(warningStart).map((entry) => entry.code)
    });
  }

  const patternSpecId = question.patternSpecId ?? question.metadata?.patternId;
  const spec = getG3BU04SemanticPatternDefinition(patternSpecId);
  const scenario = spec && typeof question.contextDomain === "string"
    ? resolveG3BU04SemanticScenarioProfile(spec.templateFamilyId, question.contextDomain)
    : null;
  const reconstructed = spec ? reconstruct(spec.equationShape, question.quantities) : null;

  runStage("structure", () => {
    if (!spec || question.templateFamilyId !== spec.templateFamilyId) {
      addError("G3B_U04_SEM_TEMPLATE_UNREGISTERED", "templateFamilyId", "Question uses an unregistered or mismatched semantic template family.");
    }
    if (!APPROVED_KP_IDS.has(question.knowledgePointId) || (spec && question.knowledgePointId !== spec.knowledgePointId)) {
      addError("G3B_U04_SEM_KP_UNREGISTERED", "knowledgePointId", "Question maps to an unregistered or mismatched G3B-U04 KnowledgePoint.");
    }
    if (spec && reconstructed?.equationModel !== question.equationModel) {
      addError("G3B_U04_SEM_EQUATION_SHAPE_MISMATCH", "equationModel", "Prompt family, PatternSpec, and equation structure do not agree.");
    }
    if (duplicateFamilyClaim(question)) {
      addError("G3B_U04_SEM_DUPLICATE_SIGNATURE", "semanticFamilyClaim", "Candidate is a wording variant, not a distinct semantic template family.");
    }
    if (sourceLabelMismatch(question)) {
      addError("G3B_U04_SEM_SOURCE_LABEL_MISMATCH_UNRESOLVED", "sourceFieldId", "Known p1_r2_r source-heading mismatch was not isolated.");
    }
    if (question.kind !== "g3bU04SemanticWordProblem" || question.sourceId !== G3B_U04_SOURCE_ID) {
      addError("G3B_U04_SEM_TEMPLATE_UNREGISTERED", "kind", "Question kind or source is outside the registered G3B-U04 semantic runtime.");
    }
  });

  runStage("role_binding", () => {
    if (!spec) return;
    if (question.unknownRole !== spec.unknownRole) {
      addError("G3B_U04_SEM_UNKNOWN_ROLE_MISMATCH", "unknownRole", "Question asks for a different semantic quantity than the registered answer model.");
    }
    for (const [symbol, semanticRole] of Object.entries(spec.quantityRoles)) {
      const binding = question.quantityRoleBindings?.[symbol];
      if (!Number.isSafeInteger(question.quantities?.[symbol]) || !binding || binding.semanticRole !== semanticRole || binding.value !== question.quantities[symbol]) {
        addError("G3B_U04_SEM_QUANTITY_ROLE_MISSING", `quantityRoleBindings.${symbol}`, "Required semantic quantity role is missing, duplicated, or mismatched.");
      }
    }
    if (scenario && question.ownershipModel !== scenario.ownershipModel) {
      addError("G3B_U04_SEM_ACTOR_OWNERSHIP_MISMATCH", "ownershipModel", "Ownership or participant scope is inconsistent with the scenario profile.");
    }
  });

  runStage("arithmetic", () => {
    if (!spec || !reconstructed) return;
    const numericValues = Object.values(question.quantities ?? {});
    const computedValues = [...numericValues, ...(question.intermediateResults ?? []), question.finalAnswer];
    if (computedValues.some((value) => !Number.isSafeInteger(value) || value <= 0)) {
      addError("G3B_U04_SEM_NON_POSITIVE_OR_NEGATIVE_RESULT", "quantities", "Generated quantities violate positive integer constraints.");
    }
    if (computedValues.some((value) => Number.isFinite(value) && Math.abs(value) > 10000)) {
      addError("G3B_U04_SEM_RANGE_EXCEEDED", "quantities", "Generated arithmetic exceeds the approved G3B-U04 range.");
    }
    if (!reconstructed.exact) {
      addError("G3B_U04_SEM_DIVISION_NOT_EXACT", "quantities", "Division must be exact for the current G3B-U04 scope.");
    }
  });

  runStage("unit_flow", () => {
    if (!spec || !scenario) {
      if (spec) addError("G3B_U04_SEM_CONTEXT_OBJECT_INCOMPATIBLE", "contextDomain", "No compatible scenario profile exists for this family and context.");
      return;
    }
    const expectedDimensions = expectedRoleDimensions(spec, scenario);
    const actualDimensions = Object.fromEntries(Object.keys(spec.quantityRoles).map((symbol) => [
      symbol,
      question.quantityRoleBindings?.[symbol]?.unitDimension ?? null
    ]));
    if (stableJson(actualDimensions) !== stableJson(expectedDimensions) || !operationDimensionsCompatible(spec.equationShape, actualDimensions)) {
      addError("G3B_U04_SEM_UNIT_FLOW_MISMATCH", "quantityRoleBindings", "Units do not flow consistently through the two operations.");
    }
    const expectedUnit = expectedAnswerUnit(spec, scenario);
    if (question.answerUnit !== expectedUnit) {
      addError("G3B_U04_SEM_ANSWER_UNIT_MISMATCH", "answerUnit", "Answer unit does not match the registered unknown role.");
    }
    if (question.countNounModel?.answerClassifier && question.countNounModel.answerClassifier !== expectedUnit) {
      addError("G3B_U04_SEM_COUNT_NOUN_MISMATCH", "countNounModel.answerClassifier", "Object classifier or grouping unit is inconsistent.");
    } else if (isCountNounSensitive(spec.unknownRole) && question.answerUnit !== expectedUnit) {
      addError("G3B_U04_SEM_COUNT_NOUN_MISMATCH", "answerUnit", "Count noun does not match the requested quantity hierarchy.");
    }
  });

  runStage("event_semantics", () => {
    if (!spec || !reconstructed) return;
    const expectedActions = expectedEventActions(spec.equationShape);
    const actualActions = Array.isArray(question.eventSequence) ? question.eventSequence.map((entry) => entry.action) : [];
    if (stableJson(actualActions) !== stableJson(expectedActions)) {
      addError("G3B_U04_SEM_EVENT_ORDER_MISMATCH", "eventSequence", "Narrative event order conflicts with the required operation order.");
    }
    if (!conservationHolds(spec, question.quantities ?? {}, reconstructed)) {
      addError("G3B_U04_SEM_CONSERVATION_MISMATCH", "quantities", "Story violates quantity conservation.");
    }
    if (Array.isArray(question.eventSequence) && question.eventSequence.some((event, index) => {
      const expected = reconstructed.intermediateResults[Math.min(index, reconstructed.intermediateResults.length - 1)];
      return event.result !== undefined && Number.isFinite(expected) && event.result !== expected;
    }) && /sub_div_|total_minus_share_|group_minus_remaining_/.test(spec.templateFamilyId)) {
      addError("G3B_U04_SEM_CONSERVATION_MISMATCH", "eventSequence", "Event result does not conserve the registered quantity relationship.");
    }
    if (["kp_g3b_u04_composite_multiplicative_ratio", "kp_g3b_u04_multiplicative_quantity_chain"].includes(spec.knowledgePointId)
      && question.relationshipDirection !== "base_to_middle_then_middle_to_final") {
      addError("G3B_U04_SEM_COMPARISON_DIRECTION_MISMATCH", "relationshipDirection", "Multiplicative comparison direction is reversed or inconsistent.");
    }
  });

  runStage("realism", () => {
    if (!spec) return;
    const q = question.quantities ?? {};
    if (!promotionHolds(spec, q)) {
      addError("G3B_U04_SEM_PROMOTION_INCONSISTENT", "quantities", "Promotion payment and received-item semantics are inconsistent.");
    }
    if (!packageQuantitiesPlausible(spec, q)) {
      addError("G3B_U04_SEM_PACKAGE_QUANTITY_IMPLAUSIBLE", "quantities", "Package, team, tray, or grouping quantity is implausible.");
    }
    if (!scenario || question.scenarioId !== `${scenario?.scenarioProfileId ?? ""}__${question.contextDomain}`) {
      addError("G3B_U04_SEM_CONTEXT_OBJECT_INCOMPATIBLE", "scenarioId", "Selected object or context is incompatible with the registered template action.");
    }
    if (spec.templateFamilyId === "tpl_g3b_u04_quantity_chain_production_capacity_chain") {
      const period = question.timePeriodModel;
      if (!period || period.basePeriod !== "same_period" || period.middlePeriod !== "same_period" || period.finalPeriod !== "same_period") {
        addError("G3B_U04_SEM_TIME_PERIOD_MISMATCH", "timePeriodModel", "Compared production quantities must refer to the same time period.");
      }
    }
    if (spec.templateFamilyId === "tpl_g3b_u04_quantity_chain_age_ratio_chain") {
      const age = question.ageModel;
      if (!age || age.childAge < 6 || age.childAge > 12 || age.siblingAge < 10 || age.siblingAge > 24 || age.parentAge < 25 || age.parentAge > 60 || !(age.childAge < age.siblingAge && age.siblingAge < age.parentAge)) {
        addError("G3B_U04_SEM_AGE_IMPLAUSIBLE", "ageModel", "Generated family ages are not plausible.");
      }
    }
  });

  runStage("language_readback", () => {
    const prompt = String(question.promptText ?? "");
    if (!prompt || /\{[^}]+\}/.test(prompt)) {
      addError("G3B_U04_SEM_AMBIGUOUS_REFERENT", "promptText", "Prompt is incomplete or contains an unresolved referent.");
    }
    if (ambiguousLanguage(prompt, question.languageAudit)) {
      addError("G3B_U04_SEM_AMBIGUOUS_REFERENT", "promptText", "Prompt contains an ambiguous participant or quantity referent.");
    }
    if (countQuestionMarks(prompt) !== 1 || question.languageAudit?.multipleQuestions === true || Array.isArray(question.unknownRole)) {
      addError("G3B_U04_SEM_MULTIPLE_QUESTIONS_OR_UNKNOWNS", "promptText", "Prompt must ask one unambiguous target question.");
    }
    const recentPrompts = options.recentPrompts ?? [];
    if (recentPrompts.some((recent) => normalizedPrompt(recent) === normalizedPrompt(prompt))) {
      addWarning("G3B_U04_STYLE_REPETITIVE_WORDING", "promptText", "Wording repeats a recent prompt frame.");
    }
    const worksheetQuestions = options.worksheetQuestions ?? [];
    if (worksheetQuestions.length >= 5) {
      const counts = new Map();
      for (const item of worksheetQuestions) counts.set(item.contextDomain, (counts.get(item.contextDomain) ?? 0) + 1);
      const largest = Math.max(...counts.values());
      if (largest / worksheetQuestions.length > (options.contextImbalanceThreshold ?? 0.6)) {
        addWarning("G3B_U04_STYLE_CONTEXT_IMBALANCE", "contextDomain", "Worksheet overuses one context domain.");
      }
    }
    if (prompt.length > (options.maxPromptLength ?? 90)) {
      addWarning("G3B_U04_STYLE_LONG_SENTENCE", "promptText", "Prompt exceeds the configured readability preference.");
    }
  });

  runStage("answer_reconstruction", () => {
    if (!spec || !reconstructed?.ok) {
      addError("G3B_U04_SEM_ANSWER_RECONSTRUCTION_FAILED", "quantities", "Deterministic semantic answer reconstruction failed.");
      return;
    }
    const expectedUnit = expectedAnswerUnit(spec, scenario);
    if (!reconstructed.exact || reconstructed.finalAnswer !== question.finalAnswer
      || question.answerText !== `${reconstructed.finalAnswer}${expectedUnit}`
      || question.finalAnswerWithUnit !== `${reconstructed.finalAnswer}${expectedUnit}`) {
      addError("G3B_U04_SEM_ANSWER_RECONSTRUCTION_FAILED", "finalAnswer", "Recomputed answer does not equal the stored expression result and answer model.");
    }
    const snapshot = question.semanticSnapshot;
    if (!snapshot || snapshot.sourceId !== G3B_U04_SOURCE_ID
      || snapshot.knowledgePointId !== spec.knowledgePointId
      || snapshot.templateFamilyId !== spec.templateFamilyId
      || snapshot.semanticSignature !== spec.semanticSignature
      || snapshot.equationShape !== spec.equationShape
      || snapshot.unknownRole !== spec.unknownRole
      || snapshot.answerUnit !== expectedUnit
      || snapshot.contextDomain !== question.contextDomain
      || stableJson(snapshot.quantityRoleBindings) !== stableJson(question.quantityRoleBindings)
      || stableJson(snapshot.eventSequence) !== stableJson(question.eventSequence)) {
      addError("G3B_U04_SEM_ANSWER_RECONSTRUCTION_FAILED", "semanticSnapshot", "Semantic snapshot cannot reconstruct the registered answer model.");
      addError("G3B_U04_SEM_SNAPSHOT_INCOMPLETE", "semanticSnapshot", "Required semantic snapshot fields are missing or inconsistent.");
    }
  });

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    stages: stageResults,
    reconstructed: reconstructed ? cloneValue(reconstructed) : null,
    validatorVersion: "s57e5-g3b-u04-semantic-validator-v1",
    semanticErrorsAreBlocking: true,
    styleWarningsAreBlocking: false,
    validatedAt: null
  };
}
