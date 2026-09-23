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
  PATH1_EQUAL_GROUPS_TRANSFER_ARITHMETIC_SOURCE_ID,
  PATH1_EQUAL_GROUPS_TRANSFER_BLOCK_KPS,
  PATH1_EQUAL_GROUPS_TRANSFER_INSTRUCTION_SUFFIX,
  PATH1_EQUAL_GROUPS_TRANSFER_OPERATION_MODEL_ID,
  PATH1_EQUAL_GROUPS_TRANSFER_PATTERN_GROUP_ID,
  PATH1_EQUAL_GROUPS_TRANSFER_PATTERN_SPEC_IDS,
  PATH1_EQUAL_GROUPS_TRANSFER_PRACTICE_MODE,
  PATH1_EQUAL_GROUPS_TRANSFER_RELATION_KP_ID,
  PATH1_EQUAL_GROUPS_TRANSFER_SEMANTIC_SOURCE_ID,
} from "./path1-equal-groups-transfer-generator.js";

const TWO_DIGIT_KP_ID = "kp_g3a_u03_2digit_by_1digit_carry";
const THREE_DIGIT_KP_ID = "kp_g3a_u03_3digit_by_1digit";
const P101_KP_ID = "kp_g3a_u03_10_multiple_by_1digit";

function issue(code, path, details = {}) {
  return Object.freeze({ code, path, ...details });
}

function renderAuthorityPrompt(spec, contextVariant, amountPerGroup, groupCount) {
  const values = {
    ...(contextVariant?.bindings ?? {}),
    a: amountPerGroup,
    b: groupCount,
  };
  const sourceTemplate = spec?.sourcePromptSkeletonZh;
  if (!sourceTemplate) return null;
  let unresolved = false;
  const prompt = sourceTemplate.replace(/\{([^}]+)\}/g, (_, key) => {
    const value = values[key];
    if (value === undefined || value === null || value === "") {
      unresolved = true;
      return `{${key}}`;
    }
    return String(value);
  });
  return unresolved ? null : `${prompt} ${PATH1_EQUAL_GROUPS_TRANSFER_INSTRUCTION_SUFFIX}`;
}

function hasDirectOnesCarry(amountPerGroup, groupCount) {
  return (amountPerGroup % 10) * groupCount >= 10;
}

function excludesThreeDigitZeroSpecial(amountPerGroup) {
  const tensDigit = Math.floor(amountPerGroup / 10) % 10;
  const onesDigit = amountPerGroup % 10;
  return tensDigit !== 0 && onesDigit !== 0;
}

function validateArithmeticEnvelope(item, errors) {
  const amountPerGroup = Number(item?.amountPerGroup);
  const groupCount = Number(item?.groupCount);
  const totalAmount = Number(item?.totalAmount);
  const kp = item?.arithmeticKnowledgePointId;
  const blockId = item?.path1BlockId;

  if (!Number.isInteger(amountPerGroup) || !Number.isInteger(groupCount) || !Number.isInteger(totalAmount)) {
    errors.push(issue("PATH1_TRANSFER_NUMERIC_INPUT_INVALID", "numericRoles"));
    return;
  }
  if (groupCount < 2 || groupCount > 9) {
    errors.push(issue("PATH1_TRANSFER_GROUP_COUNT_OUT_OF_RANGE", "groupCount", { actual: groupCount }));
  }
  if (amountPerGroup * groupCount !== totalAmount || item?.finalAnswer !== totalAmount) {
    errors.push(issue("PATH1_TRANSFER_PRODUCT_INVARIANT_FAILED", "totalAmount", {
      expected: amountPerGroup * groupCount,
      actual: totalAmount,
    }));
  }
  if (totalAmount > 999 || totalAmount < 1) {
    errors.push(issue("PATH1_TRANSFER_RELATION_ENVELOPE_EXCEEDED", "totalAmount", { actual: totalAmount }));
  }

  if (blockId === "P1-01") {
    if (kp !== P101_KP_ID) errors.push(issue("PATH1_TRANSFER_ARITHMETIC_KP_BLOCK_MISMATCH", "arithmeticKnowledgePointId"));
    if (amountPerGroup < 10 || amountPerGroup > 90 || amountPerGroup % 10 !== 0) {
      errors.push(issue("PATH1_TRANSFER_P101_OPERAND_OUT_OF_RANGE", "amountPerGroup", { actual: amountPerGroup }));
    }
    return;
  }

  if (blockId === "P1-02") {
    if (![TWO_DIGIT_KP_ID, THREE_DIGIT_KP_ID].includes(kp)) {
      errors.push(issue("PATH1_TRANSFER_ARITHMETIC_KP_BLOCK_MISMATCH", "arithmeticKnowledgePointId"));
      return;
    }
    if (kp === TWO_DIGIT_KP_ID) {
      if (amountPerGroup < 10 || amountPerGroup > 99 || !hasDirectOnesCarry(amountPerGroup, groupCount)) {
        errors.push(issue("PATH1_TRANSFER_P102_TWO_DIGIT_GUARD_FAILED", "amountPerGroup", { actual: amountPerGroup }));
      }
    }
    if (kp === THREE_DIGIT_KP_ID) {
      if (amountPerGroup < 100 || amountPerGroup > 999 || !excludesThreeDigitZeroSpecial(amountPerGroup)) {
        errors.push(issue("PATH1_TRANSFER_P102_THREE_DIGIT_GUARD_FAILED", "amountPerGroup", { actual: amountPerGroup }));
      }
      if (amountPerGroup > Math.floor(999 / groupCount)) {
        errors.push(issue("PATH1_TRANSFER_P102_THREE_DIGIT_BOUNDED_SUBSET_FAILED", "amountPerGroup", {
          amountPerGroup,
          groupCount,
        }));
      }
    }
    return;
  }

  errors.push(issue("PATH1_TRANSFER_MODE_BLOCK_NOT_SUPPORTED", "path1BlockId", { blockId }));
}

