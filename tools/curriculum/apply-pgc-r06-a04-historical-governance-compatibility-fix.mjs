import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const A04_TASK_ID = "PGC-R06-A04_G5A-U02_12_PBL_CrossSeedDiversityFullFix";
const A04_AUTHORITY = "PGC-R06-A04_G5A-U02_PBL_TWO_SEED_LIVE_RUNTIME";
const A04_WORKFLOW = ".github/workflows/pgc-r06-a04-g5a-u02-pbl-cross-seed-diversity.yml";

function patch(relativePath, mutate) {
  const filePath = path.join(repoRoot, relativePath);
  const before = fs.readFileSync(filePath, "utf8");
  const after = mutate(before);
  if (after !== before) fs.writeFileSync(filePath, after);
  return after !== before;
}

function replaceOnce(source, before, after, label) {
  if (source.includes(after)) return source;
  if (!source.includes(before)) throw new Error(`PGC_R06_A04_COMPATIBILITY_ANCHOR_MISSING:${label}`);
  return source.replace(before, after);
}

const changedFiles = [];

if (patch("tests/curriculum/pgc-r03-generator-capacity-contract.test.js", (input) => {
  let source = input;
  if (!source.includes(`const R06_A04_LIVE_AUTHORITY = "${A04_AUTHORITY}";`)) {
    source = replaceOnce(
      source,
      `const R06_A03_LIVE_AUTHORITY = "PGC-R06-A03_G5A-U02_TWO_SEED_20_QUESTION_LIVE_RUNTIME";`,
      `const R06_A03_LIVE_AUTHORITY = "PGC-R06-A03_G5A-U02_TWO_SEED_20_QUESTION_LIVE_RUNTIME";\nconst R06_A04_LIVE_AUTHORITY = "${A04_AUTHORITY}";`,
      "r03-a04-authority",
    );
  }
  if (!/TWO_SEED_AUTHORITIES[\s\S]*R06_A04_LIVE_AUTHORITY[\s\S]*\]\);/.test(source)) {
    source = replaceOnce(
      source,
      `  R06_A03_LIVE_AUTHORITY,\n]);`,
      `  R06_A03_LIVE_AUTHORITY,\n  R06_A04_LIVE_AUTHORITY,\n]);`,
      "r03-two-seed-authority-membership",
    );
  }
  return source;
})) changedFiles.push("tests/curriculum/pgc-r03-generator-capacity-contract.test.js");

const a01Path = "tests/curriculum/pgc-r06-a01-g4b-u04-capacity-contract-closeout.test.js";
const a01 = fs.readFileSync(path.join(repoRoot, a01Path), "utf8");
if (!a01.includes(A04_TASK_ID)
  || !a01.includes("historical queue delta remains immutable")
  || !a01.includes("repairQueueAfter, 35")) {
  throw new Error("PGC_R06_A04_A01_HISTORY_COMPATIBILITY_MISSING");
}

const a03Path = "tests/curriculum/pgc-r06-a03-capacity-public-runtime-repair-reconciliation.test.js";
const a03 = fs.readFileSync(path.join(repoRoot, a03Path), "utf8");
if (!a03.includes(A04_TASK_ID)
  || !a03.includes("historical reconciliation remains materialized")
  || !a03.includes("assert.equal(diverseRoutes.length, 98)")
  || !a03.includes("assert.equal(remainingG5AQueue.length, 0)")) {
  throw new Error("PGC_R06_A04_A03_HISTORY_COMPATIBILITY_MISSING");
}

for (const relativePath of [
  "tests/governance/gci-s01-workflow-inventory.test.js",
  "tests/governance/gci-s02-pr-gate-pilot.test.js",
]) {
  if (patch(relativePath, (input) => {
    if (input.includes(`"${A04_WORKFLOW}"`)) return input;
    return replaceOnce(
      input,
      `  ".github/workflows/pgc-r06-a03-capacity-public-runtime-repair-reconciliation.yml",\n];`,
      `  ".github/workflows/pgc-r06-a03-capacity-public-runtime-repair-reconciliation.yml",\n  "${A04_WORKFLOW}",\n];`,
      `${relativePath}:a04-exclusion`,
    );
  })) changedFiles.push(relativePath);
}

if (patch("tests/governance/gci-s02-pr-gate-pilot.test.js", (input) => {
  let source = input;
  const replacements = [
    ["workflowFileCount, 113", "workflowFileCount, 114"],
    ["pullRequestWorkflowCount, 69", "pullRequestWorkflowCount, 70"],
    ["prBranchWriterCount, 22", "prBranchWriterCount, 23"],
    ["prFullRegressionWorkflowCount, 27", "prFullRegressionWorkflowCount, 28"],
    ["lateSkipCandidateCount, 29", "lateSkipCandidateCount, 30"],
  ];
  for (const [before, after] of replacements) {
    if (!source.includes(after)) source = replaceOnce(source, before, after, `gci-s02:${before}`);
  }
  return source;
})) changedFiles.push("tests/governance/gci-s02-pr-gate-pilot.test.js");

const r03 = fs.readFileSync(path.join(repoRoot, "tests/curriculum/pgc-r03-generator-capacity-contract.test.js"), "utf8");
const gciS01 = fs.readFileSync(path.join(repoRoot, "tests/governance/gci-s01-workflow-inventory.test.js"), "utf8");
const gciS02 = fs.readFileSync(path.join(repoRoot, "tests/governance/gci-s02-pr-gate-pilot.test.js"), "utf8");
if (!r03.includes(A04_AUTHORITY)
  || !gciS01.includes(A04_WORKFLOW)
  || !gciS02.includes(A04_WORKFLOW)
  || !gciS02.includes("workflowFileCount, 114")
  || !gciS02.includes("pullRequestWorkflowCount, 70")
  || !gciS02.includes("prBranchWriterCount, 23")
  || !gciS02.includes("prFullRegressionWorkflowCount, 28")
  || !gciS02.includes("lateSkipCandidateCount, 30")) {
  throw new Error("PGC_R06_A04_COMPATIBILITY_POSTCONDITION_FAILED");
}

console.log(`PGC_R06_A04_COMPATIBILITY_FIX=${JSON.stringify({
  status: "PASS",
  changedFiles: [...new Set(changedFiles)],
  historicalAuthoritiesPreserved: true,
  currentRepairQueueCount: 35,
})}`);
