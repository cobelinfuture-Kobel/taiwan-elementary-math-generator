import fs from "node:fs";

const files = {
  binding: "src/curriculum/g5a-u02/class-c-hidden-projection-binding.js",
  display: "src/curriculum/g5a-u02/question-display-model.js",
  renderer: "site/modules/renderer/g5a-u02-s101-public-renderer.js",
};

function patch(path, replacements) {
  let text = fs.readFileSync(path, "utf8");
  for (const [needle, replacement] of replacements) {
    if (text.includes(replacement)) continue;
    if (!text.includes(needle)) throw new Error(`S107_INTEGRATION_NEEDLE_MISSING:${path}`);
    text = text.replace(needle, replacement);
  }
  fs.writeFileSync(path, text);
}

patch(files.binding, [
  [
    '} from "./s106-factor-structure-runtime.js";\n',
    '} from "./s106-factor-structure-runtime.js";\nimport {\n  expectedG5AU02S107Answer,\n  generateG5AU02S107Pattern,\n  isG5AU02S107Pattern,\n  validateG5AU02S107Pattern,\n} from "./s107-selection-symbolic-common-runtime.js";\n',
  ],
  [
    'function s106AnswerMismatchCode(patternSpecId) {\n  if (patternSpecId === "ps_g5a_u02_factor_pair_enumeration") return "G5AU02_P1_FACTOR_PAIR_PRODUCT_MISMATCH";\n  if (patternSpecId === "ps_g5a_u02_factor_order_and_symmetry") return "G5AU02_P1_U_RECORD_LINK_MISMATCH";\n  return "G5AU02_P1_MISSING_FACTOR_NOT_UNIQUE";\n}\n',
    'function s106AnswerMismatchCode(patternSpecId) {\n  if (patternSpecId === "ps_g5a_u02_factor_pair_enumeration") return "G5AU02_P1_FACTOR_PAIR_PRODUCT_MISMATCH";\n  if (patternSpecId === "ps_g5a_u02_factor_order_and_symmetry") return "G5AU02_P1_U_RECORD_LINK_MISMATCH";\n  return "G5AU02_P1_MISSING_FACTOR_NOT_UNIQUE";\n}\n\nfunction s107AnswerMismatchCode(patternSpecId) {\n  if (patternSpecId === "ps_g5a_u02_divisor_candidate_selection") return "G5AU02_P1_CANDIDATE_DIVISIBILITY_MISMATCH";\n  if (patternSpecId === "ps_g5a_u02_complete_factor_list_unknown_values") return "G5AU02_P1_SYMBOLIC_SOLUTION_NOT_UNIQUE";\n  return "G5AU02_P1_COMMON_FACTOR_MARKING_MISMATCH";\n}\n',
  ],
  [
    'function validateSpecialBase(item, isPattern, errors) {',
    'function generateS107ClassC(patternSpecId, options = {}) {\n  const seed = options.seed ?? 1;\n  return makeSpecialClassCItem(\n    patternSpecId,\n    options,\n    generateG5AU02S107Pattern(patternSpecId, createRng(seed)),\n    "p1SelectionSymbolicCommonParity",\n    "G5AU02-S107_P1CandidateSymbolicRelationAndCommonFactorMarkingFullFix",\n    "candidate_symbolic_common_marking_runtime",\n  );\n}\n\nfunction validateSpecialBase(item, isPattern, errors) {',
  ],
  [
    'export function getG5AU02BoundClassCSpecs() {',
    'function validateS107ClassC(item) {\n  const errors = [];\n  validateSpecialBase(item, isG5AU02S107Pattern, errors);\n  if (errors.length === 0) {\n    errors.push(...validateG5AU02S107Pattern(item).errors);\n    try {\n      if (JSON.stringify(item.answer) !== JSON.stringify(expectedG5AU02S107Answer(item))) errors.push(s107AnswerMismatchCode(item.patternSpecId));\n    } catch {\n      errors.push("G5AU02_ANSWER_SCHEMA_MISMATCH");\n    }\n  }\n  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze([...new Set(errors)]) });\n}\n\nexport function getG5AU02BoundClassCSpecs() {',
  ],
  [
    'function generateRuntimeItem(patternSpecId, options) {\n  if (isG5AU02S106Pattern(patternSpecId)) return generateS106ClassC(patternSpecId, options);',
    'function generateRuntimeItem(patternSpecId, options) {\n  if (isG5AU02S107Pattern(patternSpecId)) return generateS107ClassC(patternSpecId, options);\n  if (isG5AU02S106Pattern(patternSpecId)) return generateS106ClassC(patternSpecId, options);',
  ],
  [
    'function validateRuntimeItem(item) {\n  if (isG5AU02S106Pattern(item?.patternSpecId)) return validateS106ClassC(item);',
    'function validateRuntimeItem(item) {\n  if (isG5AU02S107Pattern(item?.patternSpecId)) return validateS107ClassC(item);\n  if (isG5AU02S106Pattern(item?.patternSpecId)) return validateS106ClassC(item);',
  ],
]);

