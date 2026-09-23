import { getBatchABrowserPatternDefinition } from "./source-pattern-full-product-p03f12-extension.js";
import { G4B_U08_SOURCE_ID } from "../registry/g4b-u08-equivalent-fraction-selector-projection.js";
import {
  G4B_U08_EQUIVALENCE_CROSS_PRODUCT_KP_ID,
  G4B_U08_EQUIVALENCE_CROSS_PRODUCT_GROUP_ID,
  G4B_U08_EQUIVALENCE_CROSS_PRODUCT_SPEC_ID,
} from "../registry/g4b-u08-equivalence-cross-product-selector-projection.js";

const CAPS = Object.freeze([
  "cap_fraction_arithmetic",
  "cap_fraction_domain_validator",
  "cap_fraction_number_system",
]);

export function buildG4BU08EquivalenceCrossProductQuestion(row, index) {
  const definition = getBatchABrowserPatternDefinition(G4B_U08_EQUIVALENCE_CROSS_PRODUCT_SPEC_ID);
  const leftCrossProduct = row.leftNumerator * row.rightDenominator;
  const rightCrossProduct = row.rightNumerator * row.leftDenominator;
  const equivalent = leftCrossProduct === rightCrossProduct;
  const promptText = `判斷 ${row.leftNumerator}/${row.leftDenominator} 和 ${row.rightNumerator}/${row.rightDenominator} 是否為等值分數。`;
  const answerText = equivalent ? "是" : "否";
  return Object.freeze({
    id: `${G4B_U08_EQUIVALENCE_CROSS_PRODUCT_SPEC_ID}-${index}`,
    sourceId: G4B_U08_SOURCE_ID,
    patternSpecId: G4B_U08_EQUIVALENCE_CROSS_PRODUCT_SPEC_ID,
    kind: "g4bU08EquivalenceCrossProduct",
    operation: "cross_product_equivalence",
    operationFamilyId: "cross_product_equivalence",
    questionMode: "numeric",
    promptText,
    questionText: promptText,
    blankedDisplayText: promptText,
    displayText: `${promptText} ${answerText}`,
    answerText,
    leftNumerator: row.leftNumerator,
    leftDenominator: row.leftDenominator,
    rightNumerator: row.rightNumerator,
    rightDenominator: row.rightDenominator,
    leftCrossProduct,
    rightCrossProduct,
    equivalent,
    requestedUnknownRole: "equivalent",
    finalAnswer: Object.freeze({ value: equivalent, canonicalText: answerText, answerType: "boolean", exact: true }),
    metadata: Object.freeze({
      patternId: definition.patternSpecId,
      sourceId: definition.sourceId,
      patternTags: Object.freeze(["full_product_w3_slice012", definition.sourceId, definition.patternSpecId]),
      skillTags: definition.skillTags,
      difficultyTags: definition.difficultyTags,
      curriculumNodeIds: Object.freeze([definition.sourceId]),
      canonicalSkillIds: definition.canonicalSkillIds,
      knowledgePointId: definition.knowledgePointId,
      patternGroupId: definition.patternGroupId,
      operationFamilyId: definition.operationFamilyId,
      requestedUnknownRole: definition.requestedUnknownRole,
      requiredCapabilityIds: definition.requiredCapabilityIds,
      applicationClassification: "APPLICATION_NOT_APPLICABLE",
      exactRationalIdentity: true,
      productAdmissionTask: "P03F_W3DirectProductVerticalSlice012Implementation",
      generatorAdapterId: "SHARED_OPERATION_FAMILY_GENERATOR_V1",
      validatorAdapterId: "SHARED_OPERATION_FAMILY_VALIDATOR_V1",
    }),
  });
}

export function validateG4BU08EquivalenceCrossProductQuestion(question = {}) {
  const errors = [];
  const add = (code, path) => errors.push({ code, severity: "error", path, message: code });
  if (question.sourceId !== G4B_U08_SOURCE_ID || question.metadata?.sourceId !== G4B_U08_SOURCE_ID) add("p03f12_source_mismatch", "sourceId");
  if (question.patternSpecId !== G4B_U08_EQUIVALENCE_CROSS_PRODUCT_SPEC_ID || question.metadata?.patternId !== question.patternSpecId) add("p03f12_pattern_mismatch", "patternSpecId");
  if (question.metadata?.knowledgePointId !== G4B_U08_EQUIVALENCE_CROSS_PRODUCT_KP_ID || question.metadata?.patternGroupId !== G4B_U08_EQUIVALENCE_CROSS_PRODUCT_GROUP_ID) add("p03f12_kp_group_mismatch", "metadata.knowledgePointId");
  const roles = ["leftNumerator", "leftDenominator", "rightNumerator", "rightDenominator"];
  if (roles.some((role) => !Number.isInteger(question[role]) || question[role] <= 0) || question.leftDenominator <= 1 || question.rightDenominator <= 1) add("p03f12_fraction_roles_invalid", "leftNumerator");
  const left = question.leftNumerator * question.rightDenominator;
  const right = question.rightNumerator * question.leftDenominator;
  const equivalent = left === right;
  if (question.leftCrossProduct !== left || question.rightCrossProduct !== right || question.equivalent !== equivalent) add("p03f12_cross_product_identity_invalid", "leftCrossProduct");
  const answerText = equivalent ? "是" : "否";
  if (question.answerText !== answerText || question.finalAnswer?.value !== equivalent || question.finalAnswer?.canonicalText !== answerText || question.finalAnswer?.exact !== true) add("p03f12_answer_identity_invalid", "answerText");
  if (JSON.stringify(question.metadata?.requiredCapabilityIds) !== JSON.stringify(CAPS)) add("p03f12_capability_set_invalid", "metadata.requiredCapabilityIds");
  if (question.questionMode !== "numeric" || question.metadata?.applicationClassification !== "APPLICATION_NOT_APPLICABLE") add("p03f12_application_scope_violation", "questionMode");
  if (/(?:算式|_{2,}|答\s*[:：]|\{\{)/.test(String(question.blankedDisplayText ?? ""))) add("p03f12_forbidden_surface_present", "blankedDisplayText");
  return { ok: errors.length === 0, errors, warnings: [] };
}
