import test from "node:test";
import assert from "node:assert/strict";

import {generateG3AU09P05F2Questions,validateG3AU09P05F2Question} from "../../site/modules/curriculum/batch-a/g3a-u09-circle-parts-runtime-p05f2.js";
import {buildBatchABrowserPlan as buildP05F11Plan,requestsP05F11} from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f11.js";
import {requestsP05F2} from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f2.js";
import {G3A_U09_P05F11_KP_IDS,G3A_U09_P05F11_SOURCE_ID} from "../../site/modules/curriculum/registry/g3a-u09-circle-geometry-property-selector-projection-p05f11.js";
import {getVisibleBatchAKnowledgePoint,listBatchAKnowledgePointAvailabilityBySource} from "../../site/modules/curriculum/registry/batch-a-selector-p05f11-extension.js";

const SOURCE_ID=G3A_U09_P05F11_SOURCE_ID;
const Q002_KP="kp_circle_center_radius_diameter";

test("P05F W5 Q011 preserves Q002 circle-parts deterministic runtime semantics",()=>{
  const result=generateG3AU09P05F2Questions({questionCount:20,generationSeed:"p05f11-q002-protection"});
  assert.equal(result.ok,true,result.errors.join("\n"));
  assert.equal(result.questions.length,20);
  assert.equal(new Set(result.questions.map(q=>q.questionSignature)).size,20);
  for(const q of result.questions){
    assert.equal(validateG3AU09P05F2Question(q).ok,true);
    assert.equal(q.knowledgePointId,Q002_KP);
    assert.equal(q.metadata.constructionUsed,false);
    assert.equal(q.metadata.numericRadiusDiameterSolveUsed,false);
  }
});

test("P05F W5 Q011 does not steal the existing G3A-U09 sourceUnit route from Q002",()=>{
  const sourceUnit={sourceId:SOURCE_ID,selectionMode:"sourceUnit",questionCount:12,generationSeed:"p05f11-source-unit-protection"};
  assert.equal(requestsP05F11(sourceUnit),false);
  assert.equal(requestsP05F2(sourceUnit),true);
  const plan=buildP05F11Plan(sourceUnit);
  assert.equal(plan.sourceId,SOURCE_ID);
  assert.deepEqual(plan.selectedKnowledgePointIds,[Q002_KP]);
  assert.equal(plan.questionMode,"diagram");
  assert.equal(plan.selectionMode,"sourceUnit");
});

test("P05F W5 Q011 explicit single-KP selection is isolated from Q002 and sibling Q011 leaves",()=>{
  for(const kp of G3A_U09_P05F11_KP_IDS){
    const input={sourceId:SOURCE_ID,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[kp]};
    assert.equal(requestsP05F11(input),true,kp);
    assert.equal(requestsP05F2(input),false,kp);
    const plan=buildP05F11Plan(input);
    assert.deepEqual(plan.selectedKnowledgePointIds,[kp]);
    assert.equal(plan.selectionMode,"singleKnowledgePoint");
  }
  const invalidMixed={sourceId:SOURCE_ID,selectionMode:"mixedKnowledgePointsSameUnit",selectedKnowledgePointIds:[G3A_U09_P05F11_KP_IDS[0],G3A_U09_P05F11_KP_IDS[1]]};
  assert.equal(requestsP05F11(invalidMixed),false);
});

test("P05F W5 Q011 public selector exposes Q002 plus exactly the three Q011 leaves",()=>{
  const source=listBatchAKnowledgePointAvailabilityBySource(SOURCE_ID);
  assert.deepEqual(source.visibleKnowledgePointIds,[Q002_KP,...G3A_U09_P05F11_KP_IDS]);
  assert.deepEqual(source.hiddenPendingKnowledgePointIds,[]);
  assert.deepEqual(source.notSelectableKnowledgePointIds,[]);
  assert.equal(getVisibleBatchAKnowledgePoint(Q002_KP)?.knowledgePointId,Q002_KP);
  for(const kp of G3A_U09_P05F11_KP_IDS)assert.equal(getVisibleBatchAKnowledgePoint(kp)?.knowledgePointId,kp);
});
