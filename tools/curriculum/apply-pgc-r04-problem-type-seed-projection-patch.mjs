import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const sourceRoot = path.join(repoRoot, "src/curriculum/g5a-u02");
const s100Path = path.join(sourceRoot, "s100-method-runtime.js");
const bundlePath = path.join(repoRoot, "site/modules/curriculum/batch-b/g5a-u02-browser-dynamic-runtime.bundle.js");

const SOURCE_MARKER = "PGC_R04_PROBLEM_TYPE_SEED_PROJECTION";
const BUNDLE_MARKER = "pgc_r04_problem_type_seed_projection";

function writeIfChanged(filePath, before, after) {
  if (after === before) return false;
  fs.writeFileSync(filePath, after);
  return true;
}

function patchCanonicalS100() {
  const before = fs.readFileSync(s100Path, "utf8");
  let source = before;

  if (!source.includes(SOURCE_MARKER)) {
    const anchor = "const PROBLEM_SCENARIO_IDS = Object.freeze(Object.keys(PROBLEM_SCENARIOS));";
    if (!source.includes(anchor)) throw new Error("PGC_R04_PROBLEM_TYPE_SOURCE_HELPER_ANCHOR_MISSING");
    source = source.replace(anchor, `${anchor}\n\nfunction projectProblemTypeScenario(seed) {\n  const normalizedSeed = Number.isInteger(seed) && seed >= 1 ? seed : 1;\n  const familyIndex = (normalizedSeed - 1) % PROBLEM_SCENARIO_IDS.length;\n  const cycle = Math.floor((normalizedSeed - 1) / PROBLEM_SCENARIO_IDS.length);\n  const slot = cycle % 90;\n  return Object.freeze({\n    scenarioFamilyId: PROBLEM_SCENARIO_IDS[familyIndex],\n    values: Object.freeze({\n      total: 120 + slot,\n      groupSize: 2 + slot,\n      a: 24 + (2 * slot),\n      b: 36 + (2 * slot),\n    }),\n    projectionStatus: "${SOURCE_MARKER}",\n  });\n}`);
  }

  source = source.replace(
    "export function generateG5AU02S100Pattern(patternSpecId, rng) {",
    "export function generateG5AU02S100Pattern(patternSpecId, rng, itemSeed = 1) {",
  );

  if (!source.includes("const projected = projectProblemTypeScenario(itemSeed);")) {
    const pattern = /    case "ps_g5a_u02_problem_type_classification": \{[\s\S]*?\n    \}\n\n    case "ps_g5a_u02_complete_factor_list_statement_evaluation": \{/;
    if (!pattern.test(source)) throw new Error("PGC_R04_PROBLEM_TYPE_SOURCE_CASE_ANCHOR_MISSING");
    source = source.replace(pattern, `    case "ps_g5a_u02_problem_type_classification": {\n      const projected = projectProblemTypeScenario(itemSeed);\n      const scenario = PROBLEM_SCENARIOS[projected.scenarioFamilyId];\n      const built = scenario.build(projected.values);\n      return {\n        data: {\n          contextKind: scenario.expectedLabel,\n          scenarioFamilyId: projected.scenarioFamilyId,\n          scenarioText: built.scenarioText,\n          quantityRoles: built.quantityRoles,\n          expectedLabel: scenario.expectedLabel,\n          generationProjectionStatus: projected.projectionStatus,\n        },\n        prompt: \`${'${built.scenarioText}'}\\n請判斷這是因數、倍數、公因數或公倍數問題。\`,\n        answer: { label: scenario.expectedLabel },\n      };\n    }\n\n    case "ps_g5a_u02_complete_factor_list_statement_evaluation": {`);
  }

  if (!source.includes("generateG5AU02S100Pattern(patternSpecId, rng, itemSeed = 1)")) {
    throw new Error("PGC_R04_PROBLEM_TYPE_SOURCE_SIGNATURE_NOT_PATCHED");
  }
  return writeIfChanged(s100Path, before, source);
}

function patchCanonicalCallers() {
  const changed = [];
  const files = fs.readdirSync(sourceRoot)
    .filter((name) => name.endsWith(".js") && name !== "s100-method-runtime.js")
    .map((name) => path.join(sourceRoot, name));

  for (const filePath of files) {
    const before = fs.readFileSync(filePath, "utf8");
    let source = before;
    source = source.replace(
      /generateG5AU02S100Pattern\(([^,\n]+),\s*createRng\(([^)]+)\)\)/g,
      "generateG5AU02S100Pattern($1, createRng($2), $2)",
    );
    source = source.replace(
      /generateG5AU02S100Pattern\(([^,\n]+),\s*rng\)/g,
      "generateG5AU02S100Pattern($1, rng, seed)",
    );
    if (writeIfChanged(filePath, before, source)) changed.push(path.relative(repoRoot, filePath));
  }

  const callerFiles = files.filter((filePath) => fs.readFileSync(filePath, "utf8").includes("generateG5AU02S100Pattern("));
  if (callerFiles.length === 0) throw new Error("PGC_R04_PROBLEM_TYPE_SOURCE_CALLER_NOT_FOUND");
  for (const filePath of callerFiles) {
    const source = fs.readFileSync(filePath, "utf8");
    const unpatchedCall = /generateG5AU02S100Pattern\(([^,\n]+),\s*(?:createRng\([^)]+\)|rng)\)/.test(source);
    if (unpatchedCall) throw new Error(`PGC_R04_PROBLEM_TYPE_SOURCE_CALLER_SEED_MISSING:${path.relative(repoRoot, filePath)}`);
  }
  return changed;
}

