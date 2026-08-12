import {
  G6B_U01_P03F32_DECIMAL_SPEC_ID,
  G6B_U01_P03F32_FRACTION_SPEC_ID,
  G6B_U01_P03F32_GROUP_ID,
  G6B_U01_P03F32_KP_ID,
  G6B_U01_P03F32_SOURCE_ID,
  G6B_U01_P03F32_SPEC_IDS,
  P03F32_REQUIRED_CAPABILITY_IDS,
} from "../registry/g6b-u01-rank8-decimal-fraction-conversion-selector-projection-p03f32.js";
import {
  exactDecimalToFraction,
  exactFractionToDecimal,
} from "../public/shared-mixed-domain-normalizer-p03f32.js";

const CASES = Object.freeze([
  [1,2],[3,4],[3,8],[7,20],[6,25],[9,50],[13,20],[7,8],
  [21,25],[29,40],[37,50],[89,100],[5,4],[6,5],[7,4],[9,8],
  [11,20],[17,25],[19,40],[23,50],[31,100],[63,125],[7,10],[13,25],
]);

const hash = (value) => [...String(value)].reduce((total, char) => ((total * 33) ^ char.charCodeAt(0)) >>> 0, 5381);
const issue = (code, path) => ({ code, severity:"error", path, message:code });

function buildQuestion(patternSpecId, pair, ordinal) {
  const [numerator, denominator] = pair;
  const decimalResult = exactFractionToDecimal({ numerator, denominator });
  const decimal = decimalResult.canonicalValue.canonicalText;
  const askFraction = patternSpecId === G6B_U01_P03F32_FRACTION_SPEC_ID;
  const conversion = askFraction
    ? exactDecimalToFraction(decimal)
    : decimalResult;
  const answerText = askFraction
    ? `${conversion.canonicalValue.numerator}/${conversion.canonicalValue.denominator}`
    : conversion.canonicalValue.canonicalText;
  const promptText = askFraction
    ? `將 ${decimal} 化成最簡分數。`
    : `將 ${numerator}/${denominator} 化成小數。`;
  return Object.freeze({
    id:`${patternSpecId}-${ordinal}`,
    sourceId:G6B_U01_P03F32_SOURCE_ID,
    patternSpecId,
    kind:"g6bU01MixedDomainConversionSlice032",
    operation:"mixed_domain_conversion",
    operationFamilyId:"mixed_domain_conversion",
    action:askFraction ? "TO_FRACTION" : "TO_DECIMAL",
    questionMode:"numeric",
    numerator,
    denominator,
    decimal,
    promptText,
    questionText:promptText,
    blankedDisplayText:promptText,
    answerText,
    displayText:`${promptText} ${answerText}`,
    finalAnswer:Object.freeze(askFraction ? {
      kind:"fraction",
      canonicalText:answerText,
      numerator:conversion.canonicalValue.numerator,
      denominator:conversion.canonicalValue.denominator,
      canonicalRationalIdentity:conversion.canonicalRationalIdentity,
      exact:true,
    } : {
      kind:"decimal",
      canonicalText:answerText,
      coefficient:conversion.canonicalValue.coefficient,
      scale:conversion.canonicalValue.scale,
      canonicalRationalIdentity:conversion.canonicalRationalIdentity,
      exact:true,
    }),
    metadata:Object.freeze({
      patternId:patternSpecId,
      sourceId:G6B_U01_P03F32_SOURCE_ID,
      knowledgePointId:G6B_U01_P03F32_KP_ID,
      patternGroupId:G6B_U01_P03F32_GROUP_ID,
      operationFamilyId:"mixed_domain_conversion",
      requestedUnknownRole:askFraction ? "fraction" : "decimal",
      requiredCapabilityIds:P03F32_REQUIRED_CAPABILITY_IDS,
      applicationClassification:"APPLICATION_COMPATIBLE_FUTURE_QUEUE_RESERVED",
      contextAuthority:null,
      globalContextProduction:null,
      sourceAuthorityMode:"R02_CANONICAL_PREREQUISITE_PROJECTION",
      directSourcePromptVerbatim:false,
      sourceReviewMethod:"R02_FULL_PAGE_VISUAL_READBACK_PLUS_SLICE032_DIRECT_SOURCE_RECHECK",
      productAdmissionTask:"P03F_W3DirectProductVerticalSlice032Implementation",
      generatorAdapterId:"SHARED_OPERATION_FAMILY_GENERATOR_V1",
      validatorAdapterId:"SHARED_OPERATION_FAMILY_VALIDATOR_V1",
      mixedDomainNormalizerId:"shared-mixed-domain-normalizer-p03f32-v2",
    }),
  });
}

