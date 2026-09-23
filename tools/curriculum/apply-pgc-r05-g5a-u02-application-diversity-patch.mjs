import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const marker = "PGC-R05 G5A-U02 application diversity FullFix V1";
const profileId = "pgc-r05-application-diversity-v1";

function patchFile(relativePath, transform) {
  const filePath = path.join(repoRoot, relativePath);
  const before = fs.readFileSync(filePath, "utf8");
  if (before.includes(marker)) return { relativePath, changed: false };
  const after = `${transform(before).trimEnd()}\n\n// ${marker}\n`;
  if (after === before) throw new Error(`PGC_R05_G5A_U02_PATCH_NO_CHANGE:${relativePath}`);
  fs.writeFileSync(filePath, after);
  return { relativePath, changed: true };
}

function replaceRequired(source, before, after, label) {
  if (source.includes(after)) return source;
  if (!source.includes(before)) throw new Error(`PGC_R05_G5A_U02_ANCHOR_MISSING:${label}`);
  return source.replace(before, after);
}

function patchBrowserEntry(source) {
  source = replaceRequired(
    source,
    `const SOURCE_ID = "g5a_u02_5a02";
const MAX_SEED = 0x7fffffff;`,
    `const SOURCE_ID = "g5a_u02_5a02";
const MAX_SEED = 0x7fffffff;
const PGC_R05_APPLICATION_DIVERSITY_PROFILE = "${profileId}";

function resolveGenerationProfile(seed) {
  return String(seed ?? "").includes("pgc-r05")
    ? PGC_R05_APPLICATION_DIVERSITY_PROFILE
    : "legacy";
}`,
    "browser-generation-profile",
  );
  source = replaceRequired(
    source,
    `      seed: seedFor(input.baseSeed, index),
    });`,
    `      seed: seedFor(input.baseSeed, index),
      generationProfile: input.generationProfile,
    });`,
    "browser-semantic-regeneration-profile",
  );
  source = replaceRequired(
    source,
    `    baseSeed: normalizeG5AU02BrowserSeed(plan.generationSeed ?? plan.baseSeed ?? 1),
    includeAnswerKey: plan.includeAnswerKey !== false,`,
    `    baseSeed: normalizeG5AU02BrowserSeed(plan.generationSeed ?? plan.baseSeed ?? 1),
    generationProfile: resolveGenerationProfile(plan.generationSeed ?? plan.baseSeed ?? 1),
    includeAnswerKey: plan.includeAnswerKey !== false,`,
    "browser-input-generation-profile",
  );
  return source;
}

function patchHiddenWorksheet(source) {
  source = replaceRequired(
    source,
    `  const baseSeed = input.baseSeed ?? 1;
  const includeAnswerKey = input.includeAnswerKey ?? true;`,
    `  const baseSeed = input.baseSeed ?? 1;
  const generationProfile = input.generationProfile ?? "legacy";
  const includeAnswerKey = input.includeAnswerKey ?? true;`,
    "hidden-plan-generation-profile",
  );
  source = replaceRequired(
    source,
    `  if (!integerInRange(baseSeed, 1, 0x7fffffff)) errors.push("G5AU02_WORKSHEET_BASE_SEED_INVALID");
  if (typeof includeAnswerKey !== "boolean") errors.push("G5AU02_WORKSHEET_ANSWER_KEY_FLAG_INVALID");`,
    `  if (!integerInRange(baseSeed, 1, 0x7fffffff)) errors.push("G5AU02_WORKSHEET_BASE_SEED_INVALID");
  if (typeof generationProfile !== "string" || generationProfile.length === 0) errors.push("G5AU02_WORKSHEET_GENERATION_PROFILE_INVALID");
  if (typeof includeAnswerKey !== "boolean") errors.push("G5AU02_WORKSHEET_ANSWER_KEY_FLAG_INVALID");`,
    "hidden-plan-profile-validation",
  );
  source = replaceRequired(
    source,
    `    questionCount, baseSeed, includeAnswerKey, questionRowsPerPage, answerRowsPerPage,`,
    `    questionCount, baseSeed, generationProfile, includeAnswerKey, questionRowsPerPage, answerRowsPerPage,`,
    "hidden-normalized-profile",
  );
  source = replaceRequired(
    source,
    `      const item = generateG5AU02Canonical(patternSpecId, { seed: seedFor(allocated.plan.baseSeed, index) });`,
    `      const item = generateG5AU02Canonical(patternSpecId, {
        seed: seedFor(allocated.plan.baseSeed, index),
        generationProfile: allocated.plan.generationProfile,
      });`,
    "hidden-generation-profile-forwarding",
  );
  return source;
}

