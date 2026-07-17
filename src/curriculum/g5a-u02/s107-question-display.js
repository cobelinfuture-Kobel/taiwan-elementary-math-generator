import { isG5AU02S107Pattern } from "./s107-candidate-symbolic-runtime.js";

const PUBLIC_SYMBOLS = Object.freeze(["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛"]);
const DISPLAY_KINDS = new Set([
  "candidate_circle_selection_row",
  "symbolic_complete_factor_relation_table",
  "marked_common_factor_row",
]);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function same(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) deepFreeze(nested);
  return Object.freeze(value);
}

function positionFromKey(key) {
  return Number(String(key).slice(1));
}

function symbolMap(unknownKeys = []) {
  const ordered = [...new Set(unknownKeys)].sort((left, right) => positionFromKey(left) - positionFromKey(right));
  return new Map(ordered.map((key, index) => [key, PUBLIC_SYMBOLS[index] ?? `未知數${index + 1}`]));
}

function symbolicSequence(data, symbols) {
  return (data.shownFactorList ?? []).map((value, index) => {
    if (value !== null) {
      return { position: index + 1, role: "visible_factor", value, text: String(value) };
    }
    const key = `p${index}`;
    const symbol = symbols.get(key);
    return { position: index + 1, role: "unknown", key, symbol, text: symbol };
  });
}

function publicPairRelations(data, symbols, sequence) {
  return (data.pairRelations ?? []).map((relation) => {
    const leftEntry = sequence[relation.leftPosition - 1];
    const rightEntry = sequence[relation.rightPosition - 1];
    return {
      pairOrder: relation.pairOrder,
      leftPosition: relation.leftPosition,
      rightPosition: relation.rightPosition,
      leftText: leftEntry?.text,
      rightText: rightEntry?.text,
      leftSymbol: relation.leftKey ? symbols.get(relation.leftKey) : null,
      rightSymbol: relation.rightKey ? symbols.get(relation.rightKey) : null,
      product: relation.product,
      relationRole: relation.relationRole,
    };
  });
}

function publicSymbolEquations(data, symbols) {
  return (data.symbolEquations ?? []).map((equation) => {
    const symbol = symbols.get(equation.symbolKey);
    const text = equation.equationRole === "symbol_square_equals_target"
      ? `${symbol} × ${symbol} = ${equation.target}`
      : `${symbol} × ${equation.partnerValue} = ${equation.target}`;
    return {
      symbolKey: equation.symbolKey,
      symbol,
      unknownPosition: equation.unknownPosition,
      partnerPosition: equation.partnerPosition,
      partnerValue: equation.partnerValue,
      equationRole: equation.equationRole,
      target: equation.target,
      text,
    };
  });
}

export function isG5AU02S107DisplayModel(model) {
  return DISPLAY_KINDS.has(model?.kind);
}

export function buildG5AU02S107QuestionDisplayModel(item) {
  if (!isG5AU02S107Pattern(item?.patternSpecId)) return null;
  const data = item.data ?? {};
  const base = { schemaName: "G5AU02QuestionDisplayModel", schemaVersion: 8 };

  if (item.patternSpecId === "ps_g5a_u02_divisor_candidate_selection") {
    return deepFreeze({
      ...base,
      kind: "candidate_circle_selection_row",
      target: data.target,
      candidates: clone(data.candidates),
      selectionRole: data.selectionRole,
      selectionAffordance: data.selectionAffordance,
      canonicalSelections: clone(data.canonicalSelections),
    });
  }

  if (item.patternSpecId === "ps_g5a_u02_complete_factor_list_unknown_values") {
    const symbols = symbolMap(data.unknownKeys);
    const sequence = symbolicSequence(data, symbols);
    return deepFreeze({
      ...base,
      kind: "symbolic_complete_factor_relation_table",
      target: data.target,
      sequence,
      symbols: [...symbols.entries()].map(([key, symbol]) => ({
        key,
        symbol,
        position: positionFromKey(key) + 1,
      })),
      pairRelations: publicPairRelations(data, symbols, sequence),
      symbolEquations: publicSymbolEquations(data, symbols),
      targetRuleText: "完整因數表由小到大排列，最後一個數就是原數；對稱位置相乘等於原數。",
      publicSymbolPolicy: "traditional_chinese_ordered_symbols",
      solutionCount: data.solutionCount,
    });
  }

  return deepFreeze({
    ...base,
    kind: "marked_common_factor_row",
    comparedValues: [data.a, data.b],
    factorSetA: clone(data.factorSetA),
    factorSetB: clone(data.factorSetB),
    candidateRow: clone(data.candidateRow),
    selectionAffordance: data.selectionAffordance,
    commonFactors: clone(data.commonFactors),
    smallestCommonFactor: data.smallestCommonFactor,
    greatestCommonFactor: data.greatestCommonFactor,
  });
}

function candidateText(model) {
  return [
    `在每個候選數前的空圈做記號，選出 ${model.target} 的所有因數。`,
    `候選數：${model.candidates.map((value) => `○ ${value}`).join("　")}`,
  ].join("\n");
}

