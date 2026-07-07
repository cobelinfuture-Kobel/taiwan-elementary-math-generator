import { validateG3BU01WordProblemTemplateSpec } from "./g3b-u01-word-problem-template-contract.js";

const q = "ps_g3b_u01_wp_remainder_packaging_leftover";
const c = "ps_g3b_u01_wp_remainder_calendar_weeks_days";

export const G3B_U01_REMAINDER_WORD_PROBLEM_TEMPLATES = Object.freeze([
  Object.freeze({ templateId: "tpl_g3b_u01_remainder_fish_pack_leftover", patternSpecId: q, semanticModel: "remainder_quotient_and_leftover", operationModel: Object.freeze({ kind: "quotient_remainder", expression: "total div groupSize, total mod groupSize" }), answerModel: Object.freeze({ shape: "quotient_remainder", quotientUnitRole: "groupUnit", remainderUnitRole: "totalUnit" }), unitModel: Object.freeze({ totalUnit: "隻", groupUnit: "包", quotientUnit: "包", remainderUnit: "隻" }), slotModel: Object.freeze({ total: Object.freeze([35, 99]), groupSize: Object.freeze([2, 9]), requireRemainder: true, itemNoun: "飛魚乾" }), promptTemplate: "有 {total} 隻{itemNoun}，每 {groupSize} 隻裝 1 包，可以裝成幾包？還剩下幾隻？" }),
  Object.freeze({ templateId: "tpl_g3b_u01_remainder_candy_bag_leftover", patternSpecId: q, semanticModel: "remainder_quotient_and_leftover", operationModel: Object.freeze({ kind: "quotient_remainder", expression: "total div groupSize, total mod groupSize" }), answerModel: Object.freeze({ shape: "quotient_remainder", quotientUnitRole: "groupUnit", remainderUnitRole: "totalUnit" }), unitModel: Object.freeze({ totalUnit: "顆", groupUnit: "袋", quotientUnit: "袋", remainderUnit: "顆" }), slotModel: Object.freeze({ total: Object.freeze([35, 99]), groupSize: Object.freeze([2, 9]), requireRemainder: true, itemNoun: "糖果" }), promptTemplate: "有 {total} 顆{itemNoun}，每 {groupSize} 顆裝 1 袋，可以裝成幾袋？還剩幾顆？" }),
  Object.freeze({ templateId: "tpl_g3b_u01_remainder_calendar_year_weeks", patternSpecId: c, semanticModel: "remainder_calendar_weeks_days", operationModel: Object.freeze({ kind: "quotient_remainder", expression: "days div 7, days mod 7" }), answerModel: Object.freeze({ shape: "quotient_remainder", quotientUnitRole: "weekUnit", remainderUnitRole: "dayUnit" }), unitModel: Object.freeze({ totalUnit: "天", weekUnit: "週", dayUnit: "天", quotientUnit: "週", remainderUnit: "天" }), slotModel: Object.freeze({ days: Object.freeze([180, 365]), divisor: 7, requireRemainder: true, contextNoun: "平年" }), promptTemplate: "{contextNoun}有 {days} 天，是幾週又幾天？" }),
  Object.freeze({ templateId: "tpl_g3b_u01_remainder_trip_days_weeks", patternSpecId: c, semanticModel: "remainder_calendar_weeks_days", operationModel: Object.freeze({ kind: "quotient_remainder", expression: "days div 7, days mod 7" }), answerModel: Object.freeze({ shape: "quotient_remainder", quotientUnitRole: "weekUnit", remainderUnitRole: "dayUnit" }), unitModel: Object.freeze({ totalUnit: "天", weekUnit: "週", dayUnit: "天", quotientUnit: "週", remainderUnit: "天" }), slotModel: Object.freeze({ days: Object.freeze([30, 180]), divisor: 7, requireRemainder: true, contextNoun: "旅行" }), promptTemplate: "這次{contextNoun}共 {days} 天，是幾週又幾天？" })
]);

export function listG3BU01RemainderWordProblemTemplates() {
  return G3B_U01_REMAINDER_WORD_PROBLEM_TEMPLATES.map((template) => ({ ...template, operationModel: { ...template.operationModel }, answerModel: { ...template.answerModel }, unitModel: { ...template.unitModel }, slotModel: { ...template.slotModel } }));
}

export function validateG3BU01RemainderWordProblemTemplates() {
  const errors = [];
  for (const template of G3B_U01_REMAINDER_WORD_PROBLEM_TEMPLATES) errors.push(...validateG3BU01WordProblemTemplateSpec(template).errors.map((error) => ({ ...error, path: `${template.templateId}.${error.path}` })));
  const counts = new Map();
  for (const template of G3B_U01_REMAINDER_WORD_PROBLEM_TEMPLATES) counts.set(template.patternSpecId, (counts.get(template.patternSpecId) ?? 0) + 1);
  for (const specId of [q, c]) if (counts.get(specId) !== 2) errors.push({ code: "g3b_u01_wp_remainder_template_count_invalid", path: specId });
  return { ok: errors.length === 0, errors, warnings: [] };
}