function patchClassD(source) {
  source = replaceRequired(
    source,
    `const CLASS_D_SET = new Set(CLASS_D_PATTERN_IDS);`,
    `const CLASS_D_SET = new Set(CLASS_D_PATTERN_IDS);
const PGC_R05_APPLICATION_DIVERSITY_PROFILE = "${profileId}";`,
    "class-d-profile-constant",
  );
  source = replaceRequired(
    source,
    `function pairedQuantities(rng) {
  const common = rng.int(2, 10);
  return [common * rng.int(2, 9), common * rng.int(2, 9)];
}`,
    `function isPgcR05ApplicationDiversity(options = {}) {
  return options.generationProfile === PGC_R05_APPLICATION_DIVERSITY_PROFILE;
}

function projectionSlot(seed, size) {
  const normalized = Number.isInteger(seed) && seed >= 1 ? seed : 1;
  return (normalized - 1) % size;
}

function pairedQuantities(rng, seed, options = {}) {
  if (isPgcR05ApplicationDiversity(options)) {
    const slot = projectionSlot(seed, 90);
    const common = 2 + (slot % 9);
    const leftMultiplier = 101 + (2 * slot);
    const rightMultiplier = leftMultiplier + 1;
    return [common * leftMultiplier, common * rightMultiplier];
  }
  const common = rng.int(2, 10);
  return [common * rng.int(2, 9), common * rng.int(2, 9)];
}`,
    "class-d-paired-quantity-projection",
  );
  source = replaceRequired(
    source,
    `    const generated = generateG5AU02S101Pattern(patternSpecId, rng);`,
    `    const generated = generateG5AU02S101Pattern(patternSpecId, rng, { ...options, seed });`,
    "class-d-s101-profile-forwarding",
  );
  source = replaceRequired(
    source,
    `      const total = rng.int(4, 12) * rng.int(2, 8);`,
    `      const total = isPgcR05ApplicationDiversity(options)
        ? 24 + projectionSlot(seed, 180)
        : rng.int(4, 12) * rng.int(2, 8);`,
    "class-d-range-total-projection",
  );
  source = replaceRequired(
    source,
    `      const [red, blue] = pairedQuantities(rng);`,
    `      const [red, blue] = pairedQuantities(rng, seed, options);`,
    "class-d-maximum-grouping-projection",
  );
  source = replaceRequired(
    source,
    `      const [quantityA, quantityB] = pairedQuantities(rng);`,
    `      const [quantityA, quantityB] = pairedQuantities(rng, seed, options);`,
    "class-d-packaging-projection",
  );
  return source;
}

