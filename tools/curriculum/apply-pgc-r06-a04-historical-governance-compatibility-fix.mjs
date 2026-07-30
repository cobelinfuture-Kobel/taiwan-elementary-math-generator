import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function replaceRequired(source, before, after, label) {
  if (source.includes(after)) return source;
  if (!source.includes(before)) throw new Error(`PGC_R06_A04_COMPATIBILITY_ANCHOR_MISSING:${label}`);
  return source.replace(before, after);
}

function patch(relativePath, mutate) {
  const filePath = path.join(repoRoot, relativePath);
  const before = fs.readFileSync(filePath, "utf8");
  const after = mutate(before);
  if (after !== before) fs.writeFileSync(filePath, after);
  return after !== before;
}

const changed = [];

if (patch("tests/curriculum/pgc-r03-generator-capacity-contract.test.js", (input) => {
  let source = replaceRequired(
    input,
    `const R06_A03_LIVE_AUTHORITY = "PGC-R06-A03_G5A-U02_TWO_SEED_20_QUESTION_LIVE_RUNTIME";`,
    `const R06_A03_LIVE_AUTHORITY = "PGC-R06-A03_G5A-U02_TWO_SEED_20_QUESTION_LIVE_RUNTIME";\nconst R06_A04_LIVE_AUTHORITY = "PGC-R06-A04_G5A-U02_PBL_TWO_SEED_LIVE_RUNTIME";`,
    "r03-a04-authority",
  );
  source = replaceRequired(
    source,
    `const TWO_SEED_AUTHORITIES = new Set([R05_LIVE_AUTHORITY, R06_A01_LIVE_AUTHORITY, R06_A03_LIVE_AUTHORITY]);`,
    `const TWO_SEED_AUTHORITIES = new Set([R05_LIVE_AUTHORITY, R06_A01_LIVE_AUTHORITY, R06_A03_LIVE_AUTHORITY, R06_A04_LIVE_AUTHORITY]);`,
    "r03-two-seed-set",
  );
  return source;
})) changed.push("tests/curriculum/pgc-r03-generator-capacity-contract.test.js");

if (patch("tests/curriculum/pgc-r06-a01-g4b-u04-capacity-contract-closeout.test.js", (input) => {
  let source = replaceRequired(
    input,
    `  assert.equal(inventory.summary.repairQueueCount, 47);`,
    `  assert.equal(inventory.summary.repairQueueCount, 35);`,
    "a01-current-queue",
  );
  source = replaceRequired(
    source,
    `  assert.equal(inventory.lastR06A03Reconciliation?.taskId, "PGC-R06-A03_CapacityPublicBindingRuntimeConsumerAndRepairQueueReconciliation");\n  assert.equal(inventory.repairQueue.filter((route) => route.sourceId === "g5a_u02_5a02").length, 12);`,
    `  assert.equal(inventory.lastR06A03Reconciliation?.taskId, "PGC-R06-A03_CapacityPublicBindingRuntimeConsumerAndRepairQueueReconciliation");\n  assert.equal(inventory.lastR06A04Reconciliation?.taskId, "PGC-R06-A04_G5A-U02_12_PBL_CrossSeedDiversityFullFix");\n  assert.equal(inventory.repairQueue.filter((route) => route.sourceId === "g5a_u02_5a02").length, 0);`,
    "a01-a04-current-state",
  );
  return source;
})) changed.push("tests/curriculum/pgc-r06-a01-g4b-u04-capacity-contract-closeout.test.js");

