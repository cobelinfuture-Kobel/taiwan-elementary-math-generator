import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { inventoryCurrentPrWorkflows } from "./inventory-current-pr-workflows.mjs";

export const CANONICAL_TOP_LEVEL_PR_WORKFLOW = ".github/workflows/pr-gate.yml";
export const DEFAULT_STAGE_ROOT = "tmp/pr-gate/uiv02-single-orchestrator-cutover";
export const DEFAULT_POLICY_PATH = ".github/ci/unit-validation-policy.json";

function splitLines(text) {
  const newline = text.includes("\r\n") ? "\r\n" : "\n";
  return { lines: text.split(/\r?\n/), newline };
}

function topLevelOnIndex(lines) {
  return lines.findIndex((line) => /^on:\s*(?:.*)?$/.test(line));
}

function blockEnd(lines, start) {
  for (let i = start + 1; i < lines.length; i += 1) {
    if (!lines[i].trim() || /^\s*#/.test(lines[i])) continue;
    if (/^\S/.test(lines[i])) return i;
  }
  return lines.length;
}

function blockEventIndices(lines, start, end) {
  const rows = [];
  for (let i = start + 1; i < end; i += 1) {
    const match = lines[i].match(/^\s{2}([A-Za-z0-9_-]+):(?:\s|$)/);
    if (match) rows.push({ event: match[1], index: i });
  }
  return rows;
}

function assertFocusedCoverageActive(policyPath) {
  const policy = JSON.parse(fs.readFileSync(policyPath, "utf8"));
  if (policy.layer3Boundary?.focusedValidationExecution !== "ACTIVE_MANIFEST_PLAN") {
    throw new Error(`UIV02_FOCUSED_VALIDATION_COVERAGE_NOT_ACTIVE:${policy.layer3Boundary?.focusedValidationExecution ?? "MISSING"}`);
  }
  if (policy.machineRules?.legacyPrTriggerRetirementWithoutFocusedCoverage !== "POLICY_VIOLATION") {
    throw new Error("UIV02_LEGACY_RETIREMENT_SAFETY_RULE_NOT_ACTIVE");
  }
  return policy;
}

export function removeDirectPullRequestTrigger(text) {
  const { lines, newline } = splitLines(text);
  const onIndex = topLevelOnIndex(lines);
  if (onIndex < 0) return { changed: false, text, reason: "NO_ON_BLOCK" };

  const inlineMatch = lines[onIndex].match(/^on:\s*(.*?)\s*$/);
  const inline = inlineMatch?.[1] ?? "";
  if (inline) {
    if (inline === "pull_request") {
      lines.splice(onIndex, 1, "on:", "  workflow_dispatch:");
      return { changed: true, text: `${lines.join(newline)}${text.endsWith(newline) ? newline : ""}`, reason: "SCALAR_PULL_REQUEST_RETIRED" };
    }
    if (inline.startsWith("[") && inline.endsWith("]")) {
      const events = inline.slice(1, -1)
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .filter((item) => item.replace(/^['\"]|['\"]$/g, "") !== "pull_request");
      if (events.length === 0) {
        lines.splice(onIndex, 1, "on:", "  workflow_dispatch:");
      } else if (events.length === 1) {
        lines[onIndex] = `on: ${events[0]}`;
      } else {
        lines[onIndex] = `on: [${events.join(", ")}]`;
      }
      const changed = events.length !== inline.slice(1, -1).split(",").filter(Boolean).length;
      return { changed, text: `${lines.join(newline)}${text.endsWith(newline) ? newline : ""}`, reason: changed ? "INLINE_PULL_REQUEST_RETIRED" : "NO_PULL_REQUEST_EVENT" };
    }
    return { changed: false, text, reason: "NO_PULL_REQUEST_EVENT" };
  }

  let end = blockEnd(lines, onIndex);
  const events = blockEventIndices(lines, onIndex, end);
  const targetPosition = events.findIndex((row) => row.event === "pull_request");
  if (targetPosition < 0) return { changed: false, text, reason: "NO_PULL_REQUEST_EVENT" };

  const start = events[targetPosition].index;
  const next = events[targetPosition + 1]?.index ?? end;
  lines.splice(start, next - start);

  end = blockEnd(lines, onIndex);
  const remainingEvents = blockEventIndices(lines, onIndex, end);
  if (remainingEvents.length === 0) lines.splice(onIndex + 1, 0, "  workflow_dispatch:");

  return {
    changed: true,
    text: `${lines.join(newline)}${text.endsWith(newline) ? newline : ""}`,
    reason: "BLOCK_PULL_REQUEST_RETIRED",
  };
}

export function prepareSinglePrOrchestratorCutover({
  workflowDir = ".github/workflows",
  stageRoot = DEFAULT_STAGE_ROOT,
  canonicalWorkflow = CANONICAL_TOP_LEVEL_PR_WORKFLOW,
  policyPath = DEFAULT_POLICY_PATH,
} = {}) {
  const policy = assertFocusedCoverageActive(policyPath);
  const before = inventoryCurrentPrWorkflows({ workflowDir });
  const stageWorkflowDir = path.join(stageRoot, ".github/workflows");
  fs.rmSync(stageRoot, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(stageWorkflowDir), { recursive: true });
  fs.cpSync(workflowDir, stageWorkflowDir, { recursive: true });

  const retired = [];
  for (const row of before.workflows) {
    if (!(row.pullRequestTrigger || row.pullRequestTargetTrigger)) continue;
    if (row.file === canonicalWorkflow) continue;
    if (row.pullRequestTargetTrigger) {
      throw new Error(`UIV02_PULL_REQUEST_TARGET_REQUIRES_MANUAL_REVIEW:${row.file}`);
    }

    const sourceFile = row.file;
    const relative = path.relative(workflowDir, sourceFile);
    const stagedFile = path.join(stageWorkflowDir, relative);
    const original = fs.readFileSync(stagedFile, "utf8");
    const result = removeDirectPullRequestTrigger(original);
    if (!result.changed) throw new Error(`UIV02_DIRECT_PR_TRIGGER_NOT_RETIRED:${row.file}:${result.reason}`);
    fs.writeFileSync(stagedFile, result.text);
    retired.push({
      file: row.file,
      workflowName: row.name,
      reason: result.reason,
      wasPrBranchWriter: row.writesPullRequestBranchPotentially,
      hadFullRegression: row.hasFullRegression,
    });
  }

  const after = inventoryCurrentPrWorkflows({ workflowDir: stageWorkflowDir });
  const canonicalStagePath = path.join(stageWorkflowDir, path.basename(canonicalWorkflow));
  const expectedCanonicalPath = canonicalStagePath.replace(/\\/g, "/");
  if (after.summary.pullRequestWorkflowCount !== 1
    || after.pullRequestWorkflowPaths.length !== 1
    || after.pullRequestWorkflowPaths[0] !== expectedCanonicalPath) {
    throw new Error(`UIV02_SINGLE_PR_ORCHESTRATOR_NOT_ACHIEVED:${JSON.stringify(after.summary)}`);
  }
  if (after.summary.prBranchWriterCount !== 0) {
    throw new Error(`UIV02_PR_BRANCH_WRITERS_REMAIN:${after.summary.prBranchWriterCount}`);
  }
  if (after.summary.prFullRegressionWorkflowCount !== 1) {
    throw new Error(`UIV02_PR_FULL_REGRESSION_AUTHORITY_COUNT_INVALID:${after.summary.prFullRegressionWorkflowCount}`);
  }

  const manifest = {
    schemaVersion: "1.1.0",
    taskId: "GCI-UIV02_RemainingPrFanoutInventoryAndRequiredCheckEnforcement",
    mode: "TRIGGER_ONLY_RETIREMENT_PREVIEW",
    focusedValidationExecution: policy.layer3Boundary.focusedValidationExecution,
    canonicalTopLevelPrWorkflow: canonicalWorkflow,
    before: before.summary,
    after: after.summary,
    retiredWorkflowCount: retired.length,
    retired,
  };
  fs.writeFileSync(path.join(stageRoot, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  return { manifest, stageRoot, stageWorkflowDir };
}

export function runCli(args = process.argv.slice(2)) {
  const stageRoot = args[0] ?? DEFAULT_STAGE_ROOT;
  const result = prepareSinglePrOrchestratorCutover({ stageRoot });
  process.stdout.write(`${JSON.stringify(result.manifest, null, 2)}\n`);
  return result;
}

const isCli = process.argv[1]
  && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;
if (isCli) runCli();
