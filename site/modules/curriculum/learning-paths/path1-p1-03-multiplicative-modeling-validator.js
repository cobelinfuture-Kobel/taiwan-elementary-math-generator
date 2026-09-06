import {
  PATH1_P1_03_MULTIPLICATIVE_MODELING_ARITHMETIC_KP_ID,
  PATH1_P1_03_MULTIPLICATIVE_MODELING_INVARIANT,
  PATH1_P1_03_MULTIPLICATIVE_MODELING_LANGUAGE_DIFFICULTY,
  PATH1_P1_03_MULTIPLICATIVE_MODELING_MASTERY_CREDIT,
  PATH1_P1_03_MULTIPLICATIVE_MODELING_OPERATION_FAMILY_ID,
  PATH1_P1_03_MULTIPLICATIVE_MODELING_PRACTICE_MODE,
  PATH1_P1_03_MULTIPLICATIVE_MODELING_RELATION_ID,
  PATH1_P1_03_MULTIPLICATIVE_MODELING_RELATION_KP_ID,
  getPath1P103MultiplicativeModelingContext,
  getPath1P103MultiplicativeModelingPatternSpec,
  renderPath1P103MultiplicativeModelingPrompt,
} from "./path1-p1-03-multiplicative-modeling-patterns.js";

export function validatePath1P103MultiplicativeModelingItem(entry) {
  const errors = [];
  const metadata = entry?.metadata ?? {};
  const patternSpecId = metadata.patternSpecId;
  const contextVariantId = metadata.contextVariantId;
  const patternSpec = getPath1P103MultiplicativeModelingPatternSpec(patternSpecId);
  const contextEntry = getPath1P103MultiplicativeModelingContext(patternSpecId, contextVariantId);

  const amountPerGroup = Number(metadata.amountPerGroup);
  const groupCount = Number(metadata.groupCount);
  const totalAmount = Number(metadata.totalAmount);

  if (!patternSpec) errors.push("UNAPPROVED_PATTERN_SPEC");
  if (!contextEntry) errors.push("UNAPPROVED_CONTEXT_VARIANT");
  if (entry?.mode !== "semantic") errors.push("QUESTION_MODE_SCOPE_LEAK");
  if (entry?.operationFamilyId !== PATH1_P1_03_MULTIPLICATIVE_MODELING_OPERATION_FAMILY_ID) {
    errors.push("OPERATION_FAMILY_MISMATCH");
  }
  if (entry?.sourceNodeId !== "g4a_u02_4a02") errors.push("SOURCE_NODE_MISMATCH");
  if (entry?.knowledgePointId !== PATH1_P1_03_MULTIPLICATIVE_MODELING_ARITHMETIC_KP_ID) {
    errors.push("ARITHMETIC_KP_MISMATCH");
  }

  if (metadata.path1BlockId !== "P1-03") errors.push("PATH1_BLOCK_MISMATCH");
  if (metadata.practiceMode !== PATH1_P1_03_MULTIPLICATIVE_MODELING_PRACTICE_MODE) {
    errors.push("PRACTICE_MODE_MISMATCH");
  }
  if (metadata.arithmeticKnowledgePointId !== PATH1_P1_03_MULTIPLICATIVE_MODELING_ARITHMETIC_KP_ID) {
    errors.push("ARITHMETIC_AUTHORITY_MISMATCH");
  }
  if (metadata.relationKnowledgePointId !== PATH1_P1_03_MULTIPLICATIVE_MODELING_RELATION_KP_ID) {
    errors.push("RELATION_KP_MISMATCH");
  }
  if (metadata.relationId !== PATH1_P1_03_MULTIPLICATIVE_MODELING_RELATION_ID) {
    errors.push("RELATION_ID_MISMATCH");
  }
  if (metadata.canonicalInvariant !== PATH1_P1_03_MULTIPLICATIVE_MODELING_INVARIANT) {
    errors.push("RELATION_INVARIANT_MISMATCH");
  }
  if (metadata.languageDifficulty !== PATH1_P1_03_MULTIPLICATIVE_MODELING_LANGUAGE_DIFFICULTY) {
    errors.push("LANGUAGE_DIFFICULTY_SCOPE_LEAK");
  }
  if (metadata.unknownRole !== "totalAmount" || metadata.answerRole !== "totalAmount") {
    errors.push("UNKNOWN_ROLE_SCOPE_LEAK");
  }
  if (metadata.singleRelationOnly !== true) errors.push("MULTI_RELATION_SCOPE_LEAK");
  if (metadata.unitConversionUsed !== false) errors.push("UNIT_CONVERSION_SCOPE_LEAK");
  if (metadata.applicationPromptUsed !== true || metadata.relationPromptUsed !== true) {
    errors.push("MODELING_METADATA_MISSING");
  }
  if (metadata.masteryCredit !== PATH1_P1_03_MULTIPLICATIVE_MODELING_MASTERY_CREDIT) {
    errors.push("MASTERY_SCOPE_LEAK");
  }

  if (!Number.isInteger(amountPerGroup) || amountPerGroup < 10 || amountPerGroup > 99) {
    errors.push("AMOUNT_PER_GROUP_OUT_OF_SCOPE");
  }
  if (!Number.isInteger(groupCount) || groupCount < 10 || groupCount > 99) {
    errors.push("GROUP_COUNT_OUT_OF_SCOPE");
  }
  const expectedTotalAmount = amountPerGroup * groupCount;
  if (!Number.isInteger(totalAmount) || totalAmount !== expectedTotalAmount) {
    errors.push("TOTAL_AMOUNT_INVARIANT_FAILED");
  }
  if (Number.isInteger(totalAmount) && (totalAmount < 100 || totalAmount > 9801)) {
    errors.push("TOTAL_AMOUNT_OUT_OF_SCOPE");
  }
  if (Number(metadata.leftFactor) !== amountPerGroup) errors.push("LEFT_FACTOR_ROLE_MISMATCH");
  if (Number(metadata.rightFactor) !== groupCount) errors.push("RIGHT_FACTOR_ROLE_MISMATCH");
  if (Number(metadata.product) !== totalAmount) errors.push("PRODUCT_ROLE_MISMATCH");

  const roleBinding = metadata.semanticRoleBinding ?? {};
  if (
    roleBinding.leftFactor !== "amountPerGroup"
    || roleBinding.rightFactor !== "groupCount"
    || roleBinding.product !== "totalAmount"
  ) {
    errors.push("SEMANTIC_ROLE_BINDING_MISMATCH");
  }
  if (metadata.semanticCommutativeRoleSwapAllowed !== false) {
    errors.push("SEMANTIC_ROLE_SWAP_SCOPE_LEAK");
  }

  if (contextEntry) {
    if (metadata.perGroupUnit !== contextEntry.perGroupUnit) errors.push("PER_GROUP_UNIT_MISMATCH");
    if (metadata.groupUnit !== contextEntry.groupUnit) errors.push("GROUP_UNIT_MISMATCH");
    if (metadata.answerUnit !== contextEntry.answerUnit) errors.push("ANSWER_UNIT_MISMATCH");
    const expectedPrompt = renderPath1P103MultiplicativeModelingPrompt({
      patternSpecId,
      contextVariantId,
      amountPerGroup,
      groupCount,
    });
    if (entry?.prompt !== expectedPrompt) errors.push("PROMPT_RECONSTRUCTION_FAILED");
    if (entry?.answerText !== `${totalAmount}${contextEntry.answerUnit}`) {
      errors.push("ANSWER_TEXT_MISMATCH");
    }
  }

  if (metadata.equation !== `${amountPerGroup} * ${groupCount} = ${totalAmount}`) {
    errors.push("EQUATION_MISMATCH");
  }

  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors) });
}
