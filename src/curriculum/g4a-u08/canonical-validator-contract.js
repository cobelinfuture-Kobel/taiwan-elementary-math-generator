import {
  getG4AU08AdapterContracts,
  getG4AU08AllAdapterContracts,
  getG4AU08ExtensionAdapterContracts
} from "./canonical-generated-item-adapter.js";

const SOURCE_ID = "g4a_u08_4a08";
const UNIT_CODE = "4A-U08";
const EXISTING_CONTRACTS = getG4AU08AdapterContracts();
const EXTENSION_CONTRACTS = getG4AU08ExtensionAdapterContracts();
const ALL_CONTRACTS = getG4AU08AllAdapterContracts();

const ERROR_CODES = Object.freeze({
  ITEM_INVALID: "G4AU08_VALIDATOR_ITEM_INVALID",
  SCHEMA_INVALID: "G4AU08_VALIDATOR_SCHEMA_INVALID",
  SOURCE_MISMATCH: "G4AU08_VALIDATOR_SOURCE_MISMATCH",
  UNIT_MISMATCH: "G4AU08_VALIDATOR_UNIT_MISMATCH",
  TEMPLATE_UNMAPPED: "G4AU08_VALIDATOR_TEMPLATE_UNMAPPED",
  KP_MISMATCH: "G4AU08_VALIDATOR_KP_MISMATCH",
  PATTERN_GROUP_MISMATCH: "G4AU08_VALIDATOR_PATTERN_GROUP_MISMATCH",
  PATTERN_SPEC_MISMATCH: "G4AU08_VALIDATOR_PATTERN_SPEC_MISMATCH",
  REASONING_ROLE_MISMATCH: "G4AU08_VALIDATOR_REASONING_ROLE_MISMATCH",
  KNOWN_ROLES_MISMATCH: "G4AU08_VALIDATOR_KNOWN_ROLES_MISMATCH",
  UNKNOWN_ROLE_MISMATCH: "G4AU08_VALIDATOR_UNKNOWN_ROLE_MISMATCH",
  OPERATION_SEQUENCE_MISMATCH: "G4AU08_VALIDATOR_OPERATION_SEQUENCE_MISMATCH",
  INTERMEDIATE_REQUIREMENT_MISMATCH: "G4AU08_VALIDATOR_INTERMEDIATE_REQUIREMENT_MISMATCH",
  SEMANTIC_RELATION_MISMATCH: "G4AU08_VALIDATOR_SEMANTIC_RELATION_MISMATCH",
  PROMPT_MISSING: "G4AU08_VALIDATOR_PROMPT_MISSING",
  ANSWER_MODEL_MISSING: "G4AU08_VALIDATOR_ANSWER_MODEL_MISSING",
  LIFECYCLE_INVALID: "G4AU08_VALIDATOR_LIFECYCLE_INVALID",
  PUBLIC_ROUTING_FORBIDDEN: "G4AU08_VALIDATOR_PUBLIC_ROUTING_FORBIDDEN",
  PRODUCTION_USE_FORBIDDEN: "G4AU08_VALIDATOR_PRODUCTION_USE_FORBIDDEN"
});

function sameArray(a, b) { return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((value, i) => value === b[i]); }
function error(code, field, expected, actual) { return Object.freeze({ code, field, expected, actual }); }

function validateIdentity(item, contract, errors) {
  if (item.knowledgePointId !== contract.knowledgePointId) errors.push(error(ERROR_CODES.KP_MISMATCH, "knowledgePointId", contract.knowledgePointId, item.knowledgePointId));
  if (item.patternGroupId !== contract.patternGroupId) errors.push(error(ERROR_CODES.PATTERN_GROUP_MISMATCH, "patternGroupId", contract.patternGroupId, item.patternGroupId));
  if (item.patternSpecId !== contract.patternSpecId) errors.push(error(ERROR_CODES.PATTERN_SPEC_MISMATCH, "patternSpecId", contract.patternSpecId, item.patternSpecId));
  if (item.reasoningRole !== contract.reasoningRole) errors.push(error(ERROR_CODES.REASONING_ROLE_MISMATCH, "reasoningRole", contract.reasoningRole, item.reasoningRole));
}

