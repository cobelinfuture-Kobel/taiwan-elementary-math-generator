import fs from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

const readJson=(path)=>JSON.parse(fs.readFileSync(path,"utf8"));
const readText=(path)=>fs.readFileSync(path,"utf8");
const CONTRACT_PATH="data/curriculum/full-product/p09/p09-ui-source-authority-preflight.json";
const IMPACT_PATH="data/project/change-impact/P09_UI_SOURCE_AUTHORITY_PREFLIGHT.impact.json";
const PLAN_PATH="data/project/validation-plans/P09_UI_SOURCE_AUTHORITY_PREFLIGHT.validation.json";

test("P09 authority remains exactly 79 source nodes / 482 canonical KPs without R02-R05 mutation",async()=>{
  const contract=readJson(CONTRACT_PATH);
  const impact=readJson(IMPACT_PATH);
  const {materializeR05DeliveryWaveRebase}=await import("../../src/curriculum/global/r05-delivery-wave-rebase.mjs");
  const r05=materializeR05DeliveryWaveRebase();
  const sourceIds=new Set(r05.knowledgePointAssignments.flatMap(row=>row.sourceNodeIds));
  assert.equal(r05.knowledgePointAssignments.length,482);
  assert.equal(sourceIds.size,79);
  assert.equal(r05.waves.length,9);
  assert.equal(contract.sourceAuthority.canonicalSourceNodeCount,79);
  assert.equal(contract.sourceAuthority.canonicalKnowledgePointCount,482);
  assert.equal(impact.changeImpact.currentAuthorityChanged,false);
  assert.equal(impact.scopeGuards.r02Mutation,false);
  assert.equal(impact.scopeGuards.r03Mutation,false);
  assert.equal(impact.scopeGuards.r04Mutation,false);
  assert.equal(impact.scopeGuards.r05Mutation,false);
});

test("P09 current browser selector reaches 482/482 after A02",async()=>{
  globalThis.document=Object.create(null);
  try{
    const selector=await import("../../site/modules/curriculum/registry/batch-a-selector-extension.js");
    const {materializeR05DeliveryWaveRebase}=await import("../../src/curriculum/global/r05-delivery-wave-rebase.mjs");
    const contract=readJson(CONTRACT_PATH);
    const visible=selector.listVisibleBatchAKnowledgePoints();
    const ids=visible.map(row=>row.knowledgePointId);
    const canonicalIds=materializeR05DeliveryWaveRebase().knowledgePointAssignments.map(row=>row.knowledgePointId);
    const visibleSet=new Set(ids);
    const missing=canonicalIds.filter(id=>!visibleSet.has(id));
    assert.equal(visible.length,482);
    assert.equal(new Set(ids).size,482);
    assert.equal(selector.BATCH_A_SELECTOR_AVAILABILITY.visibleCount,482);
    assert.deepEqual(missing,[]);
    assert.equal(selector.BATCH_A_SELECTOR_AVAILABILITY.sourceCount,76);
    assert.equal(contract.currentPublicUiInventory.browserSelectorObservedVisibleKnowledgePointCount,482);
    assert.equal(contract.currentPublicUiInventory.currentProductAdmittedSelectableKnowledgePointCount,482);
    assert.equal(contract.currentPublicUiInventory.canonicalCandidateOnlyNotAdmittedCount,0);
    assert.deepEqual(contract.currentPublicUiInventory.browserSelectorMissingKnowledgePointIds,[]);
    assert.equal(contract.currentPublicUiInventory.browserSelectorObservedSourceCount,76);
    assert.equal(contract.currentPublicUiInventory.expectedPublicProductSourceUnitCount,76);
    assert.equal(contract.currentPublicUiInventory.canonicalSourceNodeToPublicUnitCollapseCount,3);
  }finally{delete globalThis.document;}
});

