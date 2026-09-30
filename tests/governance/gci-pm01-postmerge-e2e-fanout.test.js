import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const POLICY_PATH=".github/ci/gci-pm01/postmerge-e2e-fanout-policy.json";
const policy=JSON.parse(fs.readFileSync(POLICY_PATH,"utf8"));

function pushPaths(file){
  const lines=fs.readFileSync(file,"utf8").split(/\r?\n/);
  const out=[];
  let inOn=false,inPush=false,inPaths=false,onIndent=-1,pushIndent=-1,pathsIndent=-1;
  for(const line of lines){
    const trimmed=line.trim();
    const indent=line.length-line.trimStart().length;
    if(!inOn){
      if(trimmed==="on:"){inOn=true;onIndent=indent;}
      continue;
    }
    if(trimmed && indent<=onIndent && trimmed!=="on:")break;
    if(!inPush){
      if(trimmed==="push:"&&indent>onIndent){inPush=true;pushIndent=indent;}
      continue;
    }
    if(trimmed && indent<=pushIndent && trimmed!=="push:")break;
    if(!inPaths){
      if(trimmed==="paths:"&&indent>pushIndent){inPaths=true;pathsIndent=indent;}
      continue;
    }
    if(trimmed && indent<=pathsIndent)break;
    const m=trimmed.match(/^- ["'](.+?)["']$/);
    if(m)out.push(m[1]);
  }
  return out;
}

function triggerBlock(file){
  const text=fs.readFileSync(file,"utf8");
  const start=text.search(/^on:\s*$/m);
  assert.notEqual(start,-1,file+" missing on block");
  const tail=text.slice(start);
  const end=tail.search(/^permissions:\s*$/m);
  return end===-1?tail:tail.slice(0,end);
}

function allSliceWorkflowFiles(){
  return fs.readdirSync(".github/workflows")
    .filter(name=>/^p0[567]f-w[567]-q\d{3}-live-pages-e2e\.yml$/.test(name))
    .map(name=>path.posix.join(".github/workflows",name))
    .sort();
}

test("GCI-PM01 preserves Q010 baseline evidence and records the P09 observed-45 supersession",()=>{
  assert.equal(policy.schemaVersion,"1.1.0");
  assert.equal(policy.programId,"GLOBAL_GITHUB_CI_HANDSHAKE_STANDARD_V1");
  assert.equal(policy.taskId,"GCI-PM01_HistoricalPostMergeE2EFanoutBoundedCutover");
  assert.equal(policy.authority.q010MergeSha,"61dbbb11c77c5da0c2c905b1dcf059310ddcf507");
  assert.equal(policy.baselineObservedFanout.totalPushWorkflowRuns,41);
  assert.equal(policy.historicalCutoverWorkflows.length,53);
  assert.equal(policy.p09Observed45Cutover.observedTotalPushWorkflowRuns,49);
  assert.equal(policy.p09Observed45Cutover.observedHistoricalAutoTriggerRuns,45);
  assert.equal(policy.p09Observed45Cutover.dispatchOnlyWorkflows.length,45);
  assert.equal(new Set(policy.p09Observed45Cutover.dispatchOnlyWorkflows).size,45);
  assert.equal(policy.p09Observed45Cutover.scopeMode,"OBSERVED_ONLY_NO_282_WORKFLOW_SCAN");
});

test("the exact 45 P09-observed historical workflows are dispatch-only",()=>{
  for(const file of policy.p09Observed45Cutover.dispatchOnlyWorkflows){
    assert.equal(fs.existsSync(file),true,file);
    const block=triggerBlock(file);
    assert.match(block,/workflow_dispatch\s*:/,file);
    assert.doesNotMatch(block,/^\s*push\s*:/m,file);
    assert.deepEqual(pushPaths(file),[],file+" must have zero automatic push paths");
  }
});

test("older GCI historical workflows outside the observed 45 remain bounded away from volatile shared paths",()=>{
  const dispatchOnly=new Set(policy.p09Observed45Cutover.dispatchOnlyWorkflows);
  for(const file of policy.historicalCutoverWorkflows){
    assert.equal(fs.existsSync(file),true,file);
    if(dispatchOnly.has(file)) continue;
    const paths=pushPaths(file);
    assert.ok(paths.length>0,file+" must retain its prior owned push paths unless explicitly in observed-45 cutover");
    for(const shared of policy.volatileSharedTriggerPaths){
      assert.equal(paths.includes(shared),false,file+" still watches volatile shared path "+shared);
    }
    assert.equal(paths.includes(file),false,file+" still self-triggers on workflow edits");
  }
});

test("frozen W5/W6/W7 slice E2E workflows no longer own volatile shared trigger paths",()=>{
  const files=allSliceWorkflowFiles();
  for(const shared of policy.volatileSharedTriggerPaths){
    const owners=files.filter(file=>pushPaths(file).includes(shared));
    assert.deepEqual(owners,[],shared+" owners="+owners.join(","));
  }
});

test("Q026 is frozen historical and current/global automation is retained outside frozen slice ownership",()=>{
  const q026=policy.legacyActiveCurrentSliceWorkflow;
  assert.equal(q026,".github/workflows/p07f-w7-q026-live-pages-e2e.yml");
  const block=triggerBlock(q026);
  assert.match(block,/workflow_dispatch\s*:/);
  assert.doesNotMatch(block,/^\s*push\s*:/m);
  assert.equal(policy.activeCurrentSliceWorkflow,null);
  assert.equal(policy.successorRule.finalFrozenW7Slice,true);
  assert.equal(policy.successorRule.supersededAtTaskId,"P09_CI_Observed45HistoricalAutoTriggerCutover");
  for(const file of policy.p09Observed45Cutover.retainedCurrentGlobalAutomaticWorkflows){
    assert.equal(fs.existsSync(file),true,file);
    assert.match(triggerBlock(file),/^\s*push\s*:/m,file);
  }
});

test("cutover does not touch product runtime or curriculum authority",()=>{
  assert.equal(policy.invariants.productRuntimeChanged,false);
  assert.equal(policy.invariants.curriculumAuthorityChanged,false);
  assert.equal(policy.invariants.historicalWorkflowBodyAndE2ERunnerSemanticsChanged,false);
  assert.equal(policy.target.p09Observed45HistoricalWorkflowRunsOnMainPush,0);
  assert.equal(policy.target.currentSliceWorkflowRunsOnSharedPointerOnlyPush,0);
  assert.equal(policy.target.expectedGovernanceOnlyMergeFanoutUpperBound,6);
});
