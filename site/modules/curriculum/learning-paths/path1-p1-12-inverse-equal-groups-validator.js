import {
  getG3BU08SemanticPatternDefinition,
} from "../batch-a/source-pattern-g3b-u08-semantic-extension.js";
import {
  getG3BU08SemanticContextVariant,
} from "../batch-a/g3b-u08-semantic-context-registry.js";
import {
  isS58FPromotedG3BU08SemanticPatternSpecId,
} from "../registry/g3b-u08-semantic-promotion.js";
import {
  getPath1P112InverseEqualGroupsRoleConfig,
  PATH1_P112_INVERSE_EQUAL_GROUPS_BLOCK_ID,
  PATH1_P112_INVERSE_EQUAL_GROUPS_OPERATION_FAMILY_ID,
  PATH1_P112_INVERSE_EQUAL_GROUPS_PRACTICE_MODE,
  PATH1_P112_INVERSE_EQUAL_GROUPS_SEMANTIC_SOURCE_ID,
  renderPath1P112InverseEqualGroupsAuthorityPrompt,
} from "./path1-p1-12-inverse-equal-groups-generator.js";

function issue(code, path, details = {}) {
  return Object.freeze({ code, path, ...details });
}

function validateIntegers(item, errors) {
  const amountPerGroup = Number(item?.amountPerGroup);
  const groupCount = Number(item?.groupCount);
  const totalAmount = Number(item?.totalAmount);
  if (!Number.isInteger(amountPerGroup) || !Number.isInteger(groupCount) || !Number.isInteger(totalAmount)) {
    errors.push(issue("PATH1_P112_INVERSE_NUMERIC_INPUT_INVALID", "numericRoles"));
    return null;
  }
  if (amountPerGroup < 1 || groupCount < 1 || totalAmount < 1) {
    errors.push(issue("PATH1_P112_INVERSE_NUMERIC_ROLE_NOT_POSITIVE", "numericRoles"));
  }
  if (amountPerGroup * groupCount !== totalAmount) {
    errors.push(issue("PATH1_P112_INVERSE_EQUAL_GROUPS_INVARIANT_FAILED", "totalAmount", {
      expected: amountPerGroup * groupCount,
      actual: totalAmount,
    }));
  }
  return { amountPerGroup, groupCount, totalAmount };
}

function validateRoleEnvelope(item, roleConfig, errors) {
  const values = validateIntegers(item, errors);
  if (!values) return null;
  const { amountPerGroup, groupCount, totalAmount } = values;

  if (roleConfig.unknownRole === "totalAmount") {
    if (groupCount < 1 || groupCount > 9) {
      errors.push(issue("PATH1_P112_INVERSE_TOTAL_GROUP_COUNT_OUT_OF_RANGE", "groupCount", { actual: groupCount }));
    }
    if (totalAmount > 999) {
      errors.push(issue("PATH1_P112_INVERSE_TOTAL_AMOUNT_OUT_OF_RANGE", "totalAmount", { actual: totalAmount }));
    }
    if (item?.finalAnswer !== totalAmount) {
      errors.push(issue("PATH1_P112_INVERSE_FINAL_ANSWER_ROLE_MISMATCH", "finalAnswer", {
        expected: totalAmount,
        actual: item?.finalAnswer,
      }));
    }
    return values;
  }

  if (totalAmount < 10 || totalAmount > 999) {
    errors.push(issue("PATH1_P112_INVERSE_DIVIDEND_OUT_OF_RANGE", "totalAmount", { actual: totalAmount }));
  }

  if (roleConfig.unknownRole === "groupCount") {
    if (amountPerGroup < 1 || amountPerGroup > 9) {
      errors.push(issue("PATH1_P112_INVERSE_QUOTATIVE_DIVISOR_OUT_OF_RANGE", "amountPerGroup", { actual: amountPerGroup }));
    }
    if (totalAmount % amountPerGroup !== 0 || totalAmount / amountPerGroup !== groupCount) {
      errors.push(issue("PATH1_P112_INVERSE_QUOTATIVE_EXACT_DIVISION_FAILED", "groupCount", {
        totalAmount,
        amountPerGroup,
        actual: groupCount,
      }));
    }
    if (item?.finalAnswer !== groupCount) {
      errors.push(issue("PATH1_P112_INVERSE_FINAL_ANSWER_ROLE_MISMATCH", "finalAnswer", {
        expected: groupCount,
        actual: item?.finalAnswer,
      }));
    }
    return values;
  }

  if (roleConfig.unknownRole === "amountPerGroup") {
    if (groupCount < 1 || groupCount > 9) {
      errors.push(issue("PATH1_P112_INVERSE_PARTITIVE_DIVISOR_OUT_OF_RANGE", "groupCount", { actual: groupCount }));
    }
    if (totalAmount % groupCount !== 0 || totalAmount / groupCount !== amountPerGroup) {
      errors.push(issue("PATH1_P112_INVERSE_PARTITIVE_EXACT_DIVISION_FAILED", "amountPerGroup", {
        totalAmount,
        groupCount,
        actual: amountPerGroup,
      }));
    }
    if (item?.finalAnswer !== amountPerGroup) {
      errors.push(issue("PATH1_P112_INVERSE_FINAL_ANSWER_ROLE_MISMATCH", "finalAnswer", {
        expected: amountPerGroup,
        actual: item?.finalAnswer,
      }));
    }
  }
  return values;
}

