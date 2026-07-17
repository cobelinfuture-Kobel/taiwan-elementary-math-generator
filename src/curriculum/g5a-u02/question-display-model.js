import { isG5AU02S100Pattern } from "./s100-method-runtime.js";
import {
  buildG5AU02S100QuestionDisplayModel,
  isG5AU02S100DisplayModel,
  serializeG5AU02S100QuestionDisplayModel,
  validateG5AU02S100QuestionDisplayModel,
} from "./s100-question-display.js";
import { isG5AU02S101Pattern } from "./s101-representation-runtime.js";
import {
  buildG5AU02S101QuestionDisplayModel,
  isG5AU02S101DisplayModel,
  serializeG5AU02S101QuestionDisplayModel,
  validateG5AU02S101QuestionDisplayModel,
} from "./s101-question-display.js";
import { isG5AU02S102Pattern } from "./s102-common-factor-runtime.js";
import {
  buildG5AU02S102QuestionDisplayModel,
  isG5AU02S102DisplayModel,
  serializeG5AU02S102QuestionDisplayModel,
  validateG5AU02S102QuestionDisplayModel,
} from "./s102-question-display.js";
import {
  G5A_U02_S103_SOURCE_CONDITIONS,
  isG5AU02S103Pattern,
} from "./s103-digit-code-runtime.js";
import {
  buildG5AU02S103QuestionDisplayModel,
  isG5AU02S103DisplayModel,
  serializeG5AU02S103QuestionDisplayModel,
  validateG5AU02S103QuestionDisplayModel,
} from "./s103-question-display.js";

const BLOCKING_PATTERN_IDS = Object.freeze([
  "ps_g5a_u02_missing_factor_reconstruction",
  "ps_g5a_u02_divisor_candidate_selection",
  "ps_g5a_u02_complete_factor_list_unknown_values",
  "ps_g5a_u02_complete_factor_list_statement_evaluation",
  "ps_g5a_u02_common_factor_concept_identification",
  "ps_g5a_u02_multi_constraint_digit_code",
]);

const BLOCKING_PATTERN_SET = new Set(BLOCKING_PATTERN_IDS);

function clone(value) { return JSON.parse(JSON.stringify(value)); }
function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) deepFreeze(nested);
  return Object.freeze(value);
}

function statementText(statement, target) {
  switch (statement?.kind) {
    case "contains_one": return `1 是 ${target} 的因數。`;
    case "contains_self": return `${target} 是 ${target} 的因數。`;
    case "factor_count_even": return `${target} 的因數個數是偶數。`;
    default: throw new Error(`G5AU02_DISPLAY_STATEMENT_KIND_UNSUPPORTED:${statement?.kind ?? "missing"}`);
  }
}

function unknownLabelByPosition(data) {
  return new Map((data.unknownKeys ?? []).map((key) => [Number(String(key).slice(1)), String(key)]));
}

export function isG5AU02PromptCompletenessPattern(patternSpecId) {
  return BLOCKING_PATTERN_SET.has(patternSpecId)
    || isG5AU02S100Pattern(patternSpecId)
    || isG5AU02S101Pattern(patternSpecId)
    || isG5AU02S102Pattern(patternSpecId)
    || isG5AU02S103Pattern(patternSpecId);
}

