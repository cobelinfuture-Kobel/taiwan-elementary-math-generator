import { validateG3BU01WordProblemTemplateSpec } from "./g3b-u01-word-problem-template-contract.js";

export const G3B_U01_PARTITIVE_WORD_PROBLEM_TEMPLATES = Object.freeze([
  Object.freeze({
    templateId: "tpl_g3b_u01_partitive_money_people",
    patternSpecId: "ps_g3b_u01_wp_partitive_equal_sharing",
    semanticModel: "partitive_division_equal_sharing",
    operationModel: Object.freeze({ kind: "division", expression: "total / groupCount", dividendSlot: "total", divisorSlot: "groupCount" }),
    answerModel: Object.freeze({ shape: "single_integer", unitRole: "answerUnit" }),
    unitModel: Object.freeze({ totalUnit: "元", groupUnit: "人", answerUnit: "元" }),
    slotModel: Object.freeze({ total: Object.freeze([24, 96]), groupCount: Object.freeze([2, 8]), requireExactQuotient: true, itemNoun: "錢" }),
    promptTemplate: "把 {total}{totalUnit}平均分給 {groupCount} 個人，每人分到幾{answerUnit}？"
  }),
  Object.freeze({
    templateId: "tpl_g3b_u01_partitive_candy_children",
    patternSpecId: "ps_g3b_u01_wp_partitive_equal_sharing",
    semanticModel: "partitive_division_equal_sharing",
    operationModel: Object.freeze({ kind: "division", expression: "total / groupCount", dividendSlot: "total", divisorSlot: "groupCount" }),
    answerModel: Object.freeze({ shape: "single_integer", unitRole: "answerUnit" }),
    unitModel: Object.freeze({ totalUnit: "顆", groupUnit: "人", answerUnit: "顆" }),
    slotModel: Object.freeze({ total: Object.freeze([24, 96]), groupCount: Object.freeze([2, 8]), requireExactQuotient: true, itemNoun: "糖果" }),
    promptTemplate: "有 {total}{totalUnit}{itemNoun}，平均分給 {groupCount} 個小朋友，每人可以分到幾{answerUnit}？"
  }),
  Object.freeze({
    templateId: "tpl_g3b_u01_partitive_sausage_unit_price",
    patternSpecId: "ps_g3b_u01_wp_partitive_unit_rate",
    semanticModel: "partitive_division_unit_rate",
    operationModel: Object.freeze({ kind: "division", expression: "totalCost / itemCount", dividendSlot: "totalCost", divisorSlot: "itemCount" }),
    answerModel: Object.freeze({ shape: "single_integer", unitRole: "answerUnit" }),
    unitModel: Object.freeze({ totalUnit: "元", itemUnit: "條", answerUnit: "元" }),
    slotModel: Object.freeze({ totalCost: Object.freeze([30, 240]), itemCount: Object.freeze([2, 8]), requireExactQuotient: true, itemNoun: "香腸" }),
    promptTemplate: "買 {itemCount} {itemUnit}{itemNoun}花了 {totalCost}{totalUnit}，1 {itemUnit}{itemNoun}買幾{answerUnit}？"
  }),
  Object.freeze({
    templateId: "tpl_g3b_u01_partitive_ticket_unit_price",
    patternSpecId: "ps_g3b_u01_wp_partitive_unit_rate",
    semanticModel: "partitive_division_unit_rate",
    operationModel: Object.freeze({ kind: "division", expression: "totalCost / itemCount", dividendSlot: "totalCost", divisorSlot: "itemCount" }),
    answerModel: Object.freeze({ shape: "single_integer", unitRole: "answerUnit" }),
    unitModel: Object.freeze({ totalUnit: "元", itemUnit: "張", answerUnit: "元" }),
    slotModel: Object.freeze({ totalCost: Object.freeze([40, 360]), itemCount: Object.freeze([2, 9]), requireExactQuotient: true, itemNoun: "票" }),
    promptTemplate: "買 {itemCount} {itemUnit}{itemNoun}共花 {totalCost}{totalUnit}，1 {itemUnit}{itemNoun}是幾{answerUnit}？"
  })
]);

export function listG3BU01PartitiveWordProblemTemplates() {
  return G3B_U01_PARTITIVE_WORD_PROBLEM_TEMPLATES.map((template) => ({
    ...template,
    operationModel: { ...template.operationModel },
    answerModel: { ...template.answerModel },
    unitModel: { ...template.unitModel },
    slotModel: { ...template.slotModel }
  }));
}

export function validateG3BU01PartitiveWordProblemTemplates() {
  const errors = [];
  for (const template of G3B_U01_PARTITIVE_WORD_PROBLEM_TEMPLATES) {
    const result = validateG3BU01WordProblemTemplateSpec(template);
    errors.push(...result.errors.map((error) => ({ ...error, path: `${template.templateId}.${error.path}` })));
  }
  const bySpec = new Map();
  for (const template of G3B_U01_PARTITIVE_WORD_PROBLEM_TEMPLATES) {
    bySpec.set(template.patternSpecId, (bySpec.get(template.patternSpecId) ?? 0) + 1);
  }
  for (const specId of ["ps_g3b_u01_wp_partitive_equal_sharing", "ps_g3b_u01_wp_partitive_unit_rate"]) {
    if (bySpec.get(specId) !== 2) errors.push({ code: "g3b_u01_wp_partitive_template_count_invalid", path: specId, message: "Each partitive PatternSpec must have exactly 2 first-pass templates" });
  }
  return { ok: errors.length === 0, errors, warnings: [] };
}