export function canGenerateG6BU01P03F32Questions(plan = {}) {
  return plan.sourceId === G6B_U01_P03F32_SOURCE_ID
    && Array.isArray(plan.patternSpecIds)
    && plan.patternSpecIds.length > 0
    && plan.patternSpecIds.every((id) => G6B_U01_P03F32_SPEC_IDS.includes(id));
}

export function validateG6BU01P03F32Question(question = {}) {
  const errors = [];
  if (!G6B_U01_P03F32_SPEC_IDS.includes(question.patternSpecId)) errors.push(issue("p03f32_pattern_not_admitted", "patternSpecId"));
  if (question.sourceId !== G6B_U01_P03F32_SOURCE_ID || question.metadata?.sourceId !== G6B_U01_P03F32_SOURCE_ID) errors.push(issue("p03f32_source_mismatch", "sourceId"));
  if (question.metadata?.knowledgePointId !== G6B_U01_P03F32_KP_ID || question.metadata?.patternGroupId !== G6B_U01_P03F32_GROUP_ID) errors.push(issue("p03f32_kp_group_mismatch", "metadata"));
  if (!CASES.some(([n,d]) => n === question.numerator && d === question.denominator)) errors.push(issue("p03f32_operand_out_of_scope", "numerator"));
  if (question.questionMode !== "numeric" || question.metadata?.contextAuthority !== null || question.metadata?.globalContextProduction !== null) errors.push(issue("p03f32_application_scope_violation", "metadata.contextAuthority"));
  if (JSON.stringify(question.metadata?.requiredCapabilityIds) !== JSON.stringify(P03F32_REQUIRED_CAPABILITY_IDS)) errors.push(issue("p03f32_capability_set_invalid", "metadata.requiredCapabilityIds"));
  if (question.metadata?.directSourcePromptVerbatim !== false || question.metadata?.sourceAuthorityMode !== "R02_CANONICAL_PREREQUISITE_PROJECTION") errors.push(issue("p03f32_source_provenance_invalid", "metadata.sourceAuthorityMode"));

  try {
    const expectedDecimal = exactFractionToDecimal({ numerator:question.numerator, denominator:question.denominator });
    if (question.decimal !== expectedDecimal.canonicalValue.canonicalText) errors.push(issue("p03f32_decimal_identity_invalid", "decimal"));
    if (question.patternSpecId === G6B_U01_P03F32_FRACTION_SPEC_ID) {
      const expected = exactDecimalToFraction(question.decimal);
      const expectedText = `${expected.canonicalValue.numerator}/${expected.canonicalValue.denominator}`;
      if (question.action !== "TO_FRACTION" || question.answerText !== expectedText || question.finalAnswer?.canonicalText !== expectedText || question.finalAnswer?.exact !== true) errors.push(issue("p03f32_fraction_answer_invalid", "finalAnswer"));
    } else if (question.patternSpecId === G6B_U01_P03F32_DECIMAL_SPEC_ID) {
      const expectedText = expectedDecimal.canonicalValue.canonicalText;
      if (question.action !== "TO_DECIMAL" || question.answerText !== expectedText || question.finalAnswer?.canonicalText !== expectedText || question.finalAnswer?.exact !== true) errors.push(issue("p03f32_decimal_answer_invalid", "finalAnswer"));
    }
  } catch {
    errors.push(issue("p03f32_exact_normalization_failed", "finalAnswer"));
  }
  return { ok:errors.length===0, errors, warnings:[] };
}

export function generateG6BU01P03F32Questions(options = {}) {
  const plan = options.plan ?? options;
  const questionCount = Number(options.questionCount ?? plan.questionCount ?? 20);
  if (!canGenerateG6BU01P03F32Questions(plan) || !Number.isInteger(questionCount) || questionCount < 1 || questionCount > 24) {
    return { ok:false, plan, questions:[], allocation:[], errors:[issue("p03f32_plan_not_supported", "plan")], warnings:[] };
  }
  const specIds = [...new Set(plan.patternSpecIds)];
  const offset = hash(options.generationSeed ?? plan.generationSeed ?? "p03f32") % CASES.length;
  const questions = Array.from({ length:questionCount }, (_, index) => buildQuestion(specIds[index % specIds.length], CASES[(offset + index) % CASES.length], index + 1));
  const errors = questions.flatMap((question) => validateG6BU01P03F32Question(question).errors);
  return {
    ok:errors.length===0,
    plan,
    questions,
    allocation:specIds.map((patternSpecId) => ({ patternSpecId, questionCount:questions.filter((question) => question.patternSpecId === patternSpecId).length })),
    errors,
    warnings:[],
  };
}