function expectedEquation(item, roleConfig) {
  if (roleConfig.unknownRole === "totalAmount") {
    return `${item.amountPerGroup} × ${item.groupCount} = ${item.totalAmount}`;
  }
  if (roleConfig.unknownRole === "groupCount") {
    return `${item.totalAmount} ÷ ${item.amountPerGroup} = ${item.groupCount}`;
  }
  return `${item.totalAmount} ÷ ${item.groupCount} = ${item.amountPerGroup}`;
}

export function validatePath1P112InverseEqualGroupsItem(item = {}) {
  const errors = [];
  if (item?.path1BlockId !== PATH1_P112_INVERSE_EQUAL_GROUPS_BLOCK_ID) {
    errors.push(issue("PATH1_P112_INVERSE_MODE_BLOCK_NOT_SUPPORTED", "path1BlockId", { blockId: item?.path1BlockId }));
  }
  if (item?.mode !== "application") {
    errors.push(issue("PATH1_P112_INVERSE_MODE_INVALID", "mode"));
  }
  if (item?.operationFamilyId !== PATH1_P112_INVERSE_EQUAL_GROUPS_OPERATION_FAMILY_ID) {
    errors.push(issue("PATH1_P112_INVERSE_OPERATION_FAMILY_INVALID", "operationFamilyId"));
  }
  if (item?.metadata?.practiceMode !== PATH1_P112_INVERSE_EQUAL_GROUPS_PRACTICE_MODE) {
    errors.push(issue("PATH1_P112_INVERSE_PRACTICE_MODE_INVALID", "metadata.practiceMode"));
  }

  const roleConfig = getPath1P112InverseEqualGroupsRoleConfig(item?.unknownRole);
  if (!roleConfig) {
    errors.push(issue("PATH1_P112_INVERSE_UNKNOWN_ROLE_INVALID", "unknownRole", { actual: item?.unknownRole }));
    return Object.freeze({ ok: false, errors: Object.freeze(errors) });
  }

  if (item?.knowledgePointId !== roleConfig.relationKnowledgePointId
      || item?.relationKnowledgePointId !== roleConfig.relationKnowledgePointId) {
    errors.push(issue("PATH1_P112_INVERSE_RELATION_KP_MISMATCH", "relationKnowledgePointId", {
      expected: roleConfig.relationKnowledgePointId,
      actual: item?.relationKnowledgePointId,
    }));
  }
  if (item?.relationOperationModelId !== roleConfig.relationOperationModelId) {
    errors.push(issue("PATH1_P112_INVERSE_RELATION_MODEL_MISMATCH", "relationOperationModelId", {
      expected: roleConfig.relationOperationModelId,
      actual: item?.relationOperationModelId,
    }));
  }
  if (item?.relationOperation !== roleConfig.operation) {
    errors.push(issue("PATH1_P112_INVERSE_RELATION_OPERATION_MISMATCH", "relationOperation", {
      expected: roleConfig.operation,
      actual: item?.relationOperation,
    }));
  }

  const patternSpecId = item?.semanticPatternSpecId;
  if (!roleConfig.semanticPatternSpecIds.includes(patternSpecId)) {
    errors.push(issue("PATH1_P112_INVERSE_PATTERN_NOT_ALLOWED_FOR_ROLE", "semanticPatternSpecId", { patternSpecId }));
  }
  if (!isS58FPromotedG3BU08SemanticPatternSpecId(patternSpecId)) {
    errors.push(issue("PATH1_P112_INVERSE_PATTERN_NOT_PROMOTED", "semanticPatternSpecId", { patternSpecId }));
  }
  const spec = getG3BU08SemanticPatternDefinition(patternSpecId);
  if (!spec
      || spec.patternGroupId !== roleConfig.patternGroupId
      || spec.knowledgePointId !== roleConfig.relationKnowledgePointId
      || spec.equationShape !== roleConfig.equationShape) {
    errors.push(issue("PATH1_P112_INVERSE_SEMANTIC_AUTHORITY_MISMATCH", "semanticPatternSpecId", { patternSpecId }));
  }
  if (item?.patternSpecId !== patternSpecId) {
    errors.push(issue("PATH1_P112_INVERSE_PATTERN_PROJECTION_MISMATCH", "patternSpecId"));
  }

  const contextVariant = getG3BU08SemanticContextVariant(item?.contextVariantId);
  if (!contextVariant || !spec || contextVariant.templateFamilyId !== spec.templateFamilyId) {
    errors.push(issue("PATH1_P112_INVERSE_CONTEXT_VARIANT_MISMATCH", "contextVariantId", {
      contextVariantId: item?.contextVariantId,
    }));
  }

  validateRoleEnvelope(item, roleConfig, errors);

  const equationModel = expectedEquation(item, roleConfig);
  if (item?.equationModel !== equationModel) {
    errors.push(issue("PATH1_P112_INVERSE_EQUATION_ROLE_MISMATCH", "equationModel", {
      expected: equationModel,
      actual: item?.equationModel,
    }));
  }
  if (contextVariant && item?.finalAnswerUnit !== contextVariant.answerUnit) {
    errors.push(issue("PATH1_P112_INVERSE_ANSWER_UNIT_MISMATCH", "finalAnswerUnit", {
      expected: contextVariant.answerUnit,
      actual: item?.finalAnswerUnit,
    }));
  }

  const expectedPrompt = spec && contextVariant
    ? renderPath1P112InverseEqualGroupsAuthorityPrompt(spec, contextVariant, item?.unknownRole, {
      amountPerGroup: item?.amountPerGroup,
      groupCount: item?.groupCount,
      totalAmount: item?.totalAmount,
    })
    : null;
  if (!expectedPrompt || item?.prompt !== expectedPrompt) {
    errors.push(issue("PATH1_P112_INVERSE_PROMPT_AUTHORITY_MISMATCH", "prompt"));
  }

  const expectedAnswerText = contextVariant
    ? `${equationModel}；答：${item?.finalAnswer}${contextVariant.answerUnit}`
    : null;
  if (!expectedAnswerText || item?.answerText !== expectedAnswerText) {
    errors.push(issue("PATH1_P112_INVERSE_ANSWER_WITNESS_MISMATCH", "answerText"));
  }

  if (item?.semanticSourceId !== PATH1_P112_INVERSE_EQUAL_GROUPS_SEMANTIC_SOURCE_ID) {
    errors.push(issue("PATH1_P112_INVERSE_SEMANTIC_SOURCE_MISMATCH", "semanticSourceId"));
  }
  const sourceIds = new Set(item?.sourceIds ?? []);
  if (!sourceIds.has(PATH1_P112_INVERSE_EQUAL_GROUPS_SEMANTIC_SOURCE_ID)) {
    errors.push(issue("PATH1_P112_INVERSE_SOURCE_IDS_INCOMPLETE", "sourceIds"));
  }
  if (item?.metadata?.relationKnowledgePointId !== roleConfig.relationKnowledgePointId
      || item?.metadata?.relationOperationModelId !== roleConfig.relationOperationModelId
      || item?.metadata?.semanticPatternSpecId !== patternSpecId
      || item?.metadata?.unknownRole !== roleConfig.unknownRole) {
    errors.push(issue("PATH1_P112_INVERSE_METADATA_LINEAGE_MISMATCH", "metadata"));
  }
  if (item?.metadata?.canonicalKnowledgePointMinted !== false) {
    errors.push(issue("PATH1_P112_INVERSE_CANONICAL_KP_MINT_FORBIDDEN", "metadata.canonicalKnowledgePointMinted"));
  }
  if (item?.metadata?.commutativeSemanticRoleSwapAllowed !== false) {
    errors.push(issue("PATH1_P112_INVERSE_ROLE_SWAP_FORBIDDEN", "metadata.commutativeSemanticRoleSwapAllowed"));
  }
  if (item?.metadata?.keywordToOperationSelectionAllowed !== false) {
    errors.push(issue("PATH1_P112_INVERSE_KEYWORD_ROUTING_FORBIDDEN", "metadata.keywordToOperationSelectionAllowed"));
  }
  const exactDivisionExpected = roleConfig.operation !== "multiplication";
  if (item?.metadata?.exactDivisionRequired !== exactDivisionExpected) {
    errors.push(issue("PATH1_P112_INVERSE_EXACT_DIVISION_METADATA_MISMATCH", "metadata.exactDivisionRequired"));
  }

  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors) });
}

export function validatePath1P112InverseEqualGroupsItems(items = []) {
  if (!Array.isArray(items) || items.length === 0) {
    return Object.freeze({
      ok: false,
      errors: Object.freeze([issue("PATH1_P112_INVERSE_ITEMS_REQUIRED", "items")]),
      results: Object.freeze([]),
    });
  }
  const errors = [];
  const results = items.map((item, index) => {
    const validation = validatePath1P112InverseEqualGroupsItem(item);
    if (!validation.ok) {
      errors.push(...validation.errors.map((entry) => Object.freeze({ ...entry, itemIndex: index })));
    }
    return Object.freeze({ index, ...validation });
  });
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), results: Object.freeze(results) });
}