function symbolicText(model) {
  return [
    "觀察完整因數表，利用對稱位置與代號方程求出原數和所有代號。",
    `因數表：${model.sequence.map((entry) => entry.text).join("、")}`,
    `代號方程：${model.symbolEquations.map((equation) => equation.text).join("；")}`,
    model.targetRuleText,
  ].join("\n");
}

function commonFactorText(model) {
  return [
    `比較 ${model.comparedValues[0]} 和 ${model.comparedValues[1]} 的完整因數集合，在候選列的空圈做記號。`,
    `${model.comparedValues[0]} 的因數：${model.factorSetA.join("、")}`,
    `${model.comparedValues[1]} 的因數：${model.factorSetB.join("、")}`,
    `候選列：${model.candidateRow.map((value) => `○ ${value}`).join("　")}`,
    "最小公因數：______　最大公因數：______",
  ].join("\n");
}

export function serializeG5AU02S107QuestionDisplayModel(model) {
  if (model.kind === "candidate_circle_selection_row") return candidateText(model);
  if (model.kind === "symbolic_complete_factor_relation_table") return symbolicText(model);
  if (model.kind === "marked_common_factor_row") return commonFactorText(model);
  throw new Error(`G5AU02_S107_DISPLAY_KIND_UNSUPPORTED:${model.kind}`);
}

export function validateG5AU02S107QuestionDisplayModel(item, model, promptText = "") {
  const errors = [];
  if (!isG5AU02S107Pattern(item?.patternSpecId)) return deepFreeze({ ok: true, errors });
  if (!model || model.schemaName !== "G5AU02QuestionDisplayModel") {
    return deepFreeze({ ok: false, errors: ["G5AU02_VISIBLE_DISPLAY_MODEL_REQUIRED"] });
  }
  const data = item.data ?? {};

  if (item.patternSpecId === "ps_g5a_u02_divisor_candidate_selection") {
    if (model.kind !== "candidate_circle_selection_row"
      || !same(model.candidates, data.candidates)
      || model.selectionAffordance !== "empty_circle_per_candidate") {
      errors.push("G5AU02_P1_CANDIDATE_SELECTION_AFFORDANCE_MISSING");
    }
    if (!same(model.canonicalSelections, data.canonicalSelections)
      || !same(model.canonicalSelections, item.answer?.selectedValues)) {
      errors.push("G5AU02_P1_CANDIDATE_DIVISIBILITY_CLASSIFICATION_MISMATCH");
    }
  }

  if (item.patternSpecId === "ps_g5a_u02_complete_factor_list_unknown_values") {
    const symbols = symbolMap(data.unknownKeys);
    const expectedSequence = symbolicSequence(data, symbols);
    const expectedRelations = publicPairRelations(data, symbols, expectedSequence);
    const expectedEquations = publicSymbolEquations(data, symbols);
    if (model.kind !== "symbolic_complete_factor_relation_table"
      || !same(model.sequence, expectedSequence)
      || !same(model.pairRelations, expectedRelations)
      || model.sequence?.at(-1)?.value !== data.target) {
      errors.push("G5AU02_P1_SYMBOLIC_FACTOR_RELATION_INCOMPLETE");
    }
    if (!same(model.symbolEquations, expectedEquations)) {
      errors.push("G5AU02_P1_SYMBOLIC_FACTOR_EQUATION_MISMATCH");
    }
    if (model.solutionCount !== 1
      || model.solutionCount !== data.solutionCount
      || model.symbols?.length !== data.unknownKeys?.length
      || model.symbols?.some((row) => /^p\d+$/i.test(row.symbol))) {
      errors.push("G5AU02_P1_SYMBOLIC_SOLUTION_NOT_UNIQUE");
    }
  }

  if (item.patternSpecId === "ps_g5a_u02_common_factor_concept_identification") {
    if (model.kind !== "marked_common_factor_row"
      || !same(model.factorSetA, data.factorSetA)
      || !same(model.factorSetB, data.factorSetB)
      || !same(model.candidateRow, data.candidateRow)
      || model.selectionAffordance !== "empty_circle_per_candidate") {
      errors.push("G5AU02_P1_COMMON_FACTOR_MARKING_INCOMPLETE");
    }
    if (model.smallestCommonFactor !== data.smallestCommonFactor
      || model.greatestCommonFactor !== data.greatestCommonFactor) {
      errors.push("G5AU02_P1_COMMON_FACTOR_MIN_MAX_MISMATCH");
    }
    if (!same(model.commonFactors, data.commonFactors)
      || !same(model.commonFactors, item.answer?.selectedValues)) {
      errors.push("G5AU02_P1_COMMON_FACTOR_INTERSECTION_MISMATCH");
    }
  }

  if (typeof promptText !== "string" || promptText.length === 0) {
    errors.push("G5AU02_VISIBLE_PROMPT_REQUIRED");
  } else if (promptText !== serializeG5AU02S107QuestionDisplayModel(model)) {
    errors.push("G5AU02_PROMPT_VISIBLE_DATA_INCOMPLETE");
  }
  if (/●|☑|✓|✔/.test(promptText)) errors.push("G5AU02_PUBLIC_WORKED_SOLUTION_LEAKAGE");

  return deepFreeze({ ok: errors.length === 0, errors: [...new Set(errors)] });
}
