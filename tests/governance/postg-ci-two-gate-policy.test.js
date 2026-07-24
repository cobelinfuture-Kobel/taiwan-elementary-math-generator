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
  ".github/workflows/postg-app-w02-a08r3-numeric-surface-remediation.yml",
  ".github/workflows/s59j-g4b-u01-artifact.yml",
  ".github/workflows/gs06-g5a-u08-batch-controller-anti-drift-d0.yml",
  ".github/workflows/s96g-g5a-u02-dynamic-html-pdf-stress.yml",
  ".github/workflows/s95-g5a-u02-production-stress-html-pdf.yml",
  ".github/workflows/s96d-g5a-u02-focused-test.yml",
  ".github/workflows/s42-branch-test.yml",
  ".github/workflows/s96q-g5a-u02-browser-dom-e2e.yml",
  ".github/workflows/ci-readback.yml",
  ".github/workflows/s60l-g5a-u08-artifact.yml",
  ".github/workflows/s96i-g5a-u02-live-browser-e2e.yml",
  ".github/workflows/s96r-g5a-u02-control-matrix-html-pdf-stress.yml",
  ".github/workflows/s59j-r1-g4b-u01-layout.yml",
  ".github/workflows/g4b-u04-r2d-layout-smoke.yml",
  ".github/workflows/s75-g4b-u04-artifact.yml",
  ".github/workflows/g4b-u04-r2f-production-matrix.yml",
  ".github/workflows/s76k-g4a-u08-html-pdf-smoke.yml",
  ".github/workflows/s76r-g4a-u08-full-source-html-pdf.yml",
  ".github/workflows/s93-g5a-u02-hidden-html-pdf-smoke.yml",
  ".github/workflows/s96d-g5a-u02-browser-bundle.yml"
];

test('repository pull requests use one focused POSTG gate plus Node Test', () => {
  assert.deepEqual(policy.requiredPullRequestGates, ['POSTG Application PR Gate', 'Node Test']);
  assert.equal(policy.maxRequiredPullRequestGateCount, 2);
  const router = fs.readFileSync('.github/workflows/postg-application-pr-gate.yml', 'utf8');
  const nodeTest = fs.readFileSync('.github/workflows/node-test.yml', 'utf8');
  assert.match(router, /pull_request:/);
  assert.match(router, /cancel-in-progress: true/);
  assert.match(nodeTest, /pull_request:/);
  assert.match(nodeTest, /cancel-in-progress: true/);
});

test('all observed historical fan-out workflows cannot trigger pull requests', () => {
  assert.deepEqual(
    [...policy.historicalPostgWorkflowPaths, ...policy.historicalLegacyWorkflowPaths],
    historical
  );
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

test('exact-head acceptance contract is two runs and zero unrelated unit workflows', () => {
  assert.deepEqual(policy.exactHeadAcceptance.expectedWorkflowNames, ['POSTG Application PR Gate', 'Node Test']);
  assert.equal(policy.exactHeadAcceptance.maximumWorkflowRunCount, 2);
  assert.equal(policy.exactHeadAcceptance.unrelatedUnitWorkflowRunCount, 0);
});
