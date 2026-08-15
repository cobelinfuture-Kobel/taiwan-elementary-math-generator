import assert from "node:assert/strict";
import test from "node:test";

import {
  PUBLIC_UI_SURFACES,
  resolvePublicUiCapabilityBinding,
} from "../../site/modules/curriculum/public/public-ui-capability-binding.js";
import {
  G5A_U01_DECIMAL_READ_PLACE_KP_ID,
  G5A_U01_DECIMAL_READ_PLACE_GROUP_ID,
  G5A_U01_DECIMAL_READ_PLACE_SPEC_ID,
  G5A_U01_SOURCE_ID,
} from "../../site/modules/curriculum/registry/g5a-u01-decimal-read-place-selector-projection.js";
import {
  G5A_U01_P03F28_GROUP_ID,
  G5A_U01_P03F28_KP_ID,
  G5A_U01_P03F28_SPEC_ID,
} from "../../site/modules/curriculum/registry/g5a-u01-rank8-decimal-selector-projection-p03f28.js";
import {
  BATCH_A_SELECTOR_AVAILABILITY,
  listVisibleBatchAKnowledgePoints,
} from "../../site/modules/curriculum/registry/batch-a-selector-p03f28-extension.js";
import { getCurrentPixelRegistrySnapshot } from "../../site/pixel/pixel-registry-bridge.js";

const expectedKps=[G5A_U01_DECIMAL_READ_PLACE_KP_ID,G5A_U01_P03F28_KP_ID].sort();
const expectedGroups=[G5A_U01_DECIMAL_READ_PLACE_GROUP_ID,G5A_U01_P03F28_GROUP_ID].sort();
const expectedSpecs=[G5A_U01_DECIMAL_READ_PLACE_SPEC_ID,G5A_U01_P03F28_SPEC_ID].sort();

function snapshots(input){
  return Object.values(PUBLIC_UI_SURFACES).map((surfaceId)=>resolvePublicUiCapabilityBinding({...input,surfaceId}));
}

test("P03F28 historical selector remains 219 while current public inventory advances through Slice037 to 32 sources / 235 KPs",()=>{
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.visibleCount,219);
  const sourceRows=listVisibleBatchAKnowledgePoints().filter((row)=>row.sourceId===G5A_U01_SOURCE_ID);
  assert.equal(sourceRows.length,2);
  assert.deepEqual(sourceRows.map((row)=>row.knowledgePointId).sort(),expectedKps);
  const pixel=getCurrentPixelRegistrySnapshot();
  assert.equal(pixel.sourceCount, 32);
  assert.equal(pixel.visibleKnowledgePointCount, 235);
  assert.equal(pixel.bySourceId[G5A_U01_SOURCE_ID].visibleKnowledgePointCount,5);
});

test("P03F28 exposes target single-KP numeric binding on Classic, 404 and Pixel",()=>{
  for(const binding of snapshots({
    sourceId:G5A_U01_SOURCE_ID,
    selectionMode:"singleKnowledgePoint",
    selectedKnowledgePointIds:[G5A_U01_P03F28_KP_ID],
  })){
    assert.equal(binding.blocked,false,`${binding.surfaceId}:${binding.blockedReasons?.join("|")}`);
    assert.deepEqual(binding.selectedKnowledgePointIds,[G5A_U01_P03F28_KP_ID]);
    assert.deepEqual(binding.availableQuestionTypeOptions.map((row)=>row.value),["numeric"]);
    assert.deepEqual([...binding.compatiblePatternGroupIds].sort(),[G5A_U01_P03F28_GROUP_ID]);
    assert.deepEqual([...new Set(binding.compatiblePatternGroups.flatMap((group)=>group.patternSpecIds))].sort(),[G5A_U01_P03F28_SPEC_ID]);
    assert.equal(binding.questionCount.max,240);
  }
});

test("P03F28 source-unit and same-unit mixed binding use both visible G5A-U01 KPs",()=>{
  for(const selectionMode of ["sourceUnit","mixedKnowledgePointsSameUnit"]){
    const input={sourceId:G5A_U01_SOURCE_ID,selectionMode};
    if(selectionMode==="mixedKnowledgePointsSameUnit") input.selectedKnowledgePointIds=[...expectedKps];
    for(const binding of snapshots(input)){
      assert.equal(binding.blocked,false,`${binding.surfaceId}:${selectionMode}`);
      assert.deepEqual([...binding.selectedKnowledgePointIds].sort(),expectedKps);
      assert.deepEqual([...binding.compatiblePatternGroupIds].sort(),expectedGroups);
      assert.deepEqual([...new Set(binding.compatiblePatternGroups.flatMap((group)=>group.patternSpecIds))].sort(),expectedSpecs);
      assert.equal(binding.availableSelectionModes.find((row)=>row.value==="mixedKnowledgePointsSameUnit")?.enabled,true);
      assert.deepEqual(binding.availableQuestionTypeOptions.map((row)=>row.value),["numeric"]);
      assert.equal(binding.capacityStatus,"STRUCTURAL_FALLBACK_AVAILABLE");
      assert.equal(binding.questionCount.max,240);
    }
  }
});