function validateRoles(item, contract, errors) {
  if (!sameArray(item.knownQuantityRoles, contract.knownQuantityRoles)) errors.push(error(ERROR_CODES.KNOWN_ROLES_MISMATCH, "knownQuantityRoles", contract.knownQuantityRoles, item.knownQuantityRoles));
  if (item.unknownQuantityRole !== contract.unknownQuantityRole) errors.push(error(ERROR_CODES.UNKNOWN_ROLE_MISMATCH, "unknownQuantityRole", contract.unknownQuantityRole, item.unknownQuantityRole));
  if (!sameArray(item.requiredOperationSequence, contract.requiredOperationSequence)) errors.push(error(ERROR_CODES.OPERATION_SEQUENCE_MISMATCH, "requiredOperationSequence", contract.requiredOperationSequence, item.requiredOperationSequence));
  if (!sameArray(item.requiredIntermediateQuantities, contract.requiredIntermediateQuantities)) errors.push(error(ERROR_CODES.INTERMEDIATE_REQUIREMENT_MISMATCH, "requiredIntermediateQuantities", contract.requiredIntermediateQuantities, item.requiredIntermediateQuantities));
  if (contract.requiredSemanticRelations && !sameArray(item.semanticRelations, contract.requiredSemanticRelations)) {
    errors.push(error(ERROR_CODES.SEMANTIC_RELATION_MISMATCH, "semanticRelations", contract.requiredSemanticRelations, item.semanticRelations));
  }
}

function validateLifecycle(item, errors) {
  const lifecycle = item.lifecycle;
  if (!lifecycle || typeof lifecycle !== "object") { errors.push(error(ERROR_CODES.LIFECYCLE_INVALID, "lifecycle", "hidden contract object", lifecycle)); return; }
  if (lifecycle.selectorVisibility !== "hidden" || lifecycle.adapterStatus !== "implemented_hidden") errors.push(error(ERROR_CODES.LIFECYCLE_INVALID, "lifecycle", "hidden", lifecycle));
  if (lifecycle.canonicalRouting !== "disabled") errors.push(error(ERROR_CODES.PUBLIC_ROUTING_FORBIDDEN, "lifecycle.canonicalRouting", "disabled", lifecycle.canonicalRouting));
  if (lifecycle.productionUse !== "forbidden") errors.push(error(ERROR_CODES.PRODUCTION_USE_FORBIDDEN, "lifecycle.productionUse", "forbidden", lifecycle.productionUse));
}

export function getG4AU08ValidatorErrorCodes() { return ERROR_CODES; }
export function getG4AU08ValidatorContracts() { return EXISTING_CONTRACTS; }
export function getG4AU08ExtensionValidatorContracts() { return EXTENSION_CONTRACTS; }
export function getG4AU08AllValidatorContracts() { return ALL_CONTRACTS; }

export function validateG4AU08CanonicalItem(item) {
  const errors = [];
  if (!item || typeof item !== "object" || Array.isArray(item)) {
    errors.push(error(ERROR_CODES.ITEM_INVALID, "item", "object", item));
    return Object.freeze({ valid: false, errors: Object.freeze(errors) });
  }
  if (item.schemaName !== "G4AU08CanonicalGeneratedItem" || item.schemaVersion !== 1) errors.push(error(ERROR_CODES.SCHEMA_INVALID, "schema", "G4AU08CanonicalGeneratedItem@1", `${item.schemaName}@${item.schemaVersion}`));
  if (item.sourceId !== SOURCE_ID) errors.push(error(ERROR_CODES.SOURCE_MISMATCH, "sourceId", SOURCE_ID, item.sourceId));
  if (item.unitCode !== UNIT_CODE) errors.push(error(ERROR_CODES.UNIT_MISMATCH, "unitCode", UNIT_CODE, item.unitCode));
  const contract = ALL_CONTRACTS[item.legacyTemplateId];
  if (!contract) errors.push(error(ERROR_CODES.TEMPLATE_UNMAPPED, "legacyTemplateId", "mapped G4A-U08 template", item.legacyTemplateId));
  else { validateIdentity(item, contract, errors); validateRoles(item, contract, errors); }
  if (typeof item.prompt !== "string" || !item.prompt.trim()) errors.push(error(ERROR_CODES.PROMPT_MISSING, "prompt", "non-empty string", item.prompt));
  if (!item.answerModel || typeof item.answerModel !== "object") errors.push(error(ERROR_CODES.ANSWER_MODEL_MISSING, "answerModel", "object", item.answerModel));
  validateLifecycle(item, errors);
  return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors), validationStage: "validator_contract_rebase", arithmeticRecomputation: "deferred_to_generator_tests" });
}

export function assertValidG4AU08CanonicalItem(item) {
  const result = validateG4AU08CanonicalItem(item);
  if (!result.valid) {
    const failure = new Error(result.errors.map((entry) => entry.code).join(","));
    failure.name = "G4AU08CanonicalValidationError";
    failure.validationResult = result;
    throw failure;
  }
  return item;
}
