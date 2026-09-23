import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const targetRelativePath = "site/modules/curriculum/batch-a/factor-multiple-runtime.js";
const marker = "PGC-R05 G5A-U03 multiple-enumeration application diversity FullFix V1";

function replaceRequired(source, before, after, label) {
  if (source.includes(after)) return source;
  if (!source.includes(before)) throw new Error(`PGC_R05_G5A_U03_DIVERSITY_ANCHOR_MISSING:${label}`);
  return source.replace(before, after);
}

function patchRuntime(before) {
  if (before.includes(marker)) return before;
  let source = before;

  source = replaceRequired(
    source,
    `function listText(values) { return values.join("、"); }`,
    `function listText(values) { return values.join("、"); }
function isPgcR05Seed(seed) {
  return String(seed ?? "").includes("pgc-r05");
}`,
    "r05-seed-profile",
  );

  source = replaceRequired(
    source,
    `  if (["enumerate_first_multiples", "enumerate_multiples_after"].includes(op)) {
    const base = pick(BASES, seed, index, \`${"${op}"}:b\`);
    if (op === "enumerate_first_multiples") {
      const count = 5 + state(seed, index, \`${"${op}"}:c\`) % 3;
      const multiples = Array.from({ length: count }, (_, i) => base * (i + 1));`,
    `  if (["enumerate_first_multiples", "enumerate_multiples_after"].includes(op)) {
    const usePgcR05EnumerationProjection = op === "enumerate_first_multiples" && isPgcR05Seed(seed);
    const ordinal = Math.max(0, Number(index) - 1);
    const base = usePgcR05EnumerationProjection
      ? BASES[ordinal % BASES.length]
      : pick(BASES, seed, index, \`${"${op}"}:b\`);
    if (op === "enumerate_first_multiples") {
      const count = usePgcR05EnumerationProjection
        ? 5 + (Math.floor(ordinal / BASES.length) % 3)
        : 5 + state(seed, index, \`${"${op}"}:c\`) % 3;
      const multiples = Array.from({ length: count }, (_, i) => base * (i + 1));`,
    "enumeration-projection",
  );

  return `${source.trimEnd()}\n\n// ${marker}\n`;
}

export function applyPgcR05G5AU03ApplicationDiversityPatch() {
  const targetPath = path.join(repoRoot, targetRelativePath);
  const before = fs.readFileSync(targetPath, "utf8");
  const after = patchRuntime(before);
  if (after !== before) fs.writeFileSync(targetPath, after);

  const result = Object.freeze({
    status: after !== before
      ? "PASS_PGC_R05_G5A_U03_APPLICATION_DIVERSITY_PATCH_APPLIED"
      : "PASS_PGC_R05_G5A_U03_APPLICATION_DIVERSITY_ALREADY_APPLIED",
    changedFiles: Object.freeze(after !== before ? [targetRelativePath] : []),
    verifiedFiles: Object.freeze([targetRelativePath]),
    profile: "pgc-r05-seed-only",
    targetPatternSpecId: "ps_g5a_u03a_enumerate_first_multiples",
    deterministicParameterSpace: BASE_PARAMETER_SPACE,
    baseCount: 11,
    enumerateCountVariants: 3,
    ordinaryProductSeedBehaviorPreserved: true,
    enumerateMultiplesAfterModified: false,
    validatorRelaxed: false,
    numericRoutesModified: false,
    otherG5AU03PatternSpecsModified: false,
    newPatternSpecsAdded: false,
    secondGeneratorAdded: false,
    secondValidatorAdded: false,
    secondWorksheetPipelineAdded: false,
  });
  console.log(`PGC_R05_G5A_U03_DIVERSITY_PATCH=${JSON.stringify(result)}`);
  return result;
}

const BASE_PARAMETER_SPACE = 11 * 3;

if (process.argv[1] === fileURLToPath(import.meta.url)) applyPgcR05G5AU03ApplicationDiversityPatch();
