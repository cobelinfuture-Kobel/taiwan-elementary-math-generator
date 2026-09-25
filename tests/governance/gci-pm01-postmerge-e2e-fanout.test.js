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

function allSliceWorkflowFiles(){
  return fs.readdirSync(".github/workflows")
    .filter(name=>/^p0[567]f-w[567]-q\d{3}-live-pages-e2e\.yml$/.test(name))
    .map(name=>path.posix.join(".github/workflows",name))
    .sort();
}

test("GCI-PM01 policy is tied to Q010 D0 evidence and exact observed fanout",()=>{
  assert.equal(policy.schemaVersion,"1.0.0");
  assert.equal(policy.programId,"GLOBAL_GITHUB_CI_HANDSHAKE_STANDARD_V1");
  assert.equal(policy.taskId,"GCI-PM01_HistoricalPostMergeE2EFanoutBoundedCutover");
  assert.equal(policy.authority.q010MergeSha,"61dbbb11c77c5da0c2c905b1dcf059310ddcf507");
  assert.equal(policy.authority.q010D0Status,"PASS_E6_D0_COMPLETE");
  assert.equal(policy.authority.q010D0WorkflowRunId,35744406174);
  assert.equal(policy.baselineObservedFanout.totalPushWorkflowRuns,41);
  assert.equal(policy.baselineObservedFanout.slicePostMergeE2EWorkflowRuns,38);
  assert.equal(policy.baselineObservedFanout.historicalSliceWorkflowRuns,37);
  assert.equal(policy.historicalCutoverWorkflows.length,50);
  assert.equal(new Set(policy.historicalCutoverWorkflows).size,50);
});

test("historical cutover workflows no longer watch volatile shared paths or their own workflow file",()=>{
  for(const file of policy.historicalCutoverWorkflows){
    assert.equal(fs.existsSync(file),true,file);
    const paths=pushPaths(file);
    assert.ok(paths.length>0,file+" must retain owned push paths");
    for(const shared of policy.volatileSharedTriggerPaths){
      assert.equal(paths.includes(shared),false,file+" still watches volatile shared path "+shared);
    }
    assert.equal(paths.includes(file),false,file+" still self-triggers on workflow edits");
  }
});

test("exactly one W5/W6/W7 slice E2E owns each volatile shared trigger path",()=>{
  const files=allSliceWorkflowFiles();
  for(const shared of policy.volatileSharedTriggerPaths){
    const owners=files.filter(file=>pushPaths(file).includes(shared));
    assert.deepEqual(owners,[policy.activeCurrentSliceWorkflow],shared+" owners="+owners.join(","));
  }
});

test("Q023 is the single current shared-path owner and Q022 is demoted to owned paths only",()=>{
  const current=policy.activeCurrentSliceWorkflow;
  assert.equal(fs.existsSync(current),true);
  const paths=pushPaths(current);
  for(const shared of policy.volatileSharedTriggerPaths)assert.ok(paths.includes(shared),shared);
  assert.ok(paths.includes(current),"current workflow remains self-observing while it is current");
  const text=fs.readFileSync(current,"utf8");
  assert.match(text,/name: P07F W7 Q023 Post-Merge Pages E2E/);
  assert.match(text,/node tools\/curriculum\/run-p07f-w7-q023-live-pages-e2e\.mjs/);
  assert.ok(policy.historicalCutoverWorkflows.includes(".github/workflows/p07f-w7-q022-live-pages-e2e.yml"));
  assert.match(text,/Persist durable Pages E2E readback/);
});

test("cutover does not touch product runtime or curriculum authority",()=>{
  assert.equal(policy.invariants.productRuntimeChanged,false);
  assert.equal(policy.invariants.curriculumAuthorityChanged,false);
  assert.equal(policy.invariants.historicalWorkflowBodyAndE2ERunnerSemanticsChanged,false);
  assert.equal(policy.invariants.q010CurrentWorkflowSemanticsChanged,false);
  assert.equal(policy.target.historicalSliceWorkflowRunsOnSharedPointerOnlyPush,0);
  assert.equal(policy.target.currentSliceWorkflowRunsOnSharedPointerOnlyPush,1);
  assert.equal(policy.target.sliceE2EFanoutReductionFromObservedQ010Merge,37);
});
