import { readFileSync, writeFileSync } from "node:fs";

function replaceExactly(path, oldText, newText) {
  let text = readFileSync(path, "utf8");
  const count = text.split(oldText).length - 1;
  if (count !== 1) throw new Error(`${path}: expected replacement count 1, got ${count}`);
  text = text.replace(oldText, newText);
  writeFileSync(path, text, "utf8");
}

const policy = "site/modules/curriculum/batch-a/g3b-u08-semantic-realism-policy.js";
replaceExactly(
  policy,
  '  if (family === "tpl_g3b_u08_total_score_per_success") return range(2, 10);',
  '  if (family === "tpl_g3b_u08_total_score_per_success") return key.endsWith("basketball") ? range(2, 3) : range(2, 10);'
);
replaceExactly(
  policy,
  `  if (family === "tpl_g3b_u08_group_count_score_events") {
    return { divisor: range(2, 10), quotient: range(2, 20) };
  }`,
  `  if (family === "tpl_g3b_u08_group_count_score_events") {
    if (key.endsWith("basketball")) return { divisor: range(2, 3), quotient: range(2, 15) };
    if (key.endsWith("level")) return { divisor: range(2, 10), quotient: range(2, 12) };
    return { divisor: range(2, 10), quotient: range(2, 20) };
  }`
);
replaceExactly(
  policy,
  `    if (key.endsWith("bracelet")) return { divisor: range(5, 9), quotient: range(2, 20) };
    if (key.endsWith("necklace")) return { divisor: range(6, 9), quotient: range(2, 20) };
    return { divisor: range(2, 6), quotient: range(2, 20) };`,
  `    if (key.endsWith("bracelet")) return { divisor: range(5, 9), quotient: range(2, 12) };
    if (key.endsWith("necklace")) return { divisor: range(6, 9), quotient: range(2, 12) };
    return { divisor: range(2, 6), quotient: range(2, 15) };`
);
replaceExactly(
  policy,
  `  if (family === "tpl_g3b_u08_reverse_base_capacity_multiple") {
    return { divisor: range(2, 6), quotient: range(50, 300) };
  }`,
  `  if (family === "tpl_g3b_u08_reverse_base_capacity_multiple") {
    if (key.endsWith("jugs")) return { divisor: range(2, 5), quotient: range(150, 300) };
    if (key.endsWith("juice_bottles")) return { divisor: range(2, 5), quotient: range(100, 250) };
    return { divisor: range(2, 6), quotient: range(50, 200) };
  }`
);
replaceExactly(
  policy,
  '  if (spec.templateFamilyId === "tpl_g3b_u08_same_price_compare_capacity") return range(100, 500);',
  '  if (spec.templateFamilyId === "tpl_g3b_u08_same_price_compare_capacity") return range(150, 400);'
);
replaceExactly(policy, "    if (ratio > 3) continue;", "    if (ratio > 2) continue;");
replaceExactly(policy, "    if (!Number.isFinite(low) || low <= 0 || high / low > 3) reasons.push(\"comparison_excessive_ratio\");", "    if (!Number.isFinite(low) || low <= 0 || high / low > 2) reasons.push(\"comparison_excessive_ratio\");");

const generator = "site/modules/curriculum/batch-a/g3b-u08-semantic-generator.js";
replaceExactly(
  generator,
  `  if (spec.templateFamilyId === "tpl_g3b_u08_same_price_compare_capacity" && scenario.bindings.item) {
    const { item, containerUnit = "瓶", capacityUnit = "毫升" } = scenario.bindings;
    return \`兩種${"${item}"}組合價格相同。甲有${"${values.a}"}${"${containerUnit}"}，每${"${containerUnit}"}${"${values.b}"}${"${capacityUnit}"}；乙有${"${values.c}"}${"${containerUnit}"}，每${"${containerUnit}"}${"${values.d}"}${"${capacityUnit}"}。哪一種總容量較多？\`;
  }
  const bindings = { ...scenario.bindings, ...values };`,
  `  if (spec.templateFamilyId === "tpl_g3b_u08_same_price_compare_capacity" && scenario.bindings.item) {
    const { item, containerUnit = "瓶", capacityUnit = "毫升" } = scenario.bindings;
    return \`兩種${"${item}"}組合價格相同。甲有${"${values.a}"}${"${containerUnit}"}，每${"${containerUnit}"}${"${values.b}"}${"${capacityUnit}"}；乙有${"${values.c}"}${"${containerUnit}"}，每${"${containerUnit}"}${"${values.d}"}${"${capacityUnit}"}。哪一種總容量較多？\`;
  }
  if (spec.templateFamilyId === "tpl_g3b_u08_total_items_per_package") {
    const { packageUnit, itemUnit, item } = scenario.bindings;
    return \`每${"${packageUnit}"}有${"${values.a}"}${"${itemUnit}"}${"${item}"}，共有${"${values.b}"}${"${packageUnit}"}，一共有多少${"${itemUnit}"}${"${item}"}？\`;
  }
  const bindings = { ...scenario.bindings, ...values };`
);

const validator = "site/modules/curriculum/batch-a/g3b-u08-semantic-validator.js";
replaceExactly(
  validator,
  `  if (expectedClassifier && !String(question.finalAnswerWithUnit ?? "").includes(expectedClassifier) && question.knowledgePointId !== COMPARISON_KP) {
    add(errors, "G3BU08_CLASSIFIER_MISMATCH", 6, "finalAnswerWithUnit", "Answer text does not carry the expected classifier or measurement unit.");
  }
  if (/每段剪成/.test(prompt)) {`,
  `  if (expectedClassifier && !String(question.finalAnswerWithUnit ?? "").includes(expectedClassifier) && question.knowledgePointId !== COMPARISON_KP) {
    add(errors, "G3BU08_CLASSIFIER_MISMATCH", 6, "finalAnswerWithUnit", "Answer text does not carry the expected classifier or measurement unit.");
  }
  if (question.templateFamilyId === "tpl_g3b_u08_total_items_per_package" && /每(?:包|盒|袋)([^，]+)有\\d+(?:片|枝|塊)\\1/.test(prompt)) {
    add(errors, "G3BU08_CLASSIFIER_MISMATCH", 6, "promptText", "Package classifier and item noun are duplicated unnaturally.");
  }
  if (/每段剪成/.test(prompt)) {`
);

const test = "tests/curriculum/g3b-u08-semantic-realism-fullfix.test.js";
replaceExactly(test, "<= 3, true);", "<= 2, true);
replaceExactly(
  test,
  `  for (const variant of listG3BU08SemanticContextVariantsForPatternSpec(scoreSpec)) {
    const question = generate(scoreSpec, variant.contextVariantId, \`score:${"${variant.contextVariantId}"}\`);
    assert.equal(question.quantities.a >= 2 && question.quantities.a <= 10, true);
  }`,
  `  for (const variant of listG3BU08SemanticContextVariantsForPatternSpec(scoreSpec)) {
    const question = generate(scoreSpec, variant.contextVariantId, \`score:${"${variant.contextVariantId}"}\`);
    const max = variant.contextVariantId.endsWith("basketball") ? 3 : 10;
    assert.equal(question.quantities.a >= 2 && question.quantities.a <= max, true);
  }`
);

console.log("S58E second human-readback FullFix patches applied.");
