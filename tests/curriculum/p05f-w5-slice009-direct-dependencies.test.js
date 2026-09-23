import test from "node:test";
import assert from "node:assert/strict";

import {generateG5AU10A1P05F8Questions,validateG5AU10A1P05F8Question} from "../../site/modules/curriculum/batch-a/g5a-u10a1-cube-cuboid-elements-runtime-p05f8.js";
import {requestsP05F9} from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f9.js";
import {requestsP04F19,buildBatchABrowserPlan as buildP04F19Plan} from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p04f19.js";
import {G5B_U10A_P04F19_KP_ID,G5B_U10A_P04F19_SOURCE_ID} from "../../site/modules/curriculum/registry/g5b-u10a-metric-ton-kilogram-conversion-selector-projection-p04f19.js";
import {G5B_U10A_P05F9_KP_ID} from "../../site/modules/curriculum/registry/g5b-u10a-large-area-unit-identity-selector-projection-p05f9.js";

test("P05F W5 Q009 preserves exact Q008 direct-product runtime semantics",()=>{
  const result=generateG5AU10A1P05F8Questions({questionCount:9,generationSeed:"p05f9-q008-protection"});assert.equal(result.ok,true,result.errors.join("\n"));assert.equal(result.questions.length,9);assert.equal(result.questions.every((q)=>validateG5AU10A1P05F8Question(q).ok),true);assert.deepEqual([...new Set(result.questions.map((q)=>q.questionMode))],["diagram"]);assert.deepEqual([...new Set(result.questions.map((q)=>q.knowledgePointId))],["kp_g5a_u10a1_cube_cuboid_faces_edges_vertices"]);
});

test("P05F W5 Q009 does not hijack the existing G5B-U10A sourceUnit P04F19 metric-ton route",()=>{
  const sourceUnit={sourceId:G5B_U10A_P04F19_SOURCE_ID,selectionMode:"sourceUnit",selectedKnowledgePointIds:[],selectedPatternGroupIds:[],questionCount:20};
  assert.equal(requestsP05F9(sourceUnit),false);assert.equal(requestsP04F19(sourceUnit),true);
  const plan=buildP04F19Plan(sourceUnit);assert.equal(plan.sourceId,G5B_U10A_P04F19_SOURCE_ID);assert.equal(plan.questionMode,"numeric");assert.deepEqual(plan.patternSpecIds,["ps_g5b_u10a_metric_ton_kilogram_conversion_numeric"]);assert.equal(plan.requestedKnowledgePointIds.includes(G5B_U10A_P04F19_KP_ID),true);assert.equal(plan.requestedKnowledgePointIds.includes(G5B_U10A_P05F9_KP_ID),false);
});

test("P05F W5 Q009 only claims explicit Q009 leaf requests on the shared source",()=>{
  assert.equal(requestsP05F9({sourceId:G5B_U10A_P04F19_SOURCE_ID,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[G5B_U10A_P05F9_KP_ID]}),true);
  assert.equal(requestsP05F9({sourceId:G5B_U10A_P04F19_SOURCE_ID,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[G5B_U10A_P04F19_KP_ID]}),false);
});
