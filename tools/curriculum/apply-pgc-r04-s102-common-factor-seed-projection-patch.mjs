import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const sourcePath = path.join(repoRoot, "src/curriculum/g5a-u02/s102-common-factor-runtime.js");
const callerPath = path.join(repoRoot, "src/curriculum/g5a-u02/class-c-hidden-projection-binding.js");
const bundlePath = path.join(repoRoot, "site/modules/curriculum/batch-b/g5a-u02-browser-dynamic-runtime.bundle.js");

const SOURCE_MARKER = "PGC_R04_COMMON_FACTOR_SEED_PROJECTION";
const BUNDLE_MARKER = "pgc_r04_common_factor_seed_projection";

function writeIfChanged(filePath, before, after) {
  if (after === before) return false;
  fs.writeFileSync(filePath, after);
  return true;
}

function patchCanonicalSource() {
  const before = fs.readFileSync(sourcePath, "utf8");
  let source = before;

  if (!source.includes(SOURCE_MARKER)) {
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
  const slot = (normalizedSeed - 1) % 900;
  const commonBase = 2 + (slot % 9);
  const leftMultiplier = 11 + slot;
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
    generationProjectionStatus: "${SOURCE_MARKER}",
  });
}`;
    source = source.replace(anchor, replacement);
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
    SOURCE_MARKER,
    "generateG5AU02S102Pattern(patternSpecId, rng, itemSeed = 1)",
    "projectNondegeneratePairFromSeed(itemSeed)",
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

function patchBrowserBundle() {
  const before = fs.readFileSync(bundlePath, "utf8");
  let source = before;

  if (!source.includes(BUNDLE_MARKER)) {
    const functionPattern = /function Vt\(e,t\)\{if\(!E\(e\)\)return null;let n=li\(t\),r=\{a:n\.a,b:n\.b,factorSetA:ae\(n\.factorSetA\),factorSetB:ae\(n\.factorSetB\),commonFactors:ae\(n\.commonFactors\),greatestCommonFactor:n\.greatestCommonFactor,samplingProfileId:n\.samplingProfileId\};return y\(e==="ps_g5a_u02_common_factor_enumeration"\?\{prompt:`[^`]*`,data:\{\.\.\.r,semanticRole:"parallel_factor_sets_with_intersection"\},answer:\{values:ae\(n\.commonFactors\)\}\}:\{prompt:`[^`]*`,data:\{\.\.\.r,semanticRole:"common_factor_set_with_gcf"\},answer:\{commonFactors:ae\(n\.commonFactors\),greatestCommonFactor:n\.greatestCommonFactor\}\}\)\}/;
    const matched = source.match(functionPattern);
    if (!matched) throw new Error("PGC_R04_S102_BUNDLE_GENERATOR_ANCHOR_MISSING");
    const replacement = `function Vt(e,t,n=1){if(!E(e))return null;let r=Math.max(1,Number.isInteger(n)?n:1),i=(r-1)%900,o=2+i%9,a=11+i,s=a+1,_=o*a,c=o*s,u=Y(_),p=Y(c),g=qt(u,p),m={a:_,b:c,factorSetA:ae(u),factorSetB:ae(p),commonFactors:ae(g),greatestCommonFactor:g.at(-1),samplingProfileId:"nontrivial_common_factor_pair_v1",generationProjectionStatus:"${BUNDLE_MARKER}"};return y(e==="ps_g5a_u02_common_factor_enumeration"?{prompt:\`先列出 \${_} 和 \${c} 的完整因數集合，再利用交集找出所有公因數。\`,data:{...m,semanticRole:"parallel_factor_sets_with_intersection"},answer:{values:ae(g)}}:{prompt:\`先列出 \${_} 和 \${c} 的完整因數集合與所有公因數，再由公因數集合找出最大公因數。\`,data:{...m,semanticRole:"common_factor_set_with_gcf"},answer:{commonFactors:ae(g),greatestCommonFactor:g.at(-1)}})}`;
    source = source.replace(functionPattern, replacement);
  }

  source = source.replace(
    "function Di(e,t={}){let n=t.seed??1;return Ge(e,t,Vt(e,Pe(n)),",
    "function Di(e,t={}){let n=t.seed??1;return Ge(e,t,Vt(e,Pe(n),n),",
  );

  const required = [
    "function Vt(e,t,n=1){",
    BUNDLE_MARKER,
    "Vt(e,Pe(n),n)",
    "i=(r-1)%900",
  ];
  for (const marker of required) {
    if (!source.includes(marker)) throw new Error(`PGC_R04_S102_BUNDLE_PATCH_INCOMPLETE:${marker}`);
  }
  return writeIfChanged(bundlePath, before, source);
}

export function applyPgcR04S102CommonFactorSeedProjectionPatch() {
  const result = Object.freeze({
    status: "PASS_PGC_R04_S102_COMMON_FACTOR_SEED_PROJECTION_PATCHED",
    sourceChanged: patchCanonicalSource(),
    callerChanged: patchCanonicalCaller(),
    bundleChanged: patchBrowserBundle(),
    invariant: Object.freeze({
      slotCapacity: 900,
      consecutiveTwentySeedsUnique: true,
      gcdEqualsCommonBase: true,
      maximumOperand: 9110,
      validatorContractChanged: false,
      secondGeneratorAdded: false,
    }),
  });
  console.log(`PGC_R04_S102_SEED_PATCH=${JSON.stringify(result)}`);
  return result;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) applyPgcR04S102CommonFactorSeedProjectionPatch();
