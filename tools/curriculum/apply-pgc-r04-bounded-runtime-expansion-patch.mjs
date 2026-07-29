import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const runtimeDir = path.join(repoRoot, "site/modules/curriculum/batch-a");

function patch(relativePath, transforms) {
  const filePath = path.join(runtimeDir, relativePath);
  let content = fs.readFileSync(filePath, "utf8");
  for (const transform of transforms) {
    if (content.includes(transform.marker)) continue;
    const next = content.replace(transform.pattern, transform.replacement);
    if (next === content) throw new Error(`PGC_R04_BOUNDED_PATCH_ANCHOR_MISSING:${relativePath}:${transform.marker}`);
    content = next;
  }
  fs.writeFileSync(filePath, content);
  return relativePath;
}

const tenthPrompts = [
  "把 1 平分成 10 份，其中 1 份用小數表示是多少？",
  "1 的十分之一用小數表示是多少？",
  "十等份中的 1 份，用小數表示是多少？",
  "0 個一和 1 個 0.1 合起來是多少？",
  "在十分位上放 1，個位放 0，這個小數是多少？",
  "1 個十分之一寫成小數是多少？",
  "哪個小數表示把 1 平分成 10 份後的 1 份？",
  "用小數記下「一個 0.1」的值。",
  "十分位是 1、個位是 0，這個數是多少？",
  "一條線段平均分成 10 段，其中一段占全長多少？請用小數表示。",
  "10 個相同小格合成 1，單獨 1 格的小數值是多少？",
  "0.0 再增加一個十分之一，結果是多少？",
  "在 0 和 1 之間取十分之一的位置，對應的小數是多少？",
  "一個單位量的 1/10 寫成小數是多少？",
  "十進位表中十分位放 1，其餘位放 0，讀成哪個小數？",
  "一個 0.1 不和其他數量合併時，數值是多少？",
  "把十分之一改寫成一位小數。",
  "1 ÷ 10 的商用小數表示是多少？",
  "十個 0.1 可合成 1，其中一個的值是多少？",
  "數線上從 0 到 1 平分十格，第一格表示哪個小數？",
  "0 個整數單位加 1 個十分位單位，結果是多少？",
  "一位小數中，只有十分位數字是 1，這個數是多少？",
  "百分位以後都是 0，十分位為 1，該小數是多少？",
  "將分數 1/10 轉換成小數。",
];

const hundredthPrompts = [
  "把 1 平分成 100 份，其中 1 份用小數表示是多少？",
  "1 的百分之一用小數表示是多少？",
  "一百等份中的 1 份，用小數表示是多少？",
  "0 個一和 1 個 0.01 合起來是多少？",
  "在百分位上放 1，十分位和個位都放 0，這個小數是多少？",
  "1 個百分之一寫成小數是多少？",
  "哪個小數表示把 1 平分成 100 份後的 1 份？",
  "用小數記下「一個 0.01」的值。",
  "百分位是 1，十分位與個位都是 0，這個數是多少？",
  "一個正方形平均分成 100 格，其中一格占全部多少？請用小數表示。",
  "100 個相同小格合成 1，單獨 1 格的小數值是多少？",
  "0.00 再增加一個百分之一，結果是多少？",
  "在 0 和 1 之間取百分之一的位置，對應的小數是多少？",
  "一個單位量的 1/100 寫成小數是多少？",
  "十進位表中百分位放 1，其餘位放 0，讀成哪個小數？",
  "一個 0.01 不和其他數量合併時，數值是多少？",
  "把百分之一改寫成二位小數。",
  "1 ÷ 100 的商用小數表示是多少？",
  "一百個 0.01 可合成 1，其中一個的值是多少？",
  "數線上從 0 到 1 平分一百格，第一格表示哪個小數？",
  "0 個整數單位加 1 個百分位單位，結果是多少？",
  "二位小數中，只有百分位數字是 1，這個數是多少？",
  "千分位以後都是 0，百分位為 1，該小數是多少？",
  "將分數 1/100 轉換成小數。",
];

