import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function write(relativePath, content) {
  fs.writeFileSync(path.join(repoRoot, relativePath), content);
}

function replaceExact(relativePath, from, to, expectedCount = 1) {
  const original = read(relativePath);
  const count = original.split(from).length - 1;
  if (count !== expectedCount) {
    throw new Error(`${relativePath}: expected ${expectedCount} occurrence(s), found ${count}: ${from}`);
  }
  write(relativePath, original.replaceAll(from, to));
}

for (const relativePath of ["site/index.html", "site/404.html"]) {
  replaceExact(
    relativePath,
    'id="batch-a-question-count-input" name="batchAQuestionCount" type="number" min="1" max="20" value="20"',
    'id="batch-a-question-count-input" name="batchAQuestionCount" type="number" min="1" max="240" value="20"',
  );
}

replaceExact(
  "site/pixel/index.html",
  'id="pixel-question-count" type="number" min="1" max="20" value="20"',
  'id="pixel-question-count" type="number" min="1" max="240" value="20"',
);

replaceExact(
  "site/assets/browser/state/config-state-core.js",
  "questionCount: positiveInteger(options.questionCount ?? config?.generation?.questionCount, 20),",
  "questionCount: positiveInteger(options.questionCount ?? config?.generation?.questionCount, 20, 1, 240),",
);
replaceExact(
  "site/assets/browser/state/config-state-core.js",
  "state.batchA.questionCount = positiveInteger(normalizedValue, state.batchA.questionCount);",
  "state.batchA.questionCount = positiveInteger(normalizedValue, state.batchA.questionCount, 1, 240);",
);

replaceExact(
  "site/modules/curriculum/public/public-ui-capability-binding.js",
  "  max: 20,",
  "  max: 240,",
);
replaceExact(
  "site/modules/curriculum/public/public-ui-capability-binding.js",
  'capacityStatus: boundedMax === 20 ? "VERIFIED_20" : boundedMax > 0 ? "VERIFIED_LIMITED" : "FAIL_CLOSED_NO_LEGAL_CAPACITY",',
  'capacityStatus: boundedMax >= 20 ? "VERIFIED_20" : boundedMax > 0 ? "VERIFIED_LIMITED" : "FAIL_CLOSED_NO_LEGAL_CAPACITY",',
);

