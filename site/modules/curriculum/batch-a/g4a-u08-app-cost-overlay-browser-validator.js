import { G4A_U08_APP_COST_OVERLAY_PATTERN_SPEC } from "./g4a-u08-app-cost-overlay-hidden.js";

function issue(code, field, expected, actual) {
  return { code, field, expected, actual };
}

export function validateG4AU08AppCostOverlayBrowserItem(item) {
  const errors = [];
  if (!item || typeof item !== "object") return { valid: false, errors: [issue("G4AU08_COST_OVERLAY_ITEM_INVALID", "item", "object", item)] };
  if (item.schemaName !== "G4AU08AppCostOverlayGeneratedItem" || item.schemaVersion !== 1) errors.push(issue("G4AU08_COST_OVERLAY_SCHEMA_INVALID", "schema", "G4AU08AppCostOverlayGeneratedItem@1", `${item.schemaName}@${item.schemaVersion}`));
  for (const field of ["sourceId", "unitCode", "knowledgePointId", "patternGroupId", "patternSpecId", "templateFamilyId", "reasoningRole"]) {
    if (item[field] !== G4A_U08_APP_COST_OVERLAY_PATTERN_SPEC[field]) errors.push(issue("G4AU08_COST_OVERLAY_IDENTITY_MISMATCH", field, G4A_U08_APP_COST_OVERLAY_PATTERN_SPEC[field], item[field]));
  }
  const unitCost = item.knownQuantities?.find((row) => row.role === "unitCost")?.value;
  const quantity = item.knownQuantities?.find((row) => row.role === "quantity")?.value;
  const overlay = item.knownQuantities?.find((row) => row.role === "overlayAmount");
  const componentCost = unitCost * quantity;
  const operator = overlay?.direction === "add" ? "+" : overlay?.direction === "subtract" ? "-" : null;
  const answer = operator === "+" ? componentCost + overlay.value : operator === "-" ? componentCost - overlay.value : NaN;
  if (item.unknownQuantityRole !== "adjustedCost") errors.push(issue("G4AU08_COST_OVERLAY_ROLE_MISMATCH", "unknownQuantityRole", "adjustedCost", item.unknownQuantityRole));
  if (item.requiredOperationSequence?.[0] !== "×" || item.requiredOperationSequence?.[1] !== operator) errors.push(issue("G4AU08_COST_OVERLAY_OPERATION_MISMATCH", "requiredOperationSequence", ["×", operator], item.requiredOperationSequence));
  if (item.intermediateValues?.componentCost !== componentCost) errors.push(issue("G4AU08_COST_OVERLAY_INTERMEDIATE_MISMATCH", "componentCost", componentCost, item.intermediateValues?.componentCost));
  if (!Number.isInteger(answer) || item.answerModel?.value !== answer || item.answerModel?.unit !== "元") errors.push(issue("G4AU08_COST_OVERLAY_ANSWER_INCORRECT", "answerModel", { value: answer, unit: "元" }, item.answerModel));
  const relations = new Set(item.semanticRelations ?? []);
  if (!relations.has("single_cost_component") || !relations.has("overlay_direction_preserved")) errors.push(issue("G4AU08_COST_OVERLAY_SEMANTIC_INVALID", "semanticRelations", ["single_cost_component", "overlay_direction_preserved"], item.semanticRelations));
  if (relations.has("payment_balance") || item.unknownQuantityRole === "changeAmount") errors.push(issue("G4AU08_COST_OVERLAY_PAYMENT_BALANCE_INJECTED", "semantics", "adjusted cost", item.semanticRelations));
  const lifecycle = item.lifecycle;
  if (!lifecycle || lifecycle.selectorVisibility !== "hidden" || lifecycle.canonicalRouting !== "disabled" || lifecycle.productionUse !== "forbidden") errors.push(issue("G4AU08_COST_OVERLAY_LIFECYCLE_INVALID", "lifecycle", "hidden/disabled/forbidden", lifecycle));
  return { valid: errors.length === 0, errors, validatedLevels: ["L1", "L2", "L3", "L4", "L5", "L6"] };
}
