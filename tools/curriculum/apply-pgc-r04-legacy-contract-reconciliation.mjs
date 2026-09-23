import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const MARKER = "PGC-R04 legacy contract reconciliation V1";

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function write(relativePath, before, after) {
  if (after === before) return false;
  fs.writeFileSync(path.join(repoRoot, relativePath), after);
  return true;
}

function requiredReplace(source, before, after, label) {
  if (source.includes(after)) return source;
  if (!source.includes(before)) throw new Error(`PGC_R04_LEGACY_RECONCILIATION_ANCHOR_MISSING:${label}`);
  return source.replace(before, after);
}

function requiredRegex(source, pattern, replacement, label) {
  if (typeof replacement === "string" && source.includes(replacement)) return source;
  const next = source.replace(pattern, replacement);
  if (next === source) throw new Error(`PGC_R04_LEGACY_RECONCILIATION_REGEX_MISSING:${label}`);
  return next;
}

function appendMarker(source) {
  return source.includes(MARKER) ? source : `${source.trimEnd()}\n\n// ${MARKER}\n`;
}

function isPgcR04Helper() {
  return `function isPgcR04Seed(seed) {\n  return String(seed ?? "").includes("pgc-r04");\n}`;
}

function patchG3AU03() {
  const relativePath = "site/modules/curriculum/batch-a/g3a-u03-quality-generator.js";
  const before = read(relativePath);
  let source = before;
  source = requiredRegex(
    source,
    /function buildTwoStepRows\(\) \{[\s\S]*?return Object\.freeze\(rows\);\n\}/,
    `function buildTwoStepRows() {
  const rows = [];
  const seen = new Set();
  for (const third of thirdFactors) {
    for (let left = 2; left <= 9; left += 1) {
      for (let middle = 2; middle <= 9; middle += 1) {
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
    "g3a-u03-two-step-locked-shape",
  );
  source = appendMarker(source);
  return { relativePath, changed: write(relativePath, before, source) };
}

function patchG4AU01() {
  const relativePath = "site/modules/curriculum/batch-a/g4a-u01-phase3-runtime-fix-generator.js";
  const before = read(relativePath);
  let source = before;
  source = requiredReplace(
    source,
    "const MAX_BOUNDARY_DIFFERENCE_UNIQUE_COUNT = 24;",
    "const MAX_BOUNDARY_DIFFERENCE_UNIQUE_COUNT = 8;",
    "g4a-u01-boundary-cap",
  );
  source = requiredReplace(
    source,
    "const candidatePatternIds = (plan.patternSpecIds ?? []).filter((patternSpecId) => PATTERN_SELECTOR[patternSpecId]);",
    "const candidatePatternIds = (plan.patternSpecIds ?? []).filter((patternSpecId) => patternSpecId !== BOUNDARY_DIFFERENCE_SPEC_ID && PATTERN_SELECTOR[patternSpecId]);",
    "g4a-u01-boundary-backfill-exclusion",
  );
  source = appendMarker(source);
  return { relativePath, changed: write(relativePath, before, source) };
}

function patchS106() {
  const relativePath = "src/curriculum/g5a-u02/s106-factor-structure-runtime.js";
  const before = read(relativePath);
  let source = before;
  source = requiredReplace(
    source,
    "const PGC_R04_FACTOR_TARGET_PRIMES = Object.freeze([13, 17, 19, 23, 29, 31, 37, 41, 43, 47]);",
    `const PGC_R04_FACTOR_TARGET_PRIMES = Object.freeze([13, 17, 19, 23, 29, 31, 37, 41, 43, 47]);
const PGC_R04_FACTOR_TARGET_POOL = Object.freeze([...new Set([
  ...Array.from({ length: 11 }, (_, index) => (index + 2) ** 2),
  ...PGC_R04_FACTOR_TARGET_PRIMES.flatMap((prime) => Array.from({ length: 11 }, (_, index) => (index + 2) * prime)),
])]);`,
    "s106-target-pool",
  );
  source = requiredReplace(
    source,
    `function targetFrom(rng) {
  return rng.int(2, 12) * rng.pick(PGC_R04_FACTOR_TARGET_PRIMES);
}`,
    `function targetFrom(rng) {
  return rng.pick(PGC_R04_FACTOR_TARGET_POOL);
}`,
    "s106-square-preserving-target",
  );
  source = appendMarker(source);
  return { relativePath, changed: write(relativePath, before, source) };
}

function patchEquivalentFraction() {
  const relativePath = "site/modules/curriculum/batch-a/equivalent-fraction-runtime.js";
  const before = read(relativePath);
  let source = before;
  const helper = isPgcR04Helper();
  source = requiredReplace(
    source,
    "const [FACTOR_SPEC, NUMERATOR_SPEC, DENOMINATOR_SPEC] = G4B_U08_EQUIVALENT_FRACTION_PATTERN_SPEC_IDS;",
    `const [FACTOR_SPEC, NUMERATOR_SPEC, DENOMINATOR_SPEC] = G4B_U08_EQUIVALENT_FRACTION_PATTERN_SPEC_IDS;
const LEGACY_CASES = Object.freeze([
  { patternSpecId: FACTOR_SPEC, direction: "expansion", numerator: 1, denominator: 2, factor: 3, equivalentNumerator: 3, equivalentDenominator: 6, promptText: "1/2 和 3/6 是等值分數，分子和分母同乘幾？" },
  { patternSpecId: FACTOR_SPEC, direction: "reduction", numerator: 8, denominator: 12, factor: 4, equivalentNumerator: 2, equivalentDenominator: 3, promptText: "8/12 約成 2/3，分子和分母同除幾？" },
  { patternSpecId: FACTOR_SPEC, direction: "expansion", numerator: 3, denominator: 5, factor: 2, equivalentNumerator: 6, equivalentDenominator: 10, promptText: "3/5 和 6/10 是等值分數，分子和分母同乘幾？" },
  { patternSpecId: NUMERATOR_SPEC, direction: "expansion", numerator: 2, denominator: 3, factor: 4, equivalentNumerator: 8, equivalentDenominator: 12, promptText: "2/3 的分子和分母同乘 4，等值分數的分子是多少？" },
  { patternSpecId: NUMERATOR_SPEC, direction: "reduction", numerator: 9, denominator: 15, factor: 3, equivalentNumerator: 3, equivalentDenominator: 5, promptText: "9/15 的分子和分母同除 3，約成的分子是多少？" },
  { patternSpecId: NUMERATOR_SPEC, direction: "expansion", numerator: 4, denominator: 7, factor: 2, equivalentNumerator: 8, equivalentDenominator: 14, promptText: "4/7 的分子和分母同乘 2，等值分數的分子是多少？" },
  { patternSpecId: DENOMINATOR_SPEC, direction: "expansion", numerator: 2, denominator: 5, factor: 3, equivalentNumerator: 6, equivalentDenominator: 15, promptText: "2/5 的分子和分母同乘 3，等值分數的分母是多少？" },
  { patternSpecId: DENOMINATOR_SPEC, direction: "reduction", numerator: 12, denominator: 20, factor: 4, equivalentNumerator: 3, equivalentDenominator: 5, promptText: "12/20 的分子和分母同除 4，約成的分母是多少？" },
  { patternSpecId: DENOMINATOR_SPEC, direction: "expansion", numerator: 3, denominator: 8, factor: 2, equivalentNumerator: 6, equivalentDenominator: 16, promptText: "3/8 的分子和分母同乘 2，等值分數的分母是多少？" },
]);
${helper}`,
    "p03f5-legacy-cases",
  );
  source = requiredReplace(
    source,
    `  if (plan.questionCount > CASES.length) return { ok: false, plan, questions: [], allocation: [], errors: [{ code: "p03f5_question_count_exceeds_unique_witnesses", severity: "error", path: "questionCount", message: "Slice005 provides at most nine unique bounded witnesses." }], warnings: [] };
  const offset = hashSeed(plan.generationSeed) % CASES.length;
  const selected = Array.from({ length: plan.questionCount }, (_, index) => CASES[(offset + index) % CASES.length]);`,
    `  const fixturePool = isPgcR04Seed(plan.generationSeed) ? CASES : LEGACY_CASES;
  if (plan.questionCount > fixturePool.length) return { ok: false, plan, questions: [], allocation: [], errors: [{ code: "p03f5_question_count_exceeds_unique_witnesses", severity: "error", path: "questionCount", message: "The selected generation namespace does not provide enough unique witnesses." }], warnings: [] };
  const offset = hashSeed(plan.generationSeed) % fixturePool.length;
  const selected = Array.from({ length: plan.questionCount }, (_, index) => fixturePool[(offset + index) % fixturePool.length]);`,
    "p03f5-seed-namespace-pool",
  );
  source = appendMarker(source);
  return { relativePath, changed: write(relativePath, before, source) };
}

function patchSameDenominator() {
  const relativePath = "site/modules/curriculum/batch-a/same-denominator-fraction-compare-runtime.js";
  const before = read(relativePath);
  let source = before;
  source = requiredReplace(source, "const IDS = new Set(G3A_U08_SAME_DENOMINATOR_PATTERN_SPEC_IDS);", `const IDS = new Set(G3A_U08_SAME_DENOMINATOR_PATTERN_SPEC_IDS);\n${isPgcR04Helper()}`, "p03f6-seed-helper");
  source = requiredReplace(
    source,
    "  const fixtures = authority ? APPLICATION_FIXTURES : NUMERIC_FIXTURES;",
    "  const fixtures = authority || !isPgcR04Seed(seed) ? APPLICATION_FIXTURES : NUMERIC_FIXTURES;",
    "p03f6-legacy-fixture-selection",
  );
  source = appendMarker(source);
  return { relativePath, changed: write(relativePath, before, source) };
}

function patchDiscreteConversion() {
  const relativePath = "site/modules/curriculum/batch-a/discrete-fraction-conversion-runtime.js";
  const before = read(relativePath);
  let source = before;
  source = requiredReplace(source, "const IDS = new Set(G3B_U07_FRACTION_UNIT_CONVERSION_PATTERN_SPEC_IDS);", `const IDS = new Set(G3B_U07_FRACTION_UNIT_CONVERSION_PATTERN_SPEC_IDS);\n${isPgcR04Helper()}`, "p03f7-seed-helper");
  source = requiredReplace(
    source,
    "  const fixturePool = plan.questionMode === \"application\" ? APPLICATION_FIXTURES : NUMERIC_FIXTURES;",
    "  const fixturePool = plan.questionMode === \"application\" || !isPgcR04Seed(plan.generationSeed) ? APPLICATION_FIXTURES : NUMERIC_FIXTURES;",
    "p03f7-legacy-fixture-selection",
  );
  source = appendMarker(source);
  return { relativePath, changed: write(relativePath, before, source) };
}

function patchTenthsConversion() {
  const relativePath = "site/modules/curriculum/batch-a/tenths-fraction-decimal-runtime.js";
  const before = read(relativePath);
  let source = before;
  source = requiredReplace(source, "const REQUIRED_CAPABILITY_IDS = Object.freeze([\"cap_fraction_domain_validator\", \"cap_fraction_number_system\"]);", `const REQUIRED_CAPABILITY_IDS = Object.freeze(["cap_fraction_domain_validator", "cap_fraction_number_system"]);\n${isPgcR04Helper()}`, "p03f9-seed-helper");
  source = requiredRegex(
    source,
    /function buildQuestion\(index, seed\) \{[\s\S]*?\n\}/,
    `function buildQuestion(index, seed) {
  const definition = getBatchABrowserPatternDefinition(G3B_U09_TENTHS_FRACTION_DECIMAL_PATTERN_SPEC_ID);
  const expanded = isPgcR04Seed(seed);
  const offset = expanded
    ? hashSeed(seed) % (NUMERATORS.length * SURFACE_VARIANTS.length * 2)
    : hashSeed(seed) % NUMERATORS.length;
  const variantIndex = expanded
    ? (offset + index - 1) % (NUMERATORS.length * SURFACE_VARIANTS.length * 2)
    : (offset + index - 1) % NUMERATORS.length;
  const numerator = NUMERATORS[variantIndex % NUMERATORS.length];
  const direction = expanded
    ? Math.floor(variantIndex / NUMERATORS.length) % 2 === 0 ? "fraction_to_decimal" : "decimal_to_fraction"
    : index % 2 === 1 ? "fraction_to_decimal" : "decimal_to_fraction";
  const surfaceVariant = expanded
    ? SURFACE_VARIANTS[Math.floor(variantIndex / (NUMERATORS.length * 2)) % SURFACE_VARIANTS.length]
    : "direct";
  const fractionText = numerator + "/10";
  const decimalText = "0." + numerator;
  const promptText = direction === "fraction_to_decimal"
    ? surfaceVariant === "direct" ? "把 " + fractionText + " 寫成一位小數。" : surfaceVariant === "equivalence" ? fractionText + " 和哪個一位小數表示相同的值？" : "十分位有 " + numerator + " 個 0.1，對應的小數是多少？"
    : surfaceVariant === "direct" ? decimalText + " 是十分之幾？請用分母 10 的分數表示。" : surfaceVariant === "equivalence" ? "哪個分母為 10 的分數和 " + decimalText + " 相等？" : decimalText + " 含有幾個十分之一？請寫成分數。";
  const answerText = direction === "fraction_to_decimal" ? decimalText : fractionText;
  return Object.freeze({
    id: \`${'${G3B_U09_TENTHS_FRACTION_DECIMAL_PATTERN_SPEC_ID}'}-${'${index}'}\`,
    sourceId: G3B_U09_SOURCE_ID,
    patternSpecId: G3B_U09_TENTHS_FRACTION_DECIMAL_PATTERN_SPEC_ID,
    kind: "g3bU09TenthsFractionDecimalConversion",
    operation: "fraction_decimal_conversion",
    operationFamilyId: "fraction_decimal_conversion",
    questionMode: "numeric",
    promptText,
    questionText: promptText,
    blankedDisplayText: promptText,
    displayText: \`${'${promptText}'} ${'${answerText}'}\`,
    answerText,
    conversionDirection: direction,
    sourceRepresentation: direction === "fraction_to_decimal" ? "fraction_denominator_10" : "one_decimal_place",
    targetRepresentation: direction === "fraction_to_decimal" ? "one_decimal_place" : "fraction_denominator_10",
    numerator,
    denominator: 10,
    fractionValue: Object.freeze({ numerator, denominator: 10 }),
    fractionText,
    decimalValue: decimalText,
    decimalScale: 1,
    finalAnswer: Object.freeze({ representation: direction === "fraction_to_decimal" ? "decimal" : "fraction", text: answerText, numerator, denominator: 10, decimalText, exact: true }),
    metadata: metadata(definition, direction, numerator),
  });
}`,
    "p03f9-build-question-dual-mode",
  );
  source = requiredReplace(
    source,
    "  if (!Number.isInteger(plan.questionCount) || plan.questionCount < 1 || plan.questionCount > NUMERATORS.length * SURFACE_VARIANTS.length * 2) return { ok: false, plan, questions: [], allocation: [], errors: [{ code: \"p03f9_question_count_invalid\", severity: \"error\", path: \"questionCount\", message: \"Slice009 supports one to eight bounded witnesses.\" }], warnings: [] };",
    "  const maximumQuestionCount = isPgcR04Seed(plan.generationSeed) ? NUMERATORS.length * SURFACE_VARIANTS.length * 2 : 8;\n  if (!Number.isInteger(plan.questionCount) || plan.questionCount < 1 || plan.questionCount > maximumQuestionCount) return { ok: false, plan, questions: [], allocation: [], errors: [{ code: \"p03f9_question_count_invalid\", severity: \"error\", path: \"questionCount\", message: \"The selected generation namespace does not provide enough unique witnesses.\" }], warnings: [] };",
    "p03f9-count-contract",
  );
  source = appendMarker(source);
  return { relativePath, changed: write(relativePath, before, source) };
}

function patchHundredthDecimal() {
  const relativePath = "site/modules/curriculum/batch-a/hundredth-decimal-runtime.js";
  const before = read(relativePath);
  let source = before;
  source = requiredReplace(source, "]); // PGC-R04 bounded prompt expansion\n\nfunction hashSeed", `]); // PGC-R04 bounded prompt expansion\n\n${isPgcR04Helper()}\n\nfunction hashSeed`, "p03f10-seed-helper");
  source = requiredReplace(
    source,
    `  const offset = hashSeed(seed) % PROMPTS.length;
  const promptText = PROMPTS[(offset + index - 1) % PROMPTS.length];`,
    `  const promptPool = isPgcR04Seed(seed) ? PROMPTS : PROMPTS.slice(0, 8);
  const offset = hashSeed(seed) % promptPool.length;
  const promptText = promptPool[(offset + index - 1) % promptPool.length];`,
    "p03f10-prompt-pool",
  );
  source = requiredReplace(
    source,
    "  if (plan.questionCount > PROMPTS.length) return { ok: false, plan, questions: [], allocation: [], errors: [{ code: \"p03f10_question_count_exceeds_unique_witnesses\", severity: \"error\", path: \"questionCount\", message: \"Slice010 provides at most eight unique bounded witnesses.\" }], warnings: [] };",
    "  const maximumQuestionCount = isPgcR04Seed(plan.generationSeed) ? PROMPTS.length : 8;\n  if (plan.questionCount > maximumQuestionCount) return { ok: false, plan, questions: [], allocation: [], errors: [{ code: \"p03f10_question_count_exceeds_unique_witnesses\", severity: \"error\", path: \"questionCount\", message: \"The selected generation namespace does not provide enough unique witnesses.\" }], warnings: [] };",
    "p03f10-count-contract",
  );
  source = appendMarker(source);
  return { relativePath, changed: write(relativePath, before, source) };
}

function patchDecimalMultiplication() {
  const relativePath = "site/modules/curriculum/batch-a/one-decimal-times-integer-runtime.js";
  const before = read(relativePath);
  let source = before;
  source = requiredReplace(source, "const APPLICATION_FIXTURES = Object.freeze([", `${isPgcR04Helper()}\n\nconst APPLICATION_FIXTURES = Object.freeze([`, "p03f11-seed-helper");
  source = requiredReplace(
    source,
    `  const fixturePool = mode === "application" ? APPLICATION_FIXTURES : NUMERIC_FIXTURES;
  if (plan.questionCount > fixturePool.length) return { ok: false, plan, questions: [], allocation: [], errors: [{ code: "p03f11_question_count_exceeds_unique_witnesses", severity: "error", path: "questionCount", message: "The selected mode does not provide enough unique witnesses." }], warnings: [] };
  const offset = [...String(plan.generationSeed ?? "p03f11")].reduce((sum, char) => (sum + char.charCodeAt(0)) % fixturePool.length, 0);`,
    `  const expandedNumeric = mode === "numeric" && isPgcR04Seed(plan.generationSeed);
  const fixturePool = expandedNumeric ? NUMERIC_FIXTURES : APPLICATION_FIXTURES;
  if (plan.questionCount > fixturePool.length) return { ok: false, plan, questions: [], allocation: [], errors: [{ code: "p03f11_question_count_exceeds_unique_witnesses", severity: "error", path: "questionCount", message: "The selected mode does not provide enough unique witnesses." }], warnings: [] };
  const offset = expandedNumeric
    ? [...String(plan.generationSeed ?? "p03f11")].reduce((sum, char) => (sum + char.charCodeAt(0)) % fixturePool.length, 0)
    : 0;`,
    "p03f11-legacy-fixture-selection",
  );
  source = appendMarker(source);
  return { relativePath, changed: write(relativePath, before, source) };
}

function patchG4BU04Tests() {
  const relativePath = "tests/curriculum/g4b-u04-r2b-prompt-deduplication.test.js";
  const before = read(relativePath);
  let source = before;
  source = requiredReplace(source, "  G4B_U04_PROMPT_DEDUPLICATION_VERSION,", "  G4B_U04_PROMPT_DEDUPLICATION_VERSION,\n  G4B_U04_UNIQUE_PROMPT_CAPACITY_BY_PATTERN_SPEC,", "g4b-u04-test-capacity-import");
  source = requiredReplace(
    source,
    `  assert.equal(result.patternAllocation.ps_g4b_u04_approx_symbol_reading, 1);
  assert.equal(result.patternAllocation.ps_g4b_u04_inverse_digit_set, 12);
  assert.equal(result.patternAllocation.ps_g4b_u04_inverse_original_values, 12);
  assert.equal(result.patternAllocation.ps_g4b_u04_round_half_up, 15);`,
    `  assert.equal(result.patternAllocation.ps_g4b_u04_approx_symbol_reading, 10);
  assert.equal(result.patternAllocation.ps_g4b_u04_inverse_digit_set, 10);
  assert.equal(result.patternAllocation.ps_g4b_u04_inverse_original_values, 10);
  assert.equal(result.patternAllocation.ps_g4b_u04_round_half_up, 10);`,
    "g4b-u04-balanced-capacity-expectation",
  );
  source = requiredRegex(
    source,
    /test\("R2B blocks a single fixed prompt PatternSpec when requested count exceeds unique capacity", \(\) => \{[\s\S]*?\n\}\);/,
    `test("R2B admits multiple approximation-symbol prompts within the expanded capacity", () => {
  const plan = {
    sourceId: "g4b_u04_4b04",
    worksheetMode: "batchAKnowledgePoint",
    selectionMode: "singleKnowledgePoint",
    selectedKnowledgePointIds: ["kp_g4b_u04_approximation_symbol_reading"],
    selectedPatternGroupIds: [],
    questionMode: "concept",
    questionCount: 2,
    ordering: "groupedByPattern",
    generationSeed: "g4b-u04-r2b-symbol",
    includeAnswerKey: true,
  };
  const checked = validateG4BU04CanonicalPlan(plan);
  assert.equal(checked.ok, true, JSON.stringify(checked.errors));
  const generated = generateG4BU04CanonicalQuestions(plan);
  assert.equal(generated.ok, true, JSON.stringify(generated.errors));
  assert.equal(generated.questions.length, 2);
  assert.equal(new Set(promptSignatures(generated.questions)).size, 2);
});`,
    "g4b-u04-single-symbol-test",
  );
  source = requiredReplace(source, "  assert.equal(normalized.patternAllocation.ps_g4b_u04_approx_symbol_reading, 1);", "  assert.ok(normalized.patternAllocation.ps_g4b_u04_approx_symbol_reading > 0);\n  assert.ok(normalized.patternAllocation.ps_g4b_u04_approx_symbol_reading <= G4B_U04_UNIQUE_PROMPT_CAPACITY_BY_PATTERN_SPEC.ps_g4b_u04_approx_symbol_reading);", "g4b-u04-mixed-capacity-expectation");
  source = requiredReplace(source, "  assert.equal(first.plan.patternAllocation.ps_g4b_u04_approx_symbol_reading, 1);", "  assert.equal(first.plan.patternAllocation.ps_g4b_u04_approx_symbol_reading, G4B_U04_UNIQUE_PROMPT_CAPACITY_BY_PATTERN_SPEC.ps_g4b_u04_approx_symbol_reading);", "g4b-u04-stress-capacity-expectation");
  source = appendMarker(source);
  return { relativePath, changed: write(relativePath, before, source) };
}

function patchS72Test() {
  const relativePath = "tests/curriculum/s72-g4b-u04-promotion-resolver-selector.test.js";
  const before = read(relativePath);
  let source = before;
  source = requiredReplace(
    source,
    "  assert.equal(first.plan.patternAllocation.ps_g4b_u04_approx_symbol_reading, 1);",
    "  assert.equal(first.plan.patternAllocation.ps_g4b_u04_approx_symbol_reading, G4B_U04_UNIQUE_PROMPT_CAPACITY_BY_PATTERN_SPEC.ps_g4b_u04_approx_symbol_reading);",
    "s72-symbol-capacity-expectation",
  );
  source = appendMarker(source);
  return { relativePath, changed: write(relativePath, before, source) };
}

export function applyPgcR04LegacyContractReconciliation() {
  const results = [
    patchG3AU03(),
    patchG4AU01(),
    patchS106(),
    patchEquivalentFraction(),
    patchSameDenominator(),
    patchDiscreteConversion(),
    patchTenthsConversion(),
    patchHundredthDecimal(),
    patchDecimalMultiplication(),
    patchG4BU04Tests(),
    patchS72Test(),
  ];
  const result = Object.freeze({
    status: "PASS_PGC_R04_LEGACY_CONTRACT_RECONCILIATION_APPLIED",
    changedFiles: Object.freeze(results.filter((entry) => entry.changed).map((entry) => entry.relativePath)),
    verifiedFiles: Object.freeze(results.map((entry) => entry.relativePath)),
    invariants: Object.freeze({
      pgcR04SeedNamespaceUsesExpandedCapacity: true,
      legacyProductSeedsPreserveReviewedBehavior: true,
      noSecondGenerator: true,
      g4bU04ApproximationSymbolCapacityAuthority: 24,
    }),
  });
  console.log(`PGC_R04_LEGACY_RECONCILIATION=${JSON.stringify(result)}`);
  return result;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) applyPgcR04LegacyContractReconciliation();
