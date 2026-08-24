import test from "node:test";
import assert from "node:assert/strict";

import {parseQueryState} from "../../site/assets/browser/state/query-state.js";
import {PUBLIC_UI_SURFACES,auditPublicUiCapabilityBinding,resolvePublicUiCapabilityBinding} from "../../site/modules/curriculum/public/public-ui-capability-binding-p03f41.js";
import {G6B_U01_P03F32_KP_ID} from "../../site/modules/curriculum/registry/g6b-u01-rank8-decimal-fraction-conversion-selector-projection-p03f32.js";
import {G6B_U01_P03F41_GROUP_ID,G6B_U01_P03F41_KP_ID,G6B_U01_P03F41_SOURCE_ID} from "../../site/modules/curriculum/registry/g6b-u01-rank9-mixed-domain-order-selector-projection-p03f41.js";
import {getCurrentPixelRegistrySnapshot} from "../../site/pixel/pixel-registry-bridge.js";

test("P03F41 Classic and Pixel bindings expose q041 as a numeric single-KP route",()=>{
  for(const surfaceId of[PUBLIC_UI_SURFACES.CLASSIC,PUBLIC_UI_SURFACES.PIXEL,PUBLIC_UI_SURFACES.FALLBACK_404]){
    const binding=resolvePublicUiCapabilityBinding({sourceId:G6B_U01_P03F41_SOURCE_ID,surfaceId,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[G6B_U01_P03F41_KP_ID],selectedPatternGroupIds:[G6B_U01_P03F41_GROUP_ID]});
    assert.equal(binding.blocked,false);
    assert.deepEqual(binding.selectedKnowledgePointIds,[G6B_U01_P03F41_KP_ID]);
    assert.deepEqual(binding.compatiblePatternGroupIds,[G6B_U01_P03F41_GROUP_ID]);
    assert.equal(binding.questionType,"numeric");
    assert.equal(binding.depthOptions.length,0);
    assert.equal(binding.contextOptions.length,0);
  }
  const audit=auditPublicUiCapabilityBinding();
  assert.equal(audit.ok,true,JSON.stringify(audit.errors));
});

test("P03F41 sourceUnit and mixed same-unit bindings preserve both G6B-U01 visible KPs",()=>{
  const expected=new Set([G6B_U01_P03F32_KP_ID,G6B_U01_P03F41_KP_ID]);
  const sourceUnit=resolvePublicUiCapabilityBinding({sourceId:G6B_U01_P03F41_SOURCE_ID,surfaceId:PUBLIC_UI_SURFACES.CLASSIC,selectionMode:"sourceUnit"});
  assert.equal(sourceUnit.blocked,false);
  assert.equal(sourceUnit.selectedKnowledgePointCount,2);
  assert.deepEqual(new Set(sourceUnit.selectedKnowledgePointIds),expected);
  assert.equal(sourceUnit.compatiblePatternGroupIds.length,2);
  const mixed=resolvePublicUiCapabilityBinding({sourceId:G6B_U01_P03F41_SOURCE_ID,surfaceId:PUBLIC_UI_SURFACES.PIXEL,selectionMode:"mixedKnowledgePointsSameUnit",selectedKnowledgePointIds:[G6B_U01_P03F32_KP_ID,G6B_U01_P03F41_KP_ID]});
  assert.equal(mixed.blocked,false);
  assert.equal(mixed.selectedKnowledgePointCount,2);
  assert.deepEqual(new Set(mixed.selectedKnowledgePointIds),expected);
  assert.equal(mixed.availableSelectionModes.find(row=>row.value==="mixedKnowledgePointsSameUnit")?.enabled,true);
});

test("P03F41 query-state deep link preserves the promoted KP and PatternGroup",()=>{
  const state=parseQueryState(`?sourceId=${G6B_U01_P03F41_SOURCE_ID}&selectionMode=singleKnowledgePoint&kp=${G6B_U01_P03F41_KP_ID}&pg=${G6B_U01_P03F41_GROUP_ID}`);
  assert.equal(state.selectionMode,"singleKnowledgePoint");
  assert.deepEqual(state.selectedKnowledgePointIds,[G6B_U01_P03F41_KP_ID]);
  assert.deepEqual(state.selectedPatternGroupIds,[G6B_U01_P03F41_GROUP_ID]);
  assert.deepEqual(state.selectorWarnings,[]);
});

test("P03F41 current Pixel inventory through Slice053 is 34 sources / 259 KPs with G6B-U01 3/2/2",()=>{
  const pixel=getCurrentPixelRegistrySnapshot();
  assert.equal(pixel.sourceCount,34);
  assert.equal(pixel.visibleKnowledgePointCount, 259);
  const source=pixel.bySourceId[G6B_U01_P03F41_SOURCE_ID];
  assert.equal(source.visibleKnowledgePoints.length,3);
  assert.equal(source.hiddenPendingCount,2);
  assert.equal(source.notSelectableCount,2);
  assert.ok(source.visibleKnowledgePoints.some(row=>row.knowledgePointId===G6B_U01_P03F41_KP_ID));
});
