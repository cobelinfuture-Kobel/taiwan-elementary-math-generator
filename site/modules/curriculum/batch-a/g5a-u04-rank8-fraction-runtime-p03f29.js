import { buildBatchABrowserPlan } from "./batch-a-browser-generator-p03f29.js";
import { getBatchABrowserPatternDefinition } from "./source-pattern-full-product-p03f29-extension.js";
import {
  G5A_U04_P03F29_KP_ID,
  G5A_U04_P03F29_GROUP_ID,
  G5A_U04_P03F29_SOURCE_ID,
  G5A_U04_P03F29_SPEC_ID,
  P03F29_REQUIRED_CAPABILITY_IDS,
} from "../registry/g5a-u04-rank8-fraction-selector-projection-p03f29.js";

const seedOffset = (seed, size) => [...String(seed ?? "p03f29")].reduce((sum, char) => (sum + char.charCodeAt(0)) % Math.max(1, size), 0);
const compareProducts = (leftNumerator, leftDenominator, rightNumerator, rightDenominator) => {
  const left = leftNumerator * rightDenominator;
  const right = rightNumerator * leftDenominator;
  return left < right ? "<" : left > right ? ">" : "=";
};
const issue = (code, path) => ({ code, severity: "error", path, message: code });

function buildFixture(ordinal, seed) {
  const offset = seedOffset(seed, 97);
  if (ordinal % 5 === 4) {
    const denominator = 3 + ((ordinal + offset) % 9);
    const numerator = 1 + ((ordinal * 2 + offset) % (denominator + 2));
    const factor = 2 + ((ordinal + offset) % 3);
    return {
      leftNumerator: numerator,
      leftDenominator: denominator,
      rightNumerator: numerator * factor,
      rightDenominator: denominator * factor,
    };
  }
  const leftDenominator = 3 + ((ordinal * 5 + offset) % 10);
  let rightDenominator = 4 + ((ordinal * 7 + offset + 3) % 11);
  if (rightDenominator === leftDenominator) rightDenominator += 1;
  const leftNumerator = 1 + ((ordinal * 11 + offset + 1) % (leftDenominator + 4));
  let rightNumerator = 1 + ((ordinal * 13 + offset + 2) % (rightDenominator + 4));
  if (compareProducts(leftNumerator, leftDenominator, rightNumerator, rightDenominator) === "=") rightNumerator += 1;
  return { leftNumerator, leftDenominator, rightNumerator, rightDenominator };
}

function metadata(definition) {
  return Object.freeze({
    patternId: definition.patternSpecId,
    sourceId: G5A_U04_P03F29_SOURCE_ID,
    patternTags: Object.freeze(["full_product_w3_slice029", definition.patternSpecId]),
    skillTags: definition.skillTags,
    difficultyTags: definition.difficultyTags,
    curriculumNodeIds: Object.freeze([G5A_U04_P03F29_SOURCE_ID]),
    canonicalSkillIds: definition.canonicalSkillIds,
    knowledgePointId: G5A_U04_P03F29_KP_ID,
    patternGroupId: G5A_U04_P03F29_GROUP_ID,
    operationFamilyId: "fraction_compare",
    requestedUnknownRole: "comparison",
    requiredCapabilityIds: P03F29_REQUIRED_CAPABILITY_IDS,
    applicationClassification: "APPLICATION_COMPATIBLE",
    productAdmissionTask: "P03F_W3DirectProductVerticalSlice029Implementation",
    generatorAdapterId: "SHARED_OPERATION_FAMILY_GENERATOR_V1",
    validatorAdapterId: "SHARED_OPERATION_FAMILY_VALIDATOR_V1",
    globalContextAuthorityPath: null,
    hiddenApplicationPatternSpecId: "ps_g5a_u04_unlike_fraction_compare_comparison_application",
  });
}

function buildQuestion(ordinal, seed) {
  const definition = getBatchABrowserPatternDefinition(G5A_U04_P03F29_SPEC_ID);
  const fixture = buildFixture(ordinal, seed);
  const answerText = compareProducts(
    fixture.leftNumerator,
    fixture.leftDenominator,
    fixture.rightNumerator,
    fixture.rightDenominator,
  );
  const promptText = `${fixture.leftNumerator}/${fixture.leftDenominator} ○ ${fixture.rightNumerator}/${fixture.rightDenominator}，請填入 <、= 或 >。`;
  return Object.freeze({
    id: `${G5A_U04_P03F29_SPEC_ID}-${ordinal + 1}`,
    sourceId: G5A_U04_P03F29_SOURCE_ID,
    patternSpecId: G5A_U04_P03F29_SPEC_ID,
    kind: definition.kind,
    operation: "fraction_compare",
    operationFamilyId: "fraction_compare",
    questionMode: "numeric",
    mode: "NUMERIC",
    promptText,
    questionText: promptText,
    blankedDisplayText: promptText,
    displayText: `${promptText} ${answerText}`,
    answerText,
    finalAnswer: answerText,
    ...fixture,
    comparison: answerText,
    metadata: metadata(definition),
    globalContextProduction: null,
  });
}

