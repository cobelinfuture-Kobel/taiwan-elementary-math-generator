import { isG5AU02S106Pattern } from "./s106-factor-structure-runtime.js";

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

const DISPLAY_KINDS = new Set([
  "factor_pair_search_stop_boundary",
  "u_shaped_factor_symmetry_record",
  "masked_factor_table_with_pair_cues",
]);

export function isG5AU02S106DisplayModel(model) {
  return DISPLAY_KINDS.has(model?.kind);
}

export function buildG5AU02S106QuestionDisplayModel(item) {
  if (!isG5AU02S106Pattern(item?.patternSpecId)) return null;
  const data = item.data ?? {};
  const base = {
    schemaName: "G5AU02QuestionDisplayModel",
    schemaVersion: 7,
  };

  if (item.patternSpecId === "ps_g5a_u02_factor_pair_enumeration") {
    return deepFreeze({
      ...base,
      kind: "factor_pair_search_stop_boundary",
      target: data.target,
      searchRows: clone(data.searchRows),
      searchEnd: data.searchEnd,
      crossingBoundary: data.crossingBoundary,
      factorPairs: clone(data.factorPairs),
    });
  }

  if (item.patternSpecId === "ps_g5a_u02_factor_order_and_symmetry") {
    return deepFreeze({
      ...base,
      kind: "u_shaped_factor_symmetry_record",
      target: data.target,
      orderedFactors: clone(data.orderedFactors),
      symmetricPairs: clone(data.symmetricPairs),
      outerToInnerLinks: clone(data.outerToInnerLinks),
      midpointPolicy: data.midpointPolicy,
    });
  }

  return deepFreeze({
    ...base,
    kind: "masked_factor_table_with_pair_cues",
    target: data.target,
    sequence: (data.visibleValues ?? []).map((value, index) => (
      value === null
        ? { position: index + 1, role: "masked", text: "□" }
        : { position: index + 1, role: "visible_factor", value, text: String(value) }
    )),
    maskedPositions: clone(data.hiddenPositions),
    pairLinks: clone(data.pairLinks),
    solutionCount: data.solutionCount,
  });
}

function factorPairSearchText(model) {
  const rows = model.searchRows
    .filter((row) => row.searchStatus === "within_boundary")
    .map((row) => `${row.candidateFactor} × ______ = ${model.target}`)
    .join("\n");
  return [
    `用乘法逐一檢查 1 到 ${model.searchEnd}，找出乘積為 ${model.target} 的所有因數配對。`,
    rows,
    `停止界線：較小因數檢查到 ${model.searchEnd}；下一個候選 ${model.crossingBoundary} 已越過界線。`,
  ].join("\n");
}

function symmetryText(model) {
  const rows = model.outerToInnerLinks.map((link) => {
    if (link.linkRole === "square_midpoint") {
      return `第 ${link.leftPosition} 格（中央）：______ × 自己 = ${model.target}`;
    }
    return `第 ${link.leftPosition} 格 ↔ 第 ${link.rightPosition} 格：______ × ______ = ${model.target}`;
  }).join("\n");
  return [
    `把 ${model.target} 的因數由小到大填入 U 型對稱記錄，從最外側依序連到內側。`,
    rows,
  ].join("\n");
}

function maskedTableText(model) {
  const sequence = model.sequence.map((entry) => entry.text).join("、");
  const links = model.pairLinks.map((link) => (
    link.linkRole === "square_midpoint"
      ? `第 ${link.leftPosition} 格 × 自己 = ${model.target}`
      : `第 ${link.leftPosition} 格 × 第 ${link.rightPosition} 格 = ${model.target}`
  )).join("；");
  return [
    `補回 ${model.target} 的完整因數表缺漏值，利用對稱位置相乘等於 ${model.target}。`,
    `因數表：${sequence}`,
    `配對提示：${links}`,
  ].join("\n");
}

