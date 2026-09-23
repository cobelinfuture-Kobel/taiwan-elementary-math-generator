import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const marker = "PGC-R06 A02 G5A-U02 S107 deterministic diversity FullFix V3";
const generationProfile = "pgc-r06-reasoning-mixed-diversity-v1";

function replaceRequired(source, before, after, label) {
  if (source.includes(after)) return source;
  if (!source.includes(before)) throw new Error(`PGC_R06_A02_S107_PATCH_ANCHOR_MISSING:${label}`);
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

function patchBinding(source) {
  return replaceRequired(
    source,
    `    generateG5AU02S107Pattern(patternSpecId, createRng(seed)),`,
    `    generateG5AU02S107Pattern(patternSpecId, createRng(seed), { ...options, seed }),`,
    "binding-options-forwarding",
  );
}

function patchS107(source) {
  source = replaceRequired(
    source,
    `const SYMBOLIC_TARGETS = Object.freeze([12, 18, 20, 24, 28, 30, 36, 40, 42, 48, 54, 60, 72, 84, 90, 96]);`,
    `const SYMBOLIC_TARGETS = Object.freeze([12, 18, 20, 24, 28, 30, 36, 40, 42, 48, 54, 60, 72, 84, 90, 96]);\nconst PGC_R06_REASONING_MIXED_DIVERSITY_PROFILE = "pgc-r06-reasoning-mixed-diversity-v1";\n\nfunction isR06Diversity(options = {}) {\n  return options.generationProfile === PGC_R06_REASONING_MIXED_DIVERSITY_PROFILE;\n}\n\nfunction normalizedSeed(options = {}) {\n  return Number.isInteger(options.seed) && options.seed >= 1 ? options.seed : 1;\n}`,
    "s107-profile-helpers",
  );
  source = replaceRequired(
    source,
    `function factorCandidateItem(rng) {\n  const target = rng.int(3, 12) * rng.int(2, 10);`,
    `function factorCandidateItem(rng, options = {}) {\n  const seed = normalizedSeed(options);\n  const target = isR06Diversity(options)\n    ? 2 * (100 + ((seed - 1) % 4000))\n    : rng.int(3, 12) * rng.int(2, 10);`,
    "factor-candidate-target",
  );
  source = replaceRequired(
    source,
    `function symbolicFactorItem(rng) {\n  const target = rng.pick(SYMBOLIC_TARGETS);`,
    `function symbolicFactorItem(rng, options = {}) {\n  const seed = normalizedSeed(options);\n  const target = isR06Diversity(options)\n    ? 12 * (20 + ((seed - 1) % 800))\n    : rng.pick(SYMBOLIC_TARGETS);`,
    "symbolic-factor-target",
  );
  source = replaceRequired(
    source,
    `function commonFactorMarkingItem(rng) {\n  const commonBase = rng.int(2, 8);\n  const multiplierA = rng.int(2, 9);\n  let multiplierB = rng.int(2, 9);`,
    `function commonFactorMarkingItem(rng, options = {}) {\n  const seed = normalizedSeed(options);\n  const slot = (seed - 1) % 400;\n  const commonBase = isR06Diversity(options) ? 2 + (slot % 7) : rng.int(2, 8);\n  const multiplierA = isR06Diversity(options) ? 101 + (2 * slot) : rng.int(2, 9);\n  let multiplierB = isR06Diversity(options) ? multiplierA + 1 : rng.int(2, 9);`,
    "common-factor-target",
  );
  return replaceRequired(
    source,
    `export function generateG5AU02S107Pattern(patternSpecId, rng) {\n  if (patternSpecId === "ps_g5a_u02_divisor_candidate_selection") return factorCandidateItem(rng);\n  if (patternSpecId === "ps_g5a_u02_complete_factor_list_unknown_values") return symbolicFactorItem(rng);\n  if (patternSpecId === "ps_g5a_u02_common_factor_concept_identification") return commonFactorMarkingItem(rng);`,
    `export function generateG5AU02S107Pattern(patternSpecId, rng, options = {}) {\n  if (patternSpecId === "ps_g5a_u02_divisor_candidate_selection") return factorCandidateItem(rng, options);\n  if (patternSpecId === "ps_g5a_u02_complete_factor_list_unknown_values") return symbolicFactorItem(rng, options);\n  if (patternSpecId === "ps_g5a_u02_common_factor_concept_identification") return commonFactorMarkingItem(rng, options);`,
    "s107-router-options",
  );
}

const changedFiles = [
  ["src/curriculum/g5a-u02/class-c-hidden-projection-binding.js", patchBinding],
  ["src/curriculum/g5a-u02/s107-selection-symbolic-common-runtime.js", patchS107],
].filter(([relativePath, mutate]) => patchFile(relativePath, mutate)).map(([relativePath]) => relativePath);

console.log(`PGC_R06_A02_S107_DIVERSITY_FIX=${JSON.stringify({
  status: changedFiles.length ? "APPLIED" : "ALREADY_APPLIED",
  changedFiles,
  generationProfile,
  secondGeneratorAdded: false,
  secondValidatorAdded: false,
})}`);
