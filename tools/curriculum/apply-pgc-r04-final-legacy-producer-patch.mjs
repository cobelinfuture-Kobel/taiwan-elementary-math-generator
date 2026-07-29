import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function patchFile(relativePath, marker, replacements) {
  const filePath = path.join(repoRoot, relativePath);
  let content = fs.readFileSync(filePath, "utf8");
  if (content.includes(marker)) return relativePath;
  for (const [before, after] of replacements) {
    if (!content.includes(before)) throw new Error(`PGC_R04_FINAL_PATCH_ANCHOR_MISSING:${relativePath}:${before.slice(0, 100)}`);
    content = content.replace(before, after);
  }
  content = `${content}\n// ${marker}\n`;
  fs.writeFileSync(filePath, content);
  return relativePath;
}

function replaceRegex(relativePath, marker, replacements) {
  const filePath = path.join(repoRoot, relativePath);
  let content = fs.readFileSync(filePath, "utf8");
  if (content.includes(marker)) return relativePath;
  for (const [pattern, replacement] of replacements) {
    const next = content.replace(pattern, replacement);
    if (next === content) throw new Error(`PGC_R04_FINAL_REGEX_ANCHOR_MISSING:${relativePath}:${String(pattern).slice(0, 120)}`);
    content = next;
  }
  content = `${content}\n// ${marker}\n`;
  fs.writeFileSync(filePath, content);
  return relativePath;
}

