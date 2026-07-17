import { isG5AU02S100Pattern } from "./s100-method-runtime.js";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) deepFreeze(nested);
  return Object.freeze(value);
}

function same(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function isG5AU02S100DisplayModel(model) {
  return [
    "factor_relation_dual_witness",
    "trial_division_table",
    "factor_pairs_to_ordered_list",
    "controlled_divisibility_statement",
    "number_theory_problem_type_scenario",
    "factor_list_reasoning_statement_set",
  ].includes(model?.kind);
}

export function buildG5AU02S100QuestionDisplayModel(item) {
  if (!isG5AU02S100Pattern(item?.patternSpecId)) return null;
  const data = item.data ?? {};
  const base = { schemaName: "G5AU02QuestionDisplayModel", schemaVersion: 2 };
  switch (item.patternSpecId) {
    case "ps_g5a_u02_factor_relation_equivalence":
      return deepFreeze({
        ...base,
        kind: "factor_relation_dual_witness",
        target: data.target,
        candidateDivisor: data.candidateDivisor,
        multiplicationWitness: clone(data.multiplicationWitness),
        divisionWitness: clone(data.divisionWitness),
        learnerTaskMode: data.learnerTaskMode,
      });
    case "ps_g5a_u02_factor_enumeration_trial_division":
      return deepFreeze({
        ...base,
        kind: "trial_division_table",
        target: data.target,
        rows: clone(data.trialDivisionRows),
        searchEnd: data.searchEnd,
        factorValues: clone(data.factorValues),
      });
    case "ps_g5a_u02_factor_list_from_pairs":
      return deepFreeze({
        ...base,
        kind: "factor_pairs_to_ordered_list",
        target: data.target,
        factorPairs: clone(data.factorPairs),
        orderedFactorList: clone(data.orderedFactorList),
        transformationPrompt: data.transformationPrompt,
      });
    case "ps_g5a_u02_factor_statement_judgement":
      return deepFreeze({
        ...base,
        kind: "controlled_divisibility_statement",
        grammarFamilyId: data.grammarFamilyId,
        subjectValue: data.subjectValue,
        objectValue: data.objectValue,
        statementText: data.statementText,
        truthValue: data.truthValue,
      });
    case "ps_g5a_u02_problem_type_classification":
      return deepFreeze({
        ...base,
        kind: "number_theory_problem_type_scenario",
        scenarioFamilyId: data.scenarioFamilyId,
        scenarioText: data.scenarioText,
        quantityRoles: clone(data.quantityRoles),
        expectedLabel: data.expectedLabel,
      });
    case "ps_g5a_u02_complete_factor_list_statement_evaluation":
      return deepFreeze({
        ...base,
        kind: "factor_list_reasoning_statement_set",
        target: data.target,
        factorList: clone(data.factorList),
        statements: clone(data.statements),
        truthPattern: clone(data.truthPattern),
      });
    default:
      return null;
  }
}

function trialRowsText(rows) {
  return rows
    .map((row) => `${row.divisor}/${row.quotient}/${row.remainder}${row.isExact ? "✓" : "×"}`)
    .join("、");
}

export function serializeG5AU02S100QuestionDisplayModel(model) {
  switch (model.kind) {
    case "factor_relation_dual_witness": {
      const multiply = model.multiplicationWitness;
      const divide = model.divisionWitness;
      return [
        `用乘法與除法判斷 ${model.candidateDivisor} 是否為 ${model.target} 的因數。`,
        `乘：${multiply.factorA}×${multiply.factorB}=${multiply.product}${multiply.product === model.target ? "" : `≠${model.target}`}`,
        `除：${divide.dividend}÷${divide.divisor}=${divide.quotient} 餘 ${divide.remainder}`,
        model.learnerTaskMode === "compare_two_methods" ? "比較兩法後作答。" : "完成兩法後作答。",
      ].join("\n");
    }
    case "trial_division_table":
      return [
        `試除 1～${model.searchEnd}，再列出 ${model.target} 的所有因數。`,
        `試除（除數/商/餘數；✓整除）：${trialRowsText(model.rows)}`,
        "整理所有 ✓ 的除數與對應商。",
      ].join("\n");
    case "factor_pairs_to_ordered_list":
      return [
        `根據乘積為 ${model.target} 的配對因數，整理出完整因數表。`,
        `配對因數：${model.factorPairs.map((pair) => `${pair[0]}×${pair[1]}`).join("、")}`,
        model.transformationPrompt,
        "完整因數表：________________",
      ].join("\n");
    case "controlled_divisibility_statement":
      return `判斷下列敘述是否正確，並用整除關係說明。\n${model.statementText}`;
    case "number_theory_problem_type_scenario":
      return `${model.scenarioText}\n請判斷這是因數、倍數、公因數或公倍數問題，並圈出關鍵數量角色。`;
    case "factor_list_reasoning_statement_set":
      return [
        "根據完整因數表，判斷下列敘述是否正確。",
        `因數表：${model.factorList.join("、")}`,
        ...model.statements.map((statement, index) => `${index + 1}. ${statement.text}`),
      ].join("\n");
    default:
      throw new Error(`G5AU02_S100_DISPLAY_KIND_UNSUPPORTED:${model.kind}`);
  }
}

export function validateG5AU02S100QuestionDisplayModel(item, model, promptText = "") {
  const errors = [];
  if (!isG5AU02S100Pattern(item?.patternSpecId)) return deepFreeze({ ok: true, errors });
  if (!model || model.schemaName !== "G5AU02QuestionDisplayModel") {
    return deepFreeze({ ok: false, errors: ["G5AU02_VISIBLE_DISPLAY_MODEL_REQUIRED"] });
  }
  const data = item.data ?? {};
  switch (item.patternSpecId) {
    case "ps_g5a_u02_factor_relation_equivalence":
      if (model.kind !== "factor_relation_dual_witness" || !model.multiplicationWitness || !model.divisionWitness) {
        errors.push("G5AU02_P0_FACTOR_RELATION_DUAL_WITNESS_MISSING");
      } else if (!same(model.multiplicationWitness, data.multiplicationWitness)
        || !same(model.divisionWitness, data.divisionWitness)
        || model.target !== data.target
        || model.candidateDivisor !== data.candidateDivisor) {
        errors.push("G5AU02_P0_FACTOR_RELATION_WITNESS_INCONSISTENT");
      }
      break;
    case "ps_g5a_u02_factor_enumeration_trial_division":
      if (model.kind !== "trial_division_table" || model.rows?.length !== data.trialDivisionRows?.length) {
        errors.push("G5AU02_P0_TRIAL_DIVISION_ROWS_INCOMPLETE");
      } else if (!same(model.rows, data.trialDivisionRows)) {
        errors.push("G5AU02_P0_TRIAL_DIVISION_ROW_ARITHMETIC_INVALID");
      }
      if (!same(model.factorValues, data.factorValues)) errors.push("G5AU02_P0_TRIAL_DIVISION_FACTOR_SET_MISMATCH");
      break;
    case "ps_g5a_u02_factor_list_from_pairs":
      if (model.kind !== "factor_pairs_to_ordered_list" || !model.factorPairs?.length) {
        errors.push("G5AU02_P0_PAIR_SOURCE_NOT_VISIBLE");
      }
      if (!same(model.factorPairs, data.factorPairs) || !same(model.orderedFactorList, data.orderedFactorList)) {
        errors.push("G5AU02_P0_PAIR_TO_LIST_TRANSFORMATION_INVALID");
      }
      break;
    case "ps_g5a_u02_factor_statement_judgement":
      if (model.kind !== "controlled_divisibility_statement" || !model.grammarFamilyId) {
        errors.push("G5AU02_P0_DIVISIBILITY_GRAMMAR_UNKNOWN");
      }
      if (model.subjectValue !== data.subjectValue || model.objectValue !== data.objectValue || model.statementText !== data.statementText) {
        errors.push("G5AU02_P0_DIVISIBILITY_ROLE_DIRECTION_INVALID");
      }
      if (model.truthValue !== data.truthValue) errors.push("G5AU02_P0_DIVISIBILITY_TRUTH_MISMATCH");
      break;
    case "ps_g5a_u02_problem_type_classification":
      if (model.kind !== "number_theory_problem_type_scenario" || !model.scenarioFamilyId) {
        errors.push("G5AU02_P0_PROBLEM_SCENARIO_FAMILY_UNKNOWN");
      }
      if (!model.scenarioText || !model.quantityRoles || Object.keys(model.quantityRoles).length < 2) {
        errors.push("G5AU02_P0_PROBLEM_QUANTITY_ROLE_MISSING");
      }
      if (model.expectedLabel !== data.expectedLabel) errors.push("G5AU02_P0_PROBLEM_TYPE_LABEL_MISMATCH");
      break;
    case "ps_g5a_u02_complete_factor_list_statement_evaluation": {
      if (model.kind !== "factor_list_reasoning_statement_set" || model.statements?.length < 3) {
        errors.push("G5AU02_P0_STATEMENT_SET_TRIVIAL");
      }
      if (!same(model.truthPattern, data.truthPattern) || !model.truthPattern?.includes(true) || !model.truthPattern?.includes(false)) {
        errors.push("G5AU02_P0_STATEMENT_TRUTH_PATTERN_INVALID");
      }
      if (!model.statements?.some((statement) => statement.requiredInference)) {
        errors.push("G5AU02_P0_STATEMENT_INFERENCE_NOT_REQUIRED");
      }
      break;
    }
    default:
      break;
  }

  if (typeof promptText !== "string" || promptText.length === 0) errors.push("G5AU02_VISIBLE_PROMPT_REQUIRED");
  const requiredText = [];
  if (model.statementText) requiredText.push(model.statementText);
  if (model.scenarioText) requiredText.push(model.scenarioText);
  if (model.transformationPrompt) requiredText.push(model.transformationPrompt);
  if (model.factorList) requiredText.push(...model.factorList.map(String));
  if (model.factorPairs) requiredText.push(...model.factorPairs.flat().map(String));
  if (model.rows) requiredText.push(...model.rows.flatMap((row) => [row.divisor, row.quotient, row.remainder].map(String)));
  if (model.statements) requiredText.push(...model.statements.map((statement) => statement.text));
  if (requiredText.some((text) => !promptText.includes(text))) errors.push("G5AU02_PROMPT_VISIBLE_DATA_INCOMPLETE");

  return deepFreeze({ ok: errors.length === 0, errors: [...new Set(errors)] });
}
