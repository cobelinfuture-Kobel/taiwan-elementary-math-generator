import { G4A_U08_APP_COST_OVERLAY_PATTERN_SPEC } from "../../../site/modules/curriculum/batch-a/g4a-u08-app-cost-overlay-hidden.js";

const CODES = Object.freeze({
  ITEM_INVALID: "G4AU08_COST_OVERLAY_ITEM_INVALID",
  SCHEMA_INVALID: "G4AU08_COST_OVERLAY_SCHEMA_INVALID",
  IDENTITY_MISMATCH: "G4AU08_COST_OVERLAY_IDENTITY_MISMATCH",
  ROLE_MISMATCH: "G4AU08_COST_OVERLAY_ROLE_MISMATCH",
  OPERATION_MISMATCH: "G4AU08_COST_OVERLAY_OPERATION_MISMATCH",
  INTERMEDIATE_MISMATCH: "G4AU08_COST_OVERLAY_INTERMEDIATE_MISMATCH",
  ANSWER_INCORRECT: "G4AU08_COST_OVERLAY_ANSWER_INCORRECT",
  UNIT_FLOW_INVALID: "G4AU08_COST_OVERLAY_UNIT_FLOW_INVALID",
  SEMANTIC_RELATION_INVALID: "G4AU08_COST_OVERLAY_SEMANTIC_RELATION_INVALID",
  OVERLAY_DIRECTION_INVALID: "G4AU08_COST_OVERLAY_DIRECTION_INVALID",
  PAYMENT_BALANCE_INJECTED: "G4AU08_COST_OVERLAY_PAYMENT_BALANCE_INJECTED",
  LIFECYCLE_INVALID: "G4AU08_COST_OVERLAY_LIFECYCLE_INVALID",
});

function clone(value) { return JSON.parse(JSON.stringify(value)); }
function issue(code, field, expected, actual) { return Object.freeze({ code, field, expected, actual }); }

export function validateG4AU08AppCostOverlayItem(item) {
  const errors = [];
  if (!item || typeof item !== "object" || Array.isArray(item)) return Object.freeze({ valid: false, errors: Object.freeze([issue(CODES.ITEM_INVALID, "item", "object", item)]) });
  if (item.schemaName !== "G4AU08AppCostOverlayGeneratedItem" || item.schemaVersion !== 1) errors.push(issue(CODES.SCHEMA_INVALID, "schema", "G4AU08AppCostOverlayGeneratedItem@1", `${item.schemaName}@${item.schemaVersion}`));
  for (const field of ["sourceId", "unitCode", "knowledgePointId", "patternGroupId", "patternSpecId", "templateFamilyId", "reasoningRole"]) {
    if (item[field] !== G4A_U08_APP_COST_OVERLAY_PATTERN_SPEC[field]) errors.push(issue(CODES.IDENTITY_MISMATCH, field, G4A_U08_APP_COST_OVERLAY_PATTERN_SPEC[field], item[field]));
  }
  if (item.unknownQuantityRole !== "adjustedCost") errors.push(issue(CODES.ROLE_MISMATCH, "unknownQuantityRole", "adjustedCost", item.unknownQuantityRole));
  const unitCost = item.knownQuantities?.find((row) => row.role === "unitCost")?.value;
  const quantity = item.knownQuantities?.find((row) => row.role === "quantity")?.value;
  const overlay = item.knownQuantities?.find((row) => row.role === "overlayAmount");
  const componentCost = unitCost * quantity;
  const operator = overlay?.direction === "add" ? "+" : overlay?.direction === "subtract" ? "-" : null;
  const expected = operator === "+" ? componentCost + overlay.value : operator === "-" ? componentCost - overlay.value : NaN;
  if (!Number.isFinite(unitCost) || !Number.isFinite(quantity) || !Number.isFinite(overlay?.value)) errors.push(issue(CODES.ROLE_MISMATCH, "knownQuantities", "unitCost/quantity/overlayAmount", item.knownQuantities));
  if (item.requiredOperationSequence?.[0] !== "×" || item.requiredOperationSequence?.[1] !== operator) errors.push(issue(CODES.OPERATION_MISMATCH, "requiredOperationSequence", ["×", operator], item.requiredOperationSequence));
  if (item.intermediateValues?.componentCost !== componentCost) errors.push(issue(CODES.INTERMEDIATE_MISMATCH, "intermediateValues.componentCost", componentCost, item.intermediateValues?.componentCost));
  if (item.answerModel?.value !== expected || item.answerModel?.unit !== "元") errors.push(issue(CODES.ANSWER_INCORRECT, "answerModel", { value: expected, unit: "元" }, item.answerModel));
  if (JSON.stringify(item.unitFlow) !== JSON.stringify(G4A_U08_APP_COST_OVERLAY_PATTERN_SPEC.unitFlow)) errors.push(issue(CODES.UNIT_FLOW_INVALID, "unitFlow", G4A_U08_APP_COST_OVERLAY_PATTERN_SPEC.unitFlow, item.unitFlow));
  const relations = new Set(item.semanticRelations ?? []);
  if (!relations.has("single_cost_component") || !relations.has("overlay_direction_preserved")) errors.push(issue(CODES.SEMANTIC_RELATION_INVALID, "semanticRelations", ["single_cost_component", "overlay_direction_preserved"], item.semanticRelations));
  if ((operator === "+" && !relations.has("overlay_add")) || (operator === "-" && !relations.has("overlay_subtract"))) errors.push(issue(CODES.OVERLAY_DIRECTION_INVALID, "semanticRelations", operator, item.semanticRelations));
  if (relations.has("payment_balance") || item.unknownQuantityRole === "changeAmount") errors.push(issue(CODES.PAYMENT_BALANCE_INJECTED, "semanticRelations", "adjusted cost, not change", item.semanticRelations));
  const lifecycle = item.lifecycle;
  if (!lifecycle || lifecycle.selectorVisibility !== "hidden" || lifecycle.canonicalRouting !== "disabled" || lifecycle.productionUse !== "forbidden") errors.push(issue(CODES.LIFECYCLE_INVALID, "lifecycle", "hidden/disabled/forbidden", lifecycle));
  return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors), validatedLevels: Object.freeze(["L1", "L2", "L3", "L4", "L5", "L6"]) });
}

export function buildG4AU08AppCostOverlayMutationCases(item) {
  const cases = [];
  const direction = clone(item); direction.knownQuantities.find((row) => row.role === "overlayAmount").direction = direction.knownQuantities.find((row) => row.role === "overlayAmount").direction === "add" ? "subtract" : "add"; cases.push({ mutationId: "overlay_direction_flipped", item: direction });
  const omitted = clone(item); omitted.intermediateValues.componentCost += 1; cases.push({ mutationId: "multiplication_component_omitted", item: omitted });
  const payment = clone(item); payment.semanticRelations.push("payment_balance"); payment.unknownQuantityRole = "changeAmount"; cases.push({ mutationId: "payment_balance_semantics_injected", item: payment });
  return cases.map((row) => Object.freeze(row));
}

export function getG4AU08AppCostOverlayValidatorErrorCodes() { return CODES; }