export function buildG5AU02QuestionDisplayModel(item) {
  if (!item || typeof item !== "object") throw new Error("G5AU02_DISPLAY_ITEM_REQUIRED");
  if (isG5AU02S100Pattern(item.patternSpecId)) return buildG5AU02S100QuestionDisplayModel(item);
  if (isG5AU02S101Pattern(item.patternSpecId)) return buildG5AU02S101QuestionDisplayModel(item);
  if (isG5AU02S102Pattern(item.patternSpecId)) return buildG5AU02S102QuestionDisplayModel(item);
  if (isG5AU02S103Pattern(item.patternSpecId)) return buildG5AU02S103QuestionDisplayModel(item);
  const data = item.data ?? {};

  switch (item.patternSpecId) {
    case "ps_g5a_u02_missing_factor_reconstruction":
      return deepFreeze({
        schemaName: "G5AU02QuestionDisplayModel", schemaVersion: 1, kind: "masked_factor_sequence", target: data.target,
        sequence: data.visibleValues.map((value, index) => value === null
          ? { position: index + 1, role: "blank", text: "□" }
          : { position: index + 1, role: "visible_factor", value, text: String(value) }),
      });
    case "ps_g5a_u02_divisor_candidate_selection":
      return deepFreeze({ schemaName: "G5AU02QuestionDisplayModel", schemaVersion: 1, kind: "candidate_selection", selectionRole: "factor", target: data.target, candidates: clone(data.candidates) });
    case "ps_g5a_u02_complete_factor_list_unknown_values": {
      const labels = unknownLabelByPosition(data);
      return deepFreeze({
        schemaName: "G5AU02QuestionDisplayModel", schemaVersion: 1, kind: "symbolic_complete_factor_sequence",
        sequence: data.shownFactorList.map((value, index) => value === null
          ? { position: index + 1, role: "unknown", symbol: labels.get(index) ?? `p${index}`, text: labels.get(index) ?? `p${index}` }
          : { position: index + 1, role: "visible_factor", value, text: String(value) }),
        targetRuleText: "完整因數表由小到大排列，最後一個數就是原數。",
      });
    }
    case "ps_g5a_u02_complete_factor_list_statement_evaluation":
      return deepFreeze({
        schemaName: "G5AU02QuestionDisplayModel", schemaVersion: 1, kind: "factor_list_statement_set", target: data.target,
        factorList: clone(data.factorList),
        statements: data.statements.map((statement, index) => ({ statementNumber: index + 1, kind: statement.kind, text: statementText(statement, data.target) })),
      });
    case "ps_g5a_u02_common_factor_concept_identification":
      return deepFreeze({ schemaName: "G5AU02QuestionDisplayModel", schemaVersion: 1, kind: "candidate_selection", selectionRole: "common_factor", comparedValues: [data.a, data.b], candidates: clone(data.candidates) });
    default:
      return null;
  }
}

function sequenceText(sequence) { return sequence.map((entry) => entry.text).join("、"); }

export function serializeG5AU02QuestionDisplayModel(basePrompt, model) {
  if (!model) return String(basePrompt ?? "");
  if (isG5AU02S100DisplayModel(model)) return serializeG5AU02S100QuestionDisplayModel(model);
  if (isG5AU02S101DisplayModel(model)) return serializeG5AU02S101QuestionDisplayModel(model);
  if (isG5AU02S102DisplayModel(model)) return serializeG5AU02S102QuestionDisplayModel(model);
  if (isG5AU02S103DisplayModel(model)) return serializeG5AU02S103QuestionDisplayModel(model);
  switch (model.kind) {
    case "masked_factor_sequence": return `補回 ${model.target} 的完整因數表中的缺漏值。\n因數表：${sequenceText(model.sequence)}`;
    case "candidate_selection": {
      const prompt = model.selectionRole === "common_factor"
        ? `從候選數中選出 ${model.comparedValues[0]} 和 ${model.comparedValues[1]} 的所有公因數。`
        : `從候選數中選出 ${model.target} 的所有因數。`;
      return `${prompt}\n候選數：${model.candidates.join("、")}`;
    }
    case "symbolic_complete_factor_sequence": return `觀察下列完整因數表，求出原數與所有代號。\n因數表：${sequenceText(model.sequence)}\n${model.targetRuleText}`;
    case "factor_list_statement_set": return `根據完整因數表，判斷下列敘述是否正確。\n因數表：${model.factorList.join("、")}\n${model.statements.map((row) => `${row.statementNumber}. ${row.text}`).join("\n")}`;
    default: throw new Error(`G5AU02_DISPLAY_KIND_UNSUPPORTED:${model.kind}`);
  }
}

function requireExactArray(actual, expected, errorCode, errors) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) errors.push(errorCode);
}