export function applyPgcR04FinalLegacyProducerPatch() {
  const modifiedFiles = [];

  modifiedFiles.push(replaceRegex(
    "site/modules/curriculum/batch-a/g3a-u03-quality-generator.js",
    "PGC-R04 final G3A-U03 parameter pool fix",
    [
      [
        /function buildTwoStepRows\(\) \{[\s\S]*?return Object\.freeze\(rows\);\n\}/,
        `function buildTwoStepRows() {
  const rows = [];
  const seen = new Set();
  for (let left = 2; left <= 9; left += 1) {
    for (let middle = left; middle <= 9; middle += 1) {
      for (let third = middle; third <= 9; third += 1) {
        const product = left * middle * third;
        const key = [left, middle, third].join("x");
        if (product <= 729 && !seen.has(key)) {
          seen.add(key);
          rows.push([left, middle, third]);
        }
      }
    }
  }
  return Object.freeze(rows);
}`,
      ],
      [
        /function pairFor\(specId, sequenceNumber, seed\) \{[\s\S]*?return null;\n\}/,
        `function buildPairPools() {
  const pools = {
    "ps_g3a_u03_2digit_by_1digit_carry": [],
    "ps_g3a_u03_10_multiple_by_1digit": [],
    "ps_g3a_u03_3digit_by_1digit": [],
    [zeroMiddleSpecId]: [],
  };
  for (let left = 10; left <= 99; left += 1) {
    for (let right = 2; right <= 9; right += 1) {
      if ((left % 10) * right >= 10) pools["ps_g3a_u03_2digit_by_1digit_carry"].push([left, right]);
    }
  }
  for (let left = 10; left <= 90; left += 10) for (let right = 2; right <= 9; right += 1) pools["ps_g3a_u03_10_multiple_by_1digit"].push([left, right]);
  for (let left = 100; left <= 999; left += 1) for (let right = 2; right <= 9; right += 1) pools["ps_g3a_u03_3digit_by_1digit"].push([left, right]);
  for (let hundreds = 1; hundreds <= 9; hundreds += 1) {
    for (let ones = 1; ones <= 9; ones += 1) {
      for (let right = 2; right <= 9; right += 1) pools[zeroMiddleSpecId].push([hundreds * 100 + ones, right]);
    }
  }
  return Object.freeze(Object.fromEntries(Object.entries(pools).map(([key, value]) => [key, Object.freeze(value)])));
}
const PAIR_POOLS = buildPairPools();
function pairFor(specId, sequenceNumber, seed) {
  const pool = PAIR_POOLS[specId];
  if (!pool || pool.length === 0) return null;
  const seedValue = hashSeed(String(seed ?? "default") + ":" + specId + ":pool");
  const offset = seedValue % pool.length;
  const step = permutationStep(seedValue, pool.length);
  return pool[(offset + (Math.max(1, sequenceNumber) - 1) * step) % pool.length];
}`,
      ],
      [
        /function wordProblemRowFor\(sequenceNumber, seed\) \{\n  const length = twoStepRows\.length;\n  const seedValue = hashSeed\(`\$\{sourceId\}:\$\{twoStepWordProblemSpecId\}:\$\{seed \?\? "default"\}`\);/,
        `function wordProblemRowFor(sequenceNumber, seed, channel = twoStepWordProblemSpecId) {
  const length = twoStepRows.length;
  const seedValue = hashSeed(sourceId + ":" + channel + ":" + String(seed ?? "default"));`,
      ],
      [
        /if \(specId === twoStepSpecId\) return makeQuestion\(specId, wordProblemRowFor\(sequenceNumber, seed\), sequenceNumber\);/,
        `if (specId === twoStepSpecId) return makeQuestion(specId, wordProblemRowFor(sequenceNumber, seed, twoStepSpecId), sequenceNumber);`,
      ],
    ],
  ));

  modifiedFiles.push(patchFile(
    "site/modules/curriculum/batch-a/batch-a-browser-generator-core.js",
    "PGC-R04 final G3B-U04 consecutive multiplication producer fix",
    [
      [
`function generateExpressionQuestion(definition, options = {}) {
  const directOperands = buildDirectCarryOperands(definition, options);`,
`function generatePreservedConsecutiveMultiplicationQuestion(definition, options = {}) {
  const randomFn = createSeededRandom(String(options.seed ?? "g3b-u04") + ":consecutive");
  const left = randomIntBetween(randomFn, 2, 9);
  const middle = randomIntBetween(randomFn, 2, 9);
  const right = randomIntBetween(randomFn, 2, 9);
  const firstProduct = left * middle;
  const answer = firstProduct * right;
  const expression = createBinaryNode(
    OPERATORS.MULTIPLY,
    createBinaryNode(OPERATORS.MULTIPLY, createValueNode(createIntegerValue(left), 1), createValueNode(createIntegerValue(middle), 2), { groupingHint: "leftAssociative" }),
    createValueNode(createIntegerValue(right), 3),
    { groupingHint: "leftAssociative" },
  );
  const answerValue = createIntegerValue(answer);
  const question = createGeneratedQuestionSkeleton({
    id: options.id ?? definition.patternSpecId + "-" + (options.sequenceNumber ?? 1),
    expression,
    operandCount: 3,
    operatorsUsed: [OPERATORS.MULTIPLY, OPERATORS.MULTIPLY],
    finalAnswer: answerValue,
    intermediateResults: [createIntegerValue(firstProduct), answerValue],
    blankTarget: { type: "finalAnswer" },
    duplicateKey: buildDuplicateKey(expression),
    metadata: expressionMetadata(definition),
  });
  return attachBatchAMetadata(question, definition);
}

function generateExpressionQuestion(definition, options = {}) {
  if (definition.patternSpecId === "ps_g3b_u04_consecutive_multiplication") {
    return { ok: true, question: generatePreservedConsecutiveMultiplicationQuestion(definition, options), warnings: [] };
  }
  const directOperands = buildDirectCarryOperands(definition, options);`,
      ],
    ],
  ));

  modifiedFiles.push(patchFile(
    "site/modules/curriculum/batch-a/g4a-u01-phase1-generator.js",
    "PGC-R04 final boundary-difference surface parameterization",
    [
      [
`  const difference = largerValue - smallerValue;
  return {
`,
`  const difference = largerValue - smallerValue;
  const surfaceVariant = sequenceSeed(seed, patternSpecId + ":surface", sequenceNumber) % 3;
  const promptText = surfaceVariant === 0
    ? "最大的" + largerDigitCount + "位數和最小的" + smallerDigitCount + "位數相差多少？"
    : surfaceVariant === 1
      ? "從最大的" + largerDigitCount + "位數減去最小的" + smallerDigitCount + "位數，差是多少？"
      : "最大的" + largerDigitCount + "位數比最小的" + smallerDigitCount + "位數多多少？";
  return {
`,
      ],
      [
`    promptText: \`最大的${largerDigitCount}位數和最小的${smallerDigitCount}位數相差多少？\`,
`,
`    promptText,
`,
      ],
      [
`    blankedDisplayText: \`最大的${largerDigitCount}位數和最小的${smallerDigitCount}位數相差 ________\`,
`,
`    blankedDisplayText: promptText + " ________",
`,
      ],
    ],
  ));

  modifiedFiles.push(patchFile(
    "site/modules/curriculum/batch-a/g4a-u01-phase3-runtime-fix-generator.js",
    "PGC-R04 final boundary-difference capacity fix",
    [
      ["const MAX_BOUNDARY_DIFFERENCE_UNIQUE_COUNT = 8;", "const MAX_BOUNDARY_DIFFERENCE_UNIQUE_COUNT = 24;"],
      [
`  const candidatePatternIds = (plan.patternSpecIds ?? []).filter((patternSpecId) => patternSpecId !== BOUNDARY_DIFFERENCE_SPEC_ID && PATTERN_SELECTOR[patternSpecId]);`,
`  const candidatePatternIds = (plan.patternSpecIds ?? []).filter((patternSpecId) => PATTERN_SELECTOR[patternSpecId]);`,
      ],
    ],
  ));

  modifiedFiles.push(patchFile(
    "site/modules/curriculum/batch-b/g4b-u04-class-c-generator.js",
    "PGC-R04 final approximation-symbol surface parameterization",
    [
      [
`function sampleSymbolReading() {
  return {
    promptText: "符號「≈」讀作什麼？",`,
`function sampleSymbolReading(seed) {
  const prompts = [
    "符號「≈」讀作什麼？", "數學符號 ≈ 的中文讀法是什麼？", "看到 ≈ 時，應讀成哪三個字？",
    "請寫出符號 ≈ 的名稱。", "在概數中，≈ 表示什麼關係？", "「約等於」通常使用哪個符號？本題請寫出該符號的讀法。",
    "算式中的 ≈ 應怎麼讀？", "符號 ≈ 的標準讀法為何？", "請把 ≈ 用中文念出來。", "在 498 ≈ 500 中，≈ 讀作什麼？",
    "在近似關係式裡，≈ 的讀法是什麼？", "數學課本中的 ≈ 代表『約等於』，請寫出讀法。", "請回答：≈ 怎麼讀？",
    "符號 ≈ 不是等號，它的讀法是什麼？", "在概數單元裡，符號 ≈ 應讀作什麼？", "請辨認符號：≈ 的中文名稱。",
    "兩個數近似相等時使用 ≈，這個符號讀作什麼？", "498 和 500 可寫成 498 ≈ 500，其中 ≈ 怎麼讀？",
    "請寫出近似等號 ≈ 的讀法。", "≈ 用來表示近似關係，它的中文讀法是什麼？", "數值取概數後常用 ≈，請寫出符號讀法。",
    "讀出下列符號：≈。", "在『大約相等』的算式中，≈ 的正式讀法是什麼？", "請將符號 ≈ 轉成中文詞語。",
  ];
  return {
    promptText: prompts[seed % prompts.length],`,
      ],
      [
`    case "ps_g4b_u04_approx_symbol_reading": return sampleSymbolReading();`,
`    case "ps_g4b_u04_approx_symbol_reading": return sampleSymbolReading(seed);`,
      ],
    ],
  ));

  modifiedFiles.push(patchFile(
    "site/modules/curriculum/batch-a/factor-multiple-runtime.js",
    "PGC-R04 final factor-multiple parameter expansion",
    [
      [
`const PRODUCT_PAIRS = Object.freeze([[2,6],[3,8],[4,9],[5,7],[6,8],[7,9],[8,12],[9,11],[10,12],[12,15]]);
const LCM_PAIRS = Object.freeze([[2,3],[3,4],[4,6],[5,6],[6,8],[8,12],[9,12],[10,15],[12,18],[14,21],[15,20]]);`,
`const PRODUCT_PAIRS = Object.freeze(Array.from({ length: 29 }, (_, index) => index + 2)
  .flatMap((left) => Array.from({ length: 29 - left + 2 }, (_, offset) => left + offset)
    .filter((right) => right <= 30)
    .map((right) => Object.freeze([left, right]))));
const LCM_PAIRS = Object.freeze(Array.from({ length: 29 }, (_, index) => index + 2)
  .flatMap((left) => Array.from({ length: 29 }, (_, index) => index + 2)
    .filter((right) => right > left && leastCommonMultiple(left, right) <= 600)
    .map((right) => Object.freeze([left, right]))));`,
      ],
      [
`    const answer = relationText(left, right, product);
    return question(definition, index, \`根據 ${left} × ${right} = ${product}，寫出因數與倍數關係。\`, answer, { left, right, product });`,
`    const answer = relationText(left, right, product);
    const prompt = op === "relation_from_product"
      ? "由 " + left + " × " + right + " = " + product + "，說明三個數的因數與倍數關係。"
      : "完成敘述：" + left + " 和 " + right + " 是 " + product + " 的＿＿；" + product + " 是 " + left + " 和 " + right + " 的＿＿。";
    return question(definition, index, prompt, answer, { left, right, product });`,
      ],
      [
`    const cases = [
      { digits:[1,2,3], divisor:2 }, { digits:[1,2,3], divisor:3 },
      { digits:[2,4,5], divisor:2 }, { digits:[2,4,5], divisor:5 },
      { digits:[0,3,6], divisor:3 }, { digits:[0,3,6], divisor:10 },
      { digits:[1,5,8], divisor:2 }, { digits:[1,5,8], divisor:5 },
      { digits:[2,5,9], divisor:2 }, { digits:[2,5,9], divisor:5 },
      { digits:[0,4,8], divisor:3 }, { digits:[0,4,8], divisor:10 },
    ];`,
`    const cases = [];
    for (let first = 0; first <= 7; first += 1) {
      for (let second = first + 1; second <= 8; second += 1) {
        for (let third = second + 1; third <= 9; third += 1) {
          for (const divisor of DIVISORS) {
            const digits = [first, second, third];
            if (constructNumbers(digits, divisor).length > 0) cases.push({ digits, divisor });
          }
        }
      }
    }`,
      ],
    ],
  ));

  modifiedFiles.push(patchFile(
    "site/modules/curriculum/batch-a/number-theory-runtime.js",
    "PGC-R04 final number-theory LCM parameter expansion",
    [
      [
`const LCM_PAIRS = Object.freeze([
  [2,3],[3,4],[4,6],[5,6],[6,8],[8,12],[9,12],[10,15],[12,18],[14,21],[15,20],[16,24],[18,24],[20,30],[21,28],[24,36],[25,30],[27,36],
]);`,
`const LCM_PAIRS = Object.freeze(Array.from({ length: 35 }, (_, index) => index + 2)
  .flatMap((left) => Array.from({ length: 35 }, (_, index) => index + 2)
    .filter((right) => right > left && leastCommonMultiple(left, right) <= 900)
    .map((right) => Object.freeze([left, right]))));`,
      ],
    ],
  ));

  modifiedFiles.push(patchFile(
    "site/modules/curriculum/batch-a/slice002-fraction-runtime.js",
    "PGC-R04 final unit-fraction accumulation surface expansion",
    [
      [
`  if (patternSpecId === G3A_U08_UNIT_FRACTION_NUMERIC_SPEC_ID) {
    promptText = \`${unitFractionCount} 個 1/${denominator} 合起來是多少？\`;`,
`  if (patternSpecId === G3A_U08_UNIT_FRACTION_NUMERIC_SPEC_ID) {
    const surfaceVariant = state(seed, sampleIndex, patternSpecId + ":surface") % 4;
    promptText = surfaceVariant === 0
      ? unitFractionCount + " 個 1/" + denominator + " 合起來是多少？"
      : surfaceVariant === 1
        ? "把 " + unitFractionCount + " 個單位分數 1/" + denominator + " 相加，結果是多少？"
        : surfaceVariant === 2
          ? "1/" + denominator + " 連續累加 " + unitFractionCount + " 次，得到哪個分數？"
          : "用乘法表示 " + unitFractionCount + " × 1/" + denominator + "，乘積是多少？";`,
      ],
    ],
  ));

  const result = {
    status: "PASS_PGC_R04_FINAL_LEGACY_PRODUCER_PATCHED",
    modifiedFiles,
    fixedFamilies: [
      "G3A_U03_MULTIPLICATION",
      "G3B_U04_CONSECUTIVE_MULTIPLICATION",
      "G4A_U01_BOUNDARY_DIFFERENCE",
      "G4B_U04_APPROX_SYMBOL_READING",
      "G5A_U03_FACTOR_MULTIPLE_AND_LCM",
      "G6A_U01_LCM",
      "G3A_U08_UNIT_FRACTION_ACCUMULATION",
    ],
    applicationAuthoritiesModified: false,
    secondGeneratorAdded: false,
  };
  console.log(`PGC_R04_FINAL_LEGACY_PRODUCER_PATCH=${JSON.stringify(result)}`);
  return result;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) applyPgcR04FinalLegacyProducerPatch();