export function serializeG5AU02S106QuestionDisplayModel(model) {
  if (model.kind === "factor_pair_search_stop_boundary") return factorPairSearchText(model);
  if (model.kind === "u_shaped_factor_symmetry_record") return symmetryText(model);
  if (model.kind === "masked_factor_table_with_pair_cues") return maskedTableText(model);
  throw new Error(`G5AU02_S106_DISPLAY_KIND_UNSUPPORTED:${model.kind}`);
}

function exactPairLeakage(promptText, pairs) {
  return (pairs ?? []).some(([left, right]) => (
    promptText.includes(`${left}×${right}`)
    || promptText.includes(`${left} × ${right}`)
  ));
}

export function validateG5AU02S106QuestionDisplayModel(item, model, promptText = "") {
  const errors = [];
  if (!isG5AU02S106Pattern(item?.patternSpecId)) {
    return deepFreeze({ ok: true, errors });
  }
  if (!model || model.schemaName !== "G5AU02QuestionDisplayModel") {
    return deepFreeze({ ok: false, errors: ["G5AU02_VISIBLE_DISPLAY_MODEL_REQUIRED"] });
  }
  const data = item.data ?? {};

  if (item.patternSpecId === "ps_g5a_u02_factor_pair_enumeration") {
    if (model.kind !== "factor_pair_search_stop_boundary"
      || !same(model.searchRows, data.searchRows)) {
      errors.push("G5AU02_P1_FACTOR_PAIR_SEARCH_ROWS_INCOMPLETE");
    }
    if (model.searchEnd !== data.searchEnd
      || model.crossingBoundary !== data.crossingBoundary) {
      errors.push("G5AU02_P1_FACTOR_PAIR_STOP_BOUNDARY_INVALID");
    }
    if (!same(model.factorPairs, data.factorPairs)) {
      errors.push("G5AU02_P1_FACTOR_PAIR_PRODUCT_MISMATCH");
    }
  }

  if (item.patternSpecId === "ps_g5a_u02_factor_order_and_symmetry") {
    if (model.kind !== "u_shaped_factor_symmetry_record"
      || !same(model.orderedFactors, data.orderedFactors)) {
      errors.push("G5AU02_P1_FACTOR_SYMMETRY_ORDER_INVALID");
    }
    if (!same(model.symmetricPairs, data.symmetricPairs)
      || !same(model.outerToInnerLinks, data.outerToInnerLinks)) {
      errors.push("G5AU02_P1_U_RECORD_LINK_MISMATCH");
    }
    if (model.midpointPolicy !== data.midpointPolicy) {
      errors.push("G5AU02_P1_FACTOR_SYMMETRY_MIDPOINT_INVALID");
    }
  }

  if (item.patternSpecId === "ps_g5a_u02_missing_factor_reconstruction") {
    if (model.kind !== "masked_factor_table_with_pair_cues"
      || model.sequence?.length !== data.visibleValues?.length
      || !same(model.maskedPositions, data.hiddenPositions)) {
      errors.push("G5AU02_P1_MASKED_FACTOR_TABLE_INCOMPLETE");
    }
    if (!same(model.pairLinks, data.pairLinks)) {
      errors.push("G5AU02_P1_PAIR_SYMMETRY_CUE_INVALID");
    }
    if (model.solutionCount !== 1 || model.solutionCount !== data.solutionCount) {
      errors.push("G5AU02_P1_MISSING_FACTOR_NOT_UNIQUE");
    }
  }

  if (typeof promptText !== "string" || promptText.length === 0) {
    errors.push("G5AU02_VISIBLE_PROMPT_REQUIRED");
  } else {
    const expected = serializeG5AU02S106QuestionDisplayModel(model);
    if (promptText !== expected) errors.push("G5AU02_PROMPT_VISIBLE_DATA_INCOMPLETE");
    if (["factor_pair_search_stop_boundary", "u_shaped_factor_symmetry_record"].includes(model.kind)
      && exactPairLeakage(promptText, model.factorPairs ?? model.symmetricPairs)) {
      errors.push("G5AU02_PUBLIC_WORKED_SOLUTION_LEAKAGE");
    }
  }

  return deepFreeze({
    ok: errors.length === 0,
    errors: [...new Set(errors)],
  });
}