export function canGenerateG5AU04P03F29Questions(plan = {}) {
  return plan.sourceId === G5A_U04_P03F29_SOURCE_ID
    && Array.isArray(plan.patternSpecIds)
    && plan.patternSpecIds.length === 1
    && plan.patternSpecIds[0] === G5A_U04_P03F29_SPEC_ID;
}

export function validateG5AU04P03F29Question(question = {}) {
  const errors = [];
  const definition = getBatchABrowserPatternDefinition(G5A_U04_P03F29_SPEC_ID);
  if (question.patternSpecId !== G5A_U04_P03F29_SPEC_ID) errors.push(issue("p03f29_pattern_invalid", "patternSpecId"));
  if (question.sourceId !== G5A_U04_P03F29_SOURCE_ID || question.metadata?.sourceId !== G5A_U04_P03F29_SOURCE_ID) errors.push(issue("p03f29_source_mismatch", "sourceId"));
  if (question.questionMode !== "numeric" || question.globalContextProduction != null || question.metadata?.globalContextAuthorityPath != null) errors.push(issue("p03f29_application_scope_leak", "questionMode"));
  if (question.metadata?.knowledgePointId !== G5A_U04_P03F29_KP_ID || question.metadata?.patternGroupId !== G5A_U04_P03F29_GROUP_ID) errors.push(issue("p03f29_lineage_mismatch", "metadata"));
  if (question.metadata?.applicationClassification !== "APPLICATION_COMPATIBLE") errors.push(issue("p03f29_application_classification_mismatch", "metadata.applicationClassification"));
  if (JSON.stringify(question.metadata?.requiredCapabilityIds) !== JSON.stringify(P03F29_REQUIRED_CAPABILITY_IDS)) errors.push(issue("p03f29_fraction_capability_set_invalid", "metadata.requiredCapabilityIds"));
  const ints = [question.leftNumerator, question.leftDenominator, question.rightNumerator, question.rightDenominator];
  if (!ints.every(Number.isSafeInteger) || question.leftDenominator <= 0 || question.rightDenominator <= 0 || question.leftDenominator === question.rightDenominator) errors.push(issue("p03f29_fraction_operand_invalid", "fractionOperands"));
  const expected = compareProducts(question.leftNumerator, question.leftDenominator, question.rightNumerator, question.rightDenominator);
  if (question.comparison !== expected || question.answerText !== expected || question.finalAnswer !== expected) errors.push(issue("p03f29_compare_answer_invalid", "answerText"));
  if (definition?.operation !== "fraction_compare" || definition?.requestedUnknownRole !== "comparison") errors.push(issue("p03f29_definition_invalid", "patternDefinition"));
  return { ok: errors.length === 0, errors, warnings: [] };
}

export function generateG5AU04P03F29Questions(options = {}) {
  const plan = options.plan ?? buildBatchABrowserPlan(options);
  if (!canGenerateG5AU04P03F29Questions(plan)) {
    return { ok: false, errors: [issue("p03f29_plan_not_supported", "patternSpecIds")], warnings: [], questions: [], plan };
  }
  const count = Number(options.questionCount ?? plan.questionCount ?? 24);
  if (!Number.isInteger(count) || count < 1 || count > 240) {
    return { ok: false, errors: [issue("p03f29_question_count_invalid", "questionCount")], warnings: [], questions: [], plan };
  }
  const questions = Array.from({ length: count }, (_, index) => buildQuestion(index, options.generationSeed ?? plan.generationSeed));
  const errors = questions.flatMap((question, index) => validateG5AU04P03F29Question(question).errors.map((error) => ({ ...error, path: `questions[${index}].${error.path}` })));
  if (new Set(questions.map((question) => question.blankedDisplayText)).size !== questions.length) errors.push(issue("p03f29_duplicate_prompt_detected", "questions"));
  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    warnings: Object.freeze([]),
    questions: Object.freeze(questions),
    allocation: Object.freeze([{ patternSpecId: G5A_U04_P03F29_SPEC_ID, questionCount: questions.length }]),
    plan,
  });
}