patch(files.display, [
  [
    '} from "./s106-question-display.js";\n',
    '} from "./s106-question-display.js";\nimport { isG5AU02S107Pattern } from "./s107-selection-symbolic-common-runtime.js";\nimport {\n  buildG5AU02S107QuestionDisplayModel,\n  isG5AU02S107DisplayModel,\n  serializeG5AU02S107QuestionDisplayModel,\n  validateG5AU02S107QuestionDisplayModel,\n} from "./s107-question-display.js";\n',
  ],
  [
    '    || isG5AU02S106Pattern(patternSpecId);',
    '    || isG5AU02S106Pattern(patternSpecId)\n    || isG5AU02S107Pattern(patternSpecId);',
  ],
  [
    '  if (isG5AU02S106Pattern(item.patternSpecId)) return buildG5AU02S106QuestionDisplayModel(item);',
    '  if (isG5AU02S107Pattern(item.patternSpecId)) return buildG5AU02S107QuestionDisplayModel(item);\n  if (isG5AU02S106Pattern(item.patternSpecId)) return buildG5AU02S106QuestionDisplayModel(item);',
  ],
  [
    '  if (isG5AU02S106DisplayModel(model)) return serializeG5AU02S106QuestionDisplayModel(model);',
    '  if (isG5AU02S107DisplayModel(model)) return serializeG5AU02S107QuestionDisplayModel(model);\n  if (isG5AU02S106DisplayModel(model)) return serializeG5AU02S106QuestionDisplayModel(model);',
  ],
  [
    '  if (isG5AU02S106Pattern(item?.patternSpecId)) return validateG5AU02S106QuestionDisplayModel(item, model, promptText);',
    '  if (isG5AU02S107Pattern(item?.patternSpecId)) return validateG5AU02S107QuestionDisplayModel(item, model, promptText);\n  if (isG5AU02S106Pattern(item?.patternSpecId)) return validateG5AU02S106QuestionDisplayModel(item, model, promptText);',
  ],
]);

patch(files.renderer, [
  [
    '} from "./g5a-u02-s106-public-representation.js";\n',
    '} from "./g5a-u02-s106-public-representation.js";\nimport {\n  G5A_U02_S107_RENDER_KINDS,\n  G5A_U02_S107_STYLE,\n  isG5AU02S107RenderKind,\n  renderG5AU02S107Representation,\n} from "./g5a-u02-s107-public-representation.js";\nimport { compactG5AU02S107Prompt } from "../../../src/curriculum/g5a-u02/s107-question-display.js";\n',
  ],
  [
    'const S106_KINDS = new Set(G5A_U02_S106_RENDER_KINDS);',
    'const S106_KINDS = new Set(G5A_U02_S106_RENDER_KINDS);\nconst S107_KINDS = new Set(G5A_U02_S107_RENDER_KINDS);',
  ],
  [
    '  ...S106_KINDS,\n  ...PUBLIC_SYMBOL_KINDS,',
    '  ...S106_KINDS,\n  ...S107_KINDS,\n  ...PUBLIC_SYMBOL_KINDS,',
  ],
  [
    '  if (isG5AU02S106RenderKind(model.kind)) return renderG5AU02S106Representation(model, escapeHtml);',
    '  if (isG5AU02S107RenderKind(model.kind)) return renderG5AU02S107Representation(model, escapeHtml);\n  if (isG5AU02S106RenderKind(model.kind)) return renderG5AU02S106Representation(model, escapeHtml);',
  ],
  [
    '  const s106Prompt = compactG5AU02S106Prompt(model);\n  if (s106Prompt) return s106Prompt;',
    '  const s107Prompt = compactG5AU02S107Prompt(model);\n  if (s107Prompt) return s107Prompt;\n  const s106Prompt = compactG5AU02S106Prompt(model);\n  if (s106Prompt) return s106Prompt;',
  ],
  [
    '  G5A_U02_S106_STYLE,',
    '  G5A_U02_S106_STYLE,\n  G5A_U02_S107_STYLE,',
  ],
]);

console.log(JSON.stringify({ task: "G5AU02-S107", patchedFiles: Object.values(files) }, null, 2));
