import {
  PATH1_P1_04_MULTIPLICATIVE_MODELING_INVARIANT,
  PATH1_P1_04_MULTIPLICATIVE_MODELING_LANGUAGE_DIFFICULTY,
  PATH1_P1_04_MULTIPLICATIVE_MODELING_MASTERY_CREDIT,
  PATH1_P1_04_MULTIPLICATIVE_MODELING_OPERATION_FAMILY_ID,
  PATH1_P1_04_MULTIPLICATIVE_MODELING_PRACTICE_MODE,
  PATH1_P1_04_MULTIPLICATIVE_MODELING_RELATION_ID,
  PATH1_P1_04_MULTIPLICATIVE_MODELING_RELATION_KP_ID,
  getPath1P104MultiplicativeModelingArithmeticForm,
  getPath1P104MultiplicativeModelingContext,
  getPath1P104MultiplicativeModelingPatternSpec,
  renderPath1P104MultiplicativeModelingPrompt,
} from "./path1-p1-04-multiplicative-modeling-patterns.js";

function issue(code, details = {}) {
  return Object.freeze({ code, ...details });
}

export function validatePath1P104MultiplicativeModelingItem(entry) {
  const errors = [];
  const metadata = entry?.metadata ?? {};
  const patternSpecId = entry?.patternSpecId ?? metadata.patternSpecId;
  const contextVariantId = entry?.contextVariantId ?? metadata.contextVariantId;
  const arithmeticFormId = entry?.arithmeticFormId ?? metadata.arithmeticFormId;
  const patternSpec = getPath1P104MultiplicativeModelingPatternSpec(patternSpecId);
  const contextEntry = getPath1P104MultiplicativeModelingContext(patternSpecId, contextVariantId);
  const form = getPath1P104MultiplicativeModelingArithmeticForm(arithmeticFormId);

  const amountPerGroup = Number(entry?.amountPerGroup);
  const groupCount = Number(entry?.groupCount);
  const totalAmount = Number(entry?.totalAmount);

  if (!patternSpec) errors.push(issue("PATH1_P104_MODELING_UNAPPROVED_PATTERN_SPEC", { patternSpecId }));
  if (!contextEntry) errors.push(issue("PATH1_P104_MODELING_UNAPPROVED_CONTEXT_VARIANT", { contextVariantId }));
  if (!form) errors.push(issue("PATH1_P104_MODELING_UNAPPROVED_ARITHMETIC_FORM", { arithmeticFormId }));
  if (patternSpec && form && !patternSpec.allowedArithmeticFormIds.includes(form.formId)) {
    errors.push(issue("PATH1_P104_MODELING_PATTERN_FORM_NOT_ALLOWED", { patternSpecId, arithmeticFormId }));
  }

  if (entry?.mode !== "application") errors.push(issue("PATH1_P104_MODELING_QUESTION_MODE_SCOPE_LEAK"));
  if (entry?.operationFamilyId !== PATH1_P1_04_MULTIPLICATIVE_MODELING_OPERATION_FAMILY_ID) {
    errors.push(issue("PATH1_P104_MODELING_OPERATION_FAMILY_MISMATCH"));
  }
  if (entry?.sourceNodeId !== "g4a_u02_4a02") errors.push(issue("PATH1_P104_MODELING_SOURCE_NODE_MISMATCH"));
  if (entry?.path1BlockId !== "P1-04" || metadata.path1BlockId !== "P1-04") {
    errors.push(issue("PATH1_P104_MODELING_PATH1_BLOCK_MISMATCH"));
  }
  if (metadata.practiceMode !== PATH1_P1_04_MULTIPLICATIVE_MODELING_PRACTICE_MODE) {
    errors.push(issue("PATH1_P104_MODELING_PRACTICE_MODE_MISMATCH"));
  }
  if (metadata.patternSpecId !== patternSpecId || metadata.contextVariantId !== contextVariantId) {
    errors.push(issue("PATH1_P104_MODELING_PATTERN_CONTEXT_METADATA_MISMATCH"));
  }
  if (metadata.arithmeticFormId !== arithmeticFormId) {
    errors.push(issue("PATH1_P104_MODELING_ARITHMETIC_FORM_METADATA_MISMATCH"));
  }

  if (form) {
    if (entry?.knowledgePointId !== form.arithmeticKnowledgePointId) {
      errors.push(issue("PATH1_P104_MODELING_ARITHMETIC_KP_MISMATCH"));
    }
    if (entry?.arithmeticKnowledgePointId !== form.arithmeticKnowledgePointId || metadata.arithmeticKnowledgePointId !== form.arithmeticKnowledgePointId) {
      errors.push(issue("PATH1_P104_MODELING_ARITHMETIC_AUTHORITY_MISMATCH"));
    }
    if (entry?.arithmeticOperationModelId !== form.arithmeticOperationModelId || metadata.arithmeticOperationModelId !== form.arithmeticOperationModelId) {
      errors.push(issue("PATH1_P104_MODELING_OPERATION_MODEL_MISMATCH"));
    }
    if (entry?.arithmeticPatternSpecId !== form.arithmeticPatternSpecId || metadata.arithmeticPatternSpecId !== form.arithmeticPatternSpecId) {
      errors.push(issue("PATH1_P104_MODELING_ARITHMETIC_PATTERN_MISMATCH"));
    }
  }

  if (entry?.relationKnowledgePointId !== PATH1_P1_04_MULTIPLICATIVE_MODELING_RELATION_KP_ID || metadata.relationKnowledgePointId !== PATH1_P1_04_MULTIPLICATIVE_MODELING_RELATION_KP_ID) {
    errors.push(issue("PATH1_P104_MODELING_RELATION_KP_MISMATCH"));
  }
  if (entry?.relationId !== PATH1_P1_04_MULTIPLICATIVE_MODELING_RELATION_ID || metadata.relationId !== PATH1_P1_04_MULTIPLICATIVE_MODELING_RELATION_ID) {
    errors.push(issue("PATH1_P104_MODELING_RELATION_ID_MISMATCH"));
  }
  if (metadata.canonicalInvariant !== PATH1_P1_04_MULTIPLICATIVE_MODELING_INVARIANT) {
    errors.push(issue("PATH1_P104_MODELING_RELATION_INVARIANT_MISMATCH"));
  }
  if (metadata.languageDifficulty !== PATH1_P1_04_MULTIPLICATIVE_MODELING_LANGUAGE_DIFFICULTY) {
    errors.push(issue("PATH1_P104_MODELING_LANGUAGE_DIFFICULTY_SCOPE_LEAK"));
  }
  if (entry?.unknownRole !== "totalAmount" || metadata.unknownRole !== "totalAmount" || metadata.answerRole !== "totalAmount") {
    errors.push(issue("PATH1_P104_MODELING_UNKNOWN_ROLE_SCOPE_LEAK"));
  }
  if (metadata.singleRelationOnly !== true) errors.push(issue("PATH1_P104_MODELING_MULTI_RELATION_SCOPE_LEAK"));
  if (metadata.unitConversionUsed !== false) errors.push(issue("PATH1_P104_MODELING_UNIT_CONVERSION_SCOPE_LEAK"));
  if (metadata.keywordToOperationSelectionAllowed !== false) errors.push(issue("PATH1_P104_MODELING_KEYWORD_OPERATION_SCOPE_LEAK"));
  if (metadata.applicationPromptUsed !== true || metadata.relationPromptUsed !== true) errors.push(issue("PATH1_P104_MODELING_METADATA_MISSING"));
  if (metadata.canonicalKnowledgePointMinted !== false) errors.push(issue("PATH1_P104_MODELING_CANONICAL_KP_SCOPE_LEAK"));
  if (metadata.g4bU01ModelingExpanded !== false) errors.push(issue("PATH1_P104_MODELING_G4BU01_SCOPE_LEAK"));
  if (metadata.p105ZeroSpecialCapabilityUsed !== false) errors.push(issue("PATH1_P104_MODELING_P105_SCOPE_LEAK"));
  if (metadata.masteryCredit !== PATH1_P1_04_MULTIPLICATIVE_MODELING_MASTERY_CREDIT) errors.push(issue("PATH1_P104_MODELING_MASTERY_SCOPE_LEAK"));
  if (metadata.publicCutoverApplied !== false) errors.push(issue("PATH1_P104_MODELING_PUBLIC_CUTOVER_SCOPE_LEAK"));

  if (form) {
    if (!Number.isInteger(amountPerGroup) || amountPerGroup < form.amountPerGroupMin || amountPerGroup > form.amountPerGroupMax) {
      errors.push(issue("PATH1_P104_MODELING_AMOUNT_PER_GROUP_OUT_OF_SCOPE", { arithmeticFormId, amountPerGroup }));
    }
    if (!Number.isInteger(groupCount) || groupCount < form.groupCountMin || groupCount > form.groupCountMax) {
      errors.push(issue("PATH1_P104_MODELING_GROUP_COUNT_OUT_OF_SCOPE", { arithmeticFormId, groupCount }));
    }
  }
  const expectedTotalAmount = amountPerGroup * groupCount;
  if (!Number.isInteger(totalAmount) || totalAmount !== expectedTotalAmount) {
    errors.push(issue("PATH1_P104_MODELING_TOTAL_AMOUNT_INVARIANT_FAILED", { totalAmount, expectedTotalAmount }));
  }
  if (form && Number.isInteger(totalAmount) && (totalAmount < form.totalAmountMin || totalAmount > form.totalAmountMax)) {
    errors.push(issue("PATH1_P104_MODELING_TOTAL_AMOUNT_OUT_OF_SCOPE", { arithmeticFormId, totalAmount }));
  }
  if (Number(entry?.leftFactor) !== amountPerGroup || Number(metadata.leftFactor) !== amountPerGroup) {
    errors.push(issue("PATH1_P104_MODELING_LEFT_FACTOR_ROLE_MISMATCH"));
  }
  if (Number(entry?.rightFactor) !== groupCount || Number(metadata.rightFactor) !== groupCount) {
    errors.push(issue("PATH1_P104_MODELING_RIGHT_FACTOR_ROLE_MISMATCH"));
  }
  if (Number(entry?.product) !== totalAmount || Number(metadata.product) !== totalAmount) {
    errors.push(issue("PATH1_P104_MODELING_PRODUCT_ROLE_MISMATCH"));
  }
  if (Number(metadata.amountPerGroup) !== amountPerGroup || Number(metadata.groupCount) !== groupCount || Number(metadata.totalAmount) !== totalAmount) {
    errors.push(issue("PATH1_P104_MODELING_QUANTITY_METADATA_MISMATCH"));
  }

  const expectedRoleBinding = { leftFactor: "amountPerGroup", rightFactor: "groupCount", product: "totalAmount" };
  for (const binding of [entry?.semanticRoleBinding ?? {}, metadata.semanticRoleBinding ?? {}]) {
    if (binding.leftFactor !== expectedRoleBinding.leftFactor || binding.rightFactor !== expectedRoleBinding.rightFactor || binding.product !== expectedRoleBinding.product) {
      errors.push(issue("PATH1_P104_MODELING_SEMANTIC_ROLE_BINDING_MISMATCH"));
      break;
    }
  }
  if (metadata.semanticCommutativeRoleSwapAllowed !== false) errors.push(issue("PATH1_P104_MODELING_SEMANTIC_ROLE_SWAP_SCOPE_LEAK"));

  if (patternSpec) {
    if (patternSpec.relationId !== PATH1_P1_04_MULTIPLICATIVE_MODELING_RELATION_ID) errors.push(issue("PATH1_P104_MODELING_PATTERN_RELATION_MISMATCH"));
    if (patternSpec.unknownRole !== "totalAmount") errors.push(issue("PATH1_P104_MODELING_PATTERN_UNKNOWN_ROLE_MISMATCH"));
    if (patternSpec.sourceParentNumericAuthorityReused !== false) errors.push(issue("PATH1_P104_MODELING_PARENT_NUMERIC_AUTHORITY_SCOPE_LEAK"));
  }

  const expectedEquationModel = `${amountPerGroup} × ${groupCount} = ${totalAmount}`;
  if (entry?.equationModel !== expectedEquationModel) errors.push(issue("PATH1_P104_MODELING_EQUATION_ROLE_MISMATCH"));
  if (metadata.equation !== `${amountPerGroup} * ${groupCount} = ${totalAmount}`) errors.push(issue("PATH1_P104_MODELING_EQUATION_METADATA_MISMATCH"));
  if (Number(entry?.finalAnswer) !== totalAmount) errors.push(issue("PATH1_P104_MODELING_FINAL_ANSWER_MISMATCH"));

  if (contextEntry) {
    if (metadata.perGroupUnit !== contextEntry.perGroupUnit) errors.push(issue("PATH1_P104_MODELING_PER_GROUP_UNIT_MISMATCH"));
    if (metadata.groupUnit !== contextEntry.groupUnit) errors.push(issue("PATH1_P104_MODELING_GROUP_UNIT_MISMATCH"));
    if (metadata.answerUnit !== contextEntry.answerUnit || entry?.finalAnswerUnit !== contextEntry.answerUnit) errors.push(issue("PATH1_P104_MODELING_ANSWER_UNIT_MISMATCH"));
    const expectedPrompt = renderPath1P104MultiplicativeModelingPrompt({ patternSpecId, contextVariantId, amountPerGroup, groupCount });
    if (entry?.prompt !== expectedPrompt) errors.push(issue("PATH1_P104_MODELING_PROMPT_RECONSTRUCTION_FAILED"));
    const expectedAnswerText = `${expectedEquationModel}；答：${totalAmount}${contextEntry.answerUnit}`;
    if (entry?.answerText !== expectedAnswerText) errors.push(issue("PATH1_P104_MODELING_ANSWER_TEXT_MISMATCH"));
  }

  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors) });
}

export function validatePath1P104MultiplicativeModelingItems(items) {
  if (!Array.isArray(items)) {
    return Object.freeze({ ok: false, errors: Object.freeze([issue("PATH1_P104_MODELING_ITEMS_ARRAY_REQUIRED")]) });
  }
  const errors = items.flatMap((entry, index) => {
    const validation = validatePath1P104MultiplicativeModelingItem(entry);
    return validation.errors.map((error) => issue(error.code, { ...error, index }));
  });
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors) });
}
