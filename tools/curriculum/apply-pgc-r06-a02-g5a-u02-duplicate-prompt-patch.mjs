import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const marker = "PGC-R06 A02 G5A-U02 reasoning mixed diversity FullFix V1";

function replaceRequired(source, before, after, label) {
  if (source.includes(after)) return source;
  if (!source.includes(before)) throw new Error(`PGC_R06_A02_DUPLICATE_PATCH_ANCHOR_MISSING:${label}`);
  return source.replace(before, after);
}

function patchFile(relativePath, mutate) {
  const filePath = path.join(repoRoot, relativePath);
  const before = fs.readFileSync(filePath, "utf8");
  if (before.includes(marker)) return false;
  const after = `${mutate(before).trimEnd()}\n\n// ${marker}\n`;
  fs.writeFileSync(filePath, after);
  return true;
}

function patchBrowser(source) {
  source = replaceRequired(
    source,
    `const PGC_R05_APPLICATION_DIVERSITY_PROFILE = "pgc-r05-application-diversity-v1";`,
    `const PGC_R05_APPLICATION_DIVERSITY_PROFILE = "pgc-r05-application-diversity-v1";\nconst PGC_R06_REASONING_MIXED_DIVERSITY_PROFILE = "pgc-r06-reasoning-mixed-diversity-v1";`,
    "browser-profile-constant",
  );
  return replaceRequired(
    source,
    `function resolveGenerationProfile(seed) {\n  return String(seed ?? "").includes("pgc-r05")\n    ? PGC_R05_APPLICATION_DIVERSITY_PROFILE\n    : "legacy";\n}`,
    `function resolveGenerationProfile(seed) {\n  const text = String(seed ?? "");\n  if (text.includes("pgc-r05")) return PGC_R05_APPLICATION_DIVERSITY_PROFILE;\n  if (text.includes("pgc-r06-a02")) return PGC_R06_REASONING_MIXED_DIVERSITY_PROFILE;\n  return "legacy";\n}`,
    "browser-profile-resolution",
  );
}

function patchClassC(source) {
  source = replaceRequired(
    source,
    `const PGC_R04_FACTOR_TARGET_PRIMES = Object.freeze([13, 17, 19, 23, 29, 31, 37, 41, 43, 47]);`,
    `const PGC_R04_FACTOR_TARGET_PRIMES = Object.freeze([13, 17, 19, 23, 29, 31, 37, 41, 43, 47]);\nconst PGC_R06_REASONING_MIXED_DIVERSITY_PROFILE = "pgc-r06-reasoning-mixed-diversity-v1";`,
    "class-c-profile-constant",
  );
  source = replaceRequired(
    source,
    `function compositeTarget(rng) {\n  return rng.int(2, 12) * rng.pick(PGC_R04_FACTOR_TARGET_PRIMES);\n}`,
    `function compositeTarget(rng, seed, options = {}) {\n  if (options.generationProfile === PGC_R06_REASONING_MIXED_DIVERSITY_PROFILE) {\n    const normalizedSeed = Number.isInteger(seed) && seed >= 1 ? seed : 1;\n    const slot = (normalizedSeed - 1) % 90;\n    const multiplier = 2 + (slot % 9);\n    const prime = PGC_R04_FACTOR_TARGET_PRIMES[Math.floor(slot / 9) % PGC_R04_FACTOR_TARGET_PRIMES.length];\n    return multiplier * prime;\n  }\n  return rng.int(2, 12) * rng.pick(PGC_R04_FACTOR_TARGET_PRIMES);\n}`,
    "class-c-target-projection",
  );
  source = replaceRequired(
    source,
    `function generateByPattern(patternSpecId, rng, seed) {`,
    `function generateByPattern(patternSpecId, rng, seed, options = {}) {`,
    "class-c-router-signature",
  );
  source = source.replaceAll(`compositeTarget(rng)`, `compositeTarget(rng, seed, options)`);
  return replaceRequired(
    source,
    `  return generateByPattern(patternSpecId, createRng(seed), seed);`,
    `  return generateByPattern(patternSpecId, createRng(seed), seed, options);`,
    "class-c-options-forwarding",
  );
}

