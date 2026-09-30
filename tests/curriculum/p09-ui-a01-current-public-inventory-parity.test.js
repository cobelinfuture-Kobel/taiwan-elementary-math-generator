import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const readJson=(path)=>JSON.parse(fs.readFileSync(path,"utf8"));
const CONTRACT_PATH="data/curriculum/full-product/p09/p09-ui-a01-current-public-inventory-parity.json";
const TARGETS=["kp_g3a_u08_whole_as_fraction","kp_g3a_u08_unlike_denominator_comparison_limit"];

test("P09 A01 accounts 79 canonical source nodes through the exact 76-unit public projection",async()=>{
  globalThis.document=Object.create(null);
  try{
    const {materializeR05DeliveryWaveRebase}=await import("../../src/curriculum/global/r05-delivery-wave-rebase.mjs");
    const sourceUnits=await import("../../site/modules/curriculum/batch-a/source-units.js");
    const selector=await import("../../site/modules/curriculum/registry/batch-a-selector-extension.js");
    const r05=materializeR05DeliveryWaveRebase();
    const canonical=[...new Set(r05.knowledgePointAssignments.flatMap(row=>row.sourceNodeIds))].sort();
    const browser=sourceUnits.listBatchASourceUnits().map(row=>row.sourceId).sort();
    const selectorIds=Object.keys(selector.BATCH_A_SELECTOR_AVAILABILITY.bySourceId??{}).sort();
    const canonicalSet=new Set(canonical),browserSet=new Set(browser);
    const missing=canonical.filter(id=>!browserSet.has(id));
    const extra=browser.filter(id=>!canonicalSet.has(id));
    assert.equal(canonical.length,79);
    assert.equal(browser.length,76);
    assert.equal(selectorIds.length,76);
    assert.deepEqual(browser,selectorIds);
    assert.deepEqual(missing,["g4b_u03_4b03","g5a_u02_5a02a","g5a_u02_5a02a1","g6b_u02_6b02"]);
    assert.deepEqual(extra,["g5a_u02_5a02"]);
  }finally{delete globalThis.document;}
});

test("P09 A01 source-node collapse remains source-backed",()=>{
  const registry=readJson("data/curriculum/application/controller/postg-app-79-unit-registry.json");
  const index=readJson("data/curriculum/global/candidates/r02/source-authority-reconciliation-index.json");
  const g5a=registry.goldenBaselineUnits.find(row=>row.goldenUnitId==="g5a_u02_5a02");
  assert.deepEqual(g5a?.sourceNodeRefs,["g5a_u02_5a02a","g5a_u02_5a02a1"]);
  assert.equal(g5a?.mappingType,"EXPLICIT_COMPOSITE_GOLDEN_BASELINE");
  const aliases=index.semanticIdentityRules?.canonicalKnowledgePointAliases??{};
  for(const id of [
    "kp_g4b_u03_fraction_type_classification",
    "kp_g4b_u03_improper_mixed_conversion",
    "kp_g4b_u03_fraction_compare_order",
    "kp_g4b_u03_fraction_number_line",
    "kp_g4b_u03_mixed_fraction_add_sub",
    "kp_g4b_u03_fraction_times_integer_quantity"
  ]) assert.equal(typeof aliases[id],"string",id);
  const shared=index.semanticIdentityRules?.sharedReviewedKnowledgePointIds;
  assert.deepEqual(shared?.sourceNodeIds,["g6a_u08_6a08","g6b_u02_6b02"]);
  assert.equal(shared?.policy,"MERGE_SOURCE_REFS_KEEP_ONE_SEMANTIC_IDENTITY");
});

test("P09 A01 recovered G5B-U02 and G5B-U09 remain in the Classic source provider",async()=>{
  globalThis.document=Object.create(null);
  try{
    const sourceUnits=await import("../../site/modules/curriculum/batch-a/source-units.js");
    const byId=new Map(sourceUnits.listBatchASourceUnits().map(row=>[row.sourceId,row]));
    assert.equal(byId.get("g5b_u02_5b02")?.unitCode,"5B-U02");
    assert.equal(byId.get("g5b_u09_5b09")?.unitCode,"5B-U09");
    assert.equal(sourceUnits.isBatchASourceId("g5b_u02_5b02"),true);
    assert.equal(sourceUnits.isBatchASourceId("g5b_u09_5b09"),true);
  }finally{delete globalThis.document;}
});

test("P09 A01 historical 480-KP boundary is superseded by A02 current 482-KP admission",async()=>{
  globalThis.document=Object.create(null);
  try{
    const contract=readJson(CONTRACT_PATH);
    const {materializeR05DeliveryWaveRebase}=await import("../../src/curriculum/global/r05-delivery-wave-rebase.mjs");
    const selector=await import("../../site/modules/curriculum/registry/batch-a-selector-extension.js");
    const r05=materializeR05DeliveryWaveRebase();
    const visible=selector.listVisibleBatchAKnowledgePoints();
    const visibleSet=new Set(visible.map(row=>row.knowledgePointId));
    const canonical=r05.prerequisiteGraph.knowledgePoints;
    assert.equal(contract.preflight.currentProductAdmittedKnowledgePointCount,480);
    assert.equal(contract.preflight.canonicalProductAdmissionGap,2);
    assert.equal(contract.postA02.currentProductAdmittedSelectableCount,482);
    assert.equal(contract.postA02.canonicalProductAdmissionGap,0);
    assert.equal(canonical.length,482);
    assert.equal(visible.length,482);
    assert.deepEqual(canonical.filter(row=>!visibleSet.has(row.knowledgePointId)),[]);
    for(const id of TARGETS){
      const row=canonical.find(candidate=>candidate.knowledgePointId===id);
      assert.equal(row?.candidateStatus,"CANDIDATE_ONLY");
      const assignment=r05.getAssignment(id);
      assert.equal(assignment.productionAdmissionState,"PLANNED_NOT_ADMITTED");
      assert.equal(assignment.deliveryWaveId,"R05-W3");
    }
  }finally{delete globalThis.document;}
});

test("P09 A01 historical fail-closed evidence remains intact after A02 productization",()=>{
  const source=readJson("data/curriculum/knowledge/units/g3a_u08_3a08.knowledge-operation.json");
  const contract=readJson(CONTRACT_PATH);
  const blocked=new Set(TARGETS);
  assert.equal(source.knowledgePoints.filter(row=>blocked.has(row.candidateId)).length,2);
  assert.equal(source.productionBoundary.patternSpecsAuthored,false);
  assert.equal(source.productionBoundary.runtimeConsumerEnabled,false);
  assert.equal(source.productionBoundary.worksheetOutputAllowed,false);
  assert.equal(source.productionBoundary.productionAdmissionAllowed,false);
  assert.equal(contract.knowledgePointBoundary.forcedSelectorExposureAllowed,false);
  assert.equal(contract.knowledgePointBoundary.separateProductAdmissionRequired,true);
  assert.equal(contract.postA02.currentProductAdmittedSelectableCount,482);
});