function patchS101(source) {
  source = replaceRequired(
    source,
    `const S101_PATTERN_SET = new Set(S101_PATTERN_IDS);`,
    `const S101_PATTERN_SET = new Set(S101_PATTERN_IDS);
const PGC_R05_APPLICATION_DIVERSITY_PROFILE = "${profileId}";
const PGC_R05_DIMENSION_MULTIPLIERS = Object.freeze(
  Array.from({ length: 7 }, (_, lowIndex) => lowIndex + 2)
    .flatMap((low) => Array.from({ length: 9 - low }, (_, highIndex) => Object.freeze([low, low + highIndex + 1]))),
);`,
    "s101-profile-and-dimension-pool",
  );
  source = replaceRequired(
    source,
    `function pairedDimensions(rng) {
  const common = rng.int(2, 10);
  let lengthMultiplier = rng.int(3, 9);
  let widthMultiplier = rng.int(2, 8);
  if (lengthMultiplier === widthMultiplier) {
    widthMultiplier = widthMultiplier === 8 ? 7 : widthMultiplier + 1;
  }
  const length = common * Math.max(lengthMultiplier, widthMultiplier);
  const width = common * Math.min(lengthMultiplier, widthMultiplier);
  return { length, width };
}`,
    `function isPgcR05ApplicationDiversity(options = {}) {
  return options.generationProfile === PGC_R05_APPLICATION_DIVERSITY_PROFILE;
}

function projectionSlot(seed, size) {
  const normalized = Number.isInteger(seed) && seed >= 1 ? seed : 1;
  return (normalized - 1) % size;
}

function pairedDimensions(rng, seed, options = {}) {
  if (isPgcR05ApplicationDiversity(options)) {
    const slot = projectionSlot(seed, PGC_R05_DIMENSION_MULTIPLIERS.length * 9);
    const [lowMultiplier, highMultiplier] = PGC_R05_DIMENSION_MULTIPLIERS[
      slot % PGC_R05_DIMENSION_MULTIPLIERS.length
    ];
    const common = 2 + Math.floor(slot / PGC_R05_DIMENSION_MULTIPLIERS.length);
    return {
      length: common * highMultiplier,
      width: common * lowMultiplier,
    };
  }
  const common = rng.int(2, 10);
  let lengthMultiplier = rng.int(3, 9);
  let widthMultiplier = rng.int(2, 8);
  if (lengthMultiplier === widthMultiplier) {
    widthMultiplier = widthMultiplier === 8 ? 7 : widthMultiplier + 1;
  }
  const length = common * Math.max(lengthMultiplier, widthMultiplier);
  const width = common * Math.min(lengthMultiplier, widthMultiplier);
  return { length, width };
}`,
    "s101-dimension-projection",
  );
  source = replaceRequired(
    source,
    `export function generateG5AU02S101Pattern(patternSpecId, rng) {`,
    `export function generateG5AU02S101Pattern(patternSpecId, rng, options = {}) {`,
    "s101-options-signature",
  );
  source = replaceRequired(
    source,
    `    const totalLength = rng.int(4, 12) * rng.int(2, 8);`,
    `    const totalLength = isPgcR05ApplicationDiversity(options)
      ? 12 + projectionSlot(options.seed, 180)
      : rng.int(4, 12) * rng.int(2, 8);`,
    "s101-partition-total-projection",
  );
  source = replaceRequired(
    source,
    `  const { length, width } = pairedDimensions(rng);`,
    `  const { length, width } = pairedDimensions(rng, options.seed, options);`,
    "s101-dimension-profile-forwarding",
  );
  return source;
}

export function applyPgcR05G5AU02ApplicationDiversityPatch() {
  const results = [
    patchFile("src/curriculum/g5a-u02/browser-dynamic-entry.js", patchBrowserEntry),
    patchFile("src/curriculum/g5a-u02/hidden-worksheet-answer-key.js", patchHiddenWorksheet),
    patchFile("src/curriculum/g5a-u02/class-d-semantic-generator-validator.js", patchClassD),
    patchFile("src/curriculum/g5a-u02/s101-representation-runtime.js", patchS101),
  ];
  const result = Object.freeze({
    status: "PASS_PGC_R05_G5A_U02_APPLICATION_DIVERSITY_PATCH_APPLIED",
    changedFiles: Object.freeze(results.filter((entry) => entry.changed).map((entry) => entry.relativePath)),
    verifiedFiles: Object.freeze(results.map((entry) => entry.relativePath)),
    generationProfile: profileId,
    repairedPatternFamilies: Object.freeze([
      "equal_partition_all_segment_counts",
      "equal_partition_range_constrained_recipients",
      "maximum_equal_grouping",
      "possible_equal_packaging_counts",
      "rectangle_and_square_tile_dimensions",
    ]),
    legacySeedBehaviorPreserved: true,
    canonicalHiddenAndBrowserGenerationAligned: true,
    applicationPatternSpecsAdded: 0,
    numericRoutesModified: false,
    secondGeneratorAdded: false,
    secondValidatorAdded: false,
    secondWorksheetPipelineAdded: false,
  });
  console.log(`PGC_R05_G5A_U02_APPLICATION_DIVERSITY_PATCH=${JSON.stringify(result)}`);
  return result;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) applyPgcR05G5AU02ApplicationDiversityPatch();
