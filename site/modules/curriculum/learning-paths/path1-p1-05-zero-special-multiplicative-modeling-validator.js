import {
  PATH1_P1_05_MULTIPLICATIVE_MODELING_ARITHMETIC_KP_ID,
  PATH1_P1_05_MULTIPLICATIVE_MODELING_ARITHMETIC_OPERATION_MODEL_ID,
  PATH1_P1_05_MULTIPLICATIVE_MODELING_ARITHMETIC_PATTERN_SPEC_ID,
  PATH1_P1_05_MULTIPLICATIVE_MODELING_INVARIANT,
  PATH1_P1_05_MULTIPLICATIVE_MODELING_LANGUAGE_DIFFICULTY,
  PATH1_P1_05_MULTIPLICATIVE_MODELING_MASTERY_CREDIT,
  PATH1_P1_05_MULTIPLICATIVE_MODELING_OPERATION_FAMILY_ID,
  PATH1_P1_05_MULTIPLICATIVE_MODELING_PRACTICE_MODE,
  PATH1_P1_05_MULTIPLICATIVE_MODELING_RELATION_ID,
  PATH1_P1_05_MULTIPLICATIVE_MODELING_RELATION_KP_ID,
  getPath1P105MultiplicativeModelingContext,
  getPath1P105MultiplicativeModelingPatternSpec,
  isPath1P105ZeroMiddleAmountPerGroup,
  renderPath1P105MultiplicativeModelingPrompt,
} from "./path1-p1-05-zero-special-multiplicative-modeling-patterns.js";

function issue(code, details = {}) {
  return Object.freeze({ code, ...details });
}

