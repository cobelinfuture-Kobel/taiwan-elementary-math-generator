import { validateG3BU01WordProblemTemplateSpec } from "./g3b-u01-word-problem-template-contract.js";

const floorSpec = "ps_g3b_u01_wp_remainder_floor_max_groups";
const ceilSpec = "ps_g3b_u01_wp_remainder_ceil_min_containers";

export const G3B_U01_REMAINDER_INTERPRETATION_TEMPLATES = Object.freeze([
  Object.freeze({ templateId: "tpl_g3b_u01_remainder_floor_peach_boxes", patternSpecId: floorSpec, semanticModel: "remainder_interpretation_floor", operationModel: Object.freeze({ kind: "floor_division", expression: "floor(total / groupSize)" }), answerModel: Object.freeze({ shape: "single_integer", unitRole: "containerUnit" }), unitModel: Object.freeze({ totalUnit: "個", containerUnit: "盒", answerUnit: "盒" }), slotModel: Object.freeze({ total: Object.freeze([30, 99]), groupSize: Object.freeze([4, 9]), requireRemainder: true, itemNoun: "水蜜桃" }), promptTemplate: "有 {total} 個{itemNoun}，每 {groupSize} 個裝 1 盒，最多可以裝幾盒？" }),
  Object.freeze({ templateId: "tpl_g3b_u01_remainder_floor_students_teams", patternSpecId: floorSpec, semanticModel: "remainder_interpretation_floor", operationModel: Object.freeze({ kind: "floor_division", expression: "floor(total / groupSize)" }), answerModel: Object.freeze({ shape: "single_integer", unitRole: "groupUnit" }), unitModel: Object.freeze({ totalUnit: "人", groupUnit: "組", answerUnit: "組" }), slotModel: Object.freeze({ total: Object.freeze([30, 99]), groupSize: Object.freeze([4, 9]), requireRemainder: true, itemNoun: "學生" }), promptTemplate: "有 {total} 位{itemNoun}，每 {groupSize} 人分成 1 組，最多可以分成幾組？" }),
  Object.freeze({ templateId: "tpl_g3b_u01_remainder_ceil_peach_boxes", patternSpecId: ceilSpec, semanticModel: "remainder_interpretation_ceil", operationModel: Object.freeze({ kind: "ceil_division", expression: "ceil(total / groupSize)" }), answerModel: Object.freeze({ shape: "single_integer", unitRole: "containerUnit" }), unitModel: Object.freeze({ totalUnit: "個", containerUnit: "盒", answerUnit: "盒" }), slotModel: Object.freeze({ total: Object.freeze([30, 99]), groupSize: Object.freeze([4, 9]), requireRemainder: true, itemNoun: "水蜜桃" }), promptTemplate: "有 {total} 個{itemNoun}，每 {groupSize} 個裝 1 盒，最少需要幾盒？" }),
  Object.freeze({ templateId: "tpl_g3b_u01_remainder_ceil_bus_seats", patternSpecId: ceilSpec, semanticModel: "remainder_interpretation_ceil", operationModel: Object.freeze({ kind: "ceil_division", expression: "ceil(total / groupSize)" }), answerModel: Object.freeze({ shape: "single_integer", unitRole: "vehicleUnit" }), unitModel: Object.freeze({ totalUnit: "人", vehicleUnit: "輛", answerUnit: "輛" }), slotModel: Object.freeze({ total: Object.freeze([30, 99]), groupSize: Object.freeze([4, 9]), requireRemainder: true, itemNoun: "學生", vehicleNoun: "車" }), promptTemplate: "有 {total} 位{itemNoun}，每輛{vehicleNoun}坐 {groupSize} 人，最少需要幾輛{vehicleNoun}？" })
]);

export function listG3BU01RemainderInterpretationTemplates() {
  return G3B_U01_REMAINDER_INTERPRETATION_TEMPLATES.map((template) => ({ ...template, operationModel: { ...template.operationModel }, answerModel: { ...template.answerModel }, unitModel: { ...template.unitModel }, slotModel: { ...template.slotModel } }));
}

export function validateG3BU01RemainderInterpretationTemplates() {
  const errors = [];
  for (const template of G3B_U01_REMAINDER_INTERPRETATION_TEMPLATES) errors.push(...validateG3BU01WordProblemTemplateSpec(template).errors.map((error) => ({ ...error, path: `${template.templateId}.${error.path}` })));
  const counts = new Map();
  for (const template of G3B_U01_REMAINDER_INTERPRETATION_TEMPLATES) counts.set(template.patternSpecId, (counts.get(template.patternSpecId) ?? 0) + 1);
  for (const specId of [floorSpec, ceilSpec]) if (counts.get(specId) !== 2) errors.push({ code: "g3b_u01_wp_remainder_interpretation_template_count_invalid", path: specId });
  return { ok: errors.length === 0, errors, warnings: [] };
}
