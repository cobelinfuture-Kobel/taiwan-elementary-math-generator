import { readFileSync, writeFileSync } from "node:fs";

function replaceExactly(path, oldText, newText) {
  let text = readFileSync(path, "utf8");
  const count = text.split(oldText).length - 1;
  if (count !== 1) throw new Error(`${path}: expected replacement count 1, got ${count}`);
  text = text.replace(oldText, newText);
  writeFileSync(path, text, "utf8");
}

const generator = "site/modules/curriculum/batch-a/g3b-u08-semantic-generator.js";
replaceExactly(
  generator,
  '    return `兩種${item}組合價格相同。甲有${values.a}${containerUnit}，每${containerUnit}${values.b}${capacityUnit}；乙有${values.c}${containerUnit}，每${containerUnit}${values.d}${capacityUnit}。哪一種總容量較多？`;',
  '    return `兩種${item}組合價格相同。甲有${values.a}${containerUnit}，每${containerUnit}${values.b}${capacityUnit}；乙有${values.c}${containerUnit}，每${containerUnit}${values.d}${capacityUnit}。哪一種總容量較多，也就是哪一種比較划算？`;'
);
replaceExactly(
  generator,
  `  const bindings = { ...scenario.bindings, ...values };
  return spec.promptSkeletonZh.replace(/\\{([^}]+)\\}/g, (_, key) => {
    const value = bindings[key];
    if (value === undefined || value === null || value === "") {
      throw new Error(\`G3B_U08_GEN_PROMPT_PLACEHOLDER_UNRESOLVED:${"${key}"}\`);
    }
    return String(value);
  });`,
  `  const bindings = { ...scenario.bindings, ...values };
  const rendered = spec.promptSkeletonZh.replace(/\\{([^}]+)\\}/g, (_, key) => {
    const value = bindings[key];
    if (value === undefined || value === null || value === "") {
      throw new Error(\`G3B_U08_GEN_PROMPT_PLACEHOLDER_UNRESOLVED:${"${key}"}\`);
    }
    return String(value);
  });
  if (spec.equationShape === "a*b vs c*d") {
    return rendered.replace(/？$/, "，也就是哪一種比較划算？");
  }
  return rendered;`
);
replaceExactly(
  generator,
  '  const conclusionZh = `${winnerLabel}的${dimensionLabel}${comparisonAdjective}（${winningTotal}${unit}）`;',
  '  const conclusionZh = `${winnerLabel}的${dimensionLabel}${comparisonAdjective}，所以${winnerLabel}方案比較划算（${winningTotal}${unit}）`;'
);

const validator = "site/modules/curriculum/batch-a/g3b-u08-semantic-validator.js";
replaceExactly(
  validator,
  `    const expectedWinner = question.optionATotal > question.optionBTotal ? "option_a" : "option_b";
    if (!["option_a", "option_b"].includes(question.winner) || question.winner !== expectedWinner) {
      add(errors, "G3BU08_COMPARISON_NO_UNIQUE_WINNER", 7, "winner", "Comparison must identify exactly one mathematically correct winner.");
    }`,
  `    const expectedWinner = question.optionATotal > question.optionBTotal ? "option_a" : "option_b";
    if (!["option_a", "option_b"].includes(question.winner) || question.winner !== expectedWinner) {
      add(errors, "G3BU08_COMPARISON_NO_UNIQUE_WINNER", 7, "winner", "Comparison must identify exactly one mathematically correct winner.");
    }
    if (!/比較划算/.test(question.promptText ?? "") || !/比較划算/.test(question.conclusionZh ?? "")) {
      add(errors, "G3BU08_COMPARISON_NO_UNIQUE_WINNER", 7, "conclusionZh", "The prompt and conclusion must connect the larger same-price total to the better-value decision.");
    }`
);

const realism = "site/modules/curriculum/batch-a/g3b-u08-semantic-realism-policy.js";
replaceExactly(
  realism,
  `    if (spec.templateFamilyId === "tpl_g3b_u08_same_price_compare_total_length" && !/總長度較長/.test(question.conclusionZh ?? "")) {
      reasons.push("length_conclusion_wording");
    }`,
  `    if (spec.templateFamilyId === "tpl_g3b_u08_same_price_compare_total_length" && !/總長度較長/.test(question.conclusionZh ?? "")) {
      reasons.push("length_conclusion_wording");
    }
    if (!/比較划算/.test(question.promptText ?? "") || !/比較划算/.test(question.conclusionZh ?? "")) {
      reasons.push("same_price_value_decision_not_explicit");
    }`
);

const test = "tests/curriculum/g3b-u08-semantic-realism-fullfix.test.js";
replaceExactly(
  test,
  `    assert.equal(question.optionATotal === question.optionBTotal, false);
    assert.equal(Math.max(question.optionATotal, question.optionBTotal) / Math.min(question.optionATotal, question.optionBTotal) <= 2, true);`,
  `    assert.equal(question.optionATotal === question.optionBTotal, false);
    assert.equal(Math.max(question.optionATotal, question.optionBTotal) / Math.min(question.optionATotal, question.optionBTotal) <= 2, true);
    assert.match(question.promptText, /比較划算/);
    assert.match(question.conclusionZh, /比較划算/);`
);
replaceExactly(
  test,
  `    assert.match(question.conclusionZh, /總長度較長/);
    assert.doesNotMatch(question.conclusionZh, /總長度較多/);`,
  `    assert.match(question.conclusionZh, /總長度較長/);
    assert.doesNotMatch(question.conclusionZh, /總長度較多/);
    assert.match(question.promptText, /比較划算/);
    assert.match(question.conclusionZh, /比較划算/);`
);

console.log("S58E value-comparison FullFix patches applied.");
