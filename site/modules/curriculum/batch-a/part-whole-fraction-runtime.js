import { buildBatchABrowserPlan } from "./batch-a-browser-generator.js";
import {
  G3A_U08_PART_WHOLE_PATTERN_DEFINITION,
  getBatchABrowserPatternDefinition,
} from "./source-pattern-full-product-p03f-extension.js";
import {
  G3A_U08_PART_WHOLE_KP_ID,
  G3A_U08_PART_WHOLE_PATTERN_GROUP_ID,
  G3A_U08_PART_WHOLE_PATTERN_SPEC_ID,
  G3A_U08_SOURCE_ID,
} from "../registry/g3a-u08-part-whole-fraction-selector-projection.js";

const DENOMINATORS = Object.freeze([2, 3, 4, 5, 6, 8, 10, 12]);
const PART_WHOLE_FIXTURES = Object.freeze(DENOMINATORS.flatMap((equalParts) => (
  Array.from({ length: (equalParts - 1) * 2 }, (_, index) => Object.freeze({
    equalParts,
    selectedParts: index % (equalParts - 1) + 1,
    representationIndex: Math.floor(index / (equalParts - 1)),
  }))
)));

function hashSeed(value) {
  let acc = 2166136261;
  for (const char of String(value ?? "p03f")) {
    acc ^= char.charCodeAt(0);
    acc = Math.imul(acc, 16777619) >>> 0;
  }
  return acc || 1;
}
function state(seed, index, channel) {
  let value = (hashSeed(`${seed}:${channel}`) + Math.imul(index + 1, 0x9e3779b1)) >>> 0;
  value ^= value >>> 16;
  value = Math.imul(value, 0x7feb352d) >>> 0;
  value ^= value >>> 15;
  value = Math.imul(value, 0x846ca68b) >>> 0;
  return (value ^ (value >>> 16)) >>> 0;
}
function fractionText(numerator, denominator) {
  return `${numerator}/${denominator}`;
}
function gcd(a, b) {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) [x, y] = [y, x % y];
  return x || 1;
}
function fixtureAt(index, seed) {
  const size = PART_WHOLE_FIXTURES.length;
  const offset = state(seed, 0, "part-whole-fixture-offset") % size;
  const step = [79, 73, 71, 67, 61].find((candidate) => gcd(candidate, size) === 1) ?? 1;
  return PART_WHOLE_FIXTURES[(offset + index * step) % size];
}
function symbols(selectedParts, equalParts, selected, unselected) {
  return [
    ...Array.from({ length: selectedParts }, () => selected),
    ...Array.from({ length: equalParts - selectedParts }, () => unselected),
  ].join(" ");
}
function buildPrompt(representationMode, selectedParts, equalParts) {
  if (representationMode === "CONTINUOUS_EQUAL_PARTITION") {
    const model = symbols(selectedParts, equalParts, "■", "□");
    return {
      model,
      promptText: `一個整體平均分成 ${equalParts} 份：${model}。塗色部分是整體的幾分之幾？`,
    };
  }
  const model = symbols(selectedParts, equalParts, "●", "○");
  return {
    model,
    promptText: `一組圖形共有 ${equalParts} 個相同位置：${model}。選取部分占全部的幾分之幾？`,
  };
}
function metadata(definition, representationMode) {
  return {
    patternId: definition.patternSpecId,
    sourceId: definition.sourceId,
    patternTags: ["full_product_w3_slice001", definition.sourceId, definition.patternSpecId],
    skillTags: [...definition.skillTags],
    difficultyTags: [...definition.difficultyTags],
    curriculumNodeIds: [definition.sourceId],
    canonicalSkillIds: [...definition.canonicalSkillIds],
    knowledgePointId: definition.knowledgePointId,
    patternGroupId: definition.patternGroupId,
    representationMode,
    requiredCapabilityIds: ["cap_fraction_domain_validator", "cap_fraction_number_system"],
    applicationClassification: "APPLICATION_NOT_APPLICABLE",
    magnitudeClass: "PROPER_FRACTION",
    excludedKnowledgePointIds: ["kp_g3a_u08_whole_as_fraction"],
    productAdmissionTask: "P03F_W3DirectProductVerticalSlice001Implementation",
  };
}
function generateQuestion(index, seed) {
  const definition = getBatchABrowserPatternDefinition(G3A_U08_PART_WHOLE_PATTERN_SPEC_ID);
  const fixture = fixtureAt(index - 1, seed);
  const { equalParts, selectedParts } = fixture;
  const representationMode = definition.representationModes[fixture.representationIndex];
  const prompt = buildPrompt(representationMode, selectedParts, equalParts);
  const answerText = fractionText(selectedParts, equalParts);
  return Object.freeze({
    id: `${G3A_U08_PART_WHOLE_PATTERN_SPEC_ID}-${index}`,
    sourceId: G3A_U08_SOURCE_ID,
    patternSpecId: G3A_U08_PART_WHOLE_PATTERN_SPEC_ID,
    kind: "g3aU08PartWholeFraction",
    operation: "part_whole_fraction",
    questionMode: "numeric",
    promptText: prompt.promptText,
    questionText: prompt.promptText,
    blankedDisplayText: prompt.promptText,
    displayText: `${prompt.promptText} ${answerText}`,
    answerText,
    finalAnswer: Object.freeze({ numerator: selectedParts, denominator: equalParts }),
    numerator: selectedParts,
    denominator: equalParts,
    selectedParts,
    equalParts,
    representationMode,
    representationModel: prompt.model,
    metadata: Object.freeze(metadata(definition, representationMode)),
  });
}
function allocate(questionCount) {
  return [{ patternSpecId: G3A_U08_PART_WHOLE_PATTERN_SPEC_ID, questionCount }];
}

