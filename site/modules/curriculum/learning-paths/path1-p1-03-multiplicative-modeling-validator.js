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

function issue(code, details = {}) {
  return Object.freeze({ code, ...details });
}

export function validatePath1P103MultiplicativeModelingItem(entry) {
  const errors = [];
  const metadata = entry?.metadata ?? {};
  const patternSpecId = entry?.patternSpecId ?? metadata.patternSpecId;
  const contextVariantId = entry?.contextVariantId ?? metadata.contextVariantId;
  const patternSpec = getPath1P103MultiplicativeModelingPatternSpec(patternSpecId);
  const contextEntry = getPath1P103MultiplicativeModelingContext(patternSpecId, contextVariantId);

  const amountPerGroup = Number(entry?.amountPerGroup);
  const groupCount = Number(entry?.groupCount);
  const totalAmount = Number(entry?.totalAmount);

  if (!patternSpec) errors.push(issue("PATH1_P103_MODELING_UNAPPROVED_PATTERN_SPEC", { patternSpecId }));
  if (!contextEntry) errors.push(issue("PATH1_P103_MODELING_UNAPPROVED_CONTEXT_VARIANT", { contextVariantId }));
  if (entry?.mode !== "application") errors.push(issue("PATH1_P103_MODELING_QUESTION_MODE_SCOPE_LEAK"));
  if (entry?.operationFamilyId !== PATH1_P1_03_MULTIPLICATIVE_MODELING_OPERATION_FAMILY_ID) {
    errors.push(issue("PATH1_P103_MODELING_OPERATION_FAMILY_MISMATCH"));
  }
  if (entry?.sourceNodeId !== "g4a_u02_4a02") errors.push(issue("PATH1_P103_MODELING_SOURCE_NODE_MISMATCH"));
  if (entry?.knowledgePointId !== PATH1_P1_03_MULTIPLICATIVE_MODELING_ARITHMETIC_KP_ID) {
    errors.push(issue("PATH1_P103_MODELING_ARITHMETIC_KP_MISMATCH"));
  }
  if (entry?.path1BlockId !== "P1-03" || metadata.path1BlockId !== "P1-03") {
    errors.push(issue("PATH1_P103_MODELING_PATH1_BLOCK_MISMATCH"));
  }
  if (entry?.arithmeticKnowledgePointId !== PATH1_P1_03_MULTIPLICATIVE_MODELING_ARITHMETIC_KP_ID) {
    errors.push(issue("PATH1_P103_MODELING_ARITHMETIC_AUTHORITY_MISMATCH"));
  }
  if (entry?.relationKnowledgePointId !== PATH1_P1_03_MULTIPLICATIVE_MODELING_RELATION_KP_ID) {
    errors.push(issue("PATH1_P103_MODELING_RELATION_KP_MISMATCH"));
  }
  if (entry?.relationId !== PATH1_P1_03_MULTIPLICATIVE_MODELING_RELATION_ID) {
    errors.push(issue("PATH1_P103_MODELING_RELATION_ID_MISMATCH"));
  }
  if (metadata.practiceMode !== PATH1_P1_03_MULTIPLICATIVE_MODELING_PRACTICE_MODE) {
    errors.push(issue("PATH1_P103_MODELING_PRACTICE_MODE_MISMATCH"));
  }
  if (metadata.patternSpecId !== patternSpecId || metadata.contextVariantId !== contextVariantId) {
    errors.push(issue("PATH1_P103_MODELING_PATTERN_CONTEXT_METADATA_MISMATCH"));
  }
  if (metadata.arithmeticKnowledgePointId !== PATH1_P1_03_MULTIPLICATIVE_MODELING_ARITHMETIC_KP_ID) {
    errors.push(issue("PATH1_P103_MODELING_ARITHMETIC_METADATA_MISMATCH"));
  }
  if (metadata.relationKnowledgePointId !== PATH1_P1_03_MULTIPLICATIVE_MODELING_RELATION_KP_ID) {
    errors.push(issue("PATH1_P103_MODELING_RELATION_METADATA_MISMATCH"));
  }
  if (metadata.relationId !== PATH1_P1_03_MULTIPLICATIVE_MODELING_RELATION_ID) {
    errors.push(issue("PATH1_P103_MODELING_RELATION_ID_METADATA_MISMATCH"));
  }
  if (metadata.canonicalInvariant !== PATH1_P1_03_MULTIPLICATIVE_MODELING_INVARIANT) {
    errors.push(issue("PATH1_P103_MODELING_RELATION_INVARIANT_MISMATCH"));
  }
  if (metadata.languageDifficulty !== PATH1_P1_03_MULTIPLICATIVE_MODELING_LANGUAGE_DIFFICULTY) {
    errors.push(issue("PATH1_P103_MODELING_LANGUAGE_DIFFICULTY_SCOPE_LEAK"));
  }
  if (
    entry?.unknownRole !== "totalAmount"
    || metadata.unknownRole !== "totalAmount"
    || metadata.answerRole !== "totalAmount"
  ) {
    errors.push(issue("PATH1_P103_MODELING_UNKNOWN_ROLE_SCOPE_LEAK"));
  }
  if (metadata.singleRelationOnly !== true) errors.push(issue("PATH1_P103_MODELING_MULTI_RELATION_SCOPE_LEAK"));
  if (metadata.unitConversionUsed !== false) errors.push(issue("PATH1_P103_MODELING_UNIT_CONVERSION_SCOPE_LEAK"));
  if (metadata.keywordToOperationSelectionAllowed !== false) {
    errors.push(issue("PATH1_P103_MODELING_KEYWORD_OPERATION_SCOPE_LEAK"));
  }
  if (metadata.applicationPromptUsed !== true || metadata.relationPromptUsed !== true) {
    errors.push(issue("PATH1_P103_MODELING_METADATA_MISSING"));
  }
  if (metadata.canonicalKnowledgePointMinted !== false) {
    errors.push(issue("PATH1_P103_MODELING_CANONICAL_KP_SCOPE_LEAK"));
  }
  if (metadata.masteryCredit !== PATH1_P1_03_MULTIPLICATIVE_MODELING_MASTERY_CREDIT) {
    errors.push(issue("PATH1_P103_MODELING_MASTERY_SCOPE_LEAK"));
  }
  if (metadata.publicCutoverApplied !== false) {
    errors.push(issue("PATH1_P103_MODELING_PUBLIC_CUTOVER_SCOPE_LEAK"));
  }

  if (!Number.isInteger(amountPerGroup) || amountPerGroup < 10 || amountPerGroup > 99) {
    errors.push(issue("PATH1_P103_MODELING_AMOUNT_PER_GROUP_OUT_OF_SCOPE", { amountPerGroup }));
  }
  if (!Number.isInteger(groupCount) || groupCount < 10 || groupCount > 99) {
    errors.push(issue("PATH1_P103_MODELING_GROUP_COUNT_OUT_OF_SCOPE", { groupCount }));
  }
  const expectedTotalAmount = amountPerGroup * groupCount;
  if (!Number.isInteger(totalAmount) || totalAmount !== expectedTotalAmount) {
    errors.push(issue("PATH1_P103_MODELING_TOTAL_AMOUNT_INVARIANT_FAILED", { totalAmount, expectedTotalAmount }));
  }
  if (Number.isInteger(totalAmount) && (totalAmount < 100 || totalAmount > 9801)) {
    errors.push(issue("PATH1_P103_MODELING_TOTAL_AMOUNT_OUT_OF_SCOPE", { totalAmount }));
  }
  if (Number(entry?.leftFactor) !== amountPerGroup || Number(metadata.leftFactor) !== amountPerGroup) {
    errors.push(issue("PATH1_P103_MODELING_LEFT_FACTOR_ROLE_MISMATCH"));
  }
  if (Number(entry?.rightFactor) !== groupCount || Number(metadata.rightFactor) !== groupCount) {
    errors.push(issue("PATH1_P103_MODELING_RIGHT_FACTOR_ROLE_MISMATCH"));
  }
  if (Number(entry?.product) !== totalAmount || Number(metadata.product) !== totalAmount) {
    errors.push(issue("PATH1_P103_MODELING_PRODUCT_ROLE_MISMATCH"));
  }
  if (
    Number(metadata.amountPerGroup) !== amountPerGroup
    || Number(metadata.groupCount) !== groupCount
    || Number(metadata.totalAmount) !== totalAmount
  ) {
    errors.push(issue("PATH1_P103_MODELING_QUANTITY_METADATA_MISMATCH"));
  }

  const roleBinding = entry?.semanticRoleBinding ?? {};
  const metadataRoleBinding = metadata.semanticRoleBinding ?? {};
  for (const binding of [roleBinding, metadataRoleBinding]) {
    if (
      binding.leftFactor !== "amountPerGroup"
      || binding.rightFactor !== "groupCount"
      || binding.product !== "totalAmount"
    ) {
      errors.push(issue("PATH1_P103_MODELING_SEMANTIC_ROLE_BINDING_MISMATCH"));
      break;
    }
  }
  if (metadata.semanticCommutativeRoleSwapAllowed !== false) {
    errors.push(issue("PATH1_P103_MODELING_SEMANTIC_ROLE_SWAP_SCOPE_LEAK"));
  }

  if (patternSpec) {
    if (patternSpec.relationId !== PATH1_P1_03_MULTIPLICATIVE_MODELING_RELATION_ID) {
      errors.push(issue("PATH1_P103_MODELING_PATTERN_RELATION_MISMATCH"));
    }
    if (patternSpec.unknownRole !== "totalAmount") {
      errors.push(issue("PATH1_P103_MODELING_PATTERN_UNKNOWN_ROLE_MISMATCH"));
    }
    if (patternSpec.sourceParentNumericAuthorityReused !== false) {
      errors.push(issue("PATH1_P103_MODELING_PARENT_NUMERIC_AUTHORITY_SCOPE_LEAK"));
    }
  }

  const expectedEquationModel = `${amountPerGroup} × ${groupCount} = ${totalAmount}`;
  if (entry?.equationModel !== expectedEquationModel) {
    errors.push(issue("PATH1_P103_MODELING_EQUATION_ROLE_MISMATCH"));
  }
  if (metadata.equation !== `${amountPerGroup} * ${groupCount} = ${totalAmount}`) {
    errors.push(issue("PATH1_P103_MODELING_EQUATION_METADATA_MISMATCH"));
  }
  if (Number(entry?.finalAnswer) !== totalAmount) {
    errors.push(issue("PATH1_P103_MODELING_FINAL_ANSWER_MISMATCH"));
  }

  if (contextEntry) {
    if (metadata.perGroupUnit !== contextEntry.perGroupUnit) {
      errors.push(issue("PATH1_P103_MODELING_PER_GROUP_UNIT_MISMATCH"));
    }
    if (metadata.groupUnit !== contextEntry.groupUnit) {
      errors.push(issue("PATH1_P103_MODELING_GROUP_UNIT_MISMATCH"));
    }
    if (metadata.answerUnit !== contextEntry.answerUnit || entry?.finalAnswerUnit !== contextEntry.answerUnit) {
      errors.push(issue("PATH1_P103_MODELING_ANSWER_UNIT_MISMATCH"));
    }
    const expectedPrompt = renderPath1P103MultiplicativeModelingPrompt({
      patternSpecId,
      contextVariantId,
      amountPerGroup,
      groupCount,
    });
    if (entry?.prompt !== expectedPrompt) errors.push(issue("PATH1_P103_MODELING_PROMPT_RECONSTRUCTION_FAILED"));
    const expectedAnswerText = `${expectedEquationModel}；答：${totalAmount}${contextEntry.answerUnit}`;
    if (entry?.answerText !== expectedAnswerText) errors.push(issue("PATH1_P103_MODELING_ANSWER_TEXT_MISMATCH"));
  }

  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors) });
}

export function validatePath1P103MultiplicativeModelingItems(items) {
  if (!Array.isArray(items)) {
    return Object.freeze({
      ok: false,
      errors: Object.freeze([issue("PATH1_P103_MODELING_ITEMS_ARRAY_REQUIRED")]),
    });
  }
  const errors = items.flatMap((entry, index) => {
    const validation = validatePath1P103MultiplicativeModelingItem(entry);
    return validation.errors.map((error) => issue(error.code, { ...error, index }));
  });
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors) });
}
