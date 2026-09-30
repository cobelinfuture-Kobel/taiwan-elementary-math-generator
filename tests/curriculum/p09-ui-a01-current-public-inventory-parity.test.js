import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const readJson=(path)=>JSON.parse(fs.readFileSync(path,"utf8"));

test("P09 A01 diagnostic enumerates canonical source-node versus browser public-unit projection", async () => {
  globalThis.document=Object.create(null);
  try{
    const {materializeR05DeliveryWaveRebase}=await import("../../src/curriculum/global/r05-delivery-wave-rebase.mjs");
    const sourceUnits=await import("../../site/modules/curriculum/batch-a/source-units.js");
    const r05=materializeR05DeliveryWaveRebase();
    const canonical=[...new Set(r05.knowledgePointAssignments.flatMap(row=>row.sourceNodeIds))].sort();
    const browser=sourceUnits.listBatchASourceUnits().map(row=>row.sourceId).sort();
    const browserSet=new Set(browser), canonicalSet=new Set(canonical);
    const missing=canonical.filter(id=>!browserSet.has(id));
    const extra=browser.filter(id=>!canonicalSet.has(id));
    console.log("P09_A01_SOURCE_DIFF="+JSON.stringify({canonicalCount:canonical.length,browserCount:browser.length,missing,extra}));
    assert.equal(canonical.length,79);
    assert.equal(browser.length,76);
  }finally{delete globalThis.document;}
});

test("P09 A01 diagnostic enumerates missing canonical KP product-admission evidence", async () => {
  globalThis.document=Object.create(null);
  try{
    const {materializeR05DeliveryWaveRebase}=await import("../../src/curriculum/global/r05-delivery-wave-rebase.mjs");
    const selector=await import("../../site/modules/curriculum/registry/batch-a-selector-extension.js");
    const r05=materializeR05DeliveryWaveRebase();
    const visible=selector.listVisibleBatchAKnowledgePoints();
    const visibleSet=new Set(visible.map(row=>row.knowledgePointId));
    const missing=r05.knowledgePoints.filter(row=>!visibleSet.has(row.knowledgePointId)).map(row=>({
      knowledgePointId:row.knowledgePointId,
      canonicalNameZh:row.canonicalNameZh,
      sourceNodeIds:(row.sourceRefs??[]).map(ref=>typeof ref==="string"?ref:ref.sourceNodeId),
      candidateStatus:row.candidateStatus
    }));
    const assignments=missing.map(row=>({
      ...row,
      delivery:r05.getAssignment(row.knowledgePointId)
    }));
    console.log("P09_A01_KP_DIFF="+JSON.stringify({canonicalCount:r05.knowledgePoints.length,visibleCount:visible.length,missing:assignments}));
    assert.deepEqual(missing.map(row=>row.knowledgePointId),[
      "kp_g3a_u08_unlike_denominator_comparison_limit",
      "kp_g3a_u08_whole_as_fraction"
    ]);
  }finally{delete globalThis.document;}
});

test("P09 A01 baseline confirms G3A-U08 source authority still marks two missing KPs as non-production candidate rows",()=>{
  const source=readJson("data/curriculum/knowledge/units/g3a_u08_3a08.knowledge-operation.json");
  const missing=new Set(["kp_g3a_u08_whole_as_fraction","kp_g3a_u08_unlike_denominator_comparison_limit"]);
  const rows=source.knowledgePoints.filter(row=>missing.has(row.candidateId));
  assert.equal(rows.length,2);
  assert.equal(source.productionBoundary.patternSpecsAuthored,false);
  assert.equal(source.productionBoundary.runtimeConsumerEnabled,false);
  assert.equal(source.productionBoundary.worksheetOutputAllowed,false);
  assert.equal(source.productionBoundary.productionAdmissionAllowed,false);
});
