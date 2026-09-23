import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const WORKFLOW_DIR = ".github/workflows";

function compareCodePoint(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function gitBlobSha(content) {
  const bytes = Buffer.from(content, "utf8");
  return crypto.createHash("sha1")
    .update(Buffer.from(`blob ${bytes.length}\0`, "utf8"))
    .update(bytes)
    .digest("hex");
}

function firstMatch(text, pattern, fallback = null) {
  const match = text.match(pattern);
  return match ? match[1].trim().replace(/^['"]|['"]$/g, "") : fallback;
}

function triggerClasses(text) {
  const result = [];
  if (/^\s{0,4}pull_request\s*:/m.test(text)) result.push("PULL_REQUEST");
  if (/^\s{0,4}push\s*:/m.test(text)) result.push("PUSH");
  if (/^\s{0,4}workflow_dispatch\s*:/m.test(text)) result.push("WORKFLOW_DISPATCH");
  if (/^\s{0,4}workflow_call\s*:/m.test(text)) result.push("WORKFLOW_CALL");
  if (/^\s{0,4}schedule\s*:/m.test(text)) result.push("SCHEDULE");
  return result.length ? result : ["OTHER"];
}

function pullRequestPaths(text) {
  const lines = text.split(/\r?\n/);
  const values = [];
  let inPullRequest = false;
  let pullIndent = -1;
  let inPaths = false;
  let pathsIndent = -1;

  for (const line of lines) {
    const trimmed = line.trim();
    const indent = line.length - line.trimStart().length;

    if (/^pull_request\s*:/.test(trimmed)) {
      inPullRequest = true;
      pullIndent = indent;
      inPaths = false;
      continue;
    }
    if (inPullRequest && trimmed && indent <= pullIndent && !/^#/.test(trimmed)) {
      inPullRequest = false;
      inPaths = false;
    }
    if (!inPullRequest) continue;

    if (/^paths\s*:/.test(trimmed)) {
      inPaths = true;
      pathsIndent = indent;
      continue;
    }
    if (inPaths && trimmed && indent <= pathsIndent && !trimmed.startsWith("-")) {
      inPaths = false;
    }
    if (inPaths && trimmed.startsWith("-")) {
      values.push(trimmed.slice(1).trim().replace(/^['"]|['"]$/g, ""));
    }
  }

  return values;
}

function classifyWorkflow(row) {
  if (!row.triggerClasses.includes("PULL_REQUEST")) {
    if (row.triggerClasses.includes("PUSH") && /pages|deploy/i.test(row.displayName)) return "POST_MERGE_ONLY";
    if (row.triggerClasses.includes("WORKFLOW_DISPATCH") && row.triggerClasses.length === 1) return "WORKFLOW_DISPATCH_ONLY";
    return "KEEP_OPTIONAL";
  }
  if (row.writesPullRequestBranch) return "WORKFLOW_DISPATCH_ONLY_OR_RETIRE";
  if (row.file === ".github/workflows/node-test.yml") return "KEEP_REQUIRED_UNTIL_ORCHESTRATOR_REPLACES";
  if (row.file === ".github/workflows/pr-gate.yml") return "PILOT_ORCHESTRATOR";
  if (row.hasHeadRefJobGate || /P03F\d+ Slice\d+ Product Acceptance/i.test(row.displayName)) {
    return "MERGE_INTO_AFFECTED_SCOPE_MATRIX";
  }
  if (row.runsFullRegression) return "MERGE_INTO_ORCHESTRATOR";
  return "KEEP_OPTIONAL_OR_REUSABLE";
}

export function materializeGciS01WorkflowInventory({ rootDir = ".", excludeFiles = [] } = {}) {
  const workflowDir = path.join(rootDir, WORKFLOW_DIR);
  const excluded = new Set(excludeFiles.map((file) => file.replaceAll("\\", "/")));
  const files = fs.readdirSync(workflowDir)
    .filter((name) => /\.ya?ml$/i.test(name))
    .filter((name) => !excluded.has(name) && !excluded.has(`${WORKFLOW_DIR}/${name}`))
    .sort(compareCodePoint);

  const workflows = files.map((name) => {
    const file = `${WORKFLOW_DIR}/${name}`;
    const content = fs.readFileSync(path.join(rootDir, file), "utf8");
    const displayName = firstMatch(content, /^name:\s*(.+)$/m, name);
    const triggers = triggerClasses(content);
    const writesPullRequestBranch = triggers.includes("PULL_REQUEST")
      && /\bgit\s+(?:commit|push|rebase)\b/.test(content);
    const row = {
      workflowId: name.replace(/\.ya?ml$/i, ""),
      file,
      displayName,
      blobSha: gitBlobSha(content),
      triggerClasses: triggers,
      pullRequestPaths: pullRequestPaths(content),
      contentsPermission: firstMatch(content, /^\s{2}contents:\s*(read|write)$/m, "UNDECLARED"),
      writesPullRequestBranch,
      gitCommitCommand: /\bgit\s+commit\b/.test(content),
      gitPushCommand: /\bgit\s+push\b/.test(content),
      gitRebaseCommand: /\bgit\s+rebase\b/.test(content),
      runsFullRegression: /(?:^|\s)npm\s+test(?:\s|$)/m.test(content),
      npmTestOccurrenceCount: (content.match(/(?:^|\s)npm\s+test(?:\s|$)/gm) ?? []).length,
      hasHeadRefJobGate: /\bgithub\.head_ref\b/.test(content),
      hasJobLevelIf: /^\s{4,}if:\s*/m.test(content),
      usesWorkflowCall: triggers.includes("WORKFLOW_CALL")
    };
    return { ...row, proposedDisposition: classifyWorkflow(row) };
  });

  const prWorkflows = workflows.filter((row) => row.triggerClasses.includes("PULL_REQUEST"));
  const branchWriters = prWorkflows.filter((row) => row.writesPullRequestBranch);
  const fullRegressions = prWorkflows.filter((row) => row.runsFullRegression);
  const lateSkipCandidates = prWorkflows.filter((row) => row.hasHeadRefJobGate);

  const triggerMatrix = workflows.map((row) => ({
    workflowId: row.workflowId,
    file: row.file,
    triggerClasses: row.triggerClasses,
    pullRequestPathCount: row.pullRequestPaths.length,
    hasHeadRefJobGate: row.hasHeadRefJobGate,
    proposedDisposition: row.proposedDisposition
  }));

  const ownershipMatrix = workflows.map((row) => ({
    workflowId: row.workflowId,
    pullRequest: row.triggerClasses.includes("PULL_REQUEST"),
    contentsPermission: row.contentsPermission,
    writesPullRequestBranch: row.writesPullRequestBranch,
    runsFullRegression: row.runsFullRegression,
    npmTestOccurrenceCount: row.npmTestOccurrenceCount,
    proposedDisposition: row.proposedDisposition
  }));

  const pathOwners = new Map();
  for (const row of prWorkflows) {
    for (const pattern of row.pullRequestPaths) {
      const owners = pathOwners.get(pattern) ?? [];
      owners.push(row.workflowId);
      pathOwners.set(pattern, owners);
    }
  }
  const sharedPathOverlapMatrix = [...pathOwners.entries()]
    .filter(([, owners]) => owners.length > 1)
    .map(([pathPattern, owners]) => ({ pathPattern, workflowIds: owners.sort(compareCodePoint) }))
    .sort((a, b) => compareCodePoint(a.pathPattern, b.pathPattern));

  return {
    schemaVersion: "1.0.0",
    programId: "GLOBAL_GITHUB_CI_HANDSHAKE_STANDARD_V1",
    taskId: "GCI-S01_MathRepositoryWorkflowInventoryAndFanoutMatrix",
    repository: "cobelinfuture-Kobel/taiwan-elementary-math-generator",
    inventoryCompleteness: "COMPLETE_FROM_CHECKED_OUT_MAIN_TREE",
    summary: {
      workflowFileCount: workflows.length,
      pullRequestWorkflowCount: prWorkflows.length,
      prBranchWriterCount: branchWriters.length,
      prFullRegressionWorkflowCount: fullRegressions.length,
      lateSkipCandidateCount: lateSkipCandidates.length,
      sharedExactPathPatternCount: sharedPathOverlapMatrix.length
    },
    workflows,
    triggerMatrix,
    sharedPathOverlapMatrix,
    ownershipMatrix,
    workflowIds: {
      prBranchWriters: branchWriters.map((row) => row.workflowId),
      prFullRegressionOwners: fullRegressions.map((row) => row.workflowId),
      lateSkipCandidates: lateSkipCandidates.map((row) => row.workflowId)
    }
  };
}

export function runCli(args = process.argv.slice(2)) {
  const output = materializeGciS01WorkflowInventory({ rootDir: args[0] ?? "." });
  const serialized = JSON.stringify(output, null, 2);
  process.stdout.write(`${serialized}\n`);
  process.stdout.write(`GCI_S01_WORKFLOW_INVENTORY_BASE64=${Buffer.from(serialized, "utf8").toString("base64")}\n`);
  return output;
}

const isCli = process.argv[1]
  && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;

if (isCli) runCli();
