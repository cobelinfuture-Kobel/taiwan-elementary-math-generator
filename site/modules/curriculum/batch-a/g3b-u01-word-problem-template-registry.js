import { validateG3BU01WordProblemTemplateSpec } from "./g3b-u01-word-problem-template-contract.js";
import { G3B_U01_PARTITIVE_WORD_PROBLEM_TEMPLATES } from "./g3b-u01-word-problem-partitive-templates.js";
import { G3B_U01_QUOTATIVE_WORD_PROBLEM_TEMPLATES } from "./g3b-u01-word-problem-quotative-templates.js";
import { G3B_U01_REMAINDER_WORD_PROBLEM_TEMPLATES } from "./g3b-u01-word-problem-remainder-templates.js";
import { G3B_U01_REMAINDER_INTERPRETATION_TEMPLATES } from "./g3b-u01-word-problem-remainder-interpretation-templates.js";
import { G3B_U01_TWO_STEP_WORD_PROBLEM_TEMPLATES } from "./g3b-u01-word-problem-two-step-templates.js";

export const G3B_U01_WORD_PROBLEM_TEMPLATE_LIBRARY = Object.freeze([
  ...G3B_U01_PARTITIVE_WORD_PROBLEM_TEMPLATES,
  ...G3B_U01_QUOTATIVE_WORD_PROBLEM_TEMPLATES,
  ...G3B_U01_REMAINDER_WORD_PROBLEM_TEMPLATES,
  ...G3B_U01_REMAINDER_INTERPRETATION_TEMPLATES,
  ...G3B_U01_TWO_STEP_WORD_PROBLEM_TEMPLATES
]);

export function listG3BU01WordProblemTemplates(options = {}) {
  return G3B_U01_WORD_PROBLEM_TEMPLATE_LIBRARY.filter((template) => !options.patternSpecId || template.patternSpecId === options.patternSpecId).map((template) => ({ ...template, operationModel: { ...template.operationModel }, answerModel: { ...template.answerModel }, unitModel: { ...template.unitModel }, slotModel: { ...template.slotModel } }));
}

export function getG3BU01WordProblemTemplate(templateId) {
  return listG3BU01WordProblemTemplates().find((template) => template.templateId === templateId) ?? null;
}

export function validateG3BU01WordProblemTemplateLibrary() {
  const errors = [];
  const ids = new Set();
  for (const template of G3B_U01_WORD_PROBLEM_TEMPLATE_LIBRARY) {
    if (ids.has(template.templateId)) errors.push({ code: "g3b_u01_wp_template_duplicate", path: template.templateId });
    ids.add(template.templateId);
    errors.push(...validateG3BU01WordProblemTemplateSpec(template).errors.map((error) => ({ ...error, path: `${template.templateId}.${error.path}` })));
  }
  if (G3B_U01_WORD_PROBLEM_TEMPLATE_LIBRARY.length !== 20) errors.push({ code: "g3b_u01_wp_template_library_count_invalid", path: "templateLibrary" });
  return { ok: errors.length === 0, errors, warnings: [] };
}
