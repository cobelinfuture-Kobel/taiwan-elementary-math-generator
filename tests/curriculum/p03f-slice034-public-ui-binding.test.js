import test from "node:test";
import assert from "node:assert/strict";
import { auditPublicUiCapabilityBinding, resolvePublicUiCapabilityBinding } from "../../site/modules/curriculum/public/public-ui-capability-binding-p03f34.js";
import { listPublicPatternGroupChoices } from "../../site/assets/browser/state/public-pattern-group-selection.js";
import { getCurrentPixelRegistrySnapshot } from "../../site/pixel/pixel-registry-bridge.js";
import { G4A_U09_P03F34_KP_ID, G4A_U09_P03F34_PATTERN_GROUP_ID, G4A_U09_P03F34_PATTERN_SPEC_ID, G4A_U09_P03F34_SOURCE_ID } from "../../site/modules/curriculum/registry/g4a-u09-rank9-missing-digit-inequality-selector-projection-p03f34.js";
test("P03F34 Classic fallback404 and Pixel expose target only as numeric",()=>{
  for(const surfaceId of ["classic","fallback404","pixel"]){
    const binding=resolvePublicUiCapabilityBinding({sourceId:G4A_U09_P03F34_SOURCE_ID,surfaceId,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[G4A_U09_P03F34_KP_ID]});
    assert.equal(binding.blocked,false); assert.deepEqual(binding.selectedKnowledgePointIds,[G4A_U09_P03F34_KP_ID]); assert.equal(binding.questionType,"numeric"); assert.deepEqual(binding.compatiblePatternGroupIds,[G4A_U09_P03F34_PATTERN_GROUP_ID]); assert.deepEqual(binding.depthOptions,[]); assert.deepEqual(binding.contextOptions,[]);
    assert.equal(JSON.stringify(binding).includes("application"),false);
  }
});
test("P03F34 pattern-group state remains intact while Pixel current registry advances through Slice043 to 33 sources / 243 KPs",()=>{
  const choices=listPublicPatternGroupChoices([G4A_U09_P03F34_KP_ID]); assert.deepEqual(choices.map((row)=>row.patternGroupId),[G4A_U09_P03F34_PATTERN_GROUP_ID]); assert.deepEqual(choices[0].patternSpecIds,[G4A_U09_P03F34_PATTERN_SPEC_ID]);
  const snapshot=getCurrentPixelRegistrySnapshot(); assert.equal(snapshot.sourceCount,33); assert.equal(snapshot.visibleKnowledgePointCount,243); assert.equal(snapshot.bySourceId[G4A_U09_P03F34_SOURCE_ID].visibleKnowledgePoints.length,7);
});
test("P03F34 same-unit mixed binding keeps prior decimal KP plus target",()=>{
  const binding=resolvePublicUiCapabilityBinding({sourceId:G4A_U09_P03F34_SOURCE_ID,surfaceId:"classic",selectionMode:"mixedKnowledgePointsSameUnit",selectedKnowledgePointIds:["kp_g4a_u09_decimal_compare",G4A_U09_P03F34_KP_ID]});
  assert.equal(binding.blocked,false); assert.equal(binding.selectedKnowledgePointCount,2); assert.ok(binding.compatiblePatternGroupIds.includes(G4A_U09_P03F34_PATTERN_GROUP_ID)); assert.equal(binding.questionType,"numeric");
});
test("P03F34 capability audit is gap-free",()=>{ const audit=auditPublicUiCapabilityBinding(); assert.equal(audit.ok,true,JSON.stringify(audit.errors)); assert.equal(audit.errors.length,0); assert.ok(audit.slice034AuditCaseCount>0); });
