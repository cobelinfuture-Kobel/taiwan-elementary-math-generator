import test from "node:test";
import assert from "node:assert/strict";

import {parseQueryState} from "../../site/assets/browser/state/query-state.js";
import {PUBLIC_UI_SURFACES,auditPublicUiCapabilityBinding,resolvePublicUiCapabilityBinding} from "../../site/modules/curriculum/public/public-ui-capability-binding-p03f42.js";
import {G4B_U06_P03F35_KP_ID} from "../../site/modules/curriculum/registry/g4b-u06-rank9-decimal-scale-selector-projection-p03f35.js";
import {G4B_U06_P03F42_GROUP_ID,G4B_U06_P03F42_KP_ID,G4B_U06_P03F42_SOURCE_ID,P03F42_HIDDEN_SIBLING_KP_IDS} from "../../site/modules/curriculum/registry/g4b-u06-rank10-decimal-number-line-selector-projection-p03f42.js";
import {getCurrentPixelRegistrySnapshot} from "../../site/pixel/pixel-registry-bridge.js";

test("P03F42 Classic Pixel and 404 bindings expose q042 as numeric single-KP route",()=>{
  for(const surfaceId of[PUBLIC_UI_SURFACES.CLASSIC,PUBLIC_UI_SURFACES.PIXEL,PUBLIC_UI_SURFACES.FALLBACK_404]){
    const binding=resolvePublicUiCapabilityBinding({sourceId:G4B_U06_P03F42_SOURCE_ID,surfaceId,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[G4B_U06_P03F42_KP_ID],selectedPatternGroupIds:[G4B_U06_P03F42_GROUP_ID]});
    assert.equal(binding.blocked,false);
    assert.deepEqual(binding.selectedKnowledgePointIds,[G4B_U06_P03F42_KP_ID]);
    assert.deepEqual(binding.compatiblePatternGroupIds,[G4B_U06_P03F42_GROUP_ID]);
    assert.equal(binding.questionType,"numeric");
    assert.equal(binding.depthOptions.length,0);
    assert.equal(binding.contextOptions.length,0);
  }
  const audit=auditPublicUiCapabilityBinding();
  assert.equal(audit.ok,true,JSON.stringify(audit.errors));
});

test("P03F42 mixed same-unit route can combine q042 with an existing numeric G4B-U06 KP",()=>{
  const binding=resolvePublicUiCapabilityBinding({sourceId:G4B_U06_P03F42_SOURCE_ID,surfaceId:PUBLIC_UI_SURFACES.PIXEL,selectionMode:"mixedKnowledgePointsSameUnit",selectedKnowledgePointIds:[G4B_U06_P03F35_KP_ID,G4B_U06_P03F42_KP_ID]});
  assert.equal(binding.blocked,false);
  assert.equal(binding.selectedKnowledgePointCount,2);
  assert.deepEqual(new Set(binding.selectedKnowledgePointIds),new Set([G4B_U06_P03F35_KP_ID,G4B_U06_P03F42_KP_ID]));
  assert.ok(binding.compatiblePatternGroupIds.includes(G4B_U06_P03F42_GROUP_ID));
  assert.equal(binding.availableSelectionModes.find(row=>row.value==="mixedKnowledgePointsSameUnit")?.enabled,true);
});

test("P03F42 query-state deep link preserves promoted number-line KP and PatternGroup",()=>{
  const state=parseQueryState(`?sourceId=${G4B_U06_P03F42_SOURCE_ID}&selectionMode=singleKnowledgePoint&kp=${G4B_U06_P03F42_KP_ID}&pg=${G4B_U06_P03F42_GROUP_ID}`);
  assert.equal(state.selectionMode,"singleKnowledgePoint");
  assert.deepEqual(state.selectedKnowledgePointIds,[G4B_U06_P03F42_KP_ID]);
  assert.deepEqual(state.selectedPatternGroupIds,[G4B_U06_P03F42_GROUP_ID]);
  assert.deepEqual(state.selectorWarnings,[]);
});

test("P03F42 current Pixel inventory is 33 sources / 240 KPs with G4B-U06 5/1/0",()=>{
  const pixel=getCurrentPixelRegistrySnapshot();
  assert.equal(pixel.sourceCount,33);
  assert.equal(pixel.visibleKnowledgePointCount,240);
  const source=pixel.bySourceId[G4B_U06_P03F42_SOURCE_ID];
  assert.equal(source.visibleKnowledgePoints.length,5);
  assert.equal(source.hiddenPendingCount,1);
  assert.equal(source.notSelectableCount,0);
  assert.ok(source.visibleKnowledgePoints.some(row=>row.knowledgePointId===G4B_U06_P03F42_KP_ID));
  for(const hiddenId of P03F42_HIDDEN_SIBLING_KP_IDS)assert.equal(source.visibleKnowledgePoints.some(row=>row.knowledgePointId===hiddenId),false);
});