export function validatePath1P105MultiplicativeModelingItem(entry) {
  const errors = [];
  const metadata = entry?.metadata ?? {};
  const patternSpecId = entry?.patternSpecId ?? metadata.patternSpecId;
  const contextVariantId = entry?.contextVariantId ?? metadata.contextVariantId;
  const patternSpec = getPath1P105MultiplicativeModelingPatternSpec(patternSpecId);
  const contextEntry = getPath1P105MultiplicativeModelingContext(patternSpecId, contextVariantId);

  const amountPerGroup = Number(entry?.amountPerGroup);
  const groupCount = Number(entry?.groupCount);
  const totalAmount = Number(entry?.totalAmount);

  if (!patternSpec) errors.push(issue("PATH1_P105_MODELING_UNAPPROVED_PATTERN_SPEC", { patternSpecId }));
  if (!contextEntry) errors.push(issue("PATH1_P105_MODELING_UNAPPROVED_CONTEXT_VARIANT", { contextVariantId }));
  if (entry?.mode !== "application") errors.push(issue("PATH1_P105_MODELING_QUESTION_MODE_SCOPE_LEAK"));
  if (entry?.operationFamilyId !== PATH1_P1_05_MULTIPLICATIVE_MODELING_OPERATION_FAMILY_ID) {
    errors.push(issue("PATH1_P105_MODELING_OPERATION_FAMILY_MISMATCH"));
  }
  if (entry?.sourceNodeId !== "g3a_u03_3a03") errors.push(issue("PATH1_P105_MODELING_SOURCE_NODE_MISMATCH"));
  if (entry?.path1BlockId !== "P1-05" || metadata.path1BlockId !== "P1-05") {
    errors.push(issue("PATH1_P105_MODELING_PATH1_BLOCK_MISMATCH"));
  }
  if (metadata.practiceMode !== PATH1_P1_05_MULTIPLICATIVE_MODELING_PRACTICE_MODE) {
    errors.push(issue("PATH1_P105_MODELING_PRACTICE_MODE_MISMATCH"));
  }
  if (metadata.patternSpecId !== patternSpecId || metadata.contextVariantId !== contextVariantId) {
    errors.push(issue("PATH1_P105_MODELING_PATTERN_CONTEXT_METADATA_MISMATCH"));
  }

  for (const value of [entry?.knowledgePointId, entry?.arithmeticKnowledgePointId, metadata.arithmeticKnowledgePointId]) {
    if (value !== PATH1_P1_05_MULTIPLICATIVE_MODELING_ARITHMETIC_KP_ID) {
      errors.push(issue("PATH1_P105_MODELING_ARITHMETIC_KP_MISMATCH", { value }));
      break;
    }
  }
  if (entry?.arithmeticOperationModelId !== PATH1_P1_05_MULTIPLICATIVE_MODELING_ARITHMETIC_OPERATION_MODEL_ID
      || metadata.arithmeticOperationModelId !== PATH1_P1_05_MULTIPLICATIVE_MODELING_ARITHMETIC_OPERATION_MODEL_ID) {
    errors.push(issue("PATH1_P105_MODELING_OPERATION_MODEL_MISMATCH"));
  }
  if (entry?.arithmeticPatternSpecId !== PATH1_P1_05_MULTIPLICATIVE_MODELING_ARITHMETIC_PATTERN_SPEC_ID
      || metadata.arithmeticPatternSpecId !== PATH1_P1_05_MULTIPLICATIVE_MODELING_ARITHMETIC_PATTERN_SPEC_ID) {
    errors.push(issue("PATH1_P105_MODELING_ARITHMETIC_PATTERN_MISMATCH"));
  }

  if (entry?.relationKnowledgePointId !== PATH1_P1_05_MULTIPLICATIVE_MODELING_RELATION_KP_ID
      || metadata.relationKnowledgePointId !== PATH1_P1_05_MULTIPLICATIVE_MODELING_RELATION_KP_ID) {
    errors.push(issue("PATH1_P105_MODELING_RELATION_KP_MISMATCH"));
  }
  if (entry?.relationId !== PATH1_P1_05_MULTIPLICATIVE_MODELING_RELATION_ID
      || metadata.relationId !== PATH1_P1_05_MULTIPLICATIVE_MODELING_RELATION_ID) {
    errors.push(issue("PATH1_P105_MODELING_RELATION_ID_MISMATCH"));
  }
  if (metadata.canonicalInvariant !== PATH1_P1_05_MULTIPLICATIVE_MODELING_INVARIANT) {
    errors.push(issue("PATH1_P105_MODELING_RELATION_INVARIANT_MISMATCH"));
  }
  if (metadata.languageDifficulty !== PATH1_P1_05_MULTIPLICATIVE_MODELING_LANGUAGE_DIFFICULTY) {
    errors.push(issue("PATH1_P105_MODELING_LANGUAGE_DIFFICULTY_SCOPE_LEAK"));
  }
  if (entry?.unknownRole !== "totalAmount" || metadata.unknownRole !== "totalAmount" || metadata.answerRole !== "totalAmount") {
    errors.push(issue("PATH1_P105_MODELING_UNKNOWN_ROLE_SCOPE_LEAK"));
  }

  if (!isPath1P105ZeroMiddleAmountPerGroup(amountPerGroup)) {
    errors.push(issue("PATH1_P105_MODELING_ZERO_MIDDLE_BOUNDARY_FAILED", { amountPerGroup }));
  }
  if (!Number.isInteger(groupCount) || groupCount < 2 || groupCount > 9) {
    errors.push(issue("PATH1_P105_MODELING_GROUP_COUNT_OUT_OF_SCOPE", { groupCount }));
  }
  const expectedTotalAmount = amountPerGroup * groupCount;
  if (!Number.isInteger(totalAmount) || totalAmount !== expectedTotalAmount) {
    errors.push(issue("PATH1_P105_MODELING_TOTAL_AMOUNT_INVARIANT_FAILED", { totalAmount, expectedTotalAmount }));
  }
  if (Number.isInteger(totalAmount) && (totalAmount < 202 || totalAmount > 8181)) {
    errors.push(issue("PATH1_P105_MODELING_TOTAL_AMOUNT_OUT_OF_SCOPE", { totalAmount }));
  }

  if (Number(entry?.leftFactor) !== amountPerGroup || Number(metadata.leftFactor) !== amountPerGroup) {
    errors.push(issue("PATH1_P105_MODELING_LEFT_FACTOR_ROLE_MISMATCH"));
  }
  if (Number(entry?.rightFactor) !== groupCount || Number(metadata.rightFactor) !== groupCount) {
    errors.push(issue("PATH1_P105_MODELING_RIGHT_FACTOR_ROLE_MISMATCH"));
  }
  if (Number(entry?.product) !== totalAmount || Number(metadata.product) !== totalAmount) {
    errors.push(issue("PATH1_P105_MODELING_PRODUCT_ROLE_MISMATCH"));
  }
  if (Number(metadata.amountPerGroup) !== amountPerGroup
      || Number(metadata.groupCount) !== groupCount
      || Number(metadata.totalAmount) !== totalAmount) {
    errors.push(issue("PATH1_P105_MODELING_QUANTITY_METADATA_MISMATCH"));
  }

  const expectedRoleBinding = { leftFactor: "amountPerGroup", rightFactor: "groupCount", product: "totalAmount" };
  for (const binding of [entry?.semanticRoleBinding ?? {}, metadata.semanticRoleBinding ?? {}]) {
    if (binding.leftFactor !== expectedRoleBinding.leftFactor
        || binding.rightFactor !== expectedRoleBinding.rightFactor
        || binding.product !== expectedRoleBinding.product) {
      errors.push(issue("PATH1_P105_MODELING_SEMANTIC_ROLE_BINDING_MISMATCH"));
      break;
    }
  }

  if (metadata.semanticCommutativeRoleSwapAllowed !== false) errors.push(issue("PATH1_P105_MODELING_SEMANTIC_ROLE_SWAP_SCOPE_LEAK"));
  if (metadata.keywordToOperationSelectionAllowed !== false) errors.push(issue("PATH1_P105_MODELING_KEYWORD_OPERATION_SCOPE_LEAK"));
  if (metadata.singleRelationOnly !== true) errors.push(issue("PATH1_P105_MODELING_MULTI_RELATION_SCOPE_LEAK"));
  if (metadata.unitConversionUsed !== false) errors.push(issue("PATH1_P105_MODELING_UNIT_CONVERSION_SCOPE_LEAK"));
  if (metadata.applicationPromptUsed !== true || metadata.relationPromptUsed !== true) errors.push(issue("PATH1_P105_MODELING_METADATA_MISSING"));
  if (metadata.zeroMiddleArithmeticBoundaryPreserved !== true) errors.push(issue("PATH1_P105_MODELING_ZERO_BOUNDARY_METADATA_MISSING"));
  if (metadata.canonicalKnowledgePointMinted !== false) errors.push(issue("PATH1_P105_MODELING_CANONICAL_KP_SCOPE_LEAK"));
  if (metadata.g4bU01ModelingExpanded !== false) errors.push(issue("PATH1_P105_MODELING_G4BU01_SCOPE_LEAK"));
  if (metadata.masteryCredit !== PATH1_P1_05_MULTIPLICATIVE_MODELING_MASTERY_CREDIT) errors.push(issue("PATH1_P105_MODELING_MASTERY_SCOPE_LEAK"));
  if (metadata.publicCutoverApplied !== false) errors.push(issue("PATH1_P105_MODELING_PUBLIC_CUTOVER_SCOPE_LEAK"));

  if (patternSpec) {
    if (patternSpec.relationId !== PATH1_P1_05_MULTIPLICATIVE_MODELING_RELATION_ID) errors.push(issue("PATH1_P105_MODELING_PATTERN_RELATION_MISMATCH"));
    if (patternSpec.unknownRole !== "totalAmount") errors.push(issue("PATH1_P105_MODELING_PATTERN_UNKNOWN_ROLE_MISMATCH"));
    if (patternSpec.sourceSurfaceLineageOnly !== true) errors.push(issue("PATH1_P105_MODELING_PARENT_LINEAGE_MISSING"));
    if (patternSpec.sourceParentNumericAuthorityReused !== false) errors.push(issue("PATH1_P105_MODELING_PARENT_NUMERIC_AUTHORITY_SCOPE_LEAK"));
  }

  const expectedEquationModel = `${amountPerGroup} × ${groupCount} = ${totalAmount}`;
  if (entry?.equationModel !== expectedEquationModel) errors.push(issue("PATH1_P105_MODELING_EQUATION_ROLE_MISMATCH"));
  if (metadata.equation !== `${amountPerGroup} * ${groupCount} = ${totalAmount}`) errors.push(issue("PATH1_P105_MODELING_EQUATION_METADATA_MISMATCH"));
  if (Number(entry?.finalAnswer) !== totalAmount) errors.push(issue("PATH1_P105_MODELING_FINAL_ANSWER_MISMATCH"));

  if (contextEntry) {
    if (metadata.perGroupUnit !== contextEntry.perGroupUnit) errors.push(issue("PATH1_P105_MODELING_PER_GROUP_UNIT_MISMATCH"));
    if (metadata.groupUnit !== contextEntry.groupUnit) errors.push(issue("PATH1_P105_MODELING_GROUP_UNIT_MISMATCH"));
    if (metadata.answerUnit !== contextEntry.answerUnit || entry?.finalAnswerUnit !== contextEntry.answerUnit) {
      errors.push(issue("PATH1_P105_MODELING_ANSWER_UNIT_MISMATCH"));
    }
    const expectedPrompt = renderPath1P105MultiplicativeModelingPrompt({
      patternSpecId,
      contextVariantId,
      amountPerGroup,
      groupCount,
    });
    if (entry?.prompt !== expectedPrompt) errors.push(issue("PATH1_P105_MODELING_PROMPT_RECONSTRUCTION_FAILED"));
    const expectedAnswerText = `${expectedEquationModel}；答：${totalAmount}${contextEntry.answerUnit}`;
    if (entry?.answerText !== expectedAnswerText) errors.push(issue("PATH1_P105_MODELING_ANSWER_TEXT_MISMATCH"));
  }

  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors) });
}

export function validatePath1P105MultiplicativeModelingItems(items) {
  if (!Array.isArray(items)) {
    return Object.freeze({ ok: false, errors: Object.freeze([issue("PATH1_P105_MODELING_ITEMS_ARRAY_REQUIRED")]) });
  }
  const errors = items.flatMap((entry, index) => {
    const validation = validatePath1P105MultiplicativeModelingItem(entry);
    return validation.errors.map((error) => issue(error.code, { ...error, index }));
  });
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors) });
}
