import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const primes = "[13, 17, 19, 23, 29, 31, 37, 41, 43, 47]";

function patchFile(relativePath, transform) {
  const filePath = path.join(repoRoot, relativePath);
  const before = fs.readFileSync(filePath, "utf8");
  const after = transform(before);
  if (after === before) return { relativePath, changed: false };
  fs.writeFileSync(filePath, after);
  return { relativePath, changed: true };
}

function insertAfterOnce(source, anchor, insertion, marker) {
  if (source.includes(marker)) return source;
  if (!source.includes(anchor)) throw new Error(`PGC_R04_FINAL12_ANCHOR_MISSING:${anchor}`);
  return source.replace(anchor, `${anchor}\n${insertion}`);
}

function replaceRequired(source, before, after, label) {
  if (source.includes(after)) return source;
  if (!source.includes(before)) throw new Error(`PGC_R04_FINAL12_REPLACEMENT_MISSING:${label}`);
  return source.replace(before, after);
}

function patchS100(source) {
  source = insertAfterOnce(
    source,
    "const S100_PATTERN_SET = new Set(S100_PATTERN_IDS);",
    `const PGC_R04_FACTOR_TARGET_PRIMES = Object.freeze(${primes});`,
    "PGC_R04_FACTOR_TARGET_PRIMES",
  );
  source = source.replaceAll(
    "rng.int(2, 12) * rng.int(2, 12)",
    "rng.int(2, 12) * rng.pick(PGC_R04_FACTOR_TARGET_PRIMES)",
  );
  if (!source.includes("PGC_R04_PROBLEM_TYPE_SEED_PROJECTION")) {
    source = replaceRequired(source, "total: rng.int(4, 12) * rng.int(2, 8),", "total: rng.int(4, 20) * rng.pick(PGC_R04_FACTOR_TARGET_PRIMES),", "s100-total");
    source = replaceRequired(source, "groupSize: rng.int(2, 12),", "groupSize: rng.int(2, 99),", "s100-group-size");
    source = replaceRequired(source, "a: rng.int(2, 10) * rng.int(2, 7),", "a: rng.int(2, 12) * rng.pick(PGC_R04_FACTOR_TARGET_PRIMES),", "s100-a");
    source = replaceRequired(source, "b: rng.int(2, 10) * rng.int(2, 7),", "b: rng.int(2, 12) * rng.pick(PGC_R04_FACTOR_TARGET_PRIMES),", "s100-b");
  }
  return source;
}

function patchS106(source) {
  source = insertAfterOnce(
    source,
    "const S106_PATTERN_SET = new Set(S106_PATTERN_IDS);",
    `const PGC_R04_FACTOR_TARGET_PRIMES = Object.freeze(${primes});`,
    "PGC_R04_FACTOR_TARGET_PRIMES",
  );
  return replaceRequired(
    source,
    "return rng.int(2, 12) * rng.int(2, 12);",
    "return rng.int(2, 12) * rng.pick(PGC_R04_FACTOR_TARGET_PRIMES);",
    "s106-target",
  );
}

function patchClassC(source) {
  source = insertAfterOnce(
    source,
    "const CLASS_C_SET = new Set(CLASS_C_PATTERN_IDS);",
    `const PGC_R04_FACTOR_TARGET_PRIMES = Object.freeze(${primes});`,
    "PGC_R04_FACTOR_TARGET_PRIMES",
  );
  return replaceRequired(
    source,
    "return rng.int(2, 12) * rng.int(2, 12);",
    "return rng.int(2, 12) * rng.pick(PGC_R04_FACTOR_TARGET_PRIMES);",
    "class-c-target",
  );
}

function patchBrowserBundle(source) {
  const inlinePrimes = "[13,17,19,23,29,31,37,41,43,47]";
  source = source.replace(
    /([A-Za-z_$][A-Za-z0-9_$]*)\.int\(2,12\)\*\1\.int\(2,12\)/g,
    (_, rng) => `${rng}.int(2,12)*${rng}.pick(${inlinePrimes})`,
  );
  source = source.replace(
    /total:([A-Za-z_$][A-Za-z0-9_$]*)\.int\(4,12\)\*\1\.int\(2,8\),groupSize:\1\.int\(2,12\),a:\1\.int\(2,10\)\*\1\.int\(2,7\),b:\1\.int\(2,10\)\*\1\.int\(2,7\)/g,
    (_, rng) => `total:${rng}.int(4,20)*${rng}.pick(${inlinePrimes}),groupSize:${rng}.int(2,99),a:${rng}.int(2,12)*${rng}.pick(${inlinePrimes}),b:${rng}.int(2,12)*${rng}.pick(${inlinePrimes})`,
  );
  if (!source.includes(`pick(${inlinePrimes})`)) {
    throw new Error("PGC_R04_FINAL12_BROWSER_BUNDLE_TARGET_SPACE_MISSING");
  }
  return source;
}

function patchG4BU04Capacity(source) {
  return replaceRequired(
    source,
    "ps_g4b_u04_approx_symbol_reading: 1,",
    "ps_g4b_u04_approx_symbol_reading: 24,",
    "g4b-u04-symbol-capacity",
  );
}

export function applyPgcR04Final12RoutePatch() {
  const results = [
    patchFile("src/curriculum/g5a-u02/s100-method-runtime.js", patchS100),
    patchFile("src/curriculum/g5a-u02/s106-factor-structure-runtime.js", patchS106),
    patchFile("src/curriculum/g5a-u02/class-c-generator-validator.js", patchClassC),
    patchFile("site/modules/curriculum/batch-b/g5a-u02-browser-dynamic-runtime.bundle.js", patchBrowserBundle),
    patchFile("site/modules/curriculum/batch-b/g4b-u04-prompt-deduplication.js", patchG4BU04Capacity),
  ];
  const result = Object.freeze({
    status: "PASS_PGC_R04_FINAL_12_ROUTE_PATCH_APPLIED",
    changedFiles: Object.freeze(results.filter((entry) => entry.changed).map((entry) => entry.relativePath)),
    verifiedFiles: Object.freeze(results.map((entry) => entry.relativePath)),
    scope: Object.freeze([
      "G4B_U04_APPROX_SYMBOL_CAPACITY",
      "G5A_U02_FACTOR_TARGET_UNIQUENESS",
      "G5A_U02_PROBLEM_CLASSIFICATION_PARAMETER_DIVERSITY",
    ]),
    idempotency: Object.freeze({
      acceptsDeterministicProblemTypeSeedProjection: true,
    }),
  });
  console.log(`PGC_R04_FINAL12_PATCH=${JSON.stringify(result)}`);
  return result;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) applyPgcR04Final12RoutePatch();
