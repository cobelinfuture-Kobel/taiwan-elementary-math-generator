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
  const sourceAdvertises=sourceOption?.enabled===true || sourceUnit?.sameUnitMixedAdmission===true;
  const mixedWorks=Boolean(
    mixed &&
    mixed.blocked===false &&
    mixed.sameUnitMixedAdmission===true &&
    Array.isArray(mixed.selectedKnowledgePointIds) &&
    mixed.selectedKnowledgePointIds.length>=2
  );
  return {
    ...target,
    visibleKnowledgePointCount:ids.length,
    firstTwoKnowledgePointIds:requested,
    sourceUnitBlocked:sourceUnit?.blocked??null,
    sourceUnitSameUnitOptionEnabled:sourceOption?.enabled??null,
    sourceUnitSameUnitMixedAdmission:sourceUnit?.sameUnitMixedAdmission??null,
    mixedBindingPresent:Boolean(mixed),
    mixedBindingBlocked:mixed?.blocked??null,
    mixedBindingSameUnitOptionEnabled:mixedOption?.enabled??null,
    mixedBindingSameUnitMixedAdmission:mixed?.sameUnitMixedAdmission??null,
    mixedSelectedKnowledgePointCount:mixed?.selectedKnowledgePointIds?.length??0,
    defectReproduced:!(sourceAdvertises&&mixedWorks)
  };
}

test("reproduce the exact 21 reported same-unit mixed gaps against the current browser authority",()=>{
  const matrix=preflight.scope.targetUnits.map(inspect);
  console.log("P09_UI_SAME_UNIT_MIXED_21_MATRIX="+JSON.stringify(matrix));
  assert.equal(matrix.length,21);
  for(const row of matrix){
    assert.ok(row.visibleKnowledgePointCount>=2, row.unitCode+" must have >=2 visible KPs before same-unit mixed is meaningful");
    assert.equal(row.sourceUnitBlocked,false,row.unitCode+" sourceUnit baseline must remain usable");
    assert.equal(row.defectReproduced,true,row.unitCode+" reported same-unit mixed gap was not reproduced");
  }
});

test("known-good G6A-U02 proves the shared UI mode itself is not globally broken",()=>{
  const control=inspect(preflight.scope.controlUnit);
  console.log("P09_UI_SAME_UNIT_MIXED_CONTROL="+JSON.stringify(control));
  assert.ok(control.visibleKnowledgePointCount>=2);
  assert.equal(control.sourceUnitBlocked,false);
  assert.equal(control.sourceUnitSameUnitOptionEnabled,true);
  assert.equal(control.sourceUnitSameUnitMixedAdmission??true,true);
  assert.equal(control.mixedBindingBlocked,false);
  assert.equal(control.mixedBindingSameUnitOptionEnabled,true);
  assert.ok(control.mixedSelectedKnowledgePointCount>=2);
  assert.equal(control.defectReproduced,false);
});

test("preflight remains planning-only and does not reopen G5B-U10 rename work",()=>{
  assert.equal(preflight.frozenBoundaries.g5bU10RenameWork,"CANCELLED_BY_OPERATOR_NO_CHANGE_REQUIRED");
  assert.equal(preflight.frozenBoundaries.crossUnitMixed,"OUT_OF_SCOPE");
  assert.equal(preflight.frozenBoundaries.r02Mutation,false);
  assert.equal(preflight.frozenBoundaries.r04Mutation,false);
});