function patchClassD(source) {
  source = replaceRequired(
    source,
    `const PGC_R05_APPLICATION_DIVERSITY_PROFILE = "pgc-r05-application-diversity-v1";`,
    `const PGC_R05_APPLICATION_DIVERSITY_PROFILE = "pgc-r05-application-diversity-v1";\nconst PGC_R06_REASONING_MIXED_DIVERSITY_PROFILE = "pgc-r06-reasoning-mixed-diversity-v1";`,
    "class-d-profile-constant",
  );
  source = replaceRequired(
    source,
    `function isPgcR05ApplicationDiversity(options = {}) {\n  return options.generationProfile === PGC_R05_APPLICATION_DIVERSITY_PROFILE;\n}`,
    `function isDeterministicDiversityProfile(options = {}) {\n  return [PGC_R05_APPLICATION_DIVERSITY_PROFILE, PGC_R06_REASONING_MIXED_DIVERSITY_PROFILE]\n    .includes(options.generationProfile);\n}`,
    "class-d-profile-predicate",
  );
  source = source.replaceAll(`isPgcR05ApplicationDiversity(options)`, `isDeterministicDiversityProfile(options)`);
  source = replaceRequired(
    source,
    `    const generated = generateG5AU02S108Pattern(patternSpecId, rng);`,
    `    const generated = generateG5AU02S108Pattern(patternSpecId, rng, { ...options, seed });`,
    "class-d-s108-options",
  );
  return source;
}

function patchS101(source) {
  source = replaceRequired(
    source,
    `const PGC_R05_APPLICATION_DIVERSITY_PROFILE = "pgc-r05-application-diversity-v1";`,
    `const PGC_R05_APPLICATION_DIVERSITY_PROFILE = "pgc-r05-application-diversity-v1";\nconst PGC_R06_REASONING_MIXED_DIVERSITY_PROFILE = "pgc-r06-reasoning-mixed-diversity-v1";`,
    "s101-profile-constant",
  );
  source = replaceRequired(
    source,
    `function isPgcR05ApplicationDiversity(options = {}) {\n  return options.generationProfile === PGC_R05_APPLICATION_DIVERSITY_PROFILE;\n}`,
    `function isDeterministicDiversityProfile(options = {}) {\n  return [PGC_R05_APPLICATION_DIVERSITY_PROFILE, PGC_R06_REASONING_MIXED_DIVERSITY_PROFILE]\n    .includes(options.generationProfile);\n}`,
    "s101-profile-predicate",
  );
  return source.replaceAll(`isPgcR05ApplicationDiversity(options)`, `isDeterministicDiversityProfile(options)`);
}

