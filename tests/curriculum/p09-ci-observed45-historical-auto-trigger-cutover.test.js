import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const manifest = JSON.parse(fs.readFileSync("data/curriculum/full-product/p09/p09-ci-observed45-historical-auto-trigger-cutover.json","utf8"));
const read = (p) => fs.readFileSync(p,"utf8");
const triggerBlock = (text) => {
  const start = text.search(/^on:\s*$/m);
  assert.notEqual(start,-1,"missing on block");
  const tail = text.slice(start);
  const end = tail.search(/^permissions:\s*$/m);
  return end === -1 ? tail : tail.slice(0,end);
};

test("observed fanout evidence is frozen at exactly 45 historical workflows",()=>{
  assert.equal(manifest.sourceEvidence.observedWorkflowRunCount,49);
  assert.equal(manifest.sourceEvidence.observedHistoricalAutoTriggerCount,45);
  assert.deepEqual(manifest.distribution,{W5:2,W6:8,W7:13,W8:20,P09Closed:2,totalRetiredAutoTriggers:45});
  assert.equal(manifest.scope.mode,"OBSERVED_ONLY_NO_282_WORKFLOW_SCAN");
  assert.equal(manifest.scope.historicalWorkflowFiles.length,45);
  assert.equal(new Set(manifest.scope.historicalWorkflowFiles).size,45);
});

test("all 45 observed historical workflows are dispatch-only and remain present",()=>{
  for(const path of manifest.scope.historicalWorkflowFiles){
    assert.equal(fs.existsSync(path),true,path);
    const block=triggerBlock(read(path));
    assert.match(block,/workflow_dispatch\s*:/,path);
    assert.doesNotMatch(block,/^\s*push\s*:/m,path);
  }
});

test("current/global automatic workflows retain main push authority",()=>{
  assert.equal(manifest.scope.currentAutoTriggerWorkflowsRetained.length,4);
  for(const path of manifest.scope.currentAutoTriggerWorkflowsRetained){
    assert.equal(fs.existsSync(path),true,path);
    const block=triggerBlock(read(path));
    assert.match(block,/^\s*push\s*:/m,path);
  }
});

test("cutover preserves workflows rather than deleting historical evidence",()=>{
  assert.equal(manifest.changeContract.filesDeleted,0);
  assert.equal(manifest.changeContract.workflowHistoryPreserved,true);
  assert.equal(manifest.changeContract.workflowDispatchPreserved,true);
  assert.equal(manifest.changeContract.mainPushRemovedFromHistoricalTargets,true);
});
