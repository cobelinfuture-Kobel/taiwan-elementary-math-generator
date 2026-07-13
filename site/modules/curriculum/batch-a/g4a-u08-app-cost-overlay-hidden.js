const SOURCE_ID = "g4a_u08_4a08";
const UNIT_CODE = "4A-U08";
const KNOWLEDGE_POINT_ID = "kp_g4a_u08_app_mul_div_before_add_sub";
const PATTERN_GROUP_ID = "pg_g4a_u08_app_cost_overlay";
const PATTERN_SPEC_ID = "ps_g4a_u08_app_cost_overlay";
const TEMPLATE_FAMILY_ID = "tpl_app_cost_component_plus_minus_overlay";

const LIFECYCLE = Object.freeze({
  registryStatus: "implemented_hidden",
  generatorStatus: "implemented_hidden",
  adapterStatus: "implemented_hidden",
  validatorStatus: "implemented_hidden",
  mutationStatus: "implemented_hidden",
  selectorVisibility: "hidden",
  canonicalRouting: "disabled",
  worksheetReachability: "disabled",
  productionUse: "forbidden",
});

export const G4A_U08_APP_COST_OVERLAY_PATTERN_SPEC = Object.freeze({
  sourceId: SOURCE_ID,
  unitCode: UNIT_CODE,
  knowledgePointId: KNOWLEDGE_POINT_ID,
  patternGroupId: PATTERN_GROUP_ID,
  patternSpecId: PATTERN_SPEC_ID,
  templateFamilyId: TEMPLATE_FAMILY_ID,
  mode: "application",
  depth: "N_PLUS_1",
  reasoningRole: "single_cost_component_plus_or_minus_overlay",
  knownQuantityRoles: Object.freeze(["unitCost", "quantity", "overlayAmount"]),
  unknownQuantityRole: "adjustedCost",
  requiredOperationSequence: Object.freeze(["×", "overlay"]),
  requiredIntermediateQuantities: Object.freeze(["componentCost"]),
  unitFlow: Object.freeze(["money_per_item×item_count=money", "money±money=money"]),
  semanticRelations: Object.freeze(["single_cost_component", "overlay_direction_preserved"]),
  equationShapes: Object.freeze(["unitCost×quantity+overlayAmount", "unitCost×quantity-overlayAmount"]),
  lifecycle: LIFECYCLE,
});

const SCENARIOS = Object.freeze([
  Object.freeze({ place: "文具店", item: "筆記本", unit: "本" }),
  Object.freeze({ place: "園遊會", item: "餐券", unit: "張" }),
  Object.freeze({ place: "書店", item: "練習簿", unit: "本" }),
  Object.freeze({ place: "美術用品店", item: "畫筆", unit: "支" }),
]);

function hashSeed(value) {
  let acc = 0;
  for (const char of String(value ?? "s76p")) acc = ((acc * 31) + char.charCodeAt(0)) >>> 0;
  return acc || 1;
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
}

export function generateG4AU08AppCostOverlayHidden(options = {}) {
  const seed = String(options.seed ?? "s76p-cost-overlay");
  const h = hashSeed(seed);
  const scenario = SCENARIOS[h % SCENARIOS.length];
  const unitCost = 20 + ((h >>> 3) % 81);
  const quantity = 2 + ((h >>> 9) % 9);
  const componentCost = unitCost * quantity;
  const direction = (h >>> 14) % 2 === 0 ? "add" : "subtract";
  const maxOverlay = direction === "subtract" ? Math.max(5, Math.min(80, componentCost - 1)) : 80;
  const overlayAmount = 5 + ((h >>> 17) % Math.max(1, maxOverlay - 4));
  const operator = direction === "add" ? "+" : "-";
  const finalAnswer = direction === "add" ? componentCost + overlayAmount : componentCost - overlayAmount;
  const expressionTokens = [unitCost, "×", quantity, operator, overlayAmount];
  const expression = `${unitCost} × ${quantity} ${operator} ${overlayAmount}`;
  const prompt = direction === "add"
    ? `${scenario.place}每${scenario.unit}${scenario.item}${unitCost}元，買了${quantity}${scenario.unit}，另加包裝費${overlayAmount}元，共要付多少元？`
    : `${scenario.place}每${scenario.unit}${scenario.item}${unitCost}元，買了${quantity}${scenario.unit}，使用折價券折抵${overlayAmount}元，共要付多少元？`;
  return deepFreeze({
    schemaName: "G4AU08AppCostOverlayGeneratedItem",
    schemaVersion: 1,
    sourceId: SOURCE_ID,
    unitCode: UNIT_CODE,
    knowledgePointId: KNOWLEDGE_POINT_ID,
    patternGroupId: PATTERN_GROUP_ID,
    patternSpecId: PATTERN_SPEC_ID,
    templateFamilyId: TEMPLATE_FAMILY_ID,
    mode: "application",
    reasoningRole: G4A_U08_APP_COST_OVERLAY_PATTERN_SPEC.reasoningRole,
    prompt,
    context: { place: scenario.place, item: scenario.item, itemUnit: scenario.unit, overlayType: direction === "add" ? "packaging_fee" : "discount" },
    knownQuantities: [
      { role: "unitCost", value: unitCost, unit: "元/件" },
      { role: "quantity", value: quantity, unit: scenario.unit },
      { role: "overlayAmount", value: overlayAmount, unit: "元", direction },
    ],
    unknownQuantityRole: "adjustedCost",
    expression,
    expressionTokens,
    requiredOperationSequence: ["×", operator],
    operations: [
      { step: 1, op: "×", left: unitCost, right: quantity, result: componentCost, role: "componentCost" },
      { step: 2, op: operator, left: componentCost, right: overlayAmount, result: finalAnswer, role: "adjustedCost" },
    ],
    intermediateValues: { componentCost },
    unitFlow: [...G4A_U08_APP_COST_OVERLAY_PATTERN_SPEC.unitFlow],
    semanticRelations: ["single_cost_component", direction === "add" ? "overlay_add" : "overlay_subtract", "overlay_direction_preserved"],
    answerModel: { shape: "final_numeric_answer_with_unit", value: finalAnswer, unit: "元" },
    lifecycle: LIFECYCLE,
    seed,
  });
}

export function validateG4AU08AppCostOverlayHiddenRegistry() {
  const errors = [];
  const spec = G4A_U08_APP_COST_OVERLAY_PATTERN_SPEC;
  if (spec.patternGroupId !== PATTERN_GROUP_ID) errors.push("pattern_group_mismatch");
  if (spec.patternSpecId !== PATTERN_SPEC_ID) errors.push("pattern_spec_mismatch");
  if (spec.knowledgePointId !== KNOWLEDGE_POINT_ID) errors.push("knowledge_point_mismatch");
  if (spec.equationShapes.length !== 2) errors.push("equation_shape_count_mismatch");
  if (spec.lifecycle.selectorVisibility !== "hidden" || spec.lifecycle.canonicalRouting !== "disabled" || spec.lifecycle.productionUse !== "forbidden") errors.push("hidden_lifecycle_invalid");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), counts: Object.freeze({ patternSpecs: 1, patternGroups: 1, knowledgePoints: 1, equationShapes: 2 }) });
}