function patchS103(source) {
  source = replaceRequired(
    source,
    `const GENERATED_PROFILE_ID = "generated_unique_code_v1";`,
    `const GENERATED_PROFILE_ID = "generated_unique_code_v1";\nconst PGC_R06_REASONING_MIXED_DIVERSITY_PROFILE = "pgc-r06-reasoning-mixed-diversity-v1";`,
    "s103-profile-constant",
  );
  source = replaceRequired(
    source,
    `    case "position_common_factor_and_not_equal":`,
    `    case "position_digit_equals":\n      return \`${"${POSITION_NAMES[params.position]}"}數字是 ${"${params.value}"}。\`;\n    case "position_common_factor_and_not_equal":`,
    "s103-condition-text",
  );
  source = replaceRequired(
    source,
    `    case "all_digits_distinct": return new Set(digits).size === digits.length;`,
    `    case "all_digits_distinct": return new Set(digits).size === digits.length;\n    case "position_digit_equals": return digits[params.position] === params.value;`,
    "s103-condition-match",
  );
  source = replaceRequired(
    source,
    `export function solveG5AU02DigitCode(candidateDomain, conditions) {\n  const solutions = [];\n  for (let value = candidateDomain.min; value <= candidateDomain.max; value += 1) {\n    if (!domainAllows(value, candidateDomain)) continue;\n    const digits = digitsOf(value);\n    if (conditions.every((condition) => conditionMatches(value, digits, condition))) {\n      solutions.push(deepFreeze({ value, digits }));\n    }\n  }\n  return deepFreeze(solutions);\n}`,
    `export function solveG5AU02DigitCode(candidateDomain, conditions) {\n  const solutions = [];\n  for (let value = candidateDomain.min; value <= candidateDomain.max; value += 1) {\n    if (!domainAllows(value, candidateDomain)) continue;\n    const digits = digitsOf(value);\n    if (conditions.every((condition) => conditionMatches(value, digits, condition))) {\n      solutions.push(deepFreeze({ value, digits }));\n    }\n  }\n  return deepFreeze(solutions);\n}\n\nlet r06BlueprintCache = null;\n\nfunction r06ConditionsForValue(value) {\n  const digits = digitsOf(value);\n  return [\n    makeCondition(\`r06_${"${value}"}_c1\`, "position_digit_equals", { position: 0, value: digits[0] }),\n    makeCondition(\`r06_${"${value}"}_c2\`, "digit_offset_relation", { leftPosition: 0, rightPosition: 1, offset: digits[0] - digits[1] }),\n    makeCondition(\`r06_${"${value}"}_c3\`, "digit_offset_relation", { leftPosition: 1, rightPosition: 2, offset: digits[1] - digits[2] }),\n    makeCondition(\`r06_${"${value}"}_c4\`, "digit_offset_relation", { leftPosition: 2, rightPosition: 3, offset: digits[2] - digits[3] }),\n  ];\n}\n\nfunction getR06GeneratedBlueprints() {\n  if (r06BlueprintCache) return r06BlueprintCache;\n  const rows = [];\n  for (let value = GENERATED_DOMAIN.min; value <= GENERATED_DOMAIN.max && rows.length < 180; value += 1) {\n    if (!domainAllows(value, GENERATED_DOMAIN)) continue;\n    const conditions = r06ConditionsForValue(value);\n    const solutions = solveG5AU02DigitCode(GENERATED_DOMAIN, conditions);\n    if (solutions.length !== 1 || solutions[0].value !== value) continue;\n    const minimal = conditions.every((_, index) => {\n      const reduced = solveG5AU02DigitCode(GENERATED_DOMAIN, conditions.filter((__, conditionIndex) => conditionIndex !== index));\n      return reduced.length !== 1 || reduced[0].value !== value;\n    });\n    if (!minimal) continue;\n    rows.push(deepFreeze({ blueprintId: \`generated_r06_${"${value}"}\`, expectedValue: value, conditions }));\n  }\n  if (rows.length < 20) throw new Error(`G5AU02_PGC_R06_DIGIT_CODE_BLUEPRINT_CAPACITY:${"${rows.length}"}`);\n  r06BlueprintCache = deepFreeze(rows);\n  return r06BlueprintCache;\n}\n\nfunction isR06Diversity(options = {}) {\n  return options.generationProfile === PGC_R06_REASONING_MIXED_DIVERSITY_PROFILE;\n}`,
    "s103-dynamic-blueprints",
  );
  source = replaceRequired(
    source,
    `function buildGeneratedProfile(rng) {\n  const blueprint = rng.pick(GENERATED_BLUEPRINTS);`,
    `function buildGeneratedProfile(rng, options = {}) {\n  const blueprint = isR06Diversity(options)\n    ? getR06GeneratedBlueprints()[(Math.max(1, Number(options.seed) || 1) - 1) % getR06GeneratedBlueprints().length]\n    : rng.pick(GENERATED_BLUEPRINTS);`,
    "s103-profile-builder",
  );
  source = replaceRequired(
    source,
    `  else if (profileId === GENERATED_PROFILE_ID) profile = buildGeneratedProfile(rng);`,
    `  else if (profileId === GENERATED_PROFILE_ID) profile = buildGeneratedProfile(rng, options);`,
    "s103-options-forwarding",
  );
  return replaceRequired(
    source,
    `    const blueprint = BLUEPRINT_BY_ID.get(data.blueprintId);`,
    `    const blueprint = BLUEPRINT_BY_ID.get(data.blueprintId)\n      ?? getR06GeneratedBlueprints().find((row) => row.blueprintId === data.blueprintId);`,
    "s103-validator-dynamic-blueprint",
  );
}

