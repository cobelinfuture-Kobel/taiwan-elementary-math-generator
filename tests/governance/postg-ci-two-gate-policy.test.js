import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const policyPath = 'data/project/governance/postg-ci-two-gate-policy.json';
const policy = JSON.parse(fs.readFileSync(policyPath, 'utf8'));
const historical = [
  ...policy.historicalPostgWorkflowPaths,
  ...policy.historicalLegacyWorkflowPaths,
];

test('repository pull requests use one focused POSTG gate plus Node Test', () => {
  assert.equal(policy.schemaVersion, 'postg-ci-two-gate-policy-v3');
  assert.equal(policy.task, 'POSTG-CI-GOV-W01W02R1_TriggerOnlyPreservingHistoricalWorkflowContracts');
  assert.deepEqual(policy.requiredPullRequestGates, ['POSTG Application PR Gate', 'Node Test']);
  assert.equal(policy.maxRequiredPullRequestGateCount, 2);

  const router = fs.readFileSync('.github/workflows/postg-application-pr-gate.yml', 'utf8');
  const nodeTest = fs.readFileSync('.github/workflows/node-test.yml', 'utf8');
  assert.match(router, /^name: POSTG Application PR Gate$/m);
  assert.match(router, /\bpull_request:/);
  assert.match(router, /concurrency:/);
  assert.match(router, /cancel-in-progress: true/);
  assert.match(nodeTest, /^name: Node Test$/m);
  assert.match(nodeTest, /\bpull_request:/);
  assert.match(nodeTest, /concurrency:/);
  assert.match(nodeTest, /cancel-in-progress: true/);
});

test('33 closed milestone workflows are trigger-only historical contracts', () => {
  assert.equal(policy.historicalPostgWorkflowPaths.length, 15);
  assert.equal(policy.historicalLegacyWorkflowPaths.length, 18);
  assert.equal(historical.length, 33);
  assert.equal(policy.historicalBodyContract, 'name_permissions_concurrency_jobs_steps_preserved_trigger_only_changed');

  for (const path of historical) {
    const workflow = fs.readFileSync(path, 'utf8');
    assert.doesNotMatch(workflow, /\bpull_request:/, path);
    assert.doesNotMatch(workflow, /^\s+push:/m, path);
    assert.match(workflow, /workflow_dispatch:/, path);
    assert.match(workflow, /workflow_call:/, path);
    assert.match(workflow, /^name: .+/m, path);
    assert.match(workflow, /^jobs:/m, path);
    assert.ok(workflow.length > 500, `${path}: historical body was replaced by a stub`);
    assert.doesNotMatch(workflow, /Historical (?:POSTG|unit) workflow remains callable/, path);
  }
});

test('Math CI Readback remains active on main push but is not a pull-request gate', () => {
  assert.deepEqual(policy.activeGlobalWorkflowContracts, [{
    path: '.github/workflows/ci-readback.yml',
    mode: 'push_main_and_workflow_dispatch_without_pull_request',
    preserveMainReadbackPublication: true,
  }]);
  const workflow = fs.readFileSync('.github/workflows/ci-readback.yml', 'utf8');
  assert.doesNotMatch(workflow, /\bpull_request:/);
  assert.match(workflow, /workflow_dispatch:/);
  assert.match(workflow, /^\s+push:/m);
  assert.match(workflow, /^\s+- main$/m);
  assert.match(workflow, /Commit CI readback file/);
  assert.match(workflow, /^jobs:/m);
});

test('standalone milestone claim workflow is not a third pull-request gate', () => {
  const workflow = fs.readFileSync('.github/workflows/milestone-claim-integrity.yml', 'utf8');
  assert.doesNotMatch(workflow, /\bpull_request:/);
  assert.match(workflow, /workflow_dispatch:/);
});

test('publication and exact-head acceptance contracts remain bounded', () => {
  assert.deepEqual(policy.publicationContract, {
    singleTree: true,
    singleCommitBeforePullRequest: true,
    singlePullRequest: true,
    actionsAsFilePublisher: false,
    actionsAsIterativeDebugger: false,
    markerCommitTriggerAllowed: false,
  });
  assert.deepEqual(policy.exactHeadAcceptance.expectedWorkflowNames, ['POSTG Application PR Gate', 'Node Test']);
  assert.equal(policy.exactHeadAcceptance.maximumWorkflowRunCount, 2);
  assert.equal(policy.exactHeadAcceptance.unrelatedUnitWorkflowRunCount, 0);
});
