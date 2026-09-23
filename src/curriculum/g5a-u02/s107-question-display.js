import { isG5AU02S107Pattern } from "./s107-selection-symbolic-common-runtime.js";

const SYMBOLS = Object.freeze(["甲", "乙", "丙", "丁"]);
const KINDS = Object.freeze([
  "candidate_circle_selection_row",
  "symbolic_complete_factor_relation_table",
  "marked_common_factor_row",
]);
const KIND_SET = new Set(KINDS);

function freeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) freeze(nested);
  return Object.freeze(value);
}
function exact(actual, expected) { return JSON.stringify(actual) === JSON.stringify(expected); }

function candidateEntries(data) {
  return data.candidateRows.map((row) => ({
    position: row.position,
    candidate: row.candidate,
    text: String(row.candidate),
    markAffordance: "circle_blank",
  }));
}

function symbolicSequence(data) {
  const labels = new Map(data.hiddenPositions.map((position, index) => [position, SYMBOLS[index]]));
  return data.shownFactorList.map((value, index) => value === null
    ? { position: index + 1, sourceIndex: index, role: "unknown", symbol: labels.get(index), text: labels.get(index) }
    : { position: index + 1, sourceIndex: index, role: "visible_factor", value, text: String(value) });
}

export function getG5AU02S107DisplayKinds() { return [...KINDS]; }

export function isG5AU02S107DisplayModel(model) {
  return model?.schemaName === "G5AU02QuestionDisplayModel" && KIND_SET.has(model.kind);
}

export function buildG5AU02S107QuestionDisplayModel(item) {
  if (!isG5AU02S107Pattern(item?.patternSpecId)) return null;
  const data = item.data ?? {};
  if (item.patternSpecId === "ps_g5a_u02_divisor_candidate_selection") {
    return freeze({
      schemaName: "G5AU02QuestionDisplayModel",
      schemaVersion: 1,
      kind: "candidate_circle_selection_row",
      target: data.target,
      selectionRole: "factor",
      instruction: `把 ${data.target} 的因數圈起來。`,
      candidates: candidateEntries(data),
      publicMarkPolicy: "one_blank_circle_per_candidate",
    });
  }
  if (item.patternSpecId === "ps_g5a_u02_complete_factor_list_unknown_values") {
    return freeze({
      schemaName: "G5AU02QuestionDisplayModel",
      schemaVersion: 1,
      kind: "symbolic_complete_factor_relation_table",
      target: data.target,
      sequence: symbolicSequence(data),
      relationRows: data.pairRelations.map((relation) => ({
        relationId: relation.relationId,
        symbol: relation.symbol,
        partnerValue: relation.partnerValue,
        target: relation.target,
        text: `${relation.symbol} × ${relation.partnerValue} = ${relation.target}`,
        responseText: `${relation.symbol}＝______`,
      })),
      targetRuleText: "完整因數表由小到大排列；成對因數的乘積等於原數。",
      publicSymbolPolicy: "traditional_chinese_ordered_symbols",
      solutionCount: data.solutionCount,
    });
  }
  return freeze({
    schemaName: "G5AU02QuestionDisplayModel",
    schemaVersion: 1,
    kind: "marked_common_factor_row",
    comparedValues: [data.a, data.b],
    instruction: `把 ${data.a} 和 ${data.b} 的公因數全部圈起來。`,
    candidates: candidateEntries(data),
    rolePrompts: [
      { role: "smallest_common_factor", label: "最小公因數", responseText: "______" },
      { role: "greatest_common_factor", label: "最大公因數", responseText: "______" },
    ],
    publicMarkPolicy: "complete_intersection_then_min_max_roles",
  });
}

function candidateText(model) {
  return model.candidates.map((entry) => `○ ${entry.text}`).join("　");
}

export function serializeG5AU02S107QuestionDisplayModel(model) {
  if (model.kind === "candidate_circle_selection_row") {
    return `${model.instruction}\n候選數：${candidateText(model)}`;
  }
  if (model.kind === "symbolic_complete_factor_relation_table") {
    const sequence = model.sequence.map((entry) => entry.text).join("、");
    const relations = model.relationRows.map((row) => `${row.text}；${row.responseText}`).join("\n");
    return `觀察完整因數表與配對關係，求出原數及各代號。\n因數表：${sequence}\n${relations}\n${model.targetRuleText}`;
  }
  if (model.kind === "marked_common_factor_row") {
    const roles = model.rolePrompts.map((row) => `${row.label}：${row.responseText}`).join("；");
    return `${model.instruction}\n候選數：${candidateText(model)}\n${roles}`;
  }
  throw new Error(`G5AU02_S107_DISPLAY_KIND_UNSUPPORTED:${model?.kind ?? "missing"}`);
}

