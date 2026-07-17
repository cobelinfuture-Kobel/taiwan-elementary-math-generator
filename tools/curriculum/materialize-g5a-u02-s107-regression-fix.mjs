import fs from "node:fs";

function patch(path, changes) {
  let text = fs.readFileSync(path, "utf8");
  for (const [before, after] of changes) {
    if (text.includes(after)) continue;
    if (!text.includes(before)) throw new Error(`S107_REGRESSION_NEEDLE_MISSING:${path}`);
    text = text.replace(before, after);
  }
  fs.writeFileSync(path, text);
}

patch("site/modules/renderer/g5a-u02-s101-public-renderer.js", [
  [
    '  G5A_U02_S106_STYLE,\n  G5A_U02_S107_STYLE,\n  isG5AU02S106RenderKind,',
    '  G5A_U02_S106_STYLE,\n  isG5AU02S106RenderKind,',
  ],
  [
    'import {\n  G5A_U02_S107_RENDER_KINDS,\n  G5A_U02_S107_STYLE,\n  isG5AU02S107RenderKind,\n  renderG5AU02S107Representation,\n} from "./g5a-u02-s107-public-representation.js";\nimport { compactG5AU02S107Prompt } from "../../../src/curriculum/g5a-u02/s107-question-display.js";',
    'import {\n  compactG5AU02S107Prompt,\n  G5A_U02_S107_RENDER_KINDS,\n  G5A_U02_S107_STYLE,\n  isG5AU02S107RenderKind,\n  renderG5AU02S107Representation,\n} from "./g5a-u02-s107-public-representation.js";',
  ],
  [
    "  '.g5a-u02-semantic-note{font-size:.56rem;line-height:1.08;}',\n  G5A_U02_S106_STYLE,\n  '.g5a-u02-semantic-answer",
    "  '.g5a-u02-semantic-note{font-size:.56rem;line-height:1.08;}',\n  G5A_U02_S106_STYLE,\n  G5A_U02_S107_STYLE,\n  '.g5a-u02-semantic-answer",
  ],
]);

patch("tests/curriculum/g5a-u02-s97-source-parity-prompt-completeness.test.js", [
  [
    '    case "ps_g5a_u02_divisor_candidate_selection":\n      assert.equal(model.kind, "candidate_selection");\n      assert.match(record.prompt, /候選數：/);\n      for (const candidate of model.candidates) assert.ok(record.prompt.includes(String(candidate)));\n      break;',
    '    case "ps_g5a_u02_divisor_candidate_selection":\n      assert.equal(model.kind, "candidate_circle_selection_row");\n      assert.equal(model.selectionRole, "factor");\n      assert.match(record.prompt, /因數圈起來/);\n      assert.match(record.prompt, /候選數：/);\n      for (const candidate of model.candidates) {\n        assert.equal(candidate.markAffordance, "circle_blank");\n        assert.ok(record.prompt.includes(candidate.text));\n      }\n      break;',
  ],
  [
    '    case "ps_g5a_u02_complete_factor_list_unknown_values":\n      assert.equal(model.kind, "symbolic_complete_factor_sequence");\n      assert.match(record.prompt, /最後一個數就是原數/);\n      assert.ok(model.sequence.some((entry) => entry.role === "unknown"));\n      for (const entry of model.sequence) assert.ok(record.prompt.includes(entry.text));\n      break;',
    '    case "ps_g5a_u02_complete_factor_list_unknown_values":\n      assert.equal(model.kind, "symbolic_complete_factor_relation_table");\n      assert.equal(model.publicSymbolPolicy, "traditional_chinese_ordered_symbols");\n      assert.equal(model.solutionCount, 1);\n      assert.match(record.prompt, /完整因數表/);\n      assert.match(record.prompt, /配對關係/);\n      assert.ok(model.sequence.some((entry) => entry.role === "unknown"));\n      for (const entry of model.sequence) assert.ok(record.prompt.includes(entry.text));\n      for (const relation of model.relationRows) {\n        assert.ok(record.prompt.includes(relation.text));\n        assert.ok(record.prompt.includes(relation.responseText));\n      }\n      break;',
  ],
  [
    '    case "ps_g5a_u02_common_factor_concept_identification":\n      assert.equal(model.kind, "candidate_selection");\n      assert.equal(model.selectionRole, "common_factor");\n      assert.match(record.prompt, /所有公因數/);\n      assert.match(record.prompt, /候選數：/);\n      for (const candidate of model.candidates) assert.ok(record.prompt.includes(String(candidate)));\n      break;',
    '    case "ps_g5a_u02_common_factor_concept_identification":\n      assert.equal(model.kind, "marked_common_factor_row");\n      assert.match(record.prompt, /公因數全部圈起來/);\n      assert.match(record.prompt, /候選數：/);\n      for (const candidate of model.candidates) {\n        assert.equal(candidate.markAffordance, "circle_blank");\n        assert.ok(record.prompt.includes(candidate.text));\n      }\n      assert.deepEqual(model.rolePrompts.map((row) => row.label), ["最小公因數", "最大公因數"]);\n      break;',
  ],
]);

patch("tests/curriculum/g5a-u02-s97-legacy-unknown-key-normalization.test.js", [[
  'test("S97 normalizes duplicate legacy unknown keys without changing the canonical answer", () => {\n  let witnessed = null;\n  for (let seed = 1; seed <= 1000; seed += 1) {\n    const item = generateG5AU02Canonical(PATTERN_ID, { seed });\n    if (new Set(item.data.unknownKeys).size !== item.data.unknownKeys.length) {\n      witnessed = item;\n      break;\n    }\n  }\n  assert.ok(witnessed, "expected to witness the legacy duplicate-key edge case");\n\n  const normalized = normalizeG5AU02SemanticDisplayItem(witnessed);\n  assert.equal(new Set(normalized.data.unknownKeys).size, normalized.data.unknownKeys.length);\n  assert.deepEqual(normalized.answer, witnessed.answer);\n  assert.equal(normalized.semanticNormalization.code, "G5AU02_DUPLICATE_UNKNOWN_KEY_NORMALIZED");\n});',
  'test("S97 normalizes a synthetic legacy duplicate unknown-key record without changing its canonical answer", () => {\n  const canonical = generateG5AU02Canonical(PATTERN_ID, { seed: 97 });\n  assert.equal(new Set(canonical.data.unknownKeys).size, canonical.data.unknownKeys.length);\n  const legacy = JSON.parse(JSON.stringify(canonical));\n  legacy.data.unknownKeys = [canonical.data.unknownKeys[0], canonical.data.unknownKeys[0], canonical.data.unknownKeys[1]];\n\n  const normalized = normalizeG5AU02SemanticDisplayItem(legacy);\n  assert.deepEqual(normalized.data.unknownKeys, canonical.data.unknownKeys);\n  assert.deepEqual(normalized.answer, canonical.answer);\n  assert.equal(normalized.semanticNormalization.code, "G5AU02_DUPLICATE_UNKNOWN_KEY_NORMALIZED");\n});',
]]);

console.log(JSON.stringify({ task: "G5AU02-S107-regression-fix", status: "materialized" }));