function patchS108(source) {
  source = replaceRequired(
    source,
    `const PATTERN_ID = "ps_g5a_u02_remainder_transfer";`,
    `const PATTERN_ID = "ps_g5a_u02_remainder_transfer";\nconst PGC_R06_REASONING_MIXED_DIVERSITY_PROFILE = "pgc-r06-reasoning-mixed-diversity-v1";`,
    "s108-profile-constant",
  );
  source = replaceRequired(
    source,
    `export function generateG5AU02S108Pattern(patternSpecId, rng) {\n  if (!isG5AU02S108Pattern(patternSpecId)) return null;\n  const family = rng.pick(SCENARIO_FAMILIES);\n  const smallerDivisor = rng.int(2, 8);\n  const multiplier = rng.int(2, 5);\n  const largerDivisor = smallerDivisor * multiplier;\n  const remainder = rng.int(1, smallerDivisor - 1);\n  const largerGroupCount = rng.int(2, 12);`,
    `export function generateG5AU02S108Pattern(patternSpecId, rng, options = {}) {\n  if (!isG5AU02S108Pattern(patternSpecId)) return null;\n  const r06 = options.generationProfile === PGC_R06_REASONING_MIXED_DIVERSITY_PROFILE;\n  const normalizedSeed = Number.isInteger(options.seed) && options.seed >= 1 ? options.seed : 1;\n  const slot = (normalizedSeed - 1) % 784;\n  const family = r06 ? SCENARIO_FAMILIES[slot % SCENARIO_FAMILIES.length] : rng.pick(SCENARIO_FAMILIES);\n  const smallerDivisor = r06 ? 2 + (Math.floor(slot / 4) % 7) : rng.int(2, 8);\n  const multiplier = r06 ? 2 + (Math.floor(slot / 28) % 4) : rng.int(2, 5);\n  const largerDivisor = smallerDivisor * multiplier;\n  const remainder = r06 ? 1 + (Math.floor(slot / 112) % (smallerDivisor - 1)) : rng.int(1, smallerDivisor - 1);\n  const largerGroupCount = r06 ? 2 + (Math.floor(slot / 224) % 11) : rng.int(2, 12);`,
    "s108-seed-projection",
  );
  return source;
}

export function applyPgcR06A02G5AU02DuplicatePromptPatch() {
  const mutations = [
    ["src/curriculum/g5a-u02/browser-dynamic-entry.js", patchBrowser],
    ["src/curriculum/g5a-u02/class-c-generator-validator.js", patchClassC],
    ["src/curriculum/g5a-u02/class-d-semantic-generator-validator.js", patchClassD],
    ["src/curriculum/g5a-u02/s101-representation-runtime.js", patchS101],
    ["src/curriculum/g5a-u02/s103-digit-code-runtime.js", patchS103],
    ["src/curriculum/g5a-u02/s108-remainder-transfer-runtime.js", patchS108],
  ];
  const changedFiles = mutations.filter(([relativePath, mutate]) => patchFile(relativePath, mutate)).map(([relativePath]) => relativePath);
  const result = Object.freeze({
    status: changedFiles.length ? "PASS_PGC_R06_A02_DUPLICATE_PROMPT_PATCH_APPLIED" : "PASS_PGC_R06_A02_DUPLICATE_PROMPT_PATCH_ALREADY_APPLIED",
    generationProfile: "pgc-r06-reasoning-mixed-diversity-v1",
    changedFiles: Object.freeze(changedFiles),
    producerFamilies: Object.freeze([
      "class_c_factor_targets",
      "class_d_equal_partition",
      "class_d_digit_code",
      "class_d_remainder_transfer",
    ]),
    legacyProfilePreserved: true,
    r05ApplicationProfilePreserved: true,
    secondGeneratorAdded: false,
    secondValidatorAdded: false,
  });
  console.log(`PGC_R06_A02_DUPLICATE_PROMPT_PATCH=${JSON.stringify(result)}`);
  return result;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) applyPgcR06A02G5AU02DuplicatePromptPatch();
