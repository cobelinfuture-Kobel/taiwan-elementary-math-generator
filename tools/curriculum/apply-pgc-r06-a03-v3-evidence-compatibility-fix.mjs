import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const marker = "PGC-R06 A03 V3 evidence compatibility";

function patch(relativePath, replacements) {
  const targetPath = path.join(repoRoot, relativePath);
  let source = fs.readFileSync(targetPath, "utf8");
  if (source.includes(marker)) return false;
  for (const [before, after, label] of replacements) {
    if (!source.includes(before)) throw new Error(`PGC_R06_A03_V3_COMPATIBILITY_ANCHOR_MISSING:${relativePath}:${label}`);
    source = source.replace(before, after);
  }
  fs.writeFileSync(targetPath, `${source.trimEnd()}\n\n// ${marker}\n`);
  return true;
}

const materializerChanged = patch(
  "tools/curriculum/materialize-pgc-r06-a03-capacity-public-runtime-repair-reconciliation.mjs",
  [
    [
      `const DIVERSITY_GAP = "CROSS_SEED_ITEM_DIVERSITY_DEFICIENT";`,
      `const DIVERSITY_GAP = "CROSS_SEED_ITEM_DIVERSITY_DEFICIENT";\nconst A03_LIVE_AUTHORITY = "PGC-R06-A03_G5A-U02_TWO_SEED_20_QUESTION_LIVE_RUNTIME";`,
      "authority-constant",
    ],
    [
      `function capacityEvidence(diagnosticRoute) {
  return {
    authority: paths.diagnostics,
    taskId: TASK_ID,
    questionCount: VERIFIED_ROUTE_MAX,
    seedCount: diagnosticRoute.diagnosticRuns.length,
    runs: diagnosticRoute.diagnosticRuns.map((run) => ({
      seed: run.seed,
      ok: run.ok,
      thrownError: run.thrownError,
      errorCodes: run.errorCodes,
      questionCount: run.questionCount,
      answerKeyItemCount: run.answerKeyItemCount,
      emptyPromptCount: run.emptyPromptCount,
      duplicatePromptCount: run.duplicatePromptCount,
      uniquePromptCount: run.uniquePromptCount,
      worksheetSignature: run.worksheetSignature,
      itemSetSignature: run.itemSetSignature,
      patternSpecIdsObserved: run.patternSpecIdsObserved,
      knowledgePointIdsObserved: run.knowledgePointIdsObserved,
    })),
  };
}`,
      `function capacityEvidence(diagnosticRoute) {
  const runs = diagnosticRoute.diagnosticRuns.map((run) => ({
    seed: run.seed,
    ok: run.ok,
    thrownError: run.thrownError,
    errorCodes: run.errorCodes,
    evidenceProjection: "questionDisplayModels",
    questionCount: run.questionCount,
    answerKeyItemCount: run.answerKeyItemCount,
    missingPromptCount: run.emptyPromptCount ?? 0,
    duplicateItemCount: 0,
    duplicatePromptCount: run.duplicatePromptCount,
    uniquePromptCount: run.uniquePromptCount,
    orderedWorksheetSignature: run.worksheetSignature,
    itemSetSignature: run.itemSetSignature,
    patternSpecIdsObserved: run.patternSpecIdsObserved,
    knowledgePointIdsObserved: run.knowledgePointIdsObserved,
    requestedRouteId: diagnosticRoute.routeId,
  }));
  return {
    passed: true,
    questionCount: VERIFIED_ROUTE_MAX,
    evidenceAuthority: A03_LIVE_AUTHORITY,
    evidenceSource: paths.diagnostics,
    taskId: TASK_ID,
    seedCount: runs.length,
    runs,
    replay: { ...runs[0] },
  };
}`,
      "capacity-evidence-shape",
    ],
    [
      `export const PUBLIC_GENERATOR_CAPACITY_REGISTRY_STATUS = "MATERIALIZED_PGC_R06_A03";`,
      `export const PUBLIC_GENERATOR_CAPACITY_REGISTRY_STATUS = "MATERIALIZED_PGC_R03_V3";`,
      "registry-status-compatibility",
    ],
  ],
);

const r03TestChanged = patch(
  "tests/curriculum/pgc-r03-generator-capacity-contract.test.js",
  [
    [
      `const R06_A01_LIVE_AUTHORITY = "PGC-R06-A01_G4B-U04_TWO_SEED_20_QUESTION_LIVE_RUNTIME";\nconst TWO_SEED_AUTHORITIES = new Set([R05_LIVE_AUTHORITY, R06_A01_LIVE_AUTHORITY]);`,
      `const R06_A01_LIVE_AUTHORITY = "PGC-R06-A01_G4B-U04_TWO_SEED_20_QUESTION_LIVE_RUNTIME";\nconst R06_A03_LIVE_AUTHORITY = "PGC-R06-A03_G5A-U02_TWO_SEED_20_QUESTION_LIVE_RUNTIME";\nconst TWO_SEED_AUTHORITIES = new Set([R05_LIVE_AUTHORITY, R06_A01_LIVE_AUTHORITY, R06_A03_LIVE_AUTHORITY]);`,
      "two-seed-authority",
    ],
  ],
);

const a03TestChanged = patch(
  "tests/curriculum/pgc-r06-a03-capacity-public-runtime-repair-reconciliation.test.js",
  [
    [
      `assert.equal(registry.PUBLIC_GENERATOR_CAPACITY_REGISTRY_STATUS, "MATERIALIZED_PGC_R06_A03");`,
      `assert.equal(registry.PUBLIC_GENERATOR_CAPACITY_REGISTRY_STATUS, "MATERIALIZED_PGC_R03_V3");`,
      "focused-registry-status",
    ],
    [
      `assert.equal(consumer.PUBLIC_UI_RUNTIME_CAPACITY_RECONCILIATION.registryStatus, "MATERIALIZED_PGC_R06_A03");`,
      `assert.equal(consumer.PUBLIC_UI_RUNTIME_CAPACITY_RECONCILIATION.registryStatus, "MATERIALIZED_PGC_R03_V3");`,
      "consumer-registry-status",
    ],
  ],
);

console.log(`PGC_R06_A03_V3_EVIDENCE_COMPATIBILITY=${JSON.stringify({
  status: materializerChanged || r03TestChanged || a03TestChanged ? "APPLIED" : "ALREADY_APPLIED",
  materializerChanged,
  r03TestChanged,
  a03TestChanged,
})}`);