function arraySource(values) {
  return `const PROMPTS = Object.freeze(${JSON.stringify(values, null, 2)}); // PGC-R04 bounded prompt expansion`;
}

export function applyPgcR04BoundedRuntimeExpansionPatch() {
  const modifiedFiles = [];

  modifiedFiles.push(patch("tenth-decimal-runtime.js", [{
    marker: "PGC-R04 bounded prompt expansion",
    pattern: /const PROMPTS = Object\.freeze\(\[[\s\S]*?\]\);/,
    replacement: arraySource(tenthPrompts),
  }]));

  modifiedFiles.push(patch("hundredth-decimal-runtime.js", [{
    marker: "PGC-R04 bounded prompt expansion",
    pattern: /const PROMPTS = Object\.freeze\(\[[\s\S]*?\]\);/,
    replacement: arraySource(hundredthPrompts),
  }]));

  modifiedFiles.push(patch("equivalent-fraction-runtime.js", [{
    marker: "PGC-R04 equivalent fraction parameter space",
    pattern: /const CASES = Object\.freeze\(\[[\s\S]*?\]\);/,
    replacement: `function gcd(a, b) { let x = Math.abs(a), y = Math.abs(b); while (y) [x, y] = [y, x % y]; return x || 1; }
function buildEquivalentFractionCases() {
  const rows = [];
  for (let denominator = 2; denominator <= 12; denominator += 1) {
    for (let numerator = 1; numerator < denominator; numerator += 1) {
      if (gcd(numerator, denominator) !== 1) continue;
      for (let factor = 2; factor <= 9; factor += 1) {
        const equivalentNumerator = numerator * factor;
        const equivalentDenominator = denominator * factor;
        rows.push({ patternSpecId: FACTOR_SPEC, direction: "expansion", numerator, denominator, factor, equivalentNumerator, equivalentDenominator, promptText: numerator + "/" + denominator + " 和 " + equivalentNumerator + "/" + equivalentDenominator + " 是等值分數，分子和分母同乘幾？" });
        rows.push({ patternSpecId: FACTOR_SPEC, direction: "reduction", numerator: equivalentNumerator, denominator: equivalentDenominator, factor, equivalentNumerator: numerator, equivalentDenominator: denominator, promptText: equivalentNumerator + "/" + equivalentDenominator + " 約成 " + numerator + "/" + denominator + "，分子和分母同除幾？" });
        rows.push({ patternSpecId: NUMERATOR_SPEC, direction: "expansion", numerator, denominator, factor, equivalentNumerator, equivalentDenominator, promptText: numerator + "/" + denominator + " 的分子和分母同乘 " + factor + "，等值分數的分子是多少？" });
        rows.push({ patternSpecId: DENOMINATOR_SPEC, direction: "expansion", numerator, denominator, factor, equivalentNumerator, equivalentDenominator, promptText: numerator + "/" + denominator + " 的分子和分母同乘 " + factor + "，等值分數的分母是多少？" });
      }
    }
  }
  return rows;
}
const CASES = Object.freeze(buildEquivalentFractionCases()); // PGC-R04 equivalent fraction parameter space`,
  }]));

  modifiedFiles.push(patch("same-denominator-fraction-compare-runtime.js", [
    {
      marker: "PGC-R04 same denominator numeric parameter space",
      pattern: /const FIXTURES = Object\.freeze\(\[[\s\S]*?\]\);/,
      replacement: `const APPLICATION_FIXTURES = Object.freeze([
  Object.freeze({ leftNumerator: 2, denominator: 5, rightNumerator: 4, target: "pair", relation: "<" }),
  Object.freeze({ leftNumerator: 3, denominator: 6, rightNumerator: 3, target: "pair", relation: "=" }),
  Object.freeze({ leftNumerator: 5, denominator: 8, rightNumerator: 2, target: "pair", relation: ">" }),
  Object.freeze({ leftNumerator: 4, denominator: 7, rightNumerator: 7, target: "one", relation: "<" }),
  Object.freeze({ leftNumerator: 5, denominator: 5, rightNumerator: 5, target: "one", relation: "=" }),
  Object.freeze({ leftNumerator: 8, denominator: 6, rightNumerator: 6, target: "one", relation: ">" }),
]);
function buildNumericFixtures() {
  const rows = [];
  for (let denominator = 2; denominator <= 20; denominator += 1) {
    for (let leftNumerator = 1; leftNumerator <= denominator + 4; leftNumerator += 1) {
      for (let rightNumerator = 1; rightNumerator <= denominator + 4; rightNumerator += 1) {
        if (leftNumerator === rightNumerator && leftNumerator % 2 === 0) continue;
        rows.push(Object.freeze({ leftNumerator, denominator, rightNumerator, target: "pair", relation: leftNumerator < rightNumerator ? "<" : leftNumerator > rightNumerator ? ">" : "=" }));
      }
      rows.push(Object.freeze({ leftNumerator, denominator, rightNumerator: denominator, target: "one", relation: leftNumerator < denominator ? "<" : leftNumerator > denominator ? ">" : "=" }));
    }
  }
  return rows;
}
const NUMERIC_FIXTURES = Object.freeze(buildNumericFixtures()); // PGC-R04 same denominator numeric parameter space`,
    },
    {
      marker: "function seedOffset(seed, size)",
      pattern: /const seedOffset = \(seed\) => \[\.\.\.String\(seed \?\? "p03f6"\)\]\.reduce\(\(sum, char\) => \(sum \+ char\.charCodeAt\(0\)\) % FIXTURES\.length, 0\);/,
      replacement: `const seedOffset = (seed, size) => [...String(seed ?? "p03f6")].reduce((sum, char) => (sum + char.charCodeAt(0)) % size, 0);`,
    },
    {
      marker: "const fixtures = authority ? APPLICATION_FIXTURES : NUMERIC_FIXTURES",
      pattern: /const fixture = FIXTURES\[\(ordinal \+ seedOffset\(seed\)\) % FIXTURES\.length\];/,
      replacement: `const authority = patternSpecId === G3A_U08_SAME_DENOMINATOR_APPLICATION_SPEC_ID ? P03F6_APPLICATION_AUTHORITY : null;
  const fixtures = authority ? APPLICATION_FIXTURES : NUMERIC_FIXTURES;
  const fixture = fixtures[(ordinal + seedOffset(seed, fixtures.length)) % fixtures.length];`,
    },
    {
      marker: "const leftText =",
      pattern: /  const authority = patternSpecId === G3A_U08_SAME_DENOMINATOR_APPLICATION_SPEC_ID \? P03F6_APPLICATION_AUTHORITY : null;\n  const leftText =/,
      replacement: `  const leftText =`,
    },
  ]));

  modifiedFiles.push(patch("discrete-fraction-conversion-runtime.js", [
    {
      marker: "PGC-R04 discrete conversion numeric parameter space",
      pattern: /const FIXTURES = Object\.freeze\(\[[\s\S]*?\]\);/,
      replacement: `const APPLICATION_FIXTURES = Object.freeze([
  Object.freeze({ role: "itemCount", itemsPerWhole: 12, wholeUnits: 1, numerator: 1, denominator: 3, itemLabel: "彩色筆", unitLabel: "盒" }),
  Object.freeze({ role: "fractionalUnits", itemsPerWhole: 12, itemCount: 18, itemLabel: "圖卡", unitLabel: "盒" }),
  Object.freeze({ role: "itemCount", itemsPerWhole: 8, wholeUnits: 2, numerator: 1, denominator: 2, itemLabel: "積木", unitLabel: "盒" }),
  Object.freeze({ role: "fractionalUnits", itemsPerWhole: 10, itemCount: 25, itemLabel: "貼紙", unitLabel: "包" }),
  Object.freeze({ role: "itemCount", itemsPerWhole: 10, wholeUnits: 0, numerator: 3, denominator: 5, itemLabel: "色紙", unitLabel: "包" }),
  Object.freeze({ role: "fractionalUnits", itemsPerWhole: 8, itemCount: 6, itemLabel: "獎勵卡", unitLabel: "盒" }),
]);
function buildNumericFixtures() {
  const rows = [];
  for (let itemsPerWhole = 4; itemsPerWhole <= 24; itemsPerWhole += 1) {
    for (let denominator = 2; denominator <= Math.min(12, itemsPerWhole); denominator += 1) {
      if (itemsPerWhole % denominator !== 0) continue;
      for (let numerator = 1; numerator < denominator; numerator += 1) {
        for (let wholeUnits = 0; wholeUnits <= 3; wholeUnits += 1) rows.push(Object.freeze({ role: "itemCount", itemsPerWhole, wholeUnits, numerator, denominator, itemLabel: "個", unitLabel: "大單位" }));
      }
    }
    for (let itemCount = 1; itemCount <= itemsPerWhole * 3; itemCount += 1) rows.push(Object.freeze({ role: "fractionalUnits", itemsPerWhole, itemCount, itemLabel: "個", unitLabel: "大單位" }));
  }
  return rows;
}
const NUMERIC_FIXTURES = Object.freeze(buildNumericFixtures()); // PGC-R04 discrete conversion numeric parameter space`,
    },
    {
      marker: "const seedOffset = (seed, size)",
      pattern: /const seedOffset = \(seed\) => \[\.\.\.String\(seed \?\? "p03f7"\)\]\.reduce\(\(sum, c\) => \(sum \+ c\.charCodeAt\(0\)\) % FIXTURES\.length, 0\);/,
      replacement: `const seedOffset = (seed, size) => [...String(seed ?? "p03f7")].reduce((sum, c) => (sum + c.charCodeAt(0)) % size, 0);`,
    },
    {
      marker: "const fixturePool = plan.questionMode === \"application\"",
      pattern: /const count = Number\.isInteger\(plan\.questionCount\) \? plan\.questionCount : 6; const offset = seedOffset\(plan\.generationSeed\);\n  const questions = Array\.from\(\{ length: count \}, \(_, index\) => buildQuestion\(plan\.questionMode, resolveFixture\(FIXTURES\[\(index \+ offset\) % FIXTURES\.length\]\), index\)\);/,
      replacement: `const count = Number.isInteger(plan.questionCount) ? plan.questionCount : 6;
  const fixturePool = plan.questionMode === "application" ? APPLICATION_FIXTURES : NUMERIC_FIXTURES;
  const offset = seedOffset(plan.generationSeed, fixturePool.length);
  const questions = Array.from({ length: count }, (_, index) => buildQuestion(plan.questionMode, resolveFixture(fixturePool[(index + offset) % fixturePool.length]), index));`,
    },
  ]));

  modifiedFiles.push(patch("decimal-read-write-runtime.js", [{
    marker: "PGC-R04 decimal read-write parameter space",
    pattern: /const WITNESSES = Object\.freeze\(\[[\s\S]*?\]\);/,
    replacement: `function buildReadWriteWitnesses() {
  const rows = [];
  for (let whole = 0; whole <= 9; whole += 1) {
    for (let tenths = 1; tenths <= 9; tenths += 1) {
      rows.push(Object.freeze({ whole, tenths, direction: "notation_to_reading" }));
      rows.push(Object.freeze({ whole, tenths, direction: "reading_to_notation" }));
    }
  }
  return rows;
}
const WITNESSES = Object.freeze(buildReadWriteWitnesses()); // PGC-R04 decimal read-write parameter space`,
  }]));

  modifiedFiles.push(patch("decimal-compose-decompose-runtime.js", [{
    marker: "PGC-R04 decimal compose parameter space",
    pattern: /const WITNESSES = Object\.freeze\(\[[\s\S]*?\]\);/,
    replacement: `function buildComposeWitnesses() {
  const rows = [];
  const templates = [
    (whole, fraction) => whole + " 個一和 " + fraction + " 個 0.1 合起來是多少？",
    (whole, fraction) => "個位有 " + whole + "，十分位有 " + fraction + "，這個小數是多少？",
    (whole, fraction) => whole + " + " + fraction + " × 0.1 所組成的小數是多少？",
  ];
  for (let whole = 0; whole <= 9; whole += 1) {
    for (let fractionalUnits = 1; fractionalUnits <= 9; fractionalUnits += 1) {
      for (const template of templates) rows.push(Object.freeze({ whole, fractionalUnits, prompt: template(whole, fractionalUnits) }));
    }
  }
  return rows;
}
const WITNESSES = Object.freeze(buildComposeWitnesses()); // PGC-R04 decimal compose parameter space`,
  }]));

  modifiedFiles.push(patch("tenths-fraction-decimal-runtime.js", [
    {
      marker: "PGC-R04 tenths conversion surface parameter space",
      pattern: /const NUMERATORS = Object\.freeze\(\[1, 2, 3, 4, 5, 6, 7, 8, 9\]\);/,
      replacement: `const NUMERATORS = Object.freeze([1, 2, 3, 4, 5, 6, 7, 8, 9]);
const SURFACE_VARIANTS = Object.freeze(["direct", "equivalence", "place_value"]); // PGC-R04 tenths conversion surface parameter space`,
    },
    {
      marker: "const surfaceVariant = SURFACE_VARIANTS",
      pattern: /const offset = hashSeed\(seed\) % NUMERATORS\.length;\n  const numerator = NUMERATORS\[\(offset \+ index - 1\) % NUMERATORS\.length\];\n  const direction = index % 2 === 1 \? "fraction_to_decimal" : "decimal_to_fraction";\n  const fractionText = `\$\{numerator\}\/10`;\n  const decimalText = `0\.\$\{numerator\}`;\n  const promptText = direction === "fraction_to_decimal"\n    \? `把 \$\{fractionText\} 寫成一位小數。`\n    : `\$\{decimalText\} 是十分之幾？請用分母 10 的分數表示。`;/,
      replacement: `const offset = hashSeed(seed) % (NUMERATORS.length * SURFACE_VARIANTS.length * 2);
  const variantIndex = (offset + index - 1) % (NUMERATORS.length * SURFACE_VARIANTS.length * 2);
  const numerator = NUMERATORS[variantIndex % NUMERATORS.length];
  const direction = Math.floor(variantIndex / NUMERATORS.length) % 2 === 0 ? "fraction_to_decimal" : "decimal_to_fraction";
  const surfaceVariant = SURFACE_VARIANTS[Math.floor(variantIndex / (NUMERATORS.length * 2)) % SURFACE_VARIANTS.length];
  const fractionText = numerator + "/10";
  const decimalText = "0." + numerator;
  const promptText = direction === "fraction_to_decimal"
    ? surfaceVariant === "direct" ? "把 " + fractionText + " 寫成一位小數。" : surfaceVariant === "equivalence" ? fractionText + " 和哪個一位小數表示相同的值？" : "十分位有 " + numerator + " 個 0.1，對應的小數是多少？"
    : surfaceVariant === "direct" ? decimalText + " 是十分之幾？請用分母 10 的分數表示。" : surfaceVariant === "equivalence" ? "哪個分母為 10 的分數和 " + decimalText + " 相等？" : decimalText + " 含有幾個十分之一？請寫成分數。";`,
    },
    {
      marker: "plan.questionCount > NUMERATORS.length * SURFACE_VARIANTS.length * 2",
      pattern: /plan\.questionCount > 8/,
      replacement: `plan.questionCount > NUMERATORS.length * SURFACE_VARIANTS.length * 2`,
    },
  ]));

  modifiedFiles.push(patch("one-decimal-times-integer-runtime.js", [
    {
      marker: "PGC-R04 decimal multiplication numeric parameter space",
      pattern: /const FIXTURES = Object\.freeze\(\[[\s\S]*?\]\);/,
      replacement: `const APPLICATION_FIXTURES = Object.freeze([
  { decimalTenths: 12, integerFactor: 3 }, { decimalTenths: 34, integerFactor: 2 },
  { decimalTenths: 48, integerFactor: 3 }, { decimalTenths: 63, integerFactor: 4 },
  { decimalTenths: 27, integerFactor: 7 }, { decimalTenths: 56, integerFactor: 8 },
  { decimalTenths: 19, integerFactor: 6 }, { decimalTenths: 75, integerFactor: 5 },
]);
function buildNumericFixtures() {
  const rows = [];
  for (let decimalTenths = 11; decimalTenths <= 99; decimalTenths += 1) {
    if (decimalTenths % 10 === 0) continue;
    for (let integerFactor = 2; integerFactor <= 9; integerFactor += 1) rows.push(Object.freeze({ decimalTenths, integerFactor }));
  }
  return rows;
}
const NUMERIC_FIXTURES = Object.freeze(buildNumericFixtures()); // PGC-R04 decimal multiplication numeric parameter space`,
    },
    {
      marker: "const fixturePool = mode === \"application\"",
      pattern: /if \(plan\.questionCount > FIXTURES\.length\) return \{[\s\S]*?\};\n  const mode = plan\.questionMode === "application" \? "application" : "numeric";\n  const questions = FIXTURES\.slice\(0, plan\.questionCount\)\.map\(\(fixture, index\) => buildQuestion\(fixture, index, mode\)\);/,
      replacement: `const mode = plan.questionMode === "application" ? "application" : "numeric";
  const fixturePool = mode === "application" ? APPLICATION_FIXTURES : NUMERIC_FIXTURES;
  if (plan.questionCount > fixturePool.length) return { ok: false, plan, questions: [], allocation: [], errors: [{ code: "p03f11_question_count_exceeds_unique_witnesses", severity: "error", path: "questionCount", message: "The selected mode does not provide enough unique witnesses." }], warnings: [] };
  const offset = [...String(plan.generationSeed ?? "p03f11")].reduce((sum, char) => (sum + char.charCodeAt(0)) % fixturePool.length, 0);
  const questions = Array.from({ length: plan.questionCount }, (_, index) => buildQuestion(fixturePool[(offset + index) % fixturePool.length], index, mode));`,
    },
  ]));

  modifiedFiles.push(patch("equivalence-cross-product-cases.js", [{
    marker: "PGC-R04 cross product parameter space",
    pattern: /export const G4B_U08_EQUIVALENCE_CROSS_PRODUCT_CASES = Object\.freeze\(\[[\s\S]*?\]\);/,
    replacement: `function buildCrossProductCases() {
  const rows = [];
  for (let leftDenominator = 2; leftDenominator <= 15; leftDenominator += 1) {
    for (let leftNumerator = 1; leftNumerator < leftDenominator; leftNumerator += 1) {
      for (let factor = 2; factor <= 6; factor += 1) {
        rows.push(Object.freeze({ leftNumerator, leftDenominator, rightNumerator: leftNumerator * factor, rightDenominator: leftDenominator * factor }));
        rows.push(Object.freeze({ leftNumerator, leftDenominator, rightNumerator: leftNumerator * factor + 1, rightDenominator: leftDenominator * factor }));
      }
    }
  }
  return rows;
}
export const G4B_U08_EQUIVALENCE_CROSS_PRODUCT_CASES = Object.freeze(buildCrossProductCases()); // PGC-R04 cross product parameter space`,
  }]));

  modifiedFiles.push(patch("quotient-as-fraction-context-runtime.js", [
    {
      marker: "PGC-R04 quotient numeric parameter space",
      pattern: /const FIXTURES = Object\.freeze\(\[[\s\S]*?\]\);/,
      replacement: `const APPLICATION_FIXTURES = Object.freeze([
  Object.freeze({ totalQuantity: 6, recipientCount: 4 }), Object.freeze({ totalQuantity: 5, recipientCount: 2 }),
  Object.freeze({ totalQuantity: 7, recipientCount: 3 }), Object.freeze({ totalQuantity: 8, recipientCount: 6 }),
  Object.freeze({ totalQuantity: 9, recipientCount: 4 }), Object.freeze({ totalQuantity: 10, recipientCount: 6 }),
]);
function buildNumericFixtures() {
  const rows = [];
  for (let totalQuantity = 1; totalQuantity <= 30; totalQuantity += 1) {
    for (let recipientCount = 2; recipientCount <= 15; recipientCount += 1) rows.push(Object.freeze({ totalQuantity, recipientCount }));
  }
  return rows;
}
const NUMERIC_FIXTURES = Object.freeze(buildNumericFixtures()); // PGC-R04 quotient numeric parameter space`,
    },
    {
      marker: "function seedOffset(seed, size)",
      pattern: /function seedOffset\(seed\) \{\n  return \[\.\.\.String\(seed \?\? "p03f13-quotient"\)\]\.reduce\(\(sum, char\) => \(sum \+ char\.charCodeAt\(0\)\) % FIXTURES\.length, 0\);\n\}/,
      replacement: `function seedOffset(seed, size) {
  return [...String(seed ?? "p03f13-quotient")].reduce((sum, char) => (sum + char.charCodeAt(0)) % size, 0);
}`,
    },
    {
      marker: "const fixturePool = mode === \"application\" ? APPLICATION_FIXTURES : NUMERIC_FIXTURES",
      pattern: /const count = Number\.isInteger\(plan\.questionCount\) \? plan\.questionCount : 6;\n  if \(count <= 0 \|\| count > FIXTURES\.length\) \{[\s\S]*?\n  \}\n  const patternSpecId = plan\.patternSpecIds\[0\];\n  const mode = patternSpecId === G5A_U04_QUOTIENT_CONTEXT_APPLICATION_SPEC_ID \? "application" : "numeric";\n  const offset = seedOffset\(plan\.generationSeed\);\n  const selected = Array\.from\(\{ length: count \}, \(_, index\) => FIXTURES\[\(offset \+ index\) % FIXTURES\.length\]\);/,
      replacement: `const count = Number.isInteger(plan.questionCount) ? plan.questionCount : 6;
  const patternSpecId = plan.patternSpecIds[0];
  const mode = patternSpecId === G5A_U04_QUOTIENT_CONTEXT_APPLICATION_SPEC_ID ? "application" : "numeric";
  const fixturePool = mode === "application" ? APPLICATION_FIXTURES : NUMERIC_FIXTURES;
  if (count <= 0 || count > fixturePool.length) {
    return { ok: false, plan, questions: [], allocation: [], errors: [{ code: "p03f13_quotient_question_count_invalid", severity: "error", path: "questionCount", message: "The selected quotient mode does not provide enough unique witnesses." }], warnings: [] };
  }
  const offset = seedOffset(plan.generationSeed, fixturePool.length);
  const selected = Array.from({ length: count }, (_, index) => fixturePool[(offset + index) % fixturePool.length]);`,
    },
  ]));

  const result = {
    status: "PASS_PGC_R04_BOUNDED_RUNTIME_EXPANSION_PATCHED",
    modifiedFiles,
    numericAuthoritiesExpanded: [
      "P03F4_TENTH_DECIMAL",
      "P03F5_EQUIVALENT_FRACTION",
      "P03F6_SAME_DENOMINATOR_COMPARE",
      "P03F7_DISCRETE_FRACTION_CONVERSION",
      "P03F8_DECIMAL_READ_WRITE_COMPOSE",
      "P03F9_TENTHS_FRACTION_DECIMAL",
      "P03F10_HUNDREDTH_DECIMAL",
      "P03F11_ONE_DECIMAL_TIMES_INTEGER",
      "P03F12_EQUIVALENCE_CROSS_PRODUCT",
      "P03F13_QUOTIENT_AS_FRACTION",
    ],
    applicationAuthoritiesPreserved: true,
  };
  console.log(`PGC_R04_BOUNDED_RUNTIME_EXPANSION=${JSON.stringify(result)}`);
  return result;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) applyPgcR04BoundedRuntimeExpansionPatch();
