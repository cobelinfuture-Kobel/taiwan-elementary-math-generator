import test from "node:test";
import assert from "node:assert/strict";
import {PUBLIC_UI_SURFACES,resolvePublicUiCapabilityBinding} from "../../site/modules/curriculum/public/public-ui-capability-binding-p03f39.js";
import {G5B_U04_P03F39_GROUP_ID,G5B_U04_P03F39_KP_ID,G5B_U04_P03F39_SOURCE_ID} from "../../site/modules/curriculum/registry/g5b-u04-rank9-integer-times-decimal-selector-projection-p03f39.js";
import {G5B_U04_P03F31_GROUP_ID,G5B_U04_P03F31_KP_ID} from "../../site/modules/curriculum/registry/g5b-u04-rank8-decimal-times-integer-selector-projection-p03f31.js";
import {getCurrentPixelRegistrySnapshot,getCurrentPixelSourceSummary} from "../../site/pixel/pixel-registry-bridge.js";
import {parseQueryState} from "../../site/assets/browser/state/query-state.js";

test("P03F39 exposes q039 numeric-only binding on every public surface",()=>{
  for(const surfaceId of Object.values(PUBLIC_UI_SURFACES)){
    const binding=resolvePublicUiCapabilityBinding({sourceId:G5B_U04_P03F39_SOURCE_ID,surfaceId,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[G5B_U04_P03F39_KP_ID]});
    assert.equal(binding.blocked,false,`${surfaceId}:${binding.blockedReasons.join("|")}`);
    assert.deepEqual(binding.selectedKnowledgePointIds,[G5B_U04_P03F39_KP_ID]);
    assert.deepEqual(binding.availableQuestionTypeOptions.map(row=>row.value),["numeric"]);
    assert.deepEqual(binding.compatiblePatternGroupIds,[G5B_U04_P03F39_GROUP_ID]);
    assert.deepEqual(binding.depthOptions,[]);
    assert.deepEqual(binding.contextOptions,[]);
  }
});

test("P03F39 current Pixel registry advances through Slice044 to 33/245 and G5B-U04 contains q031 plus q039",()=>{
  const registry=getCurrentPixelRegistrySnapshot();
  assert.deepEqual([registry.sourceCount,registry.visibleKnowledgePointCount],[33,245]);
  const summary=getCurrentPixelSourceSummary(G5B_U04_P03F39_SOURCE_ID);
  const ids=summary.visibleKnowledgePoints.map(row=>row.knowledgePointId);
  assert.deepEqual(new Set(ids),new Set([G5B_U04_P03F31_KP_ID,G5B_U04_P03F39_KP_ID]));
  assert.deepEqual([summary.hiddenPendingCount,summary.notSelectableCount],[0,0]);
});

test("P03F39 deep-link query state preserves exact q039 KP and group",()=>{
  const state=parseQueryState(`?sourceId=${G5B_U04_P03F39_SOURCE_ID}&selectionMode=singleKnowledgePoint&kp=${G5B_U04_P03F39_KP_ID}&pg=${G5B_U04_P03F39_GROUP_ID}&questionCount=24&answerKey=1`);
  assert.equal(state.sourceId,G5B_U04_P03F39_SOURCE_ID);
  assert.equal(state.selectionMode,"singleKnowledgePoint");
  assert.deepEqual(state.selectedKnowledgePointIds,[G5B_U04_P03F39_KP_ID]);
  assert.deepEqual(state.selectedPatternGroupIds,[G5B_U04_P03F39_GROUP_ID]);
  assert.equal(state.questionCount,24);
  assert.equal(state.includeAnswerKey,true);
});

test("P03F39 successor keeps q031 public binding available",()=>{
  const binding=resolvePublicUiCapabilityBinding({sourceId:G5B_U04_P03F39_SOURCE_ID,surfaceId:PUBLIC_UI_SURFACES.CLASSIC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[G5B_U04_P03F31_KP_ID]});
  assert.equal(binding.blocked,false,JSON.stringify(binding.blockedReasons));
  assert.deepEqual(binding.selectedKnowledgePointIds,[G5B_U04_P03F31_KP_ID]);
  assert.ok(binding.compatiblePatternGroupIds.includes(G5B_U04_P03F31_GROUP_ID));
});
