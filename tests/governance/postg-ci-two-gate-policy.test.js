import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const policy = JSON.parse(fs.readFileSync('data/project/governance/postg-ci-two-gate-policy.json', 'utf8'));
const historical = [
  ".github/workflows/postg-app-w01-a05-e4-review.yml",
  ".github/workflows/postg-app-w01-a06e-operator-approval.yml",
  ".github/workflows/postg-app-w02-a00-source-assessment.yml",
  ".github/workflows/postg-app-w02-a01a-source-pdf-evidence.yml",
  ".github/workflows/postg-app-w02-a01b-page-knowledge-operation-candidates.yml",
  ".github/workflows/postg-app-w02-a01c-canonical-operation-models.yml",
  ".github/workflows/postg-app-w02-a01d-hidden-pattern-specs.yml",
  ".github/workflows/postg-app-w02-a02-candidate-pack.yml",
  ".github/workflows/postg-app-w02-a03-nplusone-pbl.yml",
  ".github/workflows/postg-app-w02-a04-validator-shadow.yml",
  ".github/workflows/postg-app-w02-a05-shared-worksheet-projection.yml",
  ".github/workflows/postg-app-w02-a06-production-equivalent-html-pdf.yml",
  ".github/workflows/postg-app-w02-a08-operator-review-remediation.yml",
  ".github/workflows/postg-app-w02-a08r2-second-operator-review.yml",
  ".github/workflows/postg-app-w02-a08r3-numeric-surface-remediation.yml"
];

test('POSTG pull requests use one focused gate plus Node Test', () => {
  assert.deepEqual(policy.requiredPullRequestGates, ['POSTG Application PR Gate', 'Node Test']);
  assert.equal(policy.maxRequiredPullRequestGateCount, 2);
  const router = fs.readFileSync('.github/workflows/postg-application-pr-gate.yml', 'utf8');
  const nodeTest = fs.readFileSync('.github/workflows/node-test.yml', 'utf8');
  assert.match(router, /pull_request:/);
  assert.match(router, /cancel-in-progress: true/);
  assert.match(nodeTest, /pull_request:/);
  assert.match(nodeTest, /cancel-in-progress: true/);
});

test('historical POSTG milestone workflows cannot fan out on pull requests', () => {
  assert.deepEqual(policy.historicalWorkflowPaths, historical);
  for (const path of historical) {
    const workflow = fs.readFileSync(path, 'utf8');
    assert.doesNotMatch(workflow, /\bpull_request:/, path);
    assert.match(workflow, /workflow_dispatch:/, path);
    assert.match(workflow, /workflow_call:/, path);
  }
});

test('standalone milestone claim workflow is not a third pull-request gate', () => {
  const workflow = fs.readFileSync('.github/workflows/milestone-claim-integrity.yml', 'utf8');
  assert.doesNotMatch(workflow, /\bpull_request:/);
});
