import { validateG3BU01WordProblemTemplateSpec } from "./g3b-u01-word-problem-template-contract.js";

export const G3B_U01_QUOTATIVE_WORD_PROBLEM_TEMPLATES = Object.freeze([
  Object.freeze({
    templateId: "tpl_g3b_u01_quotative_apple_plate_exact",
    patternSpecId: "ps_g3b_u01_wp_quotative_packaging_exact",
    semanticModel: "quotative_division_packaging_exact",
    operationModel: Object.freeze({ kind: "division", expression: "total / groupSize", dividendSlot: "total", divisorSlot: "groupSize" }),
    answerModel: Object.freeze({ shape: "single_integer", unitRole: "groupUnit" }),
    unitModel: Object.freeze({ totalUnit: "個", groupSizeUnit: "個", groupUnit: "盤", answerUnit: "盤" }),
    slotModel: Object.freeze({ total: Object.freeze([24, 96]), groupSize: Object.freeze([2, 8]), requireExactQuotient: true, itemNoun: "蘋果", groupNoun: "盤" }),
    promptTemplate: "有 {total} 個{itemNoun}，每 {groupSize} 個裝 1 {groupNoun}，可以分裝幾{answerUnit}？"
  }),
  Object.freeze({
    templateId: "tpl_g3b_u01_quotative_flower_bundle_exact",
    patternSpecId: "ps_g3b_u01_wp_quotative_packaging_exact",
    semanticModel: "quotative_division_packaging_exact",
    operationModel: Object.freeze({ kind: "division", expression: "total / groupSize", dividendSlot: "total", divisorSlot: "groupSize" }),
    answerModel: Object.freeze({ shape: "single_integer", unitRole: "groupUnit" }),
    unitModel: Object.freeze({ totalUnit: "朵", groupSizeUnit: "朵", groupUnit: "束", answerUnit: "束" }),
    slotModel: Object.freeze({ total: Object.freeze([24, 120]), groupSize: Object.freeze([3, 9]), requireExactQuotient: true, itemNoun: "花", groupNoun: "束" }),
    promptTemplate: "有 {total} 朵{itemNoun}，每 {groupSize} 朵綁成 1 {groupNoun}，可以綁成幾{answerUnit}？"
  }),
  Object.freeze({
    templateId: "tpl_g3b_u01_quotative_students_team_exact",
    patternSpecId: "ps_g3b_u01_wp_quotative_grouping_exact",
    semanticModel: "quotative_division_grouping_exact",
    operationModel: Object.freeze({ kind: "division", expression: "total / groupSize", dividendSlot: "total", divisorSlot: "groupSize" }),
    answerModel: Object.freeze({ shape: "single_integer", unitRole: "groupUnit" }),
    unitModel: Object.freeze({ totalUnit: "人", groupSizeUnit: "人", groupUnit: "組", answerUnit: "組" }),
    slotModel: Object.freeze({ total: Object.freeze([24, 96]), groupSize: Object.freeze([2, 8]), requireExactQuotient: true, itemNoun: "學生", groupNoun: "組" }),
    promptTemplate: "有 {total} 位{itemNoun}，每 {groupSize} 人分成 1 {groupNoun}，可以分成幾{answerUnit}？"
  }),
  Object.freeze({
    templateId: "tpl_g3b_u01_quotative_books_stack_exact",
    patternSpecId: "ps_g3b_u01_wp_quotative_grouping_exact",
    semanticModel: "quotative_division_grouping_exact",
    operationModel: Object.freeze({ kind: "division", expression: "total / groupSize", dividendSlot: "total", divisorSlot: "groupSize" }),
    answerModel: Object.freeze({ shape: "single_integer", unitRole: "groupUnit" }),
    unitModel: Object.freeze({ totalUnit: "本", groupSizeUnit: "本", groupUnit: "堆", answerUnit: "堆" }),
    slotModel: Object.freeze({ total: Object.freeze([24, 120]), groupSize: Object.freeze([3, 9]), requireExactQuotient: true, itemNoun: "書", groupNoun: "堆" }),
    promptTemplate: "有 {total} 本{itemNoun}，每 {groupSize} 本放成 1 {groupNoun}，可以放成幾{answerUnit}？"
  })
]);

export function listG3BU01QuotativeWordProblemTemplates() {
  return G3B_U01_QUOTATIVE_WORD_PROBLEM_TEMPLATES.map((template) => ({
    ...template,
    operationModel: { ...template.operationModel },
    answerModel: { ...template.answerModel },
    unitModel: { ...template.unitModel },
    slotModel: { ...template.slotModel }
  }));
}

export function validateG3BU01QuotativeWordProblemTemplates() {
  const errors = [];
  for (const template of G3B_U01_QUOTATIVE_WORD_PROBLEM_TEMPLATES) {
    const result = validateG3BU01WordProblemTemplateSpec(template);
    errors.push(...result.errors.map((error) => ({ ...error, path: `${template.templateId}.${error.path}` })));
  }
  const bySpec = new Map();
  for (const template of G3B_U01_QUOTATIVE_WORD_PROBLEM_TEMPLATES) {
    bySpec.set(template.patternSpecId, (bySpec.get(template.patternSpecId) ?? 0) + 1);
  }
  for (const specId of ["ps_g3b_u01_wp_quotative_packaging_exact", "ps_g3b_u01_wp_quotative_grouping_exact"]) {
    if (bySpec.get(specId) !== 2) errors.push({ code: "g3b_u01_wp_quotative_template_count_invalid", path: specId, message: "Each quotative PatternSpec must have exactly 2 first-pass templates" });
  }
  return { ok: errors.length === 0, errors, warnings: [] };
}
