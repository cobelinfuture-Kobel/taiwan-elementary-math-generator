import fs from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

const preflight=JSON.parse(fs.readFileSync("data/curriculum/full-product/p09/p09-ui-same-unit-mixed-21-defect-preflight.json","utf8"));

globalThis.document=Object.create(null);
const selector=await import("../../site/modules/curriculum/registry/batch-a-selector-extension.js");
const binding=await import("../../site/modules/curriculum/public/public-ui-capability-binding-p04f33.js");

function rowsFor(sourceId){
  return selector.listVisibleBatchAKnowledgePoints().filter(row=>row.sourceId===sourceId);
}
function sameUnitOption(value){
  return value?.availableSelectionModes?.find(option=>option.value==="mixedKnowledgePointsSameUnit")??null;
}
function inspect(target){
  const rows=rowsFor(target.sourceId);
  const ids=[...new Set(rows.map(row=>row.knowledgePointId))];
  const sourceUnit=binding.resolvePublicUiCapabilityBinding({
    sourceId:target.sourceId,
    selectionMode:"sourceUnit"
  });
  const requested=ids.slice(0,Math.min(2,ids.length));
  const mixed=binding.resolvePublicUiCapabilityBinding({
    sourceId:target.sourceId,
    selectionMode:"mixedKnowledgePointsSameUnit",
    selectedKnowledgePointIds:requested
  });
  const sourceOption=sameUnitOption(sourceUnit);
  const mixedOption=sameUnitOption(mixed);
  const mixedWorks=Boolean(
    mixed &&
    mixed.blocked===false &&
    mixedOption?.enabled===true &&
    Array.isArray(mixed.selectedKnowledgePointIds) &&
    mixed.selectedKnowledgePointIds.length>=2
  );
  return {
    ...target,
    visibleKnowledgePointCount:ids.length,
    firstTwoKnowledgePointIds:requested,
    sourceUnitBlocked:sourceUnit?.blocked??null,
    sourceUnitSameUnitOptionEnabled:sourceOption?.enabled??null,
    mixedBindingPresent:Boolean(mixed),
    mixedBindingBlocked:mixed?.blocked??null,
    mixedBindingSameUnitOptionEnabled:mixedOption?.enabled??null,
    mixedSelectedKnowledgePointCount:mixed?.selectedKnowledgePointIds?.length??0,
    defectReproduced:!mixedWorks
  };
}

test("historical preflight evidence remains frozen while current same-unit mixed is repaired",()=>{
  assert.equal(preflight.firstCiReadback.reportedTargetsWithFiveVisibleKnowledgePoints,21);
  assert.equal(preflight.firstCiReadback.sameUnitMixedDefectReproducedCount,21);
  assert.equal(preflight.firstCiReadback.sourceUnitBlockedCount,17);
  assert.equal(preflight.firstCiReadback.sourceUnitUsableButSameUnitMixedMissingCount,4);
  assert.deepEqual(preflight.firstCiReadback.sourceUnitUsableUnits,["G4A-U05","G5A-U05A1","G5A-U07","G5A-U10A"]);
  assert.deepEqual(preflight.firstCiReadback.mixedRequestSilentSingleKpFallbackUnits,["G5A-U07","G5A-U10A"]);

  const matrix=preflight.scope.targetUnits.map(inspect);
  console.log("P09_UI_SAME_UNIT_MIXED_21_CURRENT_MATRIX="+JSON.stringify(matrix));
  assert.equal(matrix.length,21);

  for(const row of matrix){
    assert.equal(row.visibleKnowledgePointCount,5,row.unitCode+" current public selector should expose five KPs");
    assert.equal(row.mixedBindingPresent,true,row.unitCode+" current mixed binding must exist");
    assert.equal(row.mixedBindingBlocked,false,row.unitCode+" current mixed binding must not be blocked");
    assert.equal(row.mixedBindingSameUnitOptionEnabled,true,row.unitCode+" current mixed mode must be advertised");
    assert.equal(row.mixedSelectedKnowledgePointCount,2,row.unitCode+" current mixed request must preserve two KPs");
    assert.equal(row.defectReproduced,false,row.unitCode+" historical mixed-mode defect must now be repaired");
  }

  const sourceBlocked=matrix.filter(row=>row.sourceUnitBlocked===true);
  const sourceUsable=matrix.filter(row=>row.sourceUnitBlocked===false);
  const silentSingle=matrix.filter(row=>row.mixedBindingBlocked===false && row.mixedSelectedKnowledgePointCount<2);
  assert.equal(sourceBlocked.length,17);
  assert.deepEqual(sourceUsable.map(row=>row.unitCode),["G4A-U05","G5A-U05A1","G5A-U07","G5A-U10A"]);
  assert.deepEqual(silentSingle,[]);
});

test("known-good G6A-U02 proves the shared same-unit mixed infrastructure still works",()=>{
  const control=inspect(preflight.scope.controlUnit);
  console.log("P09_UI_SAME_UNIT_MIXED_CONTROL="+JSON.stringify(control));
  assert.equal(control.visibleKnowledgePointCount,5);
  assert.equal(control.sourceUnitBlocked,false);
  assert.equal(control.sourceUnitSameUnitOptionEnabled,true);
  assert.equal(control.mixedBindingBlocked,false);
  assert.equal(control.mixedBindingSameUnitOptionEnabled,true);
  assert.ok(control.mixedSelectedKnowledgePointCount>=2);
  assert.equal(control.defectReproduced,false);
});

test("preflight locks one shared repair shape and keeps unrelated authority frozen",()=>{
  assert.equal(preflight.rootCause.class,"CURRENT_CAPABILITY_BINDING_CHAIN_LACKS_UNIT_LEVEL_AGGREGATION_FOR_LATE_W5_W8_SLICES");
  assert.equal(preflight.doneContract.repairShapeSelected,"ONE_CURRENT_UNIT_AGGREGATION_LAYER_WITH_BOUNDED_PER_UNIT_COMPATIBILITY_PROOFS");
  assert.equal(preflight.frozenBoundaries.g5bU10RenameWork,"CANCELLED_BY_OPERATOR_NO_CHANGE_REQUIRED");
  assert.equal(preflight.frozenBoundaries.crossUnitMixed,"OUT_OF_SCOPE");
  assert.equal(preflight.frozenBoundaries.r02Mutation,false);
  assert.equal(preflight.frozenBoundaries.r04Mutation,false);
});