export function validatePath1EqualGroupsTransferItem(item = {}) {
  const errors = [];
  const blockId = item?.path1BlockId;
  const allowedKps = PATH1_EQUAL_GROUPS_TRANSFER_BLOCK_KPS[blockId];

  if (!allowedKps) {
    errors.push(issue("PATH1_TRANSFER_MODE_BLOCK_NOT_SUPPORTED", "path1BlockId", { blockId }));
  }
  if (item?.mode !== "application") errors.push(issue("PATH1_TRANSFER_MODE_INVALID", "mode"));
  if (item?.operationFamilyId !== "PATH1_EQUAL_GROUPS_TRANSFER") errors.push(issue("PATH1_TRANSFER_OPERATION_FAMILY_INVALID", "operationFamilyId"));
  if (item?.metadata?.practiceMode !== PATH1_EQUAL_GROUPS_TRANSFER_PRACTICE_MODE) errors.push(issue("PATH1_TRANSFER_PRACTICE_MODE_INVALID", "metadata.practiceMode"));
  if (item?.knowledgePointId !== item?.arithmeticKnowledgePointId) {
    errors.push(issue("PATH1_TRANSFER_TOP_LEVEL_KP_LINEAGE_MISMATCH", "knowledgePointId"));
  }
  if (allowedKps && !allowedKps.includes(item?.arithmeticKnowledgePointId)) {
    errors.push(issue("PATH1_TRANSFER_ARITHMETIC_KP_BLOCK_MISMATCH", "arithmeticKnowledgePointId"));
  }
  if (item?.relationKnowledgePointId !== PATH1_EQUAL_GROUPS_TRANSFER_RELATION_KP_ID) {
    errors.push(issue("PATH1_TRANSFER_RELATION_KP_MISMATCH", "relationKnowledgePointId"));
  }
  if (item?.relationOperationModelId !== PATH1_EQUAL_GROUPS_TRANSFER_OPERATION_MODEL_ID) {
    errors.push(issue("PATH1_TRANSFER_RELATION_MODEL_MISMATCH", "relationOperationModelId"));
  }
  if (item?.unknownRole !== "totalAmount") errors.push(issue("PATH1_TRANSFER_UNKNOWN_ROLE_INVALID", "unknownRole"));

  const patternSpecId = item?.semanticPatternSpecId;
  if (!PATH1_EQUAL_GROUPS_TRANSFER_PATTERN_SPEC_IDS.includes(patternSpecId)) {
    errors.push(issue("PATH1_TRANSFER_SEMANTIC_PATTERN_NOT_ALLOWED", "semanticPatternSpecId", { patternSpecId }));
  }
  if (!isS58FPromotedG3BU08SemanticPatternSpecId(patternSpecId)) {
    errors.push(issue("PATH1_TRANSFER_SEMANTIC_PATTERN_NOT_PROMOTED", "semanticPatternSpecId", { patternSpecId }));
  }
  const spec = getG3BU08SemanticPatternDefinition(patternSpecId);
  if (!spec
      || spec.patternGroupId !== PATH1_EQUAL_GROUPS_TRANSFER_PATTERN_GROUP_ID
      || spec.knowledgePointId !== PATH1_EQUAL_GROUPS_TRANSFER_RELATION_KP_ID
      || spec.equationShape !== "a*b") {
    errors.push(issue("PATH1_TRANSFER_SEMANTIC_AUTHORITY_MISMATCH", "semanticPatternSpecId", { patternSpecId }));
  }
  if (item?.patternSpecId !== patternSpecId) errors.push(issue("PATH1_TRANSFER_PATTERN_PROJECTION_MISMATCH", "patternSpecId"));

  const contextVariant = getG3BU08SemanticContextVariant(item?.contextVariantId);
  if (!contextVariant || !spec || contextVariant.templateFamilyId !== spec.templateFamilyId) {
    errors.push(issue("PATH1_TRANSFER_CONTEXT_VARIANT_MISMATCH", "contextVariantId", { contextVariantId: item?.contextVariantId }));
  }

  validateArithmeticEnvelope(item, errors);

  const expectedEquation = `${item?.amountPerGroup} × ${item?.groupCount} = ${item?.totalAmount}`;
  if (item?.equationModel !== expectedEquation) {
    errors.push(issue("PATH1_TRANSFER_EQUATION_ROLE_ORDER_MISMATCH", "equationModel", {
      expected: expectedEquation,
      actual: item?.equationModel,
    }));
  }
  if (contextVariant && item?.finalAnswerUnit !== contextVariant.answerUnit) {
    errors.push(issue("PATH1_TRANSFER_ANSWER_UNIT_MISMATCH", "finalAnswerUnit", {
      expected: contextVariant.answerUnit,
      actual: item?.finalAnswerUnit,
    }));
  }
  const expectedPrompt = spec && contextVariant
    ? renderAuthorityPrompt(spec, contextVariant, item?.amountPerGroup, item?.groupCount)
    : null;
  if (!expectedPrompt || item?.prompt !== expectedPrompt) {
    errors.push(issue("PATH1_TRANSFER_PROMPT_AUTHORITY_MISMATCH", "prompt"));
  }
  const expectedAnswerText = contextVariant
    ? `${expectedEquation}；答：${item?.totalAmount}${contextVariant.answerUnit}`
    : null;
  if (!expectedAnswerText || item?.answerText !== expectedAnswerText) {
    errors.push(issue("PATH1_TRANSFER_ANSWER_WITNESS_MISMATCH", "answerText"));
  }

  if (item?.arithmeticSourceId !== PATH1_EQUAL_GROUPS_TRANSFER_ARITHMETIC_SOURCE_ID
      || item?.semanticSourceId !== PATH1_EQUAL_GROUPS_TRANSFER_SEMANTIC_SOURCE_ID) {
    errors.push(issue("PATH1_TRANSFER_SOURCE_LINEAGE_INCOMPLETE", "sourceLineage"));
  }
  const sourceIds = new Set(item?.sourceIds ?? []);
  if (!sourceIds.has(PATH1_EQUAL_GROUPS_TRANSFER_ARITHMETIC_SOURCE_ID)
      || !sourceIds.has(PATH1_EQUAL_GROUPS_TRANSFER_SEMANTIC_SOURCE_ID)) {
    errors.push(issue("PATH1_TRANSFER_SOURCE_IDS_INCOMPLETE", "sourceIds"));
  }
  if (item?.metadata?.arithmeticKnowledgePointId !== item?.arithmeticKnowledgePointId
      || item?.metadata?.relationKnowledgePointId !== PATH1_EQUAL_GROUPS_TRANSFER_RELATION_KP_ID
      || item?.metadata?.semanticPatternSpecId !== patternSpecId) {
    errors.push(issue("PATH1_TRANSFER_METADATA_LINEAGE_MISMATCH", "metadata"));
  }
  if (item?.metadata?.canonicalKnowledgePointMinted !== false) {
    errors.push(issue("PATH1_TRANSFER_CANONICAL_KP_MINT_FORBIDDEN", "metadata.canonicalKnowledgePointMinted"));
  }
  if (item?.metadata?.commutativeArithmeticRoleSwapAllowed !== false) {
    errors.push(issue("PATH1_TRANSFER_COMMUTATIVE_ROLE_SWAP_FORBIDDEN", "metadata.commutativeArithmeticRoleSwapAllowed"));
  }

  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors) });
}

export function validatePath1EqualGroupsTransferItems(items = []) {
  const errors = [];
  if (!Array.isArray(items) || items.length === 0) {
    return Object.freeze({
      ok: false,
      errors: Object.freeze([issue("PATH1_TRANSFER_ITEMS_REQUIRED", "items")]),
      results: Object.freeze([]),
    });
  }
  const results = items.map((item, index) => {
    const validation = validatePath1EqualGroupsTransferItem(item);
    if (!validation.ok) {
      errors.push(...validation.errors.map((entry) => ({ ...entry, itemIndex: index })));
    }
    return Object.freeze({ index, ...validation });
  });
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), results: Object.freeze(results) });
}
