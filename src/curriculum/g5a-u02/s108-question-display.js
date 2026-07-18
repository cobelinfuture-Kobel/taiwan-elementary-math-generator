import { isG5AU02S108Pattern } from "./s108-remainder-transfer-runtime.js";

const KIND = "remainder_transfer_story_witness";

function freeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) freeze(nested);
  return Object.freeze(value);
}
function exact(actual, expected) { return JSON.stringify(actual) === JSON.stringify(expected); }
function clone(value) { return JSON.parse(JSON.stringify(value)); }

function publicDistributionWitness(data) {
  return {
    witnessKind: "two_level_distribution_remainder_transfer_public_scaffold",
    knownDistribution: {
      role: "given_larger_distribution",
      dividend: data.total,
      divisor: data.largerDivisor,
      remainder: data.remainder,
      statementText: `${data.total} ÷ ${data.largerDivisor} 餘 ${data.remainder}`,
    },
    transferredDistribution: {
      role: "student_target_distribution",
      dividend: data.total,
      divisor: data.smallerDivisor,
      quotientResponseText: "______",
      remainderResponseText: "______",
      statementText: `${data.total} ÷ ${data.smallerDivisor} 餘 ______`,
    },
  };
}

export function getG5AU02S108DisplayKinds() { return [KIND]; }
export function isG5AU02S108DisplayModel(model) {
  return model?.schemaName === "G5AU02QuestionDisplayModel" && model.kind === KIND;
}

export function buildG5AU02S108QuestionDisplayModel(item) {
  if (!isG5AU02S108Pattern(item?.patternSpecId)) return null;
  const data = item.data ?? {};
  const unitLabel = data.quantityRoles?.remainder?.unitLabel ?? "個";
  return freeze({
    schemaName: "G5AU02QuestionDisplayModel",
    schemaVersion: 2,
    kind: KIND,
    scenarioFamilyId: data.scenarioFamilyId,
    scenarioText: data.scenarioText,
    quantityRoles: clone(data.quantityRoles),
    divisorRelation: clone(data.divisorRelation),
    distributionWitness: publicDistributionWitness(data),
    remainder: {
      role: "student_remainder_response",
      responseText: "______",
      unitLabel,
    },
    publicAnswerPolicy: "target_distribution_and_remainder_are_blank_student_responses",
  });
}

export function serializeG5AU02S108QuestionDisplayModel(model) {
  if (!isG5AU02S108DisplayModel(model)) throw new Error(`G5AU02_S108_DISPLAY_KIND_UNSUPPORTED:${model?.kind ?? "missing"}`);
  return [
    model.scenarioText,
    `除數關係：${model.divisorRelation.equationText}`,
    `已知分裝：${model.distributionWitness.knownDistribution.statementText}`,
    `改分裝：${model.distributionWitness.transferredDistribution.statementText}`,
    `答：餘 ${model.remainder.responseText} ${model.remainder.unitLabel}`,
  ].join("\n");
}

export function validateG5AU02S108QuestionDisplayModel(item, model, promptText = "") {
  const errors = [];
  if (!isG5AU02S108Pattern(item?.patternSpecId)) return freeze({ ok: false, errors: ["G5AU02_S108_DISPLAY_PATTERN_UNSUPPORTED"] });
  if (!isG5AU02S108DisplayModel(model)) return freeze({ ok: false, errors: ["G5AU02_VISIBLE_DISPLAY_MODEL_REQUIRED"] });
  const data = item.data ?? {};
  if (model.scenarioFamilyId !== data.scenarioFamilyId || model.scenarioText !== data.scenarioText) {
    errors.push("G5AU02_P2_REMAINDER_TRANSFER_CONTEXT_FAMILY_UNKNOWN");
  }
  if (!exact(model.quantityRoles, data.quantityRoles)
    || model.remainder?.role !== "student_remainder_response"
    || model.remainder?.responseText !== "______"
    || model.remainder?.unitLabel !== data.quantityRoles?.remainder?.unitLabel) {
    errors.push("G5AU02_P2_REMAINDER_TRANSFER_CONTEXT_ROLE_MISSING");
  }
  const expectedPublicWitness = publicDistributionWitness(data);
  if (!exact(model.divisorRelation, data.divisorRelation)
    || !exact(model.distributionWitness, expectedPublicWitness)
    || model.publicAnswerPolicy !== "target_distribution_and_remainder_are_blank_student_responses") {
    errors.push("G5AU02_P2_REMAINDER_TRANSFER_WITNESS_MISMATCH");
  }
  if (model.distributionWitness?.transferredDistribution?.statementText?.includes(String(data.distributionWitness?.transferredDistribution?.quotient))
    || model.distributionWitness?.transferredDistribution?.statementText?.endsWith(String(data.remainder))) {
    errors.push("G5AU02_P2_REMAINDER_TRANSFER_WITNESS_MISMATCH");
  }
  if (typeof promptText !== "string" || promptText.length === 0) errors.push("G5AU02_VISIBLE_PROMPT_REQUIRED");
  const requiredVisible = [
    model.scenarioText,
    model.divisorRelation?.equationText,
    model.distributionWitness?.knownDistribution?.statementText,
    model.distributionWitness?.transferredDistribution?.statementText,
    model.remainder?.unitLabel,
  ];
  if (requiredVisible.some((text) => typeof text !== "string" || !promptText.includes(text))) {
    errors.push("G5AU02_PROMPT_VISIBLE_DATA_INCOMPLETE");
  }
  return freeze({ ok: errors.length === 0, errors: [...new Set(errors)] });
}

export function compactG5AU02S108Prompt(model) {
  if (!isG5AU02S108DisplayModel(model)) return "";
  return model.scenarioText;
}