function patchBrowserBundle() {
  const before = fs.readFileSync(bundlePath, "utf8");
  let source = before;

  source = source.replace("function xt(e,t){", "function xt(e,t,n=1){");
  source = source.replace("xt(e,Pe(n))", "xt(e,Pe(n),n)");

  if (!source.includes(BUNDLE_MARKER)) {
    const pattern = /case"ps_g5a_u02_problem_type_classification":\{let n=t\.pick\(oi\),r=Oe\[n\],i=\{[\s\S]*?answer:\{label:r\.expectedLabel\}\}\}/;
    if (!pattern.test(source)) throw new Error("PGC_R04_PROBLEM_TYPE_BUNDLE_CASE_ANCHOR_MISSING");
    source = source.replace(pattern, `case"ps_g5a_u02_problem_type_classification":{let r=Math.max(1,Number.isInteger(n)?n:1),i=(r-1)%oi.length,o=Math.floor((r-1)/oi.length)%90,a=oi[i],s=Oe[a],_={total:120+o,groupSize:2+o,a:24+2*o,b:36+2*o},c=s.build(_);return{data:{contextKind:s.expectedLabel,scenarioFamilyId:a,scenarioText:c.scenarioText,quantityRoles:c.quantityRoles,expectedLabel:s.expectedLabel,generationProjectionStatus:"${BUNDLE_MARKER}"},prompt:\`${'${c.scenarioText}'}\n請判斷這是因數、倍數、公因數或公倍數問題。\`,answer:{label:s.expectedLabel}}}`);
  }

  const checks = [
    "function xt(e,t,n=1){",
    "xt(e,Pe(n),n)",
    BUNDLE_MARKER,
  ];
  for (const check of checks) {
    if (!source.includes(check)) throw new Error(`PGC_R04_PROBLEM_TYPE_BUNDLE_PATCH_INCOMPLETE:${check}`);
  }
  return writeIfChanged(bundlePath, before, source);
}

export function applyPgcR04ProblemTypeSeedProjectionPatch() {
  const sourceChanged = patchCanonicalS100();
  const callerFilesChanged = patchCanonicalCallers();
  const bundleChanged = patchBrowserBundle();
  const result = Object.freeze({
    status: "PASS_PGC_R04_PROBLEM_TYPE_SEED_PROJECTION_PATCHED",
    sourceChanged,
    callerFilesChanged: Object.freeze(callerFilesChanged),
    bundleChanged,
    invariant: Object.freeze({
      consecutiveTwentySeedsMapToFiveUniqueSlotsPerScenarioFamily: true,
      scenarioFamilyCount: 4,
      slotCycle: 90,
      validatorContractChanged: false,
      secondGeneratorAdded: false,
    }),
  });
  console.log(`PGC_R04_PROBLEM_TYPE_SEED_PATCH=${JSON.stringify(result)}`);
  return result;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) applyPgcR04ProblemTypeSeedProjectionPatch();
