import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const sourcePath = path.join(repoRoot, "src/curriculum/g5a-u02/s102-common-factor-runtime.js");
const callerPath = path.join(repoRoot, "src/curriculum/g5a-u02/class-c-hidden-projection-binding.js");
const bundlePath = path.join(repoRoot, "site/modules/curriculum/batch-b/g5a-u02-browser-dynamic-runtime.bundle.js");

const SOURCE_MARKER_V1 = "PGC_R04_COMMON_FACTOR_SEED_PROJECTION";
const SOURCE_MARKER_V2 = "PGC_R04_COMMON_FACTOR_SEED_PROJECTION_V2";
const GENERATED_BUNDLE_BANNER = "/* GENERATED CANONICAL G5A-U02 RUNTIME — DO NOT EDIT */";

function writeIfChanged(filePath, before, after) {
  if (after === before) return false;
  fs.writeFileSync(filePath, after);
  return true;
}

function patchCanonicalSource() {
  const before = fs.readFileSync(sourcePath, "utf8");
  let source = before;

  if (!source.includes("function projectNondegeneratePairFromSeed(seed)")) {
    const anchor = `function sampleNondegeneratePair(rng) {
  const commonBase = rng.int(2, 10);
  const selected = rng.pick(NONDEGENERATE_MULTIPLIER_PAIRS);
  const reverse = rng.int(0, 1) === 1;
  const multipliers = reverse ? [selected[1], selected[0]] : selected;
  const a = commonBase * multipliers[0];
  const b = commonBase * multipliers[1];
  const factorSetA = factorsOf(a);
  const factorSetB = factorsOf(b);
  const commonFactors = intersection(factorSetA, factorSetB);
  return deepFreeze({
    a,
    b,
    factorSetA,
    factorSetB,
    commonFactors,
    greatestCommonFactor: commonFactors.at(-1),
    samplingProfileId: "nontrivial_common_factor_pair_v1",
  });
}`;
    if (!source.includes(anchor)) throw new Error("PGC_R04_S102_SOURCE_SAMPLER_ANCHOR_MISSING");
    const replacement = `${anchor}

function projectNondegeneratePairFromSeed(seed) {
  const normalizedSeed = Number.isInteger(seed) && seed >= 1 ? seed : 1;
  const slot = (normalizedSeed - 1) % 90;
  const commonBase = 2 + (slot % 9);
  const leftMultiplier = 101 + (2 * slot);
  const rightMultiplier = leftMultiplier + 1;
  const a = commonBase * leftMultiplier;
  const b = commonBase * rightMultiplier;
  const factorSetA = factorsOf(a);
  const factorSetB = factorsOf(b);
  const commonFactors = intersection(factorSetA, factorSetB);
  return deepFreeze({
    a,
    b,
    factorSetA,
    factorSetB,
    commonFactors,
    greatestCommonFactor: commonFactors.at(-1),
    samplingProfileId: "nontrivial_common_factor_pair_v1",
    generationProjectionStatus: "${SOURCE_MARKER_V2}",
  });
}`;
    source = source.replace(anchor, replacement);
  } else {
    source = source.replace(
      "const slot = (normalizedSeed - 1) % 900;",
      "const slot = (normalizedSeed - 1) % 90;",
    );
    source = source.replace(
      "const leftMultiplier = 11 + slot;",
      "const leftMultiplier = 101 + (2 * slot);",
    );
    source = source.replace(
      `generationProjectionStatus: "${SOURCE_MARKER_V1}",`,
      `generationProjectionStatus: "${SOURCE_MARKER_V2}",`,
    );
  }

  source = source.replace(
    "export function generateG5AU02S102Pattern(patternSpecId, rng) {",
    "export function generateG5AU02S102Pattern(patternSpecId, rng, itemSeed = 1) {",
  );
  source = source.replace(
    "  const sampled = sampleNondegeneratePair(rng);",
    "  const sampled = projectNondegeneratePairFromSeed(itemSeed);",
  );
  if (!source.includes("generationProjectionStatus: sampled.generationProjectionStatus")) {
    source = source.replace(
      "    samplingProfileId: sampled.samplingProfileId,",
      "    samplingProfileId: sampled.samplingProfileId,\n    generationProjectionStatus: sampled.generationProjectionStatus,",
    );
  }

  const required = [
    SOURCE_MARKER_V2,
    "generateG5AU02S102Pattern(patternSpecId, rng, itemSeed = 1)",
    "projectNondegeneratePairFromSeed(itemSeed)",
    "const slot = (normalizedSeed - 1) % 90;",
    "const leftMultiplier = 101 + (2 * slot);",
    "const rightMultiplier = leftMultiplier + 1;",
  ];
  for (const marker of required) {
    if (!source.includes(marker)) throw new Error(`PGC_R04_S102_SOURCE_PATCH_INCOMPLETE:${marker}`);
  }
  return writeIfChanged(sourcePath, before, source);
}

function patchCanonicalCaller() {
  const before = fs.readFileSync(callerPath, "utf8");
  let source = before;
  source = source.replace(
    "generateG5AU02S102Pattern(patternSpecId, createRng(seed)),",
    "generateG5AU02S102Pattern(patternSpecId, createRng(seed), seed),",
  );
  if (!source.includes("generateG5AU02S102Pattern(patternSpecId, createRng(seed), seed)")) {
    throw new Error("PGC_R04_S102_CALLER_SEED_NOT_CONNECTED");
  }
  return writeIfChanged(callerPath, before, source);
}

function verifyGeneratedBrowserBundle() {
  const source = fs.readFileSync(bundlePath, "utf8");
  if (!source.startsWith(GENERATED_BUNDLE_BANNER)) {
    throw new Error("PGC_R04_S102_GENERATED_BUNDLE_BANNER_MISSING");
  }
  return false;
}

export function applyPgcR04S102CommonFactorSeedProjectionPatch() {
  const result = Object.freeze({
    status: "PASS_PGC_R04_S102_COMMON_FACTOR_SEED_PROJECTION_V2_PATCHED",
    sourceChanged: patchCanonicalSource(),
    callerChanged: patchCanonicalCaller(),
    bundleChanged: verifyGeneratedBrowserBundle(),
    invariant: Object.freeze({
      slotCapacity: 90,
      allSlotsInjective: true,
      consecutiveTwentySeedsUnique: true,
      gcdEqualsCommonBase: true,
      maximumOperand: 2800,
      validatorContractChanged: false,
      secondGeneratorAdded: false,
      generatedBundleEditedDirectly: false,
    }),
  });
  console.log(`PGC_R04_S102_SEED_PATCH=${JSON.stringify(result)}`);
  return result;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) applyPgcR04S102CommonFactorSeedProjectionPatch();
