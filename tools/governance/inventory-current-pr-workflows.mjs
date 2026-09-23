import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

export const DEFAULT_WORKFLOW_DIR = ".github/workflows";
export const DEFAULT_OUTPUT = "tmp/pr-gate/current-pr-workflow-inventory.json";

function currentHeadSha() {
  try {
    return execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  } catch {
    return null;
  }
}

function workflowName(text, file) {
  const match = text.match(/^name:\s*(.+?)\s*$/m);
  return match ? match[1].replace(/^['\"]|['\"]$/g, "") : file;
}

function parseOnEvents(text) {
  const lines = text.split(/\r?\n/);
  const events = new Set();
  let onIndex = -1;

  for (let i = 0; i < lines.length; i += 1) {
    const match = lines[i].match(/^on:\s*(.*?)\s*$/);
    if (!match) continue;
    onIndex = i;
    const inline = match[1];
    if (inline) {
      if (inline.startsWith("[") && inline.endsWith("]")) {
        for (const item of inline.slice(1, -1).split(",")) {
          const event = item.trim().replace(/^['\"]|['\"]$/g, "");
          if (event) events.add(event);
        }
      } else {
        events.add(inline.replace(/^['\"]|['\"]$/g, ""));
      }
    }
    break;
  }

  if (onIndex < 0 || events.size > 0) return [...events].sort();

  for (let i = onIndex + 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line.trim() || /^\s*#/.test(line)) continue;
    if (/^\S/.test(line)) break;
    const match = line.match(/^\s{2}([A-Za-z0-9_-]+):(?:\s|$)/);
    if (match) events.add(match[1]);
  }
  return [...events].sort();
}

function topLevelContentsPermission(text) {
  const lines = text.split(/\r?\n/);
  let permissionsIndex = -1;
  for (let i = 0; i < lines.length; i += 1) {
    if (/^permissions:\s*$/.test(lines[i])) {
      permissionsIndex = i;
      break;
    }
  }
  if (permissionsIndex < 0) return null;
  for (let i = permissionsIndex + 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line.trim() || /^\s*#/.test(line)) continue;
    if (/^\S/.test(line)) break;
    const match = line.match(/^\s{2}contents:\s*([A-Za-z-]+)\s*$/);
    if (match) return match[1];
  }
  return null;
}

function inspectWorkflow(filePath, workflowDir) {
  const text = fs.readFileSync(filePath, "utf8");
  const file = path.posix.join(workflowDir.replace(/\\/g, "/"), path.basename(filePath));
  const events = parseOnEvents(text);
  const pullRequestTrigger = events.includes("pull_request");
  const pullRequestTargetTrigger = events.includes("pull_request_target");
  const contentsPermission = topLevelContentsPermission(text);
  const hasGitCommit = /(^|\s)git\s+commit\b/m.test(text);
  const hasGitPush = /(^|\s)git\s+push\b/m.test(text);
  const hasGitRebase = /(^|\s)git\s+rebase\b/m.test(text);
  const hasFullRegression = /(^|\s)npm\s+(?:run\s+)?test(?:\s|$)/m.test(text);

  return {
    file,
    name: workflowName(text, path.basename(filePath)),
    events,
    pullRequestTrigger,
    pullRequestTargetTrigger,
    contentsPermission,
    writesPullRequestBranchPotentially:
      (pullRequestTrigger || pullRequestTargetTrigger)
      && (contentsPermission === "write" || hasGitCommit || hasGitPush || hasGitRebase),
    hasFullRegression,
    hasGitCommit,
    hasGitPush,
    hasGitRebase,
  };
}

export function inventoryCurrentPrWorkflows({ workflowDir = DEFAULT_WORKFLOW_DIR } = {}) {
  const files = fs.readdirSync(workflowDir)
    .filter((name) => /\.ya?ml$/i.test(name))
    .sort();
  const workflows = files.map((name) => inspectWorkflow(path.join(workflowDir, name), workflowDir));
  const prWorkflows = workflows.filter((row) => row.pullRequestTrigger || row.pullRequestTargetTrigger);
  const prBranchWriters = prWorkflows.filter((row) => row.writesPullRequestBranchPotentially);
  const prFullRegressionWorkflows = prWorkflows.filter((row) => row.hasFullRegression);

  return {
    schemaVersion: "1.0.0",
    taskId: "GCI-UIV02_RemainingPrFanoutInventoryAndRequiredCheckEnforcement",
    inventoryHeadSha: currentHeadSha(),
    workflowDirectory: workflowDir.replace(/\\/g, "/"),
    summary: {
      workflowFileCount: workflows.length,
      pullRequestWorkflowCount: prWorkflows.length,
      pullRequestTargetWorkflowCount: workflows.filter((row) => row.pullRequestTargetTrigger).length,
      prBranchWriterCount: prBranchWriters.length,
      prFullRegressionWorkflowCount: prFullRegressionWorkflows.length,
    },
    pullRequestWorkflowPaths: prWorkflows.map((row) => row.file),
    prBranchWriterPaths: prBranchWriters.map((row) => row.file),
    prFullRegressionWorkflowPaths: prFullRegressionWorkflows.map((row) => row.file),
    workflows,
  };
}

export function writeCurrentPrWorkflowInventory({ output = DEFAULT_OUTPUT, workflowDir = DEFAULT_WORKFLOW_DIR } = {}) {
  const inventory = inventoryCurrentPrWorkflows({ workflowDir });
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, `${JSON.stringify(inventory, null, 2)}\n`);
  return inventory;
}

export function runCli(args = process.argv.slice(2)) {
  const output = args[0] ?? DEFAULT_OUTPUT;
  const inventory = writeCurrentPrWorkflowInventory({ output });
  process.stdout.write(`${JSON.stringify(inventory.summary)}\n`);
  for (const file of inventory.pullRequestWorkflowPaths) process.stdout.write(`PR_WORKFLOW=${file}\n`);
  for (const file of inventory.prBranchWriterPaths) process.stdout.write(`PR_BRANCH_WRITER=${file}\n`);
  for (const file of inventory.prFullRegressionWorkflowPaths) process.stdout.write(`PR_FULL_REGRESSION=${file}\n`);
  return inventory;
}

const isCli = process.argv[1]
  && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;
if (isCli) runCli();
