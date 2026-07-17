import { isG5AU02S102Pattern } from "./s102-common-factor-runtime.js";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) deepFreeze(nested);
  return Object.freeze(value);
}

function same(actual, expected) {
  return JSON.stringify(actual) === JSON.stringify(expected);
}

export function isG5AU02S102DisplayModel(model) {
  return [
    "parallel_factor_sets_with_intersection",
    "common_factor_set_with_gcf",
  ].includes(model?.kind);
}

export function buildG5AU02S102QuestionDisplayModel(item) {
  if (!isG5AU02S102Pattern(item?.patternSpecId)) return null;
  const data = item.data ?? {};
  const base = {
    schemaName: "G5AU02QuestionDisplayModel",
    schemaVersion: 4,
    representationTask: "G5AU02-S102_P0NontrivialCommonFactorSamplingAndWitnessFullFix",
    a: data.a,
    b: data.b,
    factorSetA: clone(data.factorSetA),
    factorSetB: clone(data.factorSetB),
    samplingProfileId: data.samplingProfileId,
    answerFieldsExcluded: true,
  };

  if (item.patternSpecId === "ps_g5a_u02_common_factor_enumeration") {
    return deepFreeze({
      ...base,
      kind: "parallel_factor_sets_with_intersection",
    });
  }

  return deepFreeze({
    ...base,
    kind: "common_factor_set_with_gcf",
  });
}

function factorSetLine(label, value, factors) {
  return `${label} ${value} 的因數：${factors.join("、")}`;
}

export function serializeG5AU02S102QuestionDisplayModel(model) {
  const witness = [
    `先比較 ${model.a} 和 ${model.b} 的完整因數集合。`,
    factorSetLine("甲數", model.a, model.factorSetA),
    factorSetLine("乙數", model.b, model.factorSetB),
  ];

  if (model.kind === "parallel_factor_sets_with_intersection") {
    return [
      ...witness,
      "公因數（兩個因數集合的交集）：________________",
    ].join("\n");
  }

  if (model.kind === "common_factor_set_with_gcf") {
    return [
      ...witness,
      "公因數（兩個因數集合的交集）：________________",
      "最大公因數（公因數中的最大值）：________________",
    ].join("\n");
  }

  throw new Error(`G5AU02_S102_DISPLAY_KIND_UNSUPPORTED:${model?.kind ?? "missing"}`);
}

export function validateG5AU02S102QuestionDisplayModel(item, model, promptText = "") {
  const errors = [];
  if (!isG5AU02S102Pattern(item?.patternSpecId)) return deepFreeze({ ok: true, errors });
  if (!model || model.schemaName !== "G5AU02QuestionDisplayModel") {
    return deepFreeze({ ok: false, errors: ["G5AU02_VISIBLE_DISPLAY_MODEL_REQUIRED"] });
  }

  const data = item.data ?? {};
  const enumeration = item.patternSpecId === "ps_g5a_u02_common_factor_enumeration";
  if (model.a !== data.a || model.b !== data.b) {
    errors.push(enumeration
      ? "G5AU02_P0_COMMON_FACTOR_OPERANDS_DEGENERATE"
      : "G5AU02_P0_GCF_OPERANDS_DEGENERATE");
  }
  if (!same(model.factorSetA, data.factorSetA) || !same(model.factorSetB, data.factorSetB)) {
    errors.push(enumeration
      ? "G5AU02_P0_FACTOR_SET_WITNESS_MISSING"
      : "G5AU02_P0_GCF_COMMON_SET_MISSING");
  }
  if (Object.prototype.hasOwnProperty.call(model, "commonFactors")
    || Object.prototype.hasOwnProperty.call(model, "greatestCommonFactor")) {
    errors.push("G5AU02_WORKSHEET_QUESTION_ANSWER_LEAKAGE");
  }
  if (model.answerFieldsExcluded !== true) errors.push("G5AU02_WORKSHEET_QUESTION_ANSWER_LEAKAGE");

  if (enumeration) {
    if (model.kind !== "parallel_factor_sets_with_intersection") {
      errors.push("G5AU02_P0_FACTOR_SET_WITNESS_MISSING");
    }
  } else if (model.kind !== "common_factor_set_with_gcf") {
    errors.push("G5AU02_P0_GCF_COMMON_SET_MISSING");
  }

  let expectedPrompt = "";
  try {
    expectedPrompt = serializeG5AU02S102QuestionDisplayModel(model);
  } catch {
    errors.push("G5AU02_DISPLAY_KIND_MISMATCH");
  }
  if (typeof promptText !== "string" || promptText.length === 0) errors.push("G5AU02_VISIBLE_PROMPT_REQUIRED");
  if (promptText !== expectedPrompt) errors.push("G5AU02_PROMPT_VISIBLE_DATA_INCOMPLETE");
  if (!promptText.includes(model.factorSetA.join("、")) || !promptText.includes(model.factorSetB.join("、"))) {
    errors.push(enumeration
      ? "G5AU02_P0_FACTOR_SET_WITNESS_MISSING"
      : "G5AU02_P0_GCF_COMMON_SET_MISSING");
  }

  return deepFreeze({ ok: errors.length === 0, errors: [...new Set(errors)] });
}