if (patch("tests/curriculum/pgc-r06-a03-capacity-public-runtime-repair-reconciliation.test.js", (input) => {
  let source = replaceRequired(
    input,
    `  assert.equal(diverseRoutes.length, 86);\n  assert.equal(fixedPblRoutes.length, 12);`,
    `  assert.equal(diverseRoutes.length, 98);\n  assert.equal(fixedPblRoutes.length, 0);`,
    "a03-current-diversity",
  );
  source = replaceRequired(
    source,
    `  assert.equal(remainingG5AQueue.length, 12);`,
    `  assert.equal(remainingG5AQueue.length, 0);`,
    "a03-current-queue",
  );
  source = replaceRequired(
    source,
    `  assert.equal(registry.PUBLIC_GENERATOR_CAPACITY_RECONCILIATION.liveRouteCount, 98);`,
    `  assert.equal(registry.PUBLIC_GENERATOR_CAPACITY_RECONCILIATION.taskId, "PGC-R06-A04_G5A-U02_12_PBL_CrossSeedDiversityFullFix");\n  assert.equal(registry.PUBLIC_GENERATOR_CAPACITY_RECONCILIATION.routeCount, 12);`,
    "a03-current-registry",
  );
  source = replaceRequired(
    source,
    `  assert.equal(consumer.PUBLIC_UI_RUNTIME_CAPACITY_RECONCILIATION.taskId, TASK_ID);`,
    `  assert.equal(consumer.PUBLIC_UI_RUNTIME_CAPACITY_RECONCILIATION.taskId, "PGC-R06-A04_G5A-U02_12_PBL_CrossSeedDiversityFullFix");`,
    "a03-current-consumer",
  );
  return source;
})) changed.push("tests/curriculum/pgc-r06-a03-capacity-public-runtime-repair-reconciliation.test.js");

const a04Workflow = `  ".github/workflows/pgc-r06-a04-g5a-u02-pbl-cross-seed-diversity.yml",`;

if (patch("tests/governance/gci-s01-workflow-inventory.test.js", (input) => replaceRequired(
  input,
  `  ".github/workflows/pgc-r06-a03-capacity-public-runtime-repair-reconciliation.yml",\n];`,
  `  ".github/workflows/pgc-r06-a03-capacity-public-runtime-repair-reconciliation.yml",\n${a04Workflow}\n];`,
  "gci-s01-a04-exclusion",
))) changed.push("tests/governance/gci-s01-workflow-inventory.test.js");

if (patch("tests/governance/gci-s02-pr-gate-pilot.test.js", (input) => {
  let source = replaceRequired(
    input,
    `  ".github/workflows/pgc-r06-a03-capacity-public-runtime-repair-reconciliation.yml",\n];`,
    `  ".github/workflows/pgc-r06-a03-capacity-public-runtime-repair-reconciliation.yml",\n${a04Workflow}\n];`,
    "gci-s02-a04-exclusion",
  );
  source = replaceRequired(source, `  assert.equal(current.summary.workflowFileCount, 113);`, `  assert.equal(current.summary.workflowFileCount, 114);`, "gci-s02-workflow-count");
  source = replaceRequired(source, `  assert.equal(current.summary.pullRequestWorkflowCount, 69);`, `  assert.equal(current.summary.pullRequestWorkflowCount, 70);`, "gci-s02-pr-count");
  source = replaceRequired(source, `  assert.equal(current.summary.prBranchWriterCount, 22);`, `  assert.equal(current.summary.prBranchWriterCount, 23);`, "gci-s02-writer-count");
  source = replaceRequired(source, `  assert.equal(current.summary.prFullRegressionWorkflowCount, 27);`, `  assert.equal(current.summary.prFullRegressionWorkflowCount, 28);`, "gci-s02-full-count");
  source = replaceRequired(source, `  assert.equal(current.summary.lateSkipCandidateCount, 29);`, `  assert.equal(current.summary.lateSkipCandidateCount, 30);`, "gci-s02-late-skip-count");
  return source;
})) changed.push("tests/governance/gci-s02-pr-gate-pilot.test.js");

console.log(`PGC_R06_A04_COMPATIBILITY_FIX=${JSON.stringify({
  status: "PASS",
  changedFiles: changed,
  historicalAuthoritiesPreserved: true,
  currentRepairQueueCount: 35,
})}`);