test("P09 current public UI pointers explicitly include A02 while retaining W8 compatibility below it",()=>{
  const contract=readJson(CONTRACT_PATH);
  const index=readText("site/index.html");
  const selectorEntry=readText("site/modules/curriculum/registry/batch-a-selector-extension.js");
  const selectorA02=readText("site/modules/curriculum/registry/batch-a-selector-p09-a02-extension.js");
  const bindingEntry=readText("site/modules/curriculum/public/public-ui-capability-binding-p04f33.js");
  const bindingA02=readText("site/modules/curriculum/public/public-ui-capability-binding-p09-a02.js");
  const worksheet=readText("site/assets/browser/pipeline/build-worksheet-document.js");
  for(const id of ["batch-a-grade-select","batch-a-semester-select","batch-a-source-select","batch-a-selection-mode-select","batch-a-question-count-input","batch-a-ordering-select","batch-a-answer-key-input","generation-seed-input","preview-frame"]) assert.match(index,new RegExp(id));
  assert.match(index,/mixedKnowledgePointsCrossUnit" disabled/);
  assert.match(selectorEntry,/batch-a-selector-p09-a02-extension/);
  assert.match(selectorA02,/batch-a-selector-p08f22-extension/);
  assert.match(bindingEntry,/public-ui-capability-binding-p09-a02/);
  assert.match(bindingA02,/public-ui-capability-binding-p08f22/);
  assert.match(worksheet,/applyR07AuthoritativeConsumerCutover/);
  assert.equal(contract.currentPublicUiInventory.controls.crossUnitMixedDefault,"DISABLED");
});

test("P09 still isolates the 15-unit R07 consumer-coverage blocker",async()=>{
  globalThis.document=Object.create(null);
  try{
    const {R07_PUBLIC_PRODUCT_UNIT_IDS}=await import("../../site/modules/curriculum/global/r07-authoritative-consumer-cutover.js");
    const contract=readJson(CONTRACT_PATH);
    assert.equal(R07_PUBLIC_PRODUCT_UNIT_IDS.length,15);
    assert.equal(contract.currentPublicUiInventory.authoritativeConsumerCutover.currentExplicitProductUnitCount,15);
    assert.equal(contract.currentPublicUiInventory.authoritativeConsumerCutover.remainingPublicUnitsCurrentlyRelyOnCompatibilityOrHistoricalRouting,true);
    assert.ok(R07_PUBLIC_PRODUCT_UNIT_IDS.length<contract.sourceAuthority.canonicalSourceNodeCount);
  }finally{delete globalThis.document;}
});

test("P09 preserves A01 deployed recovery evidence as immutable historical proof",()=>{
  const contract=readJson(CONTRACT_PATH);
  assert.equal(contract.deployedUiEvidence.a01RecoveryStatus,"PASS_P09_UI_A01_SOURCE_PROVIDER_E6_COMPLETE");
  assert.equal(contract.deployedUiEvidence.a01ReadbackPath,"docs/ci/latest-p09-ui-a01-pages-e2e.json");
  assert.equal(contract.currentPublicUiInventory.browserSourceUnitProviderObservedCountBeforeA01,74);
  assert.deepEqual(contract.currentPublicUiInventory.browserSourceUnitProviderMissingProductSourceIds,["g5b_u02_5b02","g5b_u09_5b09"]);
  assert.equal(contract.p09DoneContract.deployedRequiredSourceOptionFailures,0);
});

test("P09/P10 boundary now has zero canonical KP product gap but remains fail-closed on global closeout",()=>{
  const contract=readJson(CONTRACT_PATH);
  const impact=readJson(IMPACT_PATH);
  const plan=readJson(PLAN_PATH);
  assert.equal(contract.p09DoneContract.sourceInventoryParity,"76_OF_76_PUBLIC_PRODUCT_UNITS_WITH_79_OF_79_CANONICAL_SOURCE_NODES_ACCOUNTED");
  assert.equal(contract.p09DoneContract.knowledgePointSelectorParity,"482_OF_482_P09_PRODUCT_ADMITTED");
  assert.equal(contract.p09DoneContract.canonicalProductAdmissionGap,0);
  assert.equal(contract.p09DoneContract.full482SelectorParityRequiresSeparateProductAdmission,false);
  assert.equal(contract.p09DoneContract.crossUnitMixedRequired,false);
  assert.ok(contract.p10CloseoutPrerequisiteLock.prerequisites.includes("P09_UI_D0_COMPLETE"));
  assert.ok(contract.p10CloseoutPrerequisiteLock.prerequisites.includes("ZERO_CANONICAL_KP_PRODUCT_ADMISSION_GAP"));
  assert.ok(contract.p10CloseoutPrerequisiteLock.prerequisites.includes("FULL_PUBLIC_AUTHORITY_CONSUMER_COVERAGE"));
  assert.ok(contract.p10CloseoutPrerequisiteLock.prerequisites.includes("GLOBAL_RELEASE_CERTIFICATION_AT_P10"));
  assert.equal(contract.distance.nextShortestStep,"P09_UI_A02_PR_GATE_MERGE_AND_DEPLOYED_E6_THEN_A03_CURRENT_AUTHORITY_ADAPTER_PREFLIGHT");
  assert.equal(impact.scopeGuards.r02Mutation,false);
  assert.deepEqual(plan.forbidden,["FULL_NODE_REGRESSION","GLOBAL_BROWSER_REPLAY"]);
});