export function validateG5AU02QuestionDisplayModel(item, model, promptText = "") {
  if (isG5AU02S100Pattern(item?.patternSpecId)) return validateG5AU02S100QuestionDisplayModel(item, model, promptText);
  if (isG5AU02S101Pattern(item?.patternSpecId)) return validateG5AU02S101QuestionDisplayModel(item, model, promptText);
  if (isG5AU02S102Pattern(item?.patternSpecId)) return validateG5AU02S102QuestionDisplayModel(item, model, promptText);
  if (isG5AU02S103Pattern(item?.patternSpecId)) return validateG5AU02S103QuestionDisplayModel(item, model, promptText);

  const errors = [];
  if (!BLOCKING_PATTERN_SET.has(item?.patternSpecId)) {
    if (model !== null) errors.push("G5AU02_DISPLAY_UNEXPECTED_FOR_NONBLOCKING_PATTERN");
    return deepFreeze({ ok: errors.length === 0, errors });
  }
  if (!model || model.schemaName !== "G5AU02QuestionDisplayModel") return deepFreeze({ ok: false, errors: ["G5AU02_VISIBLE_DISPLAY_MODEL_REQUIRED"] });

  const data = item.data ?? {};
  switch (item.patternSpecId) {
    case "ps_g5a_u02_missing_factor_reconstruction":
      if (model.kind !== "masked_factor_sequence") errors.push("G5AU02_DISPLAY_KIND_MISMATCH");
      if (model.sequence?.length !== data.visibleValues?.length) errors.push("G5AU02_FACTOR_SEQUENCE_LENGTH_MISMATCH");
      if (!model.sequence?.some((entry) => entry.role === "blank")) errors.push("G5AU02_FACTOR_SEQUENCE_BLANK_MISSING");
      break;
    case "ps_g5a_u02_divisor_candidate_selection":
      if (model.kind !== "candidate_selection" || model.selectionRole !== "factor") errors.push("G5AU02_DISPLAY_KIND_MISMATCH");
      requireExactArray(model.candidates, data.candidates, "G5AU02_CANDIDATE_SET_NOT_VISIBLE", errors);
      break;
    case "ps_g5a_u02_complete_factor_list_unknown_values":
      if (model.kind !== "symbolic_complete_factor_sequence") errors.push("G5AU02_DISPLAY_KIND_MISMATCH");
      if (model.sequence?.filter((entry) => entry.role === "unknown").length !== data.unknownKeys?.length) errors.push("G5AU02_UNKNOWN_FACTOR_SYMBOL_COUNT_MISMATCH");
      if (model.sequence?.at(-1)?.role !== "visible_factor") errors.push("G5AU02_TARGET_NUMBER_NOT_VISIBLE");
      break;
    case "ps_g5a_u02_complete_factor_list_statement_evaluation":
      if (model.kind !== "factor_list_statement_set") errors.push("G5AU02_DISPLAY_KIND_MISMATCH");
      requireExactArray(model.factorList, data.factorList, "G5AU02_COMPLETE_FACTOR_LIST_NOT_VISIBLE", errors);
      if (model.statements?.length !== item.answer?.values?.length) errors.push("G5AU02_STATEMENT_SET_NOT_VISIBLE");
      break;
    case "ps_g5a_u02_common_factor_concept_identification":
      if (model.kind !== "candidate_selection" || model.selectionRole !== "common_factor") errors.push("G5AU02_DISPLAY_KIND_MISMATCH");
      requireExactArray(model.candidates, data.candidates, "G5AU02_CANDIDATE_SET_NOT_VISIBLE", errors);
      requireExactArray(model.comparedValues, [data.a, data.b], "G5AU02_COMPARED_VALUES_NOT_VISIBLE", errors);
      break;
    default: errors.push("G5AU02_PROMPT_COMPLETENESS_PATTERN_UNSUPPORTED");
  }

  if (typeof promptText !== "string" || promptText.length === 0) errors.push("G5AU02_VISIBLE_PROMPT_REQUIRED");
  const requiredVisibleTexts = [];
  if (model.candidates) requiredVisibleTexts.push(...model.candidates.map(String));
  if (model.sequence) requiredVisibleTexts.push(...model.sequence.map((entry) => entry.text));
  if (model.factorList) requiredVisibleTexts.push(...model.factorList.map(String));
  if (model.statements) requiredVisibleTexts.push(...model.statements.map((entry) => entry.text));
  if (requiredVisibleTexts.some((text) => !promptText.includes(text))) errors.push("G5AU02_PROMPT_VISIBLE_DATA_INCOMPLETE");

  return deepFreeze({ ok: errors.length === 0, errors: [...new Set(errors)] });
}

export function enrichG5AU02GeneratedItemPrompt(item) {
  const questionDisplayModel = buildG5AU02QuestionDisplayModel(item);
  const prompt = serializeG5AU02QuestionDisplayModel(item.prompt, questionDisplayModel);
  const validation = validateG5AU02QuestionDisplayModel(item, questionDisplayModel, prompt);
  if (!validation.ok) throw new Error(`G5AU02_VISIBLE_PROMPT_BLOCKED:${validation.errors.join(",")}`);
  return deepFreeze({ prompt, questionDisplayModel });
}

export function getG5AU02PromptCompletenessPatternIds() { return [...BLOCKING_PATTERN_IDS]; }
export const G5A_U02_SOURCE_PASSWORD_CONDITIONS = G5A_U02_S103_SOURCE_CONDITIONS;