export function canGenerateG3AU08PartWholeFractionQuestions(plan = {}) {
  return plan.sourceId === G3A_U08_SOURCE_ID
    && Array.isArray(plan.patternSpecIds)
    && plan.patternSpecIds.length === 1
    && plan.patternSpecIds[0] === G3A_U08_PART_WHOLE_PATTERN_SPEC_ID;
}

export function validateG3AU08PartWholeFractionQuestion(question = {}) {
  const errors = [];
  const add = (code, path) => errors.push({ code, severity: "error", path, message: code });
  if (question.sourceId !== G3A_U08_SOURCE_ID || question.metadata?.sourceId !== G3A_U08_SOURCE_ID) add("p03f_source_mismatch", "sourceId");
  if (question.patternSpecId !== G3A_U08_PART_WHOLE_PATTERN_SPEC_ID || question.metadata?.patternId !== G3A_U08_PART_WHOLE_PATTERN_SPEC_ID) add("p03f_pattern_mismatch", "patternSpecId");
  if (question.metadata?.knowledgePointId !== G3A_U08_PART_WHOLE_KP_ID) add("p03f_kp_mismatch", "metadata.knowledgePointId");
  if (question.metadata?.patternGroupId !== G3A_U08_PART_WHOLE_PATTERN_GROUP_ID) add("p03f_group_mismatch", "metadata.patternGroupId");
  if (!Number.isSafeInteger(question.equalParts) || question.equalParts < 2) add("p03f_denominator_invalid", "equalParts");
  if (!Number.isSafeInteger(question.selectedParts) || question.selectedParts <= 0 || question.selectedParts >= question.equalParts) add("p03f_numerator_invalid", "selectedParts");
  if (question.answerText !== fractionText(question.selectedParts, question.equalParts)) add("p03f_answer_invalid", "answerText");
  if (question.finalAnswer?.numerator !== question.selectedParts || question.finalAnswer?.denominator !== question.equalParts) add("p03f_final_answer_invalid", "finalAnswer");
  if (question.metadata?.magnitudeClass !== "PROPER_FRACTION") add("p03f_magnitude_class_invalid", "metadata.magnitudeClass");
  if (!G3A_U08_PART_WHOLE_PATTERN_DEFINITION.representationModes.includes(question.representationMode)) add("p03f_representation_invalid", "representationMode");
  if (String(question.blankedDisplayText ?? "").match(/(?:算式|_{2,}|答\s*[:：])/)) add("p03f_forbidden_label_present", "blankedDisplayText");
  if (String(question.blankedDisplayText ?? "").includes("{")) add("p03f_prompt_slot_unresolved", "blankedDisplayText");
  return { ok: errors.length === 0, errors, warnings: [] };
}

export function generateG3AU08PartWholeFractionQuestions(options = {}) {
  const plan = buildBatchABrowserPlan(options);
  if (!canGenerateG3AU08PartWholeFractionQuestions(plan)) {
    return {
      ok: false,
      plan,
      questions: [],
      allocation: [],
      errors: [{ code: "p03f_plan_not_supported", severity: "error", path: "plan", message: "P03F slice001 accepts only its admitted source and PatternSpec." }],
      warnings: [],
    };
  }
  const allocation = allocate(plan.questionCount);
  const questions = Array.from({ length: plan.questionCount }, (_, offset) => generateQuestion(offset + 1, plan.generationSeed));
  const errors = questions.flatMap((question) => validateG3AU08PartWholeFractionQuestion(question).errors);
  return {
    ok: errors.length === 0 && questions.length === plan.questionCount,
    plan,
    questions,
    allocation,
    errors,
    warnings: [],
  };
}