export function validateG5AU02S107QuestionDisplayModel(item, model, promptText = "") {
  const errors = [];
  if (!isG5AU02S107Pattern(item?.patternSpecId)) return freeze({ ok: false, errors: ["G5AU02_S107_DISPLAY_PATTERN_UNSUPPORTED"] });
  if (!isG5AU02S107DisplayModel(model)) return freeze({ ok: false, errors: ["G5AU02_VISIBLE_DISPLAY_MODEL_REQUIRED"] });
  const data = item.data ?? {};
  const candidates = model.candidates?.map((entry) => entry.candidate) ?? [];
  if (item.patternSpecId === "ps_g5a_u02_divisor_candidate_selection") {
    if (model.kind !== "candidate_circle_selection_row" || model.selectionRole !== "factor") errors.push("G5AU02_DISPLAY_KIND_MISMATCH");
    if (!exact(candidates, data.candidates)) errors.push("G5AU02_CANDIDATE_SET_NOT_VISIBLE");
    if (model.candidates?.some((entry) => entry.markAffordance !== "circle_blank")) errors.push("G5AU02_P1_CANDIDATE_MARK_AFFORDANCE_INVALID");
  } else if (item.patternSpecId === "ps_g5a_u02_complete_factor_list_unknown_values") {
    if (model.kind !== "symbolic_complete_factor_relation_table") errors.push("G5AU02_DISPLAY_KIND_MISMATCH");
    if (model.publicSymbolPolicy !== "traditional_chinese_ordered_symbols") errors.push("G5AU02_P1_PUBLIC_SYMBOL_POLICY_INVALID");
    if (model.sequence?.length !== data.shownFactorList?.length) errors.push("G5AU02_P1_SYMBOLIC_FACTOR_TABLE_INCOMPLETE");
    const unknowns = model.sequence?.filter((entry) => entry.role === "unknown") ?? [];
    if (!exact(unknowns.map((entry) => entry.symbol), data.publicSymbols)) errors.push("G5AU02_P1_PUBLIC_SYMBOL_POLICY_INVALID");
    const expectedRelations = data.pairRelations.map((relation) => `${relation.symbol} × ${relation.partnerValue} = ${relation.target}`);
    if (!exact(model.relationRows?.map((row) => row.text), expectedRelations)) errors.push("G5AU02_P1_SYMBOL_RELATION_MISMATCH");
    if (model.solutionCount !== 1) errors.push("G5AU02_P1_SYMBOLIC_SOLUTION_NOT_UNIQUE");
  } else {
    if (model.kind !== "marked_common_factor_row") errors.push("G5AU02_DISPLAY_KIND_MISMATCH");
    if (!exact(model.comparedValues, [data.a, data.b])) errors.push("G5AU02_COMPARED_VALUES_NOT_VISIBLE");
    if (!exact(candidates, data.candidates)) errors.push("G5AU02_CANDIDATE_SET_NOT_VISIBLE");
    if (model.candidates?.some((entry) => entry.markAffordance !== "circle_blank")) errors.push("G5AU02_P1_CANDIDATE_MARK_AFFORDANCE_INVALID");
    if (!exact(model.rolePrompts?.map((row) => row.role), ["smallest_common_factor", "greatest_common_factor"])) errors.push("G5AU02_P1_COMMON_FACTOR_ROLE_MISMATCH");
  }
  if (typeof promptText !== "string" || promptText.length === 0) errors.push("G5AU02_VISIBLE_PROMPT_REQUIRED");
  const required = [];
  required.push(...(model.candidates ?? []).map((entry) => entry.text));
  required.push(...(model.sequence ?? []).map((entry) => entry.text));
  required.push(...(model.relationRows ?? []).map((entry) => entry.text));
  required.push(...(model.rolePrompts ?? []).map((entry) => entry.label));
  if (required.some((text) => !promptText.includes(text))) errors.push("G5AU02_PROMPT_VISIBLE_DATA_INCOMPLETE");
  return freeze({ ok: errors.length === 0, errors: [...new Set(errors)] });
}

export function compactG5AU02S107Prompt(model) {
  if (model?.kind === "candidate_circle_selection_row") return `把 ${model.target} 的因數圈起來。`;
  if (model?.kind === "symbolic_complete_factor_relation_table") return "根據完整因數表與配對等式，求出各代號。";
  if (model?.kind === "marked_common_factor_row") return `圈出 ${model.comparedValues[0]} 和 ${model.comparedValues[1]} 的全部公因數，並找出最小與最大。`;
  return "";
}
