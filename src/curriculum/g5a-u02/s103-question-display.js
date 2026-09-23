import {
  G5A_U02_S103_GENERATED_PROFILE_ID,
  G5A_U02_S103_SOURCE_PROFILE_ID,
  isG5AU02S103Pattern,
} from "./s103-digit-code-runtime.js";

const EXACT_SOURCE_TEXT_BY_ID = Object.freeze({
  third_digit_common_factor: "第三個數字和第一個數字不同，且第三個數字是 6 和 8 的公因數。",
  second_fourth_have_70_as_common_multiple: "70 是第二個數字和第四個數字的公倍數。",
  first_digit_double_common_factor: "第一個數字同時是 22 和 33 的公因數，也是 45 和 60 的公因數。",
  whole_number_multiple_of_3_and_5: "這個四位數同時是 3 的倍數和 5 的倍數。",
  all_digits_distinct: "四個數字互不重複。",
});

function clone(value) { return JSON.parse(JSON.stringify(value)); }
function same(left, right) { return JSON.stringify(left) === JSON.stringify(right); }
function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) deepFreeze(nested);
  return Object.freeze(value);
}

function publicSourceReference(reference = {}) {
  return {
    sourceProfileId: reference.sourceProfileId,
    sourceEvidence: reference.sourceEvidence,
    retainedExactly: reference.retainedExactly === true,
    allocationSeparation: reference.defaultAllocationExcluded === true
      ? "reference_only_excluded_from_default"
      : "generated_default_separated_from_source_reference",
  };
}

function publicConditions(data) {
  const conditions = clone(data.conditions ?? []);
  if (data.profileId !== G5A_U02_S103_SOURCE_PROFILE_ID) return conditions;
  return conditions.map((condition) => ({
    ...condition,
    text: EXACT_SOURCE_TEXT_BY_ID[condition.conditionId] ?? condition.text,
  }));
}

export function isG5AU02S103DisplayModel(model) {
  return model?.kind === "unique_digit_code_constraints";
}

export function buildG5AU02S103QuestionDisplayModel(item) {
  if (!isG5AU02S103Pattern(item?.patternSpecId)) return null;
  const data = item.data ?? {};
  return deepFreeze({
    schemaName: "G5AU02QuestionDisplayModel",
    schemaVersion: 5,
    representationTask: "G5AU02-S103_P0SourceDigitCodeReferenceAndGeneratedFamilySeparation",
    kind: "unique_digit_code_constraints",
    profileId: data.profileId,
    productionAllocation: data.productionAllocation,
    candidateDomain: clone(data.candidateDomain),
    conditions: publicConditions(data),
    solutionCount: data.solutionCount,
    sourceReference: publicSourceReference(data.sourceReference),
  });
}

function domainText(model) {
  const domain = model.candidateDomain;
  const rules = [`候選範圍：${domain.min} 到 ${domain.max}`];
  if (domain.distinctDigits) rules.push("四個數字互不重複");
  if (domain.nonzeroThousandsDigit) rules.push("千位不為 0");
  return `${rules.join("；")}。`;
}

export function serializeG5AU02S103QuestionDisplayModel(model) {
  if (!isG5AU02S103DisplayModel(model)) {
    throw new Error(`G5AU02_S103_DISPLAY_KIND_UNSUPPORTED:${model?.kind ?? "missing"}`);
  }
  const heading = model.profileId === G5A_U02_S103_SOURCE_PROFILE_ID
    ? "依照來源參考題的條件，找出唯一的四位數密碼。"
    : "依照下列條件，找出唯一的四位數密碼。";
  return [
    heading,
    domainText(model),
    ...model.conditions.map((condition, index) => `${index + 1}. ${condition.text}`),
  ].join("\n");
}

export function validateG5AU02S103QuestionDisplayModel(item, model, promptText = "") {
  const errors = [];
  if (!isG5AU02S103Pattern(item?.patternSpecId)) return deepFreeze({ ok: true, errors });
  if (!model || model.schemaName !== "G5AU02QuestionDisplayModel") {
    return deepFreeze({ ok: false, errors: ["G5AU02_VISIBLE_DISPLAY_MODEL_REQUIRED"] });
  }
  const data = item.data ?? {};
  if (model.kind !== "unique_digit_code_constraints") errors.push("G5AU02_DISPLAY_KIND_MISMATCH");
  if (![G5A_U02_S103_SOURCE_PROFILE_ID, G5A_U02_S103_GENERATED_PROFILE_ID].includes(model.profileId)
    || model.profileId !== data.profileId
    || model.productionAllocation !== data.productionAllocation) {
    errors.push("G5AU02_P0_DIGIT_CODE_PROFILE_INVALID");
  }
  if (!same(model.candidateDomain, data.candidateDomain)
    || !same(model.conditions, publicConditions(data))
    || model.solutionCount !== 1
    || data.solutionCount !== 1) {
    errors.push("G5AU02_P0_DIGIT_CODE_CONDITION_INSUFFICIENT");
  }
  if (model.sourceReference?.sourceProfileId !== G5A_U02_S103_SOURCE_PROFILE_ID
    || model.sourceReference?.retainedExactly !== true
    || typeof model.sourceReference?.allocationSeparation !== "string") {
    errors.push("G5AU02_P0_DIGIT_CODE_PROFILE_INVALID");
  }
  for (const forbidden of ["answer", "structuredAnswer", "answerText", "digits", "value", "expectedSolution", "sourceSolution"]) {
    if (Object.prototype.hasOwnProperty.call(model, forbidden)) errors.push(`G5AU02_S103_ANSWER_LEAKAGE:${forbidden}`);
  }

  let expectedPrompt = "";
  try {
    expectedPrompt = serializeG5AU02S103QuestionDisplayModel(model);
  } catch {
    errors.push("G5AU02_DISPLAY_KIND_MISMATCH");
  }
  if (typeof promptText !== "string" || promptText.length === 0) errors.push("G5AU02_VISIBLE_PROMPT_REQUIRED");
  if (promptText !== expectedPrompt) errors.push("G5AU02_PROMPT_VISIBLE_DATA_INCOMPLETE");
  if (model.conditions.some((condition) => !promptText.includes(condition.text))) {
    errors.push("G5AU02_PROMPT_VISIBLE_DATA_INCOMPLETE");
  }
  if (!promptText.includes(String(model.candidateDomain.min))
    || !promptText.includes(String(model.candidateDomain.max))) {
    errors.push("G5AU02_PROMPT_VISIBLE_DATA_INCOMPLETE");
  }
  if (model.profileId === G5A_U02_S103_SOURCE_PROFILE_ID) {
    if (!same(
      model.conditions.map((condition) => condition.text),
      Object.values(EXACT_SOURCE_TEXT_BY_ID),
    )) errors.push("G5AU02_P0_DIGIT_CODE_PROFILE_INVALID");
    for (const leaked of ["千位為1", "百位為7", "十位為2", "個位為5"]) {
      if (promptText.includes(leaked)) errors.push("G5AU02_S103_SOURCE_ANSWER_LEAKAGE");
    }
  }
  return deepFreeze({ ok: errors.length === 0, errors: [...new Set(errors)] });
}