const materializerPath = "tools/curriculum/materialize-pgc-r03-capacity-aware-reconciliation.mjs";
replaceExact(
  materializerPath,
  'const HARD_CEILING = 20;\nconst SEED_COUNT = 10;\nconst SEEDS = Object.freeze(Array.from({ length: SEED_COUNT }, (_, index) => `pgc-r03-seed-${String(index + 1).padStart(2, "0")}`));',
  'const BASELINE_VERIFIED_CAPACITY = 20;\nconst HARD_CEILING = 240;\nconst SEED_COUNT = 10;\nconst SEEDS = Object.freeze(Array.from({ length: SEED_COUNT }, (_, index) => `pgc-r03-seed-${String(index + 1).padStart(2, "0")}`));\nconst CEILING_SEED_COUNT = 2;\nconst CEILING_SEEDS = Object.freeze(SEEDS.slice(0, CEILING_SEED_COUNT));\nconst CEILING_EVIDENCE_AUTHORITY = "PUBLIC_LIMIT_240_TWO_SEED_RUNTIME";',
);
replaceExact(
  materializerPath,
  `function priorTwentyEvidence(route) {\n  const runs = safeArray(route.seedRuns);\n  const replay = route.replay;\n  const passed = runs.length === SEED_COUNT\n    && runs.every((run) => safeRun(run, HARD_CEILING))\n    && replay\n    && safeRun(replay, HARD_CEILING)\n    && replayPassed(runs[0], replay);\n  return passed ? { questionCount: HARD_CEILING, runs, replay, passed: true } : null;\n}`,
  `function priorSelectedEvidence(route) {\n  const evidence = route?.selectedCapacityEvidence;\n  const questionCount = Number(evidence?.questionCount ?? 0);\n  const runs = safeArray(evidence?.runs);\n  const replay = evidence?.replay;\n  const passed = evidence?.passed === true\n    && Number.isInteger(questionCount)\n    && questionCount > 0\n    && runs.length > 0\n    && runs.every((run) => safeRun(run, questionCount))\n    && replay\n    && safeRun(replay, questionCount)\n    && replayPassed(runs[0], replay);\n  return passed ? { ...evidence, questionCount, runs, replay, passed: true } : null;\n}`,
);
replaceExact(
  materializerPath,
  `async function auditAtCount(buildWorksheetDocumentFromPlan, route, questionCount) {\n  const runs = [];\n  for (const seed of SEEDS) {\n    const run = await runOne(buildWorksheetDocumentFromPlan, route, seed, questionCount);\n    runs.push(run);\n    if (!safeRun(run, questionCount)) return { questionCount, runs, replay: null, passed: false };\n  }\n  const replay = await runOne(buildWorksheetDocumentFromPlan, route, SEEDS[0], questionCount);\n  return {\n    questionCount,\n    runs,\n    replay,\n    passed: safeRun(replay, questionCount) && replayPassed(runs[0], replay),\n  };\n}`,
  `async function auditAtCount(buildWorksheetDocumentFromPlan, route, questionCount, seeds = SEEDS, evidenceAuthority = null) {\n  const runs = [];\n  for (const seed of seeds) {\n    const run = await runOne(buildWorksheetDocumentFromPlan, route, seed, questionCount);\n    runs.push(run);\n    if (!safeRun(run, questionCount)) return { questionCount, runs, replay: null, passed: false, evidenceAuthority };\n  }\n  const replay = await runOne(buildWorksheetDocumentFromPlan, route, seeds[0], questionCount);\n  return {\n    questionCount,\n    runs,\n    replay,\n    passed: safeRun(replay, questionCount) && replayPassed(runs[0], replay),\n    evidenceAuthority,\n  };\n}`,
);
replaceExact(
  materializerPath,
  `  let evidence = priorTwentyEvidence(priorRoute);\n  if (!evidence) {\n    for (let questionCount = HARD_CEILING - 1; questionCount >= 1; questionCount -= 1) {\n      const candidate = await auditAtCount(buildWorksheetDocumentFromPlan, route, questionCount);\n      if (candidate.passed) {\n        evidence = candidate;\n        break;\n      }\n    }\n  }`,
  `  let evidence = priorSelectedEvidence(priorRoute);\n  const ceilingEvidence = await auditAtCount(\n    buildWorksheetDocumentFromPlan,\n    route,\n    HARD_CEILING,\n    CEILING_SEEDS,\n    CEILING_EVIDENCE_AUTHORITY,\n  );\n  if (ceilingEvidence.passed) evidence = ceilingEvidence;\n  if (!evidence) {\n    for (let questionCount = BASELINE_VERIFIED_CAPACITY; questionCount >= 1; questionCount -= 1) {\n      const candidate = await auditAtCount(buildWorksheetDocumentFromPlan, route, questionCount);\n      if (candidate.passed) {\n        evidence = candidate;\n        break;\n      }\n    }\n  }`,
);
replaceExact(
  materializerPath,
  'if (verifiedMaxQuestionCount > 0 && verifiedMaxQuestionCount < HARD_CEILING) downstreamGapCodes.push("CAPACITY_BELOW_20");',
  'if (verifiedMaxQuestionCount > 0 && verifiedMaxQuestionCount < BASELINE_VERIFIED_CAPACITY) downstreamGapCodes.push("CAPACITY_BELOW_20");',
);
replaceExact(
  materializerPath,
  'capacityStatus: verifiedMaxQuestionCount === HARD_CEILING\n      ? "VERIFIED_20"',
  'capacityStatus: verifiedMaxQuestionCount >= BASELINE_VERIFIED_CAPACITY\n      ? "VERIFIED_20"',
);
replaceExact(
  materializerPath,
  "      reconciliationCodes: priorCodes,",
  `      reconciliationCodes: unique([\n        ...safeArray(priorRoute.reconciliationCodes),\n        ...priorCodes,\n      ]),`,
  1,
);
replaceExact(
  materializerPath,
  "    reconciliationCodes: priorCodes,",
  `    reconciliationCodes: unique([\n      ...safeArray(priorRoute.reconciliationCodes),\n      ...priorCodes,\n      ...(evidence?.evidenceAuthority === CEILING_EVIDENCE_AUTHORITY\n        ? ["PUBLIC_LIMIT_240_TWO_SEED_RUNTIME_RECONCILED"]\n        : []),\n    ]),`,
  1,
);
replaceExact(
  materializerPath,
  "      crossSeedDiversityIsDownstreamQualityGap: true,",
  "      crossSeedDiversityIsDownstreamQualityGap: true,\n      hardCeilingExtensionAuthority: CEILING_EVIDENCE_AUTHORITY,\n      hardCeilingExtensionSeedCount: CEILING_SEED_COUNT,",
);

const testPath = "tests/curriculum/pgc-r03-generator-capacity-contract.test.js";
replaceExact(
  testPath,
  'const R06_A01_LIVE_AUTHORITY = "PGC-R06-A01_G4B-U04_TWO_SEED_20_QUESTION_LIVE_RUNTIME";\nconst TWO_SEED_AUTHORITIES = new Set([R05_LIVE_AUTHORITY, R06_A01_LIVE_AUTHORITY]);',
  'const R06_A01_LIVE_AUTHORITY = "PGC-R06-A01_G4B-U04_TWO_SEED_20_QUESTION_LIVE_RUNTIME";\nconst PUBLIC_LIMIT_240_AUTHORITY = "PUBLIC_LIMIT_240_TWO_SEED_RUNTIME";\nconst TWO_SEED_AUTHORITIES = new Set([R05_LIVE_AUTHORITY, R06_A01_LIVE_AUTHORITY, PUBLIC_LIMIT_240_AUTHORITY]);',
);
replaceExact(testPath, "assert.equal(contract.hardCeiling, 20);", "assert.equal(contract.hardCeiling, 240);");
replaceExact(
  testPath,
  "assert.ok(route.verifiedMaxQuestionCount >= 0 && route.verifiedMaxQuestionCount <= 20, route.routeId);",
  "assert.ok(route.verifiedMaxQuestionCount >= 0 && route.verifiedMaxQuestionCount <= 240, route.routeId);",
);
replaceExact(
  testPath,
  "  assert.ok(exposedCount > 0);",
  "  assert.ok(exposedCount > 0);\n  assert.ok(contract.routes.some((route) => route.legalRoute && route.verifiedMaxQuestionCount === 240), \"expected at least one verified 240-question route\");",
);

console.log("PUBLIC_QUESTION_LIMIT_240_PATCH_APPLIED");
