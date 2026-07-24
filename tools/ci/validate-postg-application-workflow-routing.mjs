import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const policyPath = 'data/project/ci/postg-application-workflow-routing.json';
const read = (repoPath) => fs.readFileSync(path.join(root, repoPath), 'utf8');
const policy = JSON.parse(read(policyPath));
const issues = [];

if (policy.schemaName !== 'POSTGApplicationWorkflowRoutingPolicyV1' || policy.schemaVersion !== 1) {
  issues.push({ code: 'POSTG_CI_ROUTING_POLICY_INVALID', path: policyPath });
}

const centralText = read(policy.centralPullRequestWorkflow);
if (!centralText.includes('pull_request:') || !centralText.includes('workflow_dispatch:')) {
  issues.push({ code: 'POSTG_CI_CENTRAL_ROUTER_TRIGGER_INVALID', path: policy.centralPullRequestWorkflow });
}
if (!centralText.includes('tests/curriculum/postg-app-w02-*.test.js')) {
  issues.push({ code: 'POSTG_CI_CENTRAL_ROUTER_FOCUSED_SUITE_MISSING', path: policy.centralPullRequestWorkflow });
}

for (const workflowPath of policy.historicalManualReadbackWorkflows) {
  const text = read(workflowPath);
  if (/^\s*pull_request\s*:/m.test(text)) {
    issues.push({ code: 'POSTG_CI_HISTORICAL_PR_TRIGGER_PRESENT', path: workflowPath });
  }
  if (!/^\s*workflow_dispatch\s*:/m.test(text)) {
    issues.push({ code: 'POSTG_CI_HISTORICAL_DISPATCH_MISSING', path: workflowPath });
  }
}

const readback = {
  ok: issues.length === 0,
  taskId: policy.taskId,
  status: issues.length === 0 ? 'POSTG_APPLICATION_PR_FANOUT_CONSOLIDATED' : 'POSTG_APPLICATION_PR_FANOUT_BLOCKED',
  counts: {
    historicalManualReadbackWorkflowCount: policy.historicalManualReadbackWorkflows.length,
    applicationPullRequestWorkflowCount: issues.length === 0 ? 1 : null,
    expectedRepositoryPullRequestGateCount: policy.expectedRepositoryPullRequestGateCount
  },
  issues
};

process.stdout.write(`${JSON.stringify(readback, null, 2)}\n`);
if (!readback.ok) process.exitCode = 1;
